/**
 * Main Application Bootstrap & Master Controller
 * GUNA - Interactive Robotics Workstation Portfolio Hero (Phase 2 Workstation)
 */

import { CONFIG, STATES } from './config.js?v=27';
import { BootManager } from './loader/BootManager.js?v=27';
import { StateManager } from './state/StateManager.js?v=27';
import { PointerTracker } from './input/PointerTracker.js?v=27';
import { SceneManager } from './scene/SceneManager.js?v=27';
import { Lighting } from './scene/Lighting.js?v=27';
import { Materials } from './scene/Materials.js?v=27';
import { MountingPlatform } from './scene/MountingPlatform.js?v=27';
import { Environment } from './scene/Environment.js?v=27';
import { Workbench } from './scene/Workbench.js?v=27';
import { SpatialInterfaces } from './scene/SpatialInterfaces.js?v=27';
import { SpatialHoverManager } from './scene/SpatialHoverManager.js?v=27';
import { RobotController } from './robot/RobotController.js?v=27';
import * as THREE from 'three';

class App {
    constructor() {
        // Subsystem References
        this.bootManager = null;
        this.stateManager = null;
        this.pointerTracker = null;
        this.sceneManager = null;
        this.lighting = null;

        // Phase 2 & 4 Workstation Environment Subsystems
        this.materials = null;
        this.mountingPlatform = null;
        this.environment = null;
        this.workbench = null;
        this.spatialInterfaces = null;
        this.hoverManager = null;

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

            // 7.5. Initialize Physical Engineering Workbench (Electronics, Instruments, PCBs, Tools)
            this.workbench = new Workbench(this.materials);
            this.workbench.addToScene(this.sceneManager.scene);

            // 7.8. Initialize Futuristic Spatial Computing Telemetry & Holographic Interfaces
            this.spatialInterfaces = new SpatialInterfaces(this.materials);
            this.spatialInterfaces.addToScene(this.sceneManager.scene);

            // 8. Initialize Central Robot Mounting Platform (Origin: 0, -2.0, 0)
            this.mountingPlatform = new MountingPlatform(this.materials);
            this.mountingPlatform.addToScene(this.sceneManager.scene);

            // 8.5. Initialize Phase 3 6-DOF Industrial Robotic Arm
            this.robotController = new RobotController(this.materials);
            this.robotController.addToScene(this.sceneManager.scene);

            // 8.8. Initialize Spatial Hover Raycasting & Discovery Subsystem
            this.hoverManager = new SpatialHoverManager(this.sceneManager.camera, this.sceneManager.scene);
            this._registerSpatialHoverTargets();

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
     * Register interactive hardware targets with SpatialHoverManager
     * @private
     */
    _registerSpatialHoverTargets() {
        if (!this.hoverManager) return;

        // 1. Oscilloscope
        if (this.workbench && this.workbench.interactiveObjects.oscilloscope) {
            this.hoverManager.registerTarget({
                id: 'oscilloscope',
                title: 'DUAL-CHANNEL DIGITAL STORAGE OSCILLOSCOPE',
                category: 'SIGNAL DIAGNOSTICS // BENCH-01',
                description: 'Dual-channel 2.5 GS/s mixed-signal analysis for SPI/I2C bus timing & waveform capture.',
                mesh: this.workbench.interactiveObjects.oscilloscope,
                anchorPoint: new THREE.Vector3(-3.85, -0.74, -2.5),
                boundsSize: new THREE.Vector3(0.7, 0.5, 0.5),
                panelOffset: new THREE.Vector3(0.4, 1.4, 0.4),
                getData: () => [
                    ['CHANNEL 1:', 'PWM 100 kHz [3.3V LVCMOS]', '#ff9d00'],
                    ['CHANNEL 2:', 'ANALOG SINE [IMU_RAW]', '#38bdf8'],
                    ['SAMPLING RATE:', '2.5 GS/s [REAL-TIME DSP]', '#10b981'],
                    ['TRIGGER MODE:', 'AUTO-LOCK EDGE (CH1)', '#f8fafc'],
                    ['BUS INTEGRITY:', '0.00% JITTER / PASS', '#10b981']
                ]
            });
        }

        // 2. Microcontroller Prototype & PCB
        if (this.workbench && this.workbench.interactiveObjects.mcuPrototype) {
            this.hoverManager.registerTarget({
                id: 'mcuPrototype',
                title: 'ARM CORTEX-M7 EMBEDDED CONTROL NODE',
                category: 'EMBEDDED SYSTEMS // CORE-01',
                description: '480 MHz real-time embedded core with dual CAN 2.0B & SPI encoder buses.',
                mesh: this.workbench.interactiveObjects.mcuPrototype,
                anchorPoint: new THREE.Vector3(-2.8, -0.94, -1.8),
                boundsSize: new THREE.Vector3(0.5, 0.3, 0.4),
                panelOffset: new THREE.Vector3(0.2, 1.3, 0.4),
                getData: () => [
                    ['MCU CORE:', 'ARM Cortex-M7 @ 480 MHz', '#ff9d00'],
                    ['RTOS KERNEL:', 'FreeRTOS v10.4 [PREEMPTIVE]', '#38bdf8'],
                    ['I2C BUS [0x68]:', '6-AXIS IMU STREAM 1kHz', '#10b981'],
                    ['SPI BUS [0x01]:', 'OPTICAL ENCODER 4096 CPR', '#10b981'],
                    ['MEMORY MAP:', '32KB SRAM / 128KB FLASH', '#f8fafc']
                ]
            });
        }

        // 3. Bench Power Supply
        if (this.workbench && this.workbench.interactiveObjects.powerSupply) {
            this.hoverManager.registerTarget({
                id: 'powerSupply',
                title: 'PROGRAMMABLE LINEAR DC BENCH SUPPLY',
                category: 'POWER MANAGEMENT // RAIL-01',
                description: 'Precision linear DC rail (24.0V / 3.5A) with isolated ground and active current limiting.',
                mesh: this.workbench.interactiveObjects.powerSupply,
                anchorPoint: new THREE.Vector3(-3.05, -0.80, -2.8),
                boundsSize: new THREE.Vector3(0.6, 0.4, 0.4),
                panelOffset: new THREE.Vector3(0.3, 1.4, 0.4),
                getData: () => [
                    ['OUTPUT VOLTAGE:', '24.00 V DC [REGULATED]', '#ff9d00'],
                    ['OUTPUT CURRENT:', '03.50 A [LOAD: 42.0%]', '#10b981'],
                    ['RIPPLE & NOISE:', '< 1.2 mV RMS LOW NOISE', '#38bdf8'],
                    ['CURRENT LIMIT:', '05.00 A [OVP/OCP ARMED]', '#f8fafc'],
                    ['ACTIVE EFFICIENCY:', '94.6% PFC REGULATED', '#10b981']
                ]
            });
        }

        // 4. Soldering & SMD Rework Station
        if (this.workbench && this.workbench.interactiveObjects.reworkStation) {
            this.hoverManager.registerTarget({
                id: 'reworkStation',
                title: 'CLOSED-LOOP SMD SOLDERING STATION',
                category: 'HARDWARE PROTOTYPING // FAB-01',
                description: 'Closed-loop PID thermal control for SMD component rework & micro-soldering.',
                mesh: this.workbench.interactiveObjects.reworkStation,
                anchorPoint: new THREE.Vector3(-4.0, -0.85, -2.8),
                boundsSize: new THREE.Vector3(0.5, 0.4, 0.4),
                panelOffset: new THREE.Vector3(0.3, 1.4, 0.4),
                getData: () => [
                    ['SET TEMPERATURE:', '380°C [CLOSED-LOOP PID]', '#ff9d00'],
                    ['ACTUAL TIP TEMP:', '380.2°C [STABLE ±0.5°C]', '#10b981'],
                    ['TIP GEOMETRY:', '0.2mm CONICAL ESD-SAFE', '#38bdf8'],
                    ['HEATING POWER:', '65 W RAPID THERMAL RECOVERY', '#f8fafc'],
                    ['SAFETY SLEEP:', 'AUTO STANDBY 10 MIN', '#94a3b8']
                ]
            });
        }

        // 5. 6-DOF Industrial Robotic Manipulator
        if (this.robotController && this.robotController.arm && this.robotController.arm.group) {
            this.hoverManager.registerTarget({
                id: 'robot',
                title: '6-DOF ARTICULATED ROBOTIC MANIPULATOR',
                category: 'ROBOTICS & KINEMATICS // ARM-01',
                description: 'High-precision 6-axis articulated arm for automated PCB probing & spatial manipulation.',
                mesh: this.robotController.arm.group,
                anchorPoint: new THREE.Vector3(0, 0.4, 0),
                boundsSize: new THREE.Vector3(1.2, 1.8, 1.2),
                panelOffset: new THREE.Vector3(2.4, 1.4, 0.6),
                getData: (rc) => {
                    let j1 = 0, j2 = 0, j3 = 0, j4 = 0, j5 = 0, j6 = 0;
                    if (rc && rc.arm) {
                        const getDeg = (name) => {
                            const j = rc.arm.getJoint(name);
                            return j ? THREE.MathUtils.radToDeg(j.currentAngle).toFixed(1) : '0.0';
                        };
                        j1 = getDeg('J1'); j2 = getDeg('J2'); j3 = getDeg('J3');
                        j4 = getDeg('J4'); j5 = getDeg('J5'); j6 = getDeg('J6');
                    }
                    return [
                        ['J1 BASE YAW:', `${j1}° [±160° SERVO RANGE]`, '#ff9d00'],
                        ['J2 SHOULDER:', `${j2}° [ANALYTIC IK PIVOT]`, '#ff9d00'],
                        ['J3 ELBOW PITCH:', `${j3}° [PLANAR FLEXION]`, '#ff9d00'],
                        ['J4-J6 WRIST TRIPLE:', `R:${j4}° P:${j5}° T:${j6}°`, '#38bdf8'],
                        ['IK SOLVER STATE:', 'LAW OF COSINES [CONVERGED 60Hz]', '#10b981']
                    ];
                }
            });
        }

        // 6. Precision Optical Breadboard Matrix
        if (this.workbench && this.workbench.interactiveObjects.opticalBreadboard) {
            this.hoverManager.registerTarget({
                id: 'opticalBreadboard',
                title: 'PRECISION OPTICAL CALIBRATION RIG',
                category: 'SPATIAL CALIBRATION // RIG-01',
                description: 'M6 threaded matrix fixture with optical fiducial alignment for robotic TCP calibration.',
                mesh: this.workbench.interactiveObjects.opticalBreadboard,
                anchorPoint: new THREE.Vector3(3.4, -0.85, -2.2),
                boundsSize: new THREE.Vector3(1.8, 0.4, 1.4),
                panelOffset: new THREE.Vector3(-0.3, 1.4, 0.4),
                getData: () => [
                    ['SURFACE MATRIX:', 'M6 THREADED 25mm PITCH', '#ff9d00'],
                    ['FIDUCIAL TARGET:', 'SUB-MILLIMETER OPTICAL CUBE', '#10b981'],
                    ['MATERIAL ALLOY:', 'ANODIZED AIRCRAFT ALUMINUM', '#f8fafc'],
                    ['SURFACE FLATNESS:', '< 0.05mm OVER 1000mm', '#38bdf8'],
                    ['WORLD COORDINATE:', 'REGISTERED TO ORIGIN (0,0,0)', '#10b981']
                ]
            });
        }

        // 7. High-Speed Logic & CAN Bus Analyzer
        if (this.workbench && this.workbench.interactiveObjects.logicAnalyzer) {
            this.hoverManager.registerTarget({
                id: 'logicAnalyzer',
                title: 'HIGH-SPEED LOGIC & CAN BUS ANALYZER',
                category: 'BUS PROTOCOLS // ANALYZER-01',
                description: '8-channel logic probe streaming 1.0 Mbps CAN 2.0B traffic and protocol decoding.',
                mesh: this.workbench.interactiveObjects.logicAnalyzer,
                anchorPoint: new THREE.Vector3(3.8, -0.85, -2.5),
                boundsSize: new THREE.Vector3(0.5, 0.3, 0.4),
                panelOffset: new THREE.Vector3(-0.4, 1.4, 0.4),
                getData: () => [
                    ['CAN 2.0B BUS:', '1.000 Mbps [TRAFFIC: 14.2%]', '#10b981'],
                    ['DIGITAL CHANNELS:', '8-CH LOGIC PROBES @ 500MHz', '#ff9d00'],
                    ['PACKET DECODER:', 'MOTOR_SYNC / IMU_TELEM_ACK', '#38bdf8'],
                    ['FRAME ERROR RATE:', '0.000% [ZERO DROPPED FRAMES]', '#10b981'],
                    ['TRIGGER PATTERN:', 'CAN ID 0x120 [MATCH OK]', '#f8fafc']
                ]
            });
        }
    }

    /**
     * Master Animation Render Loop (RequestAnimationFrame)
     * @private
     * @param {number} currentTime High-resolution timestamp
     */
    _onFrame(currentTime) {
        if (!this.isLoopRunning) return;

        // Calculate Delta Time in seconds
        const deltaTime = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = currentTime;

        // 1. Update Pointer Tracking & Telemetry Readouts
        if (this.pointerTracker) {
            this.pointerTracker.update(deltaTime);

            if (this.domElements.telemetryCoords) {
                this.domElements.telemetryCoords.textContent = 
                    `X:${this.pointerTracker.normalizedX.toFixed(2)} Y:${this.pointerTracker.normalizedY.toFixed(2)}`;
            }
        }

        // 2. Update Workstation Environment & Camera Perspective Parallax
        if (this.environment) {
            this.environment.update(deltaTime, this.pointerTracker);
        }

        // 2.5. Update Physical Workbench (Oscilloscope CRT waveform, LED indicators)
        if (this.workbench) {
            this.workbench.update(deltaTime);
        }

        // 2.7. Update Spatial Hover Raycasting & Discovery Subsystem
        if (this.hoverManager) {
            this.hoverManager.update(deltaTime, this.pointerTracker);
        }

        // 2.8. Update Contextual Holographic Telemetry & Spatial Discovery
        if (this.spatialInterfaces) {
            const cam = this.sceneManager ? this.sceneManager.camera : null;
            this.spatialInterfaces.update(deltaTime, this.hoverManager, cam, this.robotController, this.pointerTracker);
        }

        // 3. Update Phase 3 6-DOF Industrial Robotic Arm
        if (this.robotController) {
            const cam = this.sceneManager ? this.sceneManager.camera : null;
            this.robotController.update(deltaTime, this.pointerTracker, this.stateManager ? this.stateManager.getState() : 'IDLE', cam);
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
