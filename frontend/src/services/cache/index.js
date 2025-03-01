import localForage from 'localforage';

// Configure localForage
localForage.config({
    name: 'VideoFlux',
    version: 1.0,
    storeName: 'videoflux_cache',
    description: 'Cache for VideoFlux application',
});

// In-memory cache for faster access to frequent data
const memoryCache = new Map();

class CacheService {
    constructor() {
        this.MEMORY_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
        this.STORAGE_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
    }

    /**
     * Get data from cache (tries memory first, then storage)
     */
    async get(key) {
        // Try memory cache first (fastest)
        const memoryItem = memoryCache.get(key);
        if (memoryItem) {
            const isExpired = Date.now() - memoryItem.timestamp > this.MEMORY_CACHE_EXPIRY;
            if (!isExpired) {
                console.log(`Cache hit (memory): ${key}`);
                return memoryItem.data;
            }
            memoryCache.delete(key); // Clean up expired item
        }

        // Try storage cache
        try {
            const item = await localForage.getItem(key);
            if (item) {
                const isExpired = Date.now() - item.timestamp > this.STORAGE_CACHE_EXPIRY;
                if (!isExpired) {
                    // Add to memory cache for faster subsequent access
                    memoryCache.set(key, item);
                    console.log(`Cache hit (storage): ${key}`);
                    return item.data;
                }
                // Clean up expired item
                await localForage.removeItem(key);
            }
        } catch (error) {
            console.error(`Error retrieving from cache: ${key}`, error);
        }

        console.log(`Cache miss: ${key}`);
        return null;
    }

    /**
     * Set data in both memory and storage cache
     */
    async set(key, data) {
        const cacheItem = { data, timestamp: Date.now() };

        // Set in memory cache (fast access)
        memoryCache.set(key, cacheItem);

        // Set in storage cache (persistence)
        try {
            await localForage.setItem(key, cacheItem);
        } catch (error) {
            console.error(`Error setting cache: ${key}`, error);
        }
    }

    /**
     * Remove item from both caches
     */
    async remove(key) {
        memoryCache.delete(key);
        try {
            await localForage.removeItem(key);
        } catch (error) {
            console.error(`Error removing from cache: ${key}`, error);
        }
    }

    /**
     * Clear all cached data
     */
    async clear() {
        memoryCache.clear();
        try {
            await localForage.clear();
        } catch (error) {
            console.error('Error clearing cache', error);
        }
    }

    /**
     * Get cache metadata
     */
    async getStats() {
        let storageItems = 0;
        try {
            await localForage.iterate(() => {
                storageItems++;
            });
        } catch (error) {
            console.error('Error getting cache stats', error);
        }

        return {
            memoryItems: memoryCache.size,
            storageItems,
        };
    }
}

export const cacheService = new CacheService();