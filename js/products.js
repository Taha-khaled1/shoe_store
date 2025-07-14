/**
 * Product Management Module
 * Handles product data from Laravel API and UI rendering
 */

class ProductManager {
    constructor() {
        this.products = [];
        this.categories = [];
        this.banners = [];
        this.currentFilters = {};
        this.isLoading = false;
        
        // Initialize
        this.init();
    }

    /**
     * Initialize product manager
     */
    async init() {
        try {
            // Load categories first
            await this.loadCategories();
            
            // Load banners
            await this.loadBanners();
            
            // Load initial products
            await this.loadProducts();
            
            // Bind events
            this.bindEvents();
            
            console.log('✅ Product manager initialized');
        } catch (error) {
            console.error('❌ Error initializing product manager:', error);
            this.showError('حدث خطأ في تحميل المنتجات');
        }
    }

    /**
     * Load categories from API
     */
    async loadCategories() {
        try {
            this.categories = await apiService.getCategories();
            this.renderCategories();
            this.renderNavigation();
        } catch (error) {
            console.error('Error loading categories:', error);
            // Use fallback categories if API fails
            this.categories = this.getFallbackCategories();
            this.renderCategories();
            this.renderNavigation();
        }
    }

    /**
     * Load banners from API
     */
    async loadBanners() {
        try {
            this.banners = await apiService.getBanners();
            this.renderBanners();
        } catch (error) {
            console.error('Error loading banners:', error);
            // Use fallback banners if API fails
            this.banners = this.getFallbackBanners();
            this.renderBanners();
        }
    }

    /**
     * Load products from API
     * @param {Object} filters - Filter parameters
     */
    async loadProducts(filters = {}) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            this.currentFilters = { ...filters };
            this.products = await apiService.getProducts(filters);
            this.renderProducts();
            this.hideLoading();
        } catch (error) {
            console.error('Error loading products:', error);
            this.hideLoading();
            this.showError('حدث خطأ في تحميل المنتجات');
            
            // Use fallback products if API fails
            this.products = this.getFallbackProducts();
            this.renderProducts();
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Render navigation with categories (limit to 5)
     */
    renderNavigation() {
        const mainNav = document.querySelector('.main-nav');
        const mobileNav = document.querySelector('.mobile-menu-nav');
        
        if (!this.categories.length) {
            console.log('No categories available for navigation');
            return;
        }
    
        const navCategories = this.categories.slice(0, 3);
    
        // Desktop navigation
        if (mainNav) {
            mainNav.innerHTML = `
                <a href="#" class="nav-link active" data-action="home">الرئيسية</a>
                ${navCategories.map(category => `
                    <a href="#" class="nav-link" data-category-id="${category.id}">${category.name}</a>
                `).join('')}
                <a href="#" class="nav-link special" data-action="offers">عروض</a>
            `;
        }
    
        // Mobile navigation
        if (mobileNav) {
            mobileNav.innerHTML = `
                <a href="#" class="mobile-menu-item active" data-action="home">
                    <i class="fas fa-home"></i>
                    <span>الرئيسية</span>
                </a>
                ${navCategories.map(category => `
                    <a href="#" class="mobile-menu-item" data-category-id="${category.id}">
                        <i class="fas fa-th-large"></i>
                        <span>${category.name}</span>
                    </a>
                `).join('')}
                <a href="#" class="mobile-menu-item special" data-action="offers">
                    <i class="fas fa-fire"></i>
                    <span>عروض</span>
                </a>
            `;
        }
    
        // ✅ Add event listeners to handle category selection
        const navLinks = document.querySelectorAll('[data-category-id]');
        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent default link behavior
                const categoryId = link.dataset.categoryId;
                this.scrollToFeaturedSection();
                this.filterByCategory(categoryId);
            });
        });
    }
    

    /**
     * Render categories in UI
     */
    renderCategories() {
        const categoriesGrid = document.querySelector('.categories-grid');
        if (!categoriesGrid || !this.categories.length) return;

        categoriesGrid.innerHTML = this.categories.map(category => `
            <div class="category-card" data-category-id="${category.id}">
                <div class="category-image">
                    <img src="${category.image}" alt="${category.name}" onerror="this.src='https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'">
                </div>
                <div class="category-content">
                    <h3>${category.name}</h3>
                    <p>منتجات ${category.name}</p>
                    <span class="category-count">+${category.subcategories?.length || 0} فئة فرعية</span>
                </div>
            </div>
        `).join('');

        // Add click events to category cards
        categoriesGrid.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const categoryId = card.dataset.categoryId;
                this.scrollToFeaturedSection();
                this.filterByCategory(categoryId);
            });
        });
    }

    /**
     * Render products in UI
     */
    renderProducts() {
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) return;

        if (!this.products.length) {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>لا توجد منتجات</h3>
                    <p>لم يتم العثور على منتجات تطابق البحث</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = this.products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'">
                    <div class="product-actions">
                        <button class="wishlist-btn ${favoritesManager.hasItem(product.id) ? 'active' : ''}" data-product-id="${product.id}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="quick-view-btn" data-product-id="${product.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    ${this.getProductBadge(product)}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">
                        <span class="current-price">${product.final_price} ر.س</span>
                        ${product.discount ? `<span class="original-price">${product.price} ر.س</span>` : ''}
                    </div>
                    <div class="product-rating">
                        ${this.generateStars(product.average_rating)}
                        <span>(${product.reviews_count || 0})</span>
                    </div>
                    <button class="add-to-cart-btn" data-product-id="${product.id}">أضف إلى السلة</button>
                </div>
            </div>
        `).join('');

        // Add event listeners to product cards
        this.bindProductEvents();
    }

    /**
     * Get product badge HTML
     * @param {Object} product - Product data
     * @returns {string} Badge HTML
     */
    getProductBadge(product) {
        if (product.discount) {
            const discountPercent = Math.round((1 - product.final_price / product.price) * 100);
            return `<div class="product-badge sale">خصم ${discountPercent}%</div>`;
        }
        
        // Check if product is new (created within last 30 days)
        const createdDate = new Date(product.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        if (createdDate > thirtyDaysAgo) {
            return `<div class="product-badge">جديد</div>`;
        }
        
        return '';
    }

    /**
     * Generate star rating HTML
     * @param {number} rating - Rating value (0-5)
     * @returns {string} HTML string for stars
     */
    generateStars(rating) {
        let starsHTML = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }

        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }

        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }

        return starsHTML;
    }

    /**
     * Bind product-related events
     */
    bindProductEvents() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = btn.dataset.productId;
                this.addToCart(productId);
            });
        });

     

        // Quick view buttons
        document.querySelectorAll('.quick-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = btn.dataset.productId;
                this.showQuickView(productId);
            });
        });
    }


    /**
     * Toggle product in wishlist
     * @param {string} productId - Product ID
     */
    toggleWishlist(productId) {
        const product = this.getProductById(productId);
        if (product) {
            const productData = {
                id: product.id,
                name: product.name,
                price: parseFloat(product.final_price),
                originalPrice: parseFloat(product.price),
                image: product.image,
                rating: product.average_rating,
                reviewCount: product.reviews_count || 0
            };
            favoritesManager.toggleItem(productData);
            
            // Update button state
            const btn = document.querySelector(`.wishlist-btn[data-product-id="${productId}"]`);
            if (btn) {
                btn.classList.toggle('active', favoritesManager.hasItem(productId));
            }
        }
    }

    /**
     * Show quick view modal
     * @param {string} productId - Product ID
     */
    showQuickView(productId) {
        const product = this.getProductById(productId);
        if (product) {
            // Implement quick view modal
            console.log('Quick view for product:', product);
            // You can implement a modal here
        }
    }

    /**
     * Get product by ID
     * @param {string} productId - Product ID
     * @returns {Object|null} Product data
     */
    getProductById(productId) {
        return this.products.find(p => p.id == productId) || null;
    }

    /**
     * Filter products by category
     * @param {number} categoryId - Category ID
     */
    filterByCategory(categoryId) {
        this.loadProducts({ category_id: categoryId });
    }

    /**
     * Filter products by offers
     */
    filterByOffers() {
        this.loadProducts({ only_offers: true });
    }

    /**
     * Search products
     * @param {string} query - Search query
     */
    searchProducts(query) {
        this.loadProducts({ search: query });
        // Scroll to products section after search
        setTimeout(() => {
            this.scrollToFeaturedSection();
        }, 100);
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.loadProducts();
    }

    /**
     * Render banners in hero section
     */
    renderBanners() {
        const bannerSlider = document.getElementById('bannerSlider');
        const sliderNav = document.getElementById('sliderNav');
        
        if (!bannerSlider) return;

        if (!this.banners.length) {
            this.renderFallbackBanners();
            return;
        }

        // Clear loading state
        bannerSlider.innerHTML = '';
        
        // Create banner slides
        this.banners.forEach((banner, index) => {
            const slide = document.createElement('div');
            slide.className = `banner-slide ${index === 0 ? 'active' : ''}`;
            slide.style.backgroundImage = `url(${banner.image})`;
            
            slide.innerHTML = `
                <div class="banner-content">
                    <div class="banner-info">
                        <h1 class="banner-title">${banner.name}</h1>
                        <p class="banner-subtitle">${banner.description || 'اكتشف أحدث تشكيلة من الأحذية العصرية'}</p>
                        <div class="banner-actions">
                            <button class="banner-btn primary" onclick="productManager.scrollToFeaturedSection()">
                                <i class="fas fa-shopping-bag"></i>
                                تسوق الآن
                            </button>
                            ${banner.banner_url ? `
                                <a href="${banner.banner_url}" class="banner-btn secondary">
                                    <i class="fas fa-info-circle"></i>
                                    المزيد
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            bannerSlider.appendChild(slide);
        });

        // Create navigation dots
        if (sliderNav && this.banners.length > 1) {
            sliderNav.innerHTML = this.banners.map((_, index) => 
                `<div class="nav-dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></div>`
            ).join('');
        }

        // Initialize slider functionality
        this.initializeBannerSlider();
    }

   
    /**
     * Render fallback banners when API fails
     */
    renderFallbackBanners() {
        const bannerSlider = document.getElementById('bannerSlider');
        if (!bannerSlider) return;

        const fallbackBanners = this.getFallbackBanners();
        this.banners = fallbackBanners;
        
        // Clear loading state
        bannerSlider.innerHTML = '';
        
        // Create fallback banner
        const fallbackSlide = document.createElement('div');
        fallbackSlide.className = 'banner-slide active';
        fallbackSlide.innerHTML = `
            <div class="hero-fallback">
                <div class="banner-info">
                    <h1 class="banner-title">مرحباً بك في متجر الأحذية الأنيقة</h1>
                    <p class="banner-subtitle">اكتشف أحدث تشكيلة من الأحذية العصرية بأفضل الأسعار</p>
                    <div class="banner-actions">
                        <button class="banner-btn primary" onclick="productManager.scrollToFeaturedSection()">
                            <i class="fas fa-shopping-bag"></i>
                            تسوق الآن
                        </button>
                        <button class="banner-btn secondary" onclick="productManager.scrollToCategoriesSection()">
                            <i class="fas fa-th-large"></i>
                            تصفح الأقسام
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        bannerSlider.appendChild(fallbackSlide);
        
        // Hide navigation for fallback
        const sliderNav = document.getElementById('sliderNav');
        if (sliderNav) {
            sliderNav.style.display = 'none';
        }
        
        // Hide arrows for fallback
        const prevBtn = document.getElementById('prevSlide');
        const nextBtn = document.getElementById('nextSlide');
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    }

    /**
     * Initialize banner slider functionality
     */
    initializeBannerSlider() {
        if (!this.banners.length || this.banners.length === 1) return;

        let currentSlide = 0;
        const totalSlides = this.banners.length;

        // Auto-slide functionality
        const autoSlide = () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            this.updateBannerSlide(currentSlide);
        };

        // Start auto-slide
        let slideInterval = setInterval(autoSlide, 5000);

        // Navigation dots
        document.querySelectorAll('.nav-dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                this.updateBannerSlide(currentSlide);
                clearInterval(slideInterval);
                slideInterval = setInterval(autoSlide, 5000);
            });
        });

        // Navigation controls
        const prevBtn = document.getElementById('prevSlide');
        const nextBtn = document.getElementById('nextSlide');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                this.updateBannerSlide(currentSlide);
                clearInterval(slideInterval);
                slideInterval = setInterval(autoSlide, 5000);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentSlide = (currentSlide + 1) % totalSlides;
                this.updateBannerSlide(currentSlide);
                clearInterval(slideInterval);
                slideInterval = setInterval(autoSlide, 5000);
            });
        }
    }

    /**
     * Update banner slide
     */
    updateBannerSlide(index) {
        // Update slides
        document.querySelectorAll('.banner-slide').forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        // Update dots
        document.querySelectorAll('.nav-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }



    /**
     * Scroll to categories section
     */
    scrollToCategoriesSection() {
        const categoriesSection = document.querySelector('.categories-section');
        if (categoriesSection) {
            categoriesSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    /**
     * Scroll to featured section (products)
     */
    scrollToFeaturedSection() {
        const featuredSection = document.querySelector('.featured-section');
        if (featuredSection) {
            featuredSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        const productsGrid = document.querySelector('.products-grid');
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>جاري تحميل المنتجات...</p>
                </div>
            `;
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        // Loading will be hidden when products are rendered
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const productsGrid = document.querySelector('.products-grid');
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>حدث خطأ</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="productManager.loadProducts()">إعادة المحاولة</button>
                </div>
            `;
        }
    }

    /**
     * Get fallback categories (for offline mode)
     * @returns {Array} Fallback categories
     */
    getFallbackCategories() {
        return [
            { id: 1, name: 'رجالي', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', subcategories: [] },
            { id: 2, name: 'نسائي', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', subcategories: [] },
            { id: 3, name: 'رياضي', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', subcategories: [] },
            { id: 4, name: 'رسمي', image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', subcategories: [] }
        ];
    }

    /**
     * Get fallback products (for offline mode)
     * @returns {Array} Fallback products
     */
    getFallbackProducts() {
        return [
            {
                id: 1,
                name: 'حذاء رياضي كلاسيكي',
                price: '399.00',
                final_price: '299.00',
                discount: 25,
                image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                average_rating: 4.5,
                reviews_count: 128
            },
            {
                id: 2,
                name: 'حذاء رسمي جلدي',
                price: '450.00',
                final_price: '450.00',
                discount: null,
                image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                average_rating: 5.0,
                reviews_count: 89
            }
        ];
    }

    /**
     * Get fallback banners (for offline mode)
     * @returns {Array} Fallback banners
     */
    getFallbackBanners() {
        return [
            {
                id: 1,
                name: 'أحذية رياضية كلاسيكية',
                image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                banner_url: '#',
                arrange: 1,
                status: 1
            },
            {
                id: 2,
                name: 'أحذية رجالية أنيقة',
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                banner_url: '#',
                arrange: 2,
                status: 1
            },
            {
                id: 3,
                name: 'أحذية نسائية عصرية',
                image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                banner_url: '#',
                arrange: 3,
                status: 1
            }
        ];
    }

    /**
     * Bind global events
     */
    bindEvents() {
        // Search functionality
        document.addEventListener('search', (e) => {
            if (e.detail && e.detail.query) {
                this.searchProducts(e.detail.query);
            }
        });

        // Category filter events
        document.addEventListener('categoryFilter', (e) => {
            if (e.detail && e.detail.categoryId) {
                this.filterByCategory(e.detail.categoryId);
            }
        });

        // Offers filter events
        document.addEventListener('offersFilter', () => {
            this.filterByOffers();
        });
    }
}

// Create global instance
const productManager = new ProductManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductManager;
} 