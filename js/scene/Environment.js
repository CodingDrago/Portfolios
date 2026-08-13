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
        this._initAmbientParticles();
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

        // Work-Cell Boundary Markings (Amber boundary frame around robot platform)
        const boundaryWidth = 5.5;
        const boundaryDepth = 5.5;
        const thickness = 0.08;

        const lineGeomH = new THREE.PlaneGeometry(boundaryWidth, thickness);
        const lineGeomV = new THREE.PlaneGeometry(thickness, boundaryDepth);
        const markMat = this.materials.get('cellMarkings');

        // Front & Back markings
        const markNorth = new THREE.Mesh(lineGeomH, markMat);
        markNorth.rotation.x = -Math.PI / 2;
        markNorth.position.set(0, -1.98, -2.75);

        const markSouth = new THREE.Mesh(lineGeomH, markMat);
        markSouth.rotation.x = -Math.PI / 2;
        markSouth.position.set(0, -1.98, 2.75);

        // Left & Right markings
        const markEast = new THREE.Mesh(lineGeomV, markMat);
        markEast.rotation.x = -Math.PI / 2;
        markEast.position.set(2.75, -1.98, 0);

        const markWest = new THREE.Mesh(lineGeomV, markMat);
        markWest.rotation.x = -Math.PI / 2;
        markWest.position.set(-2.75, -1.98, 0);

        this.midgroundGroup.add(markNorth, markSouth, markEast, markWest);
    }

    /**
     * Create Background Graphite Wall Panels (z = -12.0)
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

        // Recessed Modular Wall Panels (3x2 Grid)
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
     * Create Sparse Ambient Dust Depth Particles
     * @private
     */
    _initAmbientParticles() {
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);

        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3 + 0] = (Math.random() - 0.5) * 16;
            positions[i * 3 + 1] = Math.random() * 8 - 1;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
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

        // 2. Restrained Pointer Parallax Depth Movement (Distant Background Only)
        if (pointer) {
            // Distant Background Wall Layer Only (Extremely subtle depth offset)
            const targetBgX = pointer.smoothX * 0.08;
            const targetBgY = pointer.smoothY * 0.05;
            this.backgroundGroup.position.x += (targetBgX - this.backgroundGroup.position.x) * 0.04;
            this.backgroundGroup.position.y += (targetBgY - this.backgroundGroup.position.y) * 0.04;

            // Midground Floor & Workstation Geometry remain 100% stationary
            this.midgroundGroup.position.set(0, 0, 0);
        }
    }
}
