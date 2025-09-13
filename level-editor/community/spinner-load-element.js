/**
 * SpinnerLoad Element - Custom HTML Element
 * 
 * Usage: Just add <spinner-load></spinner-load> anywhere in your HTML
 * 
 * Attributes:
 * - size: "small" | "medium" | "large" (default: "medium")
 * - color: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "md-primary" | "md-secondary" | "md-tertiary" | "md-error" (default: "primary")
 * 
 * Examples:
 * <spinner-load></spinner-load>
 * <spinner-load size="large" color="success"></spinner-load>
 * <spinner-load size="small" color="md-primary"></spinner-load>
 */

// Custom Element Definition
class SpinnerLoadElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['size', 'color'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const size = this.getAttribute('size') || 'medium';
        const color = this.getAttribute('color') || 'primary';
        
        const sizes = {
            small: { width: 24, height: 24, cx: 12, cy: 12, r: 10 },
            medium: { width: 42, height: 42, cx: 21, cy: 21, r: 19 },
            large: { width: 64, height: 64, cx: 32, cy: 32, r: 29 }
        };

        const colors = {
            primary: '#000000',
            secondary: '#6c757d',
            success: '#28a745',
            warning: '#ffc107',
            danger: '#dc3545',
            info: '#17a2b8',
            'md-primary': '#000000',
            'md-secondary': '#625B71',
            'md-tertiary': '#7D5260',
            'md-error': '#BA1A1A'
        };

        const sizeConfig = sizes[size];
        const strokeColor = colors[color] || color || colors.primary;

        // Create styles
        const styles = `
            <style>
                .circle-spinning {
                    stroke-linecap: round;
                    stroke-width: 3px;
                    animation-direction: reverse;
                    animation-duration: 4s;
                    animation-iteration-count: infinite;
                    animation-timing-function: linear;
                    animation-name: spinning;
                }

                .svg-loading-spinner-wrapper {
                    animation: wrapperSpinner 4s infinite linear;
                    transform-origin: 50% 50%;
                }

                @keyframes spinning {
                    0% {
                        animation-timing-function: cubic-bezier(.895,.03,.685,.22);
                        stroke-dasharray: 79 106;
                        stroke-dashoffset: 0;
                    }

                    49.999% {
                        stroke-dasharray: 0 106;
                        stroke-dashoffset: 0;
                    }

                    50.001% {
                        animation-timing-function: cubic-bezier(.165,.84,.44,1);
                        stroke-dasharray: 0 106;
                        stroke-dashoffset: -106;
                    }

                    100% {
                        stroke-dasharray: 79 106;
                        stroke-dashoffset: 0;
                    }
                }

                @keyframes wrapperSpinner {
                    100% {
                        transform: rotate(1turn);
                    }
                }

                /* Accessibility improvements */
                @media (prefers-reduced-motion: reduce) {
                    .circle-spinning,
                    .svg-loading-spinner-wrapper {
                        animation-duration: 0.1s;
                    }
                }

                :host {
                    display: inline-block;
                }
            </style>
        `;

        // Create SVG
        const svg = `
            <svg class="svg-loading-spinner-container" height="${sizeConfig.height}" width="${sizeConfig.width}">
                <g class="svg-loading-spinner-wrapper">
                    <circle class="circle-spinning" 
                            cx="${sizeConfig.cx}" 
                            cy="${sizeConfig.cy}" 
                            fill="none" 
                            r="${sizeConfig.r}" 
                            stroke="${strokeColor}" 
                            stroke-width="3">
                    </circle>
                </g>
            </svg>
        `;

        this.shadowRoot.innerHTML = styles + svg;
    }
}

// Register the custom element
if (!customElements.get('spinner-load')) {
    customElements.define('spinner-load', SpinnerLoadElement);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpinnerLoadElement;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.SpinnerLoadElement = SpinnerLoadElement;
} 