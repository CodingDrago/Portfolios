/**
 * Workbench - Physical Engineering & Embedded Systems Hardware Environment
 * Constructs realistic physical electronics equipment, digital oscilloscope with live CRT,
 * programmable bench power supply, SMD rework station, MCU dev boards, PCBs,
 * precision hand tools, and optical calibration breadboard.
 */

import * as THREE from 'three';

export class Workbench {
    constructor(materials) {
        this.materials = materials;
        this.group = new THREE.Group();
        this.group.name = 'WorkbenchGroup';

        // Animated Texture References
        this.scopeCanvas = null;
        this.scopeContext = null;
        this.scopeTexture = null;
        this.scopeTime = 0;

        // Animated LED References
        this.blinkingLEDs = [];

        // Interactive Object Registry References
        this.interactiveObjects = {
            oscilloscope: null,
            powerSupply: null,
            reworkStation: null,
            mcuPrototype: null,
            opticalBreadboard: null,
            logicAnalyzer: null
        };

        this._initLeftElectronicsBench();
        this._initRightRoboticsBench();
    }

    /**
     * Build Left Wing: Electronics, Embedded Systems & Rework Workstation
     * @private
     */
    _initLeftElectronicsBench() {
        const leftGroup = new THREE.Group();
        leftGroup.name = 'ElectronicsBench';

        // 1. Heavy Industrial Tabletop (Matte dark composite, x = -3.4, y = -1.0, z = -2.4)
        const tableTopGeom = new THREE.BoxGeometry(2.5, 0.08, 2.2);
        const tableTopMesh = new THREE.Mesh(tableTopGeom, this.materials.get('workbenchTop'));
        tableTopMesh.position.set(-3.4, -1.0, -2.4);
        tableTopMesh.castShadow = true;
        tableTopMesh.receiveShadow = true;
        leftGroup.add(tableTopMesh);

        // 2. Extruded Black Anodized T-Slot Aluminum Legs & Frame
        const legGeom = new THREE.BoxGeometry(0.08, 0.96, 0.08);
        const legMat = this.materials.get('workbenchFrame');

        const legPositions = [
            [-4.55, -1.52, -1.4],
            [-2.25, -1.52, -1.4],
            [-4.55, -1.52, -3.4],
            [-2.25, -1.52, -3.4]
        ];

        legPositions.forEach(([x, y, z]) => {
            const leg = new THREE.Mesh(legGeom, legMat);
            leg.position.set(x, y, z);
            leg.castShadow = true;
            leftGroup.add(leg);
        });

        // Lower Stiffener Crossbars
        const crossbarGeomX = new THREE.BoxGeometry(2.3, 0.05, 0.05);
        const barFront = new THREE.Mesh(crossbarGeomX, legMat);
        barFront.position.set(-3.4, -1.75, -1.4);
        const barBack = new THREE.Mesh(crossbarGeomX, legMat);
        barBack.position.set(-3.4, -1.75, -3.4);
        leftGroup.add(barFront, barBack);

        // 3. Digital Storage Oscilloscope with Live Animated CRT Screen
        this._initOscilloscope(leftGroup);

        // 4. Programmable DC Bench Power Supply
        this._initPowerSupply(leftGroup);

        // 5. Soldering & SMD Rework Station
        this._initReworkStation(leftGroup);

        // 6. Active Microcontroller Prototype Dev Board & Sensors
        this._initMCUPrototype(leftGroup);

        // 7. Precision Hand Tools & Component Organizer Tray
        this._initToolsAndTrays(leftGroup);

        this.group.add(leftGroup);
    }

    /**
     * Construct Dual-Channel Oscilloscope with dynamic canvas screen
     * @private
     * @param {THREE.Group} parent 
     */
    _initOscilloscope(parent) {
        const scopeGroup = new THREE.Group();
        scopeGroup.name = 'Oscilloscope';
        scopeGroup.position.set(-3.9, -0.78, -2.7);
        scopeGroup.rotation.y = 0.26; // Angled 15° toward center

        // Instrument Chassis (Dark Industrial Blue-Grey)
        const bodyGeom = new THREE.BoxGeometry(0.56, 0.32, 0.32);
        const bodyMesh = new THREE.Mesh(bodyGeom, this.materials.get('instrumentChassis'));
        bodyMesh.castShadow = true;
        scopeGroup.add(bodyMesh);

        // Front Face Bezel
        const bezelGeom = new THREE.BoxGeometry(0.54, 0.30, 0.02);
        const bezelMesh = new THREE.Mesh(bezelGeom, this.materials.get('instrumentDial'));
        bezelMesh.position.z = 0.165;
        scopeGroup.add(bezelMesh);

        // Live CRT Screen Canvas (256x160 resolution)
        this.scopeCanvas = document.createElement('canvas');
        this.scopeCanvas.width = 256;
        this.scopeCanvas.height = 160;
        this.scopeContext = this.scopeCanvas.getContext('2d');

        this.scopeTexture = new THREE.CanvasTexture(this.scopeCanvas);
        this.scopeTexture.minFilter = THREE.LinearFilter;

        const screenGeom = new THREE.PlaneGeometry(0.28, 0.18);
        const screenMat = new THREE.MeshBasicMaterial({
            map: this.scopeTexture,
            transparent: false
        });
        const screenMesh = new THREE.Mesh(screenGeom, screenMat);
        screenMesh.position.set(-0.09, 0.02, 0.176);
        scopeGroup.add(screenMesh);

        // Rotary Control Knobs (Channel 1, Channel 2, Time/Div)
        const knobGeom = new THREE.CylinderGeometry(0.022, 0.022, 0.02, 12);
        knobGeom.rotateX(Math.PI / 2);
        const knobMat = this.materials.get('brushedSteel');

        const knobPositions = [
            [0.12, 0.06, 0.175],
            [0.18, 0.06, 0.175],
            [0.15, -0.04, 0.175]
        ];

        knobPositions.forEach(([kx, ky, kz]) => {
            const knob = new THREE.Mesh(knobGeom, knobMat);
            knob.position.set(kx, ky, kz);
            scopeGroup.add(knob);
        });

        // BNC Probe Connector Ports (Brushed Steel Ring)
        const bncGeom = new THREE.CylinderGeometry(0.012, 0.014, 0.03, 12);
        bncGeom.rotateX(Math.PI / 2);
        const bnc1 = new THREE.Mesh(bncGeom, knobMat);
        bnc1.position.set(0.10, -0.09, 0.18);
        const bnc2 = new THREE.Mesh(bncGeom, knobMat);
        bnc2.position.set(0.18, -0.09, 0.18);
        scopeGroup.add(bnc1, bnc2);

        // Power Status Green LED
        const ledGeom = new THREE.SphereGeometry(0.008, 8, 8);
        const ledMesh = new THREE.Mesh(ledGeom, this.materials.get('ledGreen'));
        ledMesh.position.set(-0.23, 0.11, 0.176);
        scopeGroup.add(ledMesh);

        parent.add(scopeGroup);
        this.interactiveObjects.oscilloscope = scopeGroup;
    }

    /**
     * Construct Programmable DC Bench Power Supply
     * @private
     * @param {THREE.Group} parent 
     */
    _initPowerSupply(parent) {
        const psuGroup = new THREE.Group();
        psuGroup.name = 'PowerSupply';
        psuGroup.position.set(-3.05, -0.80, -2.8);
        psuGroup.rotation.y = 0.12;

        // Main Chassis
        const psuGeom = new THREE.BoxGeometry(0.44, 0.28, 0.28);
        const psuMesh = new THREE.Mesh(psuGeom, this.materials.get('instrumentChassis'));
        psuMesh.castShadow = true;
        psuGroup.add(psuMesh);

        // Digital LED Readout Windows (Dual 7-segment displays for Voltage and Current)
        const displayGeom = new THREE.PlaneGeometry(0.14, 0.06);
        const displayMat = new THREE.MeshBasicMaterial({ color: 0x05070a });

        const voltDisp = new THREE.Mesh(displayGeom, displayMat);
        voltDisp.position.set(-0.09, 0.05, 0.142);
        const currDisp = new THREE.Mesh(displayGeom, displayMat);
        currDisp.position.set(0.09, 0.05, 0.142);
        psuGroup.add(voltDisp, currDisp);

        // Voltage / Current Digital Text Canvas
        const psuCanvas = document.createElement('canvas');
        psuCanvas.width = 256;
        psuCanvas.height = 128;
        const psuCtx = psuCanvas.getContext('2d');
        psuCtx.fillStyle = '#05070a';
        psuCtx.fillRect(0, 0, 256, 128);
        psuCtx.font = 'bold 36px monospace';
        psuCtx.fillStyle = '#ff9d00';
        psuCtx.fillText('24.00V', 12, 50);
        psuCtx.fillStyle = '#10b981';
        psuCtx.fillText('03.50A', 12, 105);

        const psuTex = new THREE.CanvasTexture(psuCanvas);
        const textGeom = new THREE.PlaneGeometry(0.18, 0.09);
        const textMat = new THREE.MeshBasicMaterial({ map: psuTex, transparent: true });
        const textMesh = new THREE.Mesh(textGeom, textMat);
        textMesh.position.set(0, 0.04, 0.143);
        psuGroup.add(textMesh);

        // Banana Jack Output Terminals (Red +, Black -, Green GND)
        const jackGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.025, 12);
        jackGeom.rotateX(Math.PI / 2);

        const redJack = new THREE.Mesh(jackGeom, new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        redJack.position.set(-0.08, -0.06, 0.15);
        const blackJack = new THREE.Mesh(jackGeom, new THREE.MeshStandardMaterial({ color: 0x111827 }));
        blackJack.position.set(0, -0.06, 0.15);
        const greenJack = new THREE.Mesh(jackGeom, new THREE.MeshStandardMaterial({ color: 0x10b981 }));
        greenJack.position.set(0, 0.06, 0.15);
        psuGroup.add(redJack, blackJack, greenJack);

        parent.add(psuGroup);
        this.interactiveObjects.powerSupply = psuGroup;
    }

    /**
     * Construct Soldering & SMD Rework Station
     * @private
     * @param {THREE.Group} parent 
     */
    _initReworkStation(parent) {
        const reworkGroup = new THREE.Group();
        reworkGroup.name = 'ReworkStation';
        reworkGroup.position.set(-4.2, -0.84, -1.9);
        reworkGroup.rotation.y = 0.40;

        // Base Unit
        const baseGeom = new THREE.BoxGeometry(0.28, 0.18, 0.24);
        const baseMesh = new THREE.Mesh(baseGeom, this.materials.get('instrumentChassis'));
        baseMesh.castShadow = true;
        reworkGroup.add(baseMesh);

        // LED Temperature Display (380°C)
        const tempDispGeom = new THREE.PlaneGeometry(0.10, 0.04);
        const tempDispMat = new THREE.MeshBasicMaterial({ color: 0x05070a });
        const tempDisp = new THREE.Mesh(tempDispGeom, tempDispMat);
        tempDisp.position.set(0, 0.03, 0.122);
        reworkGroup.add(tempDisp);

        // Iron Stand & Brass Sponge Cup
        const standGeom = new THREE.CylinderGeometry(0.04, 0.05, 0.06, 12);
        const standMesh = new THREE.Mesh(standGeom, this.materials.get('brushedSteel'));
        standMesh.position.set(0.20, 0.03, 0.02);
        reworkGroup.add(standMesh);

        // Soldering Pencil Handle resting in stand
        const ironGeom = new THREE.CylinderGeometry(0.012, 0.015, 0.22, 12);
        ironGeom.rotateX(0.7);
        const ironMesh = new THREE.Mesh(ironGeom, this.materials.get('graphiteWall'));
        ironMesh.position.set(0.20, 0.10, 0.02);
        reworkGroup.add(ironMesh);

        parent.add(reworkGroup);
        this.interactiveObjects.reworkStation = reworkGroup;
    }

    /**
     * Construct Active Microcontroller Dev Board & SMT Prototype Assembly
     * @private
     * @param {THREE.Group} parent 
     */
    _initMCUPrototype(parent) {
        const pcbGroup = new THREE.Group();
        pcbGroup.name = 'MCUPrototype';
        pcbGroup.position.set(-2.8, -0.94, -1.8);
        pcbGroup.rotation.y = -0.15;

        // Main FR4 PCB Substrate (0.32 x 0.22)
        const boardGeom = new THREE.BoxGeometry(0.32, 0.012, 0.22);
        const boardMesh = new THREE.Mesh(boardGeom, this.materials.get('pcbSubstrate'));
        boardMesh.castShadow = true;
        pcbGroup.add(boardMesh);

        // Gold Plated Edge Connector Pins & Traces
        const goldStripGeom = new THREE.BoxGeometry(0.30, 0.014, 0.02);
        const goldTop = new THREE.Mesh(goldStripGeom, this.materials.get('pcbGold'));
        goldTop.position.set(0, 0.002, 0.09);
        const goldBottom = new THREE.Mesh(goldStripGeom, this.materials.get('pcbGold'));
        goldBottom.position.set(0, 0.002, -0.09);
        pcbGroup.add(goldTop, goldBottom);

        // Main Microcontroller IC (ARM Cortex-M7 QFP package)
        const mcuGeom = new THREE.BoxGeometry(0.08, 0.018, 0.08);
        const mcuMesh = new THREE.Mesh(mcuGeom, this.materials.get('icEpoxy'));
        mcuMesh.position.set(0, 0.009, 0);
        pcbGroup.add(mcuMesh);

        // SMT Decoupling Capacitors & Resistor Arrays
        const capGeom = new THREE.BoxGeometry(0.015, 0.012, 0.010);
        const capMat = this.materials.get('brushedSteel');
        for (let i = 0; i < 6; i++) {
            const cap = new THREE.Mesh(capGeom, capMat);
            cap.position.set((i % 3) * 0.035 - 0.09, 0.006, Math.floor(i / 3) * 0.03 - 0.04);
            pcbGroup.add(cap);
        }

        // Blinking Heartbeat Status LED (Green)
        const ledGeom = new THREE.BoxGeometry(0.012, 0.012, 0.012);
        const statusLED = new THREE.Mesh(ledGeom, this.materials.get('ledGreen'));
        statusLED.position.set(0.12, 0.008, 0.06);
        pcbGroup.add(statusLED);

        this.blinkingLEDs.push({
            mesh: statusLED,
            rate: 2.0, // 2 Hz blink
            phase: 0
        });

        // Secondary IMU Sensor Breakout Board with Ribbon Cable
        const sensorGeom = new THREE.BoxGeometry(0.10, 0.01, 0.08);
        const sensorMesh = new THREE.Mesh(sensorGeom, this.materials.get('pcbSubstrate'));
        sensorMesh.position.set(-0.25, 0, 0.05);
        pcbGroup.add(sensorMesh);

        // Ribbon Cable (Flat flex connector)
        const ribbonGeom = new THREE.BoxGeometry(0.14, 0.005, 0.03);
        const ribbonMesh = new THREE.Mesh(ribbonGeom, new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.8 }));
        ribbonMesh.position.set(-0.13, 0.003, 0.03);
        pcbGroup.add(ribbonMesh);

        parent.add(pcbGroup);
        this.interactiveObjects.mcuPrototype = pcbGroup;
    }

    /**
     * Construct Precision Tools & Component Organizer Tray
     * @private
     * @param {THREE.Group} parent 
     */
    _initToolsAndTrays(parent) {
        const toolsGroup = new THREE.Group();
        toolsGroup.name = 'ToolsAndTrays';

        // Transparent Component Organizer Tray (Holds IC chips and fasteners)
        const trayGeom = new THREE.BoxGeometry(0.38, 0.03, 0.24);
        const trayMat = new THREE.MeshStandardMaterial({
            color: 0x243042,
            roughness: 0.2,
            metalness: 0.1,
            transparent: true,
            opacity: 0.6
        });
        const trayMesh = new THREE.Mesh(trayGeom, trayMat);
        trayMesh.position.set(-4.0, -0.94, -1.35);
        trayMesh.castShadow = true;
        toolsGroup.add(trayMesh);

        // Internal Compartment Dividers
        const divGeomX = new THREE.BoxGeometry(0.36, 0.035, 0.01);
        const div1 = new THREE.Mesh(divGeomX, this.materials.get('instrumentDial'));
        div1.position.set(-4.0, -0.938, -1.35);
        toolsGroup.add(div1);

        // Precision Digital Calipers on Benchtop
        const caliperBarGeom = new THREE.BoxGeometry(0.28, 0.008, 0.02);
        const caliperMat = this.materials.get('brushedSteel');
        const caliperMesh = new THREE.Mesh(caliperBarGeom, caliperMat);
        caliperMesh.position.set(-2.6, -0.95, -1.35);
        caliperMesh.rotation.y = 0.35;
        toolsGroup.add(caliperMesh);

        parent.add(toolsGroup);
    }

    /**
     * Build Right Wing: Robotics Calibration & Testing Fixture Bench
     * @private
     */
    _initRightRoboticsBench() {
        const rightGroup = new THREE.Group();
        rightGroup.name = 'RoboticsBench';

        // 1. Heavy Industrial Tabletop (Matte dark composite, x = 3.4, y = -1.0, z = -2.4)
        const tableTopGeom = new THREE.BoxGeometry(2.5, 0.08, 2.2);
        const tableTopMesh = new THREE.Mesh(tableTopGeom, this.materials.get('workbenchTop'));
        tableTopMesh.position.set(3.4, -1.0, -2.4);
        tableTopMesh.castShadow = true;
        tableTopMesh.receiveShadow = true;
        rightGroup.add(tableTopMesh);

        // 2. Extruded Black Anodized T-Slot Aluminum Legs
        const legGeom = new THREE.BoxGeometry(0.08, 0.96, 0.08);
        const legMat = this.materials.get('workbenchFrame');

        const legPositions = [
            [2.25, -1.52, -1.4],
            [4.55, -1.52, -1.4],
            [2.25, -1.52, -3.4],
            [4.55, -1.52, -3.4]
        ];

        legPositions.forEach(([x, y, z]) => {
            const leg = new THREE.Mesh(legGeom, legMat);
            leg.position.set(x, y, z);
            leg.castShadow = true;
            rightGroup.add(leg);
        });

        // 3. Precision Optical Breadboard Matrix Plate (Anodized Aluminum with Threaded Matrix)
        const breadboardGeom = new THREE.BoxGeometry(1.9, 0.03, 1.4);
        const breadboardMesh = new THREE.Mesh(breadboardGeom, this.materials.get('opticalBreadboard'));
        breadboardMesh.position.set(3.4, -0.94, -2.3);
        breadboardMesh.castShadow = true;
        breadboardMesh.receiveShadow = true;
        rightGroup.add(breadboardMesh);
        this.interactiveObjects.opticalBreadboard = breadboardMesh;

        // 4. Optical Target Calibration Fiducial Cube
        const cubeGeom = new THREE.BoxGeometry(0.24, 0.24, 0.24);
        const cubeMesh = new THREE.Mesh(cubeGeom, this.materials.get('titaniumPivot'));
        cubeMesh.position.set(2.8, -0.80, -2.0);
        cubeMesh.rotation.y = 0.45;
        cubeMesh.castShadow = true;
        rightGroup.add(cubeMesh);

        // Calibration Fiducial Crosshairs (Brushed Steel ring)
        const fiducialGeom = new THREE.TorusGeometry(0.08, 0.008, 8, 16);
        const fiducialMesh = new THREE.Mesh(fiducialGeom, this.materials.get('amberAccent'));
        fiducialMesh.position.set(2.8, -0.80, -1.87);
        fiducialMesh.rotation.y = 0.45;
        rightGroup.add(fiducialMesh);

        // 5. Logic Analyzer & CAN Bus Diagnostic Unit with Multi-Channel Blinking LEDs
        const logicGroup = new THREE.Group();
        logicGroup.position.set(3.8, -0.88, -2.5);
        logicGroup.rotation.y = -0.20;

        const logicBoxGeom = new THREE.BoxGeometry(0.34, 0.10, 0.22);
        const logicBox = new THREE.Mesh(logicBoxGeom, this.materials.get('instrumentChassis'));
        logicBox.castShadow = true;
        logicGroup.add(logicBox);

        // 6 Channel Activity LEDs
        const chLedGeom = new THREE.SphereGeometry(0.008, 6, 6);
        for (let ch = 0; ch < 6; ch++) {
            const chLed = new THREE.Mesh(chLedGeom, (ch % 2 === 0) ? this.materials.get('ledAmber') : this.materials.get('ledBlue'));
            chLed.position.set((ch - 2.5) * 0.04, 0.052, 0.08);
            logicGroup.add(chLed);

            this.blinkingLEDs.push({
                mesh: chLed,
                rate: 4.0 + ch * 1.5,
                phase: ch * 0.8
            });
        }

        rightGroup.add(logicGroup);
        this.interactiveObjects.logicAnalyzer = logicGroup;

        this.group.add(rightGroup);
    }

    /**
     * Add entire workbench subsystem to target scene
     * @param {THREE.Scene} scene 
     */
    addToScene(scene) {
        if (scene) {
            scene.add(this.group);
        }
    }

    /**
     * Per-frame animation update: Renders live oscilloscope CRT waveforms and pulses LEDs
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        this.scopeTime += deltaTime;

        // 1. Render Dynamic CRT Oscilloscope Waveforms
        if (this.scopeContext && this.scopeTexture) {
            const ctx = this.scopeContext;
            const w = this.scopeCanvas.width;
            const h = this.scopeCanvas.height;

            // Clear Screen (CRT Dark Greenish-Black)
            ctx.fillStyle = '#060d09';
            ctx.fillRect(0, 0, w, h);

            // Subtle Grid Reticle (8x5 divisions)
            ctx.strokeStyle = '#0e2418';
            ctx.lineWidth = 1;
            for (let gx = 0; gx < w; gx += 32) {
                ctx.beginPath();
                ctx.moveTo(gx, 0);
                ctx.lineTo(gx, h);
                ctx.stroke();
            }
            for (let gy = 0; gy < h; gy += 32) {
                ctx.beginPath();
                ctx.moveTo(0, gy);
                ctx.lineTo(w, gy);
                ctx.stroke();
            }

            // Channel 1: High-Speed Digital PWM Pulse Train (Crisp Amber Glow)
            ctx.strokeStyle = '#ff9d00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            const t = this.scopeTime * 6;
            for (let x = 0; x < w; x++) {
                const phase = (x * 0.08 + t) % 4;
                const y = (phase < 2) ? 50 : 80;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Channel 2: Analog Sensor Signal Sine Wave with harmonic noise (Green)
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let x = 0; x < w; x++) {
                const y = 120 + Math.sin(x * 0.05 + this.scopeTime * 4) * 20 + Math.sin(x * 0.15) * 4;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Header Telemetry text
            ctx.font = '9px monospace';
            ctx.fillStyle = '#10b981';
            ctx.fillText('CH1: 3.3V PWM  100kHz', 8, 14);
            ctx.fillStyle = '#ff9d00';
            ctx.fillText('CH2: SPI_MOSI [TRIG:OK]', 130, 14);

            this.scopeTexture.needsUpdate = true;
        }

        // 2. Pulse / Blink Equipment Status LEDs
        for (const item of this.blinkingLEDs) {
            const val = (Math.sin(this.scopeTime * Math.PI * item.rate + item.phase) > 0.1);
            item.mesh.visible = val;
        }
    }
}
