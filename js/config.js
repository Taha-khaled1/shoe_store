/**
 * Configuration Module
 * Contains all configuration settings for the application
 */

const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'http://localhost:8000/api', // Change this to your Laravel API URL
        TIMEOUT: 10000, // Request timeout in milliseconds
        CACHE_TIMEOUT: 5 * 60 * 1000, // Cache timeout in milliseconds (5 minutes)
        RETRY_ATTEMPTS: 3, // Number of retry attempts for failed requests
        RETRY_DELAY: 1000 // Delay between retries in milliseconds
    },
    
    // Application Settings
    APP: {
        NAME: 'متجر الأحذية الأنيقة',
        VERSION: '1.0.0',
        LANGUAGE: 'ar',
        DIRECTION: 'rtl'
    },
    
    // UI Settings
    UI: {
        NOTIFICATION_DURATION: 3000, // Notification display duration in milliseconds
        ANIMATION_DURATION: 300, // Standard animation duration in milliseconds
        DEBOUNCE_DELAY: 250, // Debounce delay for search and resize events
        AUTOPLAY_DELAY: 5000, // Hero carousel autoplay delay in milliseconds
        ITEMS_PER_PAGE: 15 // Number of products per page
    },
    
    // E-commerce Settings
    ECOMMERCE: {
        CURRENCY: 'ر.س',
        CURRENCY_SYMBOL: 'SAR',
        TAX_RATE: 0.15, // 15% tax rate
        SHIPPING_THRESHOLD: 200, // Free shipping threshold in SAR
        SHIPPING_COST: 25, // Shipping cost in SAR
        MIN_ORDER_AMOUNT: 50 // Minimum order amount in SAR
    },
    
    // Category Mapping (for navigation)
    CATEGORIES: {
        MENS: { id: 1, name: 'رجالي', icon: 'fas fa-male' },
        WOMENS: { id: 2, name: 'نسائي', icon: 'fas fa-female' },
        SPORTS: { id: 3, name: 'رياضي', icon: 'fas fa-running' },
        FORMAL: { id: 4, name: 'رسمي', icon: 'fas fa-briefcase' }
    },
    
    // Storage Keys
    STORAGE: {
        CART: 'shoe_store_cart',
        FAVORITES: 'shoe_store_favorites',
        USER: 'shoe_store_user',
        SAMPLE_DATA: 'shoe_store_sample_data_initialized',
        SESSION: 'shoe_store_session'
    },
    
    // Image Settings
    IMAGES: {
        FALLBACK_PRODUCT: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        FALLBACK_CATEGORY: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        LAZY_LOADING: true,
        QUALITY: 80
    },
    
    // Feature Flags
    FEATURES: {
        OFFLINE_MODE: true,
        PUSH_NOTIFICATIONS: false,
        ANALYTICS: false,
        CHAT_SUPPORT: false,
        WISHLIST: true,
        QUICK_VIEW: true,
        PRODUCT_REVIEWS: true,
        SOCIAL_SHARING: true
    },
    
    // Development Settings
    DEV: {
        DEBUG: false, // Set to true for development
        CONSOLE_LOGS: true,
        MOCK_DATA: false, // Use mock data instead of API
        PERFORMANCE_MONITORING: false
    }
};

// Freeze the configuration to prevent accidental modifications
Object.freeze(CONFIG);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Make it available globally
window.CONFIG = CONFIG; 