/**
 * Main Application Bootstrap & Master Controller
 * GUNA - Interactive Robotics Workstation Portfolio Hero (Phase 2 Workstation)
 */

import { CONFIG, STATES } from './config.js?v=18';
import { BootManager } from './loader/BootManager.js?v=18';
import { StateManager } from './state/StateManager.js?v=18';
import { PointerTracker } from './input/PointerTracker.js?v=18';
import { SceneManager } from './scene/SceneManager.js?v=18';
import { Lighting } from './scene/Lighting.js?v=18';
import { Materials } from './scene/Materials.js?v=18';
import { MountingPlatform } from './scene/MountingPlatform.js?v=18';
import { Environment } from './scene/Environment.js?v=18';
import { RobotController } from './robot/RobotController.js?v=18';

class App {
    constructor() {
        // Subsystem References
        this.bootManager = null;
        this.stateManager = null;
        this.pointerTracker = null;
        this.sceneManager = null;
        this.lighting = null;

        // Phase 2 Workstation Environment Subsystems
        this.materials = null;
        this.mountingPlatform = null;
        this.environment = null;

        // Phase 3 Robotic Arm Subsystem
        this.robotController = null;

        // Animation Loop Control
        this.lastFrameTime = 0;
        this.isLoopRunning = false;
        this.isInteractive = false; // Activated on BOOT_COMPLETE

        // DOM Telemetry Elements
        this.domElements = {
            stateDisplay: null,
            trackingDisplay: null,
            telemetryCoords: null,
            telemetryStatus: null
        };

        this._onFrame = this._onFrame.bind(this);
        this._onBootComplete = this._onBootComplete.bind(this);
    }

    /**
     * Bootstrap Workstation Architecture & Boot Subsystem
     */
    async init() {
        console.log('[App] Initializing Phase 2 Workstation Architecture...');

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

            // 5. Initialize Industrial Lighting System
            this.lighting = new Lighting();
            this.lighting.addToScene(this.sceneManager.scene);

            // 6. Initialize Industrial Materials Registry
            this.materials = new Materials();

            // 7. Initialize 3D Workstation Environment (Floor plates, wall panels, parallax)
            this.environment = new Environment(this.materials);
            this.environment.addToScene(this.sceneManager.scene);

            // 8. Initialize Central Robot Mounting Platform (Origin: 0, -2.0, 0)
            this.mountingPlatform = new MountingPlatform(this.materials);
            this.mountingPlatform.addToScene(this.sceneManager.scene);

            // 8.5. Initialize Phase 3 6-DOF Industrial Robotic Arm
            this.robotController = new RobotController(this.materials);
            this.robotController.addToScene(this.sceneManager.scene);

            // 9. Bind Systems & State Change Listeners
            this._bindEvents();

            // 10. Start Master RAF Animation Loop (Renders 3D environment underneath loader)
            this.startLoop();

            // 11. Instantiate & Execute BootManager (extracted from loading.html)
            this.bootManager = new BootManager({
                loaderElement: document.getElementById('loader'),
                flashElement: document.getElementById('flash'),
                targetElement: document.getElementById('hero-container'),
                onComplete: this._onBootComplete
            });
            
            // Execute Boot Sequence
            this.bootManager.start();

            console.log('[App] Workstation Environment Initialized. Boot Subsystem Running.');
        } catch (err) {
            console.error('[App] Fatal Initialization Error:', err);
            if (this.domElements.telemetryStatus) {
                this.domElements.telemetryStatus.textContent = 'ERR_INIT_FAIL';
                this.domElements.telemetryStatus.style.color = '#ef4444';
            }
        }
    }

    /**
     * Callback triggered ONCE when BootManager dispatches BOOT_COMPLETE
     * @private
     */
    _onBootComplete() {
        if (this.isInteractive) return;
        this.isInteractive = true;

        console.log('[App] BOOT_COMPLETE Event Received. Workstation Environment Fully Operational.');

        // Activate telemetry status
        if (this.domElements.telemetryStatus) {
            this.domElements.telemetryStatus.textContent = 'ONLINE';
            this.domElements.telemetryStatus.style.color = CONFIG.colors.amber;
        }

        // Activate state machine to initial IDLE state
        if (this.stateManager) {
            this.stateManager.setState(STATES.IDLE);
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
        // State Machine Listener -> Update DOM
        this.stateManager.onChange(({ state }) => {
            if (this.domElements.stateDisplay) {
                this.domElements.stateDisplay.textContent = state;
            }
        });

        // Pointer Activity Listener -> Drive State Machine Transitions (Only after BOOT_COMPLETE)
        this.pointerTracker.onActivityChange((isActive) => {
            if (!this.isInteractive) return;

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

        // Camera Reset Listener -> Reset 3D Orbit View to Default
        this.pointerTracker.onResetCamera(() => {
            if (this.sceneManager && typeof this.sceneManager.resetCamera === 'function') {
                this.sceneManager.resetCamera();
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

        // 2. Update Workstation Environment & Camera Perspective Parallax
        if (this.environment) {
            this.environment.update(deltaTime, this.pointerTracker);
        }

        // 3. Update Phase 3 6-DOF Industrial Robotic Arm
        if (this.robotController) {
            const cam = this.sceneManager ? this.sceneManager.camera : null;
            this.robotController.update(deltaTime, this.pointerTracker, this.stateManager ? this.stateManager.state : 'IDLE', cam);
        }

        if (this.sceneManager) {
            if (typeof this.sceneManager.updateCameraParallax === 'function') {
                this.sceneManager.updateCameraParallax(this.pointerTracker);
            }
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
