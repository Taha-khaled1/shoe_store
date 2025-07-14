/**
 * API Service Module
 * Handles communication with Laravel backend
 */

class APIService {
    constructor() {
        // Use configuration settings
        this.baseURL = CONFIG?.API?.BASE_URL || 'http://localhost:8000/api';
        this.timeout = CONFIG?.API?.TIMEOUT || 10000;
        this.cache = new Map();
        this.cacheTimeout = CONFIG?.API?.CACHE_TIMEOUT || 5 * 60 * 1000;
        this.retryAttempts = CONFIG?.API?.RETRY_ATTEMPTS || 3;
        this.retryDelay = CONFIG?.API?.RETRY_DELAY || 1000;
    }

    /**
     * Make HTTP request
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise} Response promise
     */
    async request(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(`${this.baseURL}${url}`, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            
            console.error('API request failed:', error);
            throw error;
        }
    }

    /**
     * GET request with caching
     * @param {string} url - Request URL
     * @returns {Promise} Response promise
     */
    async get(url) {
        try {
            const data = await this.request(url);
            return data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get categories with subcategories
     * @returns {Promise} Categories data
     */
    async getCategories() {
        try {
            const response = await this.get('/categories');
            
            if (response.status_code === 200) {
                return response.data.categoriesWithSubcategories;
            } else {
                throw new Error(response.message || 'Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    /**
     * Get banners
     * @returns {Promise} Banners data
     */
    async getBanners() {
        try {
            const response = await this.get('/banners');
            
            if (response.status_code === 200) {
                return response.data.banners;
            } else {
                throw new Error(response.message || 'Failed to fetch banners');
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
            throw error;
        }
    }

    /**
     * Get filtered products
     * @param {Object} filters - Filter parameters
     * @returns {Promise} Products data
     */
    async getProducts(filters = {}) {
        try {
            const params = new URLSearchParams();
            
            // Add filters to query params
            if (filters.category_id && filters.category_id !== 0) {
                params.append('category_id', filters.category_id);
            }
            
            if (filters.only_offers) {
                params.append('only_offers', '1');
            }
            
            if (filters.search) {
                params.append('search', filters.search);
            }
            
            const queryString = params.toString();
            const url = `/products/filter${queryString ? `?${queryString}` : ''}`;
            
            const response = await this.get(url);
            
            if (response.status_code === 200) {
                return response.data.products;
            } else {
                throw new Error(response.message || 'Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    /**
     * Get products by category
     * @param {number} categoryId - Category ID
     * @returns {Promise} Products data
     */
    async getProductsByCategory(categoryId) {
        return this.getProducts({ category_id: categoryId });
    }

    /**
     * Get products with offers
     * @returns {Promise} Products data
     */
    async getOffersProducts() {
        return this.getProducts({ only_offers: true });
    }

    /**
     * Search products
     * @param {string} query - Search query
     * @returns {Promise} Products data
     */
    async searchProducts(query) {
        return this.getProducts({ search: query });
    }

    /**
     * Get featured products (using all products for now)
     * @returns {Promise} Products data
     */
    async getFeaturedProducts() {
        return this.getProducts();
    }

    /**
     * Get cities data (countries, governorates, cities)
     * @returns {Promise} Cities data with tax information
     */
    async getCities() {
        const cacheKey = 'cities';
        
        try {
            // Check cache first
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    console.log('Returning cached cities data');
                    return cached.data;
                }
            }

            console.log('Fetching cities data from API...');
            const response = await this.get('/cities');
            
            // Cache the response
            this.cache.set(cacheKey, {
                data: response,
                timestamp: Date.now()
            });

            return response;
        } catch (error) {
            console.error('Error fetching cities:', error);
            
            // Return fallback data if API fails
            return {
                success: false,
                message: 'Failed to load cities data',
                countries: [
                    {
                        id: 1,
                        name: "دولة الكويت",
                        name_en: "State of Kuwait",
                        latitude: 24,
                        longitude: 54,
                        code: "KWD",
                        exchange_rate: "10.000000",
                        country_tax: "0.0",
                        governorates: [
                            {
                                id: 1,
                                name: "محافظة العاصمة",
                                governorate_tax: "2.0",
                                country_id: 1,
                                cities: [
                                    {
                                        id: 1,
                                        name_ar: "مدينة الكويت",
                                        name_en: "Kuwait City",
                                        city_tax: "5.0",
                                        country_id: 1,
                                        governorate_id: 1
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache size
     * @returns {number} Cache size
     */
    getCacheSize() {
        return this.cache.size;
    }

    /**
     * Check if online
     * @returns {boolean} Online status
     */
    isOnline() {
        return navigator.onLine;
    }

    /**
     * Handle offline scenarios
     * @param {Function} callback - Callback to execute when back online
     */
    onOnline(callback) {
        window.addEventListener('online', callback);
    }

    /**
     * Handle offline scenarios
     * @param {Function} callback - Callback to execute when offline
     */
    onOffline(callback) {
        window.addEventListener('offline', callback);
    }
}

// Create global instance
const apiService = new APIService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIService;
} 