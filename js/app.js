/**
 * Main Application Bootstrap & Master Controller
 * GUNA - Interactive Robotics Workstation Portfolio Hero (Phase 4 Spatial Exploration)
 */

import { CONFIG, STATES } from './config.js?v=39';
import { BootManager } from './loader/BootManager.js?v=39';
import { StateManager } from './state/StateManager.js?v=39';
import { PointerTracker } from './input/PointerTracker.js?v=39';
import { SpatialCursor } from './input/SpatialCursor.js?v=39';
import { SceneManager } from './scene/SceneManager.js?v=39';
import { Lighting } from './scene/Lighting.js?v=39';
import { Materials } from './scene/Materials.js?v=39';
import { MountingPlatform } from './scene/MountingPlatform.js?v=39';
import { Environment } from './scene/Environment.js?v=39';
import { Workbench } from './scene/Workbench.js?v=39';
import { RobotController } from './robot/RobotController.js?v=39';
import { ObjectInteractionManager } from './scene/ObjectInteractionManager.js?v=39';
import { HolographicInspector } from './scene/HolographicInspector.js?v=39';
import { InspectionCamera } from './scene/InspectionCamera.js?v=39';
import { InspectionMode } from './scene/InspectionMode.js?v=39';
import { WallFrontAbout } from './scene/WallFrontAbout.js?v=39';
import { WallLeftProjects } from './scene/WallLeftProjects.js?v=39';
import { WallRightSocial } from './scene/WallRightSocial.js?v=39';
import { WallBackGames } from './scene/WallBackGames.js?v=39';
import * as THREE from 'three';

class App {
    constructor() {
        // Subsystem References
        this.bootManager = null;
        this.stateManager = null;
        this.pointerTracker = null;
        this.spatialCursor = null;
        this.sceneManager = null;
        this.lighting = null;

        // Workstation Environment & 4 Wall Subsystems
        this.materials = null;
        this.mountingPlatform = null;
        this.environment = null;
        this.workbench = null;
        this.wallFrontAbout = null;
        this.wallLeftProjects = null;
        this.wallRightSocial = null;
        this.wallBackGames = null;

        // Phase 3 Robotic Arm Subsystem
        this.robotController = null;

        // Phase 4 Spatial Object Exploration Subsystems
        this.interactionManager = null;
        this.holographicInspector = null;
        this.inspectionCamera = null;
        this.inspectionMode = null;


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
        console.log('[App] Initializing Phase 4 Spatial Exploration Architecture...');

        try {
            // 1. Initialize DOM Telemetry Handles
            this._initDOMHandles();

            // 2. Initialize Finite State Machine
            this.stateManager = new StateManager(STATES.NORMAL);

            // 3. Initialize Pointer Input Abstraction & Orange Spatial Cursor
            this.pointerTracker = new PointerTracker(window);
            this.spatialCursor = new SpatialCursor();

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

            // 7.8. Initialize Four Functional Laboratory Walls
            this.wallFrontAbout = new WallFrontAbout(this.materials);
            this.wallFrontAbout.addToScene(this.sceneManager.scene);

            this.wallLeftProjects = new WallLeftProjects(this.materials);
            this.wallLeftProjects.addToScene(this.sceneManager.scene);

            this.wallRightSocial = new WallRightSocial(this.materials);
            this.wallRightSocial.addToScene(this.sceneManager.scene);

            this.wallBackGames = new WallBackGames(this.materials);
            this.wallBackGames.addToScene(this.sceneManager.scene);

            // 8. Initialize Central Robot Mounting Platform (Origin: 0, -2.0, 0)
            this.mountingPlatform = new MountingPlatform(this.materials);
            this.mountingPlatform.addToScene(this.sceneManager.scene);

            // 8.5. Initialize Phase 3 6-DOF Industrial Robotic Arm
            this.robotController = new RobotController(this.materials);
            this.robotController.addToScene(this.sceneManager.scene);

            // 8.8. Initialize Phase 4 Spatial Object Interaction Subsystems
            this.interactionManager = new ObjectInteractionManager(this.sceneManager.camera, this.sceneManager.scene);
            this.holographicInspector = new HolographicInspector();
            this.holographicInspector.addToScene(this.sceneManager.scene);

            this.inspectionCamera = new InspectionCamera(this.sceneManager.camera);

            this.inspectionMode = new InspectionMode({
                scene: this.sceneManager.scene,
                camera: this.sceneManager.camera,
                lighting: this.lighting,
                stateManager: this.stateManager,
                spatialCursor: this.spatialCursor,
                interactionManager: this.interactionManager,
                holographicInspector: this.holographicInspector,
                inspectionCamera: this.inspectionCamera
            });

            // Register all 7 interactive hardware targets
            this._registerSpatialTargets();

            // 9. Bind Systems & State Change Listeners
            this._bindEvents();

            // 10. Start Master RAF Animation Loop
            this.startLoop();

            // 11. Instantiate & Execute BootManager
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

        console.log('[App] BOOT_COMPLETE Event Received. Spatial Exploration Active.');

        // Activate telemetry status
        if (this.domElements.telemetryStatus) {
            this.domElements.telemetryStatus.textContent = 'ONLINE';
            this.domElements.telemetryStatus.style.color = CONFIG.colors.amber;
        }

        // Activate state machine to initial NORMAL state
        if (this.stateManager) {
            this.stateManager.setState(STATES.NORMAL);
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

        // Pointer Activity Listener -> Update tracking telemetry
        this.pointerTracker.onActivityChange((isActive) => {
            if (!this.isInteractive) return;

            if (this.domElements.trackingDisplay) {
                this.domElements.trackingDisplay.textContent = isActive ? 'ACTIVE' : 'IDLE';
                this.domElements.trackingDisplay.style.color = isActive ? CONFIG.colors.amber : '#7a889b';
            }
        });

        // Camera Reset Listener -> Reset Active Camera View
        this.pointerTracker.onResetCamera(() => {
            if (this.inspectionMode && this.inspectionMode.isExploring) {
                if (this.inspectionCamera) {
                    this.inspectionCamera.reset();
                }
            } else if (this.sceneManager && typeof this.sceneManager.resetCamera === 'function') {
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
     * Register all 7 interactive hardware targets with rich technical metadata
     * @private
     */
    _registerSpatialTargets() {
        if (!this.interactionManager) return;

        // 1. Oscilloscope
        if (this.workbench && this.workbench.interactiveObjects.oscilloscope) {
            this.interactionManager.registerTarget({
                id: 'oscilloscope',
                title: 'DUAL-CHANNEL DIGITAL STORAGE OSCILLOSCOPE',
                category: 'SIGNAL DIAGNOSTICS // BENCH-01',
                description: 'Dual-channel 2.5 GS/s mixed-signal analysis for SPI/I2C bus timing & waveform capture.',
                features: [
                    '2.5 GS/s Real-time equivalent-time DSP sampling rate',
                    'Hardware-accelerated SPI / I2C bus protocol decoder',
                    'Low-noise differential analog frontend (<1.2mV RMS)',
                    'Auto-trigger lock edge tracking on Channel 1 (PWM 100kHz)'
                ],
                technicalData: {
                    'SAMPLING RATE': '2.5 GS/s [REAL-TIME DSP]',
                    'BANDWIDTH': '200 MHz DUAL-CHANNEL',
                    'INPUT IMPEDANCE': '1 MΩ // 15 pF',
                    'TRIGGER MODE': 'AUTO-LOCK EDGE (CH1)',
                    'BUS INTEGRITY': '0.00% JITTER / PASS'
                },
                mesh: this.workbench.interactiveObjects.oscilloscope,
                anchorPoint: new THREE.Vector3(-6.3, -0.78, -3.8),
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
            this.interactionManager.registerTarget({
                id: 'mcuPrototype',
                title: 'ARM CORTEX-M7 EMBEDDED CONTROL NODE',
                category: 'EMBEDDED SYSTEMS // CORE-01',
                description: '480 MHz real-time embedded core with dual CAN 2.0B & SPI optical encoder buses.',
                features: [
                    '480 MHz ARM Cortex-M7 with Double-Precision Hardware FPU',
                    'Preemptive FreeRTOS v10.4 deterministic task kernel',
                    '6-Axis IMU sensor fusion streaming at 1 kHz over I2C',
                    '4096 CPR optical quadrature encoder feedback interface'
                ],
                technicalData: {
                    'MCU CORE': 'ARM Cortex-M7 @ 480 MHz',
                    'RTOS KERNEL': 'FreeRTOS v10.4 [PREEMPTIVE]',
                    'I2C BUS [0x68]': '6-AXIS IMU STREAM 1kHz',
                    'SPI BUS [0x01]': 'OPTICAL ENCODER 4096 CPR',
                    'MEMORY MAP': '32KB SRAM / 128KB FLASH'
                },
                mesh: this.workbench.interactiveObjects.mcuPrototype,
                anchorPoint: new THREE.Vector3(-5.2, -0.94, -2.8),
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
            this.interactionManager.registerTarget({
                id: 'powerSupply',
                title: 'PROGRAMMABLE LINEAR DC BENCH SUPPLY',
                category: 'POWER MANAGEMENT // RAIL-01',
                description: 'Precision linear DC rail (24.0V / 3.5A) with isolated ground and active current limiting.',
                features: [
                    '0-30V / 0-5A Ultra-low ripple linear regulator (<1.2mV RMS)',
                    'Over-voltage (OVP) and over-current (OCP) safety interlocks',
                    'Isolated floating ground with precision 4-wire Kelvin sensing',
                    '94.6% active power factor correction (PFC)'
                ],
                technicalData: {
                    'OUTPUT VOLTAGE': '24.00 V DC [REGULATED]',
                    'OUTPUT CURRENT': '03.50 A [LOAD: 42.0%]',
                    'RIPPLE & NOISE': '< 1.2 mV RMS LOW NOISE',
                    'CURRENT LIMIT': '05.00 A [OVP/OCP ARMED]',
                    'ACTIVE EFFICIENCY': '94.6% PFC REGULATED'
                },
                mesh: this.workbench.interactiveObjects.powerSupply,
                anchorPoint: new THREE.Vector3(-5.3, -0.80, -3.8),
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
            this.interactionManager.registerTarget({
                id: 'reworkStation',
                title: 'CLOSED-LOOP SMD SOLDERING STATION',
                category: 'HARDWARE PROTOTYPING // FAB-01',
                description: 'Closed-loop PID thermal control for SMD component rework & micro-soldering.',
                features: [
                    'Closed-loop PID thermal sensor loop with ±0.5°C stability',
                    '65W ceramic heating element with rapid thermal recovery',
                    'ESD-safe 0.2mm conical micro-soldering tip assembly',
                    'Automatic sleep & standby thermal shutdown timer'
                ],
                technicalData: {
                    'SET TEMPERATURE': '380°C [CLOSED-LOOP PID]',
                    'ACTUAL TIP TEMP': '380.2°C [STABLE ±0.5°C]',
                    'TIP GEOMETRY': '0.2mm CONICAL ESD-SAFE',
                    'HEATING POWER': '65 W RAPID THERMAL RECOVERY',
                    'SAFETY SLEEP': 'AUTO STANDBY 10 MIN'
                },
                mesh: this.workbench.interactiveObjects.reworkStation,
                anchorPoint: new THREE.Vector3(-6.6, -0.84, -3.0),
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
            this.interactionManager.registerTarget({
                id: 'robot',
                title: '6-DOF ARTICULATED ROBOTIC MANIPULATOR',
                category: 'ROBOTICS & KINEMATICS // ARM-01',
                description: 'High-precision 6-axis articulated arm for automated PCB probing & spatial manipulation.',
                features: [
                    '6 Degrees of Freedom with analytical Inverse Kinematics',
                    'Harmonic drive gearboxes with zero mechanical backlash',
                    'Dual-finger adaptive servo gripper with tactile feedback',
                    'Real-time 60 Hz trajectory convergence via Law of Cosines'
                ],
                technicalData: {
                    'DEGREES OF FREEDOM': '6-DOF ARTICULATED',
                    'ACTUATION': 'BRUSHLESS SERVO + HARMONIC DRIVE',
                    'PAYLOAD CAPACITY': '1.5 kg @ MAXIMUM EXTENSION',
                    'REPEATABILITY': '± 0.05 mm ISO 9283 CALIBRATED',
                    'SOLVER FREQUENCY': '60 Hz ANALYTIC IK LOOP'
                },
                mesh: this.robotController.arm.group,
                anchorPoint: new THREE.Vector3(0, 0.4, 0),
                getData: () => {
                    let j1 = 0, j2 = 0, j3 = 0, j4 = 0, j5 = 0, j6 = 0;
                    if (this.robotController && this.robotController.arm) {
                        const getDeg = (name) => {
                            const j = this.robotController.arm.getJoint(name);
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

        // 6. Optical Target Calibration Fiducial Rig
        if (this.workbench && this.workbench.interactiveObjects.calibrationRig) {
            this.interactionManager.registerTarget({
                id: 'calibrationRig',
                title: 'OPTICAL CALIBRATION RIG & TARGET FIDUCIAL',
                category: 'SPATIAL CALIBRATION // RIG-01',
                description: 'Sub-millimeter optical fiducial alignment target for robotic TCP calibration and matrix verification.',
                features: [
                    'Sub-millimeter calibrated optical fiducial alignment cube',
                    'Dual-ring precision crosshair center alignment reticle',
                    '4-point ground reference corner locating pins',
                    'Direct origin registry to global kinematics coordinate frame'
                ],
                technicalData: {
                    'FIDUCIAL TARGET': 'SUB-MILLIMETER OPTICAL CUBE',
                    'ALIGNMENT RETICLE': 'DUAL-RING BRUSHED STEEL TORUS',
                    'SURFACE FLATNESS': '< 0.05mm OVER 1000mm',
                    'CALIBRATION ACCURACY': '± 0.02 mm REPEATABILITY',
                    'WORLD COORDINATE': 'REGISTERED TO ORIGIN (0,0,0)'
                },
                mesh: this.workbench.interactiveObjects.calibrationRig,
                anchorPoint: new THREE.Vector3(5.2, -0.80, -3.1),
                getData: () => [
                    ['FIDUCIAL TARGET:', 'SUB-MILLIMETER OPTICAL CUBE', '#10b981'],
                    ['ALIGNMENT RETICLE:', 'DUAL-RING TORUS [ACTIVE]', '#ff9d00'],
                    ['CALIBRATION ACCURACY:', '± 0.02 mm REPEATABILITY', '#38bdf8'],
                    ['WORLD COORDINATE:', 'REGISTERED TO ORIGIN (0,0,0)', '#10b981'],
                    ['SURFACE FLATNESS:', '< 0.05mm OVER 1000mm', '#f8fafc']
                ]
            });
        }

        // 7. High-Speed Logic & CAN Bus Analyzer
        if (this.workbench && this.workbench.interactiveObjects.logicAnalyzer) {
            this.interactionManager.registerTarget({
                id: 'logicAnalyzer',
                title: 'HIGH-SPEED LOGIC & CAN BUS ANALYZER',
                category: 'BUS PROTOCOLS // ANALYZER-01',
                description: '8-channel logic probe streaming 1.0 Mbps CAN 2.0B traffic and protocol decoding.',
                features: [
                    '8 digital channels sampling at 500 MHz hardware clock',
                    'Real-time CAN 2.0B frame parsing and packet decoding',
                    'Synchronous trigger matching on CAN ID and mask',
                    'Zero dropped frames / 0.000% error rate telemetry stream'
                ],
                technicalData: {
                    'CAN 2.0B BUS': '1.000 Mbps [TRAFFIC: 14.2%]',
                    'DIGITAL CHANNELS': '8-CH LOGIC PROBES @ 500MHz',
                    'PACKET DECODER': 'MOTOR_SYNC / IMU_TELEM_ACK',
                    'TRIGGER MASK': '0x7FF [FRAME CONVERGED]',
                    'DIAGNOSTIC STATUS': 'ACTIVE STREAMING / NOMINAL'
                },
                mesh: this.workbench.interactiveObjects.logicAnalyzer,
                anchorPoint: new THREE.Vector3(6.3, -0.80, -3.7),
                getData: () => [
                    ['CAN 2.0B BUS:', '1.000 Mbps [TRAFFIC: 14.2%]', '#10b981'],
                    ['DIGITAL CHANNELS:', '8-CH @ 500 MHz SAMPLING', '#ff9d00'],
                    ['PACKET DECODER:', 'MOTOR_SYNC / IMU_ACK', '#38bdf8'],
                    ['TRIGGER MASK:', '0x7FF [FRAME CONVERGED]', '#10b981'],
                    ['DIAGNOSTIC STATUS:', 'ACTIVE STREAMING / NOMINAL', '#f8fafc']
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

        // 2. Update Workstation Environment
        if (this.environment) {
            this.environment.update(deltaTime, this.pointerTracker);
        }

        // 3. Update Physical Workbench (Oscilloscope CRT waveform, LED indicators)
        if (this.workbench) {
            this.workbench.update(deltaTime);
        }

        // 3.5. Update 4 Laboratory Walls (Schematic sweeps, telemetry streams, LEDs)
        if (this.wallFrontAbout) {
            this.wallFrontAbout.update(deltaTime);
        }
        if (this.wallLeftProjects) {
            this.wallLeftProjects.update(deltaTime);
        }
        if (this.wallRightSocial) {
            this.wallRightSocial.update(deltaTime);
        }
        if (this.wallBackGames) {
            this.wallBackGames.update(deltaTime);
        }

        const isExploring = this.inspectionMode && this.inspectionMode.isExploring;

        // 4. Update Interaction / Inspection Modes
        if (isExploring) {
            // In Exploration Mode: update master inspection controller (transitions, 360° camera orbit)
            this.inspectionMode.update(deltaTime, this.pointerTracker);
        } else {
            // In Normal Mode: update hover raycasting & small spatial prompt
            if (this.interactionManager) {
                this.interactionManager.update(deltaTime, this.pointerTracker, this.spatialCursor);
            }

            // Update Robotic Arm tracking / breathing
            if (this.robotController) {
                const cam = this.sceneManager ? this.sceneManager.camera : null;
                const state = this.stateManager ? this.stateManager.getState() : 'IDLE';
                this.robotController.update(deltaTime, this.pointerTracker, state, cam);
            }

            // Update Workstation Camera Micro-Parallax
            if (this.sceneManager && typeof this.sceneManager.updateCameraParallax === 'function') {
                this.sceneManager.updateCameraParallax(this.pointerTracker);
            }
        }

        // Render Active Scene
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
