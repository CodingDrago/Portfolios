/**
 * MountingPlatform - Central Robot Mounting Base Assembly
 * Dedicated 3D industrial mounting platform positioned at origin (0, -2.0, 0)
 * Prepared with mounting flange, hex bolts, and cable ports to receive the Phase 3 Robotic Arm.
 */

import * as THREE from 'three';

export class MountingPlatform {
    constructor(materials) {
        this.materials = materials;
        this.group = new THREE.Group();
        this.group.name = 'MountingPlatformGroup';

        this._initPlatform();
    }

    /**
     * Construct 3D mechanical mounting assembly
     * Solid machined industrial base with zero hollow cavities
     * @private
     */
    _initPlatform() {
        // Base origin y = -2.0 (aligned with floor plane)
        this.group.position.set(0, -2.0, 0);

        // 1. Primary Heavy Base Ring (Solid Octagonal stepped footing, y = 0 to 0.24)
        const baseGeom = new THREE.CylinderGeometry(1.85, 2.05, 0.24, 8);
        const baseMesh = new THREE.Mesh(baseGeom, this.materials.get('mountingPlatform'));
        baseMesh.position.y = 0.12;
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;
        this.group.add(baseMesh);

        // 2. Solid Intermediate Machined Riser Block (y = 0.24 to 0.40)
        const riserGeom = new THREE.CylinderGeometry(1.50, 1.65, 0.16, 16);
        const riserMesh = new THREE.Mesh(riserGeom, this.materials.get('mountingPlatform'));
        riserMesh.position.y = 0.32;
        riserMesh.castShadow = true;
        riserMesh.receiveShadow = true;
        this.group.add(riserMesh);

        // 3. Heavy Rotary Mounting Turret Ring (y = 0.40 to 0.52)
        const flangeGeom = new THREE.CylinderGeometry(1.20, 1.30, 0.12, 24);
        const flangeMesh = new THREE.Mesh(flangeGeom, this.materials.get('mountingFlange'));
        flangeMesh.position.y = 0.46;
        flangeMesh.castShadow = true;
        flangeMesh.receiveShadow = true;
        this.group.add(flangeMesh);

        // 4. Solid Top Machined Mounting Interface Disc (Top surface at exact y = 0.52, world y = -1.48)
        const topPlateGeom = new THREE.CylinderGeometry(0.88, 0.88, 0.04, 32);
        const topPlateMesh = new THREE.Mesh(topPlateGeom, this.materials.get('mountingFlange'));
        topPlateMesh.position.y = 0.50;
        topPlateMesh.castShadow = true;
        topPlateMesh.receiveShadow = true;
        this.group.add(topPlateMesh);

        // Solid Mechanical Gasket Ring (Closed dark titanium seam at interface)
        const gasketGeom = new THREE.CylinderGeometry(0.89, 0.89, 0.015, 32);
        const gasketMesh = new THREE.Mesh(gasketGeom, this.materials.get('mechanicalGap'));
        gasketMesh.position.y = 0.515;
        this.group.add(gasketMesh);

        // 5. Perimeter Industrial Hex-Bolts (8 heavy fasteners on Level 3 flange)
        const boltGeom = new THREE.CylinderGeometry(0.045, 0.045, 0.07, 6);
        const boltMat = this.materials.get('brushedSteel');
        const boltRadius = 1.05;

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const boltMesh = new THREE.Mesh(boltGeom, boltMat);
            boltMesh.position.set(
                Math.cos(angle) * boltRadius,
                0.53,
                Math.sin(angle) * boltRadius
            );
            boltMesh.rotation.y = angle;
            boltMesh.castShadow = true;
            this.group.add(boltMesh);
        }

        // Inner Mounting Interface Anchor Studs (8 precision studs on top plate at radius 0.76)
        const studGeom = new THREE.CylinderGeometry(0.022, 0.022, 0.03, 6);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + (Math.PI / 8);
            const studMesh = new THREE.Mesh(studGeom, boltMat);
            studMesh.position.set(
                Math.cos(angle) * 0.76,
                0.525,
                Math.sin(angle) * 0.76
            );
            studMesh.castShadow = true;
            this.group.add(studMesh);
        }

        // 6. Rear Cable Conduit Transition (Cleanly integrated into rear base step)
        const conduitPortGeom = new THREE.CylinderGeometry(0.16, 0.18, 0.20, 12);
        const conduitPortMesh = new THREE.Mesh(conduitPortGeom, this.materials.get('conduitPipe'));
        conduitPortMesh.position.set(0, 0.22, -1.25);
        conduitPortMesh.castShadow = true;
        this.group.add(conduitPortMesh);
    }

    /**
     * Add platform group to target scene
     * @param {THREE.Scene} scene 
     */
    addToScene(scene) {
        if (scene) {
            scene.add(this.group);
        }
    }
}
