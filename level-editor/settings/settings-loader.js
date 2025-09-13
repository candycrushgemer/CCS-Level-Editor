// Settings Loader - Apply saved settings on page load
class SettingsLoader {
    constructor() {
        this.settings = this.loadSettings();
        this.applySettings();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('ccs_settings');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
        
        return {
            general: {
                newVersionPop: true,
                inAppMusic: true,
                inAppMusicConfig: [50, 50, 50],
                inAppSfx: true
            },
            appearance: {
                liquidGlass: true,
                scheme: ["Light mode"],
                grayscale: false,
                intScale: 100
            },
            aiMode: {
                enabled: false,
                apiKey: ""
            }
        };
    }

    applySettings() {
        // Apply "What's new popup" setting
        this.applyWhatsNewPopupSetting();
        
        // Apply music settings
        this.applyMusicSettings();
        
        // Apply SFX settings
        this.applySfxSettings();
        
        // Apply liquid glass setting
        this.applyLiquidGlassSetting();
        
        // Apply color scheme
        this.applyColorScheme();
        
        // Apply grayscale board setting
        this.applyGrayscaleBoardSetting();
        
        // Apply initial scale setting
        this.applyInitialScaleSetting();
    }

    applyWhatsNewPopupSetting() {
        if (!this.settings.general?.newVersionPop) {
            const whatsNewElements = document.querySelectorAll('.new-update-startup');
            whatsNewElements.forEach(element => {
                element.style.display = 'none';
            });
            
            // Also remove forge-dialog with new-version-popup class
            const newVersionDialogs = document.querySelectorAll('forge-dialog.new-version-popup');
            newVersionDialogs.forEach(dialog => {
                dialog.remove();
            });
        }
    }

    applyMusicSettings() {
        const musicMain = document.getElementById('musicMain');
        if (!musicMain) return;

        // Apply autoplay if enabled
        if (this.settings.general?.inAppMusic) {
            // Try to play music
            musicMain.play().catch(error => {
                console.log('Autoplay prevented:', error);
            });
        } else {
            // Pause music if disabled
            musicMain.pause();
        }

        // Apply music configuration
        const musicConfig = this.settings.general?.inAppMusicConfig;
        if (musicConfig && musicConfig.length >= 3) {
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

        // Also update the music switch in the settings dialog if it exists
        const musicSwitch = document.getElementById('inappmusic');
        if (musicSwitch) {
            if (this.settings.general?.inAppMusic) {
                musicSwitch.setAttribute('checked', '');
            } else {
                musicSwitch.removeAttribute('checked');
            }
        }
    }

    applySfxSettings() {
        if (this.settings.general?.inAppSfx) {
            const switchClick = document.getElementById('switchClick');
            if (switchClick) {
                // Enable sound effects by setting the switch to checked
                switchClick.setAttribute('checked', '');
                switchClick.checked = true;
            }
        } else {
            // Disable sound effects by removing the checked attribute
            const switchClick = document.getElementById('switchClick');
            if (switchClick) {
                switchClick.removeAttribute('checked');
                switchClick.checked = false;
            }
        }
    }

    applyLiquidGlassSetting() {
        if (!this.settings.appearance?.liquidGlass) {
            // Remove liquid glass script
            const liquidGlassScripts = document.querySelectorAll('script[src*="liquid-glass"]');
            liquidGlassScripts.forEach(script => script.remove());
            
            // Remove liquid glass elements and attributes
            const liquidElements = document.querySelectorAll('[data-liquid]');
            liquidElements.forEach(element => {
                element.removeAttribute('data-liquid');
                element.classList.remove('liquid-glass');
            });
        }
    }

    applyColorScheme() {
        const scheme = this.settings.appearance?.scheme?.[0];
        if (!scheme) return;

        // Remove existing scheme classes
        document.documentElement.classList.remove('light-mode', 'dark-mode', 'auto-scheme', 'dark');
        document.body.classList.remove('light-mode', 'dark-mode', 'auto-scheme', 'dark');
        
        // Apply new scheme
        switch (scheme) {
            case 'Light mode':
                document.documentElement.classList.add('light-mode');
                document.body.classList.add('light-mode');
                break;
            case 'Dark mode':
                document.documentElement.classList.add('dark-mode', 'dark');
                document.body.classList.add('dark-mode', 'dark');
                break;
            case 'Automatically':
                document.documentElement.classList.add('auto-scheme');
                document.body.classList.add('auto-scheme');
                this.applyAutoScheme();
                break;
        }
    }

    applyAutoScheme() {
        // Check system preference for dark mode
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.documentElement.classList.add('dark-mode', 'dark');
            document.body.classList.add('dark-mode', 'dark');
        } else {
            document.documentElement.classList.add('light-mode');
            document.body.classList.add('light-mode');
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (e.matches) {
                document.documentElement.classList.remove('light-mode');
                document.documentElement.classList.add('dark-mode', 'dark');
                document.body.classList.remove('light-mode');
                document.body.classList.add('dark-mode', 'dark');
            } else {
                document.documentElement.classList.remove('dark-mode', 'dark');
                document.documentElement.classList.add('light-mode');
                document.body.classList.remove('dark-mode', 'dark');
                document.body.classList.add('light-mode');
            }
        });
    }

    applyGrayscaleBoardSetting() {
        if (this.settings.appearance?.grayscale) {
            // Add grayscale filter to board elements
            const boardElements = document.querySelectorAll('.board, .game-board, [class*="board"]');
            boardElements.forEach(element => {
                element.style.filter = 'grayscale(100%)';
            });
        }
    }

    applyInitialScaleSetting() {
        const intScale = this.settings.appearance?.intScale;
        if (intScale && intScale !== 100) {
            // Apply initial scale to board or main container
            const boardContainer = document.querySelector('.board-container, .game-container, .main-container');
            if (boardContainer) {
                boardContainer.style.transform = `scale(${intScale / 100})`;
                boardContainer.style.transformOrigin = 'top left';
            }
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SettingsLoader();
    });
} else {
    new SettingsLoader();
}
