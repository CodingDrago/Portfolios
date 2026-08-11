/**
 * Main Application Bootstrap & Master Controller
 * GUNA - Interactive Robotics Workstation Portfolio Hero (Phase 1 Foundation)
 */

import { CONFIG, STATES } from './config.js';
import { StateManager } from './state/StateManager.js';
import { PointerTracker } from './input/PointerTracker.js';
import { SceneManager } from './scene/SceneManager.js';
import { Lighting } from './scene/Lighting.js';
import { PlaceholderObject } from './scene/PlaceholderObject.js';

class App {
    constructor() {
        // Module References
        this.stateManager = null;
        this.pointerTracker = null;
        this.sceneManager = null;
        this.lighting = null;
        this.placeholderObject = null;

        // Animation Loop Control
        this.lastFrameTime = 0;
        this.isLoopRunning = false;

        // DOM Telemetry Elements
        this.domElements = {
            stateDisplay: null,
            trackingDisplay: null,
            telemetryCoords: null,
            telemetryStatus: null
        };

        this._onFrame = this._onFrame.bind(this);
    }

    /**
     * Bootstrap Phase 1 Foundation Architecture
     */
    async init() {
        console.log('[App] Initializing Phase 1 Foundation Architecture...');

        try {
            // 1. Initialize DOM Telemetry Handles
            this._initDOMHandles();

            // 2. Initialize Finite State Machine
            this.stateManager = new StateManager(STATES.IDLE);

            // 3. Initialize Pointer Input Abstraction
            this.pointerTracker = new PointerTracker(window);

            // 4. Initialize Three.js Viewport & Canvas Mount
            const canvasContainer = document.getElementById('canvas-container');
            this.sceneManager = new SceneManager(canvasContainer);

            // 5. Initialize Industrial Lighting
            this.lighting = new Lighting();
            this.lighting.addToScene(this.sceneManager.scene);

            // 6. Initialize Verification Placeholder Object
            this.placeholderObject = new PlaceholderObject();
            this.placeholderObject.addToScene(this.sceneManager.scene);

            // 7. Bind Systems & Event Listeners
            this._bindEvents();

            // 8. Start RAF Animation Loop
            this.startLoop();

            console.log('[App] Phase 1 Initialization Complete. System Online.');
        } catch (err) {
            console.error('[App] Fatal Initialization Error:', err);
            if (this.domElements.telemetryStatus) {
                this.domElements.telemetryStatus.textContent = 'ERR_INIT_FAIL';
                this.domElements.telemetryStatus.style.color = '#ef4444';
            }
        }
    }

    /**
     * Cache DOM references for telemetry overlay updates
     * @private
     */
    _initDOMHandles() {
        this.domElements.stateDisplay = document.getElementById('state-display');
        this.domElements.trackingDisplay = document.getElementById('tracking-display');
        this.domElements.telemetryCoords = document.getElementById('telemetry-coords');
        this.domElements.telemetryStatus = document.getElementById('telemetry-status');
    }

    /**
     * Connect listeners between pointer input, state manager, and visual telemetry
     * @private
     */
    _bindEvents() {
        // State Machine Listener -> Update DOM & Placeholder Mesh
        this.stateManager.onChange(({ state }) => {
            if (this.domElements.stateDisplay) {
                this.domElements.stateDisplay.textContent = state;
            }
            if (this.placeholderObject) {
                this.placeholderObject.onStateChange(state);
            }
        });

        // Pointer Activity Listener -> Drive State Machine Transitions
        this.pointerTracker.onActivityChange((isActive) => {
            if (this.domElements.trackingDisplay) {
                this.domElements.trackingDisplay.textContent = isActive ? 'ACTIVE' : 'IDLE';
                this.domElements.trackingDisplay.style.color = isActive ? CONFIG.colors.amber : '#7a889b';
            }

            if (isActive) {
                this.stateManager.setState(STATES.TRACKING);
            } else {
                this.stateManager.setState(STATES.IDLE);
            }
        });
    }

    /**
     * Start high-performance RequestAnimationFrame Loop
     */
    startLoop() {
        if (this.isLoopRunning) return;
        this.isLoopRunning = true;
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this._onFrame);
    }

    /**
     * Stop RAF Animation Loop
     */
    stopLoop() {
        this.isLoopRunning = false;
    }

    /**
     * Master Animation Frame Callback
     * @private
     * @param {number} currentTime High-resolution timestamp
     */
    _onFrame(currentTime) {
        if (!this.isLoopRunning) return;

        // Calculate frame delta time in seconds
        const deltaTime = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = currentTime;

        // 1. Update Pointer Tracker smooth coordinate interpolation
        if (this.pointerTracker) {
            this.pointerTracker.update(deltaTime);

            // Update Telemetry Coords DOM overlay
            if (this.domElements.telemetryCoords) {
                this.domElements.telemetryCoords.textContent = 
                    `X:${this.pointerTracker.normalizedX.toFixed(2)} Y:${this.pointerTracker.normalizedY.toFixed(2)}`;
            }
        }

        // 2. Update Placeholder Mesh
        if (this.placeholderObject) {
            this.placeholderObject.update(deltaTime, this.pointerTracker);
        }

        // 3. Render WebGL Scene
        if (this.sceneManager) {
            this.sceneManager.render();
        }

        // Request next frame
        requestAnimationFrame(this._onFrame);
    }
}

// Instantiate and bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
