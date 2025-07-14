/**
 * UI Interactions Module
 * Handles user interface interactions and animations
 */

class UIManager {
    constructor() {
        this.isLoading = false;
        this.searchOverlay = null;
        this.loadingScreen = null;
        
        // Initialize UI components
        this.init();
    }

    /**
     * Initialize UI components
     */
    init() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.searchOverlay = document.getElementById('searchOverlay');
        
        // Bind events
        this.bindEvents();
        
        // Hide loading screen after page load
        this.hideLoadingScreen();
        
        // Initialize tooltips and other UI elements
        this.initializeUIElements();
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (this.loadingScreen) {
                    this.loadingScreen.classList.add('hidden');
                    setTimeout(() => {
                        this.loadingScreen.style.display = 'none';
                    }, 500);
                }
            }, 1000); // Show loading for at least 1 second
        });
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'flex';
            this.loadingScreen.classList.remove('hidden');
        }
    }

    /**
     * Open search overlay
     */
    openSearch() {
        if (this.searchOverlay) {
            this.searchOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus on search input
            const searchInput = this.searchOverlay.querySelector('.search-input');
            if (searchInput) {
                setTimeout(() => searchInput.focus(), 300);
            }
        }
    }

    /**
     * Close search overlay
     */
    closeSearch() {
        if (this.searchOverlay) {
            this.searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
            
            // Clear search input
            const searchInput = this.searchOverlay.querySelector('.search-input');
            if (searchInput) {
                searchInput.value = '';
            }
        }
    }

    /**
     * Handle search functionality
     * @param {string} query - Search query
     */
    performSearch(query) {
        if (!query.trim()) {
            this.showNotification('الرجاء إدخال كلمة البحث', 'warning');
            return;
        }

        this.showNotification('جاري البحث...', 'info');
        console.log(`Searching for: ${query}`);
        // Trigger search using the product manager
        if (productManager) {  
            productManager.searchProducts(query); 
            productManager.scrollToFeaturedSection();    
            this.closeSearch();
            this.showNotification(`تم البحث عن: ${query}`, 'success');
        } else {    
            // Fallback if product manager is not available
        setTimeout(() => {
            this.showNotification(`تم البحث عن: ${query}`, 'success');
            this.closeSearch();
        }, 1000);
        }
    }

    /**
     * Initialize UI elements
     */
    initializeUIElements() {
        // Initialize smooth scrolling for anchor links
        this.initSmoothScrolling();
        
        // Initialize intersection observer for animations
        this.initScrollAnimations();
        
        // Initialize mobile navigation
        this.initMobileNavigation();
        
        // Initialize tooltips
        this.initTooltips();
    }

    /**
     * Initialize smooth scrolling
     */
    initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Initialize scroll animations
     */
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements that should animate
        document.querySelectorAll('.product-card, .category-card, .brand-item').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Initialize mobile navigation
     */
    initMobileNavigation() {
        // Handle mobile nav item clicks
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Handle search button
                if (item.querySelector('.fa-search')) {
                    e.preventDefault();
                    this.openSearch();
                    return;
                }
                
                // Handle favorites button
                if (item.querySelector('.fa-heart')) {
                    e.preventDefault();
                    if (typeof favoritesManager !== 'undefined') {
                        favoritesManager.openModal();
                    }
                    return;
                }
                
                // Handle cart button
                if (item.querySelector('.fa-shopping-cart')) {
                    e.preventDefault();
                    if (typeof cartManager !== 'undefined') {
                        cartManager.openModal();
                    }
                    return;
                }
                
                // Handle profile button
                if (item.querySelector('.fa-user')) {
                    e.preventDefault();
                    this.showNotification('صفحة الملف الشخصي ستكون متاحة قريباً', 'info');
                    return;
                }
                
                // Remove active class from all items
                document.querySelectorAll('.nav-item').forEach(navItem => {
                    navItem.classList.remove('active');
                });
                
                // Add active class to clicked item (home)
                if (item.querySelector('.fa-home')) {
                    item.classList.add('active');
                    if (window.productManager) {
                        productManager.clearFilters();
                        setTimeout(() => {
                            productManager.scrollToFeaturedSection();
                        }, 100);
                    }
                }
            });
        });
    }

    /**
     * Initialize tooltips
     */
    initTooltips() {
        // Simple tooltip implementation
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', this.showTooltip.bind(this));
            element.addEventListener('mouseleave', this.hideTooltip.bind(this));
        });
    }

    /**
     * Show tooltip
     * @param {Event} e - Mouse event
     */
    showTooltip(e) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = e.target.dataset.tooltip;
        
        document.body.appendChild(tooltip);
        
        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        
        setTimeout(() => tooltip.classList.add('show'), 10);
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    /**
     * Open mobile menu
     */
    openMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenuOverlay');
        if (mobileMenu) {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenuOverlay');
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     */
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                              type === 'error' ? 'exclamation-circle' : 
                              type === 'warning' ? 'exclamation-triangle' : 
                              'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add styles for notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--white);
            border: 1px solid var(--medium-gray);
            border-radius: 10px;
            padding: 1rem;
            box-shadow: var(--shadow-medium);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        // Add color based on type
        if (type === 'success') {
            notification.style.borderColor = 'var(--success-color)';
            notification.querySelector('i').style.color = 'var(--success-color)';
        } else if (type === 'error') {
            notification.style.borderColor = 'var(--danger-color)';
            notification.querySelector('i').style.color = 'var(--danger-color)';
        } else if (type === 'warning') {
            notification.style.borderColor = 'var(--warning-color)';
            notification.querySelector('i').style.color = 'var(--warning-color)';
        } else {
            notification.style.borderColor = 'var(--primary-color)';
            notification.querySelector('i').style.color = 'var(--primary-color)';
        }

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    /**
     * Handle form submissions
     * @param {HTMLFormElement} form - Form element
     * @param {Function} callback - Callback function
     */
    handleFormSubmit(form, callback) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Validate form
            if (this.validateForm(form)) {
                callback(data);
            }
        });
    }

    /**
     * Validate form
     * @param {HTMLFormElement} form - Form element
     * @returns {boolean} Validation result
     */
    validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'هذا الحقل مطلوب');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });
        
        return isValid;
    }

    /**
     * Show field error
     * @param {HTMLElement} field - Form field
     * @param {string} message - Error message
     */
    showFieldError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentElement.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentElement.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }

    /**
     * Clear field error
     * @param {HTMLElement} field - Form field
     */
    clearFieldError(field) {
        field.classList.remove('error');
        
        const errorElement = field.parentElement.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Main click event handler
        document.addEventListener('click', (e) => {
            // Open search
            if (e.target.closest('.search-btn') || e.target.closest('.search-toggle')) {
                e.preventDefault();
                this.openSearch();
            }
            
            // Close search
            if (e.target.closest('.close-search')) {
                this.closeSearch();
            }
            
            // Search form submit
            if (e.target.closest('.search-btn') && e.target.closest('.search-form')) {
                e.preventDefault();
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                    this.performSearch(searchInput.value);
                }
            }
            
            // Desktop navigation
            if (e.target.closest('.nav-link')) {
                e.preventDefault();
                const navLink = e.target.closest('.nav-link');
                const categoryId = navLink.dataset.categoryId;
                const action = navLink.dataset.action;
                
                // Remove active class from all nav links
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                
                // Add active class to clicked link
                navLink.classList.add('active');
                
                // Handle navigation actions first
                if (action === 'home' && window.productManager) {
                    productManager.clearFilters();
                } else if (action === 'offers' && window.productManager) {
                    productManager.filterByOffers();
                } else if (categoryId && window.productManager) {
                    productManager.filterByCategory(categoryId);
                }
                
                // Scroll to featured section (products) after a short delay
                setTimeout(() => {
                    if (window.productManager) {
                        productManager.scrollToFeaturedSection();
                    }
                }, 100);
            }
            
            if (e.target.closest('.profile-btn')) {
                e.preventDefault();
                this.showNotification('صفحة الملف الشخصي ستكون متاحة قريباً', 'info');
            }
        });

        // Search overlay click
        if (this.searchOverlay) {
            this.searchOverlay.addEventListener('click', (e) => {
                if (e.target.classList.contains('search-overlay')) {
                    this.closeSearch();
                }
            });
        }

        // Search input enter key
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('search-input')) {
                this.performSearch(e.target.value);
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSearch();
                // Close other modals if needed
                document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                    modal.classList.remove('active');
                });
                document.body.style.overflow = '';
            }
        });

        // Handle suggestion tags
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag')) {
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                    searchInput.value = e.target.textContent;
                    this.performSearch(e.target.textContent);
                }
            }
        });

        // Handle chat button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.chat-btn')) {
                this.showNotification('ميزة الدردشة ستكون متاحة قريباً', 'info');
            }
        });

        // Mobile menu functionality
        document.addEventListener('click', (e) => {
            // Open mobile menu
            if (e.target.closest('.menu-toggle')) {
                e.preventDefault();
                this.openMobileMenu();
            }
            
            // Close mobile menu
            if (e.target.closest('.close-menu') || e.target.closest('.mobile-menu-overlay')) {
                if (e.target.closest('.mobile-menu-overlay') && !e.target.closest('.mobile-menu-content')) {
                    this.closeMobileMenu();
                } else if (e.target.closest('.close-menu')) {
                    this.closeMobileMenu();
                }
            }
            
            // Mobile menu navigation
            if (e.target.closest('.mobile-menu-item')) {
                const menuItem = e.target.closest('.mobile-menu-item');
                
                // Remove active class from all items
                document.querySelectorAll('.mobile-menu-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Add active class to clicked item
                menuItem.classList.add('active');
                
                // Handle category filtering
                const categoryId = menuItem.dataset.categoryId;
                const action = menuItem.dataset.action;
                
                // Handle navigation actions first
                if (action === 'home' && window.productManager) {
                    productManager.clearFilters();
                } else if (action === 'offers' && window.productManager) {
                    productManager.filterByOffers();
                } else if (categoryId && window.productManager) {
                    productManager.filterByCategory(categoryId);
                }
                
                // Close menu after selection
                this.closeMobileMenu();
                
                // Scroll to featured section (products) after a short delay
                setTimeout(() => {
                    if (window.productManager) {
                        productManager.scrollToFeaturedSection();
                    }
                }, 100);
            }
            
            // Mobile menu actions
            if (e.target.closest('.mobile-menu-btn.wishlist-btn')) {
                e.preventDefault();
                this.closeMobileMenu();
                if (typeof favoritesManager !== 'undefined') {
                    favoritesManager.openModal();
                }
            }
            
            if (e.target.closest('.mobile-menu-btn.cart-btn')) {
                e.preventDefault();
                this.closeMobileMenu();
                if (typeof cartManager !== 'undefined') {
                    cartManager.openModal();
                }
            }
            
            if (e.target.closest('.mobile-menu-btn.profile-btn')) {
                e.preventDefault();
                this.closeMobileMenu();
                this.showNotification('صفحة الملف الشخصي ستكون متاحة قريباً', 'info');
            }
        });

        // Handle scroll to top
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Show/hide scroll to top button
            let scrollTopBtn = document.querySelector('.scroll-to-top');
            if (!scrollTopBtn) {
                scrollTopBtn = document.createElement('button');
                scrollTopBtn.className = 'scroll-to-top';
                scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
                scrollTopBtn.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    cursor: pointer;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                    z-index: 1000;
                `;
                document.body.appendChild(scrollTopBtn);
                
                scrollTopBtn.addEventListener('click', () => {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
            }
            
            if (scrollTop > 300) {
                scrollTopBtn.style.opacity = '1';
                scrollTopBtn.style.visibility = 'visible';
            } else {
                scrollTopBtn.style.opacity = '0';
                scrollTopBtn.style.visibility = 'hidden';
            }
        });
    }
}

// Create global instance
const uiManager = new UIManager(); 