import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Safe storage utility that handles localStorage security errors
class SafeStorage {
  private isStorageAvailable(): boolean {
    if (Platform.OS !== 'web') {
      return true; // AsyncStorage is always available on mobile
    }
    
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('localStorage is not available:', error);
      return false;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web' && !this.isStorageAvailable()) {
        // Fallback to memory storage for web when localStorage is not available
        return this.memoryStorage.get(key) || null;
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return this.memoryStorage.get(key) || null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web' && !this.isStorageAvailable()) {
        // Fallback to memory storage for web when localStorage is not available
        this.memoryStorage.set(key, value);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Failed to set item ${key}:`, error);
      // Always fallback to memory storage on error
      this.memoryStorage.set(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web' && !this.isStorageAvailable()) {
        this.memoryStorage.delete(key);
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
      this.memoryStorage.delete(key);
    }
  }

  async clear(): Promise<void> {
    try {
      if (Platform.OS === 'web' && !this.isStorageAvailable()) {
        this.memoryStorage.clear();
        return;
      }
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      this.memoryStorage.clear();
    }
  }

  // Memory storage fallback for when localStorage is not available
  private memoryStorage = new Map<string, string>();
}

export const safeStorage = new SafeStorage();