/**
 * SpatialCursor - Precision Orange Spatial Computing Cursor Subsystem
 * Follows exact pointer coordinates across the entire viewport with zero offset,
 * providing dynamic visual states for default navigation, interactive object targeting,
 * 360° exploration orbit, and UI action lock.
 */

export class SpatialCursor {
    constructor() {
        this.domElement = null;
        this.dotElement = null;
        this.ringElement = null;
        this.labelElement = null;

        // Pointer state
        this.x = window.innerWidth * 0.5;
        this.y = window.innerHeight * 0.5;
        this.isVisible = false;
        this.currentMode = 'default'; // 'default', 'hover', 'orbit', 'action'
        this.modeLabel = '';

        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onMouseLeave = this._onMouseLeave.bind(this);
        this._onMouseEnter = this._onMouseEnter.bind(this);

        this._initDOM();
        this._bindEvents();
    }

    /**
     * Create the hardware-accelerated spatial cursor DOM elements
     * @private
     */
    _initDOM() {
        // Container
        const cursor = document.createElement('div');
        cursor.id = 'spatial-cursor';
        cursor.className = 'spatial-cursor default-mode';
        cursor.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;

        // Outer reticle ring / brackets
        const ring = document.createElement('div');
        ring.className = 'cursor-ring';

        // Inner glowing core dot
        const dot = document.createElement('div');
        dot.className = 'cursor-dot';

        // Optional tiny technical label
        const label = document.createElement('span');
        label.className = 'cursor-label';

        cursor.appendChild(ring);
        cursor.appendChild(dot);
        cursor.appendChild(label);

        document.body.appendChild(cursor);

        this.domElement = cursor;
        this.ringElement = ring;
        this.dotElement = dot;
        this.labelElement = label;
    }

    /**
     * Bind window pointer event listeners
     * @private
     */
    _bindEvents() {
        window.addEventListener('mousemove', this._onMouseMove, { passive: true });
        window.addEventListener('mousedown', this._onMouseDown, { passive: true });
        window.addEventListener('mouseup', this._onMouseUp, { passive: true });
        document.body.addEventListener('mouseleave', this._onMouseLeave, { passive: true });
        document.body.addEventListener('mouseenter', this._onMouseEnter, { passive: true });
    }

    /**
     * Handle mouse move: update exact screen pixel coordinates
     * @private
     * @param {MouseEvent} event 
     */
    _onMouseMove(event) {
        this.x = event.clientX;
        this.y = event.clientY;

        if (!this.isVisible) {
            this.isVisible = true;
            this.domElement.classList.add('visible');
        }

        // Direct hardware transform for instant zero-lag tracking
        this.domElement.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
    }

    /**
     * Handle mouse down: apply active click pulse
     * @private
     */
    _onMouseDown() {
        if (this.domElement) {
            this.domElement.classList.add('cursor-active');
        }
    }

    /**
     * Handle mouse up: remove active click pulse
     * @private
     */
    _onMouseUp() {
        if (this.domElement) {
            this.domElement.classList.remove('cursor-active');
        }
    }

    /**
     * Handle mouse leave
     * @private
     */
    _onMouseLeave() {
        this.isVisible = false;
        if (this.domElement) {
            this.domElement.classList.remove('visible');
        }
    }

    /**
     * Handle mouse enter
     * @private
     */
    _onMouseEnter() {
        this.isVisible = true;
        if (this.domElement) {
            this.domElement.classList.add('visible');
        }
    }

    /**
     * Set cursor visual mode
     * @param {'default'|'hover'|'orbit'|'action'} mode 
     * @param {string} [label] Optional short indicator label
     */
    setMode(mode, label = '') {
        if (this.currentMode === mode && this.modeLabel === label) return;

        this.currentMode = mode;
        this.modeLabel = label;

        if (!this.domElement) return;

        // Reset mode classes
        this.domElement.classList.remove('default-mode', 'hover-mode', 'orbit-mode', 'action-mode');
        this.domElement.classList.add(`${mode}-mode`);

        if (this.labelElement) {
            this.labelElement.textContent = label;
            this.labelElement.style.display = label ? 'block' : 'none';
        }
    }

    /**
     * Clean up event listeners and DOM
     */
    destroy() {
        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('mousedown', this._onMouseDown);
        window.removeEventListener('mouseup', this._onMouseUp);
        document.body.removeEventListener('mouseleave', this._onMouseLeave);
        document.body.removeEventListener('mouseenter', this._onMouseEnter);

        if (this.domElement && this.domElement.parentElement) {
            this.domElement.parentElement.removeChild(this.domElement);
        }
    }
}
