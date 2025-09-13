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
    updateUserInterfaceAll(user);
    loadUserDataAll(user);
  } else {
    // User is signed out
    updateUserInterfaceAll(null);
    // Redirect to login if not on login page
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
      window.location.href = '../login/';
    }
  }
});

// Update all .state, #name, #email, #avatar elements based on authentication state
function updateUserInterfaceAll(user) {
  // Handle all .state.signed_in and .state.sign_in elements
  const signedInStates = document.querySelectorAll('.state.signed_in');
  const signedOutStates = document.querySelectorAll('.state.sign_in');

  if (user) {
    signedInStates.forEach(el => el.style.display = 'flex');
    signedOutStates.forEach(el => el.style.display = 'none');
    // Update all #name, #email, #avatar
    const nameElements = document.querySelectorAll('#name');
    nameElements.forEach(nameElement => {
      nameElement.textContent = user.displayName || (user.email ? user.email.split('@')[0] : 'User') || 'User';
    });
    const emailElements = document.querySelectorAll('#email');
    emailElements.forEach(emailElement => {
      emailElement.textContent = user.email || '';
    });
    const avatarElements = document.querySelectorAll('#avatar');
    avatarElements.forEach(avatarElement => {
      if (user.photoURL) avatarElement.src = user.photoURL;
    });
  } else {
    signedInStates.forEach(el => el.style.display = 'none');
    signedOutStates.forEach(el => el.style.display = 'flex');
  }
}

// Load user data from Firestore and update all #name, #avatar
async function loadUserDataAll(user) {
  try {
    const doc = await db.collection('users').doc(user.uid).get();
    if (doc.exists) {
      const userData = doc.data();

      // Update all #name if username exists
      if (userData.username) {
        const nameElements = document.querySelectorAll('#name');
        nameElements.forEach(nameElement => {
          nameElement.textContent = userData.username;
        });
      }

      // Update all #avatar and #topAvatar if photoURL exists
      if (userData.photoURL) {
        const avatarElements = document.querySelectorAll('#avatar');
        avatarElements.forEach(avatarElement => {
          avatarElement.src = userData.photoURL;
        });
        const topAvatarElements = document.querySelectorAll('#topAvatar');
        topAvatarElements.forEach(topAvatarElement => {
          topAvatarElement.src = userData.photoURL;
        });
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
  // Attach to all .state.sign_in .md-filled-tonal-button
  const signInBtns = document.querySelectorAll('.state.sign_in .md-filled-tonal-button');
  signInBtns.forEach(signInBtn => {
    signInBtn.addEventListener('click', function() {
      window.location.href = '../login/';
    });
  });
});
