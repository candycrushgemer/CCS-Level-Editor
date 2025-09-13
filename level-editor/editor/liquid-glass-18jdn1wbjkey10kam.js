
// Liquid Glass Effect Script
(function() {
    'use strict';
    
    let liquidGlass = null;
    let currentConfig = {
        width: 300,
        height: 200,
        radius: 150,
        displacementScale: 50,
        filterBlur: 0.25,
        filterContrast: 1.2,
        filterBrightness: 1.05,
        filterSaturate: 1.1,
        liquidDepth: 0.15,
        liquidSmoothness: 0.8,
        canvasDPI: 1
    };

    // Check if liquid glass already exists and destroy it
    if (window.liquidGlass) {
        window.liquidGlass.destroy();
        console.log('Remove previous liquid glass');
    }

    // Utility functions
    function smoothStep(a, b, t) {
        t = Math.max(0, Math.min(1, (t - a) / (b - a)));
        return t * t * (3 - 2 * t);
    }

    function length(x, y) {
        return Math.sqrt(x * x + y * y);
    }

    function roundedRectSDF(x, y, width, height, radius) {
        const qx = Math.abs(x) - width + radius;
        const qy = Math.abs(y) - height + radius;
        return Math.min(Math.max(qx, qy), 0) + length(Math.max(qx, 0), Math.max(qy, 0)) - radius;
    }

    function texture(x, y) {
        return { type: 't', x, y };
    }

    // Generate unique ID
    function generateId() {
        return 'liquid-glass-' + Math.random().toString(36).substr(2, 9);
    }

    // Main Shader class
    class Shader {
        constructor(options = {}) {
            this.width = options.width || 100;
            this.height = options.height || 100;
            this.radius = options.radius || 150;
            this.fragment = options.fragment || ((uv) => texture(uv.x, uv.y));
            this.canvasDPI = options.canvasDPI || 1;
            this.id = generateId();
            this.offset = 10;
            
            // Store config reference - ensure it exists
            this.config = options.config || { ...currentConfig };
            
            this.mouse = { x: 0, y: 0 };
            this.mouseUsed = false;
            
            this.createElement();
            this.setupEventListeners();
            this.updateFragmentFunction();
            this.updateShader();
        }

        createElement() {
            // Create container
            this.container = document.createElement('div');
            this.container.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            width: ${this.width}px;
            height: ${this.height}px;
                overflow: hidden;
                border-radius: ${this.radius}px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25), 0 -10px 25px inset rgba(0, 0, 0, 0.15);
                cursor: grab;
                backdrop-filter: url(#${this.id}_filter) blur(${this.config.filterBlur}px) contrast(${this.config.filterContrast}) brightness(${this.config.filterBrightness}) saturate(${this.config.filterSaturate});
                z-index: 100000;
                pointer-events: auto;
                display: none;
                opacity: 0;
            `;

            // Create SVG filter
            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            this.svg.setAttribute('width', '0');
            this.svg.setAttribute('height', '0');
            this.svg.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
            pointer-events: none;
                z-index: 9998;
            `;

            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
            filter.setAttribute('id', `${this.id}_filter`);
            filter.setAttribute('filterUnits', 'userSpaceOnUse');
            filter.setAttribute('colorInterpolationFilters', 'sRGB');
            filter.setAttribute('x', '0');
            filter.setAttribute('y', '0');
            filter.setAttribute('width', this.width.toString());
            filter.setAttribute('height', this.height.toString());

            this.feImage = document.createElementNS('http://www.w3.org/2000/svg', 'feImage');
            this.feImage.setAttribute('id', `${this.id}_map`);
            this.feImage.setAttribute('width', this.width.toString());
            this.feImage.setAttribute('height', this.height.toString());

            this.feDisplacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
            this.feDisplacementMap.setAttribute('in', 'SourceGraphic');
            this.feDisplacementMap.setAttribute('in2', `${this.id}_map`);
            this.feDisplacementMap.setAttribute('xChannelSelector', 'R');
            this.feDisplacementMap.setAttribute('yChannelSelector', 'G');

            filter.appendChild(this.feImage);
            filter.appendChild(this.feDisplacementMap);
            defs.appendChild(filter);
            this.svg.appendChild(defs);

            // Create canvas for displacement map (hidden)
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.width * this.canvasDPI;
            this.canvas.height = this.height * this.canvasDPI;
            this.canvas.style.display = 'none';

            this.context = this.canvas.getContext('2d');
        }

        constrainPosition(x, y) {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            const minX = this.offset;
            const maxX = viewportWidth - this.width - this.offset;
            const minY = this.offset;
            const maxY = viewportHeight - this.height - this.offset;
            
            const constrainedX = Math.max(minX, Math.min(maxX, x));
            const constrainedY = Math.max(minY, Math.min(maxY, y));
            
            return { x: constrainedX, y: constrainedY };
        }

        setupEventListeners() {
            let isDragging = false;
            let startX, startY, initialX, initialY;

            this.container.addEventListener('mousedown', (e) => {
                isDragging = true;
                this.container.style.cursor = 'grabbing';
                startX = e.clientX;
                startY = e.clientY;
                const rect = this.container.getBoundingClientRect();
                initialX = rect.left;
                initialY = rect.top;
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;
                    
                    const newX = initialX + deltaX;
                    const newY = initialY + deltaY;
                    
                    const constrained = this.constrainPosition(newX, newY);
                    
                    this.container.style.left = constrained.x + 'px';
                    this.container.style.top = constrained.y + 'px';
                    this.container.style.transform = 'none';
                }

                const rect = this.container.getBoundingClientRect();
                this.mouse.x = (e.clientX - rect.left) / rect.width;
                this.mouse.y = (e.clientY - rect.top) / rect.height;
                
                // Throttle shader updates for smooth performance
                if (this.mouseUsed && !this.updateTimeout) {
                    this.updateTimeout = setTimeout(() => {
                        this.updateShader();
                        this.updateTimeout = null;
                    }, 16); // ~60fps
                }
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
                this.container.style.cursor = 'grab';
            });

            window.addEventListener('resize', () => {
                const rect = this.container.getBoundingClientRect();
                const constrained = this.constrainPosition(rect.left, rect.top);
                
                if (rect.left !== constrained.x || rect.top !== constrained.y) {
                    this.container.style.left = constrained.x + 'px';
                    this.container.style.top = constrained.y + 'px';
                    this.container.style.transform = 'none';
                }
            });
    }
    
    updateShader() {
            const mouseProxy = new Proxy(this.mouse, {
                get: (target, prop) => {
                    this.mouseUsed = true;
                    return target[prop];
                }
            });

            this.mouseUsed = false;

            const w = this.width * this.canvasDPI;
            const h = this.height * this.canvasDPI;
            const data = new Uint8ClampedArray(w * h * 4);

            let maxScale = 0;
            const rawValues = [];

            for (let i = 0; i < data.length; i += 4) {
                const x = (i / 4) % w;
                const y = Math.floor(i / 4 / w);
                const pos = this.fragment(
                    { x: x / w, y: y / h },
                    mouseProxy
                );
                const dx = pos.x * w - x;
                const dy = pos.y * h - y;
                maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
                rawValues.push(dx, dy);
            }

            maxScale *= (this.config.displacementScale / 100);

            let index = 0;
            for (let i = 0; i < data.length; i += 4) {
                const r = rawValues[index++] / maxScale + 0.5;
                const g = rawValues[index++] / maxScale + 0.5;
                data[i] = r * 255;
                data[i + 1] = g * 255;
                data[i + 2] = 0;
                data[i + 3] = 255;
            }

            this.context.putImageData(new ImageData(data, w, h), 0, 0);
            this.feImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.canvas.toDataURL());
            this.feDisplacementMap.setAttribute('scale', (maxScale / this.canvasDPI).toString());
        }

        updateConfig(newConfig) {
            // Update both global and instance configs
            currentConfig = { ...currentConfig, ...newConfig };
            this.config = { ...this.config, ...newConfig };
            
            // Update dimensions
            this.width = this.config.width;
            this.height = this.config.height;
            this.radius = this.config.radius;
            this.canvasDPI = this.config.canvasDPI;
            
            // Regenerate SVG filter completely
            this.regenerateSVGFilter();
            
            // Update container styles
            this.container.style.width = this.config.width + 'px';
            this.container.style.height = this.config.height + 'px';
            this.container.style.borderRadius = this.config.radius + 'px';
            this.container.style.backdropFilter = `url(#${this.id}_filter) blur(${this.config.filterBlur}px) contrast(${this.config.filterContrast}) brightness(${this.config.filterBrightness}) saturate(${this.config.filterSaturate})`;
            this.container.style.webkitBackdropFilter = `blur(${this.config.filterBlur}px) contrast(${this.config.filterContrast}) brightness(${this.config.filterBrightness}) saturate(${this.config.filterSaturate})`;
            
            // Recreate canvas with new dimensions
            this.canvas.width = this.width * this.canvasDPI;
            this.canvas.height = this.height * this.canvasDPI;
            
            // Update shader
            this.updateShader();
            
            // Update fragment function if liquid parameters changed
            if (newConfig.liquidDepth !== undefined || newConfig.liquidSmoothness !== undefined) {
                this.updateFragmentFunction();
            }
        }
        
        regenerateSVGFilter() {
            // Remove old SVG
            if (this.svg && this.svg.parentNode) {
                this.svg.parentNode.removeChild(this.svg);
            }
            
            // Create new SVG filter
            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            this.svg.setAttribute('width', '0');
            this.svg.setAttribute('height', '0');
            this.svg.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                pointer-events: none;
                z-index: 9998;
            `;

            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
            filter.setAttribute('id', `${this.id}_filter`);
            filter.setAttribute('filterUnits', 'userSpaceOnUse');
            filter.setAttribute('colorInterpolationFilters', 'sRGB');
            filter.setAttribute('x', '0');
            filter.setAttribute('y', '0');
            filter.setAttribute('width', this.width.toString());
            filter.setAttribute('height', this.height.toString());

            this.feImage = document.createElementNS('http://www.w3.org/2000/svg', 'feImage');
            this.feImage.setAttribute('id', `${this.id}_map`);
            this.feImage.setAttribute('width', this.width.toString());
            this.feImage.setAttribute('height', this.height.toString());

            this.feDisplacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
            this.feDisplacementMap.setAttribute('in', 'SourceGraphic');
            this.feDisplacementMap.setAttribute('in2', `${this.id}_map`);
            this.feDisplacementMap.setAttribute('xChannelSelector', 'R');
            this.feDisplacementMap.setAttribute('yChannelSelector', 'G');

            filter.appendChild(this.feImage);
            filter.appendChild(this.feDisplacementMap);
            defs.appendChild(filter);
            this.svg.appendChild(defs);
            
            // Re-append SVG to body
            document.body.appendChild(this.svg);
        }
        
        updateFragmentFunction() {
            this.fragment = (uv, mouse) => {
                const ix = uv.x - 0.5;
                const iy = uv.y - 0.5;
                const distanceToEdge = roundedRectSDF(
                    ix,
                    iy,
                    0.3,
                    0.2,
                    0.6
                );
                const displacement = smoothStep(this.config.liquidSmoothness, 0, distanceToEdge - this.config.liquidDepth);
                const scaled = smoothStep(0, 1, displacement);
                return texture(ix * scaled + 0.5, iy * scaled + 0.5);
            };
        }
        
        setPerformanceMode(enabled) {
            this.performanceMode = enabled;
            if (enabled) {
                // Reduce canvas resolution for better performance
                this.canvasDPI = Math.max(0.5, this.canvasDPI * 0.5);
                this.canvas.width = this.width * this.canvasDPI;
                this.canvas.height = this.height * this.canvasDPI;
            } else {
                // Restore normal resolution
                this.canvasDPI = this.config.canvasDPI;
                this.canvas.width = this.width * this.canvasDPI;
                this.canvas.height = this.height * this.canvasDPI;
            }
        this.updateShader();
    }
    
    appendTo(parent) {
        parent.appendChild(this.svg);
            parent.appendChild(this.container);
    }
    
            destroy() {
            if (this.svg && this.svg.parentNode) {
                this.svg.remove();
            }
            if (this.container && this.container.parentNode) {
                this.container.remove();
            }
            if (this.canvas && this.canvas.parentNode) {
                this.canvas.remove();
            }
        }
    }

    // Create the liquid glass effect
    function createLiquidGlass() {
        const shader = new Shader({
            width: currentConfig.width,
            height: currentConfig.height,
            radius: currentConfig.radius,
            canvasDPI: currentConfig.canvasDPI,
            config: currentConfig,
            fragment: (uv, mouse) => {
                const ix = uv.x - 0.5;
                const iy = uv.y - 0.5;
                const distanceToEdge = roundedRectSDF(
                    ix,
                    iy,
                    0.3,
                    0.2,
                    0.6
                );
                const displacement = smoothStep(currentConfig.liquidSmoothness, 0, distanceToEdge - currentConfig.liquidDepth);
                const scaled = smoothStep(0, 1, displacement);
                return texture(ix * scaled + 0.5, iy * scaled + 0.5);
            }
        });

        shader.appendTo(document.body);
        console.log('A DIV Liquid Glass created, drag it!');
        
        liquidGlass = shader;
        window.liquidGlass = shader;
    }

    // Apply liquid glass effect to elements with data-liquid class or attribute
function applyLiquidGlassToElements() {
    const elements = document.querySelectorAll('[data-liquid], .data-liquid');
        console.log(`Shader apply to ${elements.length} elements`);
    
    elements.forEach((element, index) => {
            // Parse custom attributes/classes for configuration
        const config = {
            refraction: parseInt(element.getAttribute('liq-refrac')) || 
                       parseInt(element.className.match(/liqrefrac-(\d+)/)?.[1]) || 50,
            depth: parseInt(element.getAttribute('liq-depth')) || 
                   parseInt(element.className.match(/liqdepth-(\d+)/)?.[1]) || 50,
            smoothness: parseInt(element.getAttribute('liq-smooth')) || 
                       parseInt(element.className.match(/liqsmooth-(\d+)/)?.[1]) || 50,
            blur: parseInt(element.getAttribute('liq-blur')) || 
                  parseInt(element.className.match(/liqblur-(\d+)/)?.[1]) || 0
        };
        
            // Get element dimensions with multiple fallback methods
            let width, height;
            
            // Method 1: Try getBoundingClientRect first
        const rect = element.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                width = rect.width;
                height = rect.height;
            } else {
                // Method 2: Try computed styles
                const computedStyle = window.getComputedStyle(element);
                const computedWidth = parseFloat(computedStyle.width);
                const computedHeight = parseFloat(computedStyle.height);
                
                if (computedWidth > 0 && computedHeight > 0) {
                    width = computedWidth;
                    height = computedHeight;
                } else {
                    // Method 3: Try offset dimensions
                    const offsetWidth = element.offsetWidth;
                    const offsetHeight = element.offsetHeight;
                    
                    if (offsetWidth > 0 && offsetHeight > 0) {
                        width = offsetWidth;
                        height = offsetHeight;
                    } else {
                        // Method 4: Try client dimensions
                        const clientWidth = element.clientWidth;
                        const clientHeight = element.clientHeight;
                        
                        if (clientWidth > 0 && clientHeight > 0) {
                            width = clientWidth;
                            height = clientHeight;
                        } else {
                            // Method 5: Fallback to CSS or default values
                            const styleWidth = element.style.width;
                            const styleHeight = element.style.height;
                            
                            if (styleWidth && styleHeight) {
                                width = parseFloat(styleWidth);
                                height = parseFloat(styleHeight);
                            } else {
                                // Final fallback: use element's natural size or reasonable defaults
                                width = Math.max(element.scrollWidth || 200, 100);
                                height = Math.max(element.scrollHeight || 150, 100);
                            }
                        }
                    }
                }
            }
            
            // Ensure minimum dimensions and convert to integers
            const canvasWidth = Math.max(Math.ceil(width), 50);
            const canvasHeight = Math.max(Math.ceil(height), 50);
            
            console.log(`Element dimensions:`, {
                element: element,
                rect: { width: rect.width, height: rect.height },
                computed: { width: window.getComputedStyle(element).width, height: window.getComputedStyle(element).height },
                offset: { width: element.offsetWidth, height: element.offsetHeight },
                client: { width: element.clientWidth, height: element.clientHeight },
                final: { width: canvasWidth, height: canvasHeight }
            });
            
            // Create fragment function based on config (EXACT same as main Shader)
        const fragment = (uv, mouse) => {
            const ix = uv.x - 0.5;
            const iy = uv.y - 0.5;
            
            const widthScale = 0.3 + (config.depth / 100) * 0.4;
            const heightScale = 0.2 + (config.depth / 100) * 0.3;
            const radiusScale = 0.6 + (config.smoothness / 100) * 0.3;
            const edgeDistance = 0.15 + (config.refraction / 100) * 0.1;
            
            const distanceToEdge = roundedRectSDF(
                ix,
                iy,
                widthScale,
                heightScale,
                radiusScale
            );
            
            const displacement = smoothStep(0.8, 0, distanceToEdge - edgeDistance);
            const scaled = smoothStep(0, 1, displacement);
            
                // Add mouse interaction if available
            if (mouse && mouse.x !== undefined && mouse.y !== undefined) {
                const mouseInfluence = (config.refraction / 100) * 0.3;
                const mouseX = (mouse.x - 0.5) * mouseInfluence;
                const mouseY = (mouse.y - 0.5) * mouseInfluence;
                return texture(ix * scaled + 0.5 + mouseX, iy * scaled + 0.5 + mouseY);
            }
            
            return texture(ix * scaled + 0.5, iy * scaled + 0.5);
        };
        
            // Create a REAL Shader instance with precise dimensions
            const shader = new Shader({
                width: canvasWidth,
                height: canvasHeight,
            fragment: fragment
        });
        
            // Position the shader container over the element with precise dimensions
            const elementRect = element.getBoundingClientRect();
            shader.container.style.position = 'fixed';
            shader.container.style.left = elementRect.left + 'px';
            shader.container.style.top = elementRect.top + 'px';
            shader.container.style.width = canvasWidth + 'px';
            shader.container.style.height = canvasHeight + 'px';
            shader.container.style.zIndex = '10000';
            
            // Store the shader reference and dimensions
            element._liquidGlassShader = shader;
            element._liquidGlassDimensions = {
                width: canvasWidth,
                height: canvasHeight
            };
            
            // Apply backdrop filter to the element itself using the shader's filter
            const blurValue = config.blur > 0 ? `${config.blur}px` : '0.25px';
            element.style.backdropFilter = `url(#${shader.id}_filter) blur(${blurValue}) contrast(1.2) brightness(1.05) saturate(1.1)`;
            element.style.webkitBackdropFilter = `url(#${shader.id}_filter) blur(${blurValue}) contrast(1.2) brightness(1.05) saturate(1.1)`;
            element.style.isolation = 'isolate';
            element.style.transform = 'translateZ(0)';
            
            // Add only the SVG filter to the page (container not needed)
            document.body.appendChild(shader.svg);
            
            // Destroy the container since we only need the SVG filter
            shader.container.remove();
            
            console.log(`Applied Shader-based liquid glass to element ${index}:`, {
                filterId: `${shader.id}_filter`,
                dimensions: `${width}x${height}`,
                config
        });
    });
}

    // Regenerate liquid glass effect for a specific element
function regenerateLiquidGlass(element) {
        if (element._liquidGlassShader) {
            // Remove old shader
            element._liquidGlassShader.destroy();
            delete element._liquidGlassShader;
            

            
            // Clear backdrop filter
        element.style.backdropFilter = '';
        element.style.webkitBackdropFilter = '';
        element.style.isolation = '';
        element.style.transform = '';
        
            // Reapply effect
        setTimeout(() => applyLiquidGlassToElements(), 50);
    }
}

    // Watch for attribute changes and regenerate
    function setupAttributeObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes') {
                    const target = mutation.target;
                    if (target.hasAttribute('data-liquid') || target.classList.contains('data-liquid')) {
                        const attributeChanged = ['liq-refrac', 'liq-depth', 'liq-smooth', 'liq-blur'].includes(mutation.attributeName);
                        if (attributeChanged) {
                            console.log(`Liquid attribute changed: ${mutation.attributeName} = ${target.getAttribute(mutation.attributeName)}`);
                            regenerateLiquidGlass(target);
                        }
                    }
                }
            });
        });
        
        observer.observe(document.body, { 
            attributes: true, 
            attributeFilter: ['liq-refrac', 'liq-depth', 'liq-smooth', 'data-liquid'],
            subtree: true 
        });
    }
    
    // Watch for element size changes and update canvas dimensions
    function setupResizeObserver() {
        const resizeObserver = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                const element = entry.target;
                if (element._liquidGlassShader && element._liquidGlassDimensions) {
                    const newWidth = Math.max(entry.contentRect.width, 1);
                    const newHeight = Math.max(entry.contentRect.height, 1);
                    const newCanvasWidth = Math.ceil(newWidth);
                    const newCanvasHeight = Math.ceil(newHeight);
                    
                    // Check if dimensions actually changed
                    if (newCanvasWidth !== element._liquidGlassDimensions.width || 
                        newCanvasHeight !== element._liquidGlassDimensions.height) {
                        
                        console.log(`Element resized: ${newCanvasWidth}x${newCanvasHeight}`);
                        
                        // Update stored dimensions
                        element._liquidGlassDimensions.width = newCanvasWidth;
                        element._liquidGlassDimensions.height = newCanvasHeight;
                        
                        // Update shader dimensions
                        element._liquidGlassShader.updateConfig({
                            width: newCanvasWidth,
                            height: newCanvasHeight
                        });
                        
                        // Update SVG filter dimensions (container no longer exists)
                        element._liquidGlassShader.updateConfig({
                            width: newCanvasWidth,
                            height: newCanvasHeight
                        });
                    }
                }
            });
        });
        
        // Observe all liquid glass elements
        const liquidElements = document.querySelectorAll('[data-liquid], .data-liquid');
        liquidElements.forEach(element => {
            resizeObserver.observe(element);
        });
        
        return resizeObserver;
    }

    // Make elements with elm-drag="true" draggable
    function makeElementsDraggable() {
        const draggableElements = document.querySelectorAll('[elm-drag="true"]');
        console.log('Found draggable elements:', draggableElements.length);
        
        draggableElements.forEach((element) => {
    let isDragging = false;
            let startX, startY, initialX, initialY;
            
            // Set initial position if not already set
            if (!element.style.position || element.style.position === 'static') {
                element.style.position = 'relative';
            }
            
            // Add cursor style
            element.style.cursor = 'grab';
    
    element.addEventListener('mousedown', (e) => {
        isDragging = true;
                element.style.cursor = 'grabbing';
        startX = e.clientX;
        startY = e.clientY;
                
                const rect = element.getBoundingClientRect();
                initialX = rect.left;
                initialY = rect.top;
                
                e.preventDefault();
                e.stopPropagation();
    });
    
    document.addEventListener('mousemove', (e) => {
                if (isDragging) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
                    const newX = initialX + deltaX;
                    const newY = initialY + deltaY;
                    
                    // Constrain to viewport bounds
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    const elementWidth = element.offsetWidth;
                    const elementHeight = element.offsetHeight;
                    
                    const constrainedX = Math.max(0, Math.min(viewportWidth - elementWidth, newX));
                    const constrainedY = Math.max(0, Math.min(viewportHeight - elementHeight, newY));
                    
                    element.style.left = constrainedX + 'px';
                    element.style.top = constrainedY + 'px';
                    element.style.transform = 'none';
                }
    });
    
    document.addEventListener('mouseup', () => {
            isDragging = false;
                element.style.cursor = 'grab';
            });
            
            console.log('Made element draggable:', element);
        });
    }

    // Apply effects when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for elements to be fully rendered
        setTimeout(() => {
            applyLiquidGlassToElements();
            makeElementsDraggable();
            setupAttributeObserver();
            window._resizeObserver = setupResizeObserver();
        }, 100);
        
        // Also try again after a longer delay to catch late-rendering elements
        setTimeout(() => {
            applyLiquidGlassToElements();
        }, 500);
        
        // Final attempt after everything should be loaded
        setTimeout(() => {
            applyLiquidGlassToElements();
        }, 1000);
    });

    // Observe for dynamically added elements
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.hasAttribute('data-liquid') || node.classList.contains('data-liquid')) {
                            setTimeout(() => {
    applyLiquidGlassToElements();
                                // Re-setup resize observer for new elements
                                const newLiquidElements = document.querySelectorAll('[data-liquid], .data-liquid');
                                newLiquidElements.forEach(element => {
                                    if (!element._liquidGlassDimensions) {
                                        // This is a new element, observe it for resize
                                        if (window._resizeObserver) {
                                            window._resizeObserver.observe(element);
                                        }
                                    }
                                });
                            }, 50);
                        }
                        
                        if (node.hasAttribute('elm-drag')) {
                            makeElementsDraggable();
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Make functions globally available
    window.applyLiquidGlassToElements = applyLiquidGlassToElements;
    window.regenerateLiquidGlass = regenerateLiquidGlass;
    
    // Function to manually update canvas dimensions for all liquid glass elements
    window.updateLiquidGlassDimensions = function() {
        const elements = document.querySelectorAll('[data-liquid], .data-liquid');
        elements.forEach(element => {
            if (element._liquidGlassShader && element._liquidGlassDimensions) {
                const rect = element.getBoundingClientRect();
                const newWidth = Math.max(rect.width, 1);
                const newHeight = Math.max(rect.height, 1);
                const newCanvasWidth = Math.ceil(newWidth);
                const newCanvasHeight = Math.ceil(newHeight);
                
                element._liquidGlassDimensions.width = newCanvasWidth;
                element._liquidGlassDimensions.height = newCanvasHeight;
                
                element._liquidGlassShader.updateConfig({
                    width: newCanvasWidth,
                    height: newCanvasHeight
                });
                
                // Container no longer exists, just update the SVG filter
                
                console.log(`Updated dimensions for element: ${newCanvasWidth}x${newCanvasHeight}`);
            }
        });
    };
    
    // Function to update blur value for an element
    window.updateLiquidGlassBlur = function(element, blurValue) {
        if (element && element._liquidGlassShader) {
            const blur = parseInt(blurValue) || 0;
            const blurPx = blur > 0 ? `${blur}px` : '0.25px';
            
            element.style.backdropFilter = `url(#${element._liquidGlassShader.id}_filter) blur(${blurPx}) contrast(1.2) brightness(1.05) saturate(1.1)`;
            element.style.webkitBackdropFilter = `url(#${element._liquidGlassShader.id}_filter) blur(${blurPx}) contrast(1.2) brightness(1.05) saturate(1.1)`;
            
            console.log(`Updated blur for element: ${blurPx}`);
        }
    };
    
    // Function to force re-application with proper dimensions
    window.forceLiquidGlassRefresh = function() {
        console.log('Forcing liquid glass refresh...');
        
        // Remove all existing effects
        const elements = document.querySelectorAll('[data-liquid], .data-liquid');
        elements.forEach(element => {
            if (element._liquidGlassShader) {
                element._liquidGlassShader.destroy();
                delete element._liquidGlassShader;
                delete element._liquidGlassDimensions;
                
                // Clear backdrop filters
                element.style.backdropFilter = '';
                element.style.webkitBackdropFilter = '';
                element.style.isolation = '';
                element.style.transform = '';
                

            }
        });
        
        // Wait a bit then reapply
        setTimeout(() => {
            applyLiquidGlassToElements();
        }, 100);
    };
})();

// Auto-apply Liquid Glass Feature with Custom Attributes
(function() {
    'use strict';
    
    // Utility functions from the original script
    function smoothStep(a, b, t) {
        t = Math.max(0, Math.min(1, (t - a) / (b - a)));
        return t * t * (3 - 2 * t);
    }

    function length(x, y) {
        return Math.sqrt(x * x + y * y);
    }

    function roundedRectSDF(x, y, width, height, radius) {
        const qx = Math.abs(x) - width + radius;
        const qy = Math.abs(y) - height + radius;
        return Math.min(Math.max(qx, qy), 0) + length(Math.max(qx, 0), Math.max(qy, 0)) - radius;
    }

    function texture(x, y) {
        return { type: 't', x, y };
    }

    // Generate unique ID
    function generateId() {
        return 'liquid-glass-' + Math.random().toString(36).substr(2, 9);
    }




})();

// Custom Liquid Glass Web Components

// Liquid Switch Component
    class LiquidSwitch extends HTMLElement {
        constructor() {
            super();
            this.checked = false;
            this.attachShadow({ mode: 'open' });
            this.render();
            this.setupEventListeners();
        }
        
        render() {
            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: inline-block;
                        width: 52px;
                        height: 32px;
                        background: rgba(255, 255, 255, 0.12);
                        border-radius: 16px;
                        padding: 2px;
        cursor: pointer;
                        transition: all 0.2s ease;
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        position: relative;
                    }
                    
                    .thumb {
                        width: 24px;
                        height: 24px;
                        background: rgba(255, 255, 255, 0.95);
                        border-radius: 50%;
                        transition: all 0.2s ease;
                        transform: translateX(0);
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                        position: absolute;
                        top: 2px;
                        left: 2px;
                    }
                    
                    :host([checked]) .thumb {
                        transform: translateX(20px);
                    }
                    
                    :host([checked]) {
                        background: rgba(76, 175, 80, 0.8);
                        border-color: rgba(76, 175, 80, 0.6);
                    }
                    
                    :host(.focused) .thumb {
                        transform: scale(1.1);
                    }
                    
                    :host(.focused) {
                        box-shadow: 0 0 12px rgba(76, 175, 80, 0.4);
                    }
                </style>
                <div class="thumb"></div>
            `;
        }
        
        setupEventListeners() {
            this.addEventListener('mousedown', this.handleMouseDown.bind(this));
            this.addEventListener('click', this.handleClick.bind(this));
            this.addEventListener('mouseenter', this.handleFocus.bind(this));
            this.addEventListener('mouseleave', this.handleBlur.bind(this));
        }
        
        handleMouseDown(e) {
            this.classList.add('focused');
            this.addLiquidEffect();
            
            const handleMouseMove = (e) => {
                const rect = this.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                
                if (e.clientX > centerX && !this.checked) {
                    this.checked = true;
                    this.setAttribute('checked', '');
                } else if (e.clientX < centerX && this.checked) {
                    this.checked = false;
                    this.removeAttribute('checked');
                }
            };
            
            const handleMouseUp = () => {
                this.classList.remove('focused');
                this.removeLiquidEffect();
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        
        handleClick(e) {
            e.stopPropagation();
            this.checked = !this.checked;
            if (this.checked) {
                this.setAttribute('checked', '');
            } else {
                this.removeAttribute('checked');
            }
        }
        
        handleFocus() {
            this.classList.add('focused');
            this.addLiquidEffect();
        }
        
        handleBlur() {
            this.classList.remove('focused');
            this.removeLiquidEffect();
        }
        
        addLiquidEffect() {
            this.setAttribute('data-liquid', '');
        }
        
        removeLiquidEffect() {
            this.removeAttribute('data-liquid');
        }
    }
    
    // Liquid Slider Component
    class LiquidSlider extends HTMLElement {
                    constructor() {
        super();
        this.value = 50;
        this.attachShadow({ mode: 'open' });
        this.render();
        this.setupEventListeners();
        this.updateSlider(); // Initialize slider position
    }
        
        render() {
            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: inline-block;
                        width: 200px;
                        height: 32px;
                        position: relative;
                        cursor: pointer;
                    }
                    
                    .track {
                        width: 100%;
                        height: 6px;
                        background: rgba(255, 255, 255, 0.15);
                        border-radius: 3px;
            position: absolute;
            top: 50%;
                        transform: translateY(-50%);
                    }
                    
                    .fill {
                        height: 100%;
                        background: rgba(33, 150, 243, 0.8);
                        border-radius: 3px;
                        transition: width 0.2s ease;
                        width: 0%;
                    }
                    
                    .thumb {
                        width: 18px;
                        height: 18px;
                        background: rgba(255, 255, 255, 0.95);
                        border-radius: 50%;
                        position: absolute;
                        top: 50%;
            transform: translate(-50%, -50%);
                        transition: all 0.2s ease;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                        left: 0%;
                    }
                    
                    :host(.focused) .thumb {
                        transform: translate(-50%, -50%) scale(1.1);
                        box-shadow: 0 2px 6px rgba(33, 150, 243, 0.3);
                    }
                    
                    :host(.focused) {
                        box-shadow: 0 0 12px rgba(33, 150, 243, 0.2);
                    }
                </style>
                <div class="track">
                    <div class="fill"></div>
                </div>
                <div class="thumb"></div>
            `;
        }
        
        setupEventListeners() {
            this.addEventListener('mousedown', this.handleMouseDown.bind(this));
            this.addEventListener('mouseenter', this.handleFocus.bind(this));
            this.addEventListener('mouseleave', this.handleBlur.bind(this));
        }
        
        handleMouseDown(e) {
            this.classList.add('focused');
            this.addLiquidEffect();
            
            const handleMouseMove = (e) => {
                const rect = this.getBoundingClientRect();
                const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                this.value = (x / rect.width) * 100;
                this.updateSlider();
            };
            
            const handleMouseUp = () => {
                this.classList.remove('focused');
                this.removeLiquidEffect();
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            this.updateSlider(); // Initialize slider position
        }
        
        updateSlider() {
            const fill = this.shadowRoot.querySelector('.fill');
            const thumb = this.shadowRoot.querySelector('.thumb');
            const percentage = this.value;
            
            fill.style.width = percentage + '%';
            thumb.style.left = percentage + '%';
        }
        
        handleFocus() {
            this.classList.add('focused');
            this.addLiquidEffect();
        }
        
        handleBlur() {
            this.classList.remove('focused');
            this.removeLiquidEffect();
        }
        
        addLiquidEffect() {
            this.setAttribute('data-liquid', '');
        }
        
        removeLiquidEffect() {
            this.removeAttribute('data-liquid');
        }
    }
    
    // Liquid Navigation Component
    class LiquidNavItems extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.render();
            this.setupEventListeners();
        }
        
                    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    gap: 8px;
                    background: transparent;
                    padding: 0;
                    border-radius: 0;
                    border: none;
                }
                
                .nav-item {
                    padding: 12px 20px;
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 14px;
                    font-weight: 500;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    min-width: 80px;
                    justify-content: center;
                }
                
                .nav-item:hover {
                    background: rgba(255, 255, 255, 0.15);
            color: white;
                    border-color: rgba(255, 255, 255, 0.2);
                }
                
                .nav-item.active {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border-color: rgba(255, 255, 255, 0.3);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                
                .nav-item .icon {
                    font-size: 16px;
                }
                
                .liquid-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 99999;
                }
                
                .liquid-panel {
                    position: absolute;
                    width: 300px;
                    height: 200px;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 15px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    pointer-events: auto;
                    cursor: grab;
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                }
                
                .liquid-panel:active {
                    cursor: grabbing;
                }
            </style>
            <div class="nav-item active" data-page="account">
                <span class="icon">👤</span>
                <span>Account</span>
            </div>
            <div class="nav-item" data-page="gallery">
                <span class="icon">🖼️</span>
                <span>Gallery</span>
            </div>
            <div class="nav-item" data-page="stylings">
                <span class="icon">🎨</span>
                <span>Stylings</span>
            </div>
            <div class="nav-item" data-page="settings">
                <span class="icon">⚙️</span>
                <span>Settings</span>
        </div>
    `;
    }
        
        setupEventListeners() {
            const navItems = this.shadowRoot.querySelectorAll('.nav-item');
            
            navItems.forEach(item => {
                item.addEventListener('mousedown', this.handleNavItemMouseDown.bind(this, item));
                item.addEventListener('click', this.handleNavItemClick.bind(this, item));
            });
        }
        
        handleNavItemMouseDown(item, e) {
            e.preventDefault();
            
            // Create liquid overlay
            const overlay = document.createElement('div');
            overlay.className = 'liquid-overlay';
            overlay.innerHTML = `
                <div class="liquid-panel" data-liquid elm-drag="true" style="left: ${e.clientX - 150}px; top: ${e.clientY - 100}px;">
                    <div style="padding: 20px; text-align: center;">
                        <h3 style="color: white; margin: 0 0 10px 0;">Navigate to</h3>
                        <p style="color: white; margin: 0; font-size: 18px;">${item.textContent}</p>
                        <div style="margin-top: 20px; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 8px;">
                            <p style="color: white; margin: 0; font-size: 12px;">Drag to navigate</p>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Remove overlay after drag
            const panel = overlay.querySelector('.liquid-panel');
            panel.addEventListener('mouseup', () => {
                setTimeout(() => {
                    overlay.remove();
                }, 100);
            });
        }
        
        handleNavItemClick(item, e) {
            const navItems = this.shadowRoot.querySelectorAll('.nav-item');
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            console.log('Navigated to:', item.dataset.page);
        }
    }
    
    // Liquid Tab Component
    class LiquidTab extends HTMLElement {
        constructor() {
            super();
            this.activeTab = 'tab1';
            this.attachShadow({ mode: 'open' });
            this.render();
            this.setupEventListeners();
        }
        
        render() {
            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: block;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 10px;
                        padding: 15px;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    }
                    
                    .tab-header {
                        display: flex;
                        gap: 5px;
                        margin-bottom: 15px;
                    }
                    
                    .tab-button {
                        padding: 10px 20px;
                        background: rgba(255, 255, 255, 0.1);
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        color: white;
                        font-size: 14px;
                        transition: all 0.3s ease;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    }
                    
                    .tab-button:hover {
                        background: rgba(255, 255, 255, 0.2);
                    }
                    
                    .tab-button.active {
                        background: rgba(102, 126, 234, 0.6);
                        border-color: rgba(102, 126, 234, 0.8);
                    }
                    
                    .tab-content {
                        color: white;
                        font-size: 14px;
                        line-height: 1.5;
                    }
                </style>
                <div class="tab-header">
                    <button class="tab-button active" data-tab="tab1">Overview</button>
                    <button class="tab-button" data-tab="tab2">Details</button>
                    <button class="tab-button" data-tab="tab3">Settings</button>
                </div>
                <div class="tab-content">
                    <div data-tab="tab1" style="display: block;">Main overview content with liquid glass effects and interactive elements.</div>
                    <div data-tab="tab2" style="display: none;">Detailed information about the liquid glass implementation and features.</div>
                    <div data-tab="tab3" style="display: none;">Configuration options and customization settings for the components.</div>
                </div>
            `;
        }
        
        setupEventListeners() {
            const tabButtons = this.shadowRoot.querySelectorAll('.tab-button');
            
            tabButtons.forEach(button => {
                button.addEventListener('click', this.handleTabClick.bind(this, button));
                button.addEventListener('mousedown', this.handleTabMouseDown.bind(this, button));
            });
        }
        
        handleTabClick(button, e) {
            const tabId = button.dataset.tab;
            this.switchTab(tabId);
        }
        
        handleTabMouseDown(button, e) {
            button.setAttribute('data-liquid', '');
            
            setTimeout(() => {
                button.removeAttribute('data-liquid');
            }, 500);
        }
        
        switchTab(tabId) {
            const tabButtons = this.shadowRoot.querySelectorAll('.tab-button');
            const tabContents = this.shadowRoot.querySelectorAll('[data-tab]');
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.style.display = 'none');
            
            this.shadowRoot.querySelector(`[data-tab="${tabId}"]`).style.display = 'block';
            this.shadowRoot.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
            
            this.activeTab = tabId;
        }
    }
    
    // Liquid Button Component
    class LiquidButton extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.render();
            this.setupEventListeners();
        }
        
        render() {
            const style = this.getAttribute('style') || 'filled';
            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: inline-block;
                        padding: 10px 20px;
                        border-radius: 10px;
                        cursor: pointer;
                        font-family: inherit;
                        font-size: 14px;
                        font-weight: 500;
                        text-align: center;
                        transition: all 0.2s ease;
                        border: none;
                        outline: none;
                        position: relative;
                        overflow: hidden;
                        min-width: 80px;
                    }
                    
                    :host([style="filled"]) {
                        background: rgba(33, 150, 243, 0.9);
                        color: white;
                        box-shadow: 0 2px 6px rgba(33, 150, 243, 0.3);
                    }
                    
                    :host([style="filled-tonal"]) {
                        background: rgba(255, 255, 255, 0.1);
                        color: rgba(255, 255, 255, 0.9);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    }
                    
                    :host([style="destructive"]) {
                        background: rgba(244, 67, 54, 0.9);
                        color: white;
                        box-shadow: 0 2px 6px rgba(244, 67, 54, 0.3);
                    }
                    
                    :host:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
                    }
                    
                    :host(.focused) {
                        transform: scale(1.02);
                    }
                    
                    ::slotted(*) {
                        color: inherit;
                        text-decoration: none;
                    }
                </style>
                <slot></slot>
            `;
        }
        
        setupEventListeners() {
            this.addEventListener('mousedown', this.handleMouseDown.bind(this));
            this.addEventListener('mouseup', this.handleMouseUp.bind(this));
            this.addEventListener('mouseenter', this.handleFocus.bind(this));
            this.addEventListener('mouseleave', this.handleBlur.bind(this));
        }
        
        handleMouseDown(e) {
            this.classList.add('focused');
            this.addLiquidEffect();
        }
        
        handleMouseUp(e) {
            this.classList.remove('focused');
            this.removeLiquidEffect();
        }
        
        handleFocus() {
            this.classList.add('focused');
            this.addLiquidEffect();
        }
        
        handleBlur() {
            this.classList.remove('focused');
            this.removeLiquidEffect();
        }
        
        addLiquidEffect() {
            this.setAttribute('data-liquid', '');
        }
        
        removeLiquidEffect() {
            this.removeAttribute('data-liquid');
        }
    }
    
    // Liquid Icon Button Component
    class LiquidIconButton extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.render();
            this.setupEventListeners();
        }
        
        render() {
            const style = this.getAttribute('style') || 'filled';
            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: 44px;
                        height: 44px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 18px;
                        transition: all 0.2s ease;
                        border: none;
                        outline: none;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    :host([style="filled"]) {
                        background: rgba(33, 150, 243, 0.9);
                        color: white;
                        box-shadow: 0 2px 6px rgba(33, 150, 243, 0.3);
                    }
                    
                    :host([style="filled-tonal"]) {
                        background: rgba(255, 255, 255, 0.1);
                        color: rgba(255, 255, 255, 0.9);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    }
                    
                    :host([style="destructive"]) {
                        background: rgba(244, 67, 54, 0.9);
                        color: white;
                        box-shadow: 0 2px 6px rgba(244, 67, 54, 0.3);
                    }
                    
                    :host:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
                    }
                    
                    :host(.focused) {
                        transform: scale(1.05);
                    }
                    
                    ::slotted(*) {
                        color: inherit;
                    }
                </style>
                <slot></slot>
            `;
        }
        
        setupEventListeners() {
            this.addEventListener('mousedown', this.handleMouseDown.bind(this));
            this.addEventListener('mouseup', this.handleMouseUp.bind(this));
            this.addEventListener('mouseenter', this.handleFocus.bind(this));
            this.addEventListener('mouseleave', this.handleBlur.bind(this));
        }
        
        handleMouseDown(e) {
            this.classList.add('focused');
            this.addLiquidEffect();
        }
        
        handleMouseUp(e) {
            this.classList.remove('focused');
            this.removeLiquidEffect();
        }
        
        handleFocus() {
            this.classList.add('focused');
            this.addLiquidEffect();
        }
        
        handleBlur() {
            this.classList.remove('focused');
            this.removeLiquidEffect();
        }
        
        addLiquidEffect() {
            this.setAttribute('data-liquid', '');
        }
        
        removeLiquidEffect() {
            this.removeAttribute('data-liquid');
        }
    }
    
            // Register all custom elements
customElements.define('liquid-switch', LiquidSwitch);
customElements.define('liquid-slider', LiquidSlider);
customElements.define('liquid-nav-items', LiquidNavItems);
customElements.define('liquid-tab', LiquidTab);
customElements.define('liquid-button', LiquidButton);
customElements.define('liquid-icon-button', LiquidIconButton);

// Debug: Check if elements are registered
console.log('Custom elements registered:', {
    'liquid-switch': customElements.get('liquid-switch'),
    'liquid-slider': customElements.get('liquid-slider'),
    'liquid-nav-items': customElements.get('liquid-nav-items'),
    'liquid-tab': customElements.get('liquid-tab'),
    'liquid-button': customElements.get('liquid-button'),
    'liquid-icon-button': customElements.get('liquid-icon-button')
});

// Test function to create elements programmatically
window.testLiquidComponents = function() {
    console.log('Testing liquid components...');
    
    // Test switch
    const testSwitch = document.createElement('liquid-switch');
    testSwitch.style.position = 'fixed';
    testSwitch.style.top = '50%';
    testSwitch.style.left = '50%';
    testSwitch.style.transform = 'translate(-50%, -50%)';
    testSwitch.style.zIndex = '100000';
    document.body.appendChild(testSwitch);
    
    // Test slider
    const testSlider = document.createElement('liquid-slider');
    testSlider.style.position = 'fixed';
    testSlider.style.top = '60%';
    testSlider.style.left = '50%';
    testSlider.style.transform = 'translate(-50%, -50%)';
    testSlider.style.zIndex = '100000';
    document.body.appendChild(testSlider);
    
    console.log('Test elements created');
};

// Test function for liquid attributes
window.testLiquidAttributes = function() {
    console.log('Testing liquid attributes...');
    
    // Find all liquid elements
    const elements = document.querySelectorAll('[data-liquid]');
    console.log('Found liquid elements:', elements.length);
    
    // Test changing attributes dynamically
    elements.forEach((element, index) => {
        setTimeout(() => {
            // Random values for testing
            const refraction = Math.floor(Math.random() * 100) + 1;
            const depth = Math.floor(Math.random() * 100) + 1;
            const smoothness = Math.floor(Math.random() * 100) + 1;
            
            console.log(`Updating element ${index}: refraction=${refraction}, depth=${depth}, smoothness=${smoothness}`);
            
            element.setAttribute('liq-refrac', refraction);
            element.setAttribute('liq-depth', depth);
            element.setAttribute('liq-smooth', smoothness);
            

            
        }, index * 500); // Stagger the updates
    });
};

// Debug function to check liquid glass status
window.debugLiquidGlass = function() {
    console.log('=== Liquid Glass Debug Info ===');
    
    const elements = document.querySelectorAll('[data-liquid], .data-liquid');
    console.log(`Total liquid elements: ${elements.length}`);
    
    elements.forEach((element, index) => {
        console.log(`\nElement ${index}:`, element);
        console.log('- Backdrop filter:', element.style.backdropFilter);
        console.log('- Webkit backdrop filter:', element.style.webkitBackdropFilter);
        console.log('- Isolation:', element.style.isolation);
        console.log('- Transform:', element.style.transform);
        console.log('- Liquid data:', element._liquidGlassData);
        
        // Check if SVG filter exists
        if (element._liquidGlassData && element._liquidGlassData.filterId) {
            const filter = document.getElementById(element._liquidGlassData.filterId);
            console.log('- SVG filter exists:', !!filter);
            if (filter) {
                console.log('- Filter attributes:', {
                    id: filter.getAttribute('id'),
                    width: filter.getAttribute('width'),
                    height: filter.getAttribute('height')
                });
            }
        }
    });
    
    // Check all SVG filters in the document
    const allFilters = document.querySelectorAll('filter');
    console.log(`\nTotal SVG filters in document: ${allFilters.length}`);
    allFilters.forEach((filter, index) => {
        console.log(`Filter ${index}:`, filter.getAttribute('id'));
    });
};