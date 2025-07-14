/**
 * Payment Page Module
 * Handles payment form, tax calculation, and order submission
 */

class PaymentManager {
    constructor() {
        this.form = null;
        this.citiesData = null;
        this.selectedTaxes = {
            country: 0,
            governorate: 0,
            city: 0
        };
        this.cartData = [];
        this.subtotal = 0;
        this.shipping = 0;
        this.taxAmount = 0;
        this.total = 0;
        
        this.init();
    }

    /**
     * Initialize payment manager
     */
    init() {
        this.form = document.getElementById('paymentForm');
        this.loadCartData();
        this.setupFormHandlers();
        this.loadCitiesData();
        this.updateCartBadges();
    }

    /**
     * Load cart data from storage
     */
    loadCartData() {
        try {
            // Use the storage manager to get cart data
            if (typeof storageManager !== 'undefined') {
                this.cartData = storageManager.getCart();
            } else {
                // Fallback to direct localStorage access
                this.cartData = JSON.parse(localStorage.getItem('shoe_store_cart') || '[]');
            }
            
            console.log('Cart data loaded:', this.cartData);
            this.calculateTotals();
            this.renderCartSummary();
        } catch (error) {
            console.error('Error loading cart data:', error);
            this.cartData = [];
            this.renderEmptyCart();
        }
    }

    /**
     * Calculate order totals
     */
    calculateTotals() {
        console.log('Calculating totals for cart data:', this.cartData);
        
        this.subtotal = this.cartData.reduce((sum, item) => {
            const itemPrice = parseFloat(item.price || 0);
            const itemQuantity = parseInt(item.quantity || 0);
            const itemTotal = itemPrice * itemQuantity;
            
            console.log(`Item: ${item.name}, Price: ${itemPrice}, Quantity: ${itemQuantity}, Total: ${itemTotal}`);
            
            return sum + itemTotal;
        }, 0);

        this.shipping = 0; // Free shipping over 500 SAR
        this.taxAmount = this.calculateTax();
        this.total = this.subtotal + this.shipping + this.taxAmount;

        console.log(`Subtotal: ${this.subtotal}, Shipping: ${this.shipping}, Tax: ${this.taxAmount}, Total: ${this.total}`);

        this.updateSummaryDisplay();
    }

    /**
     * Calculate tax based on selected location
     */
    calculateTax() {
        const totalTaxRate = this.selectedTaxes.country + this.selectedTaxes.governorate + this.selectedTaxes.city;
        return (this.subtotal * totalTaxRate) / 100;
    }

    /**
     * Update summary display
     */
    updateSummaryDisplay() {
        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shipping');
        const taxEl = document.getElementById('tax');
        const totalEl = document.getElementById('total');
        const taxRowEl = document.getElementById('taxRow');

        if (subtotalEl) subtotalEl.textContent = `${this.subtotal.toFixed(2)} ر.س`;
        if (shippingEl) shippingEl.textContent = this.shipping === 0 ? 'مجاني' : `${this.shipping.toFixed(2)} ر.س`;
        if (taxEl) taxEl.textContent = `${this.taxAmount.toFixed(2)} ر.س`;
        if (totalEl) totalEl.textContent = `${this.total.toFixed(2)} ر.س`;

        // Show/hide tax row
        if (taxRowEl) {
            taxRowEl.style.display = this.taxAmount > 0 ? 'flex' : 'none';
        }
    }

    /**
     * Render cart summary
     */
    renderCartSummary() {
        const container = document.getElementById('cartItemsSummary');
        if (!container) {
            console.error('Cart items summary container not found');
            return;
        }

        console.log('Rendering cart summary for:', this.cartData);

        if (this.cartData.length === 0) {
            this.renderEmptyCart();
            return;
        }

        container.innerHTML = this.cartData.map(item => {
            const itemPrice = parseFloat(item.price || 0);
            const itemQuantity = parseInt(item.quantity || 0);
            const itemTotal = itemPrice * itemQuantity;
            const itemImage = item.image || 'https://via.placeholder.com/50x50?text=No+Image';
            const itemName = item.name || 'منتج غير محدد';
            const itemSize = item.options?.size || item.size || 'غير محدد';
            
            return `
                <div class="cart-item-summary">
                    <div class="item-image">
                        <img src="${itemImage}" alt="${itemName}" onerror="this.src='https://via.placeholder.com/50x50?text=No+Image'">
                    </div>
                    <div class="item-details">
                        <div class="item-name">${itemName}</div>
                        <div class="item-info">الكمية: ${itemQuantity} | المقاس: ${itemSize}</div>
                    </div>
                    <div class="item-total">${itemTotal.toFixed(2)} ر.س</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render empty cart state
     */
    renderEmptyCart() {
        const container = document.getElementById('cartItemsSummary');
        if (!container) return;

        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>السلة فارغة</h3>
                <p>لا توجد منتجات في سلة التسوق</p>
                <a href="index.html" class="btn">
                    <i class="fas fa-arrow-right"></i>
                    العودة للتسوق
                </a>
            </div>
        `;
    }

    /**
     * Update cart badges
     */
    updateCartBadges() {
        const badges = document.querySelectorAll('.cart-btn .badge');
        const itemCount = this.cartData.reduce((sum, item) => sum + parseInt(item.quantity), 0);
        
        badges.forEach(badge => {
            badge.textContent = itemCount;
            badge.style.display = itemCount > 0 ? 'inline-block' : 'none';
        });
    }

    /**
     * Setup form event handlers
     */
    setupFormHandlers() {
        if (!this.form) return;

        // Country selection
        const countrySelect = document.getElementById('country');
        if (countrySelect) {
            countrySelect.addEventListener('change', (e) => {
                this.onCountryChange(e.target.value);
            });
        }

        // Governorate selection
        const governorateSelect = document.getElementById('governorate');
        if (governorateSelect) {
            governorateSelect.addEventListener('change', (e) => {
                this.onGovernorateChange(e.target.value);
            });
        }

        // City selection
        const citySelect = document.getElementById('city');
        if (citySelect) {
            citySelect.addEventListener('change', (e) => {
                this.onCityChange(e.target.value);
            });
        }

        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitOrder();
        });

        // Real-time validation
        const inputs = this.form.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    /**
     * Load cities data from API
     */
    async loadCitiesData() {
        const countrySelect = document.getElementById('country');
        const countryLoading = document.getElementById('countryLoading');
        
        if (countryLoading) countryLoading.style.display = 'inline-block';
        if (countrySelect) countrySelect.disabled = true;

        try {
            this.citiesData = await apiService.getCities();
            console.log('Cities data loaded:', this.citiesData);
            
            this.populateCountries();
        } catch (error) {
            console.error('Error loading cities data:', error);
            this.showError('فشل في تحميل بيانات المدن. يرجى المحاولة مرة أخرى.');
        } finally {
            if (countryLoading) countryLoading.style.display = 'none';
            if (countrySelect) countrySelect.disabled = false;
        }
    }

    /**
     * Populate countries dropdown
     */
    populateCountries() {
        const countrySelect = document.getElementById('country');
        if (!countrySelect) {
            console.error('Country select element not found');
            return;
        }

        console.log('Cities data structure:', this.citiesData);
        
        // Handle different possible data structures
        let countries = [];
        if (this.citiesData?.countries) {
            countries = this.citiesData.countries;
        } else if (this.citiesData?.data?.countries) {
            countries = this.citiesData.data.countries;
        } else if (Array.isArray(this.citiesData)) {
            countries = this.citiesData;
        }

        console.log('Countries to populate:', countries);

        if (!countries || countries.length === 0) {
            console.error('No countries data available');
            this.showError('لا توجد بيانات دول متاحة');
            return;
        }

        countrySelect.innerHTML = '<option value="">اختر الدولة</option>';
        
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.id;
            option.textContent = country.name || country.name_ar;
            option.dataset.tax = country.country_tax || '0';
            countrySelect.appendChild(option);
        });

        console.log('Countries populated successfully');
    }

    /**
     * Handle country selection change
     */
    onCountryChange(countryId) {
        const governorateSelect = document.getElementById('governorate');
        const citySelect = document.getElementById('city');
        const governorateLoading = document.getElementById('governorateLoading');

        // Reset dependent dropdowns
        if (governorateSelect) {
            governorateSelect.innerHTML = '<option value="">اختر المحافظة</option>';
            governorateSelect.disabled = !countryId;
        }
        if (citySelect) {
            citySelect.innerHTML = '<option value="">اختر المدينة</option>';
            citySelect.disabled = true;
        }

        // Reset taxes
        this.selectedTaxes = { country: 0, governorate: 0, city: 0 };

        if (!countryId) {
            this.calculateTotals();
            return;
        }

        // Find selected country
        let countries = [];
        if (this.citiesData?.countries) {
            countries = this.citiesData.countries;
        } else if (this.citiesData?.data?.countries) {
            countries = this.citiesData.data.countries;
        } else if (Array.isArray(this.citiesData)) {
            countries = this.citiesData;
        }

        const selectedCountry = countries.find(c => c.id == countryId);
        if (!selectedCountry) {
            console.error('Selected country not found:', countryId);
            return;
        }

        console.log('Selected country:', selectedCountry);

        // Set country tax
        this.selectedTaxes.country = parseFloat(selectedCountry.country_tax || 0);

        // Populate governorates
        if (governorateLoading) governorateLoading.style.display = 'inline-block';
        
        setTimeout(() => {
            const governorates = selectedCountry.governorates || [];
            console.log('Governorates to populate:', governorates);
            
            governorates.forEach(governorate => {
                const option = document.createElement('option');
                option.value = governorate.id;
                option.textContent = governorate.name || governorate.name_ar;
                option.dataset.tax = governorate.governorate_tax || '0';
                governorateSelect.appendChild(option);
            });
            
            if (governorateLoading) governorateLoading.style.display = 'none';
            console.log('Governorates populated successfully');
        }, 300);

        this.calculateTotals();
    }

    /**
     * Handle governorate selection change
     */
    onGovernorateChange(governorateId) {
        const citySelect = document.getElementById('city');
        const cityLoading = document.getElementById('cityLoading');
        const countryId = document.getElementById('country').value;

        // Reset city dropdown
        if (citySelect) {
            citySelect.innerHTML = '<option value="">اختر المدينة</option>';
            citySelect.disabled = !governorateId;
        }

        // Reset city tax
        this.selectedTaxes.city = 0;

        if (!governorateId) {
            this.calculateTotals();
            return;
        }

        // Find selected governorate
        let countries = [];
        if (this.citiesData?.countries) {
            countries = this.citiesData.countries;
        } else if (this.citiesData?.data?.countries) {
            countries = this.citiesData.data.countries;
        } else if (Array.isArray(this.citiesData)) {
            countries = this.citiesData;
        }

        const selectedCountry = countries.find(c => c.id == countryId);
        const selectedGovernorate = selectedCountry?.governorates?.find(g => g.id == governorateId);
        
        if (!selectedGovernorate) {
            console.error('Selected governorate not found:', governorateId);
            return;
        }

        console.log('Selected governorate:', selectedGovernorate);

        // Set governorate tax
        this.selectedTaxes.governorate = parseFloat(selectedGovernorate.governorate_tax || 0);

        // Populate cities
        if (cityLoading) cityLoading.style.display = 'inline-block';
        
        setTimeout(() => {
            const cities = selectedGovernorate.cities || [];
            console.log('Cities to populate:', cities);
            
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.id;
                option.textContent = city.name_ar || city.name;
                option.dataset.tax = city.city_tax || '0';
                citySelect.appendChild(option);
            });
            
            if (cityLoading) cityLoading.style.display = 'none';
            citySelect.disabled = false;
            console.log('Cities populated successfully');
        }, 300);

        this.calculateTotals();
    }

    /**
     * Handle city selection change
     */
    onCityChange(cityId) {
        const countryId = document.getElementById('country').value;
        const governorateId = document.getElementById('governorate').value;

        // Reset city tax
        this.selectedTaxes.city = 0;

        if (!cityId) {
            this.calculateTotals();
            return;
        }

        // Find selected city
        const selectedCountry = this.citiesData?.countries?.find(c => c.id == countryId);
        const selectedGovernorate = selectedCountry?.governorates?.find(g => g.id == governorateId);
        const selectedCity = selectedGovernorate?.cities?.find(c => c.id == cityId);
        
        if (!selectedCity) return;

        // Set city tax
        this.selectedTaxes.city = parseFloat(selectedCity.city_tax || 0);

        this.calculateTotals();
    }

    /**
     * Validate form field
     */
    validateField(field) {
        const value = field.value.trim();
        const fieldGroup = field.closest('.form-group');
        
        if (!fieldGroup) return true;

        // Remove previous error state
        fieldGroup.classList.remove('error');
        
        // Check required fields
        if (field.hasAttribute('required') && !value) {
            this.showFieldError(fieldGroup, 'هذا الحقل مطلوب');
            return false;
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showFieldError(fieldGroup, 'يرجى إدخال بريد إلكتروني صحيح');
                return false;
            }
        }

        // Phone validation
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[0-9+\-\s()]{10,}$/;
            if (!phoneRegex.test(value)) {
                this.showFieldError(fieldGroup, 'يرجى إدخال رقم هاتف صحيح');
                return false;
            }
        }

        // Mark as success
        fieldGroup.classList.add('success');
        return true;
    }

    /**
     * Show field error
     */
    showFieldError(fieldGroup, message) {
        fieldGroup.classList.add('error');
        
        let errorEl = fieldGroup.querySelector('.error-message');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'error-message';
            fieldGroup.appendChild(errorEl);
        }
        
        errorEl.textContent = message;
    }

    /**
     * Clear field error
     */
    clearFieldError(field) {
        const fieldGroup = field.closest('.form-group');
        if (fieldGroup) {
            fieldGroup.classList.remove('error');
        }
    }

    /**
     * Validate entire form
     */
    validateForm() {
        const requiredFields = this.form.querySelectorAll('input[required], select[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Submit order
     */
    async submitOrder() {
        if (!this.validateForm()) {
            this.showError('يرجى تعبئة جميع الحقول المطلوبة بشكل صحيح');
            return;
        }

        if (this.cartData.length === 0) {
            this.showError('لا توجد منتجات في سلة التسوق');
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        const originalContent = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner loading-spinner"></i> جاري المعالجة...';

        try {
            // Collect form data
            const formData = new FormData(this.form);
            const orderData = {
                customer: {
                    fullName: formData.get('fullName'),
                    email: formData.get('email'),
                    phone: formData.get('phone')
                },
                address: {
                    country: formData.get('country'),
                    governorate: formData.get('governorate'),
                    city: formData.get('city'),
                    street: formData.get('street'),
                    building: formData.get('building')
                },
                paymentMethod: formData.get('paymentMethod'),
                items: this.cartData,
                summary: {
                    subtotal: this.subtotal,
                    shipping: this.shipping,
                    tax: this.taxAmount,
                    total: this.total
                },
                taxes: this.selectedTaxes
            };

            console.log('Submitting order:', orderData);

            // Simulate API call (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Clear cart
            if (typeof storageManager !== 'undefined') {
                storageManager.setCart([]);
            } else {
                localStorage.removeItem('shoe_store_cart');
            }

            // Show success message
            this.showSuccess('تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً.');

            // Redirect to confirmation page (or home)
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);

        } catch (error) {
            console.error('Error submitting order:', error);
            this.showError('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        // Remove existing alerts
        this.removeAlerts();

        const alert = document.createElement('div');
        alert.className = 'alert alert-error';
        alert.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
            <button class="alert-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.querySelector('.payment-container').insertBefore(alert, document.querySelector('.payment-container').firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        // Remove existing alerts
        this.removeAlerts();

        const alert = document.createElement('div');
        alert.className = 'alert alert-success';
        alert.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

        document.querySelector('.payment-container').insertBefore(alert, document.querySelector('.payment-container').firstChild);
    }

    /**
     * Remove all alerts
     */
    removeAlerts() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => alert.remove());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PaymentManager();
});

// Add alert styles to the page
const alertStyles = document.createElement('style');
alertStyles.textContent = `
    .alert {
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
    }
    
    .alert-error {
        background: #fee;
        color: #c53030;
        border: 1px solid #fed7d7;
    }
    
    .alert-success {
        background: #f0fff4;
        color: #2f855a;
        border: 1px solid #c6f6d5;
    }
    
    .alert-close {
        margin-left: auto;
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
    }
    
    .alert-close:hover {
        background: rgba(0, 0, 0, 0.1);
    }
`;
document.head.appendChild(alertStyles); 