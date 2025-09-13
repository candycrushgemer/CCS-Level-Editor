// Global User Display Functions
// This file provides functions to display user information anywhere on the site
// using data attributes and classes

// Global user data cache
let globalUserData = null;

// Initialize Firebase if not already done
function initializeFirebaseIfNeeded() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase not loaded. Make sure to include Firebase SDK before this file.');
        return false;
    }
    return true;
}

// Get current user data from Firebase
async function getCurrentUserData() {
    if (!initializeFirebaseIfNeeded()) return null;
    
    const user = firebase.auth().currentUser;
    if (!user) return null;
    
    try {
        // Get user data from Firestore
        const db = firebase.firestore();
        const doc = await db.collection('users').doc(user.uid).get();
        
        if (doc.exists) {
            const userData = doc.data();
            return {
                uid: user.uid,
                email: user.email,
                username: userData.username || user.displayName || user.email.split('@')[0],
                displayName: userData.displayName || user.displayName || user.email.split('@')[0],
                photoURL: userData.photoURL || user.photoURL || null,
                avatarType: userData.avatarType || null
            };
        } else {
            // Fallback to auth user data
            return {
                uid: user.uid,
                email: user.email,
                username: user.displayName || user.email.split('@')[0],
                displayName: user.displayName || user.email.split('@')[0],
                photoURL: user.photoURL || null,
                avatarType: null
            };
        }
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// Update all elements with user data attributes/classes
async function updateUserDisplayElements() {
    const userData = await getCurrentUserData();
    if (!userData) {
        // User not logged in, clear all user displays
        clearUserDisplayElements();
        return;
    }
    
    globalUserData = userData;
    
    // Update avatar elements
    updateAvatarElements(userData);
    
    // Update email elements
    updateEmailElements(userData);
    
    // Update username elements
    updateUsernameElements(userData);
}

// Update avatar elements
function updateAvatarElements(userData) {
    // Handle data-user-avatar attribute
    const avatarAttrElements = document.querySelectorAll('[data-user-avatar]');
    avatarAttrElements.forEach(element => {
        if (element.tagName === 'IMG') {
            element.src = userData.photoURL || '/level-editor/editor/avatar-generic.png';
        } else {
            element.style.backgroundImage = `url(${userData.photoURL || '/level-editor/editor/avatar-generic.png'})`;
        }
    });
    
    // Handle .data-user-avatar class
    const avatarClassElements = document.querySelectorAll('.data-user-avatar');
    avatarClassElements.forEach(element => {
        if (element.tagName === 'IMG') {
            element.src = userData.photoURL || '/level-editor/editor/avatar-generic.png';
        } else {
            element.style.backgroundImage = `url(${userData.photoURL || '/level-editor/editor/avatar-generic.png'})`;
        }
    });
}

// Update email elements
function updateEmailElements(userData) {
    // Handle data-user-email attribute
    const emailAttrElements = document.querySelectorAll('[data-user-email]');
    emailAttrElements.forEach(element => {
        element.textContent = userData.email || '';
    });
    
    // Handle .data-user-email class
    const emailClassElements = document.querySelectorAll('.data-user-email');
    emailClassElements.forEach(element => {
        element.textContent = userData.email || '';
    });
}

// Update username elements
function updateUsernameElements(userData) {
    // Handle data-user-username attribute
    const usernameAttrElements = document.querySelectorAll('[data-user-username]');
    usernameAttrElements.forEach(element => {
        element.textContent = userData.username || '';
    });
    
    // Handle .data-user-username class
    const usernameClassElements = document.querySelectorAll('.data-user-username');
    usernameClassElements.forEach(element => {
        element.textContent = userData.username || '';
    });
}

// Clear all user display elements (when user logs out)
function clearUserDisplayElements() {
    globalUserData = null;
    
    // Clear avatars
    const allAvatarElements = document.querySelectorAll('[data-user-avatar], .data-user-avatar');
    allAvatarElements.forEach(element => {
        if (element.tagName === 'IMG') {
            element.src = '/level-editor/editor/avatar-generic.png';
        } else {
            element.style.backgroundImage = `url(/level-editor/editor/avatar-generic.png)`;
        }
    });
    
    // Clear emails
    const allEmailElements = document.querySelectorAll('[data-user-email], .data-user-email');
    allEmailElements.forEach(element => {
        element.textContent = '';
    });
    
    // Clear usernames
    const allUsernameElements = document.querySelectorAll('[data-user-username], .data-user-username');
    allUsernameElements.forEach(element => {
        element.textContent = '';
    });
}

// Manual update function (can be called from other scripts)
function refreshUserDisplay() {
    updateUserDisplayElements();
}

// Get current user data (synchronous, returns cached data)
function getCurrentUserDataSync() {
    return globalUserData;
}

// Check if user is logged in
function isUserLoggedIn() {
    return globalUserData !== null;
}

// Initialize user display system
function initializeUserDisplay() {
    if (!initializeFirebaseIfNeeded()) return;
    
    // Set up Firebase auth state listener
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            // User is signed in
            await updateUserDisplayElements();
        } else {
            // User is signed out
            clearUserDisplayElements();
        }
    });
    
    // Initial update
    updateUserDisplayElements();
    
    // Set up periodic refresh (every 30 seconds)
    setInterval(() => {
        if (firebase.auth().currentUser) {
            updateUserDisplayElements();
        }
    }, 30000);
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUserDisplay);
} else {
    initializeUserDisplay();
}

// Export functions for global use
window.userDisplay = {
    update: updateUserDisplayElements,
    refresh: refreshUserDisplay,
    getData: getCurrentUserDataSync,
    isLoggedIn: isUserLoggedIn,
    initialize: initializeUserDisplay
};

// Also export individual functions for direct use
window.updateUserDisplay = updateUserDisplayElements;
window.refreshUserDisplay = refreshUserDisplay;
window.getCurrentUserData = getCurrentUserDataSync;
window.isUserLoggedIn = isUserLoggedIn; 