# Settings System Documentation

## Overview
The settings system allows users to configure various aspects of the Level Editor and saves these preferences to both localStorage (for all users) and Firestore (for signed-in users).

## Files
- `script.js` - Main settings management script for the settings page
- `settings-loader.js` - Script that applies saved settings on other pages
- `settings.json` - Default settings template

## Settings Structure

### General Settings
- `newVersionPop` (boolean) - Controls whether to show "What's new" popup
- `inAppMusic` (boolean) - Enables/disables background music
- `inAppMusicConfig` (array) - Music configuration [L-R balance, bass, high-pitch]
- `inAppSfx` (boolean) - Enables/disables sound effects

### Appearance Settings
- `liquidGlass` (boolean) - Enables/disables liquid glass effects
- `scheme` (array) - Color scheme preference ["Light mode", "Dark mode", "Automatically"]
- `grayscale` (boolean) - Applies grayscale filter to board
- `intScale` (number) - Initial board scale (1-100, default 100)

### AI Mode Settings
- `enabled` (boolean) - Enables AI features
- `apiKey` (string) - Custom API key for AI services

## How It Works

### Settings Page (script.js)
1. Loads existing settings from localStorage
2. If user is signed in, also loads from Firestore
3. Sets up event listeners for all settings controls
4. Saves settings to both localStorage and Firestore when changed

### Other Pages (settings-loader.js)
1. Loads settings from localStorage on page load
2. Applies settings immediately:
   - Hides "What's new" popup if disabled
   - Controls music autoplay and configuration
   - Enables/disables sound effects
   - Removes liquid glass effects if disabled
   - Applies color scheme
   - Applies grayscale filter to board
   - Sets initial board scale

## Usage

### Adding Settings to Other Pages
Include the settings loader script:
```html
<script src="../settings/settings-loader.js"></script>
```

### Adding New Settings
1. Add the setting to the default structure in `script.js`
2. Add event listener in `setupEventListeners()`
3. Add application logic in `settings-loader.js`
4. Update `settings.json` template

## Browser Compatibility
- Requires localStorage support
- Requires Firebase SDK for signed-in users
- Works with all modern browsers

