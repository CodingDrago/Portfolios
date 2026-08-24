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
        this.wallMesh = wallMesh;
        this.group.add(wallMesh);

        // Structural Steel Vertical Columns (x = ±8.5, x = ±3.8)
        const colGeom = new THREE.BoxGeometry(0.50, 10, 0.50);
        [-8.5, -3.8, 3.8, 8.5].forEach(xPos => {
            const col = new THREE.Mesh(colGeom, steelMat);
            col.position.set(xPos, 2.5, 0.25);
            col.castShadow = true;
            this.group.add(col);
        });

        // Horizontal Equipment Mounting T-Slot Rails (y = 0.6, 2.8, 5.2)
        // Positioned BEHIND content panels (z = 0.15) to prevent any visual intersection with text
        const railGeom = new THREE.BoxGeometry(24, 0.05, 0.05);
        [0.6, 2.8, 5.2].forEach(yPos => {
            const rail = new THREE.Mesh(railGeom, railMat);
            rail.position.set(0, yPos, 0.15);
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
        headerGroup.position.set(0, 4.95, 0.58);

        // Smoked Backing Plate with Amber Frame (7.6m x 1.45m)
        const backGeom = new THREE.PlaneGeometry(7.6, 1.45);
        const backMesh = new THREE.Mesh(backGeom, this.materials.get('holoPanel'));
        headerGroup.add(backMesh);

        const borderGeom = new THREE.EdgesGeometry(backGeom);
        const borderMat = new THREE.LineBasicMaterial({ color: 0xffb703, linewidth: 2 });
        const border = new THREE.LineSegments(borderGeom, borderMat);
        border.position.z = 0.005;
        headerGroup.add(border);

        // High-Resolution 2D Canvas for ultra-sharp typography at normal camera view (2048x512)
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(6, 10, 18, 0.20)';
        ctx.fillRect(0, 0, 2048, 512);

        // Technical Header Tag
        ctx.fillStyle = '#ff9d00';
        ctx.font = 'bold 52px "JetBrains Mono", monospace';
        ctx.fillText('// LEAD R&D WORKSTATION // CELL-01 // 2020-PRESENT', 64, 85);

        // Name
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 180px "Inter", sans-serif';
        ctx.fillText('GUNA', 64, 265);

        // Subtitle
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 64px "JetBrains Mono", monospace';
        ctx.fillText('ECE · EMBEDDED SYSTEMS · ROBOTICS · APPLIED ML', 64, 375);

        // Active Status indicator
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 44px "JetBrains Mono", monospace';
        ctx.fillText('● STATUS: ACTIVE R&D // LAB ENVIRONMENT ONLINE', 64, 455);

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;

        const textGeom = new THREE.PlaneGeometry(7.4, 1.35);
        const textMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
        const textMesh = new THREE.Mesh(textGeom, textMat);
        textMesh.position.z = 0.01;
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
        marqueeGroup.position.set(0, 3.75, 0.58);

        const backGeom = new THREE.PlaneGeometry(10.4, 0.52);
        const backMesh = new THREE.Mesh(backGeom, this.materials.get('holoPanel'));
        marqueeGroup.add(backMesh);

        const borderGeom = new THREE.EdgesGeometry(backGeom);
        const borderMat = new THREE.LineBasicMaterial({ color: 0xffb703, linewidth: 1.5 });
        const border = new THREE.LineSegments(borderGeom, borderMat);
        border.position.z = 0.005;
        marqueeGroup.add(border);

        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(6, 10, 18, 0.20)';
        ctx.fillRect(0, 0, 2048, 128);

        ctx.strokeStyle = 'rgba(255, 157, 0, 0.45)';
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, 2040, 120);

        // Philosophy Flow - Centered horizontally
        const words = ['ENGINEER', 'DESIGN', 'PROTOTYPE', 'TEST', 'ANALYZE', 'BUILD'];
        ctx.font = 'bold 50px "JetBrains Mono", monospace';

        let totalWidth = 0;
        words.forEach((w, i) => {
            totalWidth += ctx.measureText(w).width;
            if (i < words.length - 1) {
                totalWidth += ctx.measureText(' → ').width + 16;
            }
        });

        let curX = Math.max(32, Math.round((2048 - totalWidth) / 2));

        words.forEach((w, i) => {
            ctx.fillStyle = '#ffffff';
            ctx.fillText(w, curX, 82);
            curX += ctx.measureText(w).width;

            if (i < words.length - 1) {
                ctx.fillStyle = '#ff9d00';
                ctx.fillText(' → ', curX, 82);
                curX += ctx.measureText(' → ').width + 16;
            }
        });

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;

        const textMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(10.2, 0.48),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
        );
        textMesh.position.z = 0.01;
        marqueeGroup.add(textMesh);

        this.group.add(marqueeGroup);
    }

    /**
     * Create 4 Engineering Discipline Modules (Robotics, Embedded, IoT, Applied ML)
     * Realigned to fit cleanly in architectural bays between columns x = ±8.5, ±3.8
     * Scaled for high-contrast, comfortable readability at default camera distance
     * @private
     */
    _initDisciplineBadges() {
        const disciplines = [
            { label: 'ROBOTICS & KINEMATICS', sub: '6-DOF IK · Harmonic Drives · Servos', tag: '● 60Hz CONVERGENCE', x: -5.8, y: 2.45, color: '#ff9d00' },
            { label: 'EMBEDDED SYSTEMS', sub: 'ARM Cortex-M7 · FreeRTOS · CAN 2.0B', tag: '● 480MHz REAL-TIME', x: -1.95, y: 2.45, color: '#38bdf8' },
            { label: 'IOT & SENSOR NETWORKS', sub: 'Low-Latency Bus · RF Telemetry · I2C', tag: '● 1Mbps CAN / LoRa', x: 1.95, y: 2.45, color: '#10b981' },
            { label: 'APPLIED ML & VISION', sub: 'Edge Inference · Optical Calibration', tag: '● 60fps TRACKING', x: 5.8, y: 2.45, color: '#a78bfa' }
        ];

        disciplines.forEach(d => {
            const cardGroup = new THREE.Group();
            cardGroup.position.set(d.x, d.y, 0.58);

            // Card Chassis (2.8m x 1.05m)
            const cardGeom = new THREE.PlaneGeometry(2.8, 1.05);
            const cardMesh = new THREE.Mesh(cardGeom, this.materials.get('holoPanel'));
            cardGroup.add(cardMesh);

            // Card Canvas (1024x384 for crisp high-contrast typography)
            const cardCanvas = document.createElement('canvas');
            cardCanvas.width = 1024;
            cardCanvas.height = 384;
            const cCtx = cardCanvas.getContext('2d');

            cCtx.fillStyle = 'rgba(6, 10, 18, 0.20)';
            cCtx.fillRect(0, 0, 1024, 384);

            // Accent Left Stripe
            cCtx.fillStyle = d.color;
            cCtx.fillRect(0, 0, 20, 384);

            // Border
            cCtx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            cCtx.lineWidth = 3;
            cCtx.strokeRect(4, 4, 1016, 376);

            // Title
            cCtx.fillStyle = '#ffffff';
            cCtx.font = 'bold 62px "JetBrains Mono", monospace';
            cCtx.fillText(d.label, 44, 110);

            // Subtitle
            cCtx.fillStyle = '#cbd5e1';
            cCtx.font = 'bold 44px "JetBrains Mono", monospace';
            cCtx.fillText(d.sub, 44, 215);

            // Status Tag
            cCtx.fillStyle = d.color;
            cCtx.font = 'bold 38px "JetBrains Mono", monospace';
            cCtx.fillText(d.tag, 44, 310);

            const cardTex = new THREE.CanvasTexture(cardCanvas);
            cardTex.minFilter = THREE.LinearFilter;
            cardTex.magFilter = THREE.LinearFilter;

            const textMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(2.7, 0.98),
                new THREE.MeshBasicMaterial({ map: cardTex, transparent: true, depthWrite: false })
            );
            textMesh.position.z = 0.01;
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
        displayGroup.position.set(0, 0.95, 0.58);

        // Frame Chassis (5.4m x 1.60m)
        const frameGeom = new THREE.PlaneGeometry(5.4, 1.60);
        const frameMesh = new THREE.Mesh(frameGeom, this.materials.get('holoPanelCyan'));
        displayGroup.add(frameMesh);

        const borderGeom = new THREE.EdgesGeometry(frameGeom);
        const borderMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 1.5 });
        const border = new THREE.LineSegments(borderGeom, borderMat);
        border.position.z = 0.005;
        displayGroup.add(border);

        // Live Schematic CRT Canvas (1024x512)
        this.schematicCanvas = document.createElement('canvas');
        this.schematicCanvas.width = 1024;
        this.schematicCanvas.height = 512;
        this.schematicContext = this.schematicCanvas.getContext('2d');

        this.schematicTexture = new THREE.CanvasTexture(this.schematicCanvas);
        this.schematicTexture.minFilter = THREE.LinearFilter;
        this.schematicTexture.magFilter = THREE.LinearFilter;

        const screenGeom = new THREE.PlaneGeometry(5.2, 1.48);
        const screenMat = new THREE.MeshBasicMaterial({ map: this.schematicTexture, transparent: true, depthWrite: false });
        const screenMesh = new THREE.Mesh(screenGeom, screenMat);
        screenMesh.position.z = 0.01;
        displayGroup.add(screenMesh);

        this.group.add(displayGroup);
    }

    /**
     * Create Integrated Wall Service Chase & Power Distribution Raceway (Replaces arbitrary filler blocks)
     * @private
     */
    _initStorageAndShelving() {
        const racewayGroup = new THREE.Group();
        racewayGroup.position.set(0, -1.65, 0.38);

        // Main Sleek Service Chase Trunk (18.4m wide x 0.50m high x 0.22m deep)
        const trunkGeom = new THREE.BoxGeometry(18.4, 0.50, 0.22);
        const trunkMesh = new THREE.Mesh(trunkGeom, this.materials.get('instrumentChassis'));
        trunkMesh.castShadow = true;
        racewayGroup.add(trunkMesh);

        // Brushed Metal Faceplate Modules
        const plateGeom = new THREE.BoxGeometry(3.6, 0.38, 0.02);
        const plateMat = this.materials.get('brushedSteel');
        [-6.5, -2.2, 2.2, 6.5].forEach(px => {
            const plate = new THREE.Mesh(plateGeom, plateMat);
            plate.position.set(px, 0, 0.12);
            racewayGroup.add(plate);

            // Access Screws on corners
            const screwGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.01, 8);
            screwGeom.rotateX(Math.PI / 2);
            [[-1.65, -0.14], [1.65, -0.14], [-1.65, 0.14], [1.65, 0.14]].forEach(([sx, sy]) => {
                const s = new THREE.Mesh(screwGeom, this.materials.get('titaniumPivot'));
                s.position.set(px + sx, sy, 0.135);
                racewayGroup.add(s);
            });
        });

        // Laser-etched technical text strip across center of raceway
        const textCanvas = document.createElement('canvas');
        textCanvas.width = 1024;
        textCanvas.height = 96;
        const tCtx = textCanvas.getContext('2d');
        tCtx.fillStyle = '#060a12';
        tCtx.fillRect(0, 0, 1024, 96);
        tCtx.fillStyle = '#ff9d00';
        tCtx.font = 'bold 30px "JetBrains Mono", monospace';
        tCtx.fillText('MAINS POWER 400V 3Φ // AUX DC BUS 48V / 24V // CAN-FD SERVICE CHASE 01', 28, 58);

        const textTex = new THREE.CanvasTexture(textCanvas);
        textTex.minFilter = THREE.LinearFilter;
        const textMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(8.5, 0.32),
            new THREE.MeshBasicMaterial({ map: textTex, transparent: true, depthWrite: false })
        );
        textMesh.position.set(0, 0, 0.135);
        racewayGroup.add(textMesh);

        this.group.add(racewayGroup);
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

            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(6, 10, 18, 0.20)';
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
            ctx.font = 'bold 28px "JetBrains Mono", monospace';
            ctx.fillText('SYSTEM BUS TOPOLOGY // REAL-TIME KINEMATICS & SENSOR STREAM', 28, 48);

            // Animated Bus Signal Nodes
            const nodes = [
                { name: 'MAIN_CORE (M7 @ 480MHz)', x: 150, y: 150 },
                { name: 'IK_SOLVER (60Hz CONV)', x: 430, y: 150 },
                { name: 'CAN_BUS 2.0B (1Mbps)', x: 710, y: 150 },
                { name: 'SERVO_ARRAY (HARMONIC)', x: 920, y: 150 },
                { name: 'IMU_FUSION (1kHz I2C)', x: 280, y: 340 },
                { name: 'TCP_CALIBRATION (FIDUCIAL)', x: 760, y: 340 }
            ];

            ctx.strokeStyle = 'rgba(255, 157, 0, 0.45)';
            ctx.lineWidth = 3;

            // Connect lines
            ctx.beginPath();
            ctx.moveTo(150, 150); ctx.lineTo(430, 150); ctx.lineTo(710, 150); ctx.lineTo(920, 150);
            ctx.moveTo(430, 150); ctx.lineTo(280, 340);
            ctx.moveTo(710, 150); ctx.lineTo(760, 340);
            ctx.stroke();

            // Animated pulse packets traveling along bus lines
            const pulse = (this.time * 240) % 800;
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(150 + (pulse % 770), 150, 8, 0, Math.PI * 2);
            ctx.fill();

            // Draw Node Boxes
            nodes.forEach(n => {
                ctx.fillStyle = 'rgba(10, 16, 29, 0.55)';
                ctx.fillRect(n.x - 105, n.y - 36, 210, 72);
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2.5;
                ctx.strokeRect(n.x - 105, n.y - 36, 210, 72);

                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 16px "JetBrains Mono", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(n.name, n.x, n.y + 6);
            });
            ctx.textAlign = 'left';

            // Footer Status
            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 26px "JetBrains Mono", monospace';
            ctx.fillText('● RTOS SCHEDULER: RUNNING [0 ERRORS] // BUS LOAD: 24.6% // DMA: ACTIVE', 28, 475);

            this.schematicTexture.needsUpdate = true;
        }
    }
}
