// ✅ Import Firebase modules (v10+)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendPasswordResetEmail, deleteUser, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// 🔥 Your Firebase Config (Replace with actual credentials)
const firebaseConfig = {
    apiKey: "AIzaSyBEbBryhcs9qxHpi9oxCiW9jV5eTDZHP7M",
    authDomain: "ccs-level-editor.firebaseapp.com",
    projectId: "ccs-level-editor",
    storageBucket: "ccs-level-editor.firebasestorage.app",
    messagingSenderId: "10424890215",
    appId: "1:10424890215:web:e7bfc73e36785ef439f5c2"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Utility function to clear error messages
function clearErrors() {
    if (document.getElementById("emailError")) {
        document.getElementById("emailError").innerText = "";
    }
    if (document.getElementById("usernameError")) {
        document.getElementById("usernameError").innerText = "";
    }
    if (document.getElementById("passwordError")) {
        document.getElementById("passwordError").innerText = "";
    }
}

function updateLoginState(isLoggedIn, userId = null) {
    localStorage.setItem("loggedIn", isLoggedIn ? "true" : "false");
    if (isLoggedIn && userId) {
        localStorage.setItem("userId", userId);
    } else {
        localStorage.removeItem("userId");
    }
}



// Signup Function
document.addEventListener("DOMContentLoaded", () => {
    // ✅ Initialize Firebase Auth & Firestore
    const auth = getAuth();
    const db = getFirestore(); 

    if (!auth || !db) {
        console.error("❌ Firebase did not load. Check SDK import in HTML.");
        return;
    }

    console.log("✅ Firebase Loaded Successfully!");

    document.getElementById("signup-form")?.addEventListener("submit", async (e) => { 
        e.preventDefault();
        clearErrors();

        const username = document.getElementById("signup-username").value.toLowerCase().trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value.trim();

        if (password.length < 6) {
            document.getElementById("passwordError").innerText = "Password must contain at least 6 characters.";
            return;
        }

        try {
            // 🔍 Check if username is already taken
            const usernameRef = doc(db, "usernames", username); // ✅ Correctly get a doc reference
            const usernameSnap = await getDoc(usernameRef);
            
            if (usernameSnap.exists()) {
                document.getElementById("usernameError").innerText = "Oops! This username has already been taken!";
                return;
            }

            // ✅ Create User Account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // ✅ Update Firebase Profile with Username
            await updateProfile(user, { displayName: username });

            // ✅ Store User Data in Firestore with 20 points
            await setDoc(doc(db, "users", user.uid), { 
                username, 
                email,
                points: 20 // 🎉 New users get 20 points
            });

            // ✅ Save Username in a Separate Collection for Availability Check
            await setDoc(usernameRef, { uid: user.uid });

            console.log("✅ Signup successful:", user.email);
            alert("Signup successful! Redirecting...");
            window.location.href = "login.html";

        } catch (error) {
            console.error("❌ Signup error:", error);

            if (error.code === "auth/email-already-in-use") {
                document.getElementById("emailError").innerText = "Email is already in use.";
            } else {
                alert(error.message);
            }
        }
    });
});

let currentUser = null; // ✅ Declare currentUser

async function checkAllUsers() {
    const usersRef = collection(db, "users");
    try {
        const querySnapshot = await getDocs(usersRef);
        console.log("🔥 All User IDs in Firestore:");
        querySnapshot.forEach((doc) => {
            console.log("User ID:", doc.id, "Data:", doc.data());
        });
    } catch (error) {
        console.error("❌ Firestore Query Error:", error);
    }
}
checkAllUsers();

async function displayUserPoints(userId) {
    console.log("🔥 Checking Firestore for user:", userId);

    if (!userId) {
        console.log("❌ userId is missing from localStorage!");
        return;
    }

    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log("✅ User data found:", userData);
            document.getElementById("pointsLeft").innerText = userData.points || 0;
        } else {
            console.log("⚠ No user data found in Firestore for this userId.");
        }
    } catch (error) {
        console.error("❌ Firestore Error:", error);
    }
}


// 🔥 Check stored userId
console.log("Stored userId:", localStorage.getItem("userId"));



function monitorExportField() {
    const exportField = document.getElementById("exportfield");
    if (!exportField) return;

    let hasExported = false;

    const observer = new MutationObserver(() => {
        if (exportField.textContent.trim() !== "" && !hasExported) {
            hasExported = true;
            deductPoint();
        }
    });

    observer.observe(exportField, { childList: true, subtree: true });
}


// 📌 Check if user is logged in
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("userId", user.uid);
            await displayUserPoints(user.uid);
            monitorExportField(); // Start monitoring #exportfield
        } else {
            localStorage.setItem("loggedIn", "false");
            localStorage.removeItem("userId");
            console.log("No user logged in.");
        }
    });
});

// 📌 Logout Function
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await signOut(auth);
    localStorage.setItem("loggedIn", "false");
    localStorage.removeItem("userId");
    window.location.href = "login.html";
});

// ✅ Login Function
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        updateLoginState(true, userCredential.user.uid); // ✅ Set login state
        alert("Login successful! Redirecting...");
        window.location.href = "index.html";
    } catch (error) {
        document.getElementById(error.code === "auth/user-not-found" ? "emailError" : "passwordError").innerText = 
            error.code === "auth/user-not-found"
            ? "No account is signed up with this email!"
            : "Password is incorrect!";
    }
});
// Google Login
document.getElementById("google-login")?.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        alert("Google Login Successful!");
        window.location.href = "index.html";
    } catch (error) {
        alert(error.message);
    }
});

// Logout
document.getElementById("logout-btn")?.addEventListener("click", async () => {
    await signOut(auth);
    alert("Logged out!");
    window.location.href = "login.html";
});

// Change Username
document.getElementById("change-username-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newUsername = document.getElementById("new-username").value;

    try {
        await updateProfile(auth.currentUser, { displayName: newUsername });
        await updateDoc(doc(db, "users", auth.currentUser.uid), { username: newUsername });
        alert("Username Updated!");
    } catch (error) {
        alert(error.message);
    }
});

// Change Password
document.getElementById("change-password-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        alert("⚠ No user is signed in. Please log in first.");
        return;
    }

    const newPassword = document.getElementById("new-password").value;
    if (newPassword.length < 6) {
        document.getElementById("passwordError").innerText = "Password must contain at least 6 characters.";
        return;
    }

    const currentPassword = prompt("🔒 For security, please enter your current password:");

    if (!currentPassword) {
        alert("⚠ Password update cancelled.");
        return;
    }

    try {
        // ✅ Re-authenticate the user
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        console.log("✅ Re-authentication successful!");

        // ✅ Update password
        await updatePassword(user, newPassword);
        alert("✅ Password Updated Successfully!");

    } catch (error) {
        console.error("❌ Error updating password:", error);
        alert(error.message);
    }
});


// Delete Account
document.getElementById("delete-account-btn")?.addEventListener("click", async () => {
    if (confirm("Are you sure? This action cannot be undone!")) {
        try {
            await deleteUser(auth.currentUser);
            alert("Account Deleted!");
            window.location.href = "signup.html";
        } catch (error) {
            alert(error.message);
        }
    }
});

// Show/Hide Password Toggle
document.getElementById("show-password")?.addEventListener("click", () => {
    const passwordFieldSignup = document.getElementById("signup-password");
    const passwordFieldLogin = document.getElementById("login-password");

    if (passwordFieldSignup?.type === "password" || passwordFieldLogin?.type === "password") {
        passwordFieldSignup && (passwordFieldSignup.type = "text");
        passwordFieldLogin && (passwordFieldLogin.type = "text");
        document.getElementById("show-password").innerText = "";
    } else {
        passwordFieldSignup && (passwordFieldSignup.type = "password");
        passwordFieldLogin && (passwordFieldLogin.type = "password");
        document.getElementById("show-password").innerText = "";
    }
});

// Avatar Upload and Cropping Functionality
function handleAvatarChange() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Create modal for cropping
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        // Create cropping container
        const container = document.createElement('div');
        container.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 10px;
            max-width: 90%;
            max-height: 90%;
        `;

        // Create image preview
        const img = document.createElement('img');
        img.style.cssText = `
            max-width: 100%;
            max-height: 70vh;
            object-fit: contain;
        `;

        // Create buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 10px;
            margin-top: 10px;
            justify-content: flex-end;
        `;

        const cropButton = document.createElement('button');
        cropButton.textContent = 'Crop & Save';
        cropButton.className = 'filled-button';

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.className = 'filled-button';
        cancelButton.style.backgroundColor = '#ff4444';

        // Add elements to DOM
        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(cropButton);
        container.appendChild(img);
        container.appendChild(buttonContainer);
        modal.appendChild(container);
        document.body.appendChild(modal);

        // Load image
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // Initialize cropper
        let cropper = null;
        img.onload = () => {
            cropper = new window.Cropper(img, {
                aspectRatio: 1,
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 1,
                restore: false,
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
            });
        };

        // Handle crop button click
        cropButton.onclick = async () => {
            if (!cropper) return;

            const canvas = cropper.getCroppedCanvas({
                width: 200,
                height: 200
            });

            try {
                const user = auth.currentUser;
                if (!user) throw new Error('No user logged in');

                // Show loading state
                cropButton.disabled = true;
                cropButton.textContent = 'Uploading...';

                // Convert canvas to base64 string
                const base64String = canvas.toDataURL('image/jpeg', 0.8);
                
                // Update user profile with base64 avatar
                await updateDoc(doc(db, 'users', user.uid), {
                    avatarURL: base64String,
                    avatarUpdatedAt: new Date().toISOString()
                });

                // Update avatar display
                const avatar = document.querySelector('fluent-avatar');
                if (avatar) {
                    avatar.style.setProperty('--avatar', `url(${base64String})`);
                }

                alert('Avatar updated successfully!');
                modal.remove();
            } catch (error) {
                console.error('Error updating avatar:', error);
                let errorMessage = 'Failed to update avatar. ';
                
                if (error.code === 'permission-denied') {
                    errorMessage += 'You are not authorized to update your profile.';
                } else {
                    errorMessage += error.message;
                }
                
                alert(errorMessage);
            } finally {
                // Reset button state
                cropButton.disabled = false;
                cropButton.textContent = 'Crop & Save';
            }
        };

        // Handle cancel button click
        cancelButton.onclick = () => {
            modal.remove();
        };
    };

    fileInput.click();
}

// Make the function available globally
window.handleAvatarChange = handleAvatarChange;



