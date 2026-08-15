/**
 * PointerTracker - Clean Pointer Abstraction System
 * Consolidates mouse & touch events into normalized screen space coordinates,
 * drag events for 3D camera inspection orbit, wheel zoom, and double-click camera reset.
 */

import { CONFIG } from '../config.js';

export class PointerTracker {
    constructor(containerElement = window) {
        this.container = containerElement;

        // Raw Pixel Coordinates
        this.x = window.innerWidth * 0.5;
        this.y = window.innerHeight * 0.5;

        // Normalized Device Coordinates [-1.0 to +1.0]
        this.normalizedX = 0;
        this.normalizedY = 0;

        // Interpolated Smooth Coordinates (for smooth WebGL camera & IK movement)
        this.smoothX = 0;
        this.smoothY = 0;

        // Orbit / Drag Inspection States
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragDeltaX = 0;
        this.dragDeltaY = 0;
        this.lastDragX = 0;
        this.lastDragY = 0;

        // Wheel Zoom Delta
        this.wheelDelta = 0;

        // Pointer Activity Flags & Timer
        this.active = false;
        this.lastMovedTime = 0;
        this.inactivityTimeout = CONFIG.pointer.inactivityTimeoutMs || 3000;

        // Listener callbacks
        this.activityListeners = new Set();
        this.resetListeners = new Set();

        // Bind event handler methods for clean listener removal
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);
        this._onPointerLeave = this._onPointerLeave.bind(this);
        this._onWheel = this._onWheel.bind(this);
        this._onDblClick = this._onDblClick.bind(this);
        this._onTouchStart = this._onTouchStart.bind(this);
        this._onTouchMove = this._onTouchMove.bind(this);
        this._onTouchEnd = this._onTouchEnd.bind(this);

        this._initListeners();
    }

    /**
     * Attach DOM event listeners
     * @private
     */
    _initListeners() {
        window.addEventListener('mousemove', this._onPointerMove, { passive: true });
        window.addEventListener('mousedown', this._onPointerDown, { passive: true });
        window.addEventListener('mouseup', this._onPointerUp, { passive: true });
        document.body.addEventListener('mouseleave', this._onPointerLeave, { passive: true });
        window.addEventListener('wheel', this._onWheel, { passive: false });
        window.addEventListener('dblclick', this._onDblClick, { passive: true });

        window.addEventListener('touchstart', this._onTouchStart, { passive: true });
        window.addEventListener('touchmove', this._onTouchMove, { passive: true });
        window.addEventListener('touchend', this._onTouchEnd, { passive: true });
    }

    /**
     * Update raw & normalized coordinates from mouse move
     * @private
     */
    _onPointerMove(event) {
        const curX = event.clientX;
        const curY = event.clientY;

        if (this.isDragging) {
            this.dragDeltaX = curX - this.lastDragX;
            this.dragDeltaY = curY - this.lastDragY;
            this.lastDragX = curX;
            this.lastDragY = curY;
        }

        this.x = curX;
        this.y = curY;

        const width = window.innerWidth;
        const height = window.innerHeight;

        // Calculate Normalized Device Coordinates (NDC) [-1 to +1]
        this.normalizedX = (this.x / width) * 2 - 1;
        this.normalizedY = -(this.y / height) * 2 + 1; // Top is +1, bottom is -1

        this._updateActivity(true);
    }

    /**
     * Handle mouse down event -> begins camera orbit drag
     * @private
     */
    _onPointerDown(event) {
        // Only trigger on primary button or when not clicking an interactive link/button
        if (event.button === 0) {
            this.isDragging = true;
            this.dragStartX = event.clientX;
            this.dragStartY = event.clientY;
            this.lastDragX = event.clientX;
            this.lastDragY = event.clientY;
            this.dragDeltaX = 0;
            this.dragDeltaY = 0;
        }
        this._updateActivity(true);
    }

    /**
     * Handle mouse up event -> ends camera orbit drag
     * @private
     */
    _onPointerUp() {
        this.isDragging = false;
        this.dragDeltaX = 0;
        this.dragDeltaY = 0;
    }

    /**
     * Handle mouse wheel scroll for camera zoom
     * @private
     */
    _onWheel(event) {
        event.preventDefault();
        this.wheelDelta += event.deltaY * 0.05;
        this._updateActivity(true);
    }

    /**
     * Handle double-click event to reset camera orbit position
     * @private
     */
    _onDblClick() {
        this.resetListeners.forEach(listener => listener());
    }

    /**
     * Handle pointer leaving document window
     * @private
     */
    _onPointerLeave() {
        this.isDragging = false;
        this.dragDeltaX = 0;
        this.dragDeltaY = 0;
        this._updateActivity(false);
    }

    /**
     * Handle touch start event
     * @private
     */
    _onTouchStart(event) {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            this._updateTouchCoords(touch);
            this.isDragging = true;
            this.lastDragX = touch.clientX;
            this.lastDragY = touch.clientY;
            this._updateActivity(true);
        }
    }

    /**
     * Handle touch move event
     * @private
     */
    _onTouchMove(event) {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            if (this.isDragging) {
                this.dragDeltaX = touch.clientX - this.lastDragX;
                this.dragDeltaY = touch.clientY - this.lastDragY;
                this.lastDragX = touch.clientX;
                this.lastDragY = touch.clientY;
            }
            this._updateTouchCoords(touch);
            this._updateActivity(true);
        }
    }

    /**
     * Handle touch end event
     * @private
     */
    _onTouchEnd() {
        this.isDragging = false;
        this.dragDeltaX = 0;
        this.dragDeltaY = 0;
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
     * Subscribe to camera reset events (double click)
     * @param {Function} listener Callback function
     * @returns {Function} Unsubscribe function
     */
    onResetCamera(listener) {
        this.resetListeners.add(listener);
        return () => this.resetListeners.delete(listener);
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

        // Dampen drag deltas after each frame consumption
        if (!this.isDragging) {
            this.dragDeltaX = 0;
            this.dragDeltaY = 0;
        }

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
        window.removeEventListener('mousedown', this._onPointerDown);
        window.removeEventListener('mouseup', this._onPointerUp);
        document.body.removeEventListener('mouseleave', this._onPointerLeave);
        window.removeEventListener('wheel', this._onWheel);
        window.removeEventListener('dblclick', this._onDblClick);
        window.removeEventListener('touchstart', this._onTouchStart);
        window.removeEventListener('touchmove', this._onTouchMove);
        window.removeEventListener('touchend', this._onTouchEnd);
        this.activityListeners.clear();
        this.resetListeners.clear();
    }
}

