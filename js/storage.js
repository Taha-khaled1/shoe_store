/**
 * Storage Management Module
 * Handles localStorage operations for cart and favorites
 */

class StorageManager {
    constructor() {
        this.cartKey = 'shoe_store_cart';
        this.favoritesKey = 'shoe_store_favorites';
        this.userKey = 'shoe_store_user';
        
        // Initialize storage if not exists
        this.initializeStorage();
    }

    /**
     * Initialize storage with default values
     */
    initializeStorage() {
        if (!localStorage.getItem(this.cartKey)) {
            localStorage.setItem(this.cartKey, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.favoritesKey)) {
            localStorage.setItem(this.favoritesKey, JSON.stringify([]));
        }
    }

    /**
     * Get data from localStorage
     * @param {string} key - Storage key
     * @returns {any} Parsed data from localStorage
     */
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting data from localStorage:', error);
            return null;
        }
    }

    /**
     * Set data to localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to store
     * @returns {boolean} Success status
     */
    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error setting data to localStorage:', error);
            return false;
        }
    }

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing data from localStorage:', error);
            return false;
        }
    }

    /**
     * Clear all storage data
     */
    clear() {
        try {
            localStorage.removeItem(this.cartKey);
            localStorage.removeItem(this.favoritesKey);
            localStorage.removeItem(this.userKey);
            localStorage.removeItem('shoe_store_sample_data_initialized');
            this.initializeStorage();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    /**
     * Get cart data
     * @returns {Array} Cart items
     */
    getCart() {
        return this.get(this.cartKey) || [];
    }

    /**
     * Set cart data
     * @param {Array} cartData - Cart items array
     * @returns {boolean} Success status
     */
    setCart(cartData) {
        return this.set(this.cartKey, cartData);
    }

    /**
     * Get favorites data
     * @returns {Array} Favorites items
     */
    getFavorites() {
        return this.get(this.favoritesKey) || [];
    }

    /**
     * Set favorites data
     * @param {Array} favoritesData - Favorites items array
     * @returns {boolean} Success status
     */
    setFavorites(favoritesData) {
        return this.set(this.favoritesKey, favoritesData);
    }

    /**
     * Get user data
     * @returns {Object} User data
     */
    getUser() {
        return this.get(this.userKey) || {};
    }

    /**
     * Set user data
     * @param {Object} userData - User data object
     * @returns {boolean} Success status
     */
    setUser(userData) {
        return this.set(this.userKey, userData);
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} Availability status
     */
    isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, 'test');
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('localStorage is not available:', error);
            return false;
        }
    }

    /**
     * Get storage size (approximate)
     * @returns {number} Storage size in bytes
     */
    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }

    /**
     * Export all data
     * @returns {Object} All stored data
     */
    exportData() {
        return {
            cart: this.getCart(),
            favorites: this.getFavorites(),
            user: this.getUser(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Import data
     * @param {Object} data - Data to import
     * @returns {boolean} Success status
     */
    importData(data) {
        try {
            if (data.cart) this.setCart(data.cart);
            if (data.favorites) this.setFavorites(data.favorites);
            if (data.user) this.setUser(data.user);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

// Create global instance
const storageManager = new StorageManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
} 