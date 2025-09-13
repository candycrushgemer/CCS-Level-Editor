// Instant Page Navigation System
// This script provides seamless page transitions without browser loading states

class InstantNavigation {
    constructor() {
        this.pageCache = new Map();
        this.currentPage = null;
        this.transitionContainer = null;
        this.isTransitioning = false;
        this.preloadQueue = [];
        this.maxCacheSize = 20; // Maximum number of pages to cache
        
        this.init();
    }

    init() {
        this.createTransitionContainer();
        this.setupEventListeners();
        this.preloadCriticalPages();
        this.interceptNavigation();
    }

    createTransitionContainer() {
        // Create a container that will hold page content during transitions
        this.transitionContainer = document.createElement('div');
        this.transitionContainer.id = 'instant-navigation-container';
        this.transitionContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--md-sys-color-surface, #fff);
            z-index: 9999;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease-in-out;
            overflow-y: auto;
        `;
        document.body.appendChild(this.transitionContainer);
    }

    setupEventListeners() {
        // Intercept all navigation events
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && this.shouldIntercept(link.href)) {
                e.preventDefault();
                this.navigateTo(link.href);
            }
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.instantNavigation) {
                this.showCachedPage(window.location.href);
            }
        });

        // Preload pages when they come into view
        this.setupIntersectionObserver();
    }

    shouldIntercept(href) {
        // Only intercept internal navigation
        const url = new URL(href);
        const currentUrl = new URL(window.location.href);
        
        return url.origin === currentUrl.origin && 
               !href.includes('#') && 
               !href.includes('javascript:') &&
               href.endsWith('.html');
    }

    async navigateTo(url) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        try {
            // Show loading state
            this.showTransitionContainer();
            
            // Get page content (from cache or fetch)
            const pageContent = await this.getPageContent(url);
            
            if (pageContent) {
                // Extract the main content
                const mainContent = this.extractMainContent(pageContent);
                
                // Update the current page
                this.updateCurrentPage(mainContent);
                
                // Update browser history
                this.updateHistory(url);
                
                // Hide transition container
                this.hideTransitionContainer();
                
                // Execute scripts from the new page
                this.executePageScripts(pageContent);
                
                // Trigger any page-specific initialization
                this.initializePage();
            }
        } catch (error) {
            console.error('Navigation failed:', error);
            // Fallback to normal navigation
            window.location.href = url;
        } finally {
            this.isTransitioning = false;
        }
    }

    async getPageContent(url) {
        // Check cache first
        if (this.pageCache.has(url)) {
            return this.pageCache.get(url);
        }

        // Fetch the page
        try {
            const response = await fetch(url);
            const html = await response.text();
            
            // Cache the page
            this.cachePage(url, html);
            
            return html;
        } catch (error) {
            console.error('Failed to fetch page:', error);
            return null;
        }
    }

    extractMainContent(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Try to find the main content area
        let mainContent = doc.querySelector('main') || 
                         doc.querySelector('#main') || 
                         doc.querySelector('.main') ||
                         doc.querySelector('body');
        
        if (mainContent) {
            return mainContent.outerHTML;
        }
        
        // If no main content found, return the body
        return doc.body.innerHTML;
    }

    updateCurrentPage(content) {
        // Store current page content
        if (this.currentPage) {
            this.pageCache.set(window.location.href, document.documentElement.outerHTML);
        }
        
        // Update the page content
        document.body.innerHTML = content;
        
        // Update current page reference
        this.currentPage = window.location.href;
        
        // Re-attach event listeners
        this.setupEventListeners();
    }

    updateHistory(url) {
        const state = { instantNavigation: true };
        window.history.pushState(state, '', url);
    }

    executePageScripts(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Find and execute scripts
        const scripts = doc.querySelectorAll('script');
        scripts.forEach(script => {
            if (script.src) {
                // External script - load it
                this.loadExternalScript(script.src);
            } else if (script.textContent) {
                // Inline script - execute it
                try {
                    eval(script.textContent);
                } catch (error) {
                    console.warn('Script execution failed:', error);
                }
            }
        });
    }

    loadExternalScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    initializePage() {
        // Trigger DOMContentLoaded event for the new page
        const event = new Event('DOMContentLoaded');
        document.dispatchEvent(event);
        
        // Call any page-specific initialization functions
        if (typeof window.initializePage === 'function') {
            window.initializePage();
        }
    }

    showTransitionContainer() {
        this.transitionContainer.style.visibility = 'visible';
        this.transitionContainer.style.opacity = '1';
    }

    hideTransitionContainer() {
        this.transitionContainer.style.opacity = '0';
        setTimeout(() => {
            this.transitionContainer.style.visibility = 'hidden';
        }, 300);
    }

    cachePage(url, html) {
        // Implement LRU cache
        if (this.pageCache.size >= this.maxCacheSize) {
            const firstKey = this.pageCache.keys().next().value;
            this.pageCache.delete(firstKey);
        }
        
        this.pageCache.set(url, html);
    }

    preloadCriticalPages() {
        // Preload commonly accessed pages
        const criticalPages = [
            '/level-editor/editor/index.html',
            '/level-editor/editor/document.html',
            '/level-editor/editor/changelog.html',
            '/level-editor/editor/pricing.html',
            '/level-editor/downloads/index.html'
        ];
        
        criticalPages.forEach(page => {
            this.preloadPage(page);
        });
    }

    async preloadPage(url) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            this.cachePage(url, html);
        } catch (error) {
            console.warn('Failed to preload page:', url, error);
        }
    }

    setupIntersectionObserver() {
        // Preload pages when links come into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const link = entry.target;
                    if (link.href && this.shouldIntercept(link.href)) {
                        this.preloadPage(link.href);
                    }
                }
            });
        });

        // Observe all navigation links
        document.querySelectorAll('a[href]').forEach(link => {
            if (this.shouldIntercept(link.href)) {
                observer.observe(link);
            }
        });
    }

    interceptNavigation() {
        // Override window.location.href for programmatic navigation
        const originalLocation = window.location;
        
        Object.defineProperty(window.location, 'href', {
            set: (url) => {
                if (this.shouldIntercept(url)) {
                    this.navigateTo(url);
                } else {
                    originalLocation.href = url;
                }
            },
            get: () => originalLocation.href
        });

        // Override window.open for new windows
        const originalOpen = window.open;
        window.open = (url, ...args) => {
            if (this.shouldIntercept(url)) {
                this.navigateTo(url);
                return null;
            }
            return originalOpen(url, ...args);
        };
    }

    // Public API methods
    preloadPage(url) {
        return this.preloadPage(url);
    }

    clearCache() {
        this.pageCache.clear();
    }

    getCacheSize() {
        return this.pageCache.size;
    }
}

// Initialize instant navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.instantNavigation = new InstantNavigation();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.instantNavigation = new InstantNavigation();
    });
} else {
    window.instantNavigation = new InstantNavigation();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InstantNavigation;
} 