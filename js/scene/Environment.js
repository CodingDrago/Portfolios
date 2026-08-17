/**
 * Environment - 3D Industrial Workstation Environment & Parallax Subsystem
 * Constructs 3D floor plates, work-cell markings, graphite wall panels,
 * structural columns, cable trays, ambient dust particles, and pointer parallax depth.
 */

import * as THREE from 'three';

export class Environment {
    constructor(materials) {
        this.materials = materials;

        // Group Hierarchy for Parallax Depth Separation
        this.backgroundGroup = new THREE.Group();
        this.midgroundGroup = new THREE.Group();
        this.particlesGroup = new THREE.Group();

        this.backgroundGroup.name = 'EnvBackgroundGroup';
        this.midgroundGroup.name = 'EnvMidgroundGroup';

        this.particlePositions = null;
        this.particleCount = 40;

        this._initFloor();
        this._initBackgroundWall();
        this._initStructuralColumns();
        this._initCableConduits();
        this._initOverheadGantry();
        this._initAmbientParticles();
    }

    /**
     * Create Overhead Structural Lighting Gantry & Task Fixtures (360 completeness)
     * @private
     */
    _initOverheadGantry() {
        const gantryGroup = new THREE.Group();
        gantryGroup.name = 'OverheadGantry';

        // Longitudinal Aluminum Extrusion Rails (x = ±3.5, y = 5.2)
        const railGeom = new THREE.BoxGeometry(0.12, 0.12, 12);
        const railMat = this.materials.get('structuralSteel');

        const leftRail = new THREE.Mesh(railGeom, railMat);
        leftRail.position.set(-3.5, 5.2, -3);
        const rightRail = new THREE.Mesh(railGeom, railMat);
        rightRail.position.set(3.5, 5.2, -3);
        gantryGroup.add(leftRail, rightRail);

        // Transverse Cross Spanners
        const spanGeom = new THREE.BoxGeometry(7.12, 0.10, 0.10);
        for (let z = -7; z <= 1; z += 4) {
            const span = new THREE.Mesh(spanGeom, railMat);
            span.position.set(0, 5.2, z);
            gantryGroup.add(span);
        }

        // Suspended Cylindrical Downlight Fixtures
        const lampGeom = new THREE.CylinderGeometry(0.08, 0.12, 0.20, 12);
        const lampMat = this.materials.get('instrumentChassis');
        const lensMat = this.materials.get('ledAmber');

        const lampPositions = [
            [-3.5, 5.0, -2.4],
            [3.5, 5.0, -2.4],
            [0.0, 5.0, -4.5]
        ];

        lampPositions.forEach(([lx, ly, lz]) => {
            const lamp = new THREE.Mesh(lampGeom, lampMat);
            lamp.position.set(lx, ly, lz);
            const lens = new THREE.Mesh(new THREE.CircleGeometry(0.10, 12), lensMat);
            lens.rotation.x = Math.PI / 2;
            lens.position.set(0, -0.101, 0);
            lamp.add(lens);
            gantryGroup.add(lamp);
        });

        this.backgroundGroup.add(gantryGroup);
    }

    /**
     * Create 3D Floor Plane & Work-Cell Boundary Markings
     * @private
     */
    _initFloor() {
        // Main Floor Plane (y = -2.0)
        const floorWidth = 24;
        const floorDepth = 18;
        const floorGeom = new THREE.PlaneGeometry(floorWidth, floorDepth);

        const floorMesh = new THREE.Mesh(floorGeom, this.materials.get('floorPlates'));
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.position.set(0, -2.0, -3);
        floorMesh.receiveShadow = true;

        this.midgroundGroup.add(floorMesh);

        // Modular Floor Plate Seam Grid Lines
        const gridHelper = new THREE.GridHelper(24, 12, 0x161a22, 0x12151c);
        gridHelper.position.set(0, -1.99, -3);
        this.midgroundGroup.add(gridHelper);

        // Work-Cell Boundary Markings (Continuous 90-degree square perimeter frame)
        const CELL_MIN_X = -2.8;
        const CELL_MAX_X = 2.8;
        const CELL_MIN_Z = -2.8;
        const CELL_MAX_Z = 2.8;
        const lineThickness = 0.06;

        // Create single continuous square ribbon frame with clean mitered corners
        const frameShape = new THREE.Shape();
        // Outer loop (clockwise)
        frameShape.moveTo(CELL_MIN_X - lineThickness / 2, CELL_MIN_Z - lineThickness / 2);
        frameShape.lineTo(CELL_MAX_X + lineThickness / 2, CELL_MIN_Z - lineThickness / 2);
        frameShape.lineTo(CELL_MAX_X + lineThickness / 2, CELL_MAX_Z + lineThickness / 2);
        frameShape.lineTo(CELL_MIN_X - lineThickness / 2, CELL_MAX_Z + lineThickness / 2);
        frameShape.closePath();

        // Inner hole (counter-clockwise)
        const frameHole = new THREE.Path();
        frameHole.moveTo(CELL_MIN_X + lineThickness / 2, CELL_MIN_Z + lineThickness / 2);
        frameHole.lineTo(CELL_MAX_X - lineThickness / 2, CELL_MIN_Z + lineThickness / 2);
        frameHole.lineTo(CELL_MAX_X - lineThickness / 2, CELL_MAX_Z - lineThickness / 2);
        frameHole.lineTo(CELL_MIN_X + lineThickness / 2, CELL_MAX_Z - lineThickness / 2);
        frameHole.closePath();
        frameShape.holes.push(frameHole);

        const frameGeom = new THREE.ShapeGeometry(frameShape);
        const frameMesh = new THREE.Mesh(frameGeom, this.materials.get('cellMarkings'));
        frameMesh.rotation.x = -Math.PI / 2;
        frameMesh.position.y = -1.98;
        this.midgroundGroup.add(frameMesh);
    }

    /**
     * Create Background Graphite Wall Panels with Modular R&D Laboratory Architecture (z = -12.0)
     * @private
     */
    _initBackgroundWall() {
        const wallWidth = 28;
        const wallHeight = 16;
        const wallDepthZ = -12.0;

        // Main Wall Backplane
        const wallGeom = new THREE.PlaneGeometry(wallWidth, wallHeight);
        const wallMesh = new THREE.Mesh(wallGeom, this.materials.get('graphiteWall'));
        wallMesh.position.set(0, 4, wallDepthZ);
        wallMesh.receiveShadow = true;
        this.backgroundGroup.add(wallMesh);

        // Recessed Modular Architectural Panels (3x2 Grid)
        const panelGeom = new THREE.BoxGeometry(7.5, 5.5, 0.2);
        const panelMat = this.materials.get('graphiteWall');

        for (let row = 0; row < 2; row++) {
            for (let col = -1; col <= 1; col++) {
                const panel = new THREE.Mesh(panelGeom, panelMat);
                panel.position.set(col * 8.2, row * 6.5 + 1.2, wallDepthZ + 0.1);
                panel.receiveShadow = true;
                this.backgroundGroup.add(panel);
            }
        }

        // Horizontal Aluminum Equipment Mounting T-Slot Rails
        const railGeom = new THREE.BoxGeometry(24, 0.08, 0.08);
        const railMat = this.materials.get('brushedSteel');

        const rail1 = new THREE.Mesh(railGeom, railMat);
        rail1.position.set(0, 5.2, wallDepthZ + 0.25);
        const rail2 = new THREE.Mesh(railGeom, railMat);
        rail2.position.set(0, 1.8, wallDepthZ + 0.25);
        this.backgroundGroup.add(rail1, rail2);

        // Secondary Wall-Mounted Diagnostics Monitors
        this._initWallMonitors(wallDepthZ);
    }

    /**
     * Construct Secondary Wall-Mounted Diagnostics Displays
     * @private
     * @param {number} wallDepthZ 
     */
    _initWallMonitors(wallDepthZ) {
        const monitorPositions = [
            [-6.8, 3.8, wallDepthZ + 0.28, 0.18],
            [6.8, 3.8, wallDepthZ + 0.28, -0.18]
        ];

        monitorPositions.forEach(([mx, my, mz, rotY], idx) => {
            const monGroup = new THREE.Group();
            monGroup.position.set(mx, my, mz);
            monGroup.rotation.y = rotY;

            // Frame
            const frameGeom = new THREE.BoxGeometry(2.4, 1.5, 0.08);
            const frameMesh = new THREE.Mesh(frameGeom, this.materials.get('instrumentChassis'));
            monGroup.add(frameMesh);

            // Screen Canvas
            const monCanvas = document.createElement('canvas');
            monCanvas.width = 256;
            monCanvas.height = 160;
            const mCtx = monCanvas.getContext('2d');
            mCtx.fillStyle = '#060a10';
            mCtx.fillRect(0, 0, 256, 160);

            mCtx.fillStyle = '#ff9d00';
            mCtx.font = 'bold 13px monospace';
            mCtx.fillText(idx === 0 ? 'SYSTEM POWER // BUS-01' : 'ENVIRONMENT // R&D-LAB', 14, 28);

            mCtx.strokeStyle = '#1e293b';
            mCtx.lineWidth = 1;
            mCtx.strokeRect(14, 40, 228, 100);

            mCtx.fillStyle = '#94a3b8';
            mCtx.font = '11px monospace';
            if (idx === 0) {
                mCtx.fillText('STATUS: ONLINE [NOMINAL]', 22, 64);
                mCtx.fillText('MAIN SUPPLY: 24.0V DC', 22, 86);
                mCtx.fillText('LOGIC SUPPLY: 3.3V / 5.0V', 22, 108);
                mCtx.fillText('EFFICIENCY: 94.6%', 22, 130);
            } else {
                mCtx.fillText('AMBIENT TEMP: 22.4°C', 22, 64);
                mCtx.fillText('PRESSURE: 1013.2 hPa', 22, 86);
                mCtx.fillText('MCU LOAD: 12.4%', 22, 108);
                mCtx.fillText('CALIBRATION: PASSED', 22, 130);
            }

            const monTex = new THREE.CanvasTexture(monCanvas);
            const screenGeom = new THREE.PlaneGeometry(2.2, 1.3);
            const screenMat = new THREE.MeshBasicMaterial({ map: monTex });
            const screenMesh = new THREE.Mesh(screenGeom, screenMat);
            screenMesh.position.z = 0.042;
            monGroup.add(screenMesh);

            this.backgroundGroup.add(monGroup);
        });
    }

    /**
     * Create Structural Steel I-Beams & Frame Columns
     * @private
     */
    _initStructuralColumns() {
        const columnGeom = new THREE.BoxGeometry(0.8, 16, 0.8);
        const colMat = this.materials.get('structuralSteel');

        // Left Column
        const leftCol = new THREE.Mesh(columnGeom, colMat);
        leftCol.position.set(-8.5, 4, -11.5);
        leftCol.castShadow = true;
        leftCol.receiveShadow = true;

        // Right Column
        const rightCol = new THREE.Mesh(columnGeom, colMat);
        rightCol.position.set(8.5, 4, -11.5);
        rightCol.castShadow = true;
        rightCol.receiveShadow = true;

        // Top Horizontal Crossbeam
        const beamGeom = new THREE.BoxGeometry(18, 0.8, 0.8);
        const topBeam = new THREE.Mesh(beamGeom, colMat);
        topBeam.position.set(0, 10.5, -11.5);
        topBeam.castShadow = true;

        this.backgroundGroup.add(leftCol, rightCol, topBeam);
    }

    /**
     * Create Horizontal Cable Conduits & Equipment Trays
     * @private
     */
    _initCableConduits() {
        const pipeGeom = new THREE.CylinderGeometry(0.12, 0.12, 22, 12);
        const pipeMat = this.materials.get('conduitPipe');

        // Top Conduit Run
        const pipe1 = new THREE.Mesh(pipeGeom, pipeMat);
        pipe1.rotation.z = Math.PI / 2;
        pipe1.position.set(0, 7.5, -11.3);

        // Lower Conduit Run
        const pipe2 = new THREE.Mesh(pipeGeom, pipeMat);
        pipe2.rotation.z = Math.PI / 2;
        pipe2.position.set(0, 2.5, -11.3);

        this.backgroundGroup.add(pipe1, pipe2);
    }

    /**
     * Create Sparse Ambient Dust Depth Particles (outside robot mounting cell)
     * @private
     */
    _initAmbientParticles() {
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);

        for (let i = 0; i < this.particleCount; i++) {
            let px, pz;
            do {
                px = (Math.random() - 0.5) * 16;
                pz = (Math.random() - 0.5) * 12 - 2;
            } while (Math.sqrt(px * px + pz * pz) < 2.5); // Clear immediate robot workspace radius

            positions[i * 3 + 0] = px;
            positions[i * 3 + 1] = Math.random() * 8 - 1;
            positions[i * 3 + 2] = pz;
        }

        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particlePositions = positions;

        const mat = new THREE.PointsMaterial({
            color: 0xffb703,
            size: 0.04,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending
        });

        const particleSystem = new THREE.Points(geom, mat);
        this.particlesGroup.add(particleSystem);
    }

    /**
     * Add environment layers to target scene
     * @param {THREE.Scene} scene 
     */
    addToScene(scene) {
        if (!scene) return;
        scene.add(this.backgroundGroup);
        scene.add(this.midgroundGroup);
        scene.add(this.particlesGroup);
    }

    /**
     * Update subtle particle animation and pointer parallax depth
     * @param {number} deltaTime Time elapsed since last frame
     * @param {Object} pointer PointerTracker instance
     */
    update(deltaTime, pointer) {
        // 1. Subtle Ambient Particle Drift
        if (this.particlePositions) {
            for (let i = 0; i < this.particleCount; i++) {
                const yIdx = i * 3 + 1;
                this.particlePositions[yIdx] += deltaTime * 0.08;
                if (this.particlePositions[yIdx] > 7) {
                    this.particlePositions[yIdx] = -2;
                }
            }
            this.particlesGroup.children[0].geometry.attributes.position.needsUpdate = true;
        }

        // 2. All Environment Meshes remain 100% stationary in world space.
        // True 3D perspective depth is driven via camera micro-parallax in SceneManager.
        this.backgroundGroup.position.set(0, 0, 0);
        this.midgroundGroup.position.set(0, 0, 0);
    }
}
