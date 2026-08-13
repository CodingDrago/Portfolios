/**
 * PointerTracker - Clean Pointer Abstraction System
 * Consolidates mouse & touch events into normalized screen space coordinates
 */

import { CONFIG } from '../config.js';

export class PointerTracker {
    constructor(containerElement = window) {
        this.container = containerElement;

        // Raw Pixel Coordinates
        this.x = 0;
        this.y = 0;

        // Normalized Device Coordinates [-1.0 to +1.0]
        this.normalizedX = 0;
        this.normalizedY = 0;

        // Interpolated Smooth Coordinates (for smooth WebGL camera & IK movement)
        this.smoothX = 0;
        this.smoothY = 0;

        // Pointer Activity Flags & Timer
        this.active = false;
        this.lastMovedTime = 0;
        this.inactivityTimeout = CONFIG.pointer.inactivityTimeoutMs || 3000;

        // Listener callbacks
        this.activityListeners = new Set();

        // Bind event handler methods for clean listener removal
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerLeave = this._onPointerLeave.bind(this);
        this._onTouchMove = this._onTouchMove.bind(this);
        this._onTouchStart = this._onTouchStart.bind(this);
        this._onTouchEnd = this._onTouchEnd.bind(this);

        this._initListeners();
    }

    /**
     * Attach DOM event listeners
     * @private
     */
    _initListeners() {
        window.addEventListener('mousemove', this._onPointerMove, { passive: true });
        document.body.addEventListener('mouseleave', this._onPointerLeave, { passive: true });
        
        window.addEventListener('touchstart', this._onTouchStart, { passive: true });
        window.addEventListener('touchmove', this._onTouchMove, { passive: true });
        window.addEventListener('touchend', this._onTouchEnd, { passive: true });
    }

    /**
     * Update raw & normalized coordinates from mouse event
     * @private
     */
    _onPointerMove(event) {
        this.x = event.clientX;
        this.y = event.clientY;

        const width = window.innerWidth;
        const height = window.innerHeight;

        // Calculate Normalized Device Coordinates (NDC) [-1 to +1]
        this.normalizedX = (this.x / width) * 2 - 1;
        this.normalizedY = -(this.y / height) * 2 + 1; // Top is +1, bottom is -1

        this._updateActivity(true);
    }

    /**
     * Handle pointer leaving document window
     * @private
     */
    _onPointerLeave() {
        this._updateActivity(false);
    }

    /**
     * Handle touch start event
     * @private
     */
    _onTouchStart(event) {
        if (event.touches.length > 0) {
            this._updateTouchCoords(event.touches[0]);
            this._updateActivity(true);
        }
    }

    /**
     * Handle touch move event
     * @private
     */
    _onTouchMove(event) {
        if (event.touches.length > 0) {
            this._updateTouchCoords(event.touches[0]);
            this._updateActivity(true);
        }
    }

    /**
     * Handle touch end event
     * @private
     */
    _onTouchEnd() {
        this._updateActivity(false);
    }

    /**
     * Extract coordinates from Touch object
     * @private
     */
    _updateTouchCoords(touch) {
        this.x = touch.clientX;
        this.y = touch.clientY;

        const width = window.innerWidth;
        const height = window.innerHeight;

        this.normalizedX = (this.x / width) * 2 - 1;
        this.normalizedY = -(this.y / height) * 2 + 1;
    }

    /**
     * Update internal activity state and notify subscribers
     * @private
     */
    _updateActivity(isActive) {
        this.lastMovedTime = performance.now();
        
        if (this.active !== isActive) {
            this.active = isActive;
            this.activityListeners.forEach(listener => listener(this.active));
        }
    }

    /**
     * Subscribe to activity change events (active vs idle)
     * @param {Function} listener Callback function receiving active boolean
     * @returns {Function} Unsubscribe function
     */
    onActivityChange(listener) {
        this.activityListeners.add(listener);
        return () => this.activityListeners.delete(listener);
    }

    /**
     * Called on each frame loop to smoothly interpolate pointer coordinates
     * @param {number} deltaTime Time elapsed since last frame
     */
    update(deltaTime) {
        const factor = CONFIG.pointer.smoothFactor || 0.08;
        
        // Linear interpolation for smooth coordinate movement
        this.smoothX += (this.normalizedX - this.smoothX) * factor;
        this.smoothY += (this.normalizedY - this.smoothY) * factor;

        // Auto-detect inactivity timeout
        if (this.active && (performance.now() - this.lastMovedTime > this.inactivityTimeout)) {
            this._updateActivity(false);
        }
    }

    /**
     * Clean up event listeners on destroy
     */
    destroy() {
        window.removeEventListener('mousemove', this._onPointerMove);
        document.body.removeEventListener('mouseleave', this._onPointerLeave);
        window.removeEventListener('touchstart', this._onTouchStart);
        window.removeEventListener('touchmove', this._onTouchMove);
        window.removeEventListener('touchend', this._onTouchEnd);
        this.activityListeners.clear();
    }
}
