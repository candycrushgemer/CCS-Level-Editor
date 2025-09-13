// Hover effects for md-icon-button elements
// Inject CSS to ensure our transforms work
function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
        md-icon-button[data-hover-setup] {
            transition: none !important;
        }
        md-icon-button[data-hover-setup] .md-icon,
        md-icon-button[data-hover-setup] md-icon {
            transition: none !important;
        }
    `;
    document.head.appendChild(style);
}

// Wait for both DOM and custom elements to be ready
function waitForComponents() {
    return new Promise((resolve) => {
        if (customElements.get('md-icon-button')) {
            resolve();
        } else {
            customElements.whenDefined('md-icon-button').then(resolve);
        }
    });
}

// Function to find the icon element within a button's shadow DOM
function findIconInButton(button) {
    if (!button.shadowRoot) return null;
    
    // Try multiple selectors to find the icon
    const selectors = [
        '.md-icon',
        'md-icon',
        '.material-icons',
        '[data-icon]',
        'span',
        'i'
    ];
    
    for (const selector of selectors) {
        const icon = button.shadowRoot.querySelector(selector);
        if (icon) return icon;
    }
    
    return null;
}

// Apply hover effects to a single button
function setupButtonHover(button) {
    if (button.hasAttribute('data-hover-setup')) return;
    
    const icon = findIconInButton(button);
    if (!icon) return;
    
    // Mark as setup
    button.setAttribute('data-hover-setup', 'true');
    
    let isInitialHover = true;
    
    // Add event listeners
    button.addEventListener('mouseenter', (e) => {
        button.classList.add('hovered');
        isInitialHover = true;
        
        // Get initial mouse position
        const rect = button.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate initial offset - both move just a bit
        const buttonOffsetX = (mouseX - centerX) * 0.02;
        const buttonOffsetY = (mouseY - centerY) * 0.02;
        const iconOffsetX = (mouseX - centerX) * 0.08;
        const iconOffsetY = (mouseY - centerY) * 0.08;
        
        // Button keeps easing, icon has no easing
        button.style.setProperty('transition', 'transform 0.3s ease-in', 'important');
        icon.style.setProperty('transition', 'none', 'important');
        
        // Apply initial transform with scale and position
        button.style.setProperty('transform', `scale(1.05) translate(${buttonOffsetX}px, ${buttonOffsetY}px)`, 'important');
        icon.style.setProperty('transform', `scale(1.1) translate(${iconOffsetX}px, ${iconOffsetY}px)`, 'important');
    });
    
    button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Button movement (just a bit)
        const buttonOffsetX = (mouseX - centerX) * 0.02;
        const buttonOffsetY = (mouseY - centerY) * 0.02;
        
        // Icon movement (just a bit more than button)
        const iconOffsetX = (mouseX - centerX) * 0.08;
        const iconOffsetY = (mouseY - centerY) * 0.08;
        
        // On first mousemove after hover, remove button transition but keep icon with no transition
        if (isInitialHover) {
            isInitialHover = false;
            button.style.setProperty('transition', 'none', 'important');
            // Icon already has no transition
        }
        
        // Apply transforms - button with easing, icon without easing
        button.style.setProperty('transform', `scale(1.05) translate(${buttonOffsetX}px, ${buttonOffsetY}px)`, 'important');
        icon.style.setProperty('transform', `scale(1.1) translate(${iconOffsetX}px, ${iconOffsetY}px)`, 'important');
    });
    
    button.addEventListener('mouseleave', () => {
        // Button bounces back with easing, icon also bounces back
        button.style.setProperty('transition', 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)', 'important');
        icon.style.setProperty('transition', 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)', 'important');
        
        // Reset to original state
        button.style.setProperty('transform', 'scale(1) translate(0px, 0px)', 'important');
        icon.style.setProperty('transform', 'scale(1) translate(0px, 0px)', 'important');
        
        button.classList.remove('hovered');
        isInitialHover = true;
    });
}

// Main function to setup all buttons
function setupAllButtons() {
    const buttons = document.querySelectorAll('md-icon-button');
    buttons.forEach(setupButtonHover);
}

// Initialize when everything is ready
async function init() {
    // Inject CSS first
    injectCSS();
    
    // Wait for components to be defined
    await waitForComponents();
    
    // Setup buttons
    setupAllButtons();
    
    // Watch for new buttons
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.tagName === 'MD-ICON-BUTTON') {
                            setupButtonHover(node);
                        }
                        // Also check children
                        node.querySelectorAll('md-icon-button').forEach(setupButtonHover);
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Start the setup
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
