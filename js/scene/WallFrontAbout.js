/**
 * WallFrontAbout - Front / Primary Wall (Z = -12.0): About & Engineer Profile
 * Multi-layered architecture combining graphite wall panels, structural I-beams,
 * layered "GUNA" identity header, engineering discipline modules (Robotics, Embedded Systems,
 * IoT, Applied ML), system architecture schematics, component storage cabinets, and hardware racks.
 */

import * as THREE from 'three';

export class WallFrontAbout {
    constructor(materials) {
        this.materials = materials;
        this.group = new THREE.Group();
        this.group.name = 'WallFrontAbout';
        this.group.position.set(0, 0, -12.0);

        // Animated Texture References
        this.schematicCanvas = null;
        this.schematicContext = null;
        this.schematicTexture = null;
        this.time = 0;

        this._initWallArchitecture();
        this._initIdentityHeader();
        this._initPhilosophyMarquee();
        this._initDisciplineBadges();
        this._initSchematicDisplay();
        this._initStorageAndShelving();
    }

    /**
     * Create physical wall architecture (Modular panels, I-beams, T-slot equipment rails)
     * @private
     */
    _initWallArchitecture() {
        const wallMat = this.materials.get('graphiteWall');
        const steelMat = this.materials.get('structuralSteel');
        const railMat = this.materials.get('brushedSteel');

        // Main Wall Backplane (26m wide x 10m high)
        const wallGeom = new THREE.PlaneGeometry(26, 10);
        const wallMesh = new THREE.Mesh(wallGeom, wallMat);
        wallMesh.position.set(0, 2.5, 0);
        wallMesh.receiveShadow = true;
        this.group.add(wallMesh);

        // Recessed Modular Architectural Panels (3x2 Grid)
        const panelGeom = new THREE.BoxGeometry(7.6, 3.8, 0.15);
        for (let row = 0; row < 2; row++) {
            for (let col = -1; col <= 1; col++) {
                const panel = new THREE.Mesh(panelGeom, wallMat);
                panel.position.set(col * 8.2, row * 4.2 + 0.6, 0.08);
                panel.receiveShadow = true;
                this.group.add(panel);
            }
        }

        // Structural Steel Vertical Columns (x = ±8.5, x = ±3.8)
        const colGeom = new THREE.BoxGeometry(0.50, 10, 0.50);
        [-8.5, -3.8, 3.8, 8.5].forEach(xPos => {
            const col = new THREE.Mesh(colGeom, steelMat);
            col.position.set(xPos, 2.5, 0.25);
            col.castShadow = true;
            this.group.add(col);
        });

        // Horizontal Equipment Mounting T-Slot Rails (y = 0.6, 2.8, 5.2)
        const railGeom = new THREE.BoxGeometry(24, 0.08, 0.08);
        [0.6, 2.8, 5.2].forEach(yPos => {
            const rail = new THREE.Mesh(railGeom, railMat);
            rail.position.set(0, yPos, 0.28);
            this.group.add(rail);
        });

        // Heavy Cable Conduit Runs (y = 6.2, y = -1.2)
        const pipeGeom = new THREE.CylinderGeometry(0.10, 0.10, 24, 12);
        pipeGeom.rotateZ(Math.PI / 2);
        const pipeMat = this.materials.get('conduitPipe');

        const topPipe = new THREE.Mesh(pipeGeom, pipeMat);
        topPipe.position.set(0, 6.2, 0.22);
        const botPipe = new THREE.Mesh(pipeGeom, pipeMat);
        botPipe.position.set(0, -1.2, 0.22);
        this.group.add(topPipe, botPipe);
    }

    /**
     * Create layered "GUNA" identity header in titanium/brushed steel
     * @private
     */
    _initIdentityHeader() {
        const headerGroup = new THREE.Group();
        headerGroup.position.set(0, 4.6, 0.35);

        // Smoked Backing Plate with Amber Frame
        const backGeom = new THREE.BoxGeometry(6.6, 1.25, 0.08);
        const backMesh = new THREE.Mesh(backGeom, this.materials.get('instrumentChassis'));
        headerGroup.add(backMesh);

        const borderGeom = new THREE.EdgesGeometry(backGeom);
        const borderMat = new THREE.LineBasicMaterial({ color: 0xffb703, linewidth: 2 });
        const border = new THREE.LineSegments(borderGeom, borderMat);
        border.position.z = 0.045;
        headerGroup.add(border);

        // High-Resolution 2D Canvas for crisp typography (2048x512)
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(8, 12, 20, 0.96)';
        ctx.fillRect(0, 0, 2048, 512);

        // Technical Header Tag
        ctx.fillStyle = '#ff9d00';
        ctx.font = 'bold 44px "JetBrains Mono", monospace';
        ctx.fillText('// LEAD R&D WORKSTATION // CELL-01 // 2020-PRESENT', 64, 90);

        // Name
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 160px "Inter", sans-serif';
        ctx.fillText('GUNA', 64, 270);

        // Subtitle
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 52px "JetBrains Mono", monospace';
        ctx.fillText('ECE · EMBEDDED SYSTEMS · ROBOTICS · APPLIED ML', 64, 380);

        // Active Status indicator
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 38px "JetBrains Mono", monospace';
        ctx.fillText('● STATUS: ACTIVE R&D // LAB ENVIRONMENT ONLINE', 64, 455);

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;

        const textGeom = new THREE.PlaneGeometry(6.4, 1.15);
        const textMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
        const textMesh = new THREE.Mesh(textGeom, textMat);
        textMesh.position.z = 0.05;
        headerGroup.add(textMesh);

        this.group.add(headerGroup);
    }

    /**
     * Create Engineering Philosophy Marquee Banner
     * ENGINEER → DESIGN → PROTOTYPE → TEST → ANALYZE → BUILD
     * @private
     */
    _initPhilosophyMarquee() {
        const marqueeGroup = new THREE.Group();
        marqueeGroup.position.set(0, 3.65, 0.35);

        const backGeom = new THREE.BoxGeometry(9.6, 0.45, 0.04);
        const backMesh = new THREE.Mesh(backGeom, this.materials.get('instrumentChassis'));
        marqueeGroup.add(backMesh);

        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#060a12';
        ctx.fillRect(0, 0, 2048, 128);

        ctx.strokeStyle = 'rgba(255, 157, 0, 0.35)';
        ctx.lineWidth = 3;
        ctx.strokeRect(4, 4, 2040, 120);

        // Philosophy Flow
        const words = ['ENGINEER', 'DESIGN', 'PROTOTYPE', 'TEST', 'ANALYZE', 'BUILD'];
        ctx.font = 'bold 36px "JetBrains Mono", monospace';
        let curX = 64;

        words.forEach((w, i) => {
            ctx.fillStyle = '#ffffff';
            ctx.fillText(w, curX, 78);
            curX += ctx.measureText(w).width + 24;

            if (i < words.length - 1) {
                ctx.fillStyle = '#ff9d00';
                ctx.fillText('→', curX, 78);
                curX += ctx.measureText('→').width + 24;
            }
        });

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;

        const textMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(9.4, 0.42),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true })
        );
        textMesh.position.z = 0.025;
        marqueeGroup.add(textMesh);

        this.group.add(marqueeGroup);
    }

    /**
     * Create 4 Engineering Discipline Modules (Robotics, Embedded, IoT, Applied ML)
     * @private
     */
    _initDisciplineBadges() {
        const disciplines = [
            { label: 'ROBOTICS & KINEMATICS', sub: '6-DOF IK · Harmonic Drives · Servos', x: -4.8, y: 2.7, color: '#ff9d00' },
            { label: 'EMBEDDED SYSTEMS', sub: 'ARM Cortex-M7 · FreeRTOS · CAN 2.0B', x: -1.6, y: 2.7, color: '#38bdf8' },
            { label: 'IOT & SENSOR NETWORKS', sub: 'Low-Latency Bus · RF Telemetry · I2C', x: 1.6, y: 2.7, color: '#10b981' },
            { label: 'APPLIED ML & VISION', sub: 'Edge Inference · Optical Calibration', x: 4.8, y: 2.7, color: '#a78bfa' }
        ];

        disciplines.forEach(d => {
            const cardGroup = new THREE.Group();
            cardGroup.position.set(d.x, d.y, 0.35);

            // Card Chassis
            const cardGeom = new THREE.BoxGeometry(2.8, 0.85, 0.06);
            const cardMesh = new THREE.Mesh(cardGeom, this.materials.get('instrumentChassis'));
            cardGroup.add(cardMesh);

            // Card Canvas (1024x320 for ultra-sharp typography)
            const cardCanvas = document.createElement('canvas');
            cardCanvas.width = 1024;
            cardCanvas.height = 320;
            const cCtx = cardCanvas.getContext('2d');

            cCtx.fillStyle = '#080c14';
            cCtx.fillRect(0, 0, 1024, 320);

            // Accent Left Stripe
            cCtx.fillStyle = d.color;
            cCtx.fillRect(0, 0, 16, 320);

            // Title
            cCtx.fillStyle = '#ffffff';
            cCtx.font = 'bold 52px "JetBrains Mono", monospace';
            cCtx.fillText(d.label, 56, 110);

            // Subtitle
            cCtx.fillStyle = '#94a3b8';
            cCtx.font = '40px "JetBrains Mono", monospace';
            cCtx.fillText(d.sub, 56, 210);

            const cardTex = new THREE.CanvasTexture(cardCanvas);
            cardTex.minFilter = THREE.LinearFilter;

            const textMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(2.7, 0.80),
                new THREE.MeshBasicMaterial({ map: cardTex, transparent: true })
            );
            textMesh.position.z = 0.035;
            cardGroup.add(textMesh);

            this.group.add(cardGroup);
        });
    }

    /**
     * Create live animated system architecture & schematic display
     * @private
     */
    _initSchematicDisplay() {
        const displayGroup = new THREE.Group();
        displayGroup.position.set(0, 1.15, 0.35);

        // Frame Chassis
        const frameGeom = new THREE.BoxGeometry(5.6, 1.6, 0.08);
        const frameMesh = new THREE.Mesh(frameGeom, this.materials.get('instrumentChassis'));
        displayGroup.add(frameMesh);

        // Live Schematic CRT Canvas (1024x512)
        this.schematicCanvas = document.createElement('canvas');
        this.schematicCanvas.width = 1024;
        this.schematicCanvas.height = 512;
        this.schematicContext = this.schematicCanvas.getContext('2d');

        this.schematicTexture = new THREE.CanvasTexture(this.schematicCanvas);
        this.schematicTexture.minFilter = THREE.LinearFilter;

        const screenGeom = new THREE.PlaneGeometry(5.4, 1.45);
        const screenMat = new THREE.MeshBasicMaterial({ map: this.schematicTexture, transparent: false });
        const screenMesh = new THREE.Mesh(screenGeom, screenMat);
        screenMesh.position.z = 0.045;
        displayGroup.add(screenMesh);

        this.group.add(displayGroup);
    }

    /**
     * Create physical component storage cabinets & hardware shelves on the wall
     * @private
     */
    _initStorageAndShelving() {
        // 1. Lower Storage Cabinet (y = -1.2, width = 14m)
        const cabGeom = new THREE.BoxGeometry(14, 1.2, 0.6);
        const cabMesh = new THREE.Mesh(cabGeom, this.materials.get('instrumentChassis'));
        cabMesh.position.set(0, -1.3, 0.4);
        cabMesh.castShadow = true;
        this.group.add(cabMesh);

        // Cabinet Handles
        const handleGeom = new THREE.BoxGeometry(0.8, 0.04, 0.04);
        const handleMat = this.materials.get('brushedSteel');
        [-4.5, -1.5, 1.5, 4.5].forEach(hx => {
            const h = new THREE.Mesh(handleGeom, handleMat);
            h.position.set(hx, -1.1, 0.72);
            this.group.add(h);
        });

        // 2. Upper Component Storage Bins (Left and Right)
        const binShelfGeom = new THREE.BoxGeometry(2.4, 0.05, 0.35);
        const binShelfMat = this.materials.get('structuralSteel');

        [-7.2, 7.2].forEach(sx => {
            for (let sy = 0.2; sy <= 2.2; sy += 0.6) {
                const shelf = new THREE.Mesh(binShelfGeom, binShelfMat);
                shelf.position.set(sx, sy, 0.3);
                this.group.add(shelf);

                // Small plastic hardware bins on shelf
                const binBoxGeom = new THREE.BoxGeometry(0.32, 0.22, 0.28);
                const binMat = this.materials.get('instrumentDial');
                for (let bx = -0.9; bx <= 0.9; bx += 0.45) {
                    const bin = new THREE.Mesh(binBoxGeom, binMat);
                    bin.position.set(sx + bx, sy + 0.12, 0.3);
                    this.group.add(bin);
                }
            }
        });
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
     * Per-frame animation update: render live system schematic telemetry
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        this.time += deltaTime;

        if (this.schematicContext && this.schematicTexture) {
            const ctx = this.schematicContext;
            const w = this.schematicCanvas.width;
            const h = this.schematicCanvas.height;

            ctx.fillStyle = '#060a12';
            ctx.fillRect(0, 0, w, h);

            // Technical Grid Lines
            ctx.strokeStyle = '#0e1826';
            ctx.lineWidth = 1.5;
            for (let x = 0; x < w; x += 64) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
            }
            for (let y = 0; y < h; y += 64) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
            }

            // Header Tag
            ctx.fillStyle = '#ff9d00';
            ctx.font = 'bold 24px "JetBrains Mono", monospace';
            ctx.fillText('SYSTEM BUS TOPOLOGY // REAL-TIME KINEMATICS & SENSOR STREAM', 28, 48);

            // Animated Bus Signal Nodes
            const nodes = [
                { name: 'MAIN_CORE (M7 @ 480MHz)', x: 140, y: 150 },
                { name: 'IK_SOLVER (60Hz CONV)', x: 420, y: 150 },
                { name: 'CAN_BUS 2.0B (1Mbps)', x: 700, y: 150 },
                { name: 'SERVO_ARRAY (HARMONIC)', x: 920, y: 150 },
                { name: 'IMU_FUSION (1kHz I2C)', x: 260, y: 340 },
                { name: 'TCP_CALIBRATION (FIDUCIAL)', x: 780, y: 340 }
            ];

            ctx.strokeStyle = 'rgba(255, 157, 0, 0.45)';
            ctx.lineWidth = 3;

            // Connect lines
            ctx.beginPath();
            ctx.moveTo(140, 150); ctx.lineTo(420, 150); ctx.lineTo(700, 150); ctx.lineTo(920, 150);
            ctx.moveTo(420, 150); ctx.lineTo(260, 340);
            ctx.moveTo(700, 150); ctx.lineTo(780, 340);
            ctx.stroke();

            // Animated pulse packets traveling along bus lines
            const pulse = (this.time * 240) % 800;
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(140 + (pulse % 780), 150, 7, 0, Math.PI * 2);
            ctx.fill();

            // Draw Node Boxes
            nodes.forEach(n => {
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(n.x - 90, n.y - 32, 180, 64);
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.strokeRect(n.x - 90, n.y - 32, 180, 64);

                ctx.fillStyle = '#e2e8f0';
                ctx.font = 'bold 15px "JetBrains Mono", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(n.name, n.x, n.y + 6);
            });
            ctx.textAlign = 'left';

            // Footer Status
            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 22px "JetBrains Mono", monospace';
            ctx.fillText('● RTOS SCHEDULER: RUNNING [0 ERRORS] // BUS LOAD: 24.6% // DMA: ACTIVE', 28, 475);

            this.schematicTexture.needsUpdate = true;
        }
    }
}
