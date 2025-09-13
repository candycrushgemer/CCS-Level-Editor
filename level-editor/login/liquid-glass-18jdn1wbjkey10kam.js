
// Vanilla JS Liquid Glass Effect - Modified for existing elements
// Based on Shu Ding's liquid-glass (https://github.com/shuding/liquid-glass)

(function () {
    'use strict';

    // Check if liquid glass already exists and destroy it
    if (window.liquidGlass) {
        window.liquidGlass.destroy();
        console.log('Previous liquid glass effect removed.');
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

    // Main Shader class for elements
    class ElementShader {
        constructor(element) {
            this.element = element;
            this.rect = element.getBoundingClientRect();

            // Try multiple methods to get dimensions
            let width = Math.ceil(this.rect.width);
            let height = Math.ceil(this.rect.height);

            // Get computed styles for more accurate dimensions
            const styles = window.getComputedStyle(element);
            const computedWidth = parseFloat(styles.width);
            const computedHeight = parseFloat(styles.height);

            // Use the larger of getBoundingClientRect or computed styles
            width = Math.max(width, computedWidth);
            height = Math.max(height, computedHeight);

            // Check for CSS transforms that might affect visual size
            const transform = styles.transform;
            if (transform && transform !== 'none') {
                // Extract scale from transform matrix
                const matrix = transform.match(/matrix\(([^)]+)\)/);
                if (matrix) {
                    const values = matrix[1].split(',').map(v => parseFloat(v.trim()));
                    if (values.length >= 4) {
                        const scaleX = Math.abs(values[0]);
                        const scaleY = Math.abs(values[3]);
                        width = Math.ceil(width * Math.max(scaleX, 1));
                        height = Math.ceil(height * Math.max(scaleY, 1));
                    }
                }
            }

            this.width = Math.max(10, Math.ceil(width));
            this.height = Math.max(10, Math.ceil(height));
            this.canvasDPI = 1;
            this.id = generateId();

            this.mouse = { x: 0, y: 0 };
            this.mouseUsed = false;

            // Additional check: if dimensions still seem too small, try to get parent container dimensions
            if (this.width < 100 || this.height < 100) {
                const parent = element.parentElement;
                if (parent) {
                    const parentRect = parent.getBoundingClientRect();
                    const parentStyles = window.getComputedStyle(parent);
                    const parentWidth = parseFloat(parentStyles.width);
                    const parentHeight = parseFloat(parentStyles.height);

                    // Use parent dimensions if they're significantly larger
                    if (parentWidth > this.width * 2 || parentHeight > this.height * 2) {
                        this.width = Math.max(this.width, Math.ceil(parentWidth * 0.8));
                        this.height = Math.max(this.height, Math.ceil(parentHeight * 0.8));
                    }
                }
            }

            this.createFilter();
            this.setupEventListeners();
            this.updateShader();
        }

        createFilter() {
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
            filter.setAttribute('id', this.id);
            filter.setAttribute('filterUnits', 'objectBoundingBox');
            filter.setAttribute('colorInterpolationFilters', 'sRGB');
            filter.setAttribute('x', '0');
            filter.setAttribute('y', '0');
            filter.setAttribute('width', '1');
            filter.setAttribute('height', '1');

            this.feImage = document.createElementNS('http://www.w3.org/2000/svg', 'feImage');
            this.feImage.setAttribute('id', `${this.id}_map`);
            this.feImage.setAttribute('width', this.width.toString());
            this.feImage.setAttribute('height', this.height.toString());
            this.feImage.setAttribute('xlink:href', 'glass_texture.png');

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

            // Add SVG to document
            document.body.appendChild(this.svg);

            // Apply backdrop filter to element
            let backdropFilterValue = `url(#${this.id}) blur(0.25px) contrast(1.2) brightness(1.05) saturate(1.1)`;

            // Check if element also has blur class for additional backdrop blur
            if (this.element.classList.contains('blur')) {
                backdropFilterValue += ' blur(10px)';
            }

            this.element.style.backdropFilter = backdropFilterValue;
        }

        setupEventListeners() {
            // Update mouse position for shader
            this.element.addEventListener('mousemove', (e) => {
                const rect = this.element.getBoundingClientRect();
                this.mouse.x = (e.clientX - rect.left) / rect.width;
                this.mouse.y = (e.clientY - rect.top) / rect.height;

                if (this.mouseUsed) {
                    this.updateShader();
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

            maxScale *= 0.5;

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
            this.feImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'glass_texture.png');
            this.feDisplacementMap.setAttribute('scale', (maxScale / this.canvasDPI).toString());
        }

        // Fragment shader function
        fragment(uv, mouse) {
            const ix = uv.x - 0.5;
            const iy = uv.y - 0.5;
            const distanceToEdge = roundedRectSDF(
                ix,
                iy,
                0.3,
                0.2,
                0.6
            );
            const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15);
            const scaled = smoothStep(0, 1, displacement);
            return texture(ix * scaled + 0.5, iy * scaled + 0.5);
        }

        destroy() {
            this.element.style.backdropFilter = '';
            this.svg.remove();
            this.canvas.remove();
        }
    }

    // Auto-apply liquid glass to elements with .liquid-glass class
    function initializeLiquidGlass() {
        const liquidGlassElements = document.querySelectorAll('.liquid-glass');

        liquidGlassElements.forEach(element => {
            // Wait for element to have proper dimensions
            const checkDimensions = () => {
                const rect = element.getBoundingClientRect();
                if (rect.width > 10 && rect.height > 10) {
                    const shader = new ElementShader(element);
                    element._liquidGlassShader = shader;
                } else {
                    setTimeout(checkDimensions, 50);
                }
            };

            checkDimensions();
        });

        console.log(`Liquid Glass effect applied to ${liquidGlassElements.length} elements!`);
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', initializeLiquidGlass);

    // Handle dynamically added elements
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.classList && node.classList.contains('liquid-glass')) {
                        const shader = new ElementShader(node);
                        node._liquidGlassShader = shader;
                    }
                    const childElements = node.querySelectorAll('.liquid-glass');
                    childElements.forEach(element => {
                        const shader = new ElementShader(element);
                        element._liquidGlassShader = shader;
                    });
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Expose destroy function globally
    window.liquidGlass = {
        destroy: () => {
            document.querySelectorAll('.liquid-glass').forEach(element => {
                if (element._liquidGlassShader) {
                    element._liquidGlassShader.destroy();
                    delete element._liquidGlassShader;
                }
            });
        }
    };
})();