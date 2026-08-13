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
     * @private
     */
    _initPlatform() {
        // Base origin y = -2.0 (aligned with floor plane)
        this.group.position.set(0, -2.0, 0);

        // 1. Primary Heavy Base Ring (Octagonal stepped platform)
        const baseGeom = new THREE.CylinderGeometry(1.7, 1.9, 0.3, 8);
        const baseMesh = new THREE.Mesh(baseGeom, this.materials.get('mountingPlatform'));
        baseMesh.position.y = 0.15;
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;
        this.group.add(baseMesh);

        // 2. Secondary Rotary Mounting Flange
        const flangeGeom = new THREE.CylinderGeometry(1.25, 1.35, 0.2, 16);
        const flangeMesh = new THREE.Mesh(flangeGeom, this.materials.get('mountingFlange'));
        flangeMesh.position.y = 0.4;
        flangeMesh.castShadow = true;
        flangeMesh.receiveShadow = true;
        this.group.add(flangeMesh);

        // 3. Central Recessed Mounting Cavity (Where Phase 3 robot rotary base connects)
        const cavityGeom = new THREE.CylinderGeometry(0.85, 0.85, 0.1, 16);
        const cavityMesh = new THREE.Mesh(cavityGeom, this.materials.get('graphiteWall'));
        cavityMesh.position.y = 0.51;
        cavityMesh.receiveShadow = true;
        this.group.add(cavityMesh);

        // 4. Perimeter Industrial Hex-Bolts (8 perimeter fasteners)
        const boltGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.08, 6);
        const boltMat = this.materials.get('brushedSteel');
        const boltRadius = 1.05;

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const boltMesh = new THREE.Mesh(boltGeom, boltMat);
            boltMesh.position.set(
                Math.cos(angle) * boltRadius,
                0.52,
                Math.sin(angle) * boltRadius
            );
            boltMesh.rotation.y = angle;
            boltMesh.castShadow = true;
            this.group.add(boltMesh);
        }

        // 5. Rear Cable Conduit Entry Port
        const conduitPortGeom = new THREE.BoxGeometry(0.4, 0.2, 0.5);
        const conduitPortMesh = new THREE.Mesh(conduitPortGeom, this.materials.get('conduitPipe'));
        conduitPortMesh.position.set(0, 0.2, -1.5);
        conduitPortMesh.castShadow = true;
        this.group.add(conduitPortMesh);

        // 6. Amber Practical Power LED Indicator
        const ledGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.05, 12);
        const ledMesh = new THREE.Mesh(ledGeom, this.materials.get('indicatorAmber'));
        ledMesh.position.set(1.35, 0.32, 0);
        this.group.add(ledMesh);
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
