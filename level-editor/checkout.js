// checkout.js - Handles checkout functionality for the Level Editor

// Firebase Initialization
async function initializeFirebase() {
    console.log('Starting Firebase initialization...');
    
    try {
        // Import Firebase modules
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js");
        const { getAuth, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js");
        const { getFirestore, collection, query, where, onSnapshot, updateDoc, doc, getDoc, getDocs, deleteDoc, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js");

        const firebaseConfig = {
            apiKey: "AIzaSyBEbBryhcs9qxHpi9oxCiW9jV5eTDZHP7M",
            authDomain: "ccs-level-editor.firebaseapp.com",
            projectId: "ccs-level-editor",
            storageBucket: "ccs-level-editor.firebasestorage.app",
            messagingSenderId: "10424890215",
            appId: "1:10424890215:web:e7bfc73e36785ef439f5c2"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        console.log('Firebase core initialized, setting up global functions...');

        // Make Firebase variables available globally
        window.firebaseDB = db;
        window.firebaseAuth = auth;
        window.firebaseCollection = collection;
        window.firebaseQuery = query;
        window.firebaseWhere = where;
        window.firebaseOnSnapshot = onSnapshot;
        window.firebaseUpdateDoc = updateDoc;
        window.firebaseDoc = doc;
        window.firebaseGetDoc = getDoc;
        window.firebaseGetDocs = getDocs;
        window.firebaseDeleteDoc = deleteDoc;
        window.firebaseAddDoc = addDoc;
        window.firebaseServerTimestamp = serverTimestamp;
        window.onAuthStateChanged = onAuthStateChanged;

        // Create a promise that resolves when Firebase is ready
        window.firebaseReady = new Promise((resolve, reject) => {
            let initializationTimeout;
            let retryCount = 0;
            const MAX_RETRIES = 10;
            const RETRY_INTERVAL = 1000; // 1 second
            
            const checkInitialization = () => {
                retryCount++;
                console.log(`Checking Firebase initialization (attempt ${retryCount}/${MAX_RETRIES})...`);
                
                if (window.firebaseDB && window.firebaseCollection) {
                    console.log('Firebase functions are available');
                    clearTimeout(initializationTimeout);
                    
                    // Wait for auth to initialize
                    const unsubscribe = onAuthStateChanged(auth, (user) => {
                        console.log('Firebase auth state initialized');
                        unsubscribe();
                        resolve();
                    });
                } else if (retryCount < MAX_RETRIES) {
                    console.warn(`Firebase functions not yet available, retrying in ${RETRY_INTERVAL/1000} seconds... (attempt ${retryCount}/${MAX_RETRIES})`);
                    setTimeout(checkInitialization, RETRY_INTERVAL);
                } else {
                    console.error('Maximum retry attempts reached');
                    clearTimeout(initializationTimeout);
                    reject(new Error('Firebase initialization failed after maximum retries'));
                }
            };

            // Set a timeout to prevent infinite waiting
            initializationTimeout = setTimeout(() => {
                reject(new Error('Firebase initialization timed out'));
            }, MAX_RETRIES * RETRY_INTERVAL + 5000); // Add 5 seconds buffer

            // Start checking for initialization
            checkInitialization();
        });

        // Dispatch event when Firebase is ready
        window.firebaseReady
            .then(() => {
                console.log('Firebase is fully initialized and ready');
                window.dispatchEvent(new Event('firebaseReady'));
            })
            .catch(error => {
                console.error('Error during Firebase initialization:', error);
                window.dispatchEvent(new CustomEvent('firebaseError', { detail: error }));
            });

        return true;
    } catch (error) {
        console.error('Critical error during Firebase initialization:', error);
        window.dispatchEvent(new CustomEvent('firebaseError', { detail: error }));
        return false;
    }
}

// Function to initialize the checkout system
async function initializeCheckout() {
    console.log('Initializing checkout system...');
    
    // Initialize UI elements that don't require Firebase
    initializePaymentMethods();
    processUrlParameters();
    calculateTotals();
    
    // Initialize Firebase
    const firebaseInitialized = await initializeFirebase();
    
    if (firebaseInitialized) {
        // Initialize Firebase-dependent features
        initializeFirebaseFeatures();
    } else {
        console.error('Firebase initialization failed, some features may be limited');
        showToast('Error connecting to server. Some features may be limited.', 'error');
    }
}

// Check if the DOM is already loaded
if (document.readyState === 'loading') {
    // If DOM is still loading, add event listener
    document.addEventListener('DOMContentLoaded', initializeCheckout);
} else {
    // If DOM is already loaded, initialize immediately
    initializeCheckout();
}

// Initialize Firebase-dependent features
async function initializeFirebaseFeatures() {
    let retryCount = 0;
    const MAX_RETRIES = 5;
    const RETRY_INTERVAL = 1000;

    async function attemptInitialization() {
        try {
            console.log(`Attempting Firebase initialization (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
            
            if (!window.firebaseReady) {
                throw new Error('Firebase initialization promise not found');
            }
            
            await window.firebaseReady;
            console.log('Firebase is ready, initializing Firebase-dependent components');
            
            // Initialize coupon system
            await initializeCouponSystem();
            
            // Initialize form submission
            initializeFormSubmission();
            
            console.log('All Firebase-dependent components initialized successfully');
        } catch (error) {
            console.error(`Error during Firebase initialization (attempt ${retryCount + 1}):`, error);
            
            if (retryCount < MAX_RETRIES) {
                retryCount++;
                console.log(`Retrying in ${RETRY_INTERVAL/1000} seconds...`);
                setTimeout(attemptInitialization, RETRY_INTERVAL);
            } else {
                console.error('Maximum initialization attempts reached');
                showToast('Error connecting to server. Some features may be limited.', 'error');
            }
        }
    }

    attemptInitialization();
}

// Payment method selection functionality
function initializePaymentMethods() {
    const paymentMethods = document.querySelectorAll('payment-method');
    const paymentPages = document.querySelectorAll('payment-page');
    
    if (!paymentMethods.length || !paymentPages.length) {
        console.error('Payment methods or pages not found');
        return;
    }
    
    // Initially hide all payment pages except the first one
    paymentPages.forEach((page, index) => {
        page.style.display = index === 0 ? 'block' : 'none';
    });
    
    // Add checkmark to first payment method by default
    const firstMethod = paymentMethods[0];
    if (firstMethod) {
        const checkmark = document.createElement('span');
        checkmark.className = 'sf-icon';
        checkmark.id = 'pmcheckmark';
        checkmark.style.position = 'absolute';
        checkmark.style.right = '10px';
        checkmark.textContent = '';
        firstMethod.appendChild(checkmark);
    }
    
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            const forValue = this.getAttribute('for-value');
            
            // Hide all payment pages
            paymentPages.forEach(page => {
                page.style.display = 'none';
            });
            
            // Show the selected payment page
            const selectedPage = document.querySelector(`payment-page[value="${forValue}"]`);
            if (selectedPage) {
                selectedPage.style.display = 'block';
            }
            
            // Update payment method selection UI
            paymentMethods.forEach(m => {
                // Remove any existing checkmarks
                const existingCheckmark = m.querySelector('.sf-icon#pmcheckmark');
                if (existingCheckmark) {
                    existingCheckmark.remove();
                }
                
                // Add checkmark to selected method
                if (m === this) {
                    const checkmark = document.createElement('span');
                    checkmark.className = 'sf-icon';
                    checkmark.id = 'pmcheckmark';
                    checkmark.style.position = 'absolute';
                    checkmark.style.right = '10px';
                    checkmark.textContent = '';
                    m.appendChild(checkmark);
                }
            });
        });
    });
}

// Process URL parameters
function processUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const item = urlParams.get('item');
    const mode = urlParams.get('mode');
    
    // Update purchase item based on URL parameter
    if (item) {
        const purchaseItemElement = document.getElementById('purchaseItem');
        const priceElement = document.getElementById('price');
        const typeElement = document.getElementById('type');
        
        // Define item types and their display names and prices
        const itemTypes = {
            'BM': { name: 'Bronze Monthly Subscription', price: '4.99', type: 'subscription' },
            'BY': { name: 'Bronze Yearly Subscription', price: '49.99', type: 'subscription' },
            'SM': { name: 'Silver Monthly Subscription', price: '9.99', type: 'subscription' },
            'SY': { name: 'Silver Yearly Subscription', price: '99.99', type: 'subscription' },
            'GM': { name: 'Gold Monthly Subscription', price: '19.99', type: 'subscription' },
            'GY': { name: 'Gold Yearly Subscription', price: '199.99', type: 'subscription' },
            'powers10': { name: '10 Powers', price: '0.99', type: 'one-time' },
            'powers50': { name: '50 Powers', price: '4.99', type: 'one-time' },
            'powers100': { name: '100 Powers', price: '9.99', type: 'one-time' },
            'powers250': { name: '250 Powers', price: '19.99', type: 'one-time' },
            'powers500': { name: '500 Powers', price: '39.99', type: 'one-time' }
        };
        
        if (itemTypes[item]) {
            if (purchaseItemElement) {
                purchaseItemElement.textContent = itemTypes[item].name;
            }
            if (priceElement) {
                priceElement.textContent = `$${itemTypes[item].price}`;
            }
            if (typeElement) {
                typeElement.textContent = mode || itemTypes[item].type;
            }
            
            // Update image if it's a subscription or powers
            const payingImg = document.getElementById('payingImg');
            if (payingImg) {
                if (item.startsWith('B')) {
                    payingImg.src = 'pricing/bronze.png';
                } else if (item.startsWith('S')) {
                    payingImg.src = 'pricing/silver.png';
                } else if (item.startsWith('G')) {
                    payingImg.src = 'pricing/golden.png';
                } else if (item.startsWith('powers')) {
                    payingImg.src = 'power_uses.png';
                }
            }

            // Update purchase type display
            const purchaseTypeElement = document.getElementById('purchaseType');
            if (purchaseTypeElement) {
                purchaseTypeElement.textContent = mode || itemTypes[item].type;
            }
        }
    }
}

// Calculate total orders and price
function calculateTotals() {
    // Count total orders
    const purchaseItems = document.querySelectorAll('md-list-item.purchase-item');
    const totalOrdersElement = document.getElementById('totalOrders');
    
    // Check if the element exists before setting its textContent
    if (totalOrdersElement) {
        totalOrdersElement.textContent = purchaseItems.length;
    } else {
        console.warn('Total orders element not found in the DOM');
    }
    
    // Calculate total price
    calculateTotalPrice();
}

// New yearly discount handling
function updateYearlyDiscount() {
    const yearlyDiscountElement = document.querySelector('.yearly-discount');
    const yearlyDiscountPriceElement = document.getElementById('yearly-discount-price');
    const totalPriceElement = document.getElementById('totalPrice');
    const urlParams = new URLSearchParams(window.location.search);
    const item = urlParams.get('item');

    if (!yearlyDiscountElement || !yearlyDiscountPriceElement || !totalPriceElement) {
        console.warn('Required elements not found in the DOM');
        return;
    }

    // Check if it's a yearly subscription
    if (item === 'BY' || item === 'SY' || item === 'GY') {
        let originalPrice = 0;
        let discount = 0;

        // Determine the original price based on subscription type
        switch (item) {
            case 'BY':
                originalPrice = 50.99;
                break;
            case 'SY':
                originalPrice = 105.99;
                break;
            case 'GY':
                originalPrice = 299.99;
                break;
        }

        // Calculate 40% discount
        discount = originalPrice * 0.4;

        // Update the UI
        yearlyDiscountElement.style.display = 'block';
        yearlyDiscountPriceElement.textContent = `-$${discount.toFixed(2)}`;
        
        // Update total price
        const finalPrice = originalPrice - discount;
        totalPriceElement.textContent = `$${finalPrice.toFixed(2)}`;
    } else {
        yearlyDiscountElement.style.display = 'none';
    }
}

// Add event listeners for URL parameter changes
window.addEventListener('popstate', updateYearlyDiscount);
window.addEventListener('load', updateYearlyDiscount);

// Initialize coupon code system
async function initializeCouponSystem() {
    try {
        // Wait for Firebase to be ready
        await window.firebaseReady;
        
        // Check if user is authenticated
        const currentUser = window.firebaseAuth.currentUser;
        if (!currentUser) {
            console.log('User not authenticated, coupon system will be limited');
            return;
        }

        // Set up coupon input handler
        const applyButton = document.getElementById('apply-coupon');
        if (applyButton) {
            applyButton.addEventListener('click', applyCoupon);
        }

        // Set up coupon input handler for Enter key
        const couponInput = document.getElementById('coupon-input');
        if (couponInput) {
            couponInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    applyCoupon();
                }
            });
        }

        console.log('Coupon system initialized successfully');
    } catch (error) {
        console.error('Error initializing coupon system:', error);
        showToast('Error initializing coupon system', 'error');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Waiting for Firebase initialization...');
        await window.firebaseReady;
        console.log('Firebase ready, initializing coupon system...');
        await initializeCouponSystem();
    } catch (error) {
        console.error('Error during coupon system initialization:', error);
        showToast('Error initializing coupon system. Please refresh the page.', 'error');
    }
});

// Apply coupon code
async function applyCoupon() {
    try {
        // Wait for Firebase to be ready
        await window.firebaseReady;
        
        // Check if user is authenticated
        const currentUser = window.firebaseAuth.currentUser;
        if (!currentUser) {
            throw new Error('You must be logged in to use coupon codes');
        }

        // Get the coupon code from input
        const couponInput = document.getElementById('coupon-input');
        const code = couponInput?.value?.trim();
        
        if (!code) {
            throw new Error('Please enter a coupon code');
        }

        // Query for the coupon
        const couponQuery = window.firebaseQuery(
            window.firebaseCollection(window.firebaseDB, 'coupon_codes'),
            window.firebaseWhere('code', '==', code),
            window.firebaseWhere('status', '==', 'active')
        );

        const snapshot = await window.firebaseGetDocs(couponQuery);
        
        if (snapshot.empty) {
            throw new Error('Invalid or expired coupon code');
        }

        const couponDoc = snapshot.docs[0];
        const coupon = couponDoc.data();

        // Check if coupon is expired
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            throw new Error('This coupon code has expired');
        }

        // Check if coupon has reached max uses
        if (coupon.currentUses >= coupon.maxUses) {
            throw new Error('This coupon code has reached its maximum number of uses');
        }

        // Calculate the discount
        const currentTotal = parseFloat(document.getElementById('totalPrice').textContent.replace('$', ''));
        let discount = 0;

        if (coupon.type === 'percentage') {
            discount = (currentTotal * coupon.value) / 100;
        } else if (coupon.type === 'fixed') {
            discount = Math.min(coupon.value, currentTotal);
        }

        // Update the UI
        const couponCodeElement = document.getElementById('coupon-code');
        const couponPriceElement = document.querySelector('.coupon-applied #price');
        const couponAppliedElement = document.querySelector('.coupon-applied');
        
        if (couponCodeElement) {
            couponCodeElement.textContent = code;
        }
        
        if (couponPriceElement) {
            couponPriceElement.textContent = `-$${discount.toFixed(2)}`;
        }
        
        if (couponAppliedElement) {
            couponAppliedElement.style.display = 'flex';
            
            // Add remove button if it doesn't exist
            if (!couponAppliedElement.querySelector('.remove-coupon')) {
                const removeButton = document.createElement('button');
                removeButton.className = 'remove-coupon icon-button';
                removeButton.setAttribute('slot', 'end');
                removeButton.innerHTML = '<span class="sf-icon"></span>';
                removeButton.title = 'Remove coupon';
                removeButton.onclick = removeCoupon;
                couponAppliedElement.appendChild(removeButton);
            }
        }
        
        // Store the coupon info for later use during checkout
        window.appliedCoupon = {
            id: couponDoc.id,
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            discount: discount
        };

        // Increment the coupon's currentUses count
        await window.firebaseUpdateDoc(window.firebaseDoc(window.firebaseDB, 'coupon_codes', couponDoc.id), {
            currentUses: (coupon.currentUses || 0) + 1,
            usedBy: currentUser.uid,
            usedDate: window.firebaseServerTimestamp()
        });

        showToast('Coupon applied successfully', 'success');
        
        // Recalculate total price
        calculateTotalPrice();
        
    } catch (error) {
        console.error('Error applying coupon:', error);
        showToast(error.message || 'Error applying coupon code', 'error');
        
        // Clear any partial application
        removeCoupon();
    }
}

// Remove coupon
function removeCoupon() {
    const couponAppliedElement = document.querySelector('.coupon-applied');
    if (couponAppliedElement) {
        couponAppliedElement.style.display = 'none';
    }
    window.appliedCoupon = null;
    calculateTotalPrice();
}

// Update the coupon code when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check if there's a coupon in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const couponCode = urlParams.get('coupon');
        
        if (couponCode) {
            const couponInput = document.getElementById('coupon-input');
            if (couponInput) {
                couponInput.value = couponCode;
                await applyCoupon();
            }
        }
    } catch (error) {
        console.error('Error applying coupon from URL:', error);
    }
});

// Initialize form submission
function initializeFormSubmission() {
    const topupCardForm = document.getElementById('topup-card-form');
    
    if (topupCardForm) {
        topupCardForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Get form data
            const cardType = document.getElementById('card-type').value;
            const denomination = document.getElementById('denomination').value;
            const serialNumber = document.getElementById('serial-number').value;
            const pinNumber = document.getElementById('pin-number').value;
            
            // Validate form data
            if (!cardType || !denomination || !serialNumber || !pinNumber) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            // Get current user information
            const currentUser = getCurrentUser();
            
            // Create request object
            const request = {
                cardType,
                denomination,
                serial: serialNumber,
                pin: pinNumber,
                userId: currentUser ? currentUser.uid : null,
                email: currentUser ? currentUser.email : null,
                timestamp: new Date(),
                status: 'pending'
            };
            
            // Submit request to admin
            submitTopupRequest(request)
                .then(() => {
                    showToast('Your purchase using topup card has been successfully submitted! After verification done, you will receive a notification on your email.', 'success');
                    topupCardForm.reset();
                })
                .catch(error => {
                    console.error('Error submitting topup request:', error);
                    showToast('Error submitting topup request', 'error');
                });
        });
    }
}

// Submit topup request to admin
async function submitTopupRequest(request) {
    try {
        // Wait for auth state to be initialized
        await new Promise((resolve) => {
            const unsubscribe = window.onAuthStateChanged(window.firebaseAuth, (user) => {
                unsubscribe();
                resolve(user);
            });
        });

        const user = window.firebaseAuth.currentUser;
        if (!user) {
            throw new Error('User must be logged in to submit a topup request');
        }

        // Add userId to the request
        request.userId = user.uid;
        request.timestamp = window.firebaseServerTimestamp();

        // Add the request to the topupCardRequests collection
        const topupRequestsRef = window.firebaseCollection(window.firebaseDB, 'topupCardRequests');
        await window.firebaseAddDoc(topupRequestsRef, request);

        // Return success
        return Promise.resolve();
    } catch (error) {
        console.error('Error submitting topup request:', error);
        throw error;
    }
}

// Get current user information
function getCurrentUser() {
    return window.firebaseAuth.currentUser;
}

// Show toast notification
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Add toast to the page
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 500);
    }, 3000);
}

// Add coupon code creation tool to admin dashboard
function addCouponCodeTool() {
    // This function would be called from the admin dashboard
    // It adds a coupon code creation tool to the admin dashboard
    
    // Create coupon code section
    const couponSection = document.createElement('div');
    couponSection.className = 'coupon-codes-section';
    couponSection.style.margin = '20px';
    couponSection.style.padding = '20px';
    couponSection.style.borderRadius = '30px';
    couponSection.style.backgroundColor = '#ffffff';
    
    couponSection.innerHTML = `
        <h2>Coupon Code Management</h2>
        
        <!-- Create Coupon Code Form -->
        <div class="create-coupon-form" style="margin-bottom: 20px;">
            <h3>Create New Coupon Code</h3>
            <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
                <div class="wave-group">
                    <input type="text" class="input" id="couponCode" placeholder="Enter coupon code name">
                    <span class="bar"></span>
                </div>
                <select id="couponType" style="width: 150px;">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                </select>
                <div class="wave-group">
                    <input type="number" class="input" id="couponValue" placeholder="Value">
                    <span class="bar"></span>
                </div>
                <div class="wave-group">
                    <input type="date" class="input" id="couponExpiryDate" placeholder="Expiry Date">
                    <span class="bar"></span>
                </div>
                <div class="wave-group">
                    <input type="number" class="input" id="couponMaxUses" placeholder="Max Uses">
                    <span class="bar"></span>
                </div>
                <button onclick="createCouponCode()" class="filled-button">Create Coupon</button>
                <button onclick="refreshCouponCodes()" class="icon-button"><span class="sf-icon"></span></button>
            </div>
        </div>
        
        <!-- Coupon Codes List -->
        <div class="coupon-codes-table-container" style="overflow-x: auto;">
            <table class="users-table" style="overflow: hidden;">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Value</th>
                        <th>Created Date</th>
                        <th>Expiry Date</th>
                        <th>Uses</th>
                        <th>Status</th>
                        <th>Used By</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="couponCodesTableBody">
                    <!-- Coupon codes will be populated here -->
                </tbody>
            </table>
        </div>
    `;
    
    // Add coupon section to the admin dashboard
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.appendChild(couponSection);
    }
    
    // Initialize coupon codes
    initializeCouponCodes();
}

// Initialize coupon codes
async function initializeCouponCodes() {
    try {
        // Wait for Firebase to be ready
        await window.firebaseReady;
        
        // Check if user is authenticated
        const currentUser = window.firebaseAuth.currentUser;
        if (!currentUser) {
            throw new Error('You must be logged in to view coupon codes');
        }

        // Get user's role from Firestore
        const userDoc = await window.firebaseGetDoc(
            window.firebaseDoc(window.firebaseDB, 'users', currentUser.uid)
        );

        if (!userDoc.exists()) {
            throw new Error('User profile not found');
        }

        const userData = userDoc.data();
        const isAdmin = userData.role === 'admin' || userData.role === 'owner';

        // Get coupon codes from Firestore
        const couponCodesRef = window.firebaseCollection(window.firebaseDB, 'coupon_codes');
        const snapshot = await window.firebaseGetDocs(couponCodesRef);
        
        const couponCodesTableBody = document.getElementById('couponCodesTableBody');
        if (!couponCodesTableBody) {
            return; // Silently return if we're not on the admin page
        }
        
        couponCodesTableBody.innerHTML = '';
        
        if (snapshot.empty) {
            couponCodesTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No coupon codes found</td></tr>';
            return;
        }
        
        snapshot.forEach(doc => {
            const coupon = doc.data();
            const row = createCouponTableRow(coupon, doc.id, isAdmin);
            
            couponCodesTableBody.appendChild(row);
        });
        
        console.log('Coupon codes initialized successfully');
    } catch (error) {
        console.error('Error in initializeCouponCodes:', error);
        showToast(error.message || 'Error loading coupon codes', 'error');
    }
}

// Create coupon code
async function createCouponCode() {
    try {
        // Wait for Firebase to be ready
        await window.firebaseReady;

        // Check if user is authenticated
        const currentUser = window.firebaseAuth.currentUser;
        if (!currentUser) {
            throw new Error('You must be logged in to create coupon codes');
        }

        // Get user's role from Firestore
        const userDoc = await window.firebaseGetDoc(
            window.firebaseDoc(window.firebaseDB, 'users', currentUser.uid)
        );

        if (!userDoc.exists()) {
            throw new Error('User profile not found');
        }

        const userData = userDoc.data();
        if (userData.role !== 'admin' && userData.role !== 'owner') {
            throw new Error('You do not have permission to create coupon codes');
        }
        
        // Get form values
        const code = document.getElementById('couponCode')?.value?.trim();
        const type = document.getElementById('couponType')?.value;
        const value = parseFloat(document.getElementById('couponValue')?.value);
        const expiryDate = document.getElementById('couponExpiryDate')?.value;
        const maxUses = parseInt(document.getElementById('couponMaxUses')?.value) || 1;
        
        if (!code || !type || isNaN(value) || !expiryDate) {
            throw new Error('Please fill in all required fields');
        }
        
        // Validate values
        if (type === 'percentage' && (value <= 0 || value > 100)) {
            throw new Error('Percentage value must be between 0 and 100');
        }
        if (type === 'fixed' && value <= 0) {
            throw new Error('Fixed amount must be greater than 0');
        }
        if (maxUses <= 0) {
            throw new Error('Maximum uses must be greater than 0');
        }
        
        // Create the coupon
        const couponData = {
            code,
            type,
            value,
            createdAt: window.firebaseServerTimestamp(),
            expiryDate: new Date(expiryDate).toISOString(),
            status: 'active',
            usedBy: null,
            createdBy: currentUser.uid,
            isPublic: true,
            maxUses: maxUses,
            currentUses: 0
        };
        
        await window.firebaseAddDoc(
            window.firebaseCollection(window.firebaseDB, 'coupon_codes'),
            couponData
        );
        
        showToast('Coupon code created successfully', 'success');
        
        // Clear form
        document.getElementById('couponCode').value = '';
        document.getElementById('couponValue').value = '';
        document.getElementById('couponExpiryDate').value = '';
        document.getElementById('couponMaxUses').value = '1';
        
        // Refresh the table
        await initializeCouponCodes();
    } catch (error) {
        console.error('Error creating coupon code:', error);
        showToast(error.message || 'Error creating coupon code', 'error');
    }
}

// Update the coupon code table row generation
function createCouponTableRow(coupon, docId, isAdmin) {
    const row = document.createElement('tr');
    const createdDate = coupon.createdDate ? new Date(coupon.createdDate).toLocaleDateString() : 'N/A';
    const expiryDate = coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'N/A';
    const valueDisplay = coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`;
    
    row.innerHTML = `
        <td>${coupon.code || ''}</td>
        <td>${coupon.type || ''}</td>
        <td>${valueDisplay}</td>
        <td>${createdDate}</td>
        <td>${expiryDate}</td>
        <td>${coupon.currentUses || 0}/${coupon.maxUses || 1}</td>
        <td><span class="status-badge ${coupon.status === 'active' ? 'success' : 'neutral'}">${coupon.status || 'inactive'}</span></td>
        <td>${coupon.usedBy || '-'}</td>
        <td style="display: flex; gap: 10px;">
            <button onclick="copyCouponCode('${coupon.code}')" class="icon-button" title="Copy code">
                <span class="sf-icon"><img src="copy.svg" alt="Copy code" style="width: 20px; height: 20px;"></span>
            </button>
            ${isAdmin ? `
                <button onclick="deleteCouponCode('${docId}')" class="icon-button" title="Delete code"> 
                    <span class="sf-icon"></span>
                </button>
            ` : ''}
        </td>
    `;
    
    return row;
}

// Refresh coupon codes
async function refreshCouponCodes() {
    try {
        // Check if Firebase is initialized
        if (!window.firebaseDB) {
            console.warn('Firebase DB not initialized yet. Waiting for initialization...');
            // Wait for Firebase to be ready
            await window.firebaseReady;
        }
        
        // Reinitialize coupon codes
        await initializeCouponCodes();
        
        showToast('Coupon codes refreshed', 'success');
    } catch (error) {
        console.error('Error refreshing coupon codes:', error);
        showToast(error.message || 'Error refreshing coupon codes. Please try again.', 'error');
    }
}

// Copy coupon code to clipboard
function copyCouponCode(code) {
    navigator.clipboard.writeText(code)
        .then(() => {
            showToast(`Coupon code "${code}" copied to clipboard`, 'success');
        })
        .catch(err => {
            console.error('Failed to copy coupon code: ', err);
            showToast('Failed to copy coupon code to clipboard', 'error');
        });
}

// Delete coupon code
async function deleteCouponCode(codeId) {
    try {
        if (!window.firebaseDB || !window.firebaseCollection) {
            console.warn('Firebase not fully initialized. Waiting...');
            await window.firebaseReady;
        }

        if (!window.firebaseDB || !window.firebaseCollection) {
            throw new Error('Firebase still not initialized after waiting');
        }
        
        // Check if user is authenticated and has admin/owner role
        const currentUser = window.firebaseAuth.currentUser;
        if (!currentUser) {
            throw new Error('You must be logged in to delete coupon codes');
        }

        // Get user's role from Firestore
        const userDoc = await window.firebaseGetDoc(window.firebaseDoc(window.firebaseDB, 'users', currentUser.uid));
        if (!userDoc.exists()) {
            throw new Error('User profile not found');
        }

        const userData = userDoc.data();
        if (userData.role !== 'admin' && userData.role !== 'owner') {
            throw new Error('You do not have permission to delete coupon codes');
        }
        
        // Use the correct collection name 'coupon_codes'
        const couponCodesRef = window.firebaseCollection(window.firebaseDB, 'coupon_codes');
        
        // Delete the document
        await window.firebaseDeleteDoc(window.firebaseDoc(couponCodesRef, codeId));
        
        showToast('Coupon code deleted successfully', 'success');
        
        // Refresh coupon codes
        await refreshCouponCodes();
    } catch (error) {
        console.error('Error deleting coupon code:', error);
        showToast(error.message || 'Error deleting coupon code. Please try again.', 'error');
    }
}

// Add jQuery-like contains selector
Element.prototype.matches = Element.prototype.matches || Element.prototype.msMatchesSelector;
Element.prototype.closest = Element.prototype.closest || function(selector) {
    let el = this;
    while (el) {
        if (el.matches(selector)) return el;
        el = el.parentElement;
    }
    return null;
};

// Add jQuery-like contains selector
const originalQuerySelector = document.querySelector;
document.querySelector = function(selector) {
    if (selector.includes(':contains(')) {
        const parts = selector.split(':contains(');
        const baseSelector = parts[0];
        const text = parts[1].slice(0, -1);
        
        const elements = document.querySelectorAll(baseSelector);
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].textContent.includes(text)) {
                return elements[i];
            }
        }
        return null;
    }
    return originalQuerySelector.call(document, selector);
};

// Calculate total price
function calculateTotalPrice() {
    const totalPriceElement = document.getElementById('totalPrice');
    const yearlyDiscountElement = document.querySelector('.yearly-discount');
    const couponAppliedElement = document.querySelector('.coupon-applied');
    
    if (!totalPriceElement) {
        console.warn('Total price element not found in the DOM');
        return;
    }

    // Get the base price from the purchase item
    const priceElement = document.getElementById('price');
    const basePrice = parseFloat(priceElement?.textContent?.replace('$', '') || '0');

    // Calculate yearly discount if applicable
    let yearlyDiscount = 0;
    if (yearlyDiscountElement && yearlyDiscountElement.style.display !== 'none') {
        const yearlyDiscountPriceElement = document.getElementById('yearly-discount-price');
        yearlyDiscount = parseFloat(yearlyDiscountPriceElement?.textContent?.replace('-$', '') || '0');
    }

    // Calculate coupon discount if applicable
    let couponDiscount = 0;
    if (couponAppliedElement && couponAppliedElement.style.display !== 'none') {
        const couponPriceElement = document.querySelector('.coupon-applied #price');
        couponDiscount = parseFloat(couponPriceElement?.textContent?.replace('-$', '') || '0');
    }

    // Calculate final price
    const finalPrice = basePrice - yearlyDiscount - couponDiscount;
    totalPriceElement.textContent = `$${finalPrice.toFixed(2)}`;
} 