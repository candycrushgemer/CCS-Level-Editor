import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, runTransaction, collection, increment } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBEbBryhcs9qxHpi9oxCiW9jV5eTDZHP7M",
    authDomain: "ccs-level-editor.firebaseapp.com",
    projectId: "ccs-level-editor",
    storageBucket: "ccs-level-editor.firebasestorage.app",
    messagingSenderId: "10424890215",
    appId: "1:10424890215:web:e7bfc73e36785ef439f5c2"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const pointsLeftElems = document.querySelectorAll("#pointsLeft");
const streakCountElems = document.querySelectorAll("#streakCount");
const accBtn = document.getElementById("accBtn");

// Function to update UI based on login state
async function updatePointsUI() {
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    const userId = localStorage.getItem("userId");

    if (isLoggedIn && userId) {
        // Fetch points from Firestore
        try {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                // Update all pointsLeft elements
                pointsLeftElems.forEach(elem => {
                    elem.innerText = userData.points || 0;
                });
                
                // Update all streakCount elements
                streakCountElems.forEach(elem => {
                    elem.innerText = userData.streak || 0;
                });
            } else {
                console.log("⚠ No user data found.");
            }
        } catch (error) {
            console.error("❌ Error fetching user points:", error);
        }

        // Update account button to redirect to dashboard
        accBtn.setAttribute("onclick", "window.location.href = 'account_dashboard.html'");
    } else {
        // Guest mode with default 5 points
        let guestPoints = localStorage.getItem("guestPoints");
        if (guestPoints === null) {
            guestPoints = 5;
            localStorage.setItem("guestPoints", guestPoints);
        }
        // Update all pointsLeft elements
        pointsLeftElems.forEach(elem => {
            elem.innerText = guestPoints;
        });
        
        // Guest mode with default 0 streak
        let guestStreak = localStorage.getItem("guestStreak") || 0;
        // Update all streakCount elements
        streakCountElems.forEach(elem => {
            elem.innerText = guestStreak;
        });

        // Update account button to redirect to login page
        accBtn.setAttribute("onclick", "window.location.href = 'login.html'");
    }
}

// 📌 Monitor `#exportfield` for changes
function monitorExportField() {
    const exportField = document.getElementById("exportfield");
    if (!exportField) return console.error("⚠ `#exportfield` not found.");

    console.log("👀 Watching #exportfield for changes...");

    let previousContent = "";
    let deductionDone = sessionStorage.getItem("deductionDone") === "true";

    if (deductionDone) {
        console.log("⚠ Deduction already done this session. Skipping...");
        return;
    }

    setInterval(() => {
        const currentContent = exportField.value.trim();

        if (currentContent !== previousContent && currentContent !== "") {
            console.log("✅ Detected change in #exportfield! Content:", currentContent);
            previousContent = currentContent;
            deductPoint();
        } else {
            console.log("🔄 No change in #exportfield...");
        }
    }, 1000); // Check every second
}

// 📌 Deduct points function (Runs once per page load)
async function deductPoint() {
    console.log("⚡ Deducting point...");
    if (sessionStorage.getItem("deductionDone") === "true") {
        console.log("⚠ Deduction already done this session. Aborting...");
        return;
    }

    const loggedIn = localStorage.getItem("loggedIn") === "true";
    console.log(`🔍 Login State: ${loggedIn ? "Logged In" : "Guest Mode"}`);

    // Get the first pointsLeft element to check current points
    const pointsDisplay = pointsLeftElems[0];
    let points = parseInt(pointsDisplay.innerText) || 0;
    console.log(`💰 Current Displayed Points: ${points}`);

    if (points <= 0) {
        console.warn("⚠ No points left to deduct.");
        updateUIOnPointsChange(0, loggedIn);
        return;
    }

    if (loggedIn) {
        const userId = localStorage.getItem("userId");
        if (!userId) return console.error("⚠ No userId found in localStorage.");

        console.log(`🔥 Fetching Firestore for user: ${userId}`);
        const userRef = doc(db, "users", userId);

        try {
            await runTransaction(db, async (transaction) => {
                console.log("🔄 Running Firestore transaction...");
                const userDoc = await transaction.get(userRef);

                if (!userDoc.exists()) {
                    console.error("❌ Firestore: User document not found!");
                    return;
                }

                let newPoints = Math.max(userDoc.data().points - 1, 0);
                console.log(`💸 Deducting 1 point from Firestore. New balance: ${newPoints}`);

                transaction.update(userRef, { points: newPoints });

                console.log("🔥 Firestore successfully updated!");
                // Update all pointsLeft elements
                pointsLeftElems.forEach(elem => {
                    elem.innerText = newPoints;
                });
                updateUIOnPointsChange(newPoints, loggedIn);
            });

            // ✅ Mark deduction as done (Prevents re-deduction in this session)
            sessionStorage.setItem("deductionDone", "true");
        } catch (error) {
            console.error("❌ Firestore Error:", error);
        }
    } else {
        let guestPoints = Math.max(parseInt(localStorage.getItem("guestPoints") || 5) - 1, 0);
        console.log(`💾 Guest Mode: Deducting 1 point. New balance: ${guestPoints}`);

        localStorage.setItem("guestPoints", guestPoints);
        // Update all pointsLeft elements
        pointsLeftElems.forEach(elem => {
            elem.innerText = guestPoints;
        });

        updateUIOnPointsChange(guestPoints, loggedIn);

        // ✅ Mark deduction as done (Prevents re-deduction in this session)
        sessionStorage.setItem("deductionDone", "true");
    }
}

// 📌 Update UI when points change
function updateUIOnPointsChange(points, loggedIn) {
    console.log(`🔄 Updating UI... Points: ${points}, Logged In: ${loggedIn}`);
    const noPointsDiv = document.getElementById("noPoints");
    const exportContent = document.getElementById("exportContent");
    const signInToContinue = document.getElementById("signintoContinue");

    if (points === 0) {
        console.warn("⚠ No points left, updating UI...");
        noPointsDiv.style.display = loggedIn ? "block" : "none";
        exportContent.style.display = "none";
        signInToContinue.style.display = loggedIn ? "none" : "block";
        console.log("✅ UI updated for 0 points.");
    } else {
        noPointsDiv.style.display = "none";
        exportContent.style.display = "block";
        signInToContinue.style.display = "none";
        console.log("✅ UI updated with new points.");
    }
}

// Function to calculate renewal date
function calculateRenewalDate(registeredDate, isYearly) {
    const date = new Date(registeredDate);
    if (isYearly) {
        date.setFullYear(date.getFullYear() + 1);
    } else {
        date.setMonth(date.getMonth() + 1);
    }
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Function to update subscription display
function updateSubscriptionDisplay(subscriptionData) {
    // Only proceed if we're on a page that has subscription display elements
    const subscriptionShow = document.getElementById('subscriptionShow');
    if (!subscriptionShow) {
        // This page doesn't have subscription display elements, which is fine
        return;
    }

    const subscriptionType = document.getElementById('subscriptionType');
    const subscriptionRenewalDate = document.getElementById('subscriptionRenewalDate');
    const subscriptionImage = document.getElementById('subscriptionImage');

    // Check if all required elements exist
    if (!subscriptionType || !subscriptionRenewalDate || !subscriptionImage) {
        console.warn('Some subscription display elements not found in the DOM');
        return;
    }

    if (!subscriptionData || !subscriptionData.subscription) {
        subscriptionShow.style.display = 'none';
        return;
    }

    subscriptionShow.style.display = 'flex';
    const subscription = subscriptionData.subscription;
    const registeredDate = subscriptionData.subscriptionRegisteredDate;

    // Set subscription type text and renewal date
    switch (subscription) {
        case 'BM':
            subscriptionType.textContent = 'Bronze Monthly';
            subscriptionRenewalDate.textContent = calculateRenewalDate(registeredDate, false);
            subscriptionImage.src = 'pricing/bronze.png';
            break;
        case 'BY':
            subscriptionType.textContent = 'Bronze Yearly';
            subscriptionRenewalDate.textContent = calculateRenewalDate(registeredDate, true);
            subscriptionImage.src = 'pricing/bronze.png';
            break;
        case 'SM':
            subscriptionType.textContent = 'Silver Monthly';
            subscriptionRenewalDate.textContent = calculateRenewalDate(registeredDate, false);
            subscriptionImage.src = 'pricing/silver.png';
            break;
        case 'SY':
            subscriptionType.textContent = 'Silver Yearly';
            subscriptionRenewalDate.textContent = calculateRenewalDate(registeredDate, true);
            subscriptionImage.src = 'pricing/silver.png';
            break;
        case 'GM':
            subscriptionType.textContent = 'Gold Monthly';
            subscriptionRenewalDate.textContent = calculateRenewalDate(registeredDate, false);
            subscriptionImage.src = 'pricing/golden.png';
            break;
        case 'GY':
            subscriptionType.textContent = 'Gold Yearly';
            subscriptionRenewalDate.textContent = calculateRenewalDate(registeredDate, true);
            subscriptionImage.src = 'pricing/golden.png';
            break;
        default:
            subscriptionShow.style.display = 'none';
    }
}

// Listen for auth state changes and update subscription display
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            updateSubscriptionDisplay(userData);
        } else {
            const subscriptionShow = document.getElementById('subscriptionShow');
            if (subscriptionShow) {
                subscriptionShow.style.display = 'none';
            }
        }
    } else {
        // User is signed out
        const subscriptionShow = document.getElementById('subscriptionShow');
        if (subscriptionShow) {
            subscriptionShow.style.display = 'none';
        }
    }
});

// Initialize script
document.addEventListener("DOMContentLoaded", () => {
    sessionStorage.setItem("deductionDone", "false");
    updatePointsUI();
    monitorExportField();
});

document.addEventListener("DOMContentLoaded", () => {
    console.log("📅 Daily lucky script loaded");

    const startLucky = document.getElementById("startLucky");
    const signinAlert = document.getElementById("signinAlert");
    const congratsLucky = document.getElementById("congratsLucky");
    const ohNoLucky = document.getElementById("ohNoLucky");
    const todayClaimed = document.getElementById("todayClaimed");
    const triggerTodayUnclaimed = document.getElementById("triggerTodayUnclaimed");
    const pointsLuckyStreak = document.getElementById("pointsLuckyStreak");

    const loggedIn = localStorage.getItem("loggedIn") === "true";
    const today = new Date().toDateString();
    const lastClaimed = localStorage.getItem("lastLuckyDate");
    const streak = parseInt(localStorage.getItem("luckyStreak")) || 0;

    console.log("🔐 Logged In:", loggedIn);
    console.log("📆 Today:", today);
    console.log("📌 Last Claimed:", lastClaimed);

    if (!loggedIn) {
        startLucky.style.display = "none";
        signinAlert.style.display = "block";
        return;
    } else {
        startLucky.style.display = "block";
        signinAlert.style.display = "none";
    }

    const isDevOverride = triggerTodayUnclaimed?.checked || triggerTodayUnclaimed?.hasAttribute("checked");
    console.log("🧪 Dev override:", isDevOverride);

    // Check if user missed a day
    if (lastClaimed) {
        const lastClaimedDate = new Date(lastClaimed);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate - lastClaimedDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // If more than 1 day has passed since last claim, reset streak
        if (diffDays > 1 && !isDevOverride) {
            console.log("⚠ Streak reset: More than 1 day since last claim");
            const user = auth.currentUser;
            if (user) {
                const userRef = doc(db, "users", user.uid);
                updateDoc(userRef, { 
                    streak: 0,
                    lastLuckyDate: null
                }).then(() => {
                    // Update UI elements
                    streakCountElems.forEach(elem => {
                        elem.innerText = "0";
                    });
                    localStorage.removeItem("lastLuckyDate");
                }).catch(error => {
                    console.error("Error resetting streak:", error);
                });
            }
        }
    }

    if (!isDevOverride && lastClaimed === today) {
        startLucky.style.pointerEvents = "none";
        startLucky.style.opacity = "0.5";
        if (todayClaimed) todayClaimed.style.display = "block";
        console.log("🚫 Already claimed today.");
        return;
    }

    startLucky.onclick = async () => {
        console.log("🎯 #startLucky clicked");

        const userCanClaim = isDevOverride || !lastClaimed || new Date(today).getTime() - new Date(lastClaimed).getTime() >= 172800000;
        console.log("✅ Can claim:", userCanClaim);

        if (userCanClaim) {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userRef = doc(db, "users", user.uid);
                    
                    // Get current user data
                    const userSnap = await getDoc(userRef);
                    if (!userSnap.exists()) {
                        console.warn("⚠ User document not found");
                        return;
                    }
                    
                    const userData = userSnap.data();
                    const currentStreak = userData.streak || 0;
                    const newStreak = currentStreak + 1;
                    
                    // Calculate bonus points based on streak level
                    let bonusPoints = 2; // Base points
                    
                    // Add bonus points based on streak milestones
                    if (newStreak >= 100) {
                        bonusPoints += 8; // 10 total points for 100+ day streak
                    } else if (newStreak >= 50) {
                        bonusPoints += 5; // 7 total points for 50+ day streak
                    } else if (newStreak >= 30) {
                        bonusPoints += 3; // 5 total points for 30+ day streak
                    } else if (newStreak >= 10) {
                        bonusPoints += 2; // 4 total points for 10+ day streak
                    } else if (newStreak >= 5) {
                        bonusPoints += 1; // 3 total points for 5+ day streak
                    }
                    
                    console.log(`🎁 Awarding ${bonusPoints} points for streak level ${newStreak}`);
                    
                    // Update points and streak in Firestore
                    await updateDoc(userRef, { 
                        points: increment(bonusPoints),
                        streak: newStreak,
                        lastLuckyDate: today
                    });
                    
                    console.log("✅ Firebase points and streak updated for user:", user.uid);
                    
                    // Update all pointsLeft elements after successful points update
                    const updatedUserSnap = await getDoc(userRef);
                    if (updatedUserSnap.exists()) {
                        const updatedUserData = updatedUserSnap.data();
                        pointsLeftElems.forEach(elem => {
                            elem.innerText = updatedUserData.points || 0;
                        });
                        
                        // Update all streakCount elements
                        streakCountElems.forEach(elem => {
                            elem.innerText = updatedUserData.streak || 0;
                        });
                        
                        // Update streak display in lucky message
                        if (pointsLuckyStreak) {
                            pointsLuckyStreak.textContent = `${updatedUserData.streak} days`;
                        }
                        
                        // Update the points display in the lucky message
                        const pointsLuckyElement = document.querySelector('.points-lucky');
                        if (pointsLuckyElement) {
                            pointsLuckyElement.textContent = bonusPoints;
                        }
                    }
                    
                    // Store last claimed date in localStorage for UI purposes
                    localStorage.setItem("lastLuckyDate", today);
                } else {
                    console.warn("⚠ No Firebase user detected");
                }
            } catch (e) {
                console.error("🔥 Firebase points update failed:", e);
            }

            if (congratsLucky) congratsLucky.style.display = "block";
            
            startLucky.style.userSelect = "none";
            startLucky.style.opacity = "0.5";
            startLucky.style.pointerEvents = "none";
            startLucky.textContent = "Coming soon!";
        } else {
            if (ohNoLucky) ohNoLucky.style.display = "block";
            console.log("😢 User cannot claim today");
        }
    };
});