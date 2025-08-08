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
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    // Check if we need to evict items
    if (this.cache.size >= (options.maxSize || this.maxSize)) {
      this.evictLeastUsed();
    }

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

  // Get cache statistics
  getStats(): {
    size: number;
    hitRate: number;
    memoryUsage: number;
    oldestItem: number;
    newestItem: number;
  } {
    const items = Array.from(this.cache.values());
    const totalAccess = items.reduce((sum, item) => sum + item.accessCount, 0);
    const hits = items.filter(item => item.accessCount > 0).length;
    
    const timestamps = items.map(item => item.timestamp);
    const oldest = timestamps.length > 0 ? Math.min(...timestamps) : 0;
    const newest = timestamps.length > 0 ? Math.max(...timestamps) : 0;
    
    // Rough memory usage calculation
    const memoryUsage = JSON.stringify(Array.from(this.cache.entries())).length;
    
    return {
      size: this.cache.size,
      hitRate: totalAccess > 0 ? hits / totalAccess : 0,
      memoryUsage,
      oldestItem: oldest,
      newestItem: newest
    };
  }

  // Evict least recently used items
  private evictLeastUsed(): void {
    const items = Array.from(this.cache.entries());
    
    // Sort by last accessed time (oldest first)
    items.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
    
    // Remove oldest 25% of items
    const toRemove = Math.ceil(items.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      const [key] = items[i];
      this.cache.delete(key);
      this.removeFromDisk(key);
    }
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

  // Remove item from AsyncStorage
  private async removeFromDisk(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove cache item from disk:', error);
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