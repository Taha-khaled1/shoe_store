/**
 * Favorites Management Module
 * Handles favorites/wishlist operations with localStorage persistence
 */

class FavoritesManager {
    constructor() {
        this.items = [];
        
        // Load favorites from storage
        this.loadFavorites();
        
        // Bind events
        this.bindEvents();
    }

    /**
     * Load favorites from localStorage
     */
    loadFavorites() {
        this.items = storageManager.getFavorites();
        this.updateUI();
    }

    /**
     * Save favorites to localStorage
     */
    saveFavorites() {
        storageManager.setFavorites(this.items);
        this.updateUI();
    }

    /**
     * Add item to favorites
     * @param {Object} product - Product object
     */
    addItem(product) {
        try {
            // Check if item already exists
            const existingIndex = this.items.findIndex(item => item.id === product.id);

            if (existingIndex === -1) {
                // Add new item
                const favoriteItem = {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    originalPrice: product.originalPrice || product.price,
                    image: product.image,
                    rating: product.rating || 0,
                    reviewCount: product.reviewCount || 0,
                    addedAt: new Date().toISOString()
                };
                this.items.push(favoriteItem);
                this.saveFavorites();
                this.showNotification('تم إضافة المنتج إلى المفضلة', 'success');
                return true;
            } else {
                this.showNotification('المنتج موجود بالفعل في المفضلة', 'info');
                return false;
            }
        } catch (error) {
            console.error('Error adding item to favorites:', error);
            this.showNotification('حدث خطأ أثناء إضافة المنتج', 'error');
            return false;
        }
    }

    /**
     * Remove item from favorites
     * @param {string} itemId - Item ID to remove
     */
    removeItem(itemId) {
        try {
            const index = this.items.findIndex(item => item.id === itemId);

            if (index !== -1) {
                this.items.splice(index, 1);
                this.saveFavorites();
                this.showNotification('تم حذف المنتج من المفضلة', 'success');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing item from favorites:', error);
            this.showNotification('حدث خطأ أثناء حذف المنتج', 'error');
            return false;
        }
    }

    /**
     * Toggle item in favorites
     * @param {Object} product - Product object
     */
    toggleItem(product) {
        if (this.hasItem(product.id)) {
            this.removeItem(product.id);
        } else {
            this.addItem(product);
        }
    }

    /**
     * Clear all items from favorites
     */
    clearFavorites() {
        try {
            this.items = [];
            this.saveFavorites();
            this.showNotification('تم إفراغ المفضلة', 'success');
            return true;
        } catch (error) {
            console.error('Error clearing favorites:', error);
            this.showNotification('حدث خطأ أثناء إفراغ المفضلة', 'error');
            return false;
        }
    }

    /**
     * Get favorites item count
     * @returns {number} Total number of items
     */
    getItemCount() {
        return this.items.length;
    }

    /**
     * Check if item is in favorites
     * @param {string} itemId - Item ID
     * @returns {boolean} Whether item is in favorites
     */
    hasItem(itemId) {
        return this.items.some(item => item.id === itemId);
    }

    /**
     * Get item from favorites
     * @param {string} itemId - Item ID
     * @returns {Object|null} Favorite item or null
     */
    getItem(itemId) {
        return this.items.find(item => item.id === itemId) || null;
    }

    /**
     * Update UI elements
     */
    updateUI() {
        // Update wishlist badges
        const wishlistBadges = document.querySelectorAll('.wishlist-btn .badge');
        wishlistBadges.forEach(badge => {
            badge.textContent = this.getItemCount();
            badge.style.display = this.getItemCount() > 0 ? 'flex' : 'none';
        });

        // Update mobile nav favorites badge
        const mobileNavItems = document.querySelectorAll('.nav-item');
        mobileNavItems.forEach(navItem => {
            if (navItem.querySelector('.fa-heart')) {
                const badge = navItem.querySelector('.badge');
                if (badge) {
                    badge.textContent = this.getItemCount();
                    badge.style.display = this.getItemCount() > 0 ? 'flex' : 'none';
                }
            }
        });

        // Update mobile menu favorites badge
        const mobileMenuWishlistBtn = document.querySelector('.mobile-menu-btn.wishlist-btn .badge');
        if (mobileMenuWishlistBtn) {
            mobileMenuWishlistBtn.textContent = this.getItemCount();
            mobileMenuWishlistBtn.style.display = this.getItemCount() > 0 ? 'flex' : 'none';
        }

        // Update wishlist buttons state
        const wishlistButtons = document.querySelectorAll('.wishlist-btn');
        wishlistButtons.forEach(btn => {
            const productCard = btn.closest('.product-card');
            if (productCard) {
                const productId = productCard.dataset.productId;
                btn.classList.toggle('active', this.hasItem(productId));
            }
        });

        // Update favorites modal if open
        if (document.getElementById('favoritesModal').classList.contains('active')) {
            this.renderFavoritesModal();
        }
    }

    /**
     * Render favorites modal content
     */
    renderFavoritesModal() {
        const favoritesGrid = document.getElementById('favoritesGrid');

        if (this.items.length === 0) {
            favoritesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <h3>المفضلة فارغة</h3>
                    <p>لم تقم بإضافة أي منتجات إلى المفضلة بعد</p>
                    <button class="btn btn-primary" onclick="favoritesManager.closeModal()">تسوق الآن</button>
                </div>
            `;
        } else {
            favoritesGrid.innerHTML = this.items.map(item => `
                <div class="favorite-item" data-id="${item.id}">
                    <div class="item-image">
                        <img src="${item.image}" alt="${item.name}">
                        <button class="remove-favorite" onclick="favoritesManager.removeItem('${item.id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <div class="item-rating">
                            ${this.generateStars(item.rating)}
                            <span>(${item.reviewCount})</span>
                        </div>
                        <div class="item-price">
                            <span class="current-price">${item.price} ر.س</span>
                            ${item.originalPrice !== item.price ? `<span class="original-price">${item.originalPrice} ر.س</span>` : ''}
                        </div>
                        <div class="item-actions">
                            <button class="btn btn-primary btn-sm" onclick="favoritesManager.addToCart('${item.id}')">
                                <i class="fas fa-shopping-cart"></i> أضف للسلة
                            </button>
                            <button class="btn btn-outline btn-sm" onclick="favoritesManager.removeItem('${item.id}')">
                                <i class="fas fa-heart-broken"></i> إزالة
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
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
     * Add favorite item to cart
     * @param {string} itemId - Item ID
     */
    addToCart(itemId) {
        const item = this.getItem(itemId);
        if (item && typeof cartManager !== 'undefined') {
            cartManager.addItem(item);
        }
    }

    /**
     * Open favorites modal
     */
    openModal() {
        this.renderFavoritesModal();
        document.getElementById('favoritesModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close favorites modal
     */
    closeModal() {
        document.getElementById('favoritesModal').classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Favorites button clicks
        document.addEventListener('click', (e) => {
            // Header wishlist button
            if (e.target.closest('.wishlist-btn') && e.target.closest('.header-actions')) {
                e.preventDefault();
                this.openModal();
            }

            // Mobile nav favorites
            if (e.target.closest('.nav-item')) {
                const navItem = e.target.closest('.nav-item');
                if (navItem.querySelector('.fa-heart')) {
                    e.preventDefault();
                    this.openModal();
                }
            }

            // Product wishlist buttons
            if (e.target.closest('.wishlist-btn') && e.target.closest('.product-actions')) {
                e.preventDefault();
                const productCard = e.target.closest('.product-card');
                if (productCard) {
                    const product = this.extractProductData(productCard);
                    this.toggleItem(product);
                }
            }

            // Modal close buttons
            if (e.target.closest('#closeFavoritesModal')) {
                this.closeModal();
            }
        });

        // Modal overlay click
        document.getElementById('favoritesModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });
    }

    /**
     * Extract product data from DOM element
     * @param {HTMLElement} productCard - Product card element
     * @returns {Object} Product data
     */
    extractProductData(productCard) {
        const id = productCard.dataset.productId;
        const name = productCard.querySelector('.product-name').textContent.trim();
        const priceElement = productCard.querySelector('.current-price');
        const originalPriceElement = productCard.querySelector('.original-price');
        const image = productCard.querySelector('.product-image img').src;
        const ratingStars = productCard.querySelectorAll('.product-rating .fas.fa-star').length;
        const ratingHalfStars = productCard.querySelectorAll('.product-rating .fas.fa-star-half-alt').length;
        const reviewCountElement = productCard.querySelector('.product-rating span');

        return {
            id,
            name,
            price: parseFloat(priceElement.textContent.replace(/[^\d.]/g, '')),
            originalPrice: originalPriceElement ? parseFloat(originalPriceElement.textContent.replace(/[^\d.]/g, '')) : null,
            image,
            rating: ratingStars + (ratingHalfStars * 0.5),
            reviewCount: reviewCountElement ? parseInt(reviewCountElement.textContent.replace(/[^\d]/g, '')) : 0
        };
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Create global instance
const favoritesManager = new FavoritesManager(); 