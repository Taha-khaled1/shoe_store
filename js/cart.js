/**
 * Cart Management Module
 * Handles shopping cart operations with localStorage persistence
 */

class CartManager {
    constructor() {
        this.items = [];
        this.taxRate = 0.15; // 15% tax rate
        this.shippingThreshold = 200; // Free shipping above 200 SAR
        this.shippingCost = 25; // Shipping cost in SAR
        
        // Load cart from storage
        this.loadCart();
        
        // Bind events
        this.bindEvents();
    }

    /**
     * Load cart from localStorage
     */
    loadCart() {
        this.items = storageManager.getCart();
        this.updateUI();
    }

    /**
     * Save cart to localStorage
     */
    saveCart() {
        storageManager.setCart(this.items);
        this.updateUI();
    }

    /**
     * Add item to cart
     * @param {Object} product - Product object
     * @param {number} quantity - Quantity to add
     * @param {Object} options - Additional options (size, color, etc.)
     */
    addItem(product, quantity = 1, options = {}) {
        try {
            // Check if item already exists
            const existingIndex = this.items.findIndex(item => 
                item.id === product.id && 
                JSON.stringify(item.options) === JSON.stringify(options)
            );

            if (existingIndex !== -1) {
                // Update existing item quantity
                this.items[existingIndex].quantity += quantity;
            } else {
                // Add new item
                const cartItem = {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    originalPrice: product.originalPrice || product.price,
                    image: product.image,
                    quantity: quantity,
                    options: options,
                    addedAt: new Date().toISOString()
                };
                this.items.push(cartItem);
            }

            this.saveCart();
            this.showNotification('تم إضافة المنتج إلى السلة', 'success');
            return true;
        } catch (error) {
            console.error('Error adding item to cart:', error);
            this.showNotification('حدث خطأ أثناء إضافة المنتج', 'error');
            return false;
        }
    }

    /**
     * Remove item from cart
     * @param {string} itemId - Item ID to remove
     * @param {Object} options - Item options
     */
    removeItem(itemId, options = {}) {
        try {
            const index = this.items.findIndex(item => 
                item.id === itemId && 
                JSON.stringify(item.options) === JSON.stringify(options)
            );

            if (index !== -1) {
                this.items.splice(index, 1);
                this.saveCart();
                this.showNotification('تم حذف المنتج من السلة', 'success');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing item from cart:', error);
            this.showNotification('حدث خطأ أثناء حذف المنتج', 'error');
            return false;
        }
    }

    /**
     * Update item quantity
     * @param {string} itemId - Item ID
     * @param {number} newQuantity - New quantity
     * @param {Object} options - Item options
     */
    updateQuantity(itemId, newQuantity, options = {}) {
        try {
            const index = this.items.findIndex(item => 
                item.id === itemId && 
                JSON.stringify(item.options) === JSON.stringify(options)
            );

            if (index !== -1) {
                if (newQuantity <= 0) {
                    this.removeItem(itemId, options);
                } else {
                    this.items[index].quantity = newQuantity;
                    this.saveCart();
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating item quantity:', error);
            return false;
        }
    }

    /**
     * Clear all items from cart
     */
    clearCart() {
        try {
            this.items = [];
            this.saveCart();
            this.showNotification('تم إفراغ السلة', 'success');
            return true;
        } catch (error) {
            console.error('Error clearing cart:', error);
            this.showNotification('حدث خطأ أثناء إفراغ السلة', 'error');
            return false;
        }
    }

    /**
     * Get cart item count
     * @returns {number} Total number of items
     */
    getItemCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    /**
     * Get cart subtotal
     * @returns {number} Subtotal amount
     */
    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    /**
     * Get tax amount
     * @returns {number} Tax amount
     */
    getTax() {
        return this.getSubtotal() * this.taxRate;
    }

    /**
     * Get shipping cost
     * @returns {number} Shipping cost
     */
    getShipping() {
        return this.getSubtotal() >= this.shippingThreshold ? 0 : this.shippingCost;
    }

    /**
     * Get total amount
     * @returns {number} Total amount
     */
    getTotal() {
        return this.getSubtotal() + this.getTax() + this.getShipping();
    }

    /**
     * Check if item is in cart
     * @param {string} itemId - Item ID
     * @param {Object} options - Item options
     * @returns {boolean} Whether item is in cart
     */
    hasItem(itemId, options = {}) {
        return this.items.some(item => 
            item.id === itemId && 
            JSON.stringify(item.options) === JSON.stringify(options)
        );
    }

    /**
     * Get item from cart
     * @param {string} itemId - Item ID
     * @param {Object} options - Item options
     * @returns {Object|null} Cart item or null
     */
    getItem(itemId, options = {}) {
        return this.items.find(item => 
            item.id === itemId && 
            JSON.stringify(item.options) === JSON.stringify(options)
        ) || null;
    }

    /**
     * Update UI elements
     */
    updateUI() {
        // Update cart badges
        const cartBadges = document.querySelectorAll('.cart-btn .badge');
        cartBadges.forEach(badge => {
            badge.textContent = this.getItemCount();
            badge.style.display = this.getItemCount() > 0 ? 'flex' : 'none';
        });

        // Update mobile nav cart badge
        const mobileNavItems = document.querySelectorAll('.nav-item');
        mobileNavItems.forEach(navItem => {
            if (navItem.querySelector('.fa-shopping-cart')) {
                const badge = navItem.querySelector('.badge');
                if (badge) {
                    badge.textContent = this.getItemCount();
                    badge.style.display = this.getItemCount() > 0 ? 'flex' : 'none';
                }
            }
        });

        // Update mobile menu cart badge
        const mobileMenuCartBtn = document.querySelector('.mobile-menu-btn.cart-btn .badge');
        if (mobileMenuCartBtn) {
            mobileMenuCartBtn.textContent = this.getItemCount();
            mobileMenuCartBtn.style.display = this.getItemCount() > 0 ? 'flex' : 'none';
        }

        // Update cart modal if open
        if (document.getElementById('cartModal').classList.contains('active')) {
            this.renderCartModal();
        }
    }

    /**
     * Render cart modal content
     */
    renderCartModal() {
        const cartItems = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');

        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>السلة فارغة</h3>
                    <p>لم تقم بإضافة أي منتجات إلى السلة بعد</p>
                    <button class="btn btn-primary" onclick="cartManager.closeModal()">تسوق الآن</button>
                </div>
            `;
            cartSummary.style.display = 'none';
        } else {
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <div class="item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <div class="item-specs">
                            ${Object.entries(item.options).map(([key, value]) => `${key}: ${value}`).join(' | ')}
                        </div>
                        <div class="item-price">
                            <span class="current-price">${item.price} ر.س</span>
                            ${item.originalPrice !== item.price ? `<span class="original-price">${item.originalPrice} ر.س</span>` : ''}
                        </div>
                    </div>
                    <div class="item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity - 1}, ${JSON.stringify(item.options).replace(/"/g, '&quot;')})">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity + 1}, ${JSON.stringify(item.options).replace(/"/g, '&quot;')})">+</button>
                        </div>
                        <button class="remove-item" onclick="cartManager.removeItem('${item.id}', ${JSON.stringify(item.options).replace(/"/g, '&quot;')})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');

            // Update summary
            document.getElementById('subtotal').textContent = `${this.getSubtotal().toFixed(2)} ر.س`;
            document.getElementById('tax').textContent = `${this.getTax().toFixed(2)} ر.س`;
            document.getElementById('shipping').textContent = this.getShipping() === 0 ? 'مجاني' : `${this.getShipping().toFixed(2)} ر.س`;
            document.getElementById('total').textContent = `${this.getTotal().toFixed(2)} ر.س`;
            
            cartSummary.style.display = 'block';
        }
    }

    /**
     * Open cart modal
     */
    openModal() {
        this.renderCartModal();
        document.getElementById('cartModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close cart modal
     */
    closeModal() {
        document.getElementById('cartModal').classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Cart button clicks
        document.addEventListener('click', (e) => {
            // Desktop header cart button
            if (e.target.closest('.cart-btn')) {
                e.preventDefault();
                this.openModal();
            }
            
            // Mobile nav cart button
            if (e.target.closest('.nav-item[href="#"]')) {
                const navItem = e.target.closest('.nav-item');
                if (navItem && navItem.querySelector('.fa-shopping-cart')) {
                    e.preventDefault();
                    this.openModal();
                }
            }

            // Add to cart buttons
            if (e.target.closest('.add-to-cart-btn')) {
                e.preventDefault();
                const productCard = e.target.closest('.product-card');
                if (productCard) {
                    const product = this.extractProductData(productCard);
                    this.addItem(product);
                }
            }

            // Modal close buttons
            if (e.target.closest('#closeCartModal')) {
                this.closeModal();
            }

            // Clear cart button
            if (e.target.closest('#clearCart')) {
                if (confirm('هل أنت متأكد من إفراغ السلة؟')) {
                    this.clearCart();
                }
            }

            // Checkout button
            if (e.target.closest('#checkout')) {
                this.checkout();
            }
        });

        // Modal overlay click
        document.getElementById('cartModal').addEventListener('click', (e) => {
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

        return {
            id,
            name,
            price: parseFloat(priceElement.textContent.replace(/[^\d.]/g, '')),
            originalPrice: originalPriceElement ? parseFloat(originalPriceElement.textContent.replace(/[^\d.]/g, '')) : null,
            image
        };
    }

    /**
     * Checkout process
     */
    checkout() {
        if (this.items.length === 0) {
            this.showNotification('السلة فارغة', 'error');
            return;
        }

        // Navigate to payment page
        window.location.href = 'payment.html';
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
const cartManager = new CartManager(); 