
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

document.addEventListener('DOMContentLoaded', () => {
    removeMdRippleOpacity();
    makeSpotlightFollowMouse();
});

new MutationObserver(() => {
    removeMdRippleOpacity();
    makeSpotlightFollowMouse();
}).observe(document.body, {
    childList: true,
    subtree: true
});
