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
    
    // Check for redirect parameter
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect');
    
    if (redirectUrl) {
      // Redirect to the specified URL
      window.location.href = redirectUrl;
    } else {
      // Default redirect to home page
      window.location.href = '/';
    }
  } else {
    // User is signed out
  }
});

// Sign in with email and password
async function signInWithEmail(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Update last login time in Firestore
    try {
      await db.collection('users').doc(user.uid).update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      // User profile not found, creating one...
      // If user profile doesn't exist, create one with a generated username
      const generatedUsername = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);
      await db.collection('users').doc(user.uid).set({
        email: user.email,
        username: generatedUsername,
        displayName: generatedUsername,
        photoURL: user.photoURL || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    
    return user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

// Sign up with email and password
async function signUpWithEmail(email, password, username) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    await db.collection('users').doc(user.uid).set({
      email: email,
      username: username,
      displayName: username,
      photoURL: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return user;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

// Sign in with Google
async function signInWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    
    if (result.additionalUserInfo.isNewUser) {
      // For new Google users, we need to get a username
      // Since this is a popup, we'll use displayName or generate a unique username
      let username = result.user.displayName;
      if (!username || username.trim() === '') {
        // Generate a unique username from email
        username = result.user.email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);
      }
      
      // Create user profile for new Google users
      await db.collection('users').doc(result.user.uid).set({
        email: result.user.email,
        username: username,
        displayName: result.user.displayName || username,
        photoURL: result.user.photoURL,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Update last login for existing users
      await db.collection('users').doc(result.user.uid).update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    
    return result.user;
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
}

// Sign in with Facebook
async function signInWithFacebook() {
  try {
    const provider = new firebase.auth.FacebookAuthProvider();
    const result = await auth.signInWithPopup(provider);
    
    if (result.additionalUserInfo.isNewUser) {
      // For new Facebook users, we need to get a username
      // Since this is a popup, we'll use displayName or generate a unique username
      let username = result.user.displayName;
      if (!username || username.trim() === '') {
        // Generate a unique username from email
        username = result.user.email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);
      }
      
      // Create user profile for new Facebook users
      await db.collection('users').doc(result.user.uid).set({
        email: result.user.email,
        username: username,
        displayName: result.user.displayName || username,
        photoURL: result.user.photoURL,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Update last login for existing users
      await db.collection('users').doc(result.user.uid).update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    
    return result.user;
  } catch (error) {
    console.error('Facebook sign in error:', error);
    throw error;
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

// Change password
async function changePassword(newPassword) {
  const user = auth.currentUser;
  if (!user) throw new Error('No user signed in');
  
  try {
    await user.updatePassword(newPassword);
    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}

// Delete account
async function deleteAccount() {
  const user = auth.currentUser;
  if (!user) throw new Error('No user signed in');
  
  try {
    // Delete user data from Firestore
    await db.collection('users').doc(user.uid).delete();
    
    // Delete user account
    await user.delete();
    
    return true;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}

// Upload avatar
async function uploadAvatar(base64Image) {
  const user = auth.currentUser;
  if (!user) throw new Error('No user signed in');
  
  try {
    // Convert base64 to blob
    const response = await fetch(base64Image);
    const blob = await response.blob();
    
    // Upload to Firebase Storage
    const storageRef = storage.ref();
    const avatarRef = storageRef.child(`avatars/${user.uid}.jpg`);
    await avatarRef.put(blob);
    
    // Get download URL
    const downloadURL = await avatarRef.getDownloadURL();
    
    // Update user profile
    await updateUserProfile({
      photoURL: downloadURL
    });
    
    // Update auth user profile
    await user.updateProfile({
      photoURL: downloadURL
    });
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}

// Export functions for use in HTML
window.firebaseAuth = {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInWithFacebook,
  signOut,
  getCurrentUserData,
  updateUserProfile,
  changePassword,
  deleteAccount,
  uploadAvatar
};

