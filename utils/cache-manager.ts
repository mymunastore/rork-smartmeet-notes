import AsyncStorage from '@react-native-async-storage/async-storage';
import performanceMonitor from './performance-monitor';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  persistToDisk?: boolean; // Whether to persist to AsyncStorage
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxSize = 100;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private compressionEnabled = true;
  private memoryThreshold = 50 * 1024 * 1024; // 50MB threshold

  constructor() {
    // Start cleanup interval
    this.startCleanup();
    // Load persisted cache on startup
    this.loadPersistedCache();
  }

  async set<T>(
    key: string, 
    data: T, 
    options: CacheOptions = {}
  ): Promise<void> {
    performanceMonitor.startTimer(`cache-set-${key}`);
    
    const ttl = options.ttl || this.defaultTTL;
    
    // Compress large data if enabled
    let processedData = data;
    if (this.compressionEnabled && this.shouldCompress(data)) {
      processedData = this.compressData(data);
    }
    
    const item: CacheItem<T> = {
      data: processedData,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    // Check memory usage and evict if necessary
    await this.checkMemoryAndEvict(options.maxSize || this.maxSize);

    this.cache.set(key, item);

    // Persist to disk if requested
    if (options.persistToDisk) {
      try {
        await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(item));
      } catch (error) {
        console.warn('Failed to persist cache item:', error);
      }
    }

    performanceMonitor.endTimer(`cache-set-${key}`);
  }

  private shouldCompress<T>(data: T): boolean {
    const dataSize = JSON.stringify(data).length;
    return dataSize > 10000; // Compress if larger than 10KB
  }

  private compressData<T>(data: T): T {
    // Simple compression for large objects
    if (typeof data === 'object' && data !== null) {
      const compressed = JSON.parse(JSON.stringify(data));
      // Remove empty strings and null values to reduce size
      this.removeEmptyValues(compressed);
      return compressed;
    }
    return data;
  }

  private removeEmptyValues(obj: any): void {
    Object.keys(obj).forEach(key => {
      if (obj[key] === null || obj[key] === '' || obj[key] === undefined) {
        delete obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.removeEmptyValues(obj[key]);
      }
    });
  }

  private async checkMemoryAndEvict(maxSize: number): Promise<void> {
    const currentSize = this.cache.size;
    const memoryUsage = this.estimateMemoryUsage();
    
    // Evict if we exceed size or memory limits
    if (currentSize >= maxSize || memoryUsage > this.memoryThreshold) {
      const evictCount = Math.max(1, Math.ceil(currentSize * 0.25)); // Evict 25%
      await this.evictLeastUsed(evictCount);
    }
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0;
    this.cache.forEach((item) => {
      totalSize += JSON.stringify(item).length * 2; // Rough estimate (UTF-16)
    });
    return totalSize;
  }

  async get<T>(key: string): Promise<T | null> {
    performanceMonitor.startTimer(`cache-get-${key}`);
    
    const item = this.cache.get(key) as CacheItem<T> | undefined;
    
    if (!item) {
      // Try to load from disk
      const diskItem = await this.loadFromDisk<T>(key);
      if (diskItem) {
        this.cache.set(key, diskItem);
        performanceMonitor.endTimer(`cache-get-${key}`);
        return diskItem.data;
      }
      performanceMonitor.endTimer(`cache-get-${key}`);
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.removeFromDisk(key);
      performanceMonitor.endTimer(`cache-get-${key}`);
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = Date.now();

    performanceMonitor.endTimer(`cache-get-${key}`);
    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.removeFromDisk(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.removeFromDisk(key);
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.clearPersistedCache();
  }

  // Get enhanced cache statistics
  getStats(): {
    size: number;
    hitRate: number;
    memoryUsage: number;
    oldestItem: number;
    newestItem: number;
    averageAccessCount: number;
    compressionRatio: number;
    evictionRate: number;
  } {
    const items = Array.from(this.cache.values());
    const totalAccess = items.reduce((sum, item) => sum + item.accessCount, 0);
    const hits = items.filter(item => item.accessCount > 0).length;
    
    const timestamps = items.map(item => item.timestamp);
    const oldest = timestamps.length > 0 ? Math.min(...timestamps) : 0;
    const newest = timestamps.length > 0 ? Math.max(...timestamps) : 0;
    
    const memoryUsage = this.estimateMemoryUsage();
    const averageAccessCount = items.length > 0 ? totalAccess / items.length : 0;
    
    // Calculate compression ratio (simplified)
    const uncompressedSize = JSON.stringify(Array.from(this.cache.entries())).length;
    const compressionRatio = memoryUsage > 0 ? uncompressedSize / memoryUsage : 1;
    
    return {
      size: this.cache.size,
      hitRate: totalAccess > 0 ? hits / totalAccess : 0,
      memoryUsage,
      oldestItem: oldest,
      newestItem: newest,
      averageAccessCount,
      compressionRatio,
      evictionRate: this.cache.size / this.maxSize
    };
  }

  // Evict least recently used items with smart prioritization
  private async evictLeastUsed(count?: number): Promise<void> {
    const items = Array.from(this.cache.entries());
    
    // Sort by priority: access count, last accessed time, and data size
    items.sort(([, a], [, b]) => {
      const scoreA = this.calculateEvictionScore(a);
      const scoreB = this.calculateEvictionScore(b);
      return scoreA - scoreB; // Lower score = higher priority for eviction
    });
    
    // Remove items with lowest priority
    const toRemove = count || Math.ceil(items.length * 0.25);
    const evictionPromises: Promise<void>[] = [];
    
    for (let i = 0; i < Math.min(toRemove, items.length); i++) {
      const [key] = items[i];
      this.cache.delete(key);
      evictionPromises.push(this.removeFromDisk(key));
    }
    
    await Promise.all(evictionPromises);
    console.log(`🧹 Cache evicted ${Math.min(toRemove, items.length)} items`);
  }

  private calculateEvictionScore(item: CacheItem<any>): number {
    const now = Date.now();
    const age = now - item.timestamp;
    const timeSinceAccess = now - item.lastAccessed;
    const dataSize = JSON.stringify(item.data).length;
    
    // Lower score = higher priority for eviction
    // Factors: low access count, old age, large size, not accessed recently
    return (
      item.accessCount * 1000 + // Heavily weight access count
      Math.max(0, item.ttl - age) * 0.1 + // Remaining TTL
      Math.max(0, 3600000 - timeSinceAccess) * 0.5 - // Recent access bonus
      dataSize * 0.001 // Slight penalty for large items
    );
  }

  // Load item from AsyncStorage
  private async loadFromDisk<T>(key: string): Promise<CacheItem<T> | null> {
    try {
      const stored = await AsyncStorage.getItem(`cache_${key}`);
      if (stored) {
        const item = JSON.parse(stored) as CacheItem<T>;
        
        // Check if expired
        if (Date.now() - item.timestamp > item.ttl) {
          this.removeFromDisk(key);
          return null;
        }
        
        return item;
      }
    } catch (error) {
      console.warn('Failed to load cache item from disk:', error);
    }
    return null;
  }

  // Remove item from AsyncStorage with error handling
  private async removeFromDisk(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove cache item from disk:', error);
      // Don't throw error to prevent blocking other operations
    }
  }

  // Load all persisted cache items
  private async loadPersistedCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      for (const storageKey of cacheKeys) {
        const key = storageKey.replace('cache_', '');
        const item = await this.loadFromDisk(key);
        if (item) {
          this.cache.set(key, item);
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted cache:', error);
    }
  }

  // Clear all persisted cache items
  private async clearPersistedCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Failed to clear persisted cache:', error);
    }
  }

  // Start cleanup interval
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000) as ReturnType<typeof setInterval>; // Run every minute
  }

  // Cleanup expired items
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.removeFromDisk(key);
    });
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cache cleanup: removed ${keysToDelete.length} expired items`);
    }
  }

  // Stop cleanup interval
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

export default new CacheManager();
export type { CacheOptions };