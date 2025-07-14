/**
 * Main Application Module
 * Initializes and coordinates all other modules
 */


class ShoeStoreApp {
    constructor() {
        this.isInitialized = false;
        this.modules = {};
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the application
     */
    init() {
        try {
            console.log('🚀 Initializing Shoe Store App...');
            
            // Check if localStorage is available
            if (!storageManager.isAvailable()) {
                console.warn('⚠️ localStorage is not available. Some features may not work properly.');
                this.showFallbackMessage();
            }

            // Initialize modules
            this.initializeModules();
            
            // Set up global event listeners
            this.setupGlobalEvents();
            
            // Initialize sample data if needed
            this.initializeSampleData();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('✅ Shoe Store App initialized successfully');
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('appInitialized', {
                detail: { app: this }
            }));
            
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Initialize all modules
     */
    initializeModules() {
        // Store module references
        this.modules = {
            storage: storageManager,
            cart: cartManager,
            favorites: favoritesManager,
            ui: uiManager,
            products: productManager // API-based product manager
        };

        console.log('📦 All modules initialized');
    }

    /**
     * Set up global event listeners
     */
    setupGlobalEvents() {
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Handle online/offline status
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        // Handle visibility change (tab focus/blur)
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Handle beforeunload (page refresh/close)
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        console.log('🎧 Global event listeners set up');
    }

    /**
     * Initialize sample data for demo purposes
     */
    initializeSampleData() {
        // Check if sample data has already been initialized
        const sampleDataInitialized = localStorage.getItem('shoe_store_sample_data_initialized');
        
        if (!sampleDataInitialized) {
            console.log('📝 Adding sample data for demo...');
            
        
            
            // Mark sample data as initialized
            localStorage.setItem('shoe_store_sample_data_initialized', 'true');
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            // Handle responsive layout changes
            this.updateResponsiveLayout();
        }, 250);
    }

    /**
     * Update responsive layout
     */
    updateResponsiveLayout() {
        const isMobile = window.innerWidth <= 768;
        
        // Update UI based on screen size
        document.body.classList.toggle('mobile-layout', isMobile);
        document.body.classList.toggle('desktop-layout', !isMobile);
        
        // Close modals on mobile orientation change
        if (isMobile) {
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = '';
        }
    }

    /**
     * Handle online status
     */
    handleOnline() {
        console.log('🌐 Connection restored');
        this.modules.ui.showNotification('تم استعادة الاتصال بالإنترنت', 'success');
        
        // Sync data if needed
        this.syncData();
    }

    /**
     * Handle offline status
     */
    handleOffline() {
        console.log('📴 Connection lost');
        this.modules.ui.showNotification('انقطع الاتصال بالإنترنت. ستعمل بعض الميزات في وضع عدم الاتصال', 'warning');
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('👋 Tab hidden');
            // Save current state
            this.saveCurrentState();
        } else {
            console.log('👁️ Tab visible');
            // Refresh data if needed
            this.refreshData();
        }
    }

    /**
     * Handle before unload
     */
    handleBeforeUnload(e) {
        // Save current state before page unload
        this.saveCurrentState();
        
        // Show confirmation for unsaved changes if needed
        const hasUnsavedChanges = this.checkUnsavedChanges();
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'لديك تغييرات غير محفوظة. هل أنت متأكد من مغادرة الصفحة؟';
            return e.returnValue;
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.modules.ui.openSearch();
        }
        
        // Ctrl/Cmd + B for cart
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            this.modules.cart.openModal();
        }
        
        // Ctrl/Cmd + H for favorites
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            this.modules.favorites.openModal();
        }
    }

    /**
     * Save current state
     */
    saveCurrentState() {
        try {
            const state = {
                timestamp: new Date().toISOString(),
                cart: this.modules.storage.getCart(),
                favorites: this.modules.storage.getFavorites(),
                user: this.modules.storage.getUser()
            };
            
            sessionStorage.setItem('shoe_store_session', JSON.stringify(state));
            console.log('💾 Current state saved');
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    /**
     * Refresh data
     */
    refreshData() {
        try {
            // Reload data from storage
            this.modules.cart.loadCart();
            this.modules.favorites.loadFavorites();
            console.log('🔄 Data refreshed');
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }

    /**
     * Check for unsaved changes
     */
    checkUnsavedChanges() {
        // Check if there are any unsaved form data or pending operations
        const forms = document.querySelectorAll('form');
        for (let form of forms) {
            const formData = new FormData(form);
            for (let [key, value] of formData.entries()) {
                if (value.trim()) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Sync data with server (placeholder)
     */
    syncData() {
        // Placeholder for future server sync functionality
        console.log('🔄 Data sync placeholder');
    }

    /**
     * Show fallback message for unsupported browsers
     */
    showFallbackMessage() {
        const message = document.createElement('div');
        message.className = 'browser-warning';
        message.innerHTML = `
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 1rem; margin: 1rem; border-radius: 5px; text-align: center;">
                <strong>تحذير:</strong> متصفحك لا يدعم بعض الميزات المطلوبة. قد لا تعمل بعض الوظائف بشكل صحيح.
            </div>
        `;
        document.body.insertBefore(message, document.body.firstChild);
    }

    /**
     * Handle initialization error
     */
    handleInitializationError(error) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'initialization-error';
        errorMessage.innerHTML = `
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 1rem; margin: 1rem; border-radius: 5px; text-align: center;">
                <strong>خطأ في التطبيق:</strong> حدث خطأ أثناء تحميل التطبيق. الرجاء إعادة تحميل الصفحة.
                <br><button onclick="location.reload()" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #721c24; color: white; border: none; border-radius: 3px; cursor: pointer;">إعادة تحميل</button>
            </div>
        `;
        document.body.insertBefore(errorMessage, document.body.firstChild);
    }

    /**
     * Get module by name
     */
    getModule(name) {
        return this.modules[name] || null;
    }

    /**
     * Check if app is initialized
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Export app data
     */
    exportData() {
        return this.modules.storage.exportData();
    }

    /**
     * Import app data
     */
    importData(data) {
        return this.modules.storage.importData(data);
    }

    /**
     * Reset app data
     */
    resetApp() {
        if (confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟ سيتم حذف السلة والمفضلة.')) {
            this.modules.storage.clear();
            localStorage.removeItem('shoe_store_sample_data_initialized');
            this.modules.cart.loadCart();
            this.modules.favorites.loadFavorites();
            this.modules.ui.showNotification('تم إعادة تعيين التطبيق', 'success');
            return true;
        }
        return false;
    }
}

// Initialize the application
const shoeStoreApp = new ShoeStoreApp();

// Export for global access
window.ShoeStoreApp = shoeStoreApp;

// Console welcome message
console.log(`
🦶 مرحباً بك في متجر الأحذية الأنيقة
📱 التطبيق جاهز للاستخدام
🛠️ استخدم shoeStoreApp للوصول إلى وظائف التطبيق

الاختصارات:
• Ctrl/Cmd + K: فتح البحث
• Ctrl/Cmd + B: فتح السلة  
• Ctrl/Cmd + H: فتح المفضلة
• Esc: إغلاق النوافذ المنبثقة
`);

// Development helpers (remove in production)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.devTools = {
        resetApp: () => shoeStoreApp.resetApp(),
        exportData: () => shoeStoreApp.exportData(),
        importData: (data) => shoeStoreApp.importData(data),
        addSampleData: () => shoeStoreApp.initializeSampleData(),
        clearSampleDataFlag: () => {
            localStorage.removeItem('shoe_store_sample_data_initialized');
            console.log('✅ Sample data flag cleared');
        },
        modules: shoeStoreApp.modules
    };
    
    console.log('🔧 Development tools available at window.devTools');
} 