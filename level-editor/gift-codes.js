// Gift Codes Management
document.addEventListener('DOMContentLoaded', function() {
    console.log("Gift codes script loaded");
    
    // Function to show notifications
    function showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `notification-toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 500);
        }, 3000);
    }
    
    // Function to manually refresh gift codes
    window.refreshGiftCodes = function() {
        console.log("Manually refreshing gift codes");
        showToast("Refreshing gift codes...", "info");
        initializeGiftCodes();
    };
    
    // Function to create a new gift code
    window.createGiftCode = async function() {
        try {
            const type = document.getElementById('giftCodeType').value;
            const expiryDate = document.getElementById('expiryDate').value;

            if (!type || !expiryDate) {
                showToast("Please select both code type and expiry date", "error");
                return;
            }

            // Generate a random code
            const code = 'CCGAPPS@GIFT' + Math.random().toString(36).substring(2, 15).toUpperCase();

            // Add the gift code to Firestore
            const giftCodesRef = window.collection(window.db, "giftCodes");
            await window.addDoc(giftCodesRef, {
                code: code,
                type: type,
                createdAt: window.serverTimestamp(),
                expiryDate: new Date(expiryDate).toISOString(),
                isValid: true,
                usedBy: null
            });

            showToast("Gift code created successfully", "success");
            // Refresh the gift codes table
            refreshGiftCodes();
        } catch (error) {
            console.error("Error creating gift code:", error);
            showToast("Error creating gift code: " + error.message, "error");
        }
    };

    // Function to delete a gift code
    window.deleteGiftCode = async function(codeId) {
        try {
            const giftCodeRef = window.doc(window.db, "giftCodes", codeId);
            await window.deleteDoc(giftCodeRef);
            showToast("Gift code deleted successfully", "success");
            // Refresh the gift codes table
            refreshGiftCodes();
        } catch (error) {
            console.error("Error deleting gift code:", error);
            showToast("Error deleting gift code: " + error.message, "error");
        }
    };

    // Function to initialize gift codes
    function initializeGiftCodes() {
        console.log("Initializing gift codes...");
        
        // Check if Firebase is initialized
        if (!window.db || !window.collection || !window.query || !window.onSnapshot) {
            console.error("Firebase is not properly initialized");
            showToast("Error: Firebase is not properly initialized", "error");
            return;
        }
        
        const giftCodesRef = window.collection(window.db, "giftCodes");
        const q = window.query(giftCodesRef);
        
        window.onSnapshot(q, (snapshot) => {
            console.log("Gift codes snapshot received:", snapshot.size, "documents");
            const giftCodesTableBody = document.getElementById('giftCodesTableBody');
            
            if (!giftCodesTableBody) {
                console.error("giftCodesTableBody element not found!");
                return;
            }
            
            giftCodesTableBody.innerHTML = '';

            if (snapshot.empty) {
                console.log("No gift codes found in the database");
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = '<td colspan="7" style="text-align: center;">No gift codes found</td>';
                giftCodesTableBody.appendChild(emptyRow);
                return;
            }

            snapshot.forEach((doc) => {
                console.log("Processing gift code:", doc.id, doc.data());
                const giftCode = doc.data();
                const row = document.createElement('tr');
                
                const now = new Date();
                const expiryDate = new Date(giftCode.expiryDate);
                const isExpired = expiryDate < now;
                
                const status = giftCode.isValid ? 
                    (isExpired ? 'Expired' : 'Valid') : 
                    'Used';
                    
                const statusClass = giftCode.isValid ? 
                    (isExpired ? 'error' : 'success') : 
                    'neutral';

                row.innerHTML = `
                    <td>${giftCode.code}</td>
                    <td>${giftCode.type}</td>
                    <td>${giftCode.createdAt ? new Date(giftCode.createdAt.toDate()).toLocaleDateString() : '-'}</td>
                    <td>${new Date(giftCode.expiryDate).toLocaleDateString()}</td>
                    <td><span class="status-badge ${statusClass}">${status}</span></td>
                    <td>${giftCode.usedBy || '-'}</td>
                    <td style="display: flex; gap: 10px;">
                        <button onclick="copyGiftCode('${giftCode.code}')" class="icon-button" title="Copy code"><span class="sf-icon"><img src="copy.svg" alt="Copy code" style="width: 20px; height: 20px;"></span></button>
                        <button onclick="deleteGiftCode('${doc.id}')" class="icon-button" title="Delete code"><span class="sf-icon"></span></button>
                    </td>
                `;
                giftCodesTableBody.appendChild(row);
            });
        }, (error) => {
            console.error("Error fetching gift codes:", error);
            showToast("Error fetching gift codes: " + error.message, "error");
        });
    }

    // Initialize gift codes when Firebase is ready
    if (window.auth) {
        window.auth.onAuthStateChanged((user) => {
            if (user) {
                console.log("User authenticated, initializing gift codes");
                initializeGiftCodes();
            } else {
                console.log("User not authenticated");
            }
        });
    }
    
    // Try to initialize gift codes after a short delay to ensure Firebase is ready
    setTimeout(function() {
        console.log("Attempting to initialize gift codes after delay");
        if (typeof initializeGiftCodes === 'function') {
            initializeGiftCodes();
        } else {
            console.error("initializeGiftCodes function not found after delay");
        }
    }, 2000);

    // Function to copy gift code to clipboard
    window.copyGiftCode = function(code) {
        navigator.clipboard.writeText(code).then(() => {
            showToast(`Code "${code}" copied to clipboard`, "success");
        }).catch(err => {
            console.error('Failed to copy code: ', err);
            showToast("Failed to copy code to clipboard", "error");
        });
    };
}); 