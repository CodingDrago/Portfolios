/**
 * SpatialInterfaces - Futuristic Spatial Computing & Holographic Telemetry Layer
 * Constructs floating translucent engineering schematics, embedded architecture diagrams,
 * dynamic kinematic telemetry panels, workcell polar/Cartesian targeting grids,
 * and 3D spatial coordinate compass.
 */

import * as THREE from 'three';

export class SpatialInterfaces {
    constructor(materials) {
        this.materials = materials;
        this.group = new THREE.Group();
        this.group.name = 'SpatialInterfacesGroup';

        // Animation Time & State
        this.time = 0;

        // Kinematic Hologram Panel References
        this.kinCanvas = null;
        this.kinContext = null;
        this.kinTexture = null;
        this.kinPanelMesh = null;

        // Embedded Architecture Hologram References
        this.embedCanvas = null;
        this.embedContext = null;
        this.embedTexture = null;
        this.embedPanelMesh = null;

        // Projected Floor Grid
        this.projectedGridMesh = null;

        this._initKinematicHologram();
        this._initEmbeddedArchitectureHologram();
        this._initWorkcellTargetingGrid();
        this._initSpatialCoordinateCompass();
    }

    /**
     * Build Upper Right Floating Kinematic Telemetry Hologram
     * @private
     */
    _initKinematicHologram() {
        const panelGroup = new THREE.Group();
        panelGroup.name = 'KinematicHoloPanel';
        panelGroup.position.set(2.8, 1.7, -2.4);
        panelGroup.rotation.y = -0.26; // Angled 15° toward viewer

        // 1. Smoked Translucent Glass Backplane (1.7 x 1.15)
        const glassGeom = new THREE.PlaneGeometry(1.7, 1.15);
        const glassMesh = new THREE.Mesh(glassGeom, this.materials.get('smokedGlassHolo'));
        panelGroup.add(glassMesh);

        // 2. Crisp Amber Holographic Border Frame
        const wireGeom = new THREE.EdgesGeometry(glassGeom);
        const wireMesh = new THREE.LineSegments(wireGeom, this.materials.get('holoLineAmber'));
        panelGroup.add(wireMesh);

        // 3. Dynamic HTML5 Canvas Texture for Kinematic Data (512x340 resolution)
        this.kinCanvas = document.createElement('canvas');
        this.kinCanvas.width = 512;
        this.kinCanvas.height = 340;
        this.kinContext = this.kinCanvas.getContext('2d');

        this.kinTexture = new THREE.CanvasTexture(this.kinCanvas);
        this.kinTexture.minFilter = THREE.LinearFilter;

        const dataMat = new THREE.MeshBasicMaterial({
            map: this.kinTexture,
            transparent: true,
            opacity: 0.92,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const dataMesh = new THREE.Mesh(glassGeom, dataMat);
        dataMesh.position.z = 0.005;
        panelGroup.add(dataMesh);

        // 4. Fine Spatial Connector Line to Robot Base/Shoulder
        const lineGeom = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -0.58, 0),
            new THREE.Vector3(-1.0, -1.8, 1.2)
        ]);
        const lineMesh = new THREE.Line(lineGeom, this.materials.get('holoLineAmber'));
        panelGroup.add(lineMesh);

        this.kinPanelMesh = panelGroup;
        this.group.add(panelGroup);
    }

    /**
     * Build Upper Left Floating Embedded Systems Circuit Architecture Hologram
     * @private
     */
    _initEmbeddedArchitectureHologram() {
        const panelGroup = new THREE.Group();
        panelGroup.name = 'EmbeddedArchitectureHolo';
        panelGroup.position.set(-2.8, 1.7, -2.4);
        panelGroup.rotation.y = 0.26; // Angled 15° toward viewer

        // 1. Smoked Translucent Glass Backplane (1.7 x 1.15)
        const glassGeom = new THREE.PlaneGeometry(1.7, 1.15);
        const glassMesh = new THREE.Mesh(glassGeom, this.materials.get('smokedGlassHolo'));
        panelGroup.add(glassMesh);

        // 2. Crisp Amber Holographic Border Frame
        const wireGeom = new THREE.EdgesGeometry(glassGeom);
        const wireMesh = new THREE.LineSegments(wireGeom, this.materials.get('holoLineAmber'));
        panelGroup.add(wireMesh);

        // 3. Dynamic HTML5 Canvas Texture for Embedded Block Diagram (512x340)
        this.embedCanvas = document.createElement('canvas');
        this.embedCanvas.width = 512;
        this.embedCanvas.height = 340;
        this.embedContext = this.embedCanvas.getContext('2d');

        this.embedTexture = new THREE.CanvasTexture(this.embedCanvas);
        this.embedTexture.minFilter = THREE.LinearFilter;

        const dataMat = new THREE.MeshBasicMaterial({
            map: this.embedTexture,
            transparent: true,
            opacity: 0.92,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const dataMesh = new THREE.Mesh(glassGeom, dataMat);
        dataMesh.position.z = 0.005;
        panelGroup.add(dataMesh);

        // 4. Fine Spatial Connector Line to Electronics Bench MCU
        const lineGeom = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -0.58, 0),
            new THREE.Vector3(0.0, -1.8, 0.6)
        ]);
        const lineMesh = new THREE.Line(lineGeom, this.materials.get('holoLineAmber'));
        panelGroup.add(lineMesh);

        this.embedPanelMesh = panelGroup;
        this.group.add(panelGroup);
    }

    /**
     * Build Workcell Polar/Cartesian Targeting Grid Projected on Floor
     * @private
     */
    _initWorkcellTargetingGrid() {
        const gridGroup = new THREE.Group();
        gridGroup.name = 'WorkcellTargetingGrid';
        gridGroup.position.set(0, -1.97, 0); // Flat on floor plane

        // Concentric Holographic Range Rings (r = 1.4, 2.4, 3.4)
        const ringRadii = [1.4, 2.4, 3.4];
        const ringMat = this.materials.get('holoLineAmber');

        ringRadii.forEach((radius, idx) => {
            const ringGeom = new THREE.RingGeometry(radius - 0.008, radius + 0.008, 64);
            ringGeom.rotateX(-Math.PI / 2);
            const ringMesh = new THREE.Mesh(ringGeom, new THREE.MeshBasicMaterial({
                color: 0xff9d00,
                transparent: true,
                opacity: 0.25 - idx * 0.05,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            }));
            gridGroup.add(ringMesh);
        });

        // Radial Quadrant Azimuth Lines (0°, 90°, 180°, 270°)
        const lineGeom = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-3.5, 0, 0),
            new THREE.Vector3(3.5, 0, 0),
            new THREE.Vector3(0, 0, -3.5),
            new THREE.Vector3(0, 0, 3.5)
        ]);
        const crossMesh = new THREE.LineSegments(lineGeom, ringMat);
        gridGroup.add(crossMesh);

        this.projectedGridMesh = gridGroup;
        this.group.add(gridGroup);
    }

    /**
     * Build 3D Spatial Coordinate Compass Triad near Robot Mounting Base
     * @private
     */
    _initSpatialCoordinateCompass() {
        const compassGroup = new THREE.Group();
        compassGroup.name = 'SpatialCompass';
        compassGroup.position.set(-1.8, -1.42, 1.4);

        // Subtle XYZ Axis Lines (Length 0.3)
        const axisX = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.3, 0, 0)]),
            new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 })
        );
        const axisY = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.3, 0)]),
            new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 })
        );
        const axisZ = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0.3)]),
            new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 })
        );

        compassGroup.add(axisX, axisY, axisZ);
        this.group.add(compassGroup);
    }

    /**
     * Add entire spatial interfaces subsystem to target scene
     * @param {THREE.Scene} scene 
     */
    addToScene(scene) {
        if (scene) {
            scene.add(this.group);
        }
    }

    /**
     * Per-frame animation update:
     * - Refreshes live joint angles and kinematic telemetry
     * - Animates embedded architecture signal flow pulses
     * - Updates floating hover breathing
     * @param {number} deltaTime 
     * @param {Object} robotController 
     * @param {Object} pointerTracker 
     */
    update(deltaTime, robotController, pointerTracker) {
        this.time += deltaTime;

        // 1. Subtle Floating Hover Breathing Motion
        const hoverOffset = Math.sin(this.time * 1.4) * 0.025;
        if (this.kinPanelMesh) this.kinPanelMesh.position.y = 1.7 + hoverOffset;
        if (this.embedPanelMesh) this.embedPanelMesh.position.y = 1.7 - hoverOffset;

        // 2. Render Live Kinematic Telemetry Hologram
        if (this.kinContext && this.kinTexture) {
            const ctx = this.kinContext;
            ctx.clearRect(0, 0, 512, 340);

            // Subtle Background Scan Matrix
            ctx.fillStyle = 'rgba(8, 14, 22, 0.75)';
            ctx.fillRect(0, 0, 512, 340);

            // Header Banner
            ctx.fillStyle = '#ff9d00';
            ctx.font = 'bold 16px monospace';
            ctx.fillText('SYS.KINEMATICS // 6-DOF TELEMETRY', 20, 32);

            ctx.strokeStyle = '#ff9d00';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(20, 42);
            ctx.lineTo(492, 42);
            ctx.stroke();

            // Extract Live Angles from RobotController if available
            let j1 = 0, j2 = 0, j3 = 0, j4 = 0, j5 = 0, j6 = 0;
            if (robotController && robotController.arm) {
                const j1Node = robotController.arm.getJoint('J1');
                const j2Node = robotController.arm.getJoint('J2');
                const j3Node = robotController.arm.getJoint('J3');
                const j4Node = robotController.arm.getJoint('J4');
                const j5Node = robotController.arm.getJoint('J5');
                const j6Node = robotController.arm.getJoint('J6');

                if (j1Node) j1 = THREE.MathUtils.radToDeg(j1Node.currentAngle);
                if (j2Node) j2 = THREE.MathUtils.radToDeg(j2Node.currentAngle);
                if (j3Node) j3 = THREE.MathUtils.radToDeg(j3Node.currentAngle);
                if (j4Node) j4 = THREE.MathUtils.radToDeg(j4Node.currentAngle);
                if (j5Node) j5 = THREE.MathUtils.radToDeg(j5Node.currentAngle);
                if (j6Node) j6 = THREE.MathUtils.radToDeg(j6Node.currentAngle);
            }

            // Kinematic Tree List
            const joints = [
                ['J1 BASE YAW', `${j1.toFixed(1)}°`, '±160° RANGE'],
                ['J2 SHOULDER', `${j2.toFixed(1)}°`, 'LAW OF COSINES'],
                ['J3 ELBOW PITCH', `${j3.toFixed(1)}°`, 'PLANAR FLEX'],
                ['J4 WRIST ROLL', `${j4.toFixed(1)}°`, 'COAXIAL SYNC'],
                ['J5 WRIST PITCH', `${j5.toFixed(1)}°`, 'TOOL LOCK'],
                ['J6 TOOL ROLL', `${j6.toFixed(1)}°`, 'TCP FLANGE']
            ];

            ctx.font = '13px monospace';
            joints.forEach((j, i) => {
                const y = 74 + i * 34;

                // Node marker
                ctx.fillStyle = '#ff9d00';
                ctx.fillRect(24, y - 10, 6, 6);

                ctx.fillStyle = '#e2e8f0';
                ctx.fillText(j[0], 38, y - 4);

                ctx.fillStyle = '#ff9d00';
                ctx.fillText(j[1], 200, y - 4);

                ctx.fillStyle = '#64748b';
                ctx.fillText(j[2], 310, y - 4);
            });

            // Footer Status
            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 12px monospace';
            ctx.fillText('IK SOLVER: ACTIVE [CONVERGED 60Hz]', 24, 305);

            ctx.fillStyle = '#ff9d00';
            const px = pointerTracker ? pointerTracker.normalizedX.toFixed(2) : '0.00';
            const py = pointerTracker ? pointerTracker.normalizedY.toFixed(2) : '0.00';
            ctx.fillText(`TARGET NDC: [X:${px}, Y:${py}]`, 280, 305);

            this.kinTexture.needsUpdate = true;
        }

        // 3. Render Embedded Architecture Hologram
        if (this.embedContext && this.embedTexture) {
            const ctx = this.embedContext;
            ctx.clearRect(0, 0, 512, 340);

            // Background
            ctx.fillStyle = 'rgba(8, 14, 22, 0.75)';
            ctx.fillRect(0, 0, 512, 340);

            // Header Banner
            ctx.fillStyle = '#ff9d00';
            ctx.font = 'bold 16px monospace';
            ctx.fillText('EMBEDDED ARCHITECTURE // CORE-01', 20, 32);

            ctx.strokeStyle = '#ff9d00';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(20, 42);
            ctx.lineTo(492, 42);
            ctx.stroke();

            // Block Diagram Visuals
            const blocks = [
                { name: 'HOST I/O', sub: 'WEBGL / NDC', x: 30, y: 70, w: 100, h: 48 },
                { name: 'MCU CORE', sub: 'CORTEX-M7', x: 190, y: 70, w: 120, h: 48 },
                { name: 'ACTUATORS', sub: '6x SERVO BUS', x: 370, y: 70, w: 110, h: 48 }
            ];

            // Draw Block Boxes
            blocks.forEach(b => {
                ctx.strokeStyle = '#ff9d00';
                ctx.fillStyle = '#101620';
                ctx.fillRect(b.x, b.y, b.w, b.h);
                ctx.strokeRect(b.x, b.y, b.w, b.h);

                ctx.fillStyle = '#e2e8f0';
                ctx.font = 'bold 12px monospace';
                ctx.fillText(b.name, b.x + 12, b.y + 20);

                ctx.fillStyle = '#64748b';
                ctx.font = '10px monospace';
                ctx.fillText(b.sub, b.x + 12, b.y + 36);
            });

            // Draw Connecting Data Arrows
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;

            // Arrow 1: HOST -> MCU (SPI)
            ctx.beginPath();
            ctx.moveTo(130, 94);
            ctx.lineTo(190, 94);
            ctx.stroke();

            // Arrow 2: MCU -> ACTUATORS (CAN)
            ctx.beginPath();
            ctx.moveTo(310, 94);
            ctx.lineTo(370, 94);
            ctx.stroke();

            // Animated Signal Pulses traversing arrows
            const pulsePos1 = 130 + ((this.time * 80) % 60);
            ctx.fillStyle = '#ff9d00';
            ctx.beginPath();
            ctx.arc(pulsePos1, 94, 3, 0, Math.PI * 2);
            ctx.fill();

            const pulsePos2 = 310 + ((this.time * 80) % 60);
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(pulsePos2, 94, 3, 0, Math.PI * 2);
            ctx.fill();

            // Sensor Bus Telemetry Readouts
            ctx.fillStyle = '#e2e8f0';
            ctx.font = '13px monospace';
            ctx.fillText('BUS STATUS & TELEMETRY:', 24, 160);

            const tele = [
                ['I2C BUS [0x68]:', '6-AXIS IMU STREAM', '1000 Hz [OK]'],
                ['SPI BUS [0x01]:', 'OPTICAL ENCODER', '4096 CPR [OK]'],
                ['CAN 2.0B [1Mbps]:', '6-NODE MOTOR DRIVE', '14.2% BUS LOAD'],
                ['V_BUS / CURRENT:', '24.00 V / 03.50 A', 'REGULATED'],
                ['CORE TEMP / CLK:', '32.4°C / 480 MHz', 'OPTIMAL']
            ];

            tele.forEach((t, i) => {
                const y = 188 + i * 24;
                ctx.fillStyle = '#ff9d00';
                ctx.fillText(t[0], 24, y);

                ctx.fillStyle = '#e2e8f0';
                ctx.fillText(t[1], 180, y);

                ctx.fillStyle = '#10b981';
                ctx.fillText(t[2], 360, y);
            });

            this.embedTexture.needsUpdate = true;
        }

        // 4. Subtle Ambient Pulsing of Projected Floor Grid
        if (this.projectedGridMesh) {
            const gridOpacity = 0.20 + Math.sin(this.time * 2.0) * 0.06;
            this.projectedGridMesh.children.forEach(child => {
                if (child.material) child.material.opacity = gridOpacity;
            });
        }
    }
}
