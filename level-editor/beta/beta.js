// Beta.js - Beta program registration script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // Get current user
    let currentUser = null;
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        if (user) {
            checkUserBetaStatus();
        }
    });

    // Check if user is already signed up for beta
    async function checkUserBetaStatus() {
        if (!currentUser) return;
        
        try {
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            if (userDoc.exists && userDoc.data().betas) {
                // User is already signed up for beta, show dashboard
                showDashboard();
                return;
            }
        } catch (error) {
            console.error('Error checking beta status:', error);
        }
        
        // Show first screen if not signed up
        showScreen(1);
    }

    // Screen transition functionality
    function showScreen(screenNumber) {
        // Hide all screens
        document.querySelectorAll('.screen_1, .screen_2, .screen_3, .screen_4').forEach(screen => {
            screen.style.display = 'none';
        });
        
        // Show target screen
        const targetScreen = document.querySelector(`.screen_${screenNumber}`);
        if (targetScreen) {
            targetScreen.style.display = 'block';
        }
        
        // Update dots
        updateDots(screenNumber);
    }

    // Update dot indicators
    function updateDots(activeStep) {
        document.querySelectorAll('.dot').forEach(dot => {
            dot.classList.remove('active');
        });
        
        const activeDot = document.querySelector(`.dot.step${activeStep}`);
        if (activeDot) {
            activeDot.classList.add('active');
            // Active dot always has 10x10px
            activeDot.style.width = '10px';
            activeDot.style.height = '10px';
        }
        
        // Apply specific sizing rules for non-active dots
        const step1Dot = document.querySelector('.dot.step1');
        const step2Dot = document.querySelector('.dot.step2');
        const step3Dot = document.querySelector('.dot.step3');
        const step4Dot = document.querySelector('.dot.step4');
        
        if (activeStep === 3) {
            if (step1Dot && !step1Dot.classList.contains('active')) {
                step1Dot.style.width = '8px';
                step1Dot.style.height = '8px';
            }
        } else if (activeStep === 4) {
            if (step1Dot && !step1Dot.classList.contains('active')) {
                step1Dot.style.width = '6px';
                step1Dot.style.height = '6px';
            }
            if (step2Dot && !step2Dot.classList.contains('active')) {
                step2Dot.style.width = '8px';
                step2Dot.style.height = '8px';
            }
            if (step3Dot && !step3Dot.classList.contains('active')) {
                step3Dot.style.width = '10px';
                step3Dot.style.height = '10px';
            }
        }
    }

    // Screen transition with animation
    function transitionToScreen(fromScreen, toScreen, isBackward = false) {
        const fromElement = document.querySelector(`.screen_${fromScreen}`);
        const toElement = document.querySelector(`.screen_${toScreen}`);
        
        if (!fromElement || !toElement) return;
        
        // Handle beta type selection before transitioning to screen 3
        if (toScreen === 3) {
            handleBetaTypeSelection();
        }
        
        // Calculate viewport width for transform
        const viewportWidth = window.innerWidth;
        
        // Set up transition styles
        fromElement.style.transition = 'all 0.3s ease';
        fromElement.style.transformOrigin = 'left';
        fromElement.style.transform = 'scaleX(1.3)';
        
        // Show target screen initially off-screen
        toElement.style.display = 'block';
        
        if (isBackward) {
            // For backward navigation, target screen starts from left side
            toElement.style.transform = `translateX(-${viewportWidth}px)`;
        } else {
            // For forward navigation, target screen starts from right side
            toElement.style.transform = `translateX(${viewportWidth}px)`;
        }
        
        toElement.style.transition = 'all 0.3s ease';
        
        // Start animation
        requestAnimationFrame(() => {
            if (isBackward) {
                // For backward navigation, current screen slides to right
                fromElement.style.transform = `scaleX(1.3) translateX(${viewportWidth}px)`;
            } else {
                // For forward navigation, current screen slides to left
                fromElement.style.transform = `scaleX(1.3) translateX(-${viewportWidth}px)`;
            }
            
            // Move target screen into view
            toElement.style.transform = 'translateX(0)';
        });
        
        // Clean up after transition
        setTimeout(() => {
            fromElement.style.display = 'none';
            fromElement.style.transform = '';
            fromElement.style.transition = '';
            fromElement.style.transformOrigin = '';
            
            toElement.style.transform = '';
            toElement.style.transition = '';
            
            // Reset scale for other screens
            document.querySelectorAll('.screen_1, .screen_2, .screen_3, .screen_4').forEach(screen => {
                if (screen !== toElement) {
                    screen.style.transform = '';
                }
            });
            
            // Update dot indicators
            updateDots(toScreen);
        }, 300);
    }

    // Show dashboard
    function showDashboard() {
        document.querySelectorAll('.screen_1, .screen_2, .screen_3, .screen_4').forEach(screen => {
            screen.style.display = 'none';
        });
        document.querySelector('.dashboard').style.display = 'block';
        
        // Hide page counter for signed up users
        const pageCounter = document.querySelector('.page-counter');
        if (pageCounter) {
            pageCounter.classList.add('hide');
        }
        
        // Set registration date
        const registeredDate = new Date().toLocaleDateString();
        const registeredElement = document.getElementById('registeredbeta');
        if (registeredElement) {
            registeredElement.textContent = registeredDate;
        }
    }

    // Handle beta type selection
    function handleBetaTypeSelection() {
        const pubBeta = document.getElementById('pubBeta');
        const devBeta = document.getElementById('devBeta');
        const publicBetaScreen = document.querySelector('.screen_public_beta');
        const devBetaScreen = document.querySelector('.screen_dev_beta');
        
        if (pubBeta && pubBeta.checked) {
            publicBetaScreen.style.display = 'block';
            devBetaScreen.style.display = 'none';
        } else if (devBeta && devBeta.checked) {
            publicBetaScreen.style.display = 'none';
            devBetaScreen.style.display = 'block';
        }
    }

    // Update button states based on checkbox status
    function updateButtonStates() {
        const tosCheckbox = document.getElementById('tos');
        const devtosCheckbox = document.getElementById('devtos');
        const getPubBetaBtn = document.getElementById('getpubbeta');
        const getDevBetaBtn = document.getElementById('getdevbeta');
        
        if (getPubBetaBtn && tosCheckbox) {
            getPubBetaBtn.disabled = !tosCheckbox.checked;
        }
        
        if (getDevBetaBtn && devtosCheckbox) {
            getDevBetaBtn.disabled = !devtosCheckbox.checked;
        }
    }

    // Handle beta registration
    async function registerBeta(betaType) {
        if (!currentUser) {
            console.error('User not authenticated');
            return;
        }
        
        try {
            const userRef = db.collection('users').doc(currentUser.uid);
            const userDoc = await userRef.get();
            
            let updateData = {
                badge: 'legendary'
            };
            
            if (userDoc.exists && userDoc.data().betas) {
                // User already has betas, add to existing array
                const existingBetas = userDoc.data().betas;
                if (!existingBetas.includes(betaType)) {
                    existingBetas.push(betaType);
                }
                updateData.betas = existingBetas;
            } else {
                // New beta registration
                updateData.betas = [betaType];
            }
            
            await userRef.set(updateData, { merge: true });
            
            // Transition to step 4
            transitionToScreen(3, 4);
            
        } catch (error) {
            console.error('Error registering beta:', error);
            alert('Error registering for beta. Please try again.');
        }
    }

    // Event listeners
    document.addEventListener('click', function(e) {
        // Handle next step buttons
        if (e.target.closest('.next-step')) {
            const button = e.target.closest('.next-step');
            const stepClass = Array.from(button.classList).find(cls => cls.startsWith('step'));
            
            if (stepClass) {
                const targetStep = stepClass.replace('step', '');
                const currentScreen = document.querySelector('.screen_1[style*="block"], .screen_2[style*="block"], .screen_3[style*="block"], .screen_4[style*="block"]');
                const currentScreenNum = currentScreen ? currentScreen.className.match(/screen_(\d)/)[1] : '1';
                
                // Handle beta type selection before transitioning to step 3
                if (targetStep === '3') {
                    handleBetaTypeSelection();
                }
                
                // Handle step 4 with spinner
                if (targetStep === '4') {
                    // Disable button to prevent multiple clicks
                    button.disabled = true;
                    
                    // Find and remove the span content
                    const span = button.querySelector('span');
                    if (span) {
                        span.style.display = 'none';
                    }
                    
                    // Add spinner
                    const spinner = document.createElement('spinner-load');
                    spinner.style.filter = 'invert(1)';
                    button.appendChild(spinner);
                    
                    // Wait 4 seconds then transition
                    setTimeout(() => {
                        transitionToScreen(parseInt(currentScreenNum), parseInt(targetStep));
                    }, 4000);
                } else {
                    transitionToScreen(parseInt(currentScreenNum), parseInt(targetStep));
                }
            }
        }
        
        // Handle back buttons
        if (e.target.closest('.back-btn')) {
            const currentScreen = document.querySelector('.screen_1[style*="block"], .screen_2[style*="block"], .screen_3[style*="block"], .screen_4[style*="block"]');
            const currentScreenNum = currentScreen ? currentScreen.className.match(/screen_(\d)/)[1] : '1';
            
            // Go to previous step
            const previousStep = Math.max(1, parseInt(currentScreenNum) - 1);
            
            transitionToScreen(parseInt(currentScreenNum), previousStep, true);
        }
        
        // Handle beta registration buttons
        if (e.target.closest('#getpubbeta')) {
            registerBeta('public');
        }
        
        if (e.target.closest('#getdevbeta')) {
            registerBeta('dev');
        }
        
        // Handle dashboard button
        if (e.target.closest('#opendashboard')) {
            showDashboard();
        }
    });

    // Handle radio button changes
    document.addEventListener('change', function(e) {
        if (e.target.id === 'pubBeta' || e.target.id === 'devBeta') {
            handleBetaTypeSelection();
        }
        
        // Handle checkbox changes for button states
        if (e.target.id === 'tos' || e.target.id === 'devtos') {
            updateButtonStates();
        }
    });

    // Handle leave beta functionality
    window.handleLeaveBeta = async function() {
        if (!currentUser) return;
        
        try {
            await db.collection('users').doc(currentUser.uid).update({
                betas: firebase.firestore.FieldValue.delete(),
                badge: firebase.firestore.FieldValue.delete()
            });
            
            // Close dialog and reload page
            document.querySelector('.leave-beta').removeAttribute('open');
            window.location.reload();
            
        } catch (error) {
            console.error('Error leaving beta:', error);
            alert('Error leaving beta program. Please try again.');
        }
    };

    // Initialize button states
    updateButtonStates();
});
