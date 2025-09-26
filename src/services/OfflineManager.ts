import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = true;
  private pendingRequests: Array<{
    url: string;
    method: string;
    data?: any;
    timestamp: number;
  }> = [];

  private constructor() {
    this.initNetworkListener();
    this.loadPendingRequests();
  }

  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private initNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (wasOffline && this.isOnline) {
        this.syncPendingRequests();
      }
    });
  }

  private async loadPendingRequests() {
    try {
      const stored = await AsyncStorage.getItem('pendingRequests');
      if (stored) {
        this.pendingRequests = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  }

  private async savePendingRequests() {
    try {
      await AsyncStorage.setItem('pendingRequests', JSON.stringify(this.pendingRequests));
    } catch (error) {
      console.error('Error saving pending requests:', error);
    }
  }

  public isNetworkAvailable(): boolean {
    return this.isOnline;
  }

  // Cache management
  public async setCache<T>(key: string, data: T, expiryMinutes: number = 60): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiry: expiryMinutes * 60 * 1000, // Convert to milliseconds
      };
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  public async getCache<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is expired
      if (now - cacheItem.timestamp > cacheItem.expiry) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  public async clearCache(key?: string): Promise<void> {
    try {
      if (key) {
        await AsyncStorage.removeItem(`cache_${key}`);
      } else {
        // Clear all cache items
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter(k => k.startsWith('cache_'));
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Offline request queue
  public async queueRequest(url: string, method: string, data?: any): Promise<void> {
    const request = {
      url,
      method,
      data,
      timestamp: Date.now(),
    };

    this.pendingRequests.push(request);
    await this.savePendingRequests();
  }

  private async syncPendingRequests(): Promise<void> {
    if (this.pendingRequests.length === 0) return;

    console.log(`Syncing ${this.pendingRequests.length} pending requests...`);

    const requestsToSync = [...this.pendingRequests];
    this.pendingRequests = [];
    await this.savePendingRequests();

    for (const request of requestsToSync) {
      try {
        // Implement actual API call here
        console.log('Syncing request:', request);
        // await api.request(request.url, request.method, request.data);
      } catch (error) {
        console.error('Error syncing request:', error);
        // Re-queue failed requests
        this.pendingRequests.push(request);
      }
    }

    await this.savePendingRequests();
  }

  public getPendingRequestsCount(): number {
    return this.pendingRequests.length;
  }

  // Favorite businesses offline support
  public async getFavorites(): Promise<string[]> {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  public async addFavorite(businessId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      if (!favorites.includes(businessId)) {
        favorites.push(businessId);
        await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  }

  public async removeFavorite(businessId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter(id => id !== businessId);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  }
}

export default OfflineManager;
