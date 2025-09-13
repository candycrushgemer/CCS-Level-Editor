
function removeMdRippleOpacity() {
    document.querySelectorAll('md-icon-button').forEach(iconButton => {
        if (iconButton.shadowRoot) {
            applyRippleOpacity(iconButton.shadowRoot);
        } else {
            customElements.whenDefined('md-icon-button').then(() => {
                if (iconButton.shadowRoot) {
                    applyRippleOpacity(iconButton.shadowRoot);
                }
            });
        }
    });
}

function applyRippleOpacity(shadowRoot) {
    const rippleElements = shadowRoot.querySelectorAll('md-ripple');
    rippleElements.forEach(ripple => {
        ripple.style.opacity = '0';
    });
}

// Function to make spotlight follow mouse position
function makeSpotlightFollowMouse() {
    const spotlights = document.querySelectorAll('.spotlight');
    if (spotlights.length === 0) return;
    
    // Set up positioning for each spotlight
    spotlights.forEach(spotlight => {
        const card = spotlight.closest('.card');
        if (!card) return;
        
        // Ensure spotlight has absolute positioning within the card
        spotlight.style.position = 'absolute';
        card.style.position = 'relative';
    });
    
    // Single mousemove listener for better performance
    document.addEventListener('mousemove', (e) => {
        spotlights.forEach(spotlight => {
            const card = spotlight.closest('.card');
            if (!card) return;
            
            const cardRect = card.getBoundingClientRect();
            
            // Check if mouse is over this specific card
            if (e.clientX >= cardRect.left && e.clientX <= cardRect.right &&
                e.clientY >= cardRect.top && e.clientY <= cardRect.bottom) {
                
                // Calculate position relative to the card
                const x = e.clientX - cardRect.left;
                const y = e.clientY - cardRect.top;
                
                // Keep spotlight within card boundaries
                const maxX = cardRect.width - spotlight.offsetWidth;
                const maxY = cardRect.height - spotlight.offsetHeight;
                
                const clampedX = Math.max(0, Math.min(x, maxX));
                const clampedY = Math.max(0, Math.min(y, maxY));
                
                spotlight.style.left = clampedX + 'px';
                spotlight.style.top = clampedY + 'px';
            }
        });
    });
}

class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.isSignedIn = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                this.isSignedIn = !!user;
                this.currentUser = user;
                this.loadSettingsFromFirestore();
            });
        }
        
        this.setupEventListeners();
        this.applySettings();
    }

    loadSettings() {
        const defaultSettings = {
            general: {
                settingsJsonVersion: 1,
                newVersionPop: true,
                inAppMusic: false,
                inAppMusicConfig: [50, 50, 50],
                inAppSfx: false
            },
            appearance: {
                liquidGlass: true,
                scheme: ["Automatically"],
                grayscale: false,
                intScale: 100
            },
            level: {},
            aiMode: {
                enabled: false,
                apiKey: ""
            }
        };

        try {
            const saved = localStorage.getItem('ccs_settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...defaultSettings, ...parsed };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
        
        return defaultSettings;
    }

    async loadSettingsFromFirestore() {
        if (!this.isSignedIn || !this.currentUser) return;

        try {
            const doc = await firebase.firestore().collection('users').doc(this.currentUser.uid).get();
            if (doc.exists && doc.data().settings) {
                const firestoreSettings = doc.data().settings;
                this.settings = { ...this.settings, ...firestoreSettings };
                this.applySettings();
            }
        } catch (error) {
            console.error('Error loading settings from Firestore:', error);
        }
    }

    async saveSettings() {
        localStorage.setItem('ccs_settings', JSON.stringify(this.settings));

        if (this.isSignedIn && this.currentUser) {
            try {
                await firebase.firestore().collection('users').doc(this.currentUser.uid).update({
                    settings: this.settings
                });
            } catch (error) {
                console.error('Error saving settings to Firestore:', error);
            }
        }
    }

    setupEventListeners() {
        // General settings
        this.setupSwitchListener('removewhatsnewpopup', 'general.newVersionPop');
        this.setupSwitchListener('inappmusic', 'general.inAppMusic');
        this.setupSwitchListener('sfxenabler', 'general.inAppSfx');

        // Music configuration inputs
        this.setupInputListener('musicbalancelr', 'general.inAppMusicConfig[0]', 50);
        this.setupInputListener('musicbass', 'general.inAppMusicConfig[1]', 50);
        this.setupInputListener('musichighpitch', 'general.inAppMusicConfig[2]', 50);

        // Appearance settings
        this.setupSwitchListener('disableliq', 'appearance.liquidGlass', true); // Inverted logic
        this.setupSwitchListener('grayscaleboard', 'appearance.grayscale');
        this.setupInputListener('intscaleboard', 'appearance.intScale', 100);

        // Color scheme buttons
        this.setupSchemeButtonListener('lightmode', 'Light mode');
        this.setupSchemeButtonListener('darkmode', 'Dark mode');
        this.setupSchemeButtonListener('autoscheme', 'Automatically');

        // AI Mode settings
        this.setupInputListener('customapi', 'aiMode.apiKey', '');
    }

    setupSwitchListener(elementId, settingPath, inverted = false) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const value = this.getSettingValue(settingPath);
        if (inverted) {
            if (!value) {
                element.setAttribute('checked', '');
            } else {
                element.removeAttribute('checked');
            }
        } else {
            if (value) {
                element.setAttribute('checked', '');
            } else {
                element.removeAttribute('checked');
            }
        }

        const handleSwitchChange = () => {
            const hasCheckedAttr = element.hasAttribute('checked');
            const currentValue = inverted ? !hasCheckedAttr : hasCheckedAttr;
            this.setSettingValue(settingPath, currentValue);
            this.saveSettings();
        };

        element.addEventListener('click', handleSwitchChange);

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'checked') {
                    setTimeout(() => {
                        handleSwitchChange();
                    }, 10);
                }
            });
        });

        observer.observe(element, {
            attributes: true,
            attributeFilter: ['checked']
        });

        element.addEventListener('change', handleSwitchChange);
        element.addEventListener('toggle', handleSwitchChange);
    }

    setupInputListener(elementId, settingPath, defaultValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const value = this.getSettingValue(settingPath);
        if (value !== undefined && value !== '') {
            element.value = value;
        } else if (defaultValue !== undefined) {
            element.value = defaultValue;
        }

        element.addEventListener('input', () => {
            let value = element.value;
            
            if (element.type === 'number') {
                value = value === '' ? defaultValue : Number(value);
            }
            
            this.setSettingValue(settingPath, value);
            this.saveSettings();
        });
    }

    setupSchemeButtonListener(elementId, schemeName) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.addEventListener('click', () => {
            this.settings.appearance.scheme = [schemeName];
            this.saveSettings();
            
            const dropdownTrigger = document.querySelector('mdui-dropdown span[slot="trigger"]');
            if (dropdownTrigger) {
                dropdownTrigger.textContent = schemeName;
            }
        });
    }

    getSettingValue(path) {
        const keys = path.split('.');
        let value = this.settings;
        
        for (const key of keys) {
            if (key.includes('[') && key.includes(']')) {
                const arrayKey = key.split('[')[0];
                const index = parseInt(key.split('[')[1].split(']')[0]);
                value = value[arrayKey]?.[index];
            } else {
                value = value[key];
            }
            
            if (value === undefined) break;
        }
        
        return value;
    }

    setSettingValue(path, value) {
        const keys = path.split('.');
        let current = this.settings;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (key.includes('[') && key.includes(']')) {
                const arrayKey = key.split('[')[0];
                const index = parseInt(key.split('[')[1].split(']')[0]);
                if (!current[arrayKey]) current[arrayKey] = [];
                current = current[arrayKey];
                current[index] = value;
                return;
            } else {
                if (!current[key]) current[key] = {};
                current = current[key];
            }
        }
        
        const lastKey = keys[keys.length - 1];
        if (lastKey.includes('[') && lastKey.includes(']')) {
            const arrayKey = lastKey.split('[')[0];
            const index = parseInt(lastKey.split('[')[1].split(']')[0]);
            if (!current[arrayKey]) current[arrayKey] = [];
            current[arrayKey][index] = value;
        } else {
            current[lastKey] = value;
        }
    }

    applySettings() {
        const scheme = this.settings.appearance.scheme[0];
        if (scheme) {
            const dropdownTrigger = document.querySelector('mdui-dropdown span[slot="trigger"]');
            if (dropdownTrigger) {
                dropdownTrigger.textContent = scheme;
            }
        }

        if (!this.settings.appearance.liquidGlass) {
            this.disableLiquidGlass();
        }
    }

    disableLiquidGlass() {
        const liquidGlassScripts = document.querySelectorAll('script[src*="liquid-glass"]');
        liquidGlassScripts.forEach(script => script.remove());
        
        const liquidElements = document.querySelectorAll('[data-liquid]');
        liquidElements.forEach(element => {
            element.removeAttribute('data-liquid');
            element.classList.remove('liquid-glass');
        });
    }
}

// Initialize settings manager
let settingsManager;

document.addEventListener('DOMContentLoaded', () => {
    removeMdRippleOpacity();
    makeSpotlightFollowMouse();
    settingsManager = new SettingsManager();
});

new MutationObserver(() => {
    removeMdRippleOpacity();
    makeSpotlightFollowMouse();
}).observe(document.body, {
    childList: true,
    subtree: true
});
