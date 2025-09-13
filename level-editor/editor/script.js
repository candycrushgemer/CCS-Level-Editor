// Global utility functions
function isMobile() {
    return window.innerWidth <= 860 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Manual save functionality only
let lastActionTime = Date.now();
let currentLevelName = '';
let currentLocation = 'local'; // 'local' or 'cloud'

// Save prompt system variables
let pendingNavigationAction = null;
let hasUnsavedChanges = false;
let isSavePromptActive = false;



// Function to show user-friendly messages
function showUserMessage(message, type = 'info') {
    console.log(`📢 USER MESSAGE (${type}):`, message);
    
    // Try to show message using MDUI snackbar if available
    const snackbar = document.querySelector('mdui-snackbar');
    if (snackbar) {
        snackbar.textContent = message;
        snackbar.open = true;
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            snackbar.open = false;
        }, 5000);
    } else {
        // Fallback to console and alert for now
        console.log('📢 Message for user:', message);
        if (type === 'error') {
            alert('Error: ' + message);
        } else if (type === 'warning') {
            alert('Warning: ' + message);
        } else {
            // For info messages, just log to console to avoid spam
            console.log('📢 Info: ' + message);
        }
    }
}

// Function to get URL parameters
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Function to load level on startup without auto-save
async function loadLevelOnStartup() {
    // Get level name and location from URL parameters
    currentLevelName = getURLParameter('lev') || 'Untitled';
    currentLocation = getURLParameter('lct') || 'local';
    
    console.log('Loading:', currentLevelName, 'last saved ons', currentLocation)
    // Show what we're trying to load
    if (currentLevelName !== 'Untitled') {
        showUserMessage(`Load level "${currentLevelName}"`, 'info');
        

    } else {
        showUserMessage('New level has started ', 'info');
    }
    
    // Try to load existing level if it exists
    if (currentLevelName !== 'Untitled') {
        console.log('Loading', currentLevelName);
        console.log('Level existent check in this device');
        
        // Check if the level actually exists in localStorage
        if (currentLocation === 'local') {
            const storedData = localStorage.getItem(currentLevelName);
            if (storedData) {
                const success = await loadLevel(currentLevelName, currentLocation);
                console.log('Level', success ? 'successfully loaded' : 'failed to load');
                
                if (success) {
                    showUserMessage(`Level "${currentLevelName}" loaded successfully, ready`, 'success');
                }
            } else {
                console.log('Level data load failed:', currentLevelName);
                
                // Show user-friendly message
                showUserMessage('Create your new level!', 'info');
            }
        } else {
            const success = await loadLevel(currentLevelName, currentLocation);
            console.log('Level', success ? 'successfully loaded' : 'failed to load');
        }
    } else {
        console.log('No level name provided, will use Untitled');
    }
    
    // Manual saves only via CTRL+S
}

// Auto-save function removed - manual saves only via CTRL+S

// Function to test localStorage functionality
function testLocalStorage() {
    console.log('Testing localStorage functionality...');
    
    try {
        // Test basic localStorage operations
        const testKey = 'test_localStorage_functionality';
        const testValue = 'test_value_' + Date.now();
        
        localStorage.setItem(testKey, testValue);
        const retrievedValue = localStorage.getItem(testKey);
        
        if (retrievedValue === testValue) {
            console.log('localStorage test passed');
        } else {
            console.error('localStorage test failed');
        }
        
        // Clean up test data
        localStorage.removeItem(testKey);
        
    } catch (error) {
        console.error('localStorage test error:', error);
    }
}

// Function to force save level (bypasses auto-save check)
function forceSaveLevel() {
    console.log('Trying to save level', currentLevelName);
    
    try {
        // Use exportLevelUI to generate the level code
        exportLevelUI();
        
        // Add a small delay to ensure the export field is populated
        setTimeout(() => {
            // Get the level code from the export field
            const exportField = document.getElementById("exportfield");

            
            if (exportField && exportField.value) {
                const levelJson = exportField.value;

                
                try {
                    // Add metadata to the level data
                    const levelData = JSON.parse(levelJson);
                    levelData.name = currentLevelName;
                    levelData.lastModified = new Date().toISOString();
                    levelData.location = currentLocation;
                    
                    // Add board size information
                    const boardTemplate = getURLParameter('boardTemplate');
                    if (boardTemplate === '15x15') {
                        levelData.boardSize = 15;
                    } else {
                        levelData.boardSize = 9;
                    }
                    
                    const finalLevelJson = JSON.stringify(levelData);

                    
                    if (currentLocation === 'local') {
                        // Save to localStorage
                        localStorage.setItem(currentLevelName, finalLevelJson);
                        console.log('Level saved to localStorage:', currentLevelName);
                        

                    } else {
                        // Save to user database (cloud)
                        saveToCloud(currentLevelName, finalLevelJson);
                    }
                    
                    // Update last action time
                    lastActionTime = Date.now();
                } catch (parseError) {
                    console.error('Error parsing level JSON:', parseError);
                }
                    } else {
            console.error('Get data from export field failed');
            
            // Fallback: Try direct export if export field method fails
            try {
                const levelData = exportLevel();

                
                // Add metadata to the level data
                levelData.name = currentLevelName;
                levelData.lastModified = new Date().toISOString();
                levelData.location = currentLocation;
                
                // Add board size information
                const boardTemplate = getURLParameter('boardTemplate');
                if (boardTemplate === '15x15') {
                    levelData.boardSize = 15;
                } else {
                    levelData.boardSize = 9;
                }
                
                const finalLevelJson = JSON.stringify(levelData);

                
                if (currentLocation === 'local') {
                    // Save to localStorage
                    localStorage.setItem(currentLevelName, finalLevelJson);
                    console.log('Level saved to this device', currentLevelName);
                    
                    
                } else {
                    // Save to user database (cloud)
                    saveToCloud(currentLevelName, finalLevelJson);
                }
                
                // Update last action time
                lastActionTime = Date.now();
                            } catch (fallbackError) {
                    console.error('Error in fallback method:', fallbackError);
                }
        }
        }, 100); // Small delay to ensure export field is populated
        
    } catch (error) {
        console.error('Error in forceSaveLevel:', error);
    }
}

// Auto-save function removed - now only manual saves via CTRL+S

// Function to save level to localStorage or database
function saveLevel() {
    console.log('Saving level');
    
    try {
        console.log('About to export level data');
        const levelData = exportLevel();
        
        // Add metadata to the level data
        levelData.name = currentLevelName;
        levelData.lastModified = new Date().toISOString();
        levelData.location = currentLocation;
        
        // Add board size information
        const boardTemplate = getURLParameter('boardTemplate');
        if (boardTemplate === '15x15') {
            levelData.boardSize = 15;
        } else {
            levelData.boardSize = 9;
        }
        
        const levelJson = JSON.stringify(levelData);
        
        if (currentLocation === 'local') {
            // Save to localStorage
            localStorage.setItem(currentLevelName, levelJson);
            console.log('Level saved to localStorage:', currentLevelName);
            
            // Show success message to user
            showUserMessage(`Level "${currentLevelName}" saved successfully`, 'success');
            
        } else {
            // Save to user database (cloud)
            saveToCloud(currentLevelName, levelJson);
        }
        
        // Update last action time
        lastActionTime = Date.now();
        
        // Mark as saved
        hasUnsavedChanges = false;
    } catch (error) {
        console.error('Save level error', error);
    }
}

// Function to save to cloud database
function saveToCloud(levelName, levelData) {
    // Check if user is authenticated
    if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
        const user = firebase.auth().currentUser;
        const db = firebase.firestore();
        

        
        db.collection('users').doc(user.uid).collection('levels').doc(levelName).set({
            name: levelName,
            data: levelData,
            lastModified: new Date(),
            location: 'cloud'
        }).then(() => {
            console.log('Saved and synced level', levelName);
        }).catch((error) => {
            console.error('Save level error to account', error);
            console.log('Temporarily saving to this device');
            
            // Fallback to localStorage if cloud save fails
            localStorage.setItem(levelName, levelData);
            console.log('Fallback: Level saved to this device', levelName);
        });
    } else {
        // User not authenticated, fallback to localStorage
        localStorage.setItem(levelName, levelData);
        console.log('User not authenticated, level saved to this device', levelName);
    }
}

// Function to load level from localStorage or database
async function loadLevel(levelName, location) {
    console.log('Loading level:', levelName, 'from:', location);
    
    try {
        let levelData;
        
        if (location === 'local') {
            // Load from localStorage
            const storedData = localStorage.getItem(levelName);
            
            if (storedData) {
                try {
                    levelData = JSON.parse(storedData);
                    
                    // Check if the level data has the required structure
                    if (!levelData.tileMap) {
                        console.error('Level data missing required tileMap property');
                        return false;
                    }
                } catch (parseError) {
                    console.error('Parse level data result', parseError);
                    return false;
                }
            } else {
                console.log('No data found in localStorage for:', levelName);
            }
        } else {
            // Load from cloud database
            showUserMessage(`Will load level ${levelName} from account`, 'info');
            levelData = await loadFromCloud(levelName);
        }
        
        if (levelData) {
            try {
                importLevel(levelData);
                if (location === 'cloud') {
                    showUserMessage(`Level "${levelName}" loaded successfully from cloud`, 'success');
                }
                return true;
            } catch (importError) {
                console.error('Open level result:', importError);
                if (location === 'cloud') {
                    showUserMessage(`Can not open "${levelName}" from cloud.`, 'error');
                }
                return false;
            }
        } else {
            if (location === 'cloud') {
                showUserMessage(`No level data found for "${levelName}" in cloud.`, 'warning');
            }
        }
    } catch (error) {
        console.error('Error in loadLevel:', error);
    }
    return false;
}

// Function to load from cloud database
async function loadFromCloud(levelName) {
    try {
        // Check if Firebase is available and user is authenticated
        if (typeof firebase === 'undefined') {
            showUserMessage('Account Database is not ready!', 'error');
            return null;
        }
        
        // Check if Firebase auth is available
        if (!firebase.auth) {
            showUserMessage('Account Database is not ready!', 'error');
            return null;
        }
        
        // Wait for Firebase auth to be ready
        let currentUser = firebase.auth().currentUser;
        
        if (!currentUser) {
            // Wait for auth state to be ready
            await new Promise((resolve, reject) => {
                const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                    unsubscribe(); // Stop listening after first change
                    if (user) {
                        currentUser = user;
                        resolve();
                    } else {
                        reject(new Error('Authentication failed'));
                    }
                });
                
                // Timeout after 5 seconds
                setTimeout(() => {
                    unsubscribe();
                    reject(new Error('Auth state timeout'));
                }, 5000);
            });
        }
        
        // Check if Firestore is available
        if (!firebase.firestore) {
            showUserMessage('Account Database is not ready!', 'error');
            return null;
        }
        
        const db = firebase.firestore();
        
        // Fetch the level document from Firestore
        const levelDoc = await db.collection('users').doc(currentUser.uid).collection('levels').doc(levelName).get();
        
        if (levelDoc.exists) {
            const levelData = levelDoc.data();
            
            // The level data is stored in the 'data' field as a JSON string
            if (levelData.data) {
                try {
                    const parsedLevelData = JSON.parse(levelData.data);
                    
                    // Verify the level data has required properties
                    if (!parsedLevelData.tileMap) {
                        showUserMessage('Corrupted data found, load level failed', 'error');
                        return null;
                    }
                    
                    return parsedLevelData;
                } catch (parseError) {
                    showUserMessage('Failed to parse level data from cloud.', 'error');
                    return null;
                }
            } else {
                showUserMessage('Level data structure is invalid.', 'error');
                return null;
            }
        } else {
            showUserMessage(`Level "${levelName}" not found in cloud database.`, 'warning');
            return null;
        }
        
    } catch (error) {
        showUserMessage('Failed to load level from cloud: ' + error.message, 'error');
        return null;
    }
}

// Function to go back to the app page
function goBackToApp() {
    // Get current level info for the recents table
    const levelName = currentLevelName || 'Untitled';
    const location = currentLocation || 'local';
    
    console.log('Going back to app');
    
    // Auto-save removed - manual saves only via CTRL+S
    
    // Redirect back to app with level info
    const redirectUrl = `../app?newLevel=${encodeURIComponent(levelName)}&newLevelLocation=${location}`;
    window.location.href = redirectUrl;
}

// Quick save function - saves and shows toaster notification
function quickSave() {
    try {
        saveLevel();
        showSaveSuccess();
        
        // Hide toaster after 2 seconds and set close attribute
        setTimeout(() => {
            const toasterWrapper = document.querySelector('.toaster-wrapper');
            if (toasterWrapper) {
                toasterWrapper.removeAttribute('open');
                toasterWrapper.setAttribute('close', '');
            }
        }, 2000);
    } catch (error) {
        console.error('Quick save failed:', error);
        showUserMessage('Quick save failed, please try again', 'error');
    }
}

// Function to show the export dialog
function showExportDialog() {
    try {
        // First generate the level data
        exportLevelUI();
        
        // Then show the forge-dialog export dialog
        const exportDialog = document.querySelector('.export-dialog');
        if (exportDialog) {
            exportDialog.setAttribute('open', '');
            console.log('Export dialog opened');
        } else {
            console.warn('Export dialog not found');
        }
    } catch (error) {
        console.error('Error showing export dialog:', error);
        alert('Failed to show export dialog, please try again later');
    }
}

// Override the original exportLevelUI function
function exportLevelUI() {
    try {
        let level = exportLevel();
        
        // Set the level code in the export field
        const exportField = document.getElementById("exportfield");
        if (exportField) {
            exportField.value = JSON.stringify(level);
        } else {
            console.warn('Export field not found');
        }
        
        // Don't show the export dialog - just generate the data
        // The dialog will be shown only when explicitly requested
        console.log('Level data generated successfully');
    } catch (error) {
        console.error('Level code generation result: ', error);
        alert('Export level failed, please try again later');
    } 
}

// Pinch-to-zoom functionality for both touch devices and touchpads
let initialDistance = 0;
let initialScale = 1.0;
let isPinching = false;
let isTouchpadPinching = false;

function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function getDistanceFromWheel(e) {
    // For touchpad pinch, we'll use the wheel delta to simulate pinch
    // Positive deltaY means zoom out, negative means zoom in
    return e.deltaY;
}

function handleTouchStart(e) {
    if (e.touches.length === 2) {
        isPinching = true;
        initialDistance = getDistance(e.touches[0], e.touches[1]);
        initialScale = window.scale || 1.0;
        e.preventDefault();
    }
}

function handleTouchMove(e) {
    if (isPinching && e.touches.length === 2) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scaleFactor = currentDistance / initialDistance;
        const newScale = initialScale * scaleFactor;
        
        applyScale(newScale);
        e.preventDefault();
    }
}

function handleTouchEnd(e) {
    if (e.touches.length < 2) {
        isPinching = false;
    }
}

// Handle touchpad pinch gestures using wheel events
function handleWheel(e) {
    // Check if this is a pinch gesture (ctrlKey indicates pinch on most touchpads)
    if (e.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
        
        // Get the current scale
        const currentScale = window.scale || 1.0;
        
        // Calculate zoom factor based on wheel delta
        // Positive deltaY means scroll down (zoom out), negative means scroll up (zoom in)
        const zoomSensitivity = 0.002; // Increased sensitivity for faster zooming
        const zoomFactor = 1 - (e.deltaY * zoomSensitivity);
        
        // Apply the zoom
        const newScale = currentScale * zoomFactor;
        applyScale(newScale);
        
        return false; // Prevent default behavior
    }
}



// Alternative method: detect touchpad gestures by deltaMode
function handleWheelAlternative(e) {
    // Some touchpads use deltaMode === 1 (pixel-based) for pinch gestures
    if (e.deltaMode === 1 && Math.abs(e.deltaY) > 5) {
        e.preventDefault();
        e.stopPropagation();
        
        const currentScale = window.scale || 1.0;
        const zoomSensitivity = 0.05; // Increased sensitivity for faster zooming with pixel-based deltas
        const zoomFactor = 1 - (e.deltaY * zoomSensitivity);
        const newScale = currentScale * zoomFactor;
        
        applyScale(newScale);
        
        return false;
    }
}













function updateTileVisualDirect(tile) {
    // Directly update the visual representation of a single tile
    // Use a safer approach that avoids image loading errors
    const normal = tile.getAttribute('normal');
    const tileType = tile.getAttribute('tile');
    const conveyor = tile.getAttribute('conveyor');
    const portal = tile.getAttribute('portal');
    const portalExit = tile.getAttribute('portalExit');
    const ingredient = tile.getAttribute('ingredient');
    const requirement = tile.getAttribute('requirement');
    const mixer = tile.getAttribute('mixer');
    const cake = tile.getAttribute('cake');
    const cobra = tile.getAttribute('cobra');
    const cobraBasket = tile.getAttribute('cobraBasket');
    
    // Debug: check what elementsFolder contains
    console.log('elementsFolder:', elementsFolder);
    console.log('elements_ids available:', typeof elements_ids !== 'undefined' ? Object.keys(elements_ids).slice(0, 10) : 'undefined');
    
    try {
        // Update tile background
        if (tileType) {
            const tileImg = tile.querySelector('.tile');
            if (tileImg) {
                if (tileType === '000') {
                    tileImg.src = '';
                } else {
                    tileImg.src = 'elements/grid.png';
                }
            }
        }
        
        // Update normal element - use safer approach
        if (normal) {
            const normalImg = tile.querySelector('.normal');
            if (normalImg) {
                if (normal === '002') {
                    normalImg.src = 'elements/random.png';
                    normalImg.classList.add('small');
                } else if (normal !== 'temp' && normal !== '002') {
                    // Try to get the element name safely
                    let elementName = '';
                    try {
                        elementName = elements_ids[normal];
                        console.log('Loading element:', normal, '->', elementName, '->', 'elements/' + elementName + '.png');
                    } catch (e) {
                        console.warn('Could not find element name for ID:', normal);
                        elementName = normal; // fallback to ID
                    }
                    
                    if (elementName) {
                        normalImg.src = 'elements/' + elementName + '.png';
                        normalImg.classList.remove('small');
                    }
                }
            }
        }
        
        // Update conveyor belt
        if (conveyor) {
            const conveyorImg = tile.querySelector('.conveyor');
            if (conveyorImg) {
                conveyorImg.src = 'elements/' + conveyor + '.png';
            }
        } else {
            // Clear conveyor if not present
            const conveyorImg = tile.querySelector('.conveyor');
            if (conveyorImg) {
                conveyorImg.src = '';
            }
        }
        
        // Update portal
        if (portal) {
            const portalImg = tile.querySelector('.portal_entrance');
            if (portalImg) {
                portalImg.src = 'elements/portal_entrance.png';
            }
        } else {
            const portalImg = tile.querySelector('.portal_entrance');
            if (portalImg) {
                portalImg.src = '';
            }
        }
        
        if (portalExit) {
            const portalImg = tile.querySelector('.portal_exit');
            if (portalImg) {
                portalImg.src = 'elements/portal_exit.png';
            }
        } else {
            const portalImg = tile.querySelector('.portal_exit');
            if (portalImg) {
                portalImg.src = '';
            }
        }
        
        // Update ingredient
        if (ingredient) {
            const ingredientImg = tile.querySelector('.ingredient');
            if (ingredientImg) {
                ingredientImg.src = 'elements/candy_entrance.png';
            }
        } else {
            const ingredientImg = tile.querySelector('.ingredient');
            if (ingredientImg) {
                ingredientImg.src = '';
            }
        }
        
        // Update requirement
        if (requirement) {
            const requirementImg = tile.querySelector('.requirement');
            if (requirementImg) {
                requirementImg.src = 'elements/candy_entrance.png';
            }
        } else {
            const requirementImg = tile.querySelector('.requirement');
            if (requirementImg) {
                requirementImg.src = '';
            }
        }
        
        // Update mixer
        if (mixer) {
            const mixerImg = tile.querySelector('.mixer');
            if (mixerImg) {
                mixerImg.src = 'elements/magic_mixer.png';
            }
        } else {
            const mixerImg = tile.querySelector('.mixer');
            if (mixerImg) {
                mixerImg.src = '';
            }
        }
        
        // Update cake
        if (cake) {
            const normalImg = tile.querySelector('.normal');
            if (normalImg) {
                if (cake === '1') {
                                            normalImg.src = 'elements/cake_top_left.png';
                } else if (cake === '2') {
                    normalImg.src = 'elements/cake_top_right.png';
                } else if (cake === '3') {
                    normalImg.src = elementsFolder + 'cake_bottom_left.png';
                } else if (cake === '4') {
                    normalImg.src = elementsFolder + 'cake_bottom_right.png';
                }
            }
        }
        
        // Update cobra
        if (cobra) {
            const normalImg = tile.querySelector('.normal');
            if (normalImg) {
                normalImg.src = elementsFolder + 'frog.png';
            }
        }
        
        // Update cobra basket
        if (cobraBasket) {
            const basketImg = tile.querySelector('.cobra_basket');
            if (basketImg) {
                basketImg.src = elementsFolder + 'cobra_basket.png';
            }
        } else {
            const basketImg = tile.querySelector('.cobra_basket');
            if (basketImg) {
                basketImg.src = '';
            }
        }
    } catch (error) {
        console.warn('Error updating tile visual:', error);
        // Fallback: just clear the tile if there's an error
        const images = tile.querySelectorAll('img');
        images.forEach(img => {
            if (!img.classList.contains('selectimg')) {
                img.src = '';
            }
        });
    }
}

function updateTileVisual(tile) {
    // This function is intentionally minimal to avoid interfering with existing tile structure
    // The undo/redo system now just restores the attributes and lets the existing
    // tile update system handle the visual representation
    
    // For now, we'll just ensure the tile has the basic structure
    // The visual updates will happen through the existing tile system
}

function getColorValue(color) {
    // Map color names to hex values
    const colorMap = {
        'red': '#ff0000',
        'blue': '#0000ff',
        'green': '#00ff00',
        'yellow': '#ffff00',
        'orange': '#ff8000',
        'purple': '#8000ff'
    };
    return colorMap[color] || color;
}

// Unified function to apply scale changes
function applyScale(newScale) {
    // Use the existing setScale function to maintain consistency
    if (typeof setScale === 'function') {
        setScale(newScale);
    } else {
        // Fallback if setScale is not available - use hardcoded limits
        const limits = { min: 0.3, max: 2.0 };
        const clampedScale = Math.min(Math.max(newScale, limits.min), limits.max);
        window.scale = clampedScale;
        
        const verticalCenter = document.querySelector('.vertical-center');
        if (verticalCenter) {
            const currentTransform = verticalCenter.style.transform;
            const translateMatch = currentTransform.match(/translate\(([^)]+)\)/);
            let translateX = 0, translateY = 0;
            
            if (translateMatch) {
                const translateValues = translateMatch[1].split(',');
                translateX = parseInt(translateValues[0]) || 0;
                translateY = parseInt(translateValues[1]) || 0;
            }
            
            verticalCenter.style.transform = `translate(${translateX}px, ${translateY}px) scale(${clampedScale})`;
        }
    }
}

// Add pinch-to-zoom event listeners when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    const verticalCenter = document.querySelector('.vertical-center');
    if (verticalCenter) {
        // Touch events for mobile devices
        verticalCenter.addEventListener('touchstart', handleTouchStart, { passive: false });
        verticalCenter.addEventListener('touchmove', handleTouchMove, { passive: false });
        verticalCenter.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        // Wheel events for touchpad pinch gestures
        verticalCenter.addEventListener('wheel', handleWheel, { passive: false });
        verticalCenter.addEventListener('wheel', handleWheelAlternative, { passive: false });
        
        // Also listen on the document for wheel events to catch touchpad gestures
        document.addEventListener('wheel', handleWheel, { passive: false });
        document.addEventListener('wheel', handleWheelAlternative, { passive: false });
    }
});

// Alternative initialization for cases where DOMContentLoaded might not fire
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // This will be handled by the above listener
    });
} else {
    const verticalCenter = document.querySelector('.vertical-center');
    if (verticalCenter) {
        verticalCenter.addEventListener('wheel', handleWheel, { passive: false });
        verticalCenter.addEventListener('wheel', handleWheelAlternative, { passive: false });
        document.addEventListener('wheel', handleWheel, { passive: false });
        document.addEventListener('wheel', handleWheelAlternative, { passive: false });
    }
}


/* define ccs board elements */


const colors = { "002": "random", "055": "red", "056": "yellow", "057": "blue", "058": "green", "059": "orange", "060": "purple" }
const coloredCandy = { "002": "random", "018": "pepper_candy", "036": "frog", "045": "striped_horizontal", "046": "striped_vertical", "047": "wrapped", "049": "jellyfish", "051": "key", "052": "lucky", "032": "mystery", "033": "chameleon", "050": "extra_time_and_moves", "091": "jellyfish_striped", "092": "jellyfish_wrapped", "093": "jellyfish_colorbomb" }
const candy = { "044": "bomb", "043": "coconut_wheel", "061": "ufo" }
const sugarCoats = { "134": "sugarcoat_1", "135": "sugarcoat_2", "136": "sugarcoat_3" }
const locks = { "008": "licorice", "025": "marmalade", "038": "mulock1", "039": "mulock2", "040": "mulock3", "041": "mulock4", "042": "mulock5" }
const glass = { "122": "glass_tile_1", "123": "glass_tile_2", "124": "glass_tile_3", }
const blockers = { "007": "block_frosting", "053": "chocolate_frog", "009": "chocolate", "017": "licorice_square", "019": "block_multi_frosting1", "020": "block_multi_frosting2", "021": "block_multi_frosting3", "022": "block_multi_frosting4", "023": "block_multi_frosting5", "024": "chocolate_spawner", "035": "cake_bomb", "054": "shell_1", "062": "magic_mixer", "066": "bobber", "079": "block_waffle1", "080": "block_waffle2", "081": "block_waffle3", "082": "block_waffle4", "083": "block_waffle5", "094": "dark_chocolate_1", "095": "dark_chocolate_2", "096": "dark_chocolate_3", "097": "dark_chocolate_4", "098": "dark_chocolate_5", "129": "chain_layer1_c", "130": "chain_layer2_c", "131": "chain_layer3_c", "132": "chain_layer4_c", "133": "chain_layer5_c", "157": "shell_3", "158": "shell_2", "159": "bubble_pop_1", "160": "bubble_pop_2", "161": "bubble_pop_3", "162": "bubble_pop_4", "163": "bubble_pop_5", "211": "dark_chocolate_spawner_1", "212": "dark_chocolate_spawner_2", "213": "dark_chocolate_spawner_3", "220": "jelly_jar_1", "221": "jelly_jar_2", "037": "toffee_tornado", "070": "pinata", "073": "pinata_crash", "074": "pinata_link1", "075": "pinata_link2", "076": "pinata_link3", "077": "pinata_unbreakable", "078": "pinata_empty", "156": "rainbow_rapid_mold", "222": "cobra_5", "223": "cobra_4", "224": "cobra_3", "225": "cobra_2", "226": "cobra_1", "227": "cobra_basket", "228": "wonderful_base", "229": "gumball_machine_empty", "230": "mallomatic", "231": "gumball_machine", "232": "sprinks_nest" }
const bonbon = { "182": "bonbon_colorbomb_1", "183": "bonbon_colorbomb_2", "184": "bonbon_colorbomb_3", "185": "bonbon_colorbomb_4", "186": "bonbon_horizontal_1", "187": 'bonbon_horizontal_2', "188": "bonbon_horizontal_3", "189": "bonbon_horizontal_4", "190": "bonbon_vertical_1", "191": "bonbon_vertical_2", "192": "bonbon_vertical_3", "193": "bonbon_vertical_4", "194": "bonbon_fish_1", "195": "bonbon_fish_2", "196": "bonbon_fish_3", "197": "bonbon_fish_4", "198": "bonbon_wrapped_1", "199": "bonbon_wrapped_2", "200": "bonbon_wrapped_3", "201": "bonbon_wrapped_4" }
const tiles = { "empty": "empty", "000": "none", "001": "grid", "003": "jelly", "004": "jelly2", "064": "blue_tile", "065": "black_tile" }
const ingredients = { "125": "sprinks" }
const walldown = { "087": "wall_down", "165": "licorice_wall_down", "110": "destructible_wall_1_down", "114": "destructible_wall_2_down", "118": "destructible_wall_3_down", "169": "destructible_wall_lic_1_down", "173": "destructible_wall_lic_2_down", "177": "destructible_wall_lic_3_down" }
const wallup = { "086": "wall_up", "164": "licorice_wall_up", "109": "destructible_wall_1_up", "113": "destructible_wall_2_up", "117": "destructible_wall_3_up", "168": "destructible_wall_lic_1_up", "172": "destructible_wall_lic_2_up", "176": "destructible_wall_lic_3_up" }
const wallright = { "089": "wall_right", "167": "licorice_wall_right", "112": "destructible_wall_1_right", "116": "destructible_wall_2_right", "120": "destructible_wall_3_right", "171": "destructible_wall_lic_1_right", "175": "destructible_wall_lic_2_right", "179": "destructible_wall_lic_3_right" }
const wallleft = { "088": "wall_left", "166": "licorice_wall_left", "111": "destructible_wall_1_left", "115": "destructible_wall_2_left", "119": "destructible_wall_3_left", "170": "destructible_wall_lic_1_left", "174": "destructible_wall_lic_2_left", "178": "destructible_wall_lic_3_left" }
const rainbowcannontop = { "152": "rainbow_rapid_cannon_top" }
const rainbowcannonbottom = { "153": "rainbow_rapid_cannon_bottom" }
const rainbowcannonleft = { "154": "rainbow_rapid_cannon_left" }
const rainbowcannonright = { "155": "rainbow_rapid_cannon_right" }
const cannons = { "027": "cannon_ingredient", "028": "cannon_licorice", "029": "cannon_bomb", "030": "cannon_mulock_key", "031": "cannon_mystery", "067": "cannon_chameleon", "068": "cannon_lucky", "069": "cannon_extra_time_and_moves", "071": "cannon_striped", "072": "cannon_wrapped_candy", "090": "cannon_block_waffle", "107": "cannon_striped_horizontal", "108": "cannon_striped_vertical", "127": "cannon_colorbomb", "128": "cannon_fish", "137": "cannon_sugar_coat", "214": "cannon_blue", "215": "cannon_green", "216": "cannon_orange", "217": "cannon_purple", "218": "cannon_red", "219": "cannon_yellow" }
const path = { "140": "rainbow_stream_vertical", "141": "rainbow_stream_horizontal", "142": "rainbow_stream_BL", "143": "rainbow_stream_BR", "144": "rainbow_stream_TL", "145": "rainbow_stream_TR", "146": "rainbow_stream_TBL", "147": "rainbow_stream_TBR", "148": "rainbow_stream_TLR", "149": "rainbow_stream_BLR", "150": "rainbow_stream_all_directions", "151": "rainbow_stream_intersection_point" }
const leaflayer = { "063": 'leaf' }

// Conveyor belt elements
const conveyor = { 
    "conveyor_up": "conveyor_up", 
    "conveyor_down": "conveyor_down", 
    "conveyor_left": "conveyor_left", 
    "conveyor_right": "conveyor_right",
    "conveyor_corner_top_left": "conveyor_corner_top_left",
    "conveyor_corner_top_right": "conveyor_corner_top_right", 
    "conveyor_corner_bottom_left": "conveyor_corner_bottom_left",
    "conveyor_corner_bottom_right": "conveyor_corner_bottom_right"
}
const conveyorPortals = { 
    "conveyor_entrance_blue": "conveyor_entrance_blue", 
    "conveyor_entrance_green": "conveyor_entrance_green", 
    "conveyor_entrance_purple": "conveyor_entrance_purple",
    "conveyor_entrance_up": "conveyor_entrance_up",
    "conveyor_entrance_down": "conveyor_entrance_down", 
    "conveyor_entrance_left": "conveyor_entrance_left",
    "conveyor_entrance_right": "conveyor_entrance_right"
}

//014 and 015 are unused ids so i'm using them to designate invisible porta;s
const portalentrance = {'012':'portal_entrance','014':'portal_entrance_hidden'}
const portalexit = {'013':'portal_exit','015':'portal_exit_hidden'}

const elements_ids = Object.assign({}, rainbowcannontop, rainbowcannonbottom, rainbowcannonleft, rainbowcannonright, leaflayer, colors, cannons, walldown, wallup, bonbon, path, wallright, wallleft, coloredCandy, candy, blockers, tiles, ingredients, sugarCoats, locks, glass, portalentrance, portalexit, conveyor, conveyorPortals, { "010": "ingredients_exit", "026": "candy_entrance", "005": "candy_cannon", "mallomatic_head_top": "mallomatic_head_top", "mallomatic_head_left": "mallomatic_head_left", "mallomatic_head_right": "mallomatic_head_right", "mallomatic_head_bottom": "mallomatic_head_bottom", "sprinks_nest": "sprinks_nest", "wonderful_blue_stripe": "wonderful_blue_stripe", "wonderful_red_stripe": "wonderful_red_stripe", "wonderful_yellow_stripe": "wonderful_yellow_stripe", "wonderful_green_stripe": "wonderful_green_stripe", "wonderful_purple_stripe": "wonderful_purple_stripe", "wonderful_orange_stripe": "wonderful_orange_stripe", "wonderful_colorbomb": "wonderful_colorbomb", "wonderful_striped_horizontal": "wonderful_striped_horizontal", "wonderful_striped_vertical": "wonderful_striped_vertical", "wonderful_wrapped": "wonderful_wrapped", "wonderful_jellyfish": "wonderful_jellyfish", "wonderful_base_vertical": "wonderful_base_vertical", "gumball_machine": "gumball_machine", "colorbomb": "044" })
const elements_names = _.invert(elements_ids)

const stretched = ["009", "019", "020", "021", "022", "023", "025", "122", "123", "124", "134", "135", "136", "054", "157", "158", "024", "211", "212", "213", "220", "221", "159", "160", "161", "162", "163", "062", "228", "230", "231", "232", "mallomatic_head_top", "mallomatic_head_left", "mallomatic_head_right", "mallomatic_head_bottom"].concat(Object.keys(bonbon))
const small = [].concat(Object.keys(colors), Object.keys(coloredCandy), ["017", "002", "079", "080", "081", "082", "083", "044", "043", "125", "126"]);

const sugarCoatable = ["044", "017", "079", "080", "081", "082", "083", "125", "126", "043", "061"]

const elementsFolder = "elements/"
var selectedColor = "002"
var selectedElement = "002"
var elementLayer = "normal"
var currentMode = "Classic moves"

// Candy cobra tracking variables
var lastCobraTile = null
var lastCobraLayer = null
var waitingForCobraBasket = false
var lastCobraElement = null

// Conveyor belt grouping variables
var conveyorGroups = []
var currentConveyorGroup = []
var isConveyorGroupingMode = false



// Conveyor belt direction mapping
const conveyorDirections = {
    "conveyor_up": 0,
    "conveyor_right": 1, 
    "conveyor_down": 2,
    "conveyor_left": 3
}

// Corner pieces are just visual - they don't have separate direction values
// They will be treated as having the output direction during export

// Conveyor portal color mapping
const conveyorPortalColors = {
    "conveyor_entrance_blue": 2,
    "conveyor_entrance_green": 3,
    "conveyor_entrance_purple": 1,
    "conveyor_entrance_up": 0,
    "conveyor_entrance_down": 2,
    "conveyor_entrance_left": 3,
    "conveyor_entrance_right": 1
}

// Candy cobra layer mapping
const cobraLayerMapping = {
    "cobra_1": 1,
    "cobra_2": 2,
    "cobra_3": 3,
    "cobra_4": 4,
    "cobra_5": 5
}

const orderItems = { "1": "red", "2": "blue", "3": "yellow", "4": "orange", "5": "purple", "6": "green", "7": "wrapped", "8": "striped", "9": "colorbomb", "10": "striped + striped", "11": "striped + wrapped", "12": "striped + colorbomb", "13": "colorbomb + colorbomb", "14": "wrapped + colorbomb", "15": "wrapped + wrapped", "16": "chocolate", "17": "frosting", "18": "licorice shell", "19": "licorice", "20": "pepper bomb", "21": "jellyfish", "22": "cake bomb", "23": "mystery candy", "24": "magic mixer", "25": "waffle", "26": "dark chocolate", "27": "candy cane curl", "28": "crystal candy", "29": "rainbow twist", "30": "frog", "31": "sugar coat", "32": "bubblegum", "33": "licorice curl", "34": "sour skull", "35": "bonbon blitz", "36": "jelly jar", "37": "candy cobra", "38": "wonderful wrapper", "39": "gumballs", "40": "mall-o-matic" }

const magicMixerItems = { "0": "All Blockers", "1": "pepper bomb", "2": "licorice", "3": "frosting (1 layer)", "4": "frosting (2 layers)", "5": "frosting (3 layers)", "6": "frosting (4 layers)", "7": "frosting (5 layers)", "8": "chocolate", "9": "licorice lock", "10": "marmalade", "11": "dark chocolate (1 layer)", "12": "dark chocolate (2 layers)", "13": "dark chocolate (3 layers)", "14": "crystal candy (1 layer)", "15": "crystal candy (2 layers)", "16": "crystal candy (3 layers)", "17": "toffee swirl (1 layer)", "18": "toffee swirl (2 layers)", "19": "toffee swirl (3 layers)", "20": "toffee swirl (4 layers)", "21": "toffee swirl (5 layers)", "22": "rainbow twist (1 layer)", "23": "rainbow twist (2 layers)", "24": "rainbow twist (3 layer)", "25": "rainbow twist (4 layer)", "26": "rainbow twist (5 layer)", "27": "sugar coat (1 layer)", "28": "sugar coat (2 layers)", "29": "sugar coat (3 layers)", "30": "bubblegum pop (1 layer)", "31": "bubblegum pop (2 layers)", "32": "bubblegum pop (3 layers)", "33": "bubblegum pop (4 layers)", "34": "bubblegum pop (5 layers)", "35": "color bomb bonbon blitz (one-charged)", "36": "color bomb bonbon blitz (two-charged)", "37": "color bomb bonbon blitz (three-charged)", "38": "color bomb bonbon blitz (four-charged)", "39": "horizontal striped candy bonbon blitz (one-charged)", "40": "horizontal striped candy bonbon blitz (two-charged)", "41": "horizontal striped candy bonbon blitz (three-charged)", "42": "horizontal striped candy bonbon blitz (four-charged)", "43": "vertical striped candy bonbon blitz (one-charged)", "44": "vertical striped candy bonbon blitz (two-charged)", "45": "vertical striped candy bonbon blitz (three-charged)", "46": "vertical striped candy bonbon blitz (four-charged)", "47": "jelly fish bonbon blitz (one charged)", "48": "jelly fish bonbon blitz (two charged)", "49": "jelly fish bonbon blitz (three charged)", "50": "jelly fish bonbon blitz (four charged)", "51": "wrapped candy bonbon blitz (one-charged)", "52": "wrapped candy bonbon blitz (two-charged)", "53": "wrapped candy bonbon blitz (three-charged)", "54": "wrapped candy bonbon blitz (four-charged)" }

const cannonCodes = [["fallingIcing", "Level"], ["licorice"], ["luckyCandy"], ["mulockCandy"], ["pepperCandy", "ExplosionTurns"], ["stripedCandy"], ["stripedRowCandy"], ["stripedColumnCandy"], ["timeCandy"], ["wrappedCandy"], ["colorBomb"], ["fish"], ["shield", "Level"], ["extraMoves"]]

//Order of the layers
const layers = [
    "tile",
    "conveyor",
    "path",
    "leaf",
    "portal_entrance",
    "portal_exit",
    "normal",
    "conveyor_portal",
    "bonbonoverlay",
    "sugarcoat",
    "lock",
    "glass",
    "wallup",
    "walldown",
    "wallleft",
    "wallright",
    'rainbow_cannon_top',
    "rainbow_cannon_bottom",
    "rainbow_cannon_left",
    "rainbow_cannon_right",
    "ingredients_exit",
    "candy_cannon",
    "candy_entrance",
    "cobra_basket",
    "selectimg"
]

const layerElements = {
    "tile": [].concat(Object.keys(tiles)),
    "conveyor": [].concat(Object.keys(conveyor)),
    "path": [].concat(Object.keys(path)),
    "leaf": [].concat(Object.keys(leaflayer)),
    "normal": [].concat(Object.keys(colors), Object.keys(coloredCandy), Object.keys(candy), Object.keys(blockers), Object.keys(ingredients), Object.keys(bonbon)),
    "conveyor_portal": [].concat(Object.keys(conveyorPortals)),
    "sugarcoat": [].concat(Object.keys(sugarCoats)),
    "lock": [].concat(Object.keys(locks)),
    "glass": [].concat(Object.keys(glass)),
    "wallup": [].concat(Object.keys(wallup)),
    "walldown": [].concat(Object.keys(walldown)),
    "wallleft": [].concat(Object.keys(wallleft)),
    "wallright": [].concat(Object.keys(wallright)),
    "rainbow_cannon_top": [].concat(Object.keys(rainbowcannontop)),
    "rainbow_cannon_bottom": [].concat(Object.keys(rainbowcannonbottom)),
    "rainbow_cannon_left": [].concat(Object.keys(rainbowcannonleft)),
    "rainbow_cannon_right": [].concat(Object.keys(rainbowcannonright)),
    "ingredients_exit": ["010"],
    "candy_entrance": ["026"],
    "candy_cannon": ["005"].concat(Object.keys(cannons)),
    "cobra_basket": ["227"],
    "portal_entrance":[].concat(Object.keys(portalentrance)),
    "portal_exit":[].concat(Object.keys(portalexit))
}

var preferredColors = [0, 1, 2, 3, 4]

var isDown = false

var lastPortalObject = undefined
var isPortalTimeout

function pickRandomProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1 / ++count)
            result = prop;
    return result;
}

// Conveyor belt grouping functions
function finishConveyorGroup() {
    // Auto-place corner pieces when finishing conveyor grouping
    autoPlaceConveyorCorners()
    
    if (currentConveyorGroup.length > 0) {
        conveyorGroups.push([...currentConveyorGroup])
        currentConveyorGroup = []
        isConveyorGroupingMode = false
        
        // Hide the button after grouping is done
        const btn = document.getElementById('done-conveyor-btn')
        if (btn) {
            btn.style.display = 'none'
        }
        
        console.log('Conveyor group finished:', conveyorGroups)
    } else if (conveyorGroups.length === 0) {
        // If no manual groups created, the export will use auto-grouping
        console.log('No manual groups created, will use auto-grouping during export')
        
        // Hide the button even if no groups were created
        const btn = document.getElementById('done-conveyor-btn')
        if (btn) {
            btn.style.display = 'none'
        }
    }
    // Auto-save removed - manual saves only via CTRL+S
}

function startConveyorGrouping() {
    isConveyorGroupingMode = true
    currentConveyorGroup = []
    
    // Update button text
    const btn = document.getElementById('done-conveyor-btn')
    if (btn) {
        btn.innerHTML = '<md-icon slot="start">group_work</md-icon>Finish current group'
    }
    // Auto-save removed - manual saves only via CTRL+S
}

function addToConveyorGroup(belt) {
    if (isConveyorGroupingMode) {
        currentConveyorGroup.push(belt)
        console.log('Added to current group:', belt)
    // Auto-save removed - manual saves only via CTRL+S
    }
}

// Function to check if there are any conveyor belts on the board
function checkConveyorBeltsOnBoard() {
    const level = document.getElementById('level')
    let hasConveyorBelts = false
    
    level.childNodes.forEach(function (row) {
        for (var colIndex = 0; colIndex < row.childNodes.length; colIndex++) {
            let object = row.childNodes[colIndex]
            if (object.hasAttribute('conveyor') && object.getAttribute('conveyor') !== '') {
                hasConveyorBelts = true
                break
            }
        }
        if (hasConveyorBelts) return
    })
    
    // Show/hide the button based on whether there are conveyor belts
    const btn = document.getElementById('done-conveyor-btn')
    if (btn) {
        btn.style.display = hasConveyorBelts ? 'block' : 'none'
    }
    
    return hasConveyorBelts
}

// Function to detect if conveyor belts are connected by direction
function areConveyorBeltsConnected(belt1, belt2) {
    // Handle corner pieces without stored direction - they connect if adjacent
    if (belt1.direction === -1) {
        // Corner piece without direction - check if belt2 is adjacent
        let rowDiff = Math.abs(belt1.row - belt2.row)
        let colDiff = Math.abs(belt1.col - belt2.col)
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
    }
    
    // Check if belt1 points to belt2's position based on its direction
    let targetRow = belt1.row
    let targetCol = belt1.col
    
    switch (belt1.direction) {
        case 0: // up
            targetRow = belt1.row - 1
            break
        case 1: // right
            targetCol = belt1.col + 1
            break
        case 2: // down
            targetRow = belt1.row + 1
            break
        case 3: // left
            targetCol = belt1.col - 1
            break
    }
    
    return targetRow === belt2.row && targetCol === belt2.col
}

// Function to get the appropriate corner piece for direction change
function getCornerPiece(fromDirection, toDirection) {
    // fromDirection is the direction of the incoming belt
    // toDirection is the direction of the outgoing belt
    // Complete mapping based on visual testing
    
    // conveyor_corner_top_left: use for left → down, up → right
    if (fromDirection === 3 && toDirection === 2) return "conveyor_corner_top_left"      // left → down
    if (fromDirection === 0 && toDirection === 1) return "conveyor_corner_top_left"      // up → right
    
    // conveyor_corner_top_right: use for right → down, up → left
    if (fromDirection === 1 && toDirection === 2) return "conveyor_corner_top_right"     // right → down
    if (fromDirection === 0 && toDirection === 3) return "conveyor_corner_top_right"     // up → left
    
    // conveyor_corner_bottom_left: use for down → right, left → up
    if (fromDirection === 2 && toDirection === 1) return "conveyor_corner_bottom_left"   // down → right
    if (fromDirection === 3 && toDirection === 0) return "conveyor_corner_bottom_left"   // left → up
    
    // conveyor_corner_bottom_right: use for down → left, right → up
    if (fromDirection === 2 && toDirection === 3) return "conveyor_corner_bottom_right"  // down → left
    if (fromDirection === 1 && toDirection === 0) return "conveyor_corner_bottom_right"  // right → up
    
    return null // no corner needed for same direction
}

// Function to trace a conveyor belt path from a starting belt
function traceConveyorPath(startBelt, allBelts) {
    let path = [startBelt]
    let currentBelt = startBelt
    let visited = new Set([`${startBelt.row},${startBelt.col}`])
    
    while (true) {
        let nextBelt = null
        
        // Find the next belt that this belt points to
        for (let belt of allBelts) {
            if (areConveyorBeltsConnected(currentBelt, belt) && !visited.has(`${belt.row},${belt.col}`)) {
                nextBelt = belt
                break
            }
        }
        
        if (!nextBelt) break
        
        path.push(nextBelt)
        visited.add(`${nextBelt.row},${nextBelt.col}`)
        currentBelt = nextBelt
    }
    
    return path
}

// Function to find conveyor belt paths that connect entrance to exit portals
function findConnectedConveyorPaths(conveyorBelts, conveyorPortals) {
    let connectedPaths = []
    let processedBelts = new Set()
    
    // Find entrance portals
    let entrancePortals = conveyorPortals.filter(portal => 
        portal.type.startsWith('conveyor_entrance'))
    
    for (let entrance of entrancePortals) {
        // Find if there's a conveyor belt at this entrance position
        let entranceBelt = conveyorBelts.find(belt => 
            belt.row === entrance.row && belt.col === entrance.col)
        
        if (!entranceBelt || processedBelts.has(`${entranceBelt.row},${entranceBelt.col}`)) {
            continue
        }
        
        // Trace the path from this entrance
        let path = traceConveyorPath(entranceBelt, conveyorBelts)
        
        // Check if the path ends at an exit portal
        let lastBelt = path[path.length - 1]
        let hasExitPortal = conveyorPortals.some(portal => 
            portal.row === lastBelt.row && 
            portal.col === lastBelt.col && 
            !portal.type.startsWith('conveyor_entrance'))
        
        // Only include paths that connect entrance to exit
        if (hasExitPortal && path.length > 1) {
            connectedPaths.push(path)
            
            // Mark all belts in this path as processed
            path.forEach(belt => processedBelts.add(`${belt.row},${belt.col}`))
        }
    }
    
    return connectedPaths
}

// Function to find all separate conveyor belt paths (without requiring portals)
function findAllConveyorPaths(conveyorBelts) {
    let allPaths = []
    let processedBelts = new Set()
    
    for (let belt of conveyorBelts) {
        let beltKey = `${belt.row},${belt.col}`
        
        // Skip if this belt is already part of a path
        if (processedBelts.has(beltKey)) {
            continue
        }
        
        // Trace path starting from this belt
        let path = traceConveyorPath(belt, conveyorBelts)
        
        // Only add paths with multiple belts
        if (path.length > 1) {
            allPaths.push(path)
            
            // Mark all belts in this path as processed
            path.forEach(pathBelt => {
                processedBelts.add(`${pathBelt.row},${pathBelt.col}`)
            })
        }
    }
    
    return allPaths
}

// Function to automatically place corner pieces for direction changes
function autoPlaceConveyorCorners() {
    const level = document.getElementById('level')
    
    level.childNodes.forEach(function (row, rowIndex) {
        for (let colIndex = 0; colIndex < row.childNodes.length; colIndex++) {
            let object = row.childNodes[colIndex]
            
            // Check if this tile has a conveyor belt (not already a corner)
            if (object.hasAttribute('conveyor') && object.getAttribute('conveyor') !== '') {
                let currentBeltType = object.getAttribute('conveyor')
                let currentDirection = conveyorDirections[currentBeltType]
                
                // Skip if it's already a corner piece or invalid direction
                if (currentDirection === undefined || !currentBeltType.startsWith('conveyor_')) continue
                if (currentBeltType.includes('corner')) continue
                
                // Find what belt is feeding into this position
                let incomingDirection = null
                let incomingFound = false
                
                // Check all four directions for incoming belts
                const directions = [
                    { dir: 0, rowOffset: 1, colOffset: 0 },   // check down for up-pointing belt
                    { dir: 1, rowOffset: 0, colOffset: -1 },  // check left for right-pointing belt
                    { dir: 2, rowOffset: -1, colOffset: 0 },  // check up for down-pointing belt
                    { dir: 3, rowOffset: 0, colOffset: 1 }   // check right for left-pointing belt
                ]
                
                for (let check of directions) {
                    let checkRow = rowIndex + check.rowOffset
                    let checkCol = colIndex + check.colOffset
                    
                    if (checkRow >= 0 && checkRow < level.childNodes.length &&
                        checkCol >= 0 && checkCol < level.childNodes[checkRow].childNodes.length) {
                        
                        let checkObject = level.childNodes[checkRow].childNodes[checkCol]
                        
                        if (checkObject.hasAttribute('conveyor') && checkObject.getAttribute('conveyor') !== '') {
                            let checkBeltType = checkObject.getAttribute('conveyor')
                            let checkDirection = conveyorDirections[checkBeltType]
                            
                            // If this belt points to our current position
                            if (checkDirection === check.dir && !checkBeltType.includes('corner')) {
                                incomingDirection = check.dir
                                incomingFound = true
                                break
                            }
                        }
                    }
                }
                
                // If we found an incoming direction and it's different from current direction
                if (incomingFound && incomingDirection !== currentDirection) {
                    let cornerPiece = getCornerPiece(incomingDirection, currentDirection)
                    if (cornerPiece) {
                        // Replace current belt with corner piece
                        object.setAttribute('conveyor', cornerPiece)
                        // Store the output direction as a data attribute for later use
                        object.setAttribute('data-output-direction', currentDirection)
                        let image = object.querySelector('.conveyor')
                        if (image) {
                            let imagePath = elementsFolder + elements_ids[cornerPiece] + '.png'
                            image.src = imagePath
                        }
                    }
                }
            }
        }
    })
    // Auto-save removed - manual saves only via CTRL+S
}

// Function to automatically detect and group conveyor belts
function autoGroupConveyorBelts() {
    // First, auto-place corner pieces
    autoPlaceConveyorCorners()
    
    console.log('Auto-grouping conveyor belts based on portal connections')
    // Auto-save removed - manual saves only via CTRL+S
}

// Test function for debugging corner placement
window.testCornerPlacement = function() {
    console.log('Testing corner placement...')
    autoPlaceConveyorCorners()
}

// Test function to manually place a corner
window.testManualCorner = function() {
    console.log('Testing manual corner placement...')
    const level = document.getElementById('level')
    const firstRow = level.childNodes[0]
    const firstCell = firstRow.childNodes[0]
    
    // Set corner piece manually
    firstCell.setAttribute('conveyor', 'conveyor_corner_top_left')
    firstCell.setAttribute('data-output-direction', '2')
    
    let image = firstCell.querySelector('.conveyor')
    if (image) {
        let imagePath = elementsFolder + elements_ids['conveyor_corner_top_left'] + '.png'
        image.src = imagePath
        console.log(`Manually placed corner image: ${imagePath}`)
        console.log(`Image element:`, image)
    } else {
        console.log('No conveyor image found')
        console.log('All images:', firstCell.querySelectorAll('img'))
    }
}

// Test function to cycle through all corner pieces
window.testAllCorners = function() {
    const corners = ['conveyor_corner_top_left', 'conveyor_corner_top_right', 'conveyor_corner_bottom_left', 'conveyor_corner_bottom_right']
    const level = document.getElementById('level')
    
    corners.forEach((corner, index) => {
        const row = level.childNodes[1]
        const cell = row.childNodes[index]
        
        cell.setAttribute('conveyor', corner)
        let image = cell.querySelector('.conveyor')
        if (image) {
            let imagePath = elementsFolder + elements_ids[corner] + '.png'
            image.src = imagePath
            console.log(`Placed ${corner} at position ${index}`)
        }
    })
    
    console.log('Placed all 4 corner pieces in row 1 for visual comparison')
}

function getLayerFromId(id) {
    let layer = undefined

    keys = Object.keys(layerElements)
    for (var i = 0; i < keys.length; i++) {
        key = keys[i]
        if (layerElements[key].includes(id)) {
            layer = key
            break
        }
    }
    return layer
}

function toggleDreamworld(object) {
    document.getElementById("dreamworldoptions").style.display = object.checked ? "block" : "none"
    // Auto-save removed - manual saves only via CTRL+S
}


function removePortal(object,isExit) {

    
    let level = document.getElementById("level")
    let objToDelete
    //console.log('removing portal ' + isExit)
    if (isExit) {
        object.setAttribute('portal_exit','')
        object.querySelector(".portal_exit").src = ''
        object.querySelector(".portal_exit").setAttribute("class", "portal_exit default small")
        try {
            objToDelete = level.children[object.getAttribute('portalentrancerow')].children[object.getAttribute('portalentrancecol')]
            objToDelete.setAttribute('portal_entrance','')
            objToDelete.querySelector(".portal_entrance").src = ''
            objToDelete.setAttribute('portalexitrow','')
            objToDelete.setAttribute('portalexitcol','')
        } catch (err) {}
        object.setAttribute('portalentrancerow','')
        object.setAttribute('portalentrancecol','')
    } else {
        object.setAttribute('portal_entrance','')
        object.querySelector(".portal_entrance").src = ''
        object.querySelector(".portal_entrance").setAttribute("class", "portal_entrance default small")
        try {
            objToDelete = level.children[object.getAttribute('portalexitrow')].children[object.getAttribute('portalexitcol')]
            objToDelete.setAttribute('portal_exit','')
            objToDelete.querySelector(".portal_exit").src = ''
            objToDelete.setAttribute('portalentrancerow','')
            objToDelete.setAttribute('portalentrancecol','')
        } catch (err) {}
        object.setAttribute('portalexitrow','')
        object.setAttribute('portalexitcol','')
    }
    // Auto-save removed - manual saves only via CTRL+S
}

function switchedRequirement(object) {
    document.getElementById("requirementwarning").style.display = "none"
    let requirement = object.value
    let image = object.parentNode.querySelector("img")
    image.src = "ui/hud/" + orderItems[requirement] + ".png"
    
    // Mark as unsaved when changing requirements
    markAsUnsaved();
    
    // Auto-save removed - manual saves only via CTRL+S
}

function switchedRequirementIngredient(object) {
    document.getElementById("requirementwarning").style.display = "none"
    let requirement = object.value
    let image = object.parentNode.querySelector("img")
    image.src = "ui/hud/" + requirement + ".png"
    
    // Mark as unsaved when changing ingredient requirements
    markAsUnsaved();
    
    // Auto-save removed - manual saves only via CTRL+S
}

function removeRequirement(object) {

    
    object.parentNode.remove()
    document.getElementById("requirementwarning").style.display = "none"
    
    // Mark as unsaved when removing requirements
    markAsUnsaved();
    
    // Auto-save removed - manual saves only via CTRL+S
}

function addRequirement(isIngredient = false, ignoreLimit = false) {

    
    let requirementsObj = document.getElementById("requirements")

    if (!ignoreLimit) {
        if (requirementsObj.childNodes.length > 3) {
            document.getElementById("requirementwarning").style.display = "block"
            return
        }
        else {
            document.getElementById("requirementwarning").style.display = "none"
        }
    }

    section = document.createElement("div")
    section.classList.add("sideoptions")
    section.style.display = "flex";
    section.style.alignItems = "center";
    section.style.justifyContent = "center";
    let typeText = "Order"
    section.setAttribute("reqtype", "order")
    if (isIngredient) {
        typeText = "Ingredient"
        section.setAttribute("reqtype", "ingredient")
    }
    section.innerHTML = '<button style="position: relative; border-radius: 50px; border: none; background-color: #ffffff00; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;" onclick="removeRequirement(this)"><md-icon>􀆄</md-icon></button> <br> <br> <img src="ui/hud/red.png" style="max-width: 30px; max-height: 30px; padding-right: 5px;"><select onchange="switchedRequirement(this)"> </select> <div class="break"></div> <p  style="margin: 10px; display: block; text-align: center;">Amount:</p> <input style="margin-top: 10px;height: 20px;width: 50px; padding: 10px;" placeholder="0" type="number">'

    select = section.querySelector("select")
    if (!isIngredient) {
        Object.keys(orderItems).forEach(function (key) {
            option = document.createElement("option")
            option.value = key
            option.innerHTML = orderItems[key]
            select.appendChild(option)
        })
    }
    else {
        select.setAttribute("onchange", "switchedRequirementIngredient(this)")
        section.querySelector("img").src = "ui/hud/sprinks.png"

        let option
        option = document.createElement("option")
        option.value = "sprinks"
        option.innerHTML = "sprinks"
        select.appendChild(option)


    }
    requirementsObj.prepend(section)
    
    // Mark as unsaved when adding requirements
    markAsUnsaved();
    
    // Auto-save removed - manual saves only via CTRL+S
}

function switchedMixerOption(object) {
    document.getElementById("requirementwarning").style.display = "none"
    let requirement = object.value
    let image = object.parentNode.querySelector("img")
    image.src = "ui/hud/" + magicMixerItems[requirement] + ".png"
    
    // Mark as unsaved when changing mixer options
    markAsUnsaved();
    
    // Auto-save removed - manual saves only via CTRL+S
}

function addMixerOption() {

    
    let requirementsObj = document.getElementById("mixeroptions")

    section = document.createElement("div")
    section.classList.add("sideoptions")
    section.setAttribute("reqtype", "mixeroption")
    section.innerHTML = '<md-icon-button style="position: relative; border-radius: 50px; border: none; background-color: #ffffff00; width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;" onclick="removeRequirement(this)"><md-icon>􀆄</md-icon></md-icon-button> <div class="break"></div> <img src="ui/hud/All Blockers.png" style="max-width: 30px; max-height: 30px;"> <p style="margin: 10px; display: block; text-align: center;">Blocker:</p> <select onchange="switchedMixerOption(this)" style="width: 100%;"> </select> <div class="break"></div>'

    select = section.querySelector("select")

    Object.keys(magicMixerItems).forEach(function (key) {
        option = document.createElement("option")
        option.value = key
        option.innerHTML = magicMixerItems[key]
        select.appendChild(option)
    })

    requirementsObj.prepend(section)
    
    // Mark as unsaved when adding mixer options
    markAsUnsaved();
    
    // Auto-save removed - manual saves only via CTRL+S
}

function selectMode() {
    mode = document.querySelector('input[name="leveltype"]:checked').value
    if (mode === "Classic" || mode == "Jelly Time") {
        document.getElementById("moves-section").style.display = "none"
        document.getElementById("time-section").style.display = "block"
    }
    else {
        document.getElementById("moves-section").style.display = "block"
        document.getElementById("time-section").style.display = "none"
    }

    document.getElementById("requirements-options-section").style.display = "none"

    if (mode.includes('Drop down') || mode.includes('Drop Down')) {
        document.getElementById("requirements-options-section").style.display = "flex"
        document.getElementById("addingredient").style.display = "inherit"
    } else {
        document.getElementById("addingredient").style.display = "none"
        let requirementsContainer = document.getElementById("requirements")
        Array.from(requirementsContainer.children).forEach(function (child) {
            if (child.getAttribute("reqtype") == "ingredient") {
                child.remove()
            }
        })
    }

    if (mode.includes('Order')) {
        document.getElementById("requirements-options-section").style.display = "flex"
        document.getElementById("addorder").style.display = "inherit"
    } else {
        document.getElementById("addorder").style.display = "none"
        let requirementsContainer = document.getElementById("requirements")
        Array.from(requirementsContainer.children).forEach(function (child) {
            if (child.getAttribute("reqtype") == "order") {
                child.remove()
            }
        })
    }
    /*
    if (mode === "Drop down"){
        document.getElementById("requirements-options-section").style.display = "block"
        document.getElementById("addingredient").style.display = "block"

        let requirementsContainer = document.getElementById("requirements")
        Array.from(requirementsContainer.children).forEach(function(child){
            element = child

            if (element.getAttribute("reqtype") == "order"){
                element.remove()
            }
        })
    }
    else{
        if (mode != "Order"){
            document.getElementById("requirements-options-section").style.display = "none"
        }
        document.getElementById("addingredient").style.display = "none"
    }

    if (mode == "Order"){
        document.getElementById("requirements-options-section").style.display = "block"
        document.getElementById("addorder").style.display = "block"

        let requirementsContainer = document.getElementById("requirements")
        Array.from(requirementsContainer.children).forEach(function(child){
            element = child

            if (element.getAttribute("reqtype") == "ingredient"){
                element.remove()
            }
        })
    }
    else {
        if (mode != "Drop down"){
            document.getElementById("requirements-options-section").style.display = "none"
        }
        document.getElementById("addorder").style.display = "none"
    }
    */
    currentMode = mode
    
    // Mark as unsaved when changing game mode
    markAsUnsaved();
    
    // Auto-save removed - manual saves only via CTRL+S
}

function togglePreferred(object) {
    color = Number(object.getAttribute("value"))

    if (!preferredColors.includes(color)) {
        if (!(object.classList.contains("preferredselected"))) {
            object.classList.add("preferredselected")
        }

        preferredColors.push(color)
    }
    else {
        object.classList.remove("preferredselected")

        preferredColors.splice(preferredColors.indexOf(color), 1)
    }
    
    // Mark as unsaved when changing preferred colors
    markAsUnsaved();
    
    // Auto-save removed - manual saves only via CTRL+S
}

function toggleDropdown(object) {
    let dropped = document.getElementById(object.getAttribute("associd"))
    let p = object.querySelector(".arrow")

    if (dropped.style.display == "none") {
        dropped.style.display = "block"
        p.style.transform = "rotate(" + 0 + "deg)"
    }
    else {
        dropped.style.display = "none"
        p.style.transform = "rotate(" + 90 + "deg)"
    }
    // Auto-save removed - manual saves only via CTRL+S
}

function updateColor(object, color) {

    
    try {
        document.querySelector(".colorselected").classList.remove("colorselected")
    }
    catch { }
    object.classList.add("colorselected")
    selectedColor = elements_names[color]
    // Auto-save removed - manual saves only via CTRL+S
}

function removeCake(object) {

    
    let cake = object.getAttribute("cake")
    let tiles = []
    let row = Number(object.getAttribute("pos-row"))
    let column = Number(object.getAttribute("pos-col"))
    let level = document.getElementById("level")

    object.setAttribute("normal", "002")
    object.setAttribute("color", "002")
    object.setAttribute("cake", "")
    object.querySelector(".normal").src = elementsFolder + "random.png"
    object.querySelector(".normal").setAttribute("class", "normal default small")

    if (cake == "1") {
        tiles = [[row, column + 1], [row + 1, column], [row + 1, column + 1]]
    }
    else if (cake == "2") {
        tiles = [[row, column - 1], [row + 1, column - 1], [row + 1, column]]
    }
    else if (cake == "3") {
        tiles = [[row - 1, column], [row - 1, column + 1], [row, column + 1]]
    }
    else if (cake == "4") {
        tiles = [[row - 1, column - 1], [row - 1, column], [row, column - 1]]
    }

    tiles.forEach(function (pos) {
        let otherObject = level.children[pos[0]].children[pos[1]]
        otherObject.setAttribute("normal", "002")
        otherObject.setAttribute("color", "002")
        otherObject.setAttribute("cake", "")
        otherObject.querySelector(".normal").src = elementsFolder + "random.png"
        otherObject.querySelector(".normal").setAttribute("class", "normal default small")
    })
    // Auto-save removed - manual saves only via CTRL+S
    
    // Debug wonderful wrappers on page load
    setTimeout(() => {
        debugWonderfulWrappers()
    }, 1000)
}

function removeWonderfulWrapper(object, isRemovingAll = false) {
    let wonderfulWrapper = object.getAttribute("wonderful_wrapper")
    let tiles = []
    let row = Number(object.getAttribute("pos-row"))
    let column = Number(object.getAttribute("pos-col"))
    let level = document.getElementById("level")

    // Only reset tile attributes if not removing all (i.e., user is manually clearing)
    if (!isRemovingAll) {
        object.setAttribute("normal", "002")
        object.setAttribute("color", "002")
        object.setAttribute("wonderful_wrapper", "")
        object.setAttribute("wonderful_orientation", "")
        object.querySelector(".normal").src = elementsFolder + "random.png"
        object.querySelector(".normal").setAttribute("class", "normal default small")
    }

    // Remove all wonderful wrapper related attributes
    const wonderfulAttributes = [
        "wonderful_blue_stripe", "wonderful_red_stripe", "wonderful_yellow_stripe", 
        "wonderful_green_stripe", "wonderful_purple_stripe", "wonderful_orange_stripe",
        "wonderful_colorbomb", "wonderful_striped_horizontal", "wonderful_striped_vertical",
        "wonderful_wrapped", "wonderful_jellyfish",
        "wonderful_colorbomb_color", "wonderful_striped_h_color", "wonderful_striped_v_color",
        "wonderful_wrapped_color", "wonderful_jellyfish_color"
    ]
    
    wonderfulAttributes.forEach(attr => {
        object.removeAttribute(attr)
    })
    
    // Remove ribbons container and all ribbon elements
    const ribbonsContainer = object.querySelector(".ribbons-container")
    if (ribbonsContainer) {
        ribbonsContainer.remove()
    }
    
    const elementOverlays = object.querySelectorAll(".element-overlay")
    elementOverlays.forEach(overlay => {
        overlay.remove()
    })
    
    // Also remove element overlays from the other tile if it exists
    try {
        let otherTile
        let orientation = object.getAttribute("wonderful_orientation")
        
        if (wonderfulWrapper == "1") {
            if (orientation === "vertical") {
                otherTile = level.children[row + 1].children[column]
            } else {
                otherTile = level.children[row].children[column + 1]
            }
        } else if (wonderfulWrapper == "2") {
            if (orientation === "vertical") {
                otherTile = level.children[row - 1].children[column]
            } else {
                otherTile = level.children[row].children[column - 1]
            }
        }
        
        if (otherTile && otherTile.getAttribute("normal") === "228") {
            const otherElementOverlays = otherTile.querySelectorAll(".element-overlay")
            otherElementOverlays.forEach(overlay => overlay.remove())
            
            // Also remove ribbons container from the other tile
            const otherRibbonsContainer = otherTile.querySelector(".ribbons-container")
            if (otherRibbonsContainer) {
                otherRibbonsContainer.remove()
            }
        }
    } catch (err) {
        console.warn("Error removing element overlays from other tile:", err)
    }

    if (wonderfulWrapper == "1") {
        if (object.getAttribute("wonderful_orientation") === "vertical") {
            tiles = [[row + 1, column]]
        } else {
            tiles = [[row, column + 1]]
        }
    }
    else if (wonderfulWrapper == "2") {
        if (object.getAttribute("wonderful_orientation") === "vertical") {
            tiles = [[row - 1, column]]
        } else {
            tiles = [[row, column - 1]]
        }
    }

    tiles.forEach(function (pos) {
        try {
            let otherObject = level.children[pos[0]].children[pos[1]]
            
            // Only reset tile attributes if not removing all
            if (!isRemovingAll) {
                otherObject.setAttribute("normal", "002")
                otherObject.setAttribute("color", "002")
                otherObject.setAttribute("wonderful_wrapper", "")
                otherObject.setAttribute("wonderful_orientation", "")
                otherObject.querySelector(".normal").src = elementsFolder + "random.png"
                otherObject.querySelector(".normal").setAttribute("class", "normal default small")
            }
            
            // Remove all wonderful wrapper related attributes from the other tile
            wonderfulAttributes.forEach(attr => {
                otherObject.removeAttribute(attr)
            })
            
            // Remove ribbons container from the other tile
            const otherRibbonsContainer = otherObject.querySelector(".ribbons-container")
            if (otherRibbonsContainer) {
                otherRibbonsContainer.remove()
            }
            
            const otherElementOverlays = otherObject.querySelectorAll(".element-overlay")
            otherElementOverlays.forEach(overlay => overlay.remove())
        } catch (err) {
            console.warn("Error removing wonderful wrapper tile:", err)
        }
    })
}

function debugWonderfulWrappers() {
    const wonderfulWrappers = {}
    let wrapperCount = 0
    
    // Find all tiles with wonderful_wrapper="1" (main tiles)
    const mainTiles = document.querySelectorAll('td[wonderful_wrapper="1"]')
    
    mainTiles.forEach((tile, index) => {
        const wrapperId = `wonderfulWrapper${index + 1}`
        const ribbons = []
        
        // Check for each ribbon type
        if (tile.hasAttribute("wonderful_blue_stripe")) ribbons.push("blue")
        if (tile.hasAttribute("wonderful_red_stripe")) ribbons.push("red")
        if (tile.hasAttribute("wonderful_yellow_stripe")) ribbons.push("yellow")
        if (tile.hasAttribute("wonderful_green_stripe")) ribbons.push("green")
        if (tile.hasAttribute("wonderful_purple_stripe")) ribbons.push("purple")
        if (tile.hasAttribute("wonderful_orange_stripe")) ribbons.push("orange")
        
        // Check for contained elements
        const containedElements = []
        if (tile.hasAttribute("wonderful_colorbomb")) containedElements.push("colorbomb")
        if (tile.hasAttribute("wonderful_striped_horizontal")) containedElements.push("striped_horizontal")
        if (tile.hasAttribute("wonderful_striped_vertical")) containedElements.push("striped_vertical")
        if (tile.hasAttribute("wonderful_wrapped")) containedElements.push("wrapped")
        if (tile.hasAttribute("wonderful_jellyfish")) containedElements.push("jellyfish")
        
        wonderfulWrappers[wrapperId] = {
            ribbons: ribbons,
            containedElements: containedElements,
            orientation: tile.getAttribute("wonderful_orientation") || "horizontal"
        }
        wrapperCount++
    })
    
    console.log(JSON.stringify(wonderfulWrappers, null, 2))
    return wonderfulWrappers
}

// Console function to check wonderful wrapper information
function wonderfulWrapperInf() {
    console.log("🎁 WONDERFUL WRAPPER INFO:")
    console.log("================================")
    
    let level = document.getElementById("level")
    let wonderfulWrappers = []
    
    // Find all wonderful wrapper tiles (tile 1)
    for (let row = 0; row < level.children.length; row++) {
        for (let col = 0; col < level.children[row].children.length; col++) {
            let tile = level.children[row].children[col]
            if (tile.getAttribute("wonderful_wrapper") === "1") {
                let wrapperInfo = {
                    position: `Row ${row}, Col ${col}`,
                    orientation: tile.getAttribute("wonderful_orientation"),
                    ribbons: [],
                    containedElements: []
                }
                
                // Collect ribbon attributes from both tiles of the 2x1 structure
                const ribbonTypes = ["wonderful_blue_stripe", "wonderful_red_stripe", "wonderful_yellow_stripe", "wonderful_green_stripe", "wonderful_purple_stripe", "wonderful_orange_stripe"]
                
                // Get the other tile (tile 2) of the 2x1 structure
                let otherTile = level.children[row].children[col + 1]
                if (tile.getAttribute("wonderful_orientation") === "horizontal") {
                    otherTile = level.children[row].children[col + 1]
                } else {
                    otherTile = level.children[row + 1].children[col]
                }
                
                // Collect from main tile (tile 1)
                ribbonTypes.forEach(ribbonType => {
                    if (tile.getAttribute(ribbonType)) {
                        const ribbonName = ribbonType.replace("wonderful_", "").replace("_stripe", "")
                        wrapperInfo.ribbons.push(ribbonName)
                    }
                })
                
                // Collect from other tile (tile 2)
                if (otherTile && otherTile.getAttribute("wonderful_wrapper") === "2") {
                    ribbonTypes.forEach(ribbonType => {
                        if (otherTile.getAttribute(ribbonType)) {
                            const ribbonName = ribbonType.replace("wonderful_", "").replace("_stripe", "")
                            wrapperInfo.ribbons.push(ribbonName)
                        }
                    })
                }
                
                // Also check the actual ribbon elements in the DOM to get individual ribbons
                const ribbonsContainer = tile.querySelector(".ribbons-container")
                if (ribbonsContainer) {
                    const ribbonElements = ribbonsContainer.querySelectorAll(".ribbon-element")
                    if (ribbonElements.length > 0) {
                        // Clear the ribbons array and rebuild from actual elements
                        wrapperInfo.ribbons = []
                        ribbonElements.forEach(ribbonElement => {
                            const ribbonType = ribbonElement.getAttribute("data-ribbon-type")
                            if (ribbonType) {
                                const ribbonName = ribbonType.replace("wonderful_", "").replace("_stripe", "")
                                wrapperInfo.ribbons.push(ribbonName)
                            }
                        })
                    }
                }
                
                // Collect contained element attributes from both tiles
                const elementTypes = ["wonderful_colorbomb", "wonderful_striped_horizontal", "wonderful_striped_vertical", "wonderful_wrapped", "wonderful_jellyfish"]
                
                // Check main tile (tile 1) for contained elements
                elementTypes.forEach(elementType => {
                    if (tile.getAttribute(elementType)) {
                        wrapperInfo.containedElements.push(elementType.replace("wonderful_", ""))
                    }
                })
                
                // Check other tile (tile 2) for contained elements
                if (otherTile && otherTile.getAttribute("wonderful_wrapper") === "2") {
                    elementTypes.forEach(elementType => {
                        if (otherTile.getAttribute(elementType)) {
                            wrapperInfo.containedElements.push(elementType.replace("wonderful_", ""))
                        }
                    })
                }
                
                wonderfulWrappers.push(wrapperInfo)
            }
        }
    }
    
    if (wonderfulWrappers.length === 0) {
        console.log("❌ No wonderful wrappers found on the board")
    } else {
        console.log(`✅ Found ${wonderfulWrappers.length} wonderful wrapper(s):`)
        wonderfulWrappers.forEach((wrapper, index) => {
            console.log(`\n🎁 Wonderful Wrapper ${index + 1}:`)
            console.log(`   Position: ${wrapper.position}`)
            console.log(`   Orientation: ${wrapper.orientation}`)
            console.log(`   Ribbons: ${wrapper.ribbons.length > 0 ? wrapper.ribbons.join(", ") : "None"}`)
            console.log(`   Contained Elements: ${wrapper.containedElements.length > 0 ? wrapper.containedElements.join(", ") : "None"}`)
        })
    }
    
    console.log("================================")
    return wonderfulWrappers
}

function isNormalCandy(normalAttr) {
    const blockerCodes = ["007", "009", "017", "019", "020", "021", "022", "023", "024", "035", "053", "054", "062", "066", "079", "080", "081", "082", "083", "094", "095", "096", "097", "098", "129", "130", "131", "132", "133", "157", "158", "159", "160", "161", "162", "163", "211", "212", "213", "220", "221", "231", "232"]
    return !blockerCodes.includes(normalAttr)
}

function reconstructMallOMaticAfterImport(childrenRows) {
    // Find all mall-o-matic head tiles and reconstruct their body parts
    childrenRows.forEach(function (row, rIndex) {
        let objects = [].slice.call(row.children)
        objects.forEach(function (object, cIndex) {
            let normalAttr = object.getAttribute("normal")
            
            // Check if this is a mall-o-matic head
            if (normalAttr && normalAttr.startsWith("mallomatic_head_")) {
                console.log("Found mall-o-matic head:", normalAttr, "at position:", rIndex, cIndex)
                
                // Determine direction and reconstruct body parts
                let direction = "vertical"
                let headTexture = ""
                
                if (normalAttr === "mallomatic_head_left") {
                    direction = "horizontal"
                    headTexture = "mallomatic_head_left.png"
                } else if (normalAttr === "mallomatic_head_right") {
                    direction = "horizontal"
                    headTexture = "mallomatic_head_right.png"
                } else if (normalAttr === "mallomatic_head_bottom") {
                    direction = "vertical"
                    headTexture = "mallomatic_head_bottom.png"
                } else if (normalAttr === "mallomatic_head_top") {
                    direction = "vertical"
                    headTexture = "mallomatic_head_top.png"
                }
                
                // Calculate available space
                let verticalSpace = 0
                let horizontalSpace = 0
                
                if (direction === "vertical") {
                    if (normalAttr === "mallomatic_head_bottom") {
                        // Check space above
                        for (let r = rIndex - 1; r >= 0; r--) {
                            let checkTile = childrenRows[r].children[cIndex]
                            let checkNormalAttr = checkTile.getAttribute("normal")
                            if (checkNormalAttr && !isNormalCandy(checkNormalAttr)) {
                                break
                            }
                            verticalSpace++
                        }
                    } else {
                        // Check space below
                        for (let r = rIndex + 1; r < childrenRows.length; r++) {
                            let checkTile = childrenRows[r].children[cIndex]
                            let checkNormalAttr = checkTile.getAttribute("normal")
                            if (checkNormalAttr && !isNormalCandy(checkNormalAttr)) {
                                break
                            }
                            verticalSpace++
                        }
                    }
                } else {
                    if (normalAttr === "mallomatic_head_right") {
                        // Check space to the left
                        for (let c = cIndex - 1; c >= 0; c--) {
                            let checkTile = childrenRows[rIndex].children[c]
                            let checkNormalAttr = checkTile.getAttribute("normal")
                            if (checkNormalAttr && !isNormalCandy(checkNormalAttr)) {
                                break
                            }
                            horizontalSpace++
                        }
                    } else {
                        // Check space to the right
                        for (let c = cIndex + 1; c < childrenRows[0].children.length; c++) {
                            let checkTile = childrenRows[rIndex].children[c]
                            let checkNormalAttr = checkTile.getAttribute("normal")
                            if (checkNormalAttr && !isNormalCandy(checkNormalAttr)) {
                                break
                            }
                            horizontalSpace++
                        }
                    }
                }
                
                // Place body tiles
                let bodyTiles = []
                let maxSpace = 0
                
                if (direction === "vertical") {
                    maxSpace = verticalSpace
                    if (normalAttr === "mallomatic_head_bottom") {
                        // Place tiles above
                        for (let r = rIndex - 1; r >= rIndex - maxSpace; r--) {
                            bodyTiles.push([r, cIndex])
                        }
                    } else {
                        // Place tiles below
                        for (let r = rIndex + 1; r <= rIndex + maxSpace; r++) {
                            bodyTiles.push([r, cIndex])
                        }
                    }
                } else {
                    maxSpace = horizontalSpace
                    if (normalAttr === "mallomatic_head_right") {
                        // Place tiles to the left
                        for (let c = cIndex - 1; c >= cIndex - maxSpace; c--) {
                            bodyTiles.push([rIndex, c])
                        }
                    } else {
                        // Place tiles to the right
                        for (let c = cIndex + 1; c <= cIndex + maxSpace; c++) {
                            bodyTiles.push([rIndex, c])
                        }
                    }
                }
                
                // Place body tiles with alternating marshmallow textures
                let marshmallowIndex = 1
                bodyTiles.forEach(function (pos, index) {
                    try {
                        let otherObject = childrenRows[pos[0]].children[pos[1]]
                        let otherImage = otherObject.querySelector("img.normal")
                        
                        // Set the tile as mall-o-matic (use 231 for body tiles)
                        otherObject.setAttribute("normal", "231")
                        otherObject.setAttribute("color", "")
                        
                        // Determine marshmallow texture
                        let marshmallowTexture = ""
                        if (index === bodyTiles.length - 1) {
                            // Last tile - use ending texture based on the previous marshmallow
                            if (index > 0) {
                                // Check what the previous marshmallow was
                                let previousMarshmallow = (index - 1) % 2 === 0 ? 1 : 2
                                if (previousMarshmallow === 1) {
                                    marshmallowTexture = "mallomatic_marshmallow_3.png"
                                } else {
                                    marshmallowTexture = "mallomatic_marshmallow_4.png"
                                }
                            } else {
                                // Only one body tile - use 3 since it would have been 1
                                marshmallowTexture = "mallomatic_marshmallow_3.png"
                            }
                        } else {
                            // Regular body tile - alternate between 1 and 2
                            marshmallowTexture = "mallomatic_marshmallow_" + marshmallowIndex + ".png"
                            marshmallowIndex = marshmallowIndex === 1 ? 2 : 1
                        }
                        
                        otherImage.src = elementsFolder + marshmallowTexture
                        
                        // Ensure consistent image sizing for marshmallow textures
                        otherImage.style.width = "100%"
                        otherImage.style.height = "100%"
                        otherImage.style.objectFit = "contain"
                        
                        // Rotate body parts based on head direction
                        if (normalAttr === "mallomatic_head_top") {
                            otherImage.style.transform = "rotate(90deg)"
                        } else if (normalAttr === "mallomatic_head_bottom") {
                            otherImage.style.transform = "rotate(-90deg)"
                        } else if (normalAttr === "mallomatic_head_right") {
                            otherImage.style.transform = "rotateY(180deg)"
                        } else {
                            otherImage.style.transform = ""
                        }
                        
                        console.log("Reconstructed body tile with texture:", marshmallowTexture)
                        
                        // Ensure tile has grid
                        if (otherObject.getAttribute("tile") === "000") {
                            otherObject.setAttribute("tile", "001")
                            otherObject.querySelector("img.tile").src = elementsFolder + "grid.png"
                        }
                    } catch (err) {
                        console.warn("Error reconstructing mall-o-matic body tile:", err)
                    }
                })
            }
        })
    })
}

function reconstructSprinksNestAfterImport(childrenRows) {
    // Find all sprinks nest tiles and reconstruct their 2x2 structure
    childrenRows.forEach(function (row, rIndex) {
        let objects = [].slice.call(row.children)
        objects.forEach(function (object, cIndex) {
            let normalAttr = object.getAttribute("normal")
            let cakeAttr = object.getAttribute("cake")
            
            // Check if this is a sprinks nest tile (232) with cake attribute
            if (normalAttr === "232" && cakeAttr) {
                // Determine which corner this tile should be based on cake attribute
                let texture = ""
                if (cakeAttr === "1") {
                    texture = "sprinks_nest_top_left"
                } else if (cakeAttr === "2") {
                    texture = "sprinks_nest_top_right"
                } else if (cakeAttr === "3") {
                    texture = "sprinks_nest_bottom_left"
                } else if (cakeAttr === "4") {
                    texture = "sprinks_nest_bottom_right"
                }
                
                if (texture) {
                    // Update the image to the correct texture
                    let image = object.querySelector("img.normal")
                    if (image) {
                        image.src = elementsFolder + texture + ".png"
                        image.setAttribute("class", "normal default stretch")
                    }
                }
            }
        })
    })
}

function removeSprinksNest(object, isProgrammatic = false) {
    let level = document.getElementById("level")
    let row = Number(object.getAttribute("pos-row"))
    let column = Number(object.getAttribute("pos-col"))
    let normalAttr = object.getAttribute("normal")
    let cakeAttr = object.getAttribute("cake")
    
    // Only proceed if this is a sprinks nest tile
    if (normalAttr !== "232") {
        return
    }
    
    // Clear all 4 tiles of the sprinks nest (2x2 structure)
    let tilesToClear = [
        [row, column],           // Current tile
        [row, column + 1],       // Top right
        [row + 1, column],       // Bottom left
        [row + 1, column + 1]    // Bottom right
    ]
    
    tilesToClear.forEach(function (tilePos) {
        let r = tilePos[0]
        let c = tilePos[1]
        
        if (r < level.children.length && c < level.children[0].children.length) {
            let checkObject = level.children[r].children[c]
            let checkNormalAttr = checkObject.getAttribute("normal")
            
            if (checkNormalAttr === "232") {
                checkObject.setAttribute("normal", "002")
                checkObject.setAttribute("color", "002")
                checkObject.setAttribute("cake", "")
                let image = checkObject.querySelector(".normal")
                if (image) {
                    image.src = elementsFolder + "random.png"
                    image.setAttribute("class", "normal default small")
                }
            }
        }
    })
}

function removeMallOMatic(object) {
    let level = document.getElementById("level")
    let row = Number(object.getAttribute("pos-row"))
    let column = Number(object.getAttribute("pos-col"))
    let normalAttr = object.getAttribute("normal")
    
    // Clear the current tile
    object.setAttribute("normal", "002")
    object.setAttribute("color", "002")
    object.querySelector(".normal").src = elementsFolder + "random.png"
    object.querySelector(".normal").setAttribute("class", "normal default small")
    object.querySelector(".normal").style.transform = "" // Reset rotation
    
    // Determine which direction to check based on the head type
    if (normalAttr === "mallomatic_head_top" || normalAttr === "mallomatic_head_bottom") {
        // Vertical mall-o-matic - check the entire column
        for (let r = 0; r < level.children.length; r++) {
            let checkObject = level.children[r].children[column]
            let checkNormalAttr = checkObject.getAttribute("normal")
            if (checkNormalAttr === "231" || checkNormalAttr === "mallomatic_head_top" || checkNormalAttr === "mallomatic_head_bottom") {
                checkObject.setAttribute("normal", "002")
                checkObject.setAttribute("color", "002")
                checkObject.querySelector(".normal").src = elementsFolder + "random.png"
                checkObject.querySelector(".normal").setAttribute("class", "normal default small")
                // Only reset rotation if it's actually a mall-o-matic part
                if (checkNormalAttr === "231" || checkNormalAttr === "mallomatic_head_top" || checkNormalAttr === "mallomatic_head_bottom") {
                    checkObject.querySelector(".normal").style.transform = "" // Reset rotation
                }
            }
        }
    } else if (normalAttr === "mallomatic_head_left" || normalAttr === "mallomatic_head_right") {
        // Horizontal mall-o-matic - check the entire row
        for (let c = 0; c < level.children[0].children.length; c++) {
            let checkObject = level.children[row].children[c]
            let checkNormalAttr = checkObject.getAttribute("normal")
            if (checkNormalAttr === "231" || checkNormalAttr === "mallomatic_head_left" || checkNormalAttr === "mallomatic_head_right") {
                checkObject.setAttribute("normal", "002")
                checkObject.setAttribute("color", "002")
                checkObject.querySelector(".normal").src = elementsFolder + "random.png"
                checkObject.querySelector(".normal").setAttribute("class", "normal default small")
                // Only reset rotation if it's actually a mall-o-matic part
                if (checkNormalAttr === "231" || checkNormalAttr === "mallomatic_head_left" || checkNormalAttr === "mallomatic_head_right") {
                    checkObject.querySelector(".normal").style.transform = "" // Reset rotation
                }
            }
        }
    } else if (normalAttr === "231") {
        // Body part clicked - find the head and remove the entire structure
        // Check vertical direction first
        let foundHead = false
        for (let r = 0; r < level.children.length; r++) {
            let checkObject = level.children[r].children[column]
            let checkNormalAttr = checkObject.getAttribute("normal")
            if (checkNormalAttr === "mallomatic_head_top" || checkNormalAttr === "mallomatic_head_bottom") {
                foundHead = true
                // Remove entire vertical column
                for (let r2 = 0; r2 < level.children.length; r2++) {
                    let checkObject2 = level.children[r2].children[column]
                    let checkNormalAttr2 = checkObject2.getAttribute("normal")
                    if (checkNormalAttr2 === "231" || checkNormalAttr2 === "mallomatic_head_top" || checkNormalAttr2 === "mallomatic_head_bottom") {
                        checkObject2.setAttribute("normal", "002")
                        checkObject2.setAttribute("color", "002")
                        checkObject2.querySelector(".normal").src = elementsFolder + "random.png"
                        checkObject2.querySelector(".normal").setAttribute("class", "normal default small")
                        // Only reset rotation if it's actually a mall-o-matic part
                        if (checkNormalAttr2 === "231" || checkNormalAttr2 === "mallomatic_head_top" || checkNormalAttr2 === "mallomatic_head_bottom") {
                            checkObject2.querySelector(".normal").style.transform = "" // Reset rotation
                        }
                    }
                }
                break
            }
        }
        
        // If no vertical head found, check horizontal
        if (!foundHead) {
            for (let c = 0; c < level.children[0].children.length; c++) {
                let checkObject = level.children[row].children[c]
                let checkNormalAttr = checkObject.getAttribute("normal")
                if (checkNormalAttr === "mallomatic_head_left" || checkNormalAttr === "mallomatic_head_right") {
                    // Remove entire horizontal row
                    for (let c2 = 0; c2 < level.children[0].children.length; c2++) {
                        let checkObject2 = level.children[row].children[c2]
                        let checkNormalAttr2 = checkObject2.getAttribute("normal")
                        if (checkNormalAttr2 === "231" || checkNormalAttr2 === "mallomatic_head_left" || checkNormalAttr2 === "mallomatic_head_right") {
                            checkObject2.setAttribute("normal", "002")
                            checkObject2.setAttribute("color", "002")
                            checkObject2.querySelector(".normal").src = elementsFolder + "random.png"
                            checkObject2.querySelector(".normal").setAttribute("class", "normal default small")
                            // Only reset rotation if it's actually a mall-o-matic part
                            if (checkNormalAttr2 === "231" || checkNormalAttr2 === "mallomatic_head_left" || checkNormalAttr2 === "mallomatic_head_right") {
                                checkObject2.querySelector(".normal").style.transform = "" // Reset rotation
                            }
                        }
                    }
                    break
                }
            }
        }
    }
    // Auto-save removed - manual saves only via CTRL+S
}

function updateTile(object) {
    
    // Check if we have a selected element from the UI
    let activeElement = document.querySelector(".elementselected")
    let actualSelectedElement = selectedElement
    
    if (activeElement) {
        let elementAttr = activeElement.getAttribute("element")
        if (elementAttr) {
            // For elements that are in elements_ids, use the tilemap code directly
            if (elements_ids[elementAttr]) {
                actualSelectedElement = elements_ids[elementAttr]
            } else {
                actualSelectedElement = elements_names[elementAttr] || elementAttr
            }
        }
    }
    
    // Use the actual selected element
    selectedElement = actualSelectedElement
    
    // Skip processing if a ribbon was just clicked
    if (window.ribbonClicked) {
        return
    }
    
    if (elementLayer !== "tile" && object.getAttribute("tile") === "000") {
        //Do not update tile if its empty
        return
    }
    
    if (isPortalTimeout) {return}
    
    // Prevent placing multiple cobras when waiting for basket
    if (waitingForCobraBasket && elementLayer == "normal" && (selectedElement === "222" || selectedElement === "223" || selectedElement === "224" || selectedElement === "225" || selectedElement === "226")) {
        return
    }
    
    // Mark as unsaved when making changes
    markAsUnsaved();
    
    // Auto-save removed - manual saves only via CTRL+S
    let level = document.getElementById("level")

    let row = Number(object.getAttribute("pos-row"))
    let column = Number(object.getAttribute("pos-col"))

    isCake = object.getAttribute("cake")
    if (isCake !== undefined && isCake !== "" && elementLayer === "normal") {
        removeCake(object)
    }
    
    // Check for mall-o-matic removal
    let isMallOMatic = object.getAttribute("normal") === "231" || object.getAttribute("normal") === "mallomatic_head_top" || object.getAttribute("normal") === "mallomatic_head_left" || object.getAttribute("normal") === "mallomatic_head_right" || object.getAttribute("normal") === "mallomatic_head_bottom"
    if (isMallOMatic && elementLayer === "normal") {
        removeMallOMatic(object)
    }
    
    // Check for sprinks nest removal (only when user clicks on existing sprinks nest, not when placing new one)
    let isSprinksNest = object.getAttribute("normal") === "232"
    if (isSprinksNest && elementLayer === "normal" && selectedElement !== "sprinks_nest") {
        removeSprinksNest(object, false)
        return // Exit early after removal to prevent placement
    }

    // Check for wonderful wrapper removal (only when user clicks on existing wonderful wrapper, not when placing new one)
    let isWonderfulWrapper = object.getAttribute("normal") === "228"
    if (isWonderfulWrapper && (elementLayer === "normal" || elementLayer === "tile") && selectedElement !== "wonderful_base" && selectedElement !== "wonderful_base_vertical") {
        removeWonderfulWrapper(object, false)
        return // Exit early after removal to prevent placement
    }

    let isPortalEntrance = object.getAttribute('portal_entrance')
    let isPortalExit = object.getAttribute('portal_exit')

    let image = object.querySelector("." + elementLayer)

    try {

        if (elementLayer == "portal_entrance") {
            //remove existing portal and its coresponding one
            if (isPortalEntrance) {
                //console.log('removing portal entrance')
                removePortal(object,false)
            }
            lastPortalObject = object
        }
        else if (elementLayer == "portal_exit") {
            //remove existing portal and its corresponding one
            if (isPortalExit) {
                //console.log('removing portal exit')
                removePortal(object,true)
            }

            //set corresponding portal rows/cols
            object.setAttribute('portalentrancerow',lastPortalObject.getAttribute('pos-row'))
            object.setAttribute('portalentrancecol',lastPortalObject.getAttribute('pos-col'))
            lastPortalObject.setAttribute('portalexitrow',row)
            lastPortalObject.setAttribute('portalexitcol',column)
            lastPortalObject = undefined
        }

        if (elementLayer == "wallup") {
            let otherObject = level.children[row - 1].children[column]
            let hasWall = otherObject.getAttribute("walldown")
            if (hasWall !== null && hasWall !== "") {
                otherObject.setAttribute("walldown", "")
                otherObject.querySelector("img.walldown").src = ""
            }
        }
        else if (elementLayer == "walldown") {
            let otherObject = level.children[row + 1].children[column]
            let hasWall = otherObject.getAttribute("wallup")
            if (hasWall !== null && hasWall !== "") {
                otherObject.setAttribute("wallup", "")
                otherObject.querySelector("img.wallup").src = ""
            }
        }
        else if (elementLayer == "wallleft") {
            let otherObject = level.children[row].children[column - 1]
            let hasWall = otherObject.getAttribute("wallright")
            if (hasWall !== null && hasWall !== "") {
                otherObject.setAttribute("wallright", "")
                otherObject.querySelector("img.wallright").src = ""
            }
        }
        else if (elementLayer == "wallright") {
            let otherObject = level.children[row].children[column + 1]
            let hasWall = otherObject.getAttribute("wallleft")
            if (hasWall !== null && hasWall !== "") {
                otherObject.setAttribute("wallleft", "")
                otherObject.querySelector("img.wallleft").src = ""
            }
        }
    } catch { }

    if (elementLayer == "tile") {
        if (selectedElement === "empty") {
            if (isCake !== undefined && isCake !== "") {
                removeCake(object)
            }
            if (isMallOMatic) {
                removeMallOMatic(object)
            }
            if (isSprinksNest) {
                removeSprinksNest(object, false)
            }
            if (isPortalEntrance) {
                try {
                    removePortal(object,false)
                } catch (err) {}
            }
            if (isPortalExit) {
                try {
                    removePortal(object,true)
                } catch(err) {}
            }
                    //Make space empty if empty selected
        layers.forEach(function (layer) {
            if (object.hasAttribute(layer) && layer != "tile") {
                object.setAttribute(layer, "")
            }
        })
        
        // Check if conveyor belts were removed and hide button if none remain
        setTimeout(() => checkConveyorBeltsOnBoard(), 0)
        object.childNodes.forEach(function (node) {
            if (!node.classList.contains("selectimg") && !node.classList.contains("tile")) {
                node.src = ""
                // Reset any transformations when removing elements
                if (node.style) {
                    node.style.transform = ""
                }
            }
        })
        object.setAttribute("color", "")
        
        // Update cobra and basket rotations after clearing
        setTimeout(() => updateAllCobraBasketRotations(), 0)
        return
        }
        object.setAttribute("tile", selectedElement)
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"

        //Remove all if empty
        if (selectedElement === "000") {
            if (isCake !== undefined && isCake !== "") {
                removeCake(object)
            }
            if (isMallOMatic) {
                removeMallOMatic(object)
            }

            if (isPortalEntrance) {
                removePortal(object,false)
            }

            if (isPortalExit) {
                removePortal(object,true)
            }

            layers.forEach(function (layer) {
                if (object.hasAttribute(layer)) {
                    object.setAttribute(layer, "")
                }
            })
            
            // Check if conveyor belts were removed and hide button if none remain
            setTimeout(() => checkConveyorBeltsOnBoard(), 0)
            object.childNodes.forEach(function (node) {
                if (!node.classList.contains("selectimg") && !node.classList.contains("tile")) {
                    node.src = ""
                    // Reset any transformations when removing elements
                    if (node.style) {
                        node.style.transform = ""
                    }
                }
            })
            object.setAttribute("color", "")
            
            // Update cobra and basket rotations after clearing
            setTimeout(() => updateAllCobraBasketRotations(), 0)
        }
    }
    if (elementLayer == "sugarcoat") {
        if (object.getAttribute("normal") in coloredCandy || sugarCoatable.includes(object.getAttribute("normal"))) {
            object.setAttribute(elementLayer, selectedElement)
            image.src = elementsFolder + elements_ids[selectedElement] + ".png"
        }
        else {
            return
        }
    }
    else if (selectedElement == "035") {
        let level = document.getElementById("level")

        if (row >= 8 || column >= 8) {
            return
        }

        //Set this tile as cakebomb
        let isCake = object.getAttribute("cake")
        if (isCake !== undefined && isCake !== "") {
            removeCake(object)
        }
        image.src = elementsFolder + "cake_top_left" + ".png"
        image.setAttribute("class", "normal default stretch")
        object.setAttribute("normal", selectedElement)
        object.setAttribute("color", "")
        object.setAttribute("cake", "1")

        let tileList = [[row, column + 1, "cake_top_right", "2"], [row + 1, column, "cake_bottom_left", "3"], [row + 1, column + 1, "cake_bottom_right", "4"]]

        tileList.forEach(function (info) {
            try {
                let otherObject = level.children[info[0]].children[info[1]]
                let otherImage = otherObject.querySelector("img.normal")

                isCake = otherObject.getAttribute("cake")
                if (isCake !== undefined && isCake !== "") {
                    removeCake(otherObject)
                }

                otherImage.src = elementsFolder + info[2] + ".png"
                otherImage.setAttribute("class", "normal default stretch")
                otherObject.setAttribute("normal", selectedElement)
                otherObject.setAttribute("sugarcoat", "")
                otherObject.querySelector("img.sugarcoat").src = ""
                otherObject.setAttribute("color", "")
                otherObject.setAttribute("cake", info[3])
                if (otherObject.getAttribute("tile") === "000") {
                    otherObject.setAttribute("tile", "001")
                    otherObject.querySelector("img.tile").src = elementsFolder + "grid.png"
                }
            } catch { }
        })
    }
    else if (selectedElement == "sprinks_nest") {
        let level = document.getElementById("level")

        // Check if there's already a sprinks nest in the level and remove it
        let existingSprinksNest = false
        for (let r = 0; r < level.children.length; r++) {
            for (let c = 0; c < level.children[r].children.length; c++) {
                let checkObject = level.children[r].children[c]
                let checkNormalAttr = checkObject.getAttribute("normal")
                if (checkNormalAttr === "232") {
                    existingSprinksNest = true
                    // Remove the existing sprinks nest
                    removeSprinksNest(checkObject, true)
                    break
                }
            }
            if (existingSprinksNest) break
        }

        if (row >= 8 || column >= 8) {
            return
        }

        //Set this tile as sprinks_nest
        let isCake = object.getAttribute("cake")
        if (isCake !== undefined && isCake !== "") {
            removeCake(object)
        }
        image.src = elementsFolder + "sprinks_nest_top_left" + ".png"
        image.setAttribute("class", "normal default stretch")
        object.setAttribute("normal", "232")
        object.setAttribute("color", "")
        object.setAttribute("cake", "1")

        let tileList = [[row, column + 1, "sprinks_nest_top_right", "2"], [row + 1, column, "sprinks_nest_bottom_left", "3"], [row + 1, column + 1, "sprinks_nest_bottom_right", "4"]]

        tileList.forEach(function (info) {
            try {
                let otherObject = level.children[info[0]].children[info[1]]
                let otherImage = otherObject.querySelector("img.normal")

                isCake = otherObject.getAttribute("cake")
                if (isCake !== undefined && isCake !== "") {
                    removeCake(otherObject)
                }

                otherImage.src = elementsFolder + info[2] + ".png"
                otherImage.setAttribute("class", "normal default stretch")
                otherObject.setAttribute("normal", "232")
                otherObject.setAttribute("sugarcoat", "")
                otherObject.querySelector("img.sugarcoat").src = ""
                otherObject.setAttribute("color", "")
                otherObject.setAttribute("cake", info[3])
                if (otherObject.getAttribute("tile") === "000") {
                    otherObject.setAttribute("tile", "001")
                    otherObject.querySelector("img.tile").src = elementsFolder + "grid.png"
                }
            } catch { }
        })
    }
    else if (selectedElement == "036") {
        try {
            let prevElm = document.querySelector(".frog")
            prevElm.classList.remove("frog")

            if (prevElm.getAttribute("normal") === "036" || prevElm.getAttribute("normal") === "053") {
                prevElm.setAttribute("normal", "002")
                prevElm.setAttribute("color", selectedColor)
                prevElm.querySelector(".normal").src = elementsFolder + "random.png"
                prevElm.querySelector(".normal").setAttribute("class", "normal default small")
            }
        } catch { }

        //Set colored Candy
        let colorName = elements_ids[selectedColor]
        let elementName = ""
        let name = ""

        if (selectedColor === "002" && selectedElement === "002") {
            name = "random"
        }
        else if (selectedColor !== "002" && selectedElement === "002") {
            name = colorName
        }
        else {
            elementName = elements_ids[selectedElement] + "_"
            name = elementName + colorName
        }

        object.setAttribute(elementLayer, selectedElement)
        object.classList.add("frog")
        image.src = elementsFolder + name + ".png"
    }
    else if (selectedElement == "053") {
        try {
            let prevElm = document.querySelector(".frog")
            console.log(prevElm)
            prevElm.classList.remove("frog")

            if (prevElm.getAttribute("normal") === "036" || prevElm.getAttribute("normal") === "053") {
                prevElm.setAttribute("normal", "002")
                prevElm.setAttribute("color", selectedColor)
                prevElm.querySelector(".normal").src = elementsFolder + "random.png"
                prevElm.querySelector(".normal").setAttribute("class", "normal default small")
            }
        } catch { }

        object.classList.add("frog")
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"
        object.setAttribute("normal", selectedElement)
        object.setAttribute("color", "")
    }
    else if (elementLayer == "candy_cannon" && selectedElement != "005") {
        let cannonElements = JSON.parse(object.getAttribute("candy_cannon") || '[]')

        if (!cannonElements.includes(selectedElement)) {
            if (!cannonElements.includes("005")) {

                cannonElements.push("005")
            }

            cannonElements.push(selectedElement)

            object.setAttribute("candy_cannon", JSON.stringify(cannonElements))

            let ammocontainer = object.querySelector(".ammocontainer")

            Array.from(ammocontainer.children).forEach(function (element) {
                if (!cannonElements.includes(element.getAttribute("element"))) {
                    element.remove()
                }
            })

            ammoimage = ammocontainer.appendChild(document.createElement("img"))

            ammoimage.setAttribute("element", selectedElement)

            ammoimage.src = elementsFolder + elements_ids[selectedElement] + ".png"
        }
    }
    else if (selectedElement == "026") {
        let cannonElements = JSON.parse(object.getAttribute("candy_cannon") || '[]')

        if (!cannonElements.includes("005")) {

            cannonElements.push("005")
        }

        object.setAttribute("candy_cannon", JSON.stringify(cannonElements))

        object.setAttribute(elementLayer, selectedElement)
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"
    }
    else if (selectedElement == "005") {
        let cannonElements = JSON.parse(object.getAttribute("candy_cannon") || '[]')

        if (!cannonElements.includes("005")) {

            cannonElements.push("005")
        }

        let ammocontainer = object.querySelector(".ammocontainer")

        Array.from(ammocontainer.children).forEach(function (element) {
            if (!cannonElements.includes(element.getAttribute("element"))) {
                element.remove()
            }
        })

        object.setAttribute("candy_cannon", JSON.stringify(cannonElements))
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"
    }
    else if (elementLayer == "normal" && (selectedElement === "222" || selectedElement === "223" || selectedElement === "224" || selectedElement === "225" || selectedElement === "226")) {
        // Handle candy cobra placement
        object.setAttribute(elementLayer, selectedElement)
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"
        
        // Ensure cobra starts with no rotation or scaling (default direction)
        image.style.transform = ""
        
        // Store cobra information for basket placement
        lastCobraTile = [row, column]
        lastCobraLayer = cobraLayerMapping[elements_ids[selectedElement]]
        waitingForCobraBasket = true
        
        // Store the original cobra element for switching back
        lastCobraElement = elements_ids[selectedElement]
        
        // Switch to cobra basket selection
        updateSelection(false, 'cobra_basket', 'cobra_basket')
        return // Prevent function from continuing
    }
    else if (selectedElement === "231" || selectedElement === "mallomatic_head_top" || selectedElement === "mallomatic_head_left" || selectedElement === "mallomatic_head_right" || selectedElement === "mallomatic_head_bottom") {
        console.log("About to check mall-o-matic condition...")
        console.log("Checking mall-o-matic condition with selectedElement:", selectedElement)
        // Handle mall-o-matic placement
        console.log("Mall-o-matic placement triggered:", selectedElement)
        let level = document.getElementById("level")
        
        // Allow placement anywhere - body parts will only be placed if space is available
        
        // Determine direction based on selected element
        let direction = "vertical" // default
        let headTexture = "mallomatic_head_top.png"
        
        if (selectedElement == "mallomatic_head_left") {
            direction = "horizontal"
            headTexture = "mallomatic_head_left.png"
        } else if (selectedElement == "mallomatic_head_right") {
            direction = "horizontal"
            headTexture = "mallomatic_head_right.png"
        } else if (selectedElement == "mallomatic_head_bottom") {
            direction = "vertical"
            headTexture = "mallomatic_head_bottom.png"
        } else if (selectedElement == "mallomatic_head_top") {
            direction = "vertical"
            headTexture = "mallomatic_head_top.png"
        } else {
            // Original 231 logic - determine direction by checking available space
            let verticalSpace = 0
            let horizontalSpace = 0
            
            // Check vertical space (down)
            for (let r = row + 1; r < level.children.length; r++) {
                let checkTile = level.children[r].children[column]
                if (checkTile.getAttribute("normal") && checkTile.getAttribute("normal") !== "002") {
                    break
                }
                verticalSpace++
            }
            
            // Check horizontal space (right)
            for (let c = column + 1; c < level.children[0].children.length; c++) {
                let checkTile = level.children[row].children[c]
                if (checkTile.getAttribute("normal") && checkTile.getAttribute("normal") !== "002") {
                    break
                }
                horizontalSpace++
            }
            
            // Determine direction based on available space
            if (horizontalSpace > verticalSpace) {
                direction = "horizontal"
                headTexture = "mallomatic_head_left.png"
            }
        }
        
        // Calculate available space for all cases
        let verticalSpace = 0
        let horizontalSpace = 0
        
        // Check vertical space (direction depends on head type)
        if (selectedElement === "mallomatic_head_bottom") {
            // For bottom head, check space above
            for (let r = row - 1; r >= 0; r--) {
                let checkTile = level.children[r].children[column]
                let normalAttr = checkTile.getAttribute("normal")
                console.log("Checking vertical tile at", r, column, "normal:", normalAttr)
                if (normalAttr && !isNormalCandy(normalAttr)) {
                    console.log("Stopping vertical check at", r, "because normal is:", normalAttr)
                    break
                }
                verticalSpace++
            }
        } else {
            // For top head, check space below
            for (let r = row + 1; r < level.children.length; r++) {
                let checkTile = level.children[r].children[column]
                let normalAttr = checkTile.getAttribute("normal")
                console.log("Checking vertical tile at", r, column, "normal:", normalAttr)
                if (normalAttr && !isNormalCandy(normalAttr)) {
                    console.log("Stopping vertical check at", r, "because normal is:", normalAttr)
                    break
                }
                verticalSpace++
            }
        }
        
        // Check horizontal space (direction depends on head type)
        if (selectedElement === "mallomatic_head_right") {
            // For right head, check space to the left
            for (let c = column - 1; c >= 0; c--) {
                let checkTile = level.children[row].children[c]
                let normalAttr = checkTile.getAttribute("normal")
                console.log("Checking horizontal tile at", row, c, "normal:", normalAttr)
                if (normalAttr && !isNormalCandy(normalAttr)) {
                    console.log("Stopping horizontal check at", c, "because normal is:", normalAttr)
                    break
                }
                horizontalSpace++
            }
        } else {
            // For left head, check space to the right
            for (let c = column + 1; c < level.children[0].children.length; c++) {
                let checkTile = level.children[row].children[c]
                let normalAttr = checkTile.getAttribute("normal")
                console.log("Checking horizontal tile at", row, c, "normal:", normalAttr)
                if (normalAttr && !isNormalCandy(normalAttr)) {
                    console.log("Stopping horizontal check at", c, "because normal is:", normalAttr)
                    break
                }
                horizontalSpace++
            }
        }
        
        object.setAttribute("normal", selectedElement)
        object.setAttribute("color", "")
        image.src = elementsFolder + headTexture
        
        // Ensure consistent image sizing for head texture
        image.style.width = "100%"
        image.style.height = "100%"
        image.style.objectFit = "contain"
        
        // Don't rotate the head - only body parts will be rotated
        image.style.transform = ""
        
        console.log("Head tile set:", {
            normal: selectedElement,
            texture: headTexture,
            direction: direction,
            verticalSpace: verticalSpace,
            horizontalSpace: horizontalSpace
        })
        
        // Place body tiles
        let bodyTiles = []
        let maxSpace = 0
        
        if (direction === "vertical") {
            // Place tiles vertically - fill entire column
            maxSpace = verticalSpace // Use all available space
            console.log("Vertical placement: verticalSpace =", verticalSpace, "maxSpace =", maxSpace)
            if (selectedElement === "mallomatic_head_bottom") {
                // For bottom head, place tiles above
                for (let r = row - 1; r >= row - maxSpace; r--) {
                    bodyTiles.push([r, column])
                    console.log("Added vertical body tile at:", r, column)
                }
            } else {
                // For top head, place tiles below
                for (let r = row + 1; r <= row + maxSpace; r++) {
                    bodyTiles.push([r, column])
                    console.log("Added vertical body tile at:", r, column)
                }
            }
        } else {
            // Place tiles horizontally - fill entire row
            maxSpace = horizontalSpace // Use all available space
            console.log("Horizontal placement: horizontalSpace =", horizontalSpace, "maxSpace =", maxSpace)
            if (selectedElement === "mallomatic_head_right") {
                // For right head, place tiles to the left
                for (let c = column - 1; c >= column - maxSpace; c--) {
                    bodyTiles.push([row, c])
                    console.log("Added horizontal body tile at:", row, c)
                }
            } else {
                // For left head, place tiles to the right
                for (let c = column + 1; c <= column + maxSpace; c++) {
                    bodyTiles.push([row, c])
                    console.log("Added horizontal body tile at:", row, c)
                }
            }
        }
        
        // Place body tiles with alternating marshmallow textures
        let marshmallowIndex = 1
        bodyTiles.forEach(function (pos, index) {
            try {
                console.log("Placing body tile at:", pos, "index:", index)
                let otherObject = level.children[pos[0]].children[pos[1]]
                let otherImage = otherObject.querySelector("img.normal")
                
                // Set the tile as mall-o-matic (use 231 for body tiles)
                otherObject.setAttribute("normal", "231")
                otherObject.setAttribute("color", "")
                
                // Determine marshmallow texture
                let marshmallowTexture = ""
                if (index === bodyTiles.length - 1) {
                    // Last tile - use ending texture based on the previous marshmallow
                    if (index > 0) {
                        // Check what the previous marshmallow was
                        let previousMarshmallow = (index - 1) % 2 === 0 ? 1 : 2
                        if (previousMarshmallow === 1) {
                            marshmallowTexture = "mallomatic_marshmallow_3.png"
                        } else {
                            marshmallowTexture = "mallomatic_marshmallow_4.png"
                        }
                    } else {
                        // Only one body tile - use 3 since it would have been 1
                        marshmallowTexture = "mallomatic_marshmallow_3.png"
                    }
                } else {
                    // Regular body tile - alternate between 1 and 2
                    marshmallowTexture = "mallomatic_marshmallow_" + marshmallowIndex + ".png"
                    marshmallowIndex = marshmallowIndex === 1 ? 2 : 1
                }
                
                otherImage.src = elementsFolder + marshmallowTexture
                
                // Ensure consistent image sizing for marshmallow textures
                otherImage.style.width = "100%"
                otherImage.style.height = "100%"
                otherImage.style.objectFit = "contain"
                
                // Rotate body parts based on head direction
                if (selectedElement === "mallomatic_head_top") {
                    otherImage.style.transform = "rotate(90deg)"
                } else if (selectedElement === "mallomatic_head_bottom") {
                    otherImage.style.transform = "rotate(-90deg)"
                } else if (selectedElement === "mallomatic_head_right") {
                    otherImage.style.transform = "rotateY(180deg)"
                } else {
                    otherImage.style.transform = ""
                }
                
                console.log("Body tile placed with texture:", marshmallowTexture)
                
                // Ensure tile has grid
                if (otherObject.getAttribute("tile") === "000") {
                    otherObject.setAttribute("tile", "001")
                    otherObject.querySelector("img.tile").src = elementsFolder + "grid.png"
                }
            } catch (err) {
                console.warn("Error placing mall-o-matic body tile:", err)
            }
        })
        
        return // Prevent falling through to the else clause
    }
    else if (selectedElement == "228") {
        let level = document.getElementById("level")
        // Determine orientation from the global flag
        let isVertical = window.isWonderfulVertical || false
        
        // Allow multiple wonderful wrappers - no need to remove existing ones

        // Check if placement is valid (need space for structure)
        if (isVertical) {
            // Check if we have space for 1x2 vertical structure
            if (row >= 8) {
                return
            }
        } else {
            // Check if we have space for 2x1 horizontal structure
            if (column >= 8) {
                return
            }
        }
        
        // Set this tile as wonderful wrapper base (left tile)
        let isCake = object.getAttribute("cake")
        if (isCake !== undefined && isCake !== "") {
            removeCake(object)
        }
        image.src = elementsFolder + "wonderful_base_left.png"
        image.setAttribute("class", "normal default stretch")
        image.style.zIndex = "2"  // Above contained elements (z-index 1) but below ribbons (z-index 3)
        
        // Apply rotation for vertical orientation
        if (isVertical) {
            image.style.transform = "rotate(90deg)"
        }
        
        object.setAttribute("normal", selectedElement)
        object.setAttribute("color", "")
        object.setAttribute("wonderful_wrapper", "1")
        object.setAttribute("wonderful_orientation", isVertical ? "vertical" : "horizontal")

        // Place the second tile of the structure
        try {
            let otherObject, otherImage
            if (isVertical) {
                // For vertical: place below (row + 1)
                otherObject = level.children[row + 1].children[column]
                otherImage = otherObject.querySelector("img.normal")
            } else {
                // For horizontal: place to the right (column + 1)
                otherObject = level.children[row].children[column + 1]
                otherImage = otherObject.querySelector("img.normal")
            }

            isCake = otherObject.getAttribute("cake")
            if (isCake !== undefined && isCake !== "") {
                removeCake(otherObject)
            }

        otherImage.src = elementsFolder + "wonderful_base_right.png"
        otherImage.setAttribute("class", "normal default stretch")
        otherImage.style.zIndex = "2"  // Above contained elements (z-index 1) but below ribbons (z-index 3)
        
        // Apply rotation for vertical orientation
        if (isVertical) {
            otherImage.style.transform = "rotate(90deg)"
        }
            
            otherObject.setAttribute("normal", selectedElement)
            otherObject.setAttribute("sugarcoat", "")
            otherObject.querySelector("img.sugarcoat").src = ""
            otherObject.setAttribute("color", "")
            otherObject.setAttribute("wonderful_wrapper", "2")
            otherObject.setAttribute("wonderful_orientation", isVertical ? "vertical" : "horizontal")
            
            // Ensure tile has grid
            if (otherObject.getAttribute("tile") === "000") {
                otherObject.setAttribute("tile", "001")
                otherObject.querySelector("img.tile").src = elementsFolder + "grid.png"
            }
            debugWonderfulWrappers()
        } catch (err) {
        }
    }
    else if (elementLayer == "wonderful" || (elementLayer == "normal" && selectedElement && (selectedElement === "striped_horizontal" || selectedElement === "striped_vertical" || selectedElement === "wrapped" || selectedElement === "jellyfish"))) {
        // Handle wonderful wrapper ribbons and contained elements
        if (object.getAttribute("normal") === "228" || object.getAttribute("wonderful_wrapper")) {
            
            if (selectedElement && selectedElement.includes("stripe")) {
                
                // Check if we're clicking on an existing ribbon - if so, skip ribbon creation
                // This prevents the tile click from interfering with ribbon clicks
                const clickedElement = document.activeElement || document.querySelector(':hover')
                if (clickedElement && clickedElement.classList.contains("ribbon-element")) {
                    return
                }
                

                
                // Get the main wonderful wrapper tile (tile 1)
                let mainTile = object
                let level = document.getElementById("level")
                let row = Number(object.getAttribute("pos-row"))
                let column = Number(object.getAttribute("pos-col"))
                let wonderfulWrapper = object.getAttribute("wonderful_wrapper")
                
                // Ensure we're working with the main tile (tile 1)
                if (wonderfulWrapper == "2") {
                    mainTile = level.children[row].children[column - 1]
                }
                
                // Create or get the ribbons container div
                let ribbonsContainer = mainTile.querySelector(".ribbons-container")
                if (!ribbonsContainer) {
                    ribbonsContainer = document.createElement("div")
                    ribbonsContainer.classList.add("ribbons-container")
                    ribbonsContainer.style.position = "absolute"
                    ribbonsContainer.style.top = "0"
                    ribbonsContainer.style.left = "0"
                    // Set dimensions based on orientation
                    if (mainTile.getAttribute("wonderful_orientation") === "vertical") {
                        ribbonsContainer.style.width = "100%"  // Span the full 1x2 area
                        ribbonsContainer.style.height = "200%"
                        ribbonsContainer.style.transform = "rotate(90deg) scale(2)"  // Rotate and scale entire container
                    } else {
                        ribbonsContainer.style.width = "200%"  // Span the full 2x1 area
                        ribbonsContainer.style.height = "100%"
                        ribbonsContainer.style.transform = ""
                    }
                    ribbonsContainer.style.zIndex = "3"
                    ribbonsContainer.style.display = "flex"
                    ribbonsContainer.style.gap = "0"
                    ribbonsContainer.style.pointerEvents = "auto"
                    mainTile.appendChild(ribbonsContainer)
                }
                
                // Check if we already have ribbons - if not, create 5 random ones
                if (ribbonsContainer.children.length === 0) {
                    const ribbonTypes = ["wonderful_blue_stripe", "wonderful_red_stripe", "wonderful_yellow_stripe", "wonderful_green_stripe", "wonderful_purple_stripe", "wonderful_orange_stripe"]
                    
                    // Clear existing ribbon attributes
                    ribbonTypes.forEach(ribbonType => {
                        mainTile.removeAttribute(ribbonType)
                    })
                    
                    // Place 5 random ribbons
                    for (let i = 0; i < 5; i++) {
                        const randomRibbonType = ribbonTypes[Math.floor(Math.random() * ribbonTypes.length)]
                        
                        // Create ribbon element
                        let ribbonElement = document.createElement("img")
                        ribbonElement.classList.add("ribbon-element")
                        
                        ribbonElement.style.cssText = `
                            position: static !important;
                            flex: 1 !important;
                            min-width: 0 !important;
                            height: 100% !important;
                            object-fit: contain !important;
                            object-position: center !important;
                            pointer-events: auto !important;
                            top: auto !important;
                            left: auto !important;
                            bottom: auto !important;
                            right: auto !important;
                            margin: 0 !important;
                            z-index: auto !important;
                            cursor: pointer !important;
                        `
                        
                        ribbonElement.src = elementsFolder + "wonderful_random_stripe.png"
                        ribbonElement.setAttribute("data-ribbon-type", randomRibbonType)
                        ribbonElement.setAttribute("data-ribbon-index", i)
                        
                        // Add click event to replace this ribbon
                        ribbonElement.addEventListener("click", function(event) {
                            
                            // Stop the event from bubbling up to the tile
                            event.stopPropagation()
                            event.preventDefault()
                            event.stopImmediatePropagation()
                            
                            // Set a flag to prevent tile click processing
                            window.ribbonClicked = true
                            setTimeout(() => { window.ribbonClicked = false }, 100)
                            
                            // Check if a ribbon is currently selected using the global selectedElement variable
                            
                            if (selectedElement && selectedElement.includes("stripe")) {
                                const selectedRibbonType = selectedElement
                                
                                // Get the old ribbon type from data attribute
                                const oldRibbonType = this.getAttribute("data-ribbon-type")
                                
                                // Update the ribbon image and type
                                if (selectedRibbonType === "wonderful_blue_stripe") {
                                    this.src = elementsFolder + "wonderful_blue_stripe.webp"
                                } else if (selectedRibbonType === "wonderful_red_stripe") {
                                    this.src = elementsFolder + "wonderful_red_stripe.webp"
                                } else if (selectedRibbonType === "wonderful_yellow_stripe") {
                                    this.src = elementsFolder + "wonderful_yellow_stripe.webp"
                                } else if (selectedRibbonType === "wonderful_green_stripe") {
                                    this.src = elementsFolder + "wonderful_green_stripe.webp"
                                } else if (selectedRibbonType === "wonderful_purple_stripe") {
                                    this.src = elementsFolder + "wonderful_purple_stripe.webp"
                                } else if (selectedRibbonType === "wonderful_orange_stripe") {
                                    this.src = elementsFolder + "wonderful_orange_stripe.webp"
                                }
                                

                                
                                this.setAttribute("data-ribbon-type", selectedRibbonType)
                                
                                // Update the tile attribute - remove old, add new
                                // Need to check both tiles since ribbons are distributed
                                let otherTile
                                if (mainTile.getAttribute("wonderful_orientation") === "vertical") {
                                    // For vertical: other tile is below
                                    otherTile = level.children[row + 1].children[column]
                                } else {
                                    // For horizontal: other tile is to the right
                                    otherTile = level.children[row].children[column + 1]
                                }
                                
                                // Remove old attribute from both tiles
                                if (oldRibbonType) {
                                    mainTile.removeAttribute(oldRibbonType)
                                    otherTile.removeAttribute(oldRibbonType)
                                }
                                
                                // Add new attribute to the appropriate tile based on ribbon index
                                const ribbonIndex = parseInt(this.getAttribute("data-ribbon-index"))
                                if (ribbonIndex < 3) {
                                    // First 3 ribbons go to main tile (tile 1)
                                    mainTile.setAttribute(selectedRibbonType, "true")
                                } else {
                                    // Last 2 ribbons go to other tile (tile 2)
                                    otherTile.setAttribute(selectedRibbonType, "true")
                                }
                                
                                debugWonderfulWrappers()
                            } else {
                                
                                // Debug: Check all wonderful ribbon buttons
                                const allRibbonButtons = document.querySelectorAll('.selectelement[element^="wonderful_"][element$="_stripe"]')
                                
                                allRibbonButtons.forEach(btn => {
                                    const element = btn.getAttribute("element")
                                    const style = btn.style.backgroundColor
                                })
                            }
                            
                            // Return false to prevent any further event handling
                            return false
                        })
                        
                        ribbonsContainer.appendChild(ribbonElement)
                        
                        // Distribute ribbon attributes across the structure
                        // First 3 ribbons go to tile 1, last 2 ribbons go to tile 2
                        if (i < 3) {
                            // First 3 ribbons (0, 1, 2) go to main tile (tile 1)
                            mainTile.setAttribute(randomRibbonType, "true")
                        } else {
                            // Last 2 ribbons (3, 4) go to the other tile (tile 2)
                            let otherTile
                            if (mainTile.getAttribute("wonderful_orientation") === "vertical") {
                                // For vertical: other tile is below
                                otherTile = level.children[row + 1].children[column]
                            } else {
                                // For horizontal: other tile is to the right
                                otherTile = level.children[row].children[column + 1]
                            }
                            otherTile.setAttribute(randomRibbonType, "true")
                        }
                    }
                    
                    debugWonderfulWrappers()
                } else {
                }
                
                return // Exit early to prevent further processing
            } else {
                
                // Get the main wonderful wrapper tile (tile 1) to store attributes
                let mainTile = object
                let level = document.getElementById("level")
                let row = Number(object.getAttribute("pos-row"))
                let column = Number(object.getAttribute("pos-col"))
                let wonderfulWrapper = object.getAttribute("wonderful_wrapper")
                
                // Ensure we're working with the main tile (tile 1) for attribute storage
                if (wonderfulWrapper == "2") {
                    if (object.getAttribute("wonderful_orientation") === "vertical") {
                        mainTile = level.children[row - 1].children[column]
                    } else {
                        mainTile = level.children[row].children[column - 1]
                    }
                }
                
                
                // Check if this tile is part of a wonderful wrapper (either tile 1 or tile 2)
                let isWonderfulWrapperTile = (wonderfulWrapper === "1" || wonderfulWrapper === "2") || (mainTile.getAttribute("wonderful_wrapper") === "1" || mainTile.getAttribute("wonderful_wrapper") === "2")
                if (!isWonderfulWrapperTile) {
                    return
                }
                
                // Create contained element overlay on the clicked tile (either tile 1 or tile 2)
                let elementOverlay = object.querySelector(".element-overlay")
                
                if (!elementOverlay) {
                    elementOverlay = document.createElement("img")
                    elementOverlay.classList.add("element-overlay")
                    elementOverlay.style.position = "absolute"
                    elementOverlay.style.top = "0"
                    elementOverlay.style.left = "0"
                    elementOverlay.style.width = "100%"
                    elementOverlay.style.height = "100%"
                    elementOverlay.style.zIndex = "1"  // Above the tile background but behind the wonderful wrapper base and ribbons
                    elementOverlay.style.pointerEvents = "none"
                    object.appendChild(elementOverlay)
                }
                
                
                // Convert regular element names to wonderful wrapper format
                let wonderfulElementName = ""
                let colorName = elements_ids[selectedColor] || "random"
                
                
                // Set image source directly with hardcoded path
                if (selectedElement === "044" || selectedElement === "colorbomb") {
                    elementOverlay.src = "elements/bomb.png"
                    wonderfulElementName = "wonderful_colorbomb"
                } else if (selectedElement === "045" || selectedElement === "striped_horizontal") {
                    elementOverlay.src = "elements/striped_horizontal_" + colorName + ".png"
                    wonderfulElementName = "wonderful_striped_horizontal"
                } else if (selectedElement === "046" || selectedElement === "striped_vertical") {
                    elementOverlay.src = "elements/striped_vertical_" + colorName + ".png"
                    wonderfulElementName = "wonderful_striped_vertical"
                } else if (selectedElement === "047" || selectedElement === "wrapped") {
                    elementOverlay.src = "elements/wrapped_" + colorName + ".png"
                    wonderfulElementName = "wonderful_wrapped"
                } else if (selectedElement === "049" || selectedElement === "jellyfish") {
                    elementOverlay.src = "elements/jellyfish_" + colorName + ".png"
                    wonderfulElementName = "wonderful_jellyfish"
                }
                
                
                // Add error handling for image loading
                elementOverlay.onerror = function() {
                    // Try to load a fallback image
                    if (selectedElement === "044" || selectedElement === "colorbomb") {
                        elementOverlay.src = "elements/bomb.png"
                    } else if (selectedElement === "045" || selectedElement === "striped_horizontal") {
                        elementOverlay.src = "elements/striped_horizontal_random.png"
                    } else if (selectedElement === "046" || selectedElement === "striped_vertical") {
                        elementOverlay.src = "elements/striped_vertical_random.png"
                    } else if (selectedElement === "047" || selectedElement === "wrapped") {
                        elementOverlay.src = "elements/wrapped_random.png"
                    } else if (selectedElement === "049" || selectedElement === "jellyfish") {
                        elementOverlay.src = "elements/jellyfish_random.png"
                    }
                }
                
                // Store color information for colored elements (not color bomb)
                if (wonderfulElementName && wonderfulElementName !== "wonderful_colorbomb" && selectedColor !== "002") {
                    let colorName = elements_ids[selectedColor]
                    if (colorName) {
                        let colorAttr = wonderfulElementName + "_color"
                        object.setAttribute(colorAttr, colorName)
                    }
                }
                
                // Store the attribute on the tile where the element was placed
                if (wonderfulElementName) {
                    object.setAttribute(wonderfulElementName, "true")
                }
            }
        } else {
        }
    }
    else if (elementLayer == "normal") {
        image = object.querySelector(".normal")
        
        // Safety check for undefined selectedElement
        if (!selectedElement) {
            return
        }
        
        // Skip wonderful wrapper elements in normal layer - they're handled in wonderful layer
        if (selectedElement && selectedElement.startsWith("wonderful_")) {
            return
        }
        
        // Skip if this is a wonderful wrapper tile and we're not placing a wonderful wrapper base
        if (object.getAttribute("wonderful_wrapper") && selectedElement && selectedElement !== "wonderful_base" && selectedElement !== "wonderful_base_vertical") {
            return
        }

        
        if (selectedElement in coloredCandy) {
            //Set colored Candy
            let colorName = elements_ids[selectedColor]
            let elementName = ""
            let name = ""

            if (selectedColor === "002" && selectedElement === "002") {
                name = "random"
            }
            else if (selectedColor !== "002" && selectedElement === "002") {
                name = colorName
            }
            else {
                elementName = elements_ids[selectedElement] + "_"
                name = elementName + colorName
            }

            image.src = elementsFolder + name + ".png"
            object.setAttribute("normal", selectedElement)
            object.setAttribute("color", selectedColor)
        }
        else {
            //Set non colored candy
            image.src = elementsFolder + elements_ids[selectedElement] + ".png"
            object.setAttribute("normal", selectedElement)
            object.setAttribute("color", "")
        }
        
        // Add error handling for image loading
        if (image) {
            image.onerror = function() {
                // Try to load a fallback image
                if (selectedElement in coloredCandy) {
                    image.src = elementsFolder + "random.png"
                } else {
                    image.src = elementsFolder + elements_ids[selectedElement] + ".png"
                }
            }
        }
        
    } else if (elementLayer=='portal_entrance' || elementLayer=='portal_exit') {
        //set image
        object.setAttribute(elementLayer, selectedElement)
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"

        //switch to other portal if one is placed
        if (selectedElement=='012') {
            updateSelection(false,'portal_exit','portal_exit')
        } else if (selectedElement == '014') {
            updateSelection(false,'portal_exit_hidden','portal_exit')
        } else if (selectedElement=='013') {
            isPortalTimeout=true
            updateSelection(false,'portal_entrance','portal_entrance')
        } else if (selectedElement == '015') {
            isPortalTimeout=true
            updateSelection(false,'portal_entrance_hidden','portal_entrance')
        }
    }
    else if (elementLayer == "conveyor") {
        // Handle conveyor belt placement
        object.setAttribute(elementLayer, selectedElement)
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"
        
        // Show the "Done putting conveyor belt" button
        const btn = document.getElementById('done-conveyor-btn')
        if (btn) {
            btn.style.display = 'block'
        }
        
        // Start conveyor grouping mode if not already active
        if (!isConveyorGroupingMode) {
            startConveyorGrouping()
        }
        
        // Add this belt to the current group
        const belt = {
            row: parseInt(object.getAttribute('pos-row')),
            col: parseInt(object.getAttribute('pos-col')),
            type: selectedElement,
            direction: conveyorDirections[selectedElement]
        }
        addToConveyorGroup(belt)
        
        // Auto-place corners immediately after each conveyor placement
        autoPlaceConveyorCorners()
    }
    else if (elementLayer == "conveyor_portal") {
        // Handle conveyor portal placement
        object.setAttribute(elementLayer, selectedElement)
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"
        
        // Show the "Done putting conveyor belt" button
        const btn = document.getElementById('done-conveyor-btn')
        if (btn) {
            btn.style.display = 'block'
        }
        
        // Switch to appropriate directional conveyor entrance based on the portal color
        if (selectedElement === "conveyor_entrance_blue") {
            updateSelection(false, 'conveyor_entrance_down', 'conveyor_portal')
        } else if (selectedElement === "conveyor_entrance_green") {
            updateSelection(false, 'conveyor_entrance_left', 'conveyor_portal')
        } else if (selectedElement === "conveyor_entrance_purple") {
            updateSelection(false, 'conveyor_entrance_right', 'conveyor_portal')
        } else if (selectedElement === "conveyor_entrance_down" || selectedElement === "conveyor_entrance_left" || selectedElement === "conveyor_entrance_right" || selectedElement === "conveyor_entrance_up") {
            // These are the directional entrances - they should be placed directly
            // No need to switch selection
        }
    }

    else if (elementLayer == "cobra_basket" && selectedElement === "227" && waitingForCobraBasket) {
        // Handle cobra basket placement
        object.setAttribute(elementLayer, selectedElement)
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"
        
        // Handle cobra and basket rotation based on relative positions
        if (lastCobraTile) {
            handleCobraBasketRotation(lastCobraTile, [row, column])
        }
        
        // Only rotate the current cobra that was just placed with this basket
        // Don't touch other existing cobras
        
        // Reset cobra tracking
        waitingForCobraBasket = false
        lastCobraTile = null
        lastCobraLayer = null
        
        // Switch back to normal layer with the same cobra element
        updateSelection(false, lastCobraElement, 'normal')
        lastCobraElement = null
        return // Prevent function from continuing
    }
    else if (selectedElement == "231") {
        // Handle mall-o-matic placement
        let level = document.getElementById("level")
        
        // Check if we're at the edge of the grid
        if (row >= level.children.length - 1 || column >= level.children[0].children.length - 1) {
            return
        }
        
        // Determine direction by checking available space
        let verticalSpace = 0
        let horizontalSpace = 0
        
        // Check vertical space (down)
        for (let r = row + 1; r < level.children.length; r++) {
            let checkTile = level.children[r].children[column]
            if (checkTile.getAttribute("normal") && checkTile.getAttribute("normal") !== "002") {
                break
            }
            verticalSpace++
        }
        
        // Check horizontal space (right)
        for (let c = column + 1; c < level.children[0].children.length; c++) {
            let checkTile = level.children[row].children[c]
            if (checkTile.getAttribute("normal") && checkTile.getAttribute("normal") !== "002") {
                break
            }
            horizontalSpace++
        }
        
        // Determine direction based on available space
        let direction = "vertical" // default
        if (horizontalSpace > verticalSpace) {
            direction = "horizontal"
        }
        
        // Set the head tile
        let headTexture = "mallomatic_head_top.png"
        if (direction === "horizontal") {
            headTexture = "mallomatic_head_left.png"
        }
        
        object.setAttribute("normal", selectedElement)
        object.setAttribute("color", "")
        image.src = elementsFolder + headTexture
        
        // Place body tiles
        let bodyTiles = []
        if (direction === "vertical") {
            // Place tiles downward
            for (let r = row + 1; r <= row + verticalSpace; r++) {
                bodyTiles.push([r, column])
            }
        } else {
            // Place tiles rightward
            for (let c = column + 1; c <= column + horizontalSpace; c++) {
                bodyTiles.push([row, c])
            }
        }
        
        // Place body tiles with alternating marshmallow textures
        let marshmallowIndex = 1
        bodyTiles.forEach(function (pos, index) {
            try {
                let otherObject = level.children[pos[0]].children[pos[1]]
                let otherImage = otherObject.querySelector("img.normal")
                
                // Set the tile as mall-o-matic
                otherObject.setAttribute("normal", selectedElement)
                otherObject.setAttribute("color", "")
                
                // Determine marshmallow texture
                let marshmallowTexture = ""
                if (index === bodyTiles.length - 1) {
                    // Last tile - use ending texture based on the previous marshmallow
                    if (index > 0) {
                        // Check what the previous marshmallow was
                        let previousMarshmallow = (index - 1) % 2 === 0 ? 1 : 2
                        if (previousMarshmallow === 1) {
                            marshmallowTexture = "mallomatic_marshmallow_4.png"
                        } else {
                            marshmallowTexture = "mallomatic_marshmallow_3.png"
                        }
                    } else {
                        // Only one body tile - use 4 since it would have been 1
                        marshmallowTexture = "mallomatic_marshmallow_4.png"
                    }
                } else {
                    // Regular body tile - alternate between 1 and 2
                    marshmallowTexture = "mallomatic_marshmallow_" + marshmallowIndex + ".png"
                    marshmallowIndex = marshmallowIndex === 1 ? 2 : 1
                }
                
                otherImage.src = elementsFolder + marshmallowTexture
                
                // Ensure tile has grid
                if (otherObject.getAttribute("tile") === "000") {
                    otherObject.setAttribute("tile", "001")
                    otherObject.querySelector("img.tile").src = elementsFolder + "grid.png"
                }
            } catch (err) {
                console.warn("Error placing mall-o-matic body tile:", err)
            }
        })
        

    }
    else {
        object.setAttribute(elementLayer, selectedElement)
        image.src = elementsFolder + elements_ids[selectedElement] + ".png"
    }

    if (image) {
        if (small.includes(selectedElement)) {
            if (!image.classList.contains("small")) {
                image.classList.add("small")
            }
        }
        else {
            try {
                image.classList.remove("small")
            } catch { }
        }

        if (stretched.includes(selectedElement)) {
            if (!image.classList.contains("stretched")) {
                image.classList.add("stretched")
            }
        }
        else {
            try {
                image.classList.remove("stretched")
            } catch { }
        }
    }

    if (!(object.getAttribute("normal") in coloredCandy) && !(sugarCoatable.includes(object.getAttribute("normal")))) {
        object.setAttribute("sugarcoat", "")
        object.querySelector(".sugarcoat").src = elementsFolder + "none.png"
    }
}

function updateSelection(object, element, layer) {
    try {
        document.querySelector(".elementselected").classList.remove("elementselected")
    }
    catch { }
    
    // Only add class if object is a valid DOM element
    if (object && object.classList) {
        object.classList.add("elementselected")
    }
    
    // For elements that are in elements_ids, use the tilemap code directly
    if (elements_ids[element]) {
        selectedElement = elements_ids[element]
    } else {
        selectedElement = elements_names[element] || element
    }
    
    elementLayer = layer
    
    
    // Handle wonderful wrapper orientation
    if (element === "wonderful_base") {
        selectedElement = "228"
        window.isWonderfulVertical = false
    } else if (element === "wonderful_base_vertical") {
        selectedElement = "228"
        window.isWonderfulVertical = true
    }
    
    //console.log(layer)
    if (lastPortalObject && layer!=='portal_exit' && layer!=='portal_entrance') {
        removePortal(lastPortalObject)
    }
    // Auto-save removed - manual saves only via CTRL+S
}

function updateElmState(object) {
    if (object.getAttribute("normal") in coloredCandy) {
        colorId = object.getAttribute("color")
        objectId = object.getAttribute("normal")

        if (colorId === "002") {
            colorId = "055"
        }
        else if (colorId === "055") {
            colorId = "056"
        }
        else if (colorId === "056") {
            colorId = "057"
        }
        else if (colorId === "057") {
            colorId = "058"
        }
        else if (colorId === "058") {
            colorId = "059"
        }
        else if (colorId === "059") {
            colorId = "060"
        }
        else if (colorId === "060") {
            colorId = "002"
        }


        object.setAttribute("color", colorId)

        let colorName = elements_ids[colorId]
        let elementName = ""
        let name = ""

        if (colorId === "002" && objectId === "002") {
            name = "random"
        }
        else if (colorId !== "002" && objectId === "002") {
            name = colorName
        }
        else {
            elementName = elements_ids[objectId] + "_"
            name = elementName + colorName
        }
        object.querySelector(".normal").src = elementsFolder + name + ".png"
        
        // Mark as unsaved when changing element state
        markAsUnsaved();
    // Auto-save removed - manual saves only via CTRL+S
    }
}

function importLevel(levelData) {

    
    let originalLevel = document.getElementById("level")
    let levelParent = originalLevel.parentElement;
    originalLevel.id = "levelold"
    originalLevel.style.display = "none"

    let origColor = selectedColor
    let origLayer = elementLayer
    let origElement = selectedElement

    let newLevel = levelParent.appendChild(document.createElement("table"))
    newLevel.id = "level"
    newLevel.setAttribute("cellspacing", "0")
    
    levelArray = levelData['tileMap']
    
    // Determine grid size from the imported level data
    let gridSize = 9; // default
    if (levelArray && levelArray.length > 0) {
        gridSize = levelArray.length;
    }
    
    createNewTable(true, gridSize)

    try {
        let levelObject = newLevel
        let childrenRows = [].slice.call(levelObject.children)

        let blacklistedCake = []

        childrenRows.forEach(function (row, rIndex) {
            let objects = [].slice.call(row.children)
            let color = "002"

            objects.forEach(function (object, cIndex) {
                // Check for mall-o-matic elements before splitting
                let levelData = levelArray[rIndex][cIndex]
                if (levelData && levelData.includes("mallomatic_head_")) {
                    // Handle mall-o-matic elements specially
                    let layer = "normal"
                    let color = "002"
                    selectedColor = color
                    elementLayer = layer
                    selectedElement = levelData
                    
                    try {
                        updateTile(object)
                    } catch (err) {
                        console.warn('Error processing mall-o-matic element during import:', levelData, 'at position:', rIndex, cIndex, 'Error:', err)
                        elementLayer = "tile"
                        selectedElement = "none"
                    }
                    return // Skip the normal processing
                }
                
                //Split object into array of parts of 3
                try {
                    textObject = levelArray[rIndex][cIndex].match(/.{1,3}/g)
                }
                catch (error) {
                    console.error('❌ ERROR parsing level data at position:', rIndex, cIndex);
                    console.error('❌ Level array data:', levelArray);
                    console.error('❌ Original error:', error);
                    throw `Failed to parse level data at position (${rIndex}, ${cIndex}). This might be due to invalid data format.`;
                }

                textObject.forEach(function (objectId, index) {
                    if (objectId in colors) {
                        color = objectId
                        if (objectId != "002")
                            textObject.splice(index, 1)
                    }
                })

                textObject.forEach(function (objectId) {
                    if (objectId.length !== 3) {
                        throw "An object ID is not 3 characters long."
                    }

                    if (objectId == "002" && object.getAttribute("normal") != undefined) {
                        return
                    }

                    if (objectId === "085") objectId = "069"
                    if (objectId === '084') objectId = '050'

                    //portals are dealt with later
                    if (objectId === '011' || objectId==='012'||objectId==='013'||objectId==='014'||objectId==='015') {
                        return
                    }

                    if (objectId == "035") {
                        if (blacklistedCake.includes(String(rIndex) + String(cIndex))) {
                            return
                        }
                        else {
                            // Check if we're at the edge of the grid (not hardcoded to 8)
                            if (cIndex >= gridSize - 1 || rIndex >= gridSize - 1) {
                                return
                            }
                            else {
                                blacklistedCake.push(String(rIndex) + String(cIndex + 1))
                                blacklistedCake.push(String(rIndex + 1) + String(cIndex))
                                blacklistedCake.push(String(rIndex + 1) + String(cIndex + 1))
                            }
                        }
                    }

                    if (objectId == "232") {
                        if (blacklistedCake.includes(String(rIndex) + String(cIndex))) {
                            return
                        }
                        else {
                            // Check if we're at the edge of the grid (not hardcoded to 8)
                            if (cIndex >= gridSize - 1 || rIndex >= gridSize - 1) {
                                return
                            }
                            else {
                                blacklistedCake.push(String(rIndex) + String(cIndex + 1))
                                blacklistedCake.push(String(rIndex + 1) + String(cIndex))
                                blacklistedCake.push(String(rIndex + 1) + String(cIndex + 1))
                            }
                        }
                    }

                    if (objectId == "231") {
                        // Mall-o-matic - skip body tiles during import to avoid duplicates
                        // The head tile will be processed normally, and body tiles will be handled by the placement logic
                        // Check if this is a body tile by looking at adjacent tiles
                        let isBodyTile = false
                        
                        // Check if there's a mall-o-matic head above or to the left
                        if (rIndex > 0) {
                            let aboveTile = levelArray[rIndex - 1][cIndex]
                            if (aboveTile && aboveTile.includes("231")) {
                                isBodyTile = true
                            }
                        }
                        if (cIndex > 0) {
                            let leftTile = levelArray[rIndex][cIndex - 1]
                            if (leftTile && leftTile.includes("231")) {
                                isBodyTile = true
                            }
                        }
                        
                        if (isBodyTile) {
                            return // Skip body tiles during import
                        }
                    }
                    
                    if (objectId == "228") {
                        // Wonderful wrapper - skip second tile during import to avoid duplicates
                        // The first tile will be processed normally, and second tile will be handled by the placement logic
                        // Check if this is a second tile by looking at adjacent tiles
                        let isSecondTile = false
                        
                        // Check if there's a wonderful wrapper first tile above or to the left
                        if (rIndex > 0) {
                            let aboveTile = levelArray[rIndex - 1][cIndex]
                            if (aboveTile && aboveTile.includes("228")) {
                                isSecondTile = true
                            }
                        }
                        if (cIndex > 0) {
                            let leftTile = levelArray[rIndex][cIndex - 1]
                            if (leftTile && leftTile.includes("228")) {
                                isSecondTile = true
                            }
                        }
                        
                        if (isSecondTile) {
                            return // Skip second tiles during import
                        }
                    }

                    let layer = getLayerFromId(objectId)
                    
                    // Special handling for specific elements to ensure they go to correct layers
                    if (objectId === "227") {
                        // Cobra basket (227) - ensure it goes to cobra_basket layer
                        layer = "cobra_basket"
                    } else if (objectId === "230") {
                        // Gumball machine (230) - ensure it goes to normal layer
                        layer = "normal"
                    } else if (objectId === "222" || objectId === "223" || objectId === "224" || objectId === "225" || objectId === "226") {
                        // Candy cobras - ensure they go to normal layer and reset transformations
                        layer = "normal"
                    } else if (objectId === "064" || objectId === "065") {
                        // Conveyor belts - ensure they go to conveyor layer
                        layer = "conveyor"
                    } else if (objectId === "231") {
                        // Mall-o-matic - ensure it goes to normal layer
                        layer = "normal"
                    } else if (objectId === "228") {
                        // Wonderful wrapper - ensure it goes to normal layer
                        layer = "normal"
                    }
                    
                    selectedColor = color
                    elementLayer = layer
                    selectedElement = objectId

                                        try {
                        updateTile(object)
                        
                        // Reset transformations for specific elements after import
                        if (objectId === "222" || objectId === "223" || objectId === "224" || objectId === "225" || objectId === "226") {
                            // Reset cobra transformations
                            const cobraImage = object.querySelector(".normal")
                            if (cobraImage) {
                                cobraImage.style.transform = ""
                            }
                        } else if (objectId === "227") {
                            // Reset basket transformations
                            const basketImage = object.querySelector(".cobra_basket")
                            if (basketImage) {
                                basketImage.style.transform = ""
                            }
                        } else if (objectId === "230") {
                            // Reset gumball machine transformations
                            const gumballImage = object.querySelector(".normal")
                            if (gumballImage) {
                                gumballImage.style.transform = ""
                            }
                        } else if (objectId === "064" || objectId === "065") {
                            // Reset conveyor belt transformations
                            const conveyorImage = object.querySelector(".conveyor")
                            if (conveyorImage) {
                                conveyorImage.style.transform = ""
                            }
                        } else if (objectId === "231") {
                            // Reset mall-o-matic transformations
                            const mallOMaticImage = object.querySelector(".normal")
                            if (mallOMaticImage) {
                                mallOMaticImage.style.transform = ""
                            }
                        } else if (objectId === "228") {
                            // Reset wonderful wrapper transformations
                            const wonderfulWrapperImage = object.querySelector(".normal")
                            if (wonderfulWrapperImage) {
                                wonderfulWrapperImage.style.transform = ""
                            }
                        }
                        
                        
                    }
                    catch (err) {
                        console.warn('Error processing element during import:', objectId, 'at position:', rIndex, cIndex, 'Error:', err)
                        elementLayer = "tile"
                        selectedElement = "none"
                    }
                })
            })
        })
        // Reconstruct mall-o-matic body parts after import
        reconstructMallOMaticAfterImport(childrenRows)
        
        // Reconstruct sprinks nest 2x2 structure after import
        reconstructSprinksNestAfterImport(childrenRows)
        
        // Process wonderful wrappers if they exist
        if (levelData.wonderfulWrappers && Array.isArray(levelData.wonderfulWrappers)) {
            levelData.wonderfulWrappers.forEach(wrapper => {
                try {
                    // Parse wonderful wrapper data: [first tile col, first tile row, orientation, ribbon1, ribbon2, ribbon3, ribbon4, ribbon5, element1, element2, color1, color2]
                    const [col, row, orientation, ribbon1, ribbon2, ribbon3, ribbon4, ribbon5, element1, element2, color1, color2] = wrapper
                    
                    
                    // Get the main tile (tile 1)
                    const mainTile = childrenRows[row].children[col]
                    if (!mainTile) {
                        console.warn(`Wonderful wrapper main tile not found at (${col}, ${row})`)
                        return
                    }
                    
                    // Set orientation flag for placement
                    window.isWonderfulVertical = (orientation === 1) // 1=vertical, 2=horizontal
                    
                    // Place wonderful wrapper base - create visual elements directly
                    const image = mainTile.querySelector(".normal")
                    if (image) {
                        image.src = elementsFolder + "wonderful_base_left.png"
                        image.style.transform = (orientation === 1) ? "rotate(90deg)" : ""
                        image.style.zIndex = "2"
                    }
                    
                    // Set attributes
                    mainTile.setAttribute("normal", "228")
                    mainTile.setAttribute("color", "")
                    mainTile.setAttribute("wonderful_wrapper", "1")
                    mainTile.setAttribute("wonderful_orientation", orientation === 1 ? "vertical" : "horizontal")
                    
                    // Get the other tile (tile 2)
                    let otherTile
                    if (orientation === 1) { // vertical
                        otherTile = childrenRows[row + 1].children[col]
                    } else { // horizontal
                        otherTile = childrenRows[row].children[col + 1]
                    }
                    
                    if (!otherTile) {
                        console.warn(`Wonderful wrapper other tile not found`)
                        return
                    }
                    
                    // Create second tile visual elements
                    const otherImage = otherTile.querySelector(".normal")
                    if (otherImage) {
                        otherImage.src = elementsFolder + "wonderful_base_right.png"
                        otherImage.style.transform = (orientation === 1) ? "rotate(90deg)" : ""
                        otherImage.style.zIndex = "2"
                    }
                    
                    // Set second tile attributes
                    otherTile.setAttribute("normal", "228")
                    otherTile.setAttribute("color", "")
                    otherTile.setAttribute("wonderful_wrapper", "2")
                    otherTile.setAttribute("wonderful_orientation", orientation === 1 ? "vertical" : "horizontal")
                    
                    // Process ribbons
                    const ribbons = [ribbon1, ribbon2, ribbon3, ribbon4, ribbon5]
                    const ribbonTypes = ["wonderful_blue_stripe", "wonderful_green_stripe", "wonderful_orange_stripe", "wonderful_purple_stripe", "wonderful_red_stripe", "wonderful_yellow_stripe"]
                    
                    ribbons.forEach((ribbonIndex, i) => {
                        if (ribbonIndex >= 0 && ribbonIndex < ribbonTypes.length) {
                            const ribbonType = ribbonTypes[ribbonIndex]
                            
                            // Set ribbon attributes on appropriate tiles
                            if (i < 3) {
                                // First 3 ribbons go to main tile (tile 1)
                                mainTile.setAttribute(ribbonType, "true")
                            } else {
                                // Last 2 ribbons go to other tile (tile 2)
                                otherTile.setAttribute(ribbonType, "true")
                            }
                        }
                    })
                    
                    // Create ribbon visual elements
                    createRibbonsForImport(mainTile, otherTile, orientation === 1)
                    
                    // Process contained elements
                    const elements = [element1, element2]
                    const elementColors = [color1, color2]
                    
                    // Create contained elements visual elements
                    createContainedElementsForImport(mainTile, otherTile, elements, elementColors)
                    const elementTypes = ["wonderful_colorbomb", "wonderful_striped_horizontal", "wonderful_striped_vertical", "wonderful_wrapped", "wonderful_jellyfish"]
                    
                    elements.forEach((elementCode, i) => {
                        if (elementCode >= 0) {
                            let elementType
                            if (elementCode === 44) elementType = "wonderful_colorbomb"
                            else if (elementCode === 45) elementType = "wonderful_striped_horizontal"
                            else if (elementCode === 46) elementType = "wonderful_striped_vertical"
                            else if (elementCode === 47) elementType = "wonderful_wrapped"
                            else if (elementCode === 49) elementType = "wonderful_jellyfish"
                            else return
                            
                            // Set element attribute on main tile
                            mainTile.setAttribute(elementType, "true")
                            
                            // Set color for colored elements
                            if (elementCode !== 44 && elementColors[i] >= 0) { // Not color bomb
                                const colorAttr = elementType + "_color"
                                const colorNames = ["blue", "green", "orange", "purple", "red", "yellow"]
                                if (elementColors[i] < colorNames.length) {
                                    mainTile.setAttribute(colorAttr, colorNames[elementColors[i]])
                                }
                            }
                        }
                    })
                    
                } catch (err) {
                    console.warn('Error processing wonderful wrapper during import:', wrapper, 'Error:', err)
                }
            })
        }
        
        // Function to create ribbon visual elements during import
        function createRibbonsForImport(mainTile, otherTile, isVertical) {
            // Create ribbons container on main tile
            let ribbonsContainer = mainTile.querySelector(".ribbons-container")
            if (!ribbonsContainer) {
                ribbonsContainer = document.createElement("div")
                ribbonsContainer.className = "ribbons-container"
                ribbonsContainer.style.cssText = `
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: ${isVertical ? '100%' : '200%'} !important;
                    height: ${isVertical ? '200%' : '100%'} !important;
                    z-index: 3 !important;
                    display: flex !important;
                    gap: 0 !important;
                    pointer-events: auto !important;
                    ${isVertical ? 'transform: rotate(90deg) scale(2) !important;' : ''}
                `
                mainTile.appendChild(ribbonsContainer)
            }
            
            // Create ribbon elements based on attributes
            const ribbonTypes = ["wonderful_blue_stripe", "wonderful_green_stripe", "wonderful_orange_stripe", "wonderful_purple_stripe", "wonderful_red_stripe", "wonderful_yellow_stripe"]
            
            // Create ribbons for main tile (first 3)
            ribbonTypes.forEach((ribbonType, index) => {
                if (mainTile.getAttribute(ribbonType) === "true" && index < 3) {
                    const ribbonElement = document.createElement("img")
                    ribbonElement.className = "ribbon-element"
                    ribbonElement.setAttribute("data-ribbon-type", ribbonType)
                    ribbonElement.setAttribute("data-ribbon-index", index)
                    ribbonElement.src = elementsFolder + ribbonType + ".png"
                    ribbonElement.style.cssText = `
                        position: static !important;
                        flex: 1 !important;
                        min-width: 0 !important;
                        height: 100% !important;
                        object-fit: contain !important;
                        object-position: center !important;
                        pointer-events: auto !important;
                        cursor: pointer !important;
                    `
                    ribbonsContainer.appendChild(ribbonElement)
                }
            })
            
            // Create ribbons for other tile (last 2) - append to same container
            ribbonTypes.forEach((ribbonType, index) => {
                if (otherTile.getAttribute(ribbonType) === "true" && index >= 3) {
                    const ribbonElement = document.createElement("img")
                    ribbonElement.className = "ribbon-element"
                    ribbonElement.setAttribute("data-ribbon-type", ribbonType)
                    ribbonElement.setAttribute("data-ribbon-index", index)
                    ribbonElement.src = elementsFolder + ribbonType + ".png"
                    ribbonElement.style.cssText = `
                        position: static !important;
                        flex: 1 !important;
                        min-width: 0 !important;
                        height: 100% !important;
                        object-fit: contain !important;
                        object-position: center !important;
                        pointer-events: auto !important;
                        cursor: pointer !important;
                    `
                    ribbonsContainer.appendChild(ribbonElement)
                }
            })
        }
        
        // Function to create contained elements visual elements during import
        function createContainedElementsForImport(mainTile, otherTile, elements, elementColors) {
            const elementTypes = ["wonderful_colorbomb", "wonderful_striped_horizontal", "wonderful_striped_vertical", "wonderful_wrapped", "wonderful_jellyfish"]
            
            elements.forEach((elementCode, i) => {
                if (elementCode >= 0) {
                    let elementType
                    if (elementCode === 44) elementType = "wonderful_colorbomb"
                    else if (elementCode === 45) elementType = "wonderful_striped_horizontal"
                    else if (elementCode === 46) elementType = "wonderful_striped_vertical"
                    else if (elementCode === 47) elementType = "wonderful_wrapped"
                    else if (elementCode === 49) elementType = "wonderful_jellyfish"
                    else return
                    
                    // Determine which tile to place the element on
                    const targetTile = (i === 0) ? mainTile : otherTile
                    
                    // Create element overlay
                    const elementOverlay = document.createElement("img")
                    elementOverlay.className = "element-overlay"
                    elementOverlay.style.cssText = `
                        position: absolute !important;
                        top: 0px !important;
                        left: 0px !important;
                        width: 100% !important;
                        height: 100% !important;
                        z-index: 1 !important;
                        pointer-events: none !important;
                    `
                    
                    // Set image source based on element type and color
                    if (elementType === "wonderful_colorbomb") {
                        elementOverlay.src = elementsFolder + "bomb.png"
                    } else {
                        const colorNames = ["blue", "green", "orange", "purple", "red", "yellow"]
                        const colorIndex = elementColors[i]
                        const colorName = (colorIndex >= 0 && colorIndex < colorNames.length) ? colorNames[colorIndex] : "random"
                        
                        const baseElementName = elementType.replace("wonderful_", "")
                        elementOverlay.src = elementsFolder + baseElementName + "_" + colorName + ".png"
                    }
                    
                    targetTile.appendChild(elementOverlay)
                }
            })
        }
        
        if (levelData.portals) {
            console.log('Processing imported portals:', levelData.portals)
            console.log('Portal data type:', typeof levelData.portals)
            console.log('Portal data length:', levelData.portals.length)
            for (let portal of levelData.portals) {
                console.log('Processing portal:', portal)
                console.log('Portal type:', typeof portal)
                console.log('Portal length:', Array.isArray(portal) ? portal.length : 'not array')
                if (Array.isArray(portal) && portal.length >= 2) {
                    console.log('Portal entrance data:', portal[0])
                    console.log('Portal exit data:', portal[1])
                }
                
                // Process portal entrance
                try {
                    const entranceRow = portal[0][1]
                    const entranceCol = portal[0][0]
                    const entranceType = portal[0][2]
                    
                    console.log(`Portal entrance: row=${entranceRow}, col=${entranceCol}, type=${entranceType}`)
                    
                    if (childrenRows[entranceRow] && childrenRows[entranceRow].children[entranceCol]) {
                        const entranceTile = childrenRows[entranceRow].children[entranceCol]
                        console.log('Found entrance tile:', entranceTile)
                        console.log('Entrance tile children:', entranceTile.children)
                        
                        // Check if portal_entrance image exists
                        let entranceImg = entranceTile.querySelector('.portal_entrance')
                        console.log('Portal entrance image element:', entranceImg)
                        
                        // If portal image doesn't exist, create it
                        if (!entranceImg) {
                            console.log('Creating portal entrance image element')
                            entranceImg = document.createElement('img')
                            entranceImg.classList.add('portal_entrance', 'default')
                            entranceImg.setAttribute('draggable', false)
                            entranceTile.appendChild(entranceImg)
                        }
                        
                        // Set the portal entrance attribute and image using the proper approach
                        if (entranceType == 14) {
                            // Hidden portal entrance
                            entranceTile.setAttribute('portal_entrance', '014')
                            entranceImg.src = elementsFolder + elements_ids['014'] + '.png'
                            entranceImg.classList.add('small')
                            console.log('Set hidden portal entrance image:', entranceImg.src)
                        } else {
                            // Normal portal entrance
                            entranceTile.setAttribute('portal_entrance', '012')
                            entranceImg.src = elementsFolder + elements_ids['012'] + '.png'
                            entranceImg.classList.add('small')
                            console.log('Set normal portal entrance image:', entranceImg.src)
                        }
                        
                        console.log('Successfully set portal entrance at:', entranceRow, entranceCol)
                    } else {
                        console.warn('Portal entrance tile not found at:', entranceRow, entranceCol)
                    }
                } catch (err) {
                    console.warn('Error processing portal entrance:', err)
                }

                // Process portal exit
                try {
                    const exitRow = portal[1][1]
                    const exitCol = portal[1][0]
                    const exitType = portal[1][2]
                    
                    console.log(`Portal exit: row=${exitRow}, col=${exitCol}, type=${exitType}`)
                    
                    if (childrenRows[exitRow] && childrenRows[exitRow].children[exitCol]) {
                        const exitTile = childrenRows[exitRow].children[exitCol]
                        console.log('Found exit tile:', exitTile)
                        console.log('Exit tile children:', exitTile.children)
                        
                        // Check if portal_exit image exists
                        let exitImg = exitTile.querySelector('.portal_exit')
                        console.log('Portal exit image element:', exitImg)
                        
                        // If portal image doesn't exist, create it
                        if (!exitImg) {
                            console.log('Creating portal exit image element')
                            exitImg = document.createElement('img')
                            exitImg.classList.add('portal_exit', 'default')
                            exitImg.setAttribute('draggable', false)
                            exitTile.appendChild(exitImg)
                        }
                        
                        // Set the portal exit attribute and image using the proper approach
                        if (exitType == 14) {
                            // Hidden portal exit
                            exitTile.setAttribute('portal_exit', '015')
                            exitImg.src = elementsFolder + elements_ids['015'] + '.png'
                            exitImg.classList.add('small')
                            console.log('Set hidden portal exit image:', exitImg.src)
                        } else {
                            // Normal portal exit
                            exitTile.setAttribute('portal_exit', '013')
                            exitImg.src = elementsFolder + elements_ids['013'] + '.png'
                            exitImg.classList.add('small')
                            console.log('Set normal portal exit image:', exitImg.src)
                        }
                        
                        // Link the entrance and exit
                        const entranceTile = childrenRows[portal[0][1]].children[portal[0][0]]
                        if (entranceTile && exitTile) {
                            entranceTile.setAttribute('portalexitrow', exitRow)
                            entranceTile.setAttribute('portalexitcol', exitCol)
                            exitTile.setAttribute('portalentrancerow', portal[0][1])
                            exitTile.setAttribute('portalentrancecol', portal[0][0])
                        }
                        
                        console.log('Successfully set portal exit at:', exitRow, exitCol)
                    } else {
                        console.warn('Portal exit tile not found at:', exitRow, exitCol)
                    }
                } catch (err) {
                    console.warn('Error processing portal exit:', err)
                }
            }
        }
        originalLevel.remove()
        newLevel.style.display = "block"
        
        // Handle post-import processing for special elements
        setTimeout(() => {
            // Process cobra and basket pairs for rotation
            processImportedCobraBasketPairs()
            
            // Process conveyor belts for auto-grouping
            setTimeout(() => {
                checkConveyorBeltsOnBoard()
                autoGroupConveyorBelts()
                
                // Additional conveyor belt processing
                processImportedConveyorBelts()
            }, 100)
            
            // Process portals to ensure they're properly linked
            if (levelData.portals && levelData.portals.length > 0) {
                setTimeout(() => {
                    processImportedPortals(levelData.portals)
                }, 150)
            }
        }, 50)
        
        // Process gates array for conveyor belts if it exists
        if (levelData.gates && Array.isArray(levelData.gates)) {
            console.log('Found gates data in levelData:', levelData.gates)
            setTimeout(() => {
                processImportedGates(levelData.gates)
            }, 150)
        } else {
            console.log('No gates data found in levelData:', levelData.gates)
        }
    }
    catch (err) {
        //alert(err.stack)
        console.log(err)
        newLevel.remove()
        originalLevel.id = "level"
        originalLevel.style.display = "block"
        throw (err)
    }

    //Set game mode
    let wantedMode = levelData['gameModeName']
    let wantedModeInput = document.getElementById("modeselection").querySelector('input[value="' + String(wantedMode) + '"]')
    if (wantedModeInput != null) {
        wantedModeInput.click()
    }

    //Set moves & time
    document.getElementById("moves").value = levelData.moveLimit || ""
    document.getElementById("time").value = levelData.timeLimit || ""

    //Set preferred colors
    let colorspref = document.getElementById("colorspref-section")
    preferredColors = levelData.preferredColors || [0, 1, 2, 3, 4]
    for (let i = 0; i < 6; i++) {
        let prefbutton = colorspref.querySelector('button[value="' + String(i) + '"]')
        if (preferredColors.includes(i)) {
            if (!prefbutton.classList.contains("preferredselected")) {
                prefbutton.classList.add("preferredselected")
            }
        }
        else {
            if (prefbutton.classList.contains("preferredselected")) {
                prefbutton.classList.remove("preferredselected")
            }
        }
    }

    //Add requirements
    let requirementsContainer = document.getElementById("requirements")

    Array.from(requirementsContainer.children).forEach(function (child) {
        child.remove()
    })

    //Set Pre Level Booster
    try {
        document.getElementById("disablebooster").checked = levelData.disablePreLevelBoosters || false
    }
    catch {
        document.getElementById("disablebooster").checked = false
    }

    //Set score targets
    let scoreTargets = levelData.scoreTargets || []
    document.getElementById("star1").value = scoreTargets[0] || ''
    document.getElementById("star2").value = scoreTargets[1] || ''
    document.getElementById("star3").value = scoreTargets[2] || ''


    let ingredientOrder = { 0: "sprinks" }
    if (wantedMode.includes('Drop down') || wantedMode.includes('Drop Down')) {
        (levelData.ingredients || []).forEach(function (quantity, index) {
            try {
                if (quantity == 0) {
                    return
                }
                let item = ingredientOrder[index]

                addRequirement(true, true)

                let requirementNode = requirementsContainer.children[0]
                let selectNode = requirementNode.querySelector("select")
                selectNode.value = item
                switchedRequirementIngredient(selectNode)

                requirementNode.querySelector("input").value = quantity
            } catch { }
        })
    }
    if (wantedMode.includes('Order')) {
        (levelData._itemsToOrder || []).forEach(function (itemDict) {
            try {
                let item = itemDict['item']
                let quantity = itemDict['quantity']

                addRequirement(false, true)

                let requirementNode = requirementsContainer.children[0]
                let selectNode = requirementNode.querySelector("select")
                selectNode.value = item
                switchedRequirement(selectNode)

                requirementNode.querySelector("input").value = quantity
            } catch { }
        })
    }

    let mixerElementsContainer = document.getElementById("mixeroptions");

    Array.from(mixerElementsContainer.children).forEach(function (child) {
        child.remove()
    });

    (levelData.evilSpawnerElements || []).forEach(function (item) {
        try {

            addMixerOption()

            let requirementNode = mixerElementsContainer.children[0]
            let selectNode = requirementNode.querySelector("select")
            selectNode.value = item
            switchedMixerOption(selectNode)
        } catch { }
    })

    //Set cannon preferences
    cannonCodes.forEach(function (nameArray) {
        let elm = nameArray[0]

        let cannonSettingAddons = ["Max", "Spawn"]

        cannonSettingAddons.push(nameArray[1])

        cannonSettingAddons.forEach(function (setting) {
            let inputElement = document.getElementById(elm + setting)

            if (inputElement != null) {
                inputElement.value = levelData[elm + setting] || ""
            }
        })
    })

    //Set element selection back
    selectedColor = origColor
    elementLayer = origLayer
    selectedElement = origElement

    //set dreamworld settings
    //set it to the opposite then click it so it applies the hide or show part of the menu
    document.getElementById('isOwlModeEnabled').checked = levelData.isOwlModeEnabled
    document.getElementById("dreamworldoptions").style.display = levelData.isOwlModeEnabled ? "block" : "none"
    document.getElementById("initialMovesUntilMoonStruck").value = levelData.initialMovesUntilMoonStruck || ''
    document.getElementById("initialMovesDuringMoonStruck").value = levelData.initialMovesDuringMoonStruck || ''
    document.getElementById('maxAllowedScaleDiff').value = levelData.maxAllowedScaleDiff || ''

    lastPortalObject = undefined
    
    // Update cobra and basket rotations after importing
    setTimeout(() => updateAllCobraBasketRotations(), 0)

    // Reset unsaved changes flag after loading level
    hasUnsavedChanges = false;

    // Trigger auto-save after importing level
}

function displayImportLevelUI() {
    document.getElementById("importmenu").style.display = "block"
}

function importLevelUI() {
    try {
        let importField = document.getElementById("importfield")
        importLevel(JSON.parse(importField.value))
        document.getElementById("importerror").style.display = "none"
        importField.value = ""
        document.getElementById("importmenu").style.display = "none"
    }
    catch (err) {
        let importField = document.getElementById("importfield")
        let errorPara = document.getElementById("importerror")
        // Create error attributes
        importField.setAttribute("error", "true");
        importField.setAttribute("error-text", "Failed to import level! Double check and try again.");

        // Use custom error messages
        if (err instanceof SyntaxError) {
            errorPara.textContent = ERROR_MESSAGES.JSON_PARSE;
        } else {
            errorPara.textContent = ERROR_MESSAGES.IMPORT_FAILED;
        }

        // If you still want to log the original error for debugging:
        console.error(err);
    }
}

const ERROR_MESSAGES = {
    JSON_PARSE: "Failed to import level! Double-check your code, then try again.",
    IMPORT_FAILED: "Failed to import level! Double-check your code, then try again.",
    // Add more custom error messages as needed
};

// Select the upload area and file input
const uploadArea = document.querySelector('.uploadfiles-area');
const fileInput = document.getElementById('fileInput');
const quickOpenbtn = document.querySelector('.openlvl');
const bigOpenbtn = document.querySelector('.openlevelbigbtn');

// Add click event listener to the upload area
uploadArea.addEventListener('click', () => {
    fileInput.click(); // Trigger the file input click
});

quickOpenbtn.addEventListener('click', () => {
    fileInput.click(); // Trigger the file input click
});

bigOpenbtn.addEventListener('click', () => {
    fileInput.click(); // Trigger the file input click
});

// Add keydown event listener for CTRL + O
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'o') { // Check if CTRL + O is pressed
        event.preventDefault(); // Prevent the default action (like opening a new tab)
        fileInput.click(); // Trigger the file input click
    }
});

// Save prompt system functions
function showSavePrompt(action) {
    if (isSavePromptActive) return;
    
    isSavePromptActive = true;
    pendingNavigationAction = action;
    
    const toasterWrapper = document.querySelector('.toaster-wrapper');
    if (toasterWrapper) {
        // Remove close attribute before opening
        toasterWrapper.removeAttribute('close');
        toasterWrapper.setAttribute('open', '');
        toasterWrapper.classList.add('ask');
        
        // Show buttons
        const buttons = toasterWrapper.querySelector('.buttons');
        if (buttons) {
            buttons.style.display = 'flex';
        }
        
        // Set message
        const messages = toasterWrapper.querySelector('#messages');
        if (messages) {
            messages.textContent = 'There are unsaved changes. Do you want to save your level?';
        }
    }
}

function hideSavePrompt() {
    isSavePromptActive = false;
    pendingNavigationAction = null;
    
    const toasterWrapper = document.querySelector('.toaster-wrapper');
    if (toasterWrapper) {
        toasterWrapper.removeAttribute('open');
        toasterWrapper.setAttribute('close', '');
        toasterWrapper.classList.remove('ask');
    }
}

function showSaveSuccess() {
    const toasterWrapper = document.querySelector('.toaster-wrapper');
    if (toasterWrapper) {
        // Remove close attribute before opening
        toasterWrapper.removeAttribute('close');
        toasterWrapper.setAttribute('open', '');
        toasterWrapper.classList.remove('ask');
        
        // Hide buttons
        const buttons = toasterWrapper.querySelector('.buttons');
        if (buttons) {
            buttons.style.display = 'none';
        }
        
        // Set success message
        const messages = toasterWrapper.querySelector('#messages');
        if (messages) {
            messages.textContent = 'Level Saved';
        }
        
        // Auto-hide after 5.4 seconds and set close attribute
        setTimeout(() => {
            toasterWrapper.removeAttribute('open');
            toasterWrapper.setAttribute('close', '');
        }, 5400);
    }
}

function executePendingAction() {
    if (pendingNavigationAction) {
        const action = pendingNavigationAction;
        pendingNavigationAction = null;
        
        // Execute the pending action
        if (action === 'close') {
            // Try to close the window/tab
            try {
                window.close();
            } catch (e) {
                // If window.close() doesn't work, just let the browser handle it
                console.log('Could not close window programmatically');
            }
        } else if (action === 'back') {
            window.history.back();
        } else if (action === 'forward') {
            window.history.forward();
        } else if (action === 'navigate') {
            // Call the original goBackToApp function
            const originalGoBackToApp = window.goBackToApp;
            if (typeof originalGoBackToApp === 'function') {
                originalGoBackToApp();
            }
        } else if (action && action.type === 'navigate' && action.url) {
            window.location.href = action.url;
        }
    }
}

// Function to mark changes as unsaved
function markAsUnsaved() {
    hasUnsavedChanges = true;
}

// Add keydown event listener for CTRL + S, CTRL + SHIFT + S, and CTRL + ALT + S
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && (event.key === 's' || event.key === 'S')) {
        event.preventDefault(); // Prevent the default save dialog
        
        if (event.shiftKey) {
            // CTRL + SHIFT + S: Show full export dialog
            showExportDialog();
        } else if (event.altKey) {
            // CTRL + ALT + S: Force save level (bypass auto-save check)
            forceSaveLevel();
        } else {
            // CTRL + S: Quick save with toaster notification
            quickSave();
        }
    }
    
    // CTRL + ALT + T: Test localStorage functionality
    if (event.ctrlKey && event.altKey && event.key === 'T') {
        event.preventDefault();
        testLocalStorage();
    }
});

// Add change event listener to the file input
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0]; // Get the selected file

    // Check if a file is selected and if it's a .txt file
    if (file && file.type === 'text/plain') {
        const reader = new FileReader(); // Create a FileReader object

        // Define the onload event for the FileReader
        reader.onload = function (e) {
            const fileContent = e.target.result; // Get the file content
            try {
                const levelData = JSON.parse(fileContent); // Parse the content as JSON
                importLevel(levelData); // Call the importLevel function with the parsed data
                importLevelUI(); // Trigger the importLevelUI function
            } catch (error) {
                console.error("Error parsing file content:", error);
                alert("Import level successfully! ^_^");
            }
        };

        reader.readAsText(file); // Read the file as text
    } else {
        alert("Please select a valid .txt file."); // Alert if the file is not valid
    }
});

function exportLevel() {
    
    let levelArray = []
    let levelObject = document.getElementById("level")
    let level = {}
    if (currentMode.includes("Rainbow Rapids")) {
        level.rainbowRapidsTargets = 0
    }
    levelObject.childNodes.forEach(function (row) {
        rowArray = []
        for (var i = 0; i < row.childNodes.length; i++) {
            let object = row.childNodes[i]

            if (object.getAttribute("tile") == "000") {
                rowArray.push("000")
                continue
            }
            let candyCannon = JSON.parse(object.getAttribute("candy_cannon") || '[]')
            if (currentMode !== "Classic" && currentMode !== "Jelly Time" && candyCannon.includes('069')) {
                let i = 0
                for (let cannon of candyCannon) {
                    if (cannon === '069') {
                        candyCannon[i] = '085'
                    }
                    i++
                }
            }
            console.log(candyCannon)
            let totalCode = [].concat(candyCannon)

            let toLoopThrough = [].concat(layers, ["color"])

            toLoopThrough.splice(toLoopThrough.indexOf("candy_cannon"), 1)

            toLoopThrough.forEach(function (layer) {
                let element = ""
                if (object.hasAttribute(layer)) {
                    element = object.getAttribute(layer)
                }
                else {
                    return
                }

                // Skip conveyor belts and conveyor portals - they will be handled separately in gates array
                if (layer === "conveyor" || layer === "conveyor_portal") {
                    return
                }

                if (currentMode.includes("Rainbow Rapids") && element == "156") {
                    level.rainbowRapidsTargets++
                }

                if (currentMode !== "Classic" && currentMode !== "Jelly Time") {
                    if (element === '050') {
                        element = '084'
                    }
                }

                if (element=="013" || element=="015") {
                    //element="011013"
                }

                if (element=="012" || element=="014") {
                    let row2 = parseInt(object.getAttribute('portalexitrow'))
                    let col2 = parseInt(object.getAttribute('portalexitcol'))
                    let portal = [[i,levelArray.length],[col2,row2]]
                    if (element=='012') {
                        portal[0][2]=14
                        portal[1][2]=14
                    }
                    if (!level.portals) {
                        level.portals = []
                    }
                    level.portals.push(portal)
                }

                if (!totalCode.includes(element) && element != "") {
                    totalCode.push(element)
                }
            })

            if (object.getAttribute("normal") !== "002" && object.getAttribute("color") == "002") {
                totalCode.splice(totalCode.indexOf("002"), 1)
            }

            if (totalCode.includes("001") && totalCode.length != 1) {
                totalCode.splice(totalCode.indexOf("001"), 1)
            }

            // Check if this is a wonderful wrapper tile and ensure it gets tilemap code 228
            if (object.getAttribute("wonderful_wrapper")) {
                // Remove any existing 228 codes to avoid duplicates
                totalCode = totalCode.filter(code => code !== "228")
                // Add 228 as the first code to ensure it's the primary tilemap code
                totalCode.unshift("228")
            }
            
            rowArray.push(totalCode.join(""))
        }
        levelArray.push(rowArray)
    })
    level['tileMap'] = levelArray
    level['numberOfColours'] = preferredColors.length
    level['preferredColors'] = preferredColors

    level['disablePreLevelBoosters'] = document.getElementById("disablebooster").checked
    level['colorWeightAdjustments'] = [0]

    let star1 = Number(document.getElementById("star1").value) || 1000
    let star2 = Number(document.getElementById("star2").value) || 2000
    let star3 = Number(document.getElementById("star3").value) || 3000

    level['scoreTargets'] = [star1, star2, star3]

    level['protocolVersion'] = "0.3"
    level['randomSeed'] = 0

    // Detect portal_entrance and portal_exit tiles and add to portals array
    level['portals'] = []
    
    // Scan through all tiles to find portal entrances and their linked exits
    levelObject.childNodes.forEach(function (row, rowIndex) {
        for (var colIndex = 0; colIndex < row.childNodes.length; colIndex++) {
            let object = row.childNodes[colIndex]
            
            if (object.getAttribute("tile") == "000") {
                continue
            }
            
            // Check for portal_entrance and get its linked exit
            if (object.hasAttribute('portal_entrance') && object.getAttribute('portal_entrance') !== '') {
                let exitRow = object.getAttribute('portalexitrow')
                let exitCol = object.getAttribute('portalexitcol')
                
                if (exitRow !== '' && exitCol !== '') {
                    let exitRowIndex = parseInt(exitRow)
                    let exitColIndex = parseInt(exitCol)
                    
                    // Add the portal pair to the array
                    level['portals'].push([[colIndex, rowIndex, 14], [exitColIndex, exitRowIndex, 14]])
                }
            }
        }
    })
    
    // Detect conveyor belts and generate gates array
    level['gates'] = []
    let conveyorBelts = []
    let conveyorPortals = []
    
    // First pass: collect all conveyor belts and portals
    levelObject.childNodes.forEach(function (row, rowIndex) {
        for (var colIndex = 0; colIndex < row.childNodes.length; colIndex++) {
            let object = row.childNodes[colIndex]
            
            if (object.getAttribute("tile") == "000") {
                continue
            }
            
            // Check for conveyor belts
            if (object.hasAttribute('conveyor') && object.getAttribute('conveyor') !== '') {
                let conveyorType = object.getAttribute('conveyor')
                let direction = conveyorDirections[conveyorType]
                
                // For corner pieces, use the stored output direction
                if (direction === undefined && object.hasAttribute('data-output-direction')) {
                    direction = parseInt(object.getAttribute('data-output-direction'))
                } else if (direction === undefined) {
                    direction = -1 // special marker for corner pieces without stored direction
                }
                
                conveyorBelts.push({
                    row: rowIndex,
                    col: colIndex,
                    type: conveyorType,
                    direction: direction
                })
            }
            
            // Check for conveyor portals
            if (object.hasAttribute('conveyor_portal') && object.getAttribute('conveyor_portal') !== '') {
                let portalType = object.getAttribute('conveyor_portal')
                // Only count the base portal types (not directional ones) for color mapping
                if (portalType === "conveyor_entrance_blue" || portalType === "conveyor_entrance_green" || portalType === "conveyor_entrance_purple") {
                    conveyorPortals.push({
                        row: rowIndex,
                        col: colIndex,
                        type: portalType,
                        color: conveyorPortalColors[portalType]
                    })
                    
                    // Also add a conveyor belt for this portal if it doesn't already exist
                    let beltExists = false
                    for (let belt of conveyorBelts) {
                        if (belt.row === rowIndex && belt.col === colIndex) {
                            beltExists = true
                            break
                        }
                    }
                    
                    if (!beltExists) {
                        // Determine direction based on portal type
                        let direction = 0 // default up
                        if (portalType === "conveyor_entrance_blue") direction = 2 // down
                        else if (portalType === "conveyor_entrance_green") direction = 3 // left
                        else if (portalType === "conveyor_entrance_purple") direction = 1 // right
                        
                        conveyorBelts.push({
                            row: rowIndex,
                            col: colIndex,
                            type: "conveyor_" + (direction === 0 ? "up" : direction === 1 ? "right" : direction === 2 ? "down" : "left"),
                            direction: direction
                        })
                    }
                } else if (portalType === "conveyor_entrance_down" || portalType === "conveyor_entrance_left" || portalType === "conveyor_entrance_right" || portalType === "conveyor_entrance_up") {
                    // These are directional entrances - map them to their base colors
                    let baseType = ""
                    if (portalType === "conveyor_entrance_down") baseType = "conveyor_entrance_blue"
                    else if (portalType === "conveyor_entrance_left") baseType = "conveyor_entrance_green"
                    else if (portalType === "conveyor_entrance_right") baseType = "conveyor_entrance_purple"
                    else if (portalType === "conveyor_entrance_up") baseType = "conveyor_entrance_blue" // Default to blue for up
                    
                    conveyorPortals.push({
                        row: rowIndex,
                        col: colIndex,
                        type: baseType,
                        color: conveyorPortalColors[baseType]
                    })
                    
                    // Also add a conveyor belt for this portal if it doesn't already exist
                    let beltExists = false
                    for (let belt of conveyorBelts) {
                        if (belt.row === rowIndex && belt.col === colIndex) {
                            beltExists = true
                            break
                        }
                    }
                    
                    if (!beltExists) {
                        // Determine direction based on portal type
                        let direction = 0 // default up
                        if (portalType === "conveyor_entrance_down") direction = 2 // down
                        else if (portalType === "conveyor_entrance_left") direction = 3 // left
                        else if (portalType === "conveyor_entrance_right") direction = 1 // right
                        else if (portalType === "conveyor_entrance_up") direction = 0 // up
                        
                        conveyorBelts.push({
                            row: rowIndex,
                            col: colIndex,
                            type: "conveyor_" + (direction === 0 ? "up" : direction === 1 ? "right" : direction === 2 ? "down" : "left"),
                            direction: direction
                        })
                    }
                }
            }
        }
    })
    
    // Generate gates array using improved conveyor belt path tracing
    if (conveyorBelts.length > 0) {
        // Find connected conveyor paths that link entrance to exit portals
        let connectedPaths = findConnectedConveyorPaths(conveyorBelts, conveyorPortals)
        
        // If no connected paths found, fall back to tracing all separate conveyor paths
        if (connectedPaths.length === 0) {
            connectedPaths = findAllConveyorPaths(conveyorBelts)
        }
        
        // Generate gates for each connected path
        connectedPaths.forEach(path => {
            if (path.length < 2) return
            
            let pathGates = [] // Gates for this specific path
            
            // Create gates for each step in the path
            for (let i = 0; i < path.length; i++) {
                let belt = path[i]
                let nextBelt = path[i + 1] // don't loop back yet
                
                // Check if this belt has a portal
                let hasPortal = false
                let portalColor = 0
                for (let portal of conveyorPortals) {
                    if (portal.row === belt.row && portal.col === belt.col) {
                        hasPortal = true
                        portalColor = portal.color
                        break
                    }
                }
                
                // For corner pieces, use the stored direction or determine from next belt
                let actualDirection = belt.direction
                if (belt.direction === -1 && nextBelt) {
                    // For corner pieces without stored direction, determine direction based on where it points
                    if (nextBelt.row > belt.row) actualDirection = 2 // down
                    else if (nextBelt.row < belt.row) actualDirection = 0 // up
                    else if (nextBelt.col > belt.col) actualDirection = 1 // right
                    else if (nextBelt.col < belt.col) actualDirection = 3 // left
                }
                // For corner pieces with stored directions, actualDirection is already correct
                
                if (nextBelt) {
                    // Create gate entry for sequential connection: [[start_tile], [next_tile], [direction], [color]]
                    let gate = [
                        [belt.col, belt.row],
                        [nextBelt.col, nextBelt.row],
                        [actualDirection],
                        [hasPortal ? portalColor : 0]
                    ]
                    pathGates.push(gate)
                } else {
                    // This is the last belt - create loop-back gate to first belt in same path
                    let firstBelt = path[0]
                    let loopBackGate = [
                        [belt.col, belt.row],
                        [firstBelt.col, firstBelt.row],
                        [actualDirection],
                        [hasPortal ? portalColor : 0]
                    ]
                    pathGates.push(loopBackGate)
                }
            }
            
            // Add this path's gates as a group to the main gates array
            level['gates'].push(pathGates)
        })
        

    }
    
    // Detect candy cobras and generate candyCobras array
    level['candyCobras'] = []
    let cobraPairs = []
    
    // First pass: collect all cobra elements and baskets
    levelObject.childNodes.forEach(function (row, rowIndex) {
        for (var colIndex = 0; colIndex < row.childNodes.length; colIndex++) {
            let object = row.childNodes[colIndex]
            
            if (object.getAttribute("tile") == "000") {
                continue
            }
            
            // Check for cobra elements (not baskets) - they are in the normal layer as blockers
            if (object.hasAttribute('normal') && (object.getAttribute('normal') === '222' || object.getAttribute('normal') === '223' || object.getAttribute('normal') === '224' || object.getAttribute('normal') === '225' || object.getAttribute('normal') === '226')) {
                let cobraType = elements_ids[object.getAttribute('normal')]
                let cobraLayer = cobraLayerMapping[cobraType]
                
                cobraPairs.push({
                    type: 'cobra',
                    row: rowIndex,
                    col: colIndex,
                    layer: cobraLayer
                })
            }
            
            // Check for cobra baskets
            if (object.hasAttribute('cobra_basket') && object.getAttribute('cobra_basket') === '227') {
                cobraPairs.push({
                    type: 'basket',
                    row: rowIndex,
                    col: colIndex
                })
            }
        }
    })
    
    // Match cobras with baskets (assuming they are placed in order)
    let cobras = cobraPairs.filter(pair => pair.type === 'cobra')
    let baskets = cobraPairs.filter(pair => pair.type === 'basket')
    
    // Create candyCobras entries: [from_tile, layer, to_tile]
    for (let i = 0; i < Math.min(cobras.length, baskets.length); i++) {
        let cobra = cobras[i]
        let basket = baskets[i]
        
        let candyCobra = [
            cobra.col, cobra.row,  // from_tile
            cobra.layer,            // layer
            basket.col, basket.row  // to_tile
        ]
        
        level['candyCobras'].push(candyCobra)
    }
    
    console.log("Candy cobras found:", cobraPairs)
    console.log("Generated candyCobras:", level['candyCobras'])
    
    level['orlocks'] = []
    level['skulls'] = []

    if (currentMode === "Classic" || currentMode === "Jelly Time") {
        let time = document.getElementById("time").value
        if (time === '') {
            time = 30
        }
        else {
            time = Number(time)
        }
        level['timeLimit'] = time
    }
    else {
        let moves = document.getElementById("moves").value
        if (moves === '') {
            moves = 20
        }
        else {
            moves = Number(moves)
        }

        level['moveLimit'] = moves
    }

    if (currentMode.includes('Drop down') || currentMode.includes('Drop Down')) {
        let sprinks = 0

        let requirementsContainer = document.getElementById("requirements")
        for (var i = 0; i < requirementsContainer.children.length; i++) {
            element = requirementsContainer.children[i]

            if (element.getAttribute("reqtype") !== "ingredient") {
                continue
            }

            let item = element.querySelector("select").value

            let quantity = element.querySelector("input").value
            if (quantity === '') {
                quantity = 0
            }
            else {
                quantity = Number(quantity)
            }

            console.log(item)

            if (item == "sprinks") {
                sprinks = quantity
            }
        }

        level.numIngredientsOnScreen = 1
        level.maxNumIngredientsOnScreen = parseInt(document.getElementById('maxNumIngredientsOnScreen').value) || 0
        level.ingredientSpawnDensity = parseInt(document.getElementById('ingredientSpawnDensity').value) || 0

        level['ingredients'] = [sprinks]
    }

    if (currentMode.includes('Order')) {
        let orders = []
        let requirementsContainer = document.getElementById("requirements")
        for (var i = 0; i < requirementsContainer.children.length; i++) {
            element = requirementsContainer.children[i]

            if (element.getAttribute("reqtype") !== "order") {
                continue
            }

            let item = Number(element.querySelector("select").value)

            let quantity = element.querySelector("input").value
            if (quantity === '') {
                quantity = 0
            }
            else {
                quantity = Number(quantity)
            }

            orders.push({ "item": item, "quantity": quantity })
        }

        level['_itemsToOrder'] = orders
    }

    level['gameModeName'] = currentMode

    level['episodeId'] = 0

    level["evilSpawnerAmount"] = parseInt(document.getElementById('evilSpawnerAmount').value) || 3

    let magicMixerElements = []
    let mixerElementsContainer = document.getElementById("mixeroptions")
    for (var i = 0; i < mixerElementsContainer.children.length; i++) {
        element = mixerElementsContainer.children[i]

        let item = Number(element.querySelector("select").value)

        magicMixerElements.push(item)
    }

    level["evilSpawnerElements"] = magicMixerElements
    level["evilSpawnerInterval"] = parseInt(document.getElementById('evilSpawnerInterval').value) || 3

    //Add cannon preferences
    cannonCodes.forEach(function (nameArray) {
        let elm = nameArray[0]

        let cannonSettingAddons = ["Max", "Spawn", ""]

        cannonSettingAddons.push(nameArray[1])

        cannonSettingAddons.forEach(function (setting) {
            //console.log(elm + setting)
            let inputElement = document.getElementById(elm + setting)
            if (inputElement != null && inputElement.value != "") {
                level[elm + setting] = Number(inputElement.value) || 0
            }
        })
    })

    //dreamworld
    if (document.getElementById("isOwlModeEnabled").checked) {
        level.isOwlModeEnabled = true
        level.initialMovesUntilMoonStruck = parseInt(document.getElementById("initialMovesUntilMoonStruck").value) || 5
        level.initialMovesDuringMoonStruck = parseInt(document.getElementById("initialMovesDuringMoonStruck").value) || 3
        level.maxAllowedScaleDiff = parseInt(document.getElementById('maxAllowedScaleDiff').value) || 10
        level.leftWeightToTriggerMoonStruck = 0
        level.rightWeightToTriggerMoonStruck = 0
        level.totalWeightToTriggerMoonStruck = 0
        level.useSplitWeightConditionToTriggerMoonStruck = false
        level.useTotalWeightConditionToTriggerMoonStruck = false
    }
    
    // Generate tile groups for mall-o-matic and sprinks nest
    level['tileGroups'] = []
    
    // Find mall-o-matic structures (gummyRope)
    let processedMallOMaticTiles = new Set()
    levelObject.childNodes.forEach(function (row, rowIndex) {
        for (var colIndex = 0; colIndex < row.childNodes.length; colIndex++) {
            let object = row.childNodes[colIndex]
            let tileKey = rowIndex + "," + colIndex
            
            if (object.getAttribute("tile") == "000" || processedMallOMaticTiles.has(tileKey)) {
                continue
            }
            
            let normalAttr = object.getAttribute("normal")
            
            // Check if this is a mall-o-matic head
            if (normalAttr && normalAttr.startsWith("mallomatic_head_")) {
                let tiles = [[colIndex, rowIndex]] // Start with the head tile
                processedMallOMaticTiles.add(tileKey)
                
                // Determine direction and find connected body tiles
                let direction = ""
                if (normalAttr === "mallomatic_head_top" || normalAttr === "mallomatic_head_bottom") {
                    direction = "vertical"
                } else {
                    direction = "horizontal"
                }
                
                // Find all connected body tiles
                if (direction === "vertical") {
                    // Check all tiles in the same column
                    for (let r = 0; r < levelObject.childNodes.length; r++) {
                        if (r === rowIndex) continue // Skip the head tile
                        let checkObject = levelObject.childNodes[r].childNodes[colIndex]
                        let checkNormalAttr = checkObject.getAttribute("normal")
                        let checkTileKey = r + "," + colIndex
                        
                        if (checkNormalAttr === "231" && !processedMallOMaticTiles.has(checkTileKey)) {
                            tiles.push([colIndex, r])
                            processedMallOMaticTiles.add(checkTileKey)
                        }
                    }
                } else {
                    // Check all tiles in the same row
                    for (let c = 0; c < row.childNodes.length; c++) {
                        if (c === colIndex) continue // Skip the head tile
                        let checkObject = row.childNodes[c]
                        let checkNormalAttr = checkObject.getAttribute("normal")
                        let checkTileKey = rowIndex + "," + c
                        
                        if (checkNormalAttr === "231" && !processedMallOMaticTiles.has(checkTileKey)) {
                            tiles.push([c, rowIndex])
                            processedMallOMaticTiles.add(checkTileKey)
                        }
                    }
                }
                
                // Add the mall-o-matic tile group
                if (tiles.length > 1) {
                    level['tileGroups'].push({
                        "type": "gummyRope",
                        "tiles": tiles,
                        "params": {}
                    })
                }
            }
        }
    })
    
    // Find sprinks nest structures
    let processedSprinksNestTiles = new Set()
    levelObject.childNodes.forEach(function (row, rowIndex) {
        for (var colIndex = 0; colIndex < row.childNodes.length; colIndex++) {
            let object = row.childNodes[colIndex]
            let tileKey = rowIndex + "," + colIndex
            
            if (object.getAttribute("tile") == "000" || processedSprinksNestTiles.has(tileKey)) {
                continue
            }
            
            let normalAttr = object.getAttribute("normal")
            let cakeAttr = object.getAttribute("cake")
            
            // Check if this is a sprinks nest tile (top-left corner)
            if (normalAttr === "232" && cakeAttr === "1" && !processedSprinksNestTiles.has(tileKey)) {
                let tiles = []
                
                // Add all 4 tiles of the 2x2 structure in the correct order
                tiles.push([colIndex, rowIndex]) // top-left
                tiles.push([colIndex, rowIndex + 1]) // bottom-left
                tiles.push([colIndex + 1, rowIndex]) // top-right
                tiles.push([colIndex + 1, rowIndex + 1]) // bottom-right
                
                // Mark all tiles as processed
                tiles.forEach(tile => {
                    processedSprinksNestTiles.add(tile[1] + "," + tile[0])
                })
                
                // Add the sprinks nest tile group
                level['tileGroups'].push({
                    "type": "nest",
                    "tiles": tiles,
                    "params": {"strength": 4}
                })
            }
        }
    })
    
    // Add board size information
    let boardSize = levelObject.childNodes.length
    if (boardSize === 9) {
        level['boardRows'] = 9
        level['boardColumns'] = 9
    } else if (boardSize === 15) {
        level['boardRows'] = 15
        level['boardColumns'] = 15
    }
    
    // Add level type from #leveltype input
    let levelTypeInput = document.getElementById("leveltype")
    if (levelTypeInput && levelTypeInput.value.trim() !== "") {
        let levelTypeValue = levelTypeInput.value.trim()
        // Split by comma and trim each value, then filter out empty strings
        let levelTypes = levelTypeValue.split(',').map(type => type.trim()).filter(type => type !== "")
        if (levelTypes.length > 0) {
            level['levelType'] = levelTypes
        }
    }
    
    // Add level ID from #levelid input
    let levelIdInput = document.getElementById("levelid")
    if (levelIdInput && levelIdInput.value.trim() !== "") {
        level['id_meta'] = levelIdInput.value.trim()
    }
    
    // Add level target from #leveltarg input
    let levelTargInput = document.getElementById("leveltarg")
    if (levelTargInput && levelTargInput.value.trim() !== "") {
        level['levelDefinitionId_meta'] = levelTargInput.value.trim()
    }
    
    // Detect wonderful wrappers and generate wonderfulWrappers array
    level['wonderfulWrappers'] = []
    
    // Find all wonderful wrapper main tiles (tile 1)
    levelObject.childNodes.forEach(function (row, rowIndex) {
        for (var colIndex = 0; colIndex < row.childNodes.length; colIndex++) {
            let object = row.childNodes[colIndex]
            
            if (object.getAttribute("tile") == "000") {
                continue
            }
            
            // Check if this is a wonderful wrapper main tile (tile 1)
            if (object.getAttribute("wonderful_wrapper") === "1") {
                let orientation = object.getAttribute("wonderful_orientation") || "horizontal"
                
                // Get the other tile (tile 2) of the wonderful wrapper
                let otherTile
                if (orientation === "vertical") {
                    otherTile = levelObject.childNodes[rowIndex + 1].childNodes[colIndex]
                } else {
                    otherTile = row.childNodes[colIndex + 1]
                }
                
                // Collect ribbons from both tiles
                let ribbons = []
                const ribbonTypes = ["wonderful_blue_stripe", "wonderful_red_stripe", "wonderful_yellow_stripe", "wonderful_green_stripe", "wonderful_purple_stripe", "wonderful_orange_stripe"]
                
                // Check main tile (tile 1) for ribbons
                ribbonTypes.forEach(ribbonType => {
                    if (object.getAttribute(ribbonType)) {
                        ribbons.push(ribbonType)
                    }
                })
                
                // Check other tile (tile 2) for ribbons
                if (otherTile) {
                    ribbonTypes.forEach(ribbonType => {
                        if (otherTile.getAttribute(ribbonType)) {
                            ribbons.push(ribbonType)
                        }
                    })
                }
                
                // Also check the actual ribbon elements in the DOM to get individual ribbons
                const ribbonsContainer = object.querySelector(".ribbons-container")
                if (ribbonsContainer) {
                    const ribbonElements = ribbonsContainer.querySelectorAll(".ribbon-element")
                    if (ribbonElements.length > 0) {
                        // Clear the ribbons array and rebuild from actual elements
                        ribbons = []
                        ribbonElements.forEach(ribbonElement => {
                            const ribbonType = ribbonElement.getAttribute("data-ribbon-type")
                            if (ribbonType) {
                                ribbons.push(ribbonType)
                            }
                        })
                    }
                }
                
                // Convert ribbon types to numbers in order
                let ribbonNumbers = []
                for (let i = 0; i < 5; i++) {
                    if (i < ribbons.length) {
                        let ribbonType = ribbons[i]
                        if (ribbonType === "wonderful_blue_stripe") ribbonNumbers.push(0)
                        else if (ribbonType === "wonderful_green_stripe") ribbonNumbers.push(1)
                        else if (ribbonType === "wonderful_orange_stripe") ribbonNumbers.push(2)
                        else if (ribbonType === "wonderful_purple_stripe") ribbonNumbers.push(3)
                        else if (ribbonType === "wonderful_red_stripe") ribbonNumbers.push(4)
                        else if (ribbonType === "wonderful_yellow_stripe") ribbonNumbers.push(5)
                        else if (ribbonType === "wonderful_random_stripe") ribbonNumbers.push(-1) // random ribbon
                        else ribbonNumbers.push(-1) // no ribbon or unknown type
                    } else {
                        ribbonNumbers.push(-1) // no ribbon
                    }
                }
                
                // Collect contained elements from both tiles
                let containedElements = []
                let containedElementColors = []
                const elementTypes = ["wonderful_colorbomb", "wonderful_striped_horizontal", "wonderful_striped_vertical", "wonderful_wrapped", "wonderful_jellyfish"]
                
                // Check main tile (tile 1) for contained elements
                elementTypes.forEach(elementType => {
                    if (object.getAttribute(elementType)) {
                        // Convert element type to number
                        let elementNumber
                        if (elementType === "wonderful_colorbomb") elementNumber = 44
                        else if (elementType === "wonderful_striped_horizontal") elementNumber = 45
                        else if (elementType === "wonderful_striped_vertical") elementNumber = 46
                        else if (elementType === "wonderful_wrapped") elementNumber = 47
                        else if (elementType === "wonderful_jellyfish") elementNumber = 49
                        else elementNumber = -1
                        
                        containedElements.push(elementNumber)
                        
                        // Get color for colored elements
                        if (elementType === "wonderful_colorbomb") {
                            containedElementColors.push(-1) // color bomb is always -1
                        } else {
                            let colorAttr = elementType + "_color"
                            let colorValue = object.getAttribute(colorAttr)
                            if (colorValue) {
                                // Convert color to number
                                if (colorValue === "blue") containedElementColors.push(0)
                                else if (colorValue === "green") containedElementColors.push(1)
                                else if (colorValue === "orange") containedElementColors.push(2)
                                else if (colorValue === "purple") containedElementColors.push(3)
                                else if (colorValue === "red") containedElementColors.push(4)
                                else if (colorValue === "yellow") containedElementColors.push(5)
                                else containedElementColors.push(-1) // random color
                            } else {
                                containedElementColors.push(-1) // random color
                            }
                        }
                    }
                })
                
                // Check other tile (tile 2) for contained elements
                if (otherTile) {
                    elementTypes.forEach(elementType => {
                        if (otherTile.getAttribute(elementType)) {
                            // Convert element type to number
                            let elementNumber
                            if (elementType === "wonderful_colorbomb") elementNumber = 44
                            else if (elementType === "wonderful_striped_horizontal") elementNumber = 45
                            else if (elementType === "wonderful_striped_vertical") elementNumber = 46
                            else if (elementType === "wonderful_wrapped") elementNumber = 47
                            else if (elementType === "wonderful_jellyfish") elementNumber = 49
                            else elementNumber = -1
                            
                            containedElements.push(elementNumber)
                            
                            // Get color for colored elements
                            if (elementType === "wonderful_colorbomb") {
                                containedElementColors.push(-1) // color bomb is always -1
                            } else {
                                let colorAttr = elementType + "_color"
                                let colorValue = otherTile.getAttribute(colorAttr)
                                if (colorValue) {
                                    // Convert color to number
                                    if (colorValue === "blue") containedElementColors.push(0)
                                    else if (colorValue === "green") containedElementColors.push(1)
                                    else if (colorValue === "orange") containedElementColors.push(2)
                                    else if (colorValue === "purple") containedElementColors.push(3)
                                    else if (colorValue === "red") containedElementColors.push(4)
                                    else if (colorValue === "yellow") containedElementColors.push(5)
                                    else containedElementColors.push(-1) // random color
                                } else {
                                    containedElementColors.push(-1) // random color
                                }
                            }
                        }
                    })
                }
                
                // Pad contained elements and colors to 2 elements
                while (containedElements.length < 2) {
                    containedElements.push(-1) // no element
                    containedElementColors.push(-1) // no color
                }
                
                // Create wonderful wrapper entry: [first tile, orientation, ribbon1, ribbon2, ribbon3, ribbon4, ribbon5, element1, element2, color1, color2]
                let wonderfulWrapperEntry = [
                    colIndex, rowIndex,  // first tile
                    orientation === "vertical" ? 1 : 2,  // orientation (1=vertical, 2=horizontal)
                    ...ribbonNumbers,  // ribbon1-5
                    ...containedElements,  // element1-2
                    ...containedElementColors  // color1-2
                ]
                
                level['wonderfulWrappers'].push(wonderfulWrapperEntry)
            }
        }
    })
    
    return level
}

// This duplicate exportLevelUI function has been removed to prevent conflicts
// The main exportLevelUI function is defined earlier in the file

function resized() {
    let container = document.getElementById("level")
    let width = window.innerWidth * .00078
    let height = window.innerHeight * .00078

    document.documentElement.style.setProperty("--scaleWidth", width)
    document.documentElement.style.setProperty("--scaleHieght", height)
}

window.onresize = function () {
    resized()
}

resized()

function createNewTable(clear = false, size = 9) {

    
    var levelTable = document.getElementById('level')
    levelTable.innerHTML = ""
    
    // Clear all wonderful wrappers before clearing the table
    if (clear) {
        const allWonderfulWrappers = document.querySelectorAll('td[wonderful_wrapper]')
        allWonderfulWrappers.forEach(wrapper => {
            removeWonderfulWrapper(wrapper, true)
        })
    }
    
    // Reset conveyor belt groups
    conveyorGroups = []
    currentConveyorGroup = []
    isConveyorGroupingMode = false
    
    // Hide the conveyor belt button since there are no conveyor belts
    const btn = document.getElementById('done-conveyor-btn')
    if (btn) {
        btn.style.display = 'none'
    }
    for (let i = 0; i < size; i++) {
        var row = document.createElement("tr")
        levelTable.appendChild(row)
        for (let g = 0; g < size; g++) {
            var object = document.createElement("td")
            object.setAttribute("style", "position: relative; left: 0; top: 0;")

            object.setAttribute("pos-row", i)
            object.setAttribute("pos-col", g)

            object.setAttribute("candy_cannon", '')

            object.addEventListener('contextmenu', function (ev) {
                ev.preventDefault()
                let object = ev.target
                if (object.nodeType != "td") {
                    object = object.parentNode
                }
                updateElmState(object)
            }, false)

            object.onmouseover = function (event) {
                event.preventDefault();
                this.classList.add("selected")
                if (isDown) {
                    updateTile(this)
                }
            }

            object.onmousedown = function (event) {
                event.preventDefault()
                if (event.button === 0) {
                    event.preventDefault()
                    isDown = true
                    updateTile(this)

                }
            }
            object.onmouseout = function (event) {
                event.preventDefault();
                try {
                    this.classList.remove("selected")
                }
                catch { }
            }


            if (!clear) {
                object.setAttribute('normal', "002")
                object.setAttribute('color', "002")
            }
            object.setAttribute('tile', "001")

            let ammo = object.appendChild(document.createElement("div"))
            ammo.classList.add("ammocontainer")

            layers.forEach(function (layer) {
                let image = document.createElement("img")
                image.setAttribute('draggable', false)
                // image.style.display = "block"
                image.classList.add(layer)
                image.classList.add("default")
                object.appendChild(image)
            })

            image = object.querySelector(".tile")
            image.src = 'elements/grid.png'
            image.classList.remove("default")

            if (!clear) {
                if (i === 0) {
                    image = object.querySelector(".candy_entrance")
                    image.src = elementsFolder + "candy_entrance.png"
                    object.setAttribute("candy_entrance", "026")
                    object.setAttribute("candy_cannon", '["005"]')
                }

                image = object.querySelector(".normal")
                image.src = elementsFolder + elements_ids["002"] + ".png"
                image.classList.add("small")
            }

            image = object.querySelector(".selectimg")
            image.src = elementsFolder + "select.png"
            image.style.display = "none"

            row.appendChild(object)
        }
    }
    
    // Update cobra and basket rotations after creating new table
    setTimeout(() => updateAllCobraBasketRotations(), 0)
    
    // Reset unsaved changes flag when creating new table
    hasUnsavedChanges = false;
    
    // 🔥 FIXED: Don't trigger auto-save when creating table during import
    // This was causing the level data to be overwritten during loading
    //
}

// URL parameter utility functions
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Handle game mode template URL parameters
function handleGameModeTemplate() {
    const gameModeTemplate = getURLParameter('gmtpl');
    
    if (gameModeTemplate === 'jelly') {
        // Select Jelly game mode
        const jellyOption = document.getElementById('jellyoption');
        if (jellyOption) {
            jellyOption.click();
        }
        
        // Place jellies on all tiles
        setTimeout(() => {
            const level = document.getElementById('level');
            if (level) {
                const rows = level.children;
                for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                    const row = rows[rowIndex];
                    for (let colIndex = 0; colIndex < row.children.length; colIndex++) {
                        const tile = row.children[colIndex];
                        if (tile && tile.getAttribute('tile') === '001') {
                            // Place jelly2 on the tile
                            tile.setAttribute('tile', '004'); // jelly2
                            const tileImg = tile.querySelector('.tile');
                            if (tileImg) {
                                tileImg.src = 'elements/jelly2.png';
                            }
                        }
                    }
                }
            }
        }, 100);
        
    } else if (gameModeTemplate === 'sprinks') {
        // Select Ingredients game mode
        const ingredientsOption = document.getElementById('ingredientsoption');
        if (ingredientsOption) {
            ingredientsOption.click();
        }
        
        // Place cherries and ingredient exits on the last row
        setTimeout(() => {
            const level = document.getElementById('level');
            if (level) {
                const rows = level.children;
                const lastRowIndex = rows.length - 1;
                const lastRow = rows[lastRowIndex];
                
                if (lastRow) {
                    for (let colIndex = 0; colIndex < lastRow.children.length; colIndex++) {
                        const tile = lastRow.children[colIndex];
                        if (tile) {
                            // Place sprinks on every other tile
                            if (colIndex % 2 === 0) {
                                tile.setAttribute('normal', 'sprinks');
                                const normalImg = tile.querySelector('.normal');
                                if (normalImg) {
                                    normalImg.src = 'elements/sprinks_egg_wrapped.png';
                                    normalImg.classList.remove('small');
                                }
                            } else {
                                // Place ingredient exit on the remaining tiles
                                tile.setAttribute('ingredients_exit', '010');
                                const ingredientExitImg = tile.querySelector('.ingredients_exit');
                                if (ingredientExitImg) {
                                    ingredientExitImg.src = 'elements/ingredients_exit.png';
                                }
                            }
                        }
                    }
                }
            }
        }, 100);
    }
    // Auto-save removed - manual saves only via CTRL+S
}

// Initialize table with URL parameters
function initializeTable() {
    const boardTemplate = getURLParameter('boardTemplate');
    let size = 9; // default size
    
    if (boardTemplate === '15x15') {
        size = 15;
    } else if (boardTemplate === '9x9' || !boardTemplate) {
        size = 9;
    }
    
    createNewTable(false, size);
    
    // 🔥 REMOVED: Don't auto-save during initialization
    // This was causing the loaded level data to be overwritten
    //
}

// Initialize save prompt system
function initializeSavePromptSystem() {
    // Add event listeners for save prompt buttons
    document.addEventListener('click', function(event) {
        if (event.target.id === 'save') {
            event.preventDefault();
            
            // Save the level
            saveLevel();
            
            // Show success message
            showSaveSuccess();
            
            // Execute pending action after 0.75 seconds
            setTimeout(() => {
                hideSavePrompt();
                executePendingAction();
            }, 750);
        } else if (event.target.id === 'exitwithoutsave') {
            event.preventDefault();
            
            // Hide prompt and execute action immediately
            hideSavePrompt();
            executePendingAction();
        }
    });
    
    // Add event listeners for form inputs that should mark changes as unsaved
    document.addEventListener('input', function(event) {
        // Check if the input is related to level settings
        const target = event.target;
        if (target.id === 'moves' || target.id === 'time' || 
            target.id === 'star1' || target.id === 'star2' || target.id === 'star3' ||
            target.id === 'disablebooster' || target.id === 'isOwlModeEnabled' ||
            target.id === 'initialMovesUntilMoonStruck' || target.id === 'initialMovesDuringMoonStruck' ||
            target.id === 'maxAllowedScaleDiff' || target.id === 'evilSpawnerAmount' ||
            target.id === 'evilSpawnerInterval' || target.id === 'maxNumIngredientsOnScreen' ||
            target.id === 'ingredientSpawnDensity') {
            markAsUnsaved();
        }
    });
    
    // Add event listeners for radio buttons and checkboxes
    document.addEventListener('change', function(event) {
        const target = event.target;
        if (target.name === 'leveltype' || target.type === 'checkbox') {
            markAsUnsaved();
        }
        
        // Check for requirement changes
        if (target.closest('#requirements') || target.closest('#mixeroptions')) {
            markAsUnsaved();
        }
    });
    
    // Add event listeners for requirement and mixer option changes
    document.addEventListener('input', function(event) {
        const target = event.target;
        if (target.closest('#requirements') || target.closest('#mixeroptions')) {
            markAsUnsaved();
        }
    });
    
    // Note: We can't completely prevent browser's default tab closing behavior
    // But we can handle keyboard shortcuts and other navigation methods
    // The toaster will work for Ctrl+W, back button, and other navigation
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function(event) {
        if (hasUnsavedChanges && !isSavePromptActive) {
            event.preventDefault();
            showSavePrompt('back');
            // Push the state back to prevent navigation
            window.history.pushState(null, null, window.location.href);
        }
    });
    
    // Override goBackToApp function to check for unsaved changes
    const originalGoBackToApp = window.goBackToApp;
    window.goBackToApp = function() {
        if (hasUnsavedChanges && !isSavePromptActive) {
            showSavePrompt('navigate');
            return;
        }
        originalGoBackToApp();
    };
    
    // Override window.close to check for unsaved changes
    const originalClose = window.close;
    window.close = function() {
        if (hasUnsavedChanges && !isSavePromptActive) {
            showSavePrompt('close');
            return;
        }
        if (typeof originalClose === 'function') {
            originalClose();
        }
    };
    
    // Override window.onbeforeunload to show a simple message (can't show custom UI)
    window.onbeforeunload = function(event) {
        if (hasUnsavedChanges && !isSavePromptActive) {
            event.preventDefault();
            event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return event.returnValue;
        }
    };
    
    // Add event listeners for back button and other navigation elements
    document.addEventListener('click', function(event) {
        const target = event.target;
        
        // Check for back button clicks
        if (target.closest('.back-to-app') || target.closest('[onclick*="goBackToApp"]')) {
            if (hasUnsavedChanges && !isSavePromptActive) {
                event.preventDefault();
                event.stopPropagation();
                showSavePrompt('navigate');
                return false;
            }
        }
        
        // Check for export button clicks - change to quick save
        if (target.closest('.export-button')) {
            event.preventDefault();
            event.stopPropagation();
            quickSave();
            return false;
        }
        
        // Check for advanced save button clicks - open full dialog
        if (target.closest('.advanced-save-lev')) {
            event.preventDefault();
            event.stopPropagation();
            showExportDialog();
            return false;
        }
        
        // Check for any links that navigate away
        if (target.tagName === 'A' && target.href && !target.href.includes(window.location.origin)) {
            if (hasUnsavedChanges && !isSavePromptActive) {
                event.preventDefault();
                showSavePrompt({ type: 'navigate', url: target.href });
                return false;
            }
        }
    });
    
    // Handle keyboard shortcuts for navigation
    document.addEventListener('keydown', function(event) {
        // Alt + Left Arrow (browser back)
        if (event.altKey && event.key === 'ArrowLeft') {
            if (hasUnsavedChanges && !isSavePromptActive) {
                event.preventDefault();
                showSavePrompt('back');
                return false;
            }
        }
        
        // Alt + Right Arrow (browser forward)
        if (event.altKey && event.key === 'ArrowRight') {
            if (hasUnsavedChanges && !isSavePromptActive) {
                event.preventDefault();
                showSavePrompt('forward');
                return false;
            }
        }
        
        // Ctrl + W (close tab/window)
        if (event.ctrlKey && event.key === 'w') {
            if (hasUnsavedChanges && !isSavePromptActive) {
                event.preventDefault();
                showSavePrompt('close');
                return false;
            }
        }
        
        // Ctrl + Shift + W (close window)
        if (event.ctrlKey && event.shiftKey && event.key === 'W') {
            if (hasUnsavedChanges && !isSavePromptActive) {
                event.preventDefault();
                showSavePrompt('close');
                return false;
            }
        }
        
        // F4 (close window in some browsers)
        if (event.key === 'F4' && event.altKey) {
            if (hasUnsavedChanges && !isSavePromptActive) {
                event.preventDefault();
                showSavePrompt('close');
                return false;
            }
        }
    });
}

// Handle game mode template URL parameters
handleGameModeTemplate()

document.addEventListener('mouseup', function () {
    isDown = false;
    isPortalTimeout = false;
}, true);

//Auto set up left GUI colors
document.querySelectorAll(".selectcolor").forEach(function (element) {
    let color = element.getAttribute("color")
    let parent = element.parentElement

    let button = document.createElement('button')
    let image = button.appendChild(document.createElement("img"))
    image.classList.add("selectionimage")
    image.src = elementsFolder + color + ".png"

    button.setAttribute("onclick", "updateColor(this, \"" + color + "\")")

    element.remove()
    parent.appendChild(button)
})

//Auto set up left GUI colored elements
document.querySelectorAll(".selectcoloredelement").forEach(function (element) {
    let elementName = element.getAttribute('element')
    let parent = element.parentElement

    let button = document.createElement('button')
    let image = button.appendChild(document.createElement("img"))
    image.classList.add("selectionimage")
    
    // Check if this is in the wonderful wrapper section
    let isWonderfulWrapper = parent.closest('#wonderful-wrapper') !== null
    
    if (isWonderfulWrapper) {
        // For wonderful wrapper colored elements, use wonderful layer
        if (elementName === "colorbomb") {
            image.src = elementsFolder + "bomb.png"
        } else {
            image.src = elementsFolder + elementName + "_random.png"
        }
        button.setAttribute("onclick", "updateSelection(this, '" + elementName + "', 'wonderful')")
    } else {
        // For regular colored elements, use normal layer
        if (elementName === "colorbomb") {
            image.src = elementsFolder + "bomb.png"
        } else {
            image.src = elementsFolder + elementName + "_random.png"
        }
        button.setAttribute("onclick", "updateSelection(this, '" + elementName + "', 'normal')")
    }

    element.remove()
    parent.appendChild(button)
})

//Auto set up left GUI elements
document.querySelectorAll(".selectelement").forEach(function (element) {
    let elementName = element.getAttribute('element')
    let parent = element.parentElement

    let button = document.createElement('button')
    let layer = element.getAttribute("gamelayer")

    if (layer == "candy_cannon" && element.getAttribute('element') != "candy_cannon") {
        let ammoImage = button.appendChild(document.createElement("img"))
        ammoImage.setAttribute("style", "max-width: 40px; position: absolute; height: 40px; pointer-events: none;")
        ammoImage.src = elementsFolder + "/ammo.png"
    }

    let image = button.appendChild(document.createElement("img"))
    image.classList.add("selectionimage")
    
    // Special cases for mall-o-matic directional buttons
    if (elementName === "mallomatic_head_top") {
        image.src = elementsFolder + "mallomatic_head_top.png"
    } else if (elementName === "mallomatic_head_left") {
        image.src = elementsFolder + "mallomatic_head_left.png"
    } else if (elementName === "mallomatic_head_right") {
        image.src = elementsFolder + "mallomatic_head_right.png"
    } else if (elementName === "mallomatic_head_bottom") {
        image.src = elementsFolder + "mallomatic_head_bottom.png"
    } else if (elementName === "sprinks_nest") {
        image.src = elementsFolder + "sprinks_nest_top_left.png"
    } else if (elementName === "232") {
        image.src = elementsFolder + "sprinks_nest_top_left.png"
    } else if (elementName === "sprinks_nest_top_left" || elementName === "sprinks_nest_top_right" || elementName === "sprinks_nest_bottom_left" || elementName === "sprinks_nest_bottom_right") {
        image.src = elementsFolder + elementName + ".png"
    } else if (elementName === "wonderful_base") {
        image.src = elementsFolder + "wonderful_base.webp"
    } else if (elementName === "wonderful_blue_stripe" || elementName === "wonderful_red_stripe" || elementName === "wonderful_yellow_stripe" || elementName === "wonderful_green_stripe" || elementName === "wonderful_purple_stripe" || elementName === "wonderful_orange_stripe") {
        image.src = elementsFolder + elementName + ".webp"
    } else if (elementName === "wonderful_colorbomb") {
        image.src = elementsFolder + "bomb.png"
    } else if (elementName === "wonderful_striped_horizontal") {
        image.src = elementsFolder + "striped_horizontal_random.png"
    } else if (elementName === "wonderful_striped_vertical") {
        image.src = elementsFolder + "striped_vertical_random.png"
    } else if (elementName === "wonderful_wrapped") {
        image.src = elementsFolder + "wrapped_random.png"
    } else if (elementName === "wonderful_jellyfish") {
        image.src = elementsFolder + "jellyfish_random.png"
    } else {
        image.src = elementsFolder + elementName + ".png"
    }


    button.setAttribute("onclick", "updateSelection(this, \"" + elementName + "\", '" + layer + "')")

    element.remove()
    parent.appendChild(button)
})

//Auto set up cannon preference elements
document.querySelectorAll(".cannonpref").forEach(function (element) {
    let elm = element.getAttribute("elm")
    let imageSrc = element.getAttribute("image")
    let tick = element.getAttribute("tick")

    element.innerHTML = '<td> <img class="elmimg" style="max-width: 70%;"> </td> <td> <div class="text-field"> <input class="max" style="width: 50px; text-align: center;" placeholder="0" type="number"> </div> </td> <td> <div class="text-field"> <input class="spawn" style="width: 50px; text-align: center;" placeholder="0" type="number"> </div> </td> <td> <div class="text-field"> <input class="tick" style="width: 50px; text-align: center;" placeholder="0" type="number"> </div> </td>'

    element.querySelector(".elmimg").src = imageSrc
    element.querySelector(".max").id = elm + "Max"
    element.querySelector(".spawn").id = elm + "Spawn"
    if (tick != "") {
        element.querySelector(".tick").id = elm + tick
    }
    else {
        element.querySelector(".tick").style.display = "none"
    }
})

function injectDialogOpenKeyframes(shadowRoot) {
    // Check if already injected
    if (shadowRoot.querySelector('style[data-dialogopen]')) return;
    const style = document.createElement('style');
    style.setAttribute('data-dialogopen', 'true');
    style.textContent = `
        @keyframes dialogOpen {
            0% {
                opacity: 0;
                transform: scale(1.2);
            }
            100% {
                opacity: 1;
                transform: scale(1);
            }
        }
    `;
    shadowRoot.appendChild(style);
}

// For all current and future mdui-dialogs
function patchAllDialogs() {
    document.querySelectorAll('mdui-dialog').forEach(dialog => {
        if (dialog.shadowRoot) {
            injectDialogOpenKeyframes(dialog.shadowRoot);
        } else {
            // Wait for upgrade if not yet available
            customElements.whenDefined('mdui-dialog').then(() => {
                if (dialog.shadowRoot) {
                    injectDialogOpenKeyframes(dialog.shadowRoot);
                }
            });
        }
    });
}

// Patch on DOMContentLoaded and when new dialogs are added
document.addEventListener('DOMContentLoaded', patchAllDialogs);
new MutationObserver(patchAllDialogs).observe(document.body, { childList: true, subtree: true });

function removeDialogPseudoElements(shadowRoot) {
    // Prevent duplicate injection
    if (shadowRoot.querySelector('style[data-remove-pseudo]')) return;
    const style = document.createElement('style');
    style.setAttribute('data-remove-pseudo', 'true');
    style.textContent = `
        :host::before, :host::after,
        [part="panel"]::before, [part="panel"]::after {
            display: none !important;
            content: none !important;
        }
    `;
    shadowRoot.appendChild(style);
}

function patchAllDialogsForPseudo() {
    document.querySelectorAll('mdui-dialog').forEach(dialog => {
        if (dialog.shadowRoot) {
            removeDialogPseudoElements(dialog.shadowRoot);
        } else {
            customElements.whenDefined('mdui-dialog').then(() => {
                if (dialog.shadowRoot) {
                    removeDialogPseudoElements(dialog.shadowRoot);
                }
            });
        }
    });
}

// Run on DOMContentLoaded and when new dialogs are added
document.addEventListener('DOMContentLoaded', patchAllDialogsForPseudo);
new MutationObserver(patchAllDialogsForPseudo).observe(document.body, { childList: true, subtree: true });

// Script to remove md-ripple opacity from all md-icon-button elements
function removeMdRippleOpacity() {
    // Select all md-icon-button elements
    document.querySelectorAll('md-icon-button').forEach(iconButton => {
        // Check if shadow root exists
        if (iconButton.shadowRoot) {
            applyRippleOpacity(iconButton.shadowRoot);
        } else {
            // Wait for the component to be upgraded if shadow root is not yet available
            customElements.whenDefined('md-icon-button').then(() => {
                if (iconButton.shadowRoot) {
                    applyRippleOpacity(iconButton.shadowRoot);
                }
            });
        }
    });
}

function applyRippleOpacity(shadowRoot) {
    // Find all md-ripple elements inside the shadow root
    const rippleElements = shadowRoot.querySelectorAll('md-ripple');
    rippleElements.forEach(ripple => {
        ripple.style.opacity = '0';
    });
}

// Run on DOMContentLoaded and when new elements are added
document.addEventListener('DOMContentLoaded', removeMdRippleOpacity);
new MutationObserver(removeMdRippleOpacity).observe(document.body, {
    childList: true,
    subtree: true
});

// Utility to patch all custom checkboxes with <md-icon> checkmarks
function patchAllCustomCheckboxes() {
    // Find all custom checkboxes (label.checkbox with input[type=checkbox] and md-icon)
    document.querySelectorAll('label.checkbox').forEach(label => {
        const input = label.querySelector('input[type="checkbox"]');
        const checkmark = label.querySelector('md-icon');
        const span = label.querySelector('.checkmark');
        if (!input || !checkmark) return;

        // Only add the event listener once
        if (!input._customCheckboxPatched) {
            function updateCheck() {
                checkmark.style.display = input.checked ? "flex" : "none";
                span.style.backgroundColor = input.checked ? "#2469ff" : "#eeeeee00";
                span.style.borderColor = input.checked ? "#2469ff00" : "#ccc";
            }
            input.addEventListener('change', updateCheck);
            // Initial state
            updateCheck();
            input._customCheckboxPatched = true;
        }
    });
}

// Run on DOMContentLoaded and when new checkboxes are added
document.addEventListener('DOMContentLoaded', patchAllCustomCheckboxes);
new MutationObserver(patchAllCustomCheckboxes).observe(document.body, { childList: true, subtree: true });

/* 
HTML structure (Material 3 style):

<div class="slider-container">
    <button class="zoom-out md-icon-button" title="Zoom out">
        <md-icon>zoom_out</md-icon>
    </button>
    <div class="slider">
        <div class="slider-track"></div>      <!-- background bar -->
        <div class="slider-active"></div>     <!-- filled/active bar -->
        <div class="slider-thumb"></div>      <!-- thumb/handle -->
    </div>
    <button class="zoom-in md-icon-button" title="Zoom in">
        <md-icon>zoom_in</md-icon>
    </button>
</div>

CSS (injects automatically if not present):


*/

(function() {
    // Helper: clamp value between min and max
    function clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }

    // Settings
    const minScale = 0.5;
    const maxScale = 2.0;
    const step = 0.05;

    // --- HTML structure creation/patch ---
    // Find or create slider container
    let sliderContainer = document.querySelector('.slider-container');
    if (!sliderContainer) {
        sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';
        // Insert into DOM as needed, e.g. document.body.appendChild(sliderContainer);
        // You may want to insert this at a specific place in your layout
        document.body.appendChild(sliderContainer);
    }

    // Find or create zoom out button
    let zoomOutBtn = sliderContainer.querySelector('.zoom-out');
    if (!zoomOutBtn) {
        zoomOutBtn = document.createElement('button');
        zoomOutBtn.className = 'zoom-out md-icon-button';
        zoomOutBtn.title = 'Zoom out';
        zoomOutBtn.innerHTML = '<md-icon>zoom_out</md-icon>';
        sliderContainer.appendChild(zoomOutBtn);
    }

    // Find or create slider root
    let slider = sliderContainer.querySelector('.slider');
    if (!slider) {
        slider = document.createElement('div');
        slider.className = 'slider';
        sliderContainer.appendChild(slider);
    }

    // Find or create track bar (background)
    let sliderTrack = slider.querySelector('.slider-track');
    if (!sliderTrack) {
        sliderTrack = document.createElement('div');
        sliderTrack.className = 'slider-track';
        slider.appendChild(sliderTrack);
    }

    // Find or create filled track (active bar)
    let sliderActive = slider.querySelector('.slider-active');
    if (!sliderActive) {
        sliderActive = document.createElement('div');
        sliderActive.className = 'slider-active';
        slider.appendChild(sliderActive);
    }

    // Find or create thumb
    let sliderThumb = slider.querySelector('.slider-thumb');
    if (!sliderThumb) {
        sliderThumb = document.createElement('div');
        sliderThumb.className = 'slider-thumb';
        slider.appendChild(sliderThumb);
    }

    // Find or create zoom in button
    let zoomInBtn = sliderContainer.querySelector('.zoom-in');
    if (!zoomInBtn) {
        zoomInBtn = document.createElement('button');
        zoomInBtn.className = 'zoom-in md-icon-button';
        zoomInBtn.title = 'Zoom in';
        zoomInBtn.innerHTML = '<md-icon>zoom_in</md-icon>';
        sliderContainer.appendChild(zoomInBtn);
    }

    // Find vertical center target
    const verticalCenter = document.querySelector('.vertical-center');
    if (!slider || !sliderTrack || !sliderThumb || !verticalCenter) return;

    // --- JS logic for slider ---
    window.scale = 1.0;

    // Use global isMobile function

    // Unified scale limits for all devices
    function getScaleLimits() {
        return { min: 0.3, max: 2.0 }; // Same range for all devices
    }

    function setScale(newScale) {
        const limits = getScaleLimits();
        window.scale = clamp(newScale, limits.min, limits.max);
        
        // Get current translation from the transform
        const currentTransform = verticalCenter.style.transform;
        const translateMatch = currentTransform.match(/translate\(([^)]+)\)/);
        let translateX = 0, translateY = 0;
        
        if (translateMatch) {
            const translateValues = translateMatch[1].split(',');
            translateX = parseInt(translateValues[0]) || 0;
            translateY = parseInt(translateValues[1]) || 0;
        }
        
        // Apply unified scaling
        verticalCenter.style.transform = `translate(${translateX}px, ${translateY}px) scale(${window.scale})`;
        
        updateSliderThumb();
    }

    // Function to update scale without affecting position
    function updateScaleOnly(newScale) {
        const limits = getScaleLimits();
        window.scale = clamp(newScale, limits.min, limits.max);
        
        // Get current translation from the transform
        const currentTransform = verticalCenter.style.transform;
        const translateMatch = currentTransform.match(/translate\(([^)]+)\)/);
        let translateX = 0, translateY = 0;
        
        if (translateMatch) {
            const translateValues = translateMatch[1].split(',');
            translateX = parseInt(translateValues[0]) || 0;
            translateY = parseInt(translateValues[1]) || 0;
        }
        
        // Apply scale while preserving position
        verticalCenter.style.transform = `translate(${translateX}px, ${translateY}px) scale(${window.scale})`;
        
        updateSliderThumb();
    }

    function updateSliderThumb() {
        const sliderWidth = slider.offsetWidth;
        const thumbWidth = sliderThumb.offsetWidth;
        const limits = getScaleLimits();
        const range = limits.max - limits.min;
        const percent = (window.scale - limits.min) / range;
        const pos = percent * (sliderWidth - thumbWidth);

        // Thumb position
        sliderThumb.style.left = `${pos}px`;

        // Active track width
        sliderActive.style.width = `${pos + thumbWidth/2}px`;
    }

    function getScaleFromX(x) {
        const rect = slider.getBoundingClientRect();
        const sliderWidth = slider.offsetWidth;
        const thumbWidth = sliderThumb.offsetWidth;
        const limits = getScaleLimits();
        const range = limits.max - limits.min;
        let relX = clamp(x - rect.left - thumbWidth/2, 0, sliderWidth - thumbWidth);
        let percent = relX / (sliderWidth - thumbWidth);
        return limits.min + percent * range;
    }

    // Drag logic
    let dragging = false;
    function onPointerDown(e) {
        dragging = true;
        document.body.style.userSelect = 'none';
        onPointerMove(e);
    }
    function onPointerMove(e) {
        if (!dragging) return;
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        setScale(getScaleFromX(clientX));
    }
    function onPointerUp() {
        dragging = false;
        document.body.style.userSelect = '';
    }

    sliderThumb.addEventListener('mousedown', onPointerDown);
    sliderThumb.addEventListener('touchstart', onPointerDown, {passive: false});
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, {passive: false});
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    // Clicking on track moves thumb
    slider.addEventListener('mousedown', function(e) {
        if (e.target === sliderThumb) return;
        setScale(getScaleFromX(e.clientX));
    });
    slider.addEventListener('touchstart', function(e) {
        if (e.target === sliderThumb) return;
        setScale(getScaleFromX(e.touches[0].clientX));
    }, {passive: false});

    // Zoom in/out buttons
    zoomInBtn.addEventListener('click', function() {
        setScale(scale + step);
    });
    zoomOutBtn.addEventListener('click', function() {
        setScale(scale - step);
    });

    // Initial UI update
    setScale(scale);

    // Responsive: update thumb on resize
    window.addEventListener('resize', function() {
        updateSliderThumb();
        // Don't reset position or scale on resize - just update the slider thumb
    });
})();

// Mode switching functionality
// Use existing currentMode variable for drag/normal mode
let dragMode = 'normal'; // 'normal' or 'drag'

function toggleMode(mode) {
    const normalBtn = document.getElementById('normal-mode-btn');
    const dragBtn = document.getElementById('drag-mode-btn');
    const body = document.body;
    
    // Check if buttons exist before using them
    if (!normalBtn || !dragBtn) return;
    
    // Update button states
    if (mode === 'normal') {
        normalBtn.classList.add('active');
        dragBtn.classList.remove('active');
        body.classList.remove('drag-mode');
        body.classList.add('normal-mode');
        dragMode = 'normal';
    } else if (mode === 'drag') {
        normalBtn.classList.remove('active');
        dragBtn.classList.add('active');
        body.classList.remove('normal-mode');
        body.classList.add('drag-mode');
        dragMode = 'drag';
    }
}

// Initialize mode (start with normal mode)
document.addEventListener('DOMContentLoaded', function() {
    toggleMode('normal');
    
    // 🔥 FIXED: Initialize table FIRST (creates empty board structure)
    initializeTable();
    
    // Initialize save prompt system
    initializeSavePromptSystem();
    
    // 🔥 FIXED: Load level data directly without initializing auto-save
    loadLevelOnStartup().catch(error => {
        console.error('❌ ERROR in loadLevelOnStartup:', error);
        showUserMessage('Failed to load level on startup: ' + error.message, 'error');
    });
});

    // Unified drag and scale system for all screen sizes
    (function() {
        const verticalCenter = document.querySelector('.vertical-center');
        if (!verticalCenter) return;

        let isDragging = false;
        let startX, startY;
        let currentX = 0, currentY = 0;
        let lastX = 0, lastY = 0;

        // Initialize transform
        verticalCenter.style.transform = 'translate(0px, 0px) scale(1)';

        // Reset function
        function resetDrag() {
            currentX = 0;
            currentY = 0;
            lastX = 0;
            lastY = 0;
            window.scale = 1.0;
            verticalCenter.style.transform = 'translate(0px, 0px) scale(1)';
            updateSliderThumb();
        }

        // Make resetDrag function globally available
        window.resetDrag = resetDrag;

    function startDragging(e) {
        if (dragMode !== 'drag') return;
        
        // Don't drag on interactive elements
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) {
            return;
        }
        
        isDragging = true;
        startX = e.clientX || e.touches[0].clientX;
        startY = e.clientY || e.touches[0].clientY;
        
        // Remove transition for immediate response
        verticalCenter.style.transition = 'none';
        
        // Prevent text selection
        document.body.style.userSelect = 'none';
        
        e.preventDefault();
        e.stopPropagation();
    }

    function drag(e) {
        if (!isDragging || dragMode !== 'drag') return;
        
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        const deltaX = clientX - startX;
        const deltaY = clientY - startY;
        
        currentX = lastX + deltaX;
        currentY = lastY + deltaY;
        
        // Apply transform immediately using current scale
        verticalCenter.style.transform = `translate(${currentX}px, ${currentY}px) scale(${window.scale})`;
        
        e.preventDefault();
        e.stopPropagation();
    }

    function stopDragging() {
        if (!isDragging) return;
        
        isDragging = false;
        lastX = currentX;
        lastY = currentY;
        
        // Restore transition
        verticalCenter.style.transition = 'transform 0.2s ease';
        
        // Restore text selection
        document.body.style.userSelect = '';
    }

    // Unified event listeners for all devices
    verticalCenter.addEventListener('mousedown', startDragging);
    verticalCenter.addEventListener('touchstart', startDragging, { passive: false });
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    
    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('touchend', stopDragging);
    document.addEventListener('touchcancel', stopDragging);

    // Prevent default behaviors
    verticalCenter.addEventListener('dragstart', e => e.preventDefault());
    verticalCenter.addEventListener('contextmenu', e => {
        if (dragMode === 'drag') e.preventDefault();
    });
})();


// Force remove 'fullscreen' attribute from all <forge-dialog> elements at all times
function removeForgeDialogFullscreen() {
    const dialogs = document.querySelectorAll('forge-dialog[fullscreen]');
    dialogs.forEach(dialog => {
        dialog.removeAttribute('fullscreen');
    });
}

// Initial removal
removeForgeDialogFullscreen();

// Listen for window resize to keep removing the attribute
window.addEventListener('resize', removeForgeDialogFullscreen);

// Tab switching functionality
function switchTab(tabName) {
    // Hide all content sections
    document.querySelectorAll('.content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Show the selected content
    const selectedContent = document.querySelector('.content.' + tabName);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
    
    // Update tab styling (optional - you can add active states here)
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const activeTab = document.querySelector('.tab.' + tabName);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

// Initialize tab functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add click event listeners to tabs
    const configTab = document.querySelector('.tab.config');
    const elementsTab = document.querySelector('.tab.elements');
    const minimizeTab = document.querySelector('.tab.minimize');
    
    if (configTab) {
        configTab.addEventListener('click', function() {
            switchTab('config');
        });
    }
    
    if (elementsTab) {
        elementsTab.addEventListener('click', function() {
            switchTab('elements');
        });
    }
    
    if (minimizeTab) {
        minimizeTab.addEventListener('click', function() {
            const bottomAppBar = document.querySelector('.bottom-side-bar');
            if (bottomAppBar) {
                // Toggle between minimized and normal state
                if (bottomAppBar.style.height === '30px') {
                    // Restore to normal height
                    bottomAppBar.style.height = '';
                } else {
                    // Minimize to 30px
                    bottomAppBar.style.height = '30px';
                }
            }
        });
    }
    
    // Set initial state - show config by default
    switchTab('config');
});

// Responsive behavior for mobile screens
function handleResponsiveLayout() {
    const configElement = document.getElementById('config');
    const elementsElement = document.getElementById('elements');
    const configContent = document.querySelector('.content.config');
    const elementsContent = document.querySelector('.content.elements');
    
    if (!configElement || !elementsElement || !configContent || !elementsContent) {
        return;
    }
    
    const isMobile = window.innerWidth <= 860;
    
    if (isMobile) {
        // Move #config to .content.config
        if (configElement.parentElement !== configContent) {
            configContent.appendChild(configElement);
            configElement.style.height = '85%';
        }
        
        // Move #elements to .content.elements
        if (elementsElement.parentElement !== elementsContent) {
            elementsContent.appendChild(elementsElement);
            elementsElement.style.height = '85%';
        }
    } else {
        // Restore original positions when screen width increases
        const sideselectionright = document.querySelector('.sideselectionright md-list');
        const sideselection = document.querySelector('.sideselection md-list');
        const elementsTopabRight = document.querySelector('.sideselectionright .elements-topab');
        const elementsTopabLeft = document.querySelector('.sideselection .elements-topab');
        
        if (sideselectionright && configElement.parentElement === configContent) {
            // Insert #config after the elements-topab div in sideselectionright
            if (elementsTopabRight) {
                elementsTopabRight.parentNode.insertBefore(configElement, elementsTopabRight.nextSibling);
            } else {
                sideselectionright.appendChild(configElement);
            }
            configElement.style.height = '';
        }
        
        if (sideselection && elementsElement.parentElement === elementsContent) {
            // Insert #elements after the elements-topab div in sideselection
            if (elementsTopabLeft) {
                elementsTopabLeft.parentNode.insertBefore(elementsElement, elementsTopabLeft.nextSibling);
            } else {
                sideselection.appendChild(elementsElement);
            }
            elementsElement.style.height = '';
        }
    }
    // Auto-save removed - manual saves only via CTRL+S
}

// Call responsive function on load and resize
document.addEventListener('DOMContentLoaded', handleResponsiveLayout);
window.addEventListener('resize', handleResponsiveLayout);

// Page navigation functionality
function handlePageNavigation() {
    // Add click event listeners to all page list items
    const pageItems = document.querySelectorAll('.list-item.page');
    
    if (pageItems.length === 0) {
        // Try alternative selectors
        const altPageItems = document.querySelectorAll('.list-item.document-li-itm.page');
        
        if (altPageItems.length > 0) {
            altPageItems.forEach(function(pageItem, index) {
                setupPageItemClick(pageItem);
            });
            
            // Check URL parameter first, then default to first page
            const urlDoc = getPageFromURL();
            if (urlDoc) {
                showPage(urlDoc);
            } else {
                // Set initial state
                const firstPageItem = altPageItems[0];
                if (firstPageItem) {
                    firstPageItem.click();
                }
            }
        }
    } else {
        pageItems.forEach(function(pageItem, index) {
            setupPageItemClick(pageItem);
        });
        
        // Check URL parameter first, then default to first page
        const urlDoc = getPageFromURL();
        if (urlDoc) {
            showPage(urlDoc);
        } else {
            // Set initial state
            const firstPageItem = pageItems[0];
            if (firstPageItem) {
                firstPageItem.click();
            }
        }
    }
    // Auto-save removed - manual saves only via CTRL+S
}

// Function to show a specific page
function showPage(targetPage) {
    // Hide all main-content elements
    const allContents = document.querySelectorAll('.main-content');
    allContents.forEach(function(content) {
        content.style.display = 'none';
    });
    
    // Show the corresponding main-content element
    const targetContent = document.querySelector('.main-content#' + targetPage);
    if (targetContent) {
        targetContent.style.display = 'block';
    }
    // Auto-save removed - manual saves only via CTRL+S
}

// Function to update URL parameter
function updateURLParameter(doc) {
    const url = new URL(window.location);
    url.searchParams.set('doc', doc);
    window.history.pushState({}, '', url);
    // Auto-save removed - manual saves only via CTRL+S
}

// Function to get page from URL parameter
function getPageFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('doc');
}

function setupPageItemClick(pageItem) {
    pageItem.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get the page class from the element
        const pageClasses = this.className.split(' ');
        let targetPage = null;
        
        // Find the page class (starts with 'pg_')
        for (let className of pageClasses) {
            if (className.startsWith('pg_')) {
                targetPage = className.replace('pg_', ''); // Remove 'pg_' prefix
                break;
            }
        }
        
        if (targetPage) {
            // Show the page
            showPage(targetPage);
            
            // Update URL parameter
            updateURLParameter(targetPage);
        }
    });
    // Auto-save removed - manual saves only via CTRL+S
}

// Initialize page navigation on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    // First, hide all main-content elements
    document.querySelectorAll('.main-content').forEach(function(content) {
        content.style.display = 'none';
    });
    
    handlePageNavigation();
});

// Function to handle candy cobra and basket rotation based on relative positions
function handleCobraBasketRotation(cobraTile, basketTile) {
    if (!cobraTile || !basketTile) return
    
    const [cobraRow, cobraCol] = cobraTile
    const [basketRow, basketCol] = basketTile
    
    // Find the cobra element on the board
    const level = document.getElementById("level")
    const cobraObject = level.children[cobraRow].children[cobraCol]
    const cobraImage = cobraObject.querySelector(".normal")
    
    // Find the basket element on the board
    const basketObject = level.children[basketRow].children[basketCol]
    const basketImage = basketObject.querySelector(".cobra_basket")
    
    if (!cobraImage || !basketImage) return
    
    // Calculate relative position
    const rowDiff = basketRow - cobraRow
    const colDiff = basketCol - cobraCol
    
    // Reset any previous transformations
    cobraImage.style.transform = ""
    basketImage.style.transform = ""
    
    if (rowDiff > 0) {
        // Basket is below the cobra (higher row number = below)
        // Rotate cobra 90 degrees
        cobraImage.style.transform = "rotate(90deg)"
        // Don't rotate basket
    } else if (rowDiff < 0) {
        // Basket is above the cobra (lower row number = above)
        // Rotate cobra -90 degrees
        cobraImage.style.transform = "rotate(-90deg)"
        // Rotate basket 180 degrees
        basketImage.style.transform = "rotate(180deg)"
    } else if (colDiff > 0) {
        // Basket is to the right of the cobra
        // Don't rotate cobra (texture already points right)
        // Rotate basket -90 degrees
        basketImage.style.transform = "rotate(-90deg)"
    } else if (colDiff < 0) {
        // Basket is to the left of the cobra
        // Scale cobra X to -1 (flip horizontally)
        cobraImage.style.transform = "scaleX(-1)"
        // Rotate basket 90 degrees
        basketImage.style.transform = "rotate(90deg)"
    }
    // Auto-save removed - manual saves only via CTRL+S
}

// Function to update all cobra and basket rotations on the board
function updateAllCobraBasketRotations() {
    const level = document.getElementById("level")
    
    // Reset all transformations first to prevent chaos
    for (let r = 0; r < level.children.length; r++) {
        for (let c = 0; c < level.children[r].children.length; c++) {
            const tile = level.children[r].children[c]
            
            // Reset cobra transformations
            const cobraImage = tile.querySelector(".normal")
            if (cobraImage) {
                cobraImage.style.transform = ""
            }
            
            // Reset basket transformations
            const basketImage = tile.querySelector(".cobra_basket")
            if (basketImage) {
                basketImage.style.transform = ""
            }
        }
    }
    
    // Don't auto-pair cobras with baskets - let the user place them manually
    // This prevents chaos and ensures only intended pairs are rotated
    // Auto-save removed - manual saves only via CTRL+S
}

// Function to process imported cobra and basket pairs for rotation
function processImportedCobraBasketPairs() {
    const level = document.getElementById("level")
    const cobras = []
    const baskets = []
    
    // Collect all cobras and baskets from the imported level
    for (let r = 0; r < level.children.length; r++) {
        for (let c = 0; c < level.children[r].children.length; c++) {
            const tile = level.children[r].children[c]
            
            // Check for cobras
            if (tile.hasAttribute('normal') && 
                (tile.getAttribute('normal') === '222' || 
                 tile.getAttribute('normal') === '223' || 
                 tile.getAttribute('normal') === '224' || 
                 tile.getAttribute('normal') === '225' || 
                 tile.getAttribute('normal') === '226')) {
                cobras.push([r, c])
            }
            
            // Check for baskets
            if (tile.hasAttribute('cobra_basket') && tile.getAttribute('cobra_basket') === '227') {
                baskets.push([r, c])
            }
        }
    }
    
    // Process each cobra-basket pair for rotation
    // For imported levels, we'll pair them based on proximity
    cobras.forEach(cobraTile => {
        let nearestBasket = null
        let minDistance = Infinity
        
        // Find the nearest basket for this cobra
        baskets.forEach(basketTile => {
            const distance = Math.abs(cobraTile[0] - basketTile[0]) + Math.abs(cobraTile[1] - basketTile[1])
            if (distance < minDistance) {
                minDistance = distance
                nearestBasket = basketTile
            }
        })
        
        // If a basket is found and it's reasonably close (same row or column), apply rotation
        if (nearestBasket && minDistance <= 8) { // Max distance of 8 tiles
            const [cobraRow, cobraCol] = cobraTile
            const [basketRow, basketCol] = nearestBasket
            
            // Only rotate if they're in the same row or column
            if (cobraRow === basketRow || cobraCol === basketCol) {
                handleCobraBasketRotation(cobraTile, nearestBasket)
            }
        }
    })
    // Auto-save removed - manual saves only via CTRL+S
}

// Function to process imported conveyor belts
function processImportedConveyorBelts() {
    const level = document.getElementById("level")
    
    // Reset conveyor groups for imported levels
    conveyorGroups = []
    currentConveyorGroup = []
    isConveyorGroupingMode = false
    
    // Check if there are any conveyor belts on the board
    let hasConveyorBelts = false
    for (let r = 0; r < level.children.length; r++) {
        for (let c = 0; c < level.children[r].children.length; c++) {
            const tile = level.children[r].children[c]
            
            // Check for conveyor belts in the conveyor layer
            if (tile.hasAttribute('conveyor') && tile.getAttribute('conveyor') !== '') {
                hasConveyorBelts = true
                break
            }
        }
        if (hasConveyorBelts) break
    }
    
    // If conveyor belts exist, process them
    if (hasConveyorBelts) {
        console.log('Processing imported conveyor belts...')
        
        // Auto-group the conveyor belts
        setTimeout(() => {
            autoGroupConveyorBelts()
        }, 50)
    }
    // Auto-save removed - manual saves only via CTRL+S
}

// Function to process imported portals and ensure they're properly linked
function processImportedPortals(portals) {
    console.log('Post-processing imported portals:', portals)
    
    if (!portals || !Array.isArray(portals) || portals.length === 0) {
        console.log('No portals data to process')
        return
    }
    
    const level = document.getElementById("level")
    
    // Process each portal pair
    portals.forEach((portal, index) => {
        try {
            const entranceRow = portal[0][1]
            const entranceCol = portal[0][0]
            const exitRow = portal[1][1]
            const exitCol = portal[1][0]
            
            console.log(`Post-processing portal ${index}: entrance(${entranceRow},${entranceCol}) -> exit(${exitRow},${exitCol})`)
            
            const entranceTile = level.children[entranceRow]?.children[entranceCol]
            const exitTile = level.children[exitRow]?.children[exitCol]
            
            console.log(`Entrance tile found:`, !!entranceTile)
            console.log(`Exit tile found:`, !!exitTile)
            
            if (entranceTile && exitTile) {
                // Ensure the linking attributes are set
                entranceTile.setAttribute('portalexitrow', exitRow)
                entranceTile.setAttribute('portalexitcol', exitCol)
                exitTile.setAttribute('portalentrancerow', entranceRow)
                exitTile.setAttribute('portalentrancecol', entranceCol)
                
                console.log(`Successfully linked portal ${index}: entrance(${entranceRow},${entranceCol}) <-> exit(${exitRow},${exitCol})`)
                
                // Verify the attributes were set
                console.log(`Entrance tile portalexitrow:`, entranceTile.getAttribute('portalexitrow'))
                console.log(`Entrance tile portalexitcol:`, entranceTile.getAttribute('portalexitcol'))
                console.log(`Exit tile portalentrancerow:`, exitTile.getAttribute('portalentrancerow'))
                console.log(`Exit tile portalentrancecol:`, exitTile.getAttribute('portalentrancecol'))
            } else {
                console.warn(`Portal ${index}: Could not find tiles for linking`)
            }
        } catch (err) {
            console.warn(`Error post-processing portal ${index}:`, err)
        }
    })
    
    console.log('Finished post-processing portals')
    // Auto-save removed - manual saves only via CTRL+S
}

// Function to process imported gates array and restore conveyor belts
function processImportedGates(gates) {
    const level = document.getElementById("level")
    
    if (!gates || !Array.isArray(gates) || gates.length === 0) {
        console.log('No gates data to process or invalid format:', gates)
        return
    }
    
    console.log('Processing imported gates:', gates)
    console.log('Gates type:', typeof gates)
    console.log('Gates length:', gates.length)
    console.log('First gate item:', gates[0])
    console.log('First gate item type:', typeof gates[0])
    console.log('First gate item length:', Array.isArray(gates[0]) ? gates[0].length : 'not array')
    
    // Process each gate group (each group represents a connected conveyor path)
    gates.forEach((gateGroup, groupIndex) => {
        if (!Array.isArray(gateGroup)) {
            console.log('Skipping invalid gate group:', gateGroup)
            return
        }
        
        console.log(`Processing gate group ${groupIndex}:`, gateGroup)
        
        // Each gate group contains multiple gates for a connected path
        gateGroup.forEach((gate, gateIndex) => {
            if (!Array.isArray(gate) || gate.length < 3) {
                console.log('Skipping invalid gate:', gate)
                return
            }
            
            // Gate format: [[start_col, start_row], [end_col, end_row], [direction], [color]]
            const startPos = gate[0]
            const endPos = gate[1] 
            const directionArray = gate[2]
            const colorArray = gate[3]
            
            if (!Array.isArray(startPos) || !Array.isArray(endPos) || !Array.isArray(directionArray)) {
                console.log('Skipping gate with invalid position/direction format:', gate)
                return
            }
            
            const startCol = startPos[0]
            const startRow = startPos[1]
            const endCol = endPos[0]
            const endRow = endPos[1]
            const direction = directionArray[0]
            
            console.log(`Processing gate ${gateIndex}: start(${startCol},${startRow}) -> end(${endCol},${endRow}), direction: ${direction}`)
            
            // Find the tile at the start position
            if (level.children[startRow] && level.children[startRow].children[startCol]) {
                const tile = level.children[startRow].children[startCol]
                
                // Determine the conveyor type based on direction
                let conveyorType = "conveyor_up" // default
                if (direction === 1) conveyorType = "conveyor_right"
                else if (direction === 2) conveyorType = "conveyor_down"
                else if (direction === 3) conveyorType = "conveyor_left"
                
                console.log(`Setting conveyor attribute '${conveyorType}' at position (${startRow}, ${startCol})`)
                
                // Set the conveyor attribute
                tile.setAttribute('conveyor', conveyorType)
                
                // Update the visual representation
                const conveyorImage = tile.querySelector('.conveyor')
                if (conveyorImage) {
                    conveyorImage.src = elementsFolder + conveyorType + ".png"
                    console.log(`Updated conveyor image src to: ${elementsFolder + conveyorType + ".png"}`)
                } else {
                    console.log(`No conveyor image found at position (${startRow}, ${startCol})`)
                }
                
                console.log('Successfully restored conveyor belt:', conveyorType, 'at position:', startRow, startCol)
            } else {
                console.log(`Tile not found at position (${startRow}, ${startCol})`)
            }
        })
    })
    
    // After restoring conveyor belts, process them
    setTimeout(() => {
        console.log('Post-processing restored conveyor belts...')
        checkConveyorBeltsOnBoard()
        autoGroupConveyorBelts()
    }, 50)
    // Auto-save removed - manual saves only via CTRL+S
}

// Settings functionality for editor
function applyEditorSettings() {
    try {
        const saved = localStorage.getItem('ccs_settings');
        if (!saved) return;
        
        const settings = JSON.parse(saved);
        
        // Apply dark mode switch if scheme is "Dark mode"
        if (settings.appearance?.scheme?.[0] === "Dark mode") {
            const switchDark = document.getElementById('switchDark');
            if (switchDark) {
                switchDark.setAttribute('checked', '');
                switchDark.checked = true;
            }
        }
        
        // Apply music autoplay if enabled
        if (settings.general?.inAppMusic) {
            const musicMain = document.getElementById('musicMain');
            if (musicMain) {
                musicMain.play().catch(error => {
                    console.log('Autoplay prevented:', error);
                });
            }
        }
        
        // Apply SFX switch if enabled
        if (settings.general?.inAppSfx) {
            const switchClick = document.getElementById('switchClick');
            if (switchClick) {
                switchClick.setAttribute('checked', '');
                switchClick.checked = true;
            }
        }
        
        // Apply music configuration
        const musicConfig = settings.general?.inAppMusicConfig;
        if (musicConfig && musicConfig.length >= 3) {
            const musicMain = document.getElementById('musicMain');
            if (musicMain) {
                // Apply L-R balance (stereo panning)
                const balance = musicConfig[0];
                if (balance !== 50) {
                    const panValue = (balance - 50) / 50; // Convert 1-100 to -1 to 1
                    musicMain.style.transform = `translateX(${panValue * 20}px)`;
                }
                
                // Apply bass boost (using audio filters if available)
                const bass = musicConfig[1];
                if (bass !== 50) {
                    // This would require Web Audio API implementation
                    console.log('Bass setting:', bass);
                }
                
                // Apply high-pitch adjustment
                const highPitch = musicConfig[2];
                if (highPitch !== 50) {
                    const rate = 0.5 + (highPitch / 100) * 1.5; // 0.5x to 2x speed
                    musicMain.playbackRate = rate;
                }
            }
        }
        
        // Apply grayscale filter to elements with .tile class
        if (settings.appearance?.grayscale) {
            const applyGrayscaleToTiles = () => {
                const tileElements = document.querySelectorAll('.tile');
                tileElements.forEach(element => {
                    element.classList.add('grayscale-enabled');
                });
            };
            
            // Apply to existing tiles
            applyGrayscaleToTiles();
            
            // Set up MutationObserver to ensure grayscale persists and apply to new tiles
            const observer = new MutationObserver((mutations) => {
                let shouldReapply = false;
                
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        // Check for new tile elements
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                if (node.classList && node.classList.contains('tile')) {
                                    shouldReapply = true;
                                }
                                // Also check children
                                const tileChildren = node.querySelectorAll && node.querySelectorAll('.tile');
                                if (tileChildren && tileChildren.length > 0) {
                                    shouldReapply = true;
                                }
                            }
                        });
                    } else if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        // Check if grayscale was removed from existing tiles
                        const element = mutation.target;
                        if (element.classList.contains('tile') && !element.classList.contains('grayscale-enabled')) {
                            element.classList.add('grayscale-enabled');
                        }
                    }
                });
                
                if (shouldReapply) {
                    applyGrayscaleToTiles();
                }
            });
            
            // Observe the entire document for changes
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style']
            });
        }
        
        // Apply initial scale to vertical-center
        const intScale = settings.appearance?.intScale;
        if (intScale && intScale !== 100) {
            const verticalCenter = document.querySelector('.vertical-center');
            if (verticalCenter) {
                verticalCenter.style.transform = `scale(${intScale / 100})`;
            }
        }
        
    } catch (error) {
        console.error('Error applying editor settings:', error);
    }
}

// Apply settings when DOM is ready
document.addEventListener('DOMContentLoaded', applyEditorSettings);

// Also apply settings if DOM is already loaded
if (document.readyState !== 'loading') {
    applyEditorSettings();
}

