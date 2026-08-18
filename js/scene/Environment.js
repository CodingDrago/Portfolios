/**
 * Environment - 3D Futuristic Robotics R&D Laboratory Architecture & Parallax Subsystem
 * Constructs 3D floor plates, work-cell markings, complete ceiling structural gantry,
 * ventilation ducting, cable raceways, 5 physical ceiling spotlight assemblies, and ambient dust particles.
 */

import * as THREE from 'three';

export class Environment {
    constructor(materials) {
        this.materials = materials;

        // Group Hierarchy for Parallax & Rendering Order
        this.backgroundGroup = new THREE.Group();
        this.midgroundGroup = new THREE.Group();
        this.ceilingGroup = new THREE.Group();
        this.particlesGroup = new THREE.Group();

        this.backgroundGroup.name = 'EnvBackgroundGroup';
        this.midgroundGroup.name = 'EnvMidgroundGroup';
        this.ceilingGroup.name = 'EnvCeilingGroup';

        this.particlePositions = null;
        this.particleCount = 50;

        this._initFloor();
        this._initCeilingStructure();
        this._initSpotlightFixtures();
        this._initAmbientParticles();
    }

    /**
     * Create 3D Floor Plane & Work-Cell Boundary Markings (y = -2.0)
     * @private
     */
    _initFloor() {
        // Full Room Modular Floor (26 x 26)
        const floorWidth = 26;
        const floorDepth = 26;
        const floorGeom = new THREE.PlaneGeometry(floorWidth, floorDepth);

        const floorMesh = new THREE.Mesh(floorGeom, this.materials.get('floorPlates'));
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.position.set(0, -2.0, 0);
        floorMesh.receiveShadow = true;
        this.midgroundGroup.add(floorMesh);

        // Modular Floor Seam Grid Lines (26x26 with 2m grid subdivisions)
        const gridHelper = new THREE.GridHelper(26, 13, 0x181e28, 0x10141c);
        gridHelper.position.set(0, -1.99, 0);
        this.midgroundGroup.add(gridHelper);

        // Central Robot Work-Cell Boundary Markings (2.8m x 2.8m continuous amber square)
        const CELL_MIN = -2.8;
        const CELL_MAX = 2.8;
        const lineThickness = 0.06;

        const frameShape = new THREE.Shape();
        // Outer loop (clockwise)
        frameShape.moveTo(CELL_MIN - lineThickness / 2, CELL_MIN - lineThickness / 2);
        frameShape.lineTo(CELL_MAX + lineThickness / 2, CELL_MIN - lineThickness / 2);
        frameShape.lineTo(CELL_MAX + lineThickness / 2, CELL_MAX + lineThickness / 2);
        frameShape.lineTo(CELL_MIN - lineThickness / 2, CELL_MAX + lineThickness / 2);
        frameShape.closePath();

        // Inner hole (counter-clockwise)
        const frameHole = new THREE.Path();
        frameHole.moveTo(CELL_MIN + lineThickness / 2, CELL_MIN + lineThickness / 2);
        frameHole.lineTo(CELL_MAX - lineThickness / 2, CELL_MIN + lineThickness / 2);
        frameHole.lineTo(CELL_MAX - lineThickness / 2, CELL_MAX - lineThickness / 2);
        frameHole.lineTo(CELL_MIN + lineThickness / 2, CELL_MAX - lineThickness / 2);
        frameHole.closePath();
        frameShape.holes.push(frameHole);

        const frameGeom = new THREE.ShapeGeometry(frameShape);
        const frameMesh = new THREE.Mesh(frameGeom, this.materials.get('cellMarkings'));
        frameMesh.rotation.x = -Math.PI / 2;
        frameMesh.position.y = -1.98;
        this.midgroundGroup.add(frameMesh);
    }

    /**
     * Create Complete Futuristic Laboratory Ceiling Architecture (y = 7.2)
     * Structural I-Beams, Cable Trays, Ventilation Conduits, Recessed Panels
     * @private
     */
    _initCeilingStructure() {
        const ceiling = this.ceilingGroup;

        // 1. Main Ceiling Backplane Panels (y = 7.2)
        const ceilingGeom = new THREE.PlaneGeometry(26, 26);
        const ceilingMesh = new THREE.Mesh(ceilingGeom, this.materials.get('ceilingTile'));
        ceilingMesh.rotation.x = Math.PI / 2;
        ceilingMesh.position.set(0, 7.2, 0);
        ceilingMesh.receiveShadow = true;
        ceiling.add(ceilingMesh);

        // 2. Structural Steel I-Beam Cross Grid (y = 7.0)
        const beamMat = this.materials.get('structuralSteel');

        // Longitudinal Main Rails (x = ±3.5, x = ±8.5, span z = -13 to +13)
        const longBeamGeom = new THREE.BoxGeometry(0.20, 0.35, 26);
        [-8.5, -3.5, 3.5, 8.5].forEach(xPos => {
            const beam = new THREE.Mesh(longBeamGeom, beamMat);
            beam.position.set(xPos, 7.0, 0);
            beam.castShadow = true;
            ceiling.add(beam);
        });

        // Transverse Spanner Beams (z = -8, -4, 0, 4, 8, span x = -13 to +13)
        const transBeamGeom = new THREE.BoxGeometry(26, 0.25, 0.20);
        [-8, -4, 0, 4, 8].forEach(zPos => {
            const span = new THREE.Mesh(transBeamGeom, beamMat);
            span.position.set(0, 7.05, zPos);
            span.castShadow = true;
            ceiling.add(span);
        });

        // 3. Overhead HVAC Ventilation Ducts
        const ductMat = this.materials.get('conduitPipe');
        const louverMat = this.materials.get('ventilationLouver');

        // Main Longitudinal Air Duct (x = -6.0, y = 6.7, length = 24)
        const ductGeom = new THREE.CylinderGeometry(0.35, 0.35, 24, 16);
        ductGeom.rotateX(Math.PI / 2);
        const mainDuct = new THREE.Mesh(ductGeom, ductMat);
        mainDuct.position.set(-6.0, 6.7, 0);
        ceiling.add(mainDuct);

        // Ventilation Intake Louver Grilles hanging below duct
        const louverGeom = new THREE.BoxGeometry(0.70, 0.15, 0.70);
        [-6, 0, 6].forEach(zPos => {
            const louver = new THREE.Mesh(louverGeom, louverMat);
            louver.position.set(-6.0, 6.3, zPos);
            ceiling.add(louver);
        });

        // Secondary Air Duct on Right (x = +6.0)
        const ductRight = new THREE.Mesh(ductGeom, ductMat);
        ductRight.position.set(6.0, 6.7, 0);
        ceiling.add(ductRight);

        // 4. Overhead Industrial Cable Raceways (Wire Trays)
        const trayGeom = new THREE.BoxGeometry(0.40, 0.06, 24);
        const trayMat = this.materials.get('serverRack');

        const trayLeft = new THREE.Mesh(trayGeom, trayMat);
        trayLeft.position.set(-1.8, 6.85, 0);
        const trayRight = new THREE.Mesh(trayGeom, trayMat);
        trayRight.position.set(1.8, 6.85, 0);
        ceiling.add(trayLeft, trayRight);

        // Colored Power & Fiber Bundles in Cable Trays
        const cableGeom = new THREE.CylinderGeometry(0.04, 0.04, 24, 8);
        cableGeom.rotateX(Math.PI / 2);

        const cableAmber = new THREE.Mesh(cableGeom, this.materials.get('wireAmber'));
        cableAmber.position.set(-1.7, 6.9, 0);
        const cableCyan = new THREE.Mesh(cableGeom, this.materials.get('wireCyan'));
        cableCyan.position.set(-1.9, 6.9, 0);
        const cableBlack = new THREE.Mesh(cableGeom, this.materials.get('wireBlack'));
        cableBlack.position.set(1.8, 6.9, 0);
        ceiling.add(cableAmber, cableCyan, cableBlack);
    }

    /**
     * Construct 5 Physical Industrial Ceiling Spotlight Assemblies
     * Mounted at: Center, Front, Left, Right, Back
     * @private
     */
    _initSpotlightFixtures() {
        const spotGroup = new THREE.Group();
        spotGroup.name = 'CeilingSpotlightFixtures';

        const housingMat = this.materials.get('spotlightHousing');
        const lensMat = this.materials.get('spotlightLens');
        const bracketMat = this.materials.get('brushedSteel');

        // Spotlight fixture configurations: [posX, posY, posZ, rotX, rotY, rotZ]
        const fixtures = [
            // 1. Center Spotlight (Pointing straight down)
            { pos: [0, 6.8, 0], rot: [0, 0, 0] },
            // 2. Front Spotlight (Angled forward toward Front Wall)
            { pos: [0, 6.8, -3.5], rot: [-0.45, 0, 0] },
            // 3. Left Spotlight (Angled left toward Projects Wall)
            { pos: [-3.5, 6.8, 0], rot: [0, 0, 0.45] },
            // 4. Right Spotlight (Angled right toward Social Wall)
            { pos: [3.5, 6.8, 0], rot: [0, 0, -0.45] },
            // 5. Back Spotlight (Angled back toward Games Wall)
            { pos: [0, 6.8, 3.5], rot: [0.45, 0, 0] }
        ];

        fixtures.forEach(({ pos, rot }) => {
            const fixture = new THREE.Group();
            fixture.position.set(pos[0], pos[1], pos[2]);

            // A. Ceiling Mounting Base Flange
            const flangeGeom = new THREE.CylinderGeometry(0.22, 0.24, 0.08, 16);
            const flange = new THREE.Mesh(flangeGeom, bracketMat);
            flange.position.set(0, 0.25, 0);
            fixture.add(flange);

            // B. U-Shaped Swivel Yoke Bracket
            const yokeGeom = new THREE.BoxGeometry(0.06, 0.35, 0.44);
            const yoke = new THREE.Mesh(yokeGeom, bracketMat);
            yoke.position.set(0, 0.08, 0);
            fixture.add(yoke);

            // C. Rotating Lamp Housing Assembly
            const lampAssembly = new THREE.Group();
            lampAssembly.rotation.set(rot[0], rot[1], rot[2]);

            // Cylindrical Lamp Body with Heat Sink Cooling Ribs
            const bodyGeom = new THREE.CylinderGeometry(0.18, 0.24, 0.42, 16);
            const body = new THREE.Mesh(bodyGeom, housingMat);
            lampAssembly.add(body);

            // Cooling Fins
            const finGeom = new THREE.TorusGeometry(0.22, 0.015, 6, 16);
            finGeom.rotateX(Math.PI / 2);
            [-0.08, 0, 0.08].forEach(yOff => {
                const fin = new THREE.Mesh(finGeom, bracketMat);
                fin.position.y = yOff;
                lampAssembly.add(fin);
            });

            // Glowing Recessed Fresnel Lens (Emits light downwards)
            const lensGeom = new THREE.CircleGeometry(0.20, 16);
            const lens = new THREE.Mesh(lensGeom, lensMat);
            lens.rotation.x = Math.PI / 2;
            lens.position.set(0, -0.211, 0);
            lampAssembly.add(lens);

            fixture.add(lampAssembly);
            spotGroup.add(fixture);
        });

        this.ceilingGroup.add(spotGroup);
    }

    /**
     * Create Sparse Ambient Dust Depth Particles
     * @private
     */
    _initAmbientParticles() {
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);

        for (let i = 0; i < this.particleCount; i++) {
            let px, pz;
            do {
                px = (Math.random() - 0.5) * 20;
                pz = (Math.random() - 0.5) * 20;
            } while (Math.sqrt(px * px + pz * pz) < 2.5); // Clear immediate robot workspace radius

            positions[i * 3 + 0] = px;
            positions[i * 3 + 1] = Math.random() * 8 - 1;
            positions[i * 3 + 2] = pz;
        }

        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particlePositions = positions;

        const mat = new THREE.PointsMaterial({
            color: 0xffb703,
            size: 0.038,
            transparent: true,
            opacity: 0.40,
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
        scene.add(this.ceilingGroup);
        scene.add(this.particlesGroup);
    }

    /**
     * Update subtle particle animation
     * @param {number} deltaTime Time elapsed since last frame
     * @param {Object} pointer PointerTracker instance
     */
    update(deltaTime, pointer) {
        if (this.particlePositions) {
            for (let i = 0; i < this.particleCount; i++) {
                const yIdx = i * 3 + 1;
                this.particlePositions[yIdx] += deltaTime * 0.06;
                if (this.particlePositions[yIdx] > 6.8) {
                    this.particlePositions[yIdx] = -1.8;
                }
            }
            this.particlesGroup.children[0].geometry.attributes.position.needsUpdate = true;
        }
    }
}
