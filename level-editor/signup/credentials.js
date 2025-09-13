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
    // User is signed up and signed in
    
    // Check for redirect parameter
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect');
    
    if (redirectUrl) {
      // Redirect to the specified URL
      window.location.href = redirectUrl;
    } else {
      // Default redirect to login page
      window.location.href = '../login/';
    }
  } else {
    // User is signed out
  }
});

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

// Export functions for use in HTML
window.firebaseAuth = {
  signUpWithEmail,
  signInWithGoogle,
  signInWithFacebook
};

