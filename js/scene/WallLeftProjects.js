/**
 * WallLeftProjects - Left Wall (X = -12.0): Engineering Projects & Builds
 * Constructs equipment rack architecture and physical project prototype test stations:
 * 1. Autonomous Hexapod / Spider Robot kinematic chassis
 * 2. Smart IoT Environmental & RF Telemetry Node
 * 3. Embedded ML Vision & Neural Acceleration Station
 * 4. High-Torque BLDC Motor Dynamometer Test Bench
 */

import * as THREE from 'three';

export class WallLeftProjects {
    constructor(materials) {
        this.materials = materials;
        this.group = new THREE.Group();
        this.group.name = 'WallLeftProjects';
        this.group.position.set(-12.0, 0, 0);
        this.group.rotation.y = Math.PI / 2; // Facing into the laboratory (+X)

        this.time = 0;
        this.blinkingLEDs = [];

        this._initWallArchitecture();
        this._initHexapodStation();
        this._initIoTStation();
        this._initMLVisionStation();
        this._initMotorDynoStation();
    }

    /**
     * Create physical wall architecture, unistruts, and equipment rack frames
     * @private
     */
    _initWallArchitecture() {
        const wallMat = this.materials.get('graphiteWall');
        const steelMat = this.materials.get('structuralSteel');
        const railMat = this.materials.get('brushedSteel');

        // Main Wall Plane (26m wide x 10m high)
        const wallGeom = new THREE.PlaneGeometry(26, 10);
        const wallMesh = new THREE.Mesh(wallGeom, wallMat);
        wallMesh.position.set(0, 2.5, 0);
        wallMesh.receiveShadow = true;
        this.wallMesh = wallMesh;
        this.group.add(wallMesh);

        // Heavy Equipment Rack Columns (z = -6, -2, 2, 6)
        const colGeom = new THREE.BoxGeometry(0.40, 10, 0.40);
        [-6.5, -2.2, 2.2, 6.5].forEach(zPos => {
            const col = new THREE.Mesh(colGeom, steelMat);
            col.position.set(zPos, 2.5, 0.22);
            col.castShadow = true;
            this.group.add(col);
        });

        // Horizontal Structural Unistruts (y = -0.5, 1.8, 4.2, 6.2)
        // Positioned BEHIND content panels (z = 0.15)
        const strutGeom = new THREE.BoxGeometry(24, 0.05, 0.05);
        [-0.5, 1.8, 4.2, 6.2].forEach(yPos => {
            const strut = new THREE.Mesh(strutGeom, railMat);
            strut.position.set(0, yPos, 0.15);
            this.group.add(strut);
        });

        // Section Title Header
        const headerGroup = new THREE.Group();
        headerGroup.position.set(0, 5.2, 0.58);

        const backGeom = new THREE.BoxGeometry(7.4, 1.35, 0.06);
        const backMesh = new THREE.Mesh(backGeom, this.materials.get('holoPanel'));
        headerGroup.add(backMesh);

        const borderGeom = new THREE.EdgesGeometry(backGeom);
        const borderMat = new THREE.LineBasicMaterial({ color: 0xffb703, linewidth: 2 });
        const border = new THREE.LineSegments(borderGeom, borderMat);
        border.position.z = 0.035;
        headerGroup.add(border);

        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(6, 10, 18, 0.20)';
        ctx.fillRect(0, 0, 2048, 360);
        ctx.strokeStyle = 'rgba(255, 157, 0, 0.40)';
        ctx.lineWidth = 4;
        ctx.strokeRect(6, 6, 2036, 348);

        ctx.fillStyle = '#ff9d00';
        ctx.font = 'bold 50px "JetBrains Mono", monospace';
        ctx.fillText('// R&D ENGINEERING BUILDS & HARDWARE PROTOTYPES', 54, 90);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 110px "Inter", sans-serif';
        ctx.fillText('ACTIVE PROJECT STATIONS', 54, 215);

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 40px "JetBrains Mono", monospace';
        ctx.fillText('● 4 STATIONS ACTIVE // REAL-TIME TELEMETRY STREAMING', 54, 305);

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;

        const headerMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(7.2, 1.25),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
        );
        headerMesh.position.z = 0.04;
        headerGroup.add(headerMesh);
        this.group.add(headerGroup);
    }

    /**
     * Station 1: Autonomous Hexapod / Spider Robot Test Fixture (z = -4.5)
     * @private
     */
    _initHexapodStation() {
        const station = new THREE.Group();
        station.position.set(-4.5, 1.2, 0.45);

        // Mounting Table / Tray
        const shelfGeom = new THREE.BoxGeometry(3.2, 0.08, 1.2);
        const shelf = new THREE.Mesh(shelfGeom, this.materials.get('workbenchTop'));
        shelf.position.set(0, -0.04, 0.4);
        station.add(shelf);

        // Project Title Plaque
        this._addProjectTag(station, 'PROJ-01: 6-LEGGED HEXAPOD ROBOT', 'Inverse Kinematics · Gait Generation · FreeRTOS', 0, 1.4);

        // Hexapod Body Chassis (Carbon/Graphite Hexagon)
        const hexGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.10, 6);
        const hexBody = new THREE.Mesh(hexGeom, this.materials.get('instrumentChassis'));
        hexBody.position.set(0, 0.25, 0.4);
        station.add(hexBody);

        // Top Microcontroller Controller Board
        const mcuBoard = new THREE.Mesh(
            new THREE.BoxGeometry(0.24, 0.015, 0.24),
            this.materials.get('pcbSubstrate')
        );
        mcuBoard.position.set(0, 0.31, 0.4);
        station.add(mcuBoard);

        // 6 Articulated Spider Legs (Co-axial servos & linkages)
        const legMat = this.materials.get('brushedSteel');
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const leg = new THREE.Group();
            leg.position.set(Math.sin(angle) * 0.32, 0.24, 0.4 + Math.cos(angle) * 0.32);
            leg.rotation.y = angle;

            // Coxa (Upper link)
            const coxa = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.04), legMat);
            coxa.position.x = 0.09;
            leg.add(coxa);

            // Tibia (Downward angled foot)
            const tibia = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.03), legMat);
            tibia.position.set(0.18, -0.10, 0);
            tibia.rotation.z = -0.4;
            leg.add(tibia);

            station.add(leg);
        }

        // Test Probe Cable Harness connecting to wall
        const harness = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8),
            this.materials.get('wireAmber')
        );
        harness.position.set(0, 0.15, -0.1);
        harness.rotation.x = Math.PI / 2;
        station.add(harness);

        this.group.add(station);
    }

    /**
     * Station 2: Smart IoT Environmental & RF Telemetry Node (z = -1.5)
     * @private
     */
    _initIoTStation() {
        const station = new THREE.Group();
        station.position.set(-1.5, 1.2, 0.45);

        // Shelf
        const shelfGeom = new THREE.BoxGeometry(2.4, 0.08, 1.0);
        const shelf = new THREE.Mesh(shelfGeom, this.materials.get('workbenchTop'));
        shelf.position.set(0, -0.04, 0.35);
        station.add(shelf);

        this._addProjectTag(station, 'PROJ-02: SMART IOT SENSOR NODE', 'Multi-Gas Array · LoRa Telemetry · Deep Sleep', 0, 1.4);

        // Weatherproof Industrial Enclosure
        const boxGeom = new THREE.BoxGeometry(0.38, 0.28, 0.18);
        const box = new THREE.Mesh(boxGeom, this.materials.get('instrumentChassis'));
        box.position.set(0, 0.15, 0.35);
        station.add(box);

        // Brass RF Antenna
        const antGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.45, 8);
        const ant = new THREE.Mesh(antGeom, this.materials.get('pcbGold'));
        ant.position.set(0.14, 0.45, 0.35);
        station.add(ant);

        // OLED Status Display Canvas
        const oledCanvas = document.createElement('canvas');
        oledCanvas.width = 256;
        oledCanvas.height = 128;
        const oCtx = oledCanvas.getContext('2d');
        oCtx.fillStyle = '#05070a';
        oCtx.fillRect(0, 0, 256, 128);
        oCtx.fillStyle = '#38bdf8';
        oCtx.font = 'bold 22px monospace';
        oCtx.fillText('TEMP: 23.4°C', 16, 40);
        oCtx.fillText('HUM:  48.2%', 16, 75);
        oCtx.fillStyle = '#10b981';
        oCtx.fillText('LORA: CONNECTED', 16, 110);

        const oledTex = new THREE.CanvasTexture(oledCanvas);
        const oledMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.24, 0.16),
            new THREE.MeshBasicMaterial({ map: oledTex, transparent: true, depthWrite: false })
        );
        oledMesh.position.set(-0.04, 0.15, 0.445);
        station.add(oledMesh);

        this.group.add(station);
    }

    /**
     * Station 3: Embedded ML Vision & Neural Accelerator Rig (z = +1.5)
     * @private
     */
    _initMLVisionStation() {
        const station = new THREE.Group();
        station.position.set(1.5, 1.2, 0.45);

        // Shelf
        const shelfGeom = new THREE.BoxGeometry(2.4, 0.08, 1.0);
        const shelf = new THREE.Mesh(shelfGeom, this.materials.get('workbenchTop'));
        shelf.position.set(0, -0.04, 0.35);
        station.add(shelf);

        this._addProjectTag(station, 'PROJ-03: EMBEDDED ML VISION', 'Edge Neural Accelerator · 60fps Object Tracking', 0, 1.4);

        // Camera Mount Stand
        const standGeom = new THREE.CylinderGeometry(0.015, 0.06, 0.35, 12);
        const stand = new THREE.Mesh(standGeom, this.materials.get('brushedSteel'));
        stand.position.set(0, 0.18, 0.35);
        station.add(stand);

        // Optical Camera Head
        const camBody = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.12, 0.14),
            this.materials.get('instrumentChassis')
        );
        camBody.position.set(0, 0.38, 0.35);
        station.add(camBody);

        // Optical Lens Barrel
        const lensGeom = new THREE.CylinderGeometry(0.04, 0.045, 0.08, 16);
        lensGeom.rotateX(Math.PI / 2);
        const lens = new THREE.Mesh(lensGeom, this.materials.get('instrumentDial'));
        lens.position.set(0, 0.38, 0.46);
        station.add(lens);

        // Blue Dev Board Substrate underneath
        const board = new THREE.Mesh(
            new THREE.BoxGeometry(0.28, 0.012, 0.20),
            this.materials.get('pcbBlue')
        );
        board.position.set(0, 0.02, 0.35);
        station.add(board);

        this.group.add(station);
    }

    /**
     * Station 4: High-Torque BLDC Motor Dynamometer Test Bench (z = +4.5)
     * @private
     */
    _initMotorDynoStation() {
        const station = new THREE.Group();
        station.position.set(4.5, 1.2, 0.45);

        // Heavy Test Table
        const shelfGeom = new THREE.BoxGeometry(3.2, 0.08, 1.2);
        const shelf = new THREE.Mesh(shelfGeom, this.materials.get('workbenchTop'));
        shelf.position.set(0, -0.04, 0.4);
        station.add(shelf);

        this._addProjectTag(station, 'PROJ-04: BLDC MOTOR DYNAMOMETER', 'Field-Oriented Control (FOC) · High-Torque Dyno', 0, 1.4);

        // Heavy Base Fixture Plate
        const plate = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.03, 0.6),
            this.materials.get('opticalBreadboard')
        );
        plate.position.set(0, 0.02, 0.4);
        station.add(plate);

        // BLDC Outrunner Motor Housing
        const motorGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.22, 16);
        motorGeom.rotateX(Math.PI / 2);
        const motor = new THREE.Mesh(motorGeom, this.materials.get('instrumentChassis'));
        motor.position.set(-0.25, 0.16, 0.4);
        station.add(motor);

        // Load Dynamometer Generator
        const dynoGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.20, 16);
        dynoGeom.rotateX(Math.PI / 2);
        const dyno = new THREE.Mesh(dynoGeom, this.materials.get('brushedSteel'));
        dyno.position.set(0.25, 0.16, 0.4);
        station.add(dyno);

        // Center Coupling Shaft
        const shaftGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.20, 12);
        shaftGeom.rotateX(Math.PI / 2);
        const shaft = new THREE.Mesh(shaftGeom, this.materials.get('copperHeatSink'));
        shaft.position.set(0, 0.16, 0.4);
        station.add(shaft);

        // Copper Heat Sink Bank for Power Inverter
        const heatSink = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.08, 0.25),
            this.materials.get('copperHeatSink')
        );
        heatSink.position.set(0, 0.06, 0.1);
        station.add(heatSink);

        this.group.add(station);
    }

    /**
     * Helper to render technical project label above a station
     * @private
     */
    _addProjectTag(parent, title, subtitle, x, y) {
        const tagGroup = new THREE.Group();
        tagGroup.position.set(x, y, 0.12);

        // Holographic Backing Chassis
        const backGeom = new THREE.BoxGeometry(3.05, 0.95, 0.04);
        const backMesh = new THREE.Mesh(backGeom, this.materials.get('holoPanel'));
        tagGroup.add(backMesh);

        const borderGeom = new THREE.EdgesGeometry(backGeom);
        const borderMat = new THREE.LineBasicMaterial({ color: 0xffb703, linewidth: 1.5 });
        const border = new THREE.LineSegments(borderGeom, borderMat);
        border.position.z = 0.025;
        tagGroup.add(border);

        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 320;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(6, 10, 18, 0.20)';
        ctx.fillRect(0, 0, 1024, 320);
        ctx.strokeStyle = 'rgba(255, 157, 0, 0.45)';
        ctx.lineWidth = 4;
        ctx.strokeRect(6, 6, 1012, 308);

        // Header Tag
        ctx.fillStyle = '#ff9d00';
        ctx.font = 'bold 54px "JetBrains Mono", monospace';
        ctx.fillText(title, 40, 95);

        // Subtitle
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 42px "JetBrains Mono", monospace';
        ctx.fillText(subtitle, 40, 190);

        // Status indicator
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 36px "JetBrains Mono", monospace';
        ctx.fillText('● BENCH STATUS: OPERATIONAL & CALIBRATED', 40, 265);

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;

        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(3.0, 0.92),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
        );
        mesh.position.z = 0.025;
        tagGroup.add(mesh);

        parent.add(tagGroup);
    }

    /**
     * Add subsystem to target scene
     * @param {THREE.Scene} scene 
     */
    addToScene(scene) {
        if (scene) {
            scene.add(this.group);
        }
    }

    /**
     * Update animation
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        this.time += deltaTime;
    }
}
