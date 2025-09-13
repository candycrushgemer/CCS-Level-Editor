// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBEbBryhcs9qxHpi9oxCiW9jV5eTDZHP7M",
  authDomain: "ccs-level-editor.firebaseapp.com",
  projectId: "ccs-level-editor",
  storageBucket: "ccs-level-editor.firebasestorage.app",
  messagingSenderId: "10424890215",
  appId: "1:10424890215:web:e7bfc73e36785ef439f5c2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Authentication state observer
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    updateUserInterface(user);
    loadUserData(user);
  } else {
    // User is signed out
    updateUserInterface(null);
    // Redirect to login if not on login page
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
      window.location.href = '../login/';
    }
  }
});

// Update user interface based on authentication state
function updateUserInterface(user) {
  const signedInState = document.querySelector('.state.signed_in');
  const signedOutState = document.querySelector('.state.sign_in');
  
  if (user) {
    // User is signed in
    if (signedInState) signedInState.style.display = 'flex';
    if (signedOutState) signedOutState.style.display = 'none';
    
    // Update user info
    const nameElement = document.querySelector('#name');
    if (nameElement) {
      nameElement.textContent = user.displayName || user.email.split('@')[0] || 'User';
    }
    
    const emailElement = document.querySelector('#email');
    if (emailElement) {
      emailElement.textContent = user.email || '';
    }
    
    const avatarElement = document.querySelector('#avatar');
    if (avatarElement && user.photoURL) {
      avatarElement.src = user.photoURL;
    }
  } else {
    // User is signed out
    if (signedInState) signedInState.style.display = 'none';
    if (signedOutState) signedOutState.style.display = 'flex';
  }
}

// Load user data from Firestore
async function loadUserData(user) {
  try {
    const doc = await db.collection('users').doc(user.uid).get();
    if (doc.exists) {
      const userData = doc.data();
      
      // Update interface with additional user data
      const nameElement = document.querySelector('#name');
      if (nameElement && userData.username) {
        nameElement.textContent = userData.username;
      }
      
      // Update avatar with Firestore data
      const avatarElement = document.querySelector('#avatar');
      const topAvatarElement = document.querySelector('#topAvatar');
      
      if (avatarElement && userData.photoURL) {
        avatarElement.src = userData.photoURL;
      }
      
      if (topAvatarElement && userData.photoURL) {
        topAvatarElement.src = userData.photoURL;
      }
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

// Sign out
async function signOut() {
  try {
    await auth.signOut();
    window.location.href = '../login/';
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

// Get current user data
async function getCurrentUserData() {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const doc = await db.collection('users').doc(user.uid).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

// Update user profile
async function updateUserProfile(updates) {
  const user = auth.currentUser;
  if (!user) throw new Error('No user signed in');
  
  try {
    await db.collection('users').doc(user.uid).update(updates);
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

// Export functions for use in HTML
window.firebaseAuth = {
  signOut,
  getCurrentUserData,
  updateUserProfile
};

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Sign out button
  const signOutBtn = document.querySelector('.destructive');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', signOut);
  }
  
  // Manage account button
  const manageAccountBtn = document.querySelector('.md-filled-tonal-button');
  if (manageAccountBtn) {
    manageAccountBtn.addEventListener('click', function() {
      window.location.href = '../myaccount/';
    });
  }
  
  // Sign in button
  const signInBtn = document.querySelector('.state.sign_in .md-filled-tonal-button');
  if (signInBtn) {
    signInBtn.addEventListener('click', function() {
      window.location.href = '../login/';
    });
  }
});

