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
// No Storage needed - using base64 only

// Authentication state observer
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    loadUserProfile(user);
  } else {
    // User is signed out
    window.location.href = '../login/';
  }
});

// Check authentication status when page loads
document.addEventListener('DOMContentLoaded', function() {
  const user = auth.currentUser;
  if (user) {
    loadUserProfile(user);
  }
});

// Load user profile data
async function loadUserProfile(user) {
  try {
    // Try to get user data from Firestore
    try {
      const doc = await db.collection('users').doc(user.uid).get();
      
      if (doc.exists) {
        const userData = doc.data();
        updateProfileInterface(user, userData);
        return;
      }
    } catch (firestoreError) {
      // Firestore error, using auth data
    }
    
    // Fallback: Use auth user data if Firestore is unavailable
    const fallbackData = {
      email: user.email,
      username: user.displayName || 'User_' + Math.random().toString(36).substr(2, 5),
      displayName: user.displayName || 'User_' + Math.random().toString(36).substr(2, 5),
      photoURL: user.photoURL || null,
      badge: null // No badge in fallback data
    };
    
    updateProfileInterface(user, fallbackData);
    
    // Try to create Firestore document in background (don't wait for it)
    try {
      const userData = {
        email: user.email,
        username: user.displayName || 'User_' + Math.random().toString(36).substr(2, 5),
        displayName: user.displayName || 'User_' + Math.random().toString(36).substr(2, 5),
        photoURL: user.photoURL || null,
        badge: null, // Default badge value
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      db.collection('users').doc(user.uid).set(userData).then(() => {
        // Profile created successfully
      }).catch(err => {
        // Failed to create profile
      });
    } catch (error) {
      // Could not create profile
    }
    
  } catch (error) {
    console.error('Error loading user profile:', error);
  }
}

// Update profile interface
function updateProfileInterface(user, userData) {
  const avatarElement = document.getElementById('avatar');
  const nameElement = document.getElementById('name');
  const displayEmailElement = document.getElementById('displayEmail');
  const emailElement = document.getElementById('email');
  const usernameElement = document.getElementById('username');
  
  if (avatarElement) {
    let avatarSrc = user.photoURL || userData.photoURL || '../editor/avatar-generic.png';
    
    // Check if it's a base64 avatar stored in Firestore
    if (userData.avatarType === 'base64' && userData.photoURL) {
      avatarSrc = userData.photoURL;
    }
    
    avatarElement.src = avatarSrc;
    
    // Also update any other avatar elements on the page
    const allAvatarElements = document.querySelectorAll('img[src*="avatar"], .user_avt, #topAvatar');
    allAvatarElements.forEach(element => {
      if (element !== avatarElement) {
        element.src = avatarSrc;
      }
    });
  }
  
  if (nameElement) {
    const displayName = userData.username || user.displayName || 'User';
    const badgeElement = nameElement.querySelector('.badge');
    
    // If user has a badge, preserve the badge element
    if (userData.badge && badgeElement) {
      // Clear existing text nodes and add new text
      const textNodes = Array.from(nameElement.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
      textNodes.forEach(node => node.remove());
      nameElement.insertBefore(document.createTextNode(displayName), badgeElement);
    } else {
      // If no badge, destroy the badge element and set clean text content
      if (badgeElement) {
        badgeElement.remove();
      }
      nameElement.textContent = displayName;
    }
  }
  
  if (displayEmailElement) {
    displayEmailElement.textContent = user.email;
  }
  
  if (emailElement) {
    emailElement.textContent = user.email;
  }
  
  if (usernameElement) {
    const username = userData.username || 'Username not set';
    usernameElement.textContent = username;
  }
  
  // Check for badge and apply legendary class if needed
  if (userData.badge === 'legendary') {
    const badgeElements = document.querySelectorAll('.badge');
    badgeElements.forEach(badgeElement => {
      badgeElement.classList.add('legendary');
    });
  }
}

// Upload avatar with cropping - BASE64 ONLY (no Storage needed)
async function uploadAvatar(base64Image) {
  const user = auth.currentUser;
  if (!user) throw new Error('No user signed in');
  
  try {
    // Store base64 directly in Firestore (FREE plan friendly)
    await db.collection('users').doc(user.uid).update({
      photoURL: base64Image,
      avatarType: 'base64',
      avatarUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update interface with base64
    const avatarElement = document.getElementById('avatar');
    if (avatarElement) {
      avatarElement.src = base64Image;
    }
    
    // Also update any other avatar elements on the page
    const allAvatarElements = document.querySelectorAll('img[src*="avatar"], .user_avt, #topAvatar');
    allAvatarElements.forEach(element => {
      if (element !== avatarElement) {
        element.src = base64Image;
      }
    });
    
    return base64Image;
    
  } catch (error) {
    console.error('Error storing avatar in Firestore:', error);
    throw new Error('Could not save avatar');
  }
}

// Open image cropper
function openImageCropper(file) {
  const modal = document.getElementById('cropperModal');
  const canvas = document.getElementById('cropperCanvas');
  const cropBtn = document.getElementById('cropBtn');
  const cancelBtn = document.getElementById('cancelCropBtn');
  
  if (!modal || !canvas || !cropBtn || !cancelBtn) {
    console.error('Cropper elements not found');
    return;
  }
  
  const img = new Image();
  img.onload = function() {
    // Set canvas size
    const maxSize = 400;
    let { width, height } = img;
    
    if (width > height) {
      if (width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      }
    } else {
      if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw image on canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    
    // Show modal
    modal.style.display = 'block';
    
    // Setup crop functionality
    let isDrawing = false;
    let startX, startY, endX, endY;
    let cropRect = null;
    
    // Mouse events for cropping
    canvas.addEventListener('mousedown', function(e) {
      const rect = canvas.getBoundingClientRect();
      startX = e.clientX - rect.left;
      startY = e.clientY - rect.top;
      isDrawing = true;
    });
    
    canvas.addEventListener('mousemove', function(e) {
      if (!isDrawing) return;
      
      const rect = canvas.getBoundingClientRect();
      endX = e.clientX - rect.left;
      endY = e.clientY - rect.top;
      
      // Redraw image and crop rectangle
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      
      // Draw crop rectangle
      ctx.strokeStyle = '#007bff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(startX, startY, endX - startX, endY - startY);
      
      cropRect = {
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        width: Math.abs(endX - startX),
        height: Math.abs(endY - startY)
      };
    });
    
    canvas.addEventListener('mouseup', function() {
      isDrawing = false;
    });
    
    // Crop button
    cropBtn.onclick = async function() {
      if (!cropRect) {
        alert('Please select an area to crop');
        return;
      }
      
      try {
        // Create cropped canvas
        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');
        
        croppedCanvas.width = cropRect.width;
        croppedCanvas.height = cropRect.height;
        
        // Draw cropped portion
        croppedCtx.drawImage(
          canvas,
          cropRect.x, cropRect.y, cropRect.width, cropRect.height,
          0, 0, cropRect.width, cropRect.height
        );
        
        // Convert to base64
        const base64Image = croppedCanvas.toDataURL('image/jpeg', 0.8);
        
        // Upload avatar
        await uploadAvatar(base64Image);
        
        // Close modal
        modal.style.display = 'none';
        
        // Show success message
        alert('Avatar updated successfully!');
        
      } catch (error) {
        console.error('Error cropping and uploading:', error);
        alert('Error updating avatar. Please try again.');
      }
    };
    
    // Cancel button
    cancelBtn.onclick = function() {
      modal.style.display = 'none';
    };
  };
  
  img.src = URL.createObjectURL(file);
}

// Check if username is available
async function isUsernameAvailable(username) {
  try {
    const usersRef = db.collection('users');
    const query = await usersRef.where('username', '==', username).get();
    return query.empty; // true if username is available
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
}

// Change username
async function changeUsername(newUsername) {
  const user = auth.currentUser;
  if (!user) throw new Error('No user signed in');
  
  try {
    // Check if username is available
    const isAvailable = await isUsernameAvailable(newUsername);
    if (!isAvailable) {
      throw new Error('Username is already taken');
    }
    
    await db.collection('users').doc(user.uid).update({
      username: newUsername,
      displayName: newUsername
    });
    
    // Update interface
    const nameElement = document.getElementById('name');
    const usernameElement = document.getElementById('username');
    
    if (nameElement) nameElement.textContent = newUsername;
    if (usernameElement) usernameElement.textContent = newUsername;
    
    return true;
  } catch (error) {
    console.error('Error changing username:', error);
    throw error;
  }
}

// Change password
async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  if (!user) throw new Error('No user signed in');
  
  try {
    // Re-authenticate user before changing password
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
    await user.reauthenticateWithCredential(credential);
    
    // Change password
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

// Confirm account deletion
function confirmDeleteAccount() {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    if (confirm('This will permanently delete all your data. Are you absolutely sure?')) {
      firebaseAuth.deleteAccount()
        .then(() => {
          showMessage('Account deleted successfully', 'success');
          setTimeout(() => {
            window.location.href = '../login/';
          }, 2000);
        })
        .catch(error => {
          showMessage('Failed to delete account: ' + error.message, 'error');
        });
    }
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

// Export functions for use in HTML
window.firebaseAuth = {
  uploadAvatar,
  changeUsername,
  changePassword,
  deleteAccount,
  signOut,
  isUsernameAvailable
};

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Avatar click handler
  const avatarElement = document.getElementById('avatar');
  if (avatarElement) {
    avatarElement.addEventListener('click', openAvatarUpload);
  }
  
  // File input change handler
  const fileInput = document.getElementById('avatarInput');
  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        openImageCropper(file);
        // Reset file input
        fileInput.value = '';
      }
    });
  }
  
  // Username change handler - now handled by onclick in HTML
  // Password change handler - now handled by onclick in HTML
  
  // Delete account handler
  const deleteAccountBtn = document.getElementById('removeacc');
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', confirmDeleteAccount);
  }
  
  // Sign out handler
  const signOutBtn = document.getElementById('signout');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', signOut);
  }
});

// Open avatar upload dialog
function openAvatarUpload() {
  const fileInput = document.getElementById('avatarInput');
  if (fileInput) {
    fileInput.click();
  }
}

// Process and upload avatar directly
function openImageCropper(file) {
  const img = new Image();
  img.onload = function() {
    // Create canvas for processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size - make it square for avatar
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    
    // Calculate scaling to fit image in square
    const scale = Math.max(size / img.width, size / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    
    // Center the image
    const x = (size - scaledWidth) / 2;
    const y = (size - scaledHeight) / 2;
    
    // Draw image centered
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    
    // Convert to base64 and upload immediately
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);
    
    // Upload avatar
    firebaseAuth.uploadAvatar(base64Image)
      .then(() => {
        alert('Avatar updated successfully!');
      })
      .catch((error) => {
        console.error('Error uploading avatar:', error);
        alert('Error updating avatar. Please try again.');
      });
  };
  
  img.src = URL.createObjectURL(file);
}

// Open username change dialog
function openUsernameChange() {
  const currentUsername = document.getElementById('username').textContent;
  const newUsername = prompt('Enter new username:', currentUsername);
  
  if (newUsername && newUsername.trim() && newUsername !== currentUsername) {
    firebaseAuth.changeUsername(newUsername.trim())
      .then(() => {
        showMessage('Username changed successfully!', 'success');
      })
      .catch(error => {
        showMessage('Failed to change username: ' + error.message, 'error');
      });
  }
}

// Open password change dialog
function openPasswordChange() {
  const newPassword = prompt('Enter new password (min 6 characters):');
  
  if (newPassword && newPassword.length >= 6) {
    firebaseAuth.changePassword(newPassword)
      .then(() => {
        showMessage('Password changed successfully!', 'success');
      })
      .catch(error => {
        showMessage('Failed to change password: ' + error.message, 'error');
      });
  } else if (newPassword) {
    showMessage('Password must be at least 6 characters long', 'error');
  }
}

// Confirm account deletion
function confirmDeleteAccount() {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    if (confirm('This will permanently delete all your data. Are you absolutely sure?')) {
      firebaseAuth.deleteAccount()
        .then(() => {
          showMessage('Account deleted successfully', 'success');
          setTimeout(() => {
            window.location.href = '../login/';
          }, 2000);
        })
        .catch(error => {
          showMessage('Failed to delete account: ' + error.message, 'error');
        });
    }
  }
}

// Show message
function showMessage(message, type) {
  // Remove existing messages
  const existingMessage = document.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Create new message
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    z-index: 10001;
    max-width: 300px;
    word-wrap: break-word;
  `;
  
  if (type === 'error') {
    messageDiv.style.background = '#d32f2f';
  } else {
    messageDiv.style.background = '#388e3c';
  }
  
  messageDiv.textContent = message;
  
  document.body.appendChild(messageDiv);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 5000);
}

// Handle username change from dialog
function handleUsernameChange() {
  const newUsername = document.getElementById('usernamechanger').value.trim();
  if (newUsername) {
    firebaseAuth.changeUsername(newUsername)
      .then(() => {
        // Update the username display
        const usernameElement = document.getElementById('username');
        if (usernameElement) {
          usernameElement.textContent = newUsername;
        }
        
        // Close dialog
        document.querySelector('.username-changing').removeAttribute('open');
        
        // Clear input
        document.getElementById('usernamechanger').value = '';
        
        alert('Username changed successfully!');
      })
      .catch(error => {
        alert('Failed to change username: ' + error.message);
      });
  }
}

// Handle password change from dialog
function handlePasswordChange() {
  const currentPassword = document.getElementById('currentpw').value;
  const newPassword = document.getElementById('newpw').value;
  
  if (!currentPassword || !newPassword) {
    alert('Please fill in both password fields');
    return;
  }
  
  if (newPassword.length < 6) {
    alert('New password must be at least 6 characters');
    return;
  }
  
  firebaseAuth.changePassword(currentPassword, newPassword)
    .then(() => {
      // Close dialog
      document.querySelector('.change-pw').removeAttribute('open');
      
      // Clear inputs
      document.getElementById('currentpw').value = '';
      document.getElementById('newpw').value = '';
      
      alert('Password changed successfully!');
      })
      .catch(error => {
        alert('Failed to change password: ' + error.message);
      });
}

