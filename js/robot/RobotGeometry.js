/**
 * RobotGeometry - Procedural 3D Mechanical Geometry Builder
 * Constructs engineered industrial meshes for base, shoulder yoke, upper arm,
 * elbow, forearm, wrist mechanism, and 3-finger end-effector gripper.
 */

import * as THREE from 'three';

export class RobotGeometry {
    constructor(materials) {
        this.mat = materials;
    }

    /**
     * Build Rotary Base Assembly
     * Sits ON top of Phase 2 mounting platform surface
     * @returns {THREE.Group}
     */
    buildBase() {
        const group = new THREE.Group();
        group.name = 'BaseAssembly';

        // 1. Lower Stationary Mounting Ring (attaches directly to platform cavity)
        const mountRingGeom = new THREE.CylinderGeometry(0.8, 0.85, 0.12, 16);
        const mountRingMesh = new THREE.Mesh(mountRingGeom, this.mat.get('darkTitanium'));
        mountRingMesh.position.y = 0.06;
        mountRingMesh.castShadow = true;
        mountRingMesh.receiveShadow = true;
        group.add(mountRingMesh);

        // 2. Primary Base Rotary Housing (Off-white chamfered cylinder)
        const bodyGeom = new THREE.CylinderGeometry(0.72, 0.78, 0.45, 16);
        const bodyMesh = new THREE.Mesh(bodyGeom, this.mat.get('chassisWhite'));
        bodyMesh.position.y = 0.325;
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        group.add(bodyMesh);

        // 3. Lower Metallic Bearing Seam
        const seamGeom = new THREE.CylinderGeometry(0.74, 0.74, 0.05, 16);
        const seamMesh = new THREE.Mesh(seamGeom, this.mat.get('jointGraphite'));
        seamMesh.position.y = 0.145;
        seamMesh.castShadow = true;
        group.add(seamMesh);

        // 4. Amber Technical Accent Ring
        const ringGeom = new THREE.CylinderGeometry(0.73, 0.73, 0.03, 16);
        const ringMesh = new THREE.Mesh(ringGeom, this.mat.get('amberAccent'));
        ringMesh.position.y = 0.52;
        group.add(ringMesh);

        // 5. Base Perimeter Hex Bolts (6 perimeter bolts)
        const boltGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6);
        const boltMat = this.mat.get('brushedMetal');
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const bolt = new THREE.Mesh(boltGeom, boltMat);
            bolt.position.set(Math.cos(angle) * 0.65, 0.56, Math.sin(angle) * 0.65);
            bolt.castShadow = true;
            group.add(bolt);
        }

        return group;
    }

    /**
     * Build Shoulder Yoke Assembly (Dual side housing mounting Shoulder Joint J2)
     * @returns {THREE.Group}
     */
    buildShoulderYoke() {
        const group = new THREE.Group();
        group.name = 'ShoulderYoke';

        // 1. Heavy Central Turret Platform
        const turretGeom = new THREE.CylinderGeometry(0.65, 0.7, 0.3, 16);
        const turretMesh = new THREE.Mesh(turretGeom, this.mat.get('jointGraphite'));
        turretMesh.position.y = 0.15;
        turretMesh.castShadow = true;
        group.add(turretMesh);

        // 2. Dual Vertical Support Pillars (Left and Right Yoke arms)
        const pillarGeom = new THREE.BoxGeometry(0.24, 0.75, 0.55);
        const pillarMat = this.mat.get('chassisWhite');

        // Left Support Arm
        const leftPillar = new THREE.Mesh(pillarGeom, pillarMat);
        leftPillar.position.set(-0.35, 0.55, 0);
        leftPillar.castShadow = true;

        // Right Support Arm
        const rightPillar = new THREE.Mesh(pillarGeom, pillarMat);
        rightPillar.position.set(0.35, 0.55, 0);
        rightPillar.castShadow = true;

        group.add(leftPillar, rightPillar);

        // 3. Side Motor Housing Caps (Dark Titanium circles on joint axis)
        const capGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.08, 16);
        capGeom.rotateZ(Math.PI / 2);
        const capMat = this.mat.get('darkTitanium');

        const leftCap = new THREE.Mesh(capGeom, capMat);
        leftCap.position.set(-0.48, 0.75, 0);
        leftCap.castShadow = true;

        const rightCap = new THREE.Mesh(capGeom, capMat);
        rightCap.position.set(0.48, 0.75, 0);
        rightCap.castShadow = true;

        group.add(leftCap, rightCap);

        return group;
    }

    /**
     * Build Upper Arm Linkage Geometry (Length approx 1.8 units)
     * @returns {THREE.Group}
     */
    buildUpperArm() {
        const group = new THREE.Group();
        group.name = 'UpperArmMesh';

        // 1. Primary Structural Arm Body (Extends along +Y axis by 1.8 units)
        const length = 1.8;
        const armGeom = new THREE.BoxGeometry(0.38, length, 0.42);
        const armMesh = new THREE.Mesh(armGeom, this.mat.get('chassisWhite'));
        armMesh.position.y = length / 2;
        armMesh.castShadow = true;
        armMesh.receiveShadow = true;
        group.add(armMesh);

        // 2. Recessed Side Graphite Panels
        const panelGeom = new THREE.BoxGeometry(0.4, length * 0.7, 0.28);
        const panelMesh = new THREE.Mesh(panelGeom, this.mat.get('jointGraphite'));
        panelMesh.position.y = length / 2;
        panelMesh.castShadow = true;
        group.add(panelMesh);

        // 3. Reinforcement Steel Ribs & Pivot End Rings
        const ribGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.44, 16);
        ribGeom.rotateZ(Math.PI / 2);
        const ribMat = this.mat.get('darkTitanium');

        // Lower Pivot Housing (at J2 Shoulder)
        const lowerPivot = new THREE.Mesh(ribGeom, ribMat);
        lowerPivot.position.y = 0;
        lowerPivot.castShadow = true;

        // Upper Pivot Housing (at J3 Elbow)
        const upperPivot = new THREE.Mesh(ribGeom, ribMat);
        upperPivot.position.y = length;
        upperPivot.castShadow = true;

        group.add(lowerPivot, upperPivot);

        return group;
    }

    /**
     * Build Elbow Joint Housing Assembly
     * @returns {THREE.Group}
     */
    buildElbowHousing() {
        const group = new THREE.Group();
        group.name = 'ElbowHousing';

        // Rotary Joint Cylinder
        const cylGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.5, 16);
        cylGeom.rotateZ(Math.PI / 2);
        const cylMesh = new THREE.Mesh(cylGeom, this.mat.get('jointGraphite'));
        cylMesh.castShadow = true;
        group.add(cylMesh);

        // End Cap Detailing
        const capGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.54, 16);
        capGeom.rotateZ(Math.PI / 2);
        const capMesh = new THREE.Mesh(capGeom, this.mat.get('brushedMetal'));
        capMesh.castShadow = true;
        group.add(capMesh);

        return group;
    }

    /**
     * Build Forearm Linkage Geometry (Length approx 1.6 units)
     * @returns {THREE.Group}
     */
    buildForearm() {
        const group = new THREE.Group();
        group.name = 'ForearmMesh';

        const length = 1.6;
        // 1. Tapered Main Forearm Body
        const armGeom = new THREE.CylinderGeometry(0.18, 0.26, length, 12);
        const armMesh = new THREE.Mesh(armGeom, this.mat.get('chassisWhite'));
        armMesh.position.y = length / 2;
        armMesh.castShadow = true;
        armMesh.receiveShadow = true;
        group.add(armMesh);

        // 2. Linear Metallic Guide Seam
        const seamGeom = new THREE.BoxGeometry(0.3, length * 0.85, 0.12);
        const seamMesh = new THREE.Mesh(seamGeom, this.mat.get('darkTitanium'));
        seamMesh.position.y = length / 2;
        seamMesh.castShadow = true;
        group.add(seamMesh);

        // 3. Cable Conduit Attachment Loops
        const ringGeom = new THREE.TorusGeometry(0.22, 0.03, 8, 16);
        ringGeom.rotateX(Math.PI / 2);
        const ringMat = this.mat.get('conduitRubber');

        const ring1 = new THREE.Mesh(ringGeom, ringMat);
        ring1.position.y = length * 0.3;

        const ring2 = new THREE.Mesh(ringGeom, ringMat);
        ring2.position.y = length * 0.7;

        group.add(ring1, ring2);

        return group;
    }

    /**
     * Build 3-Axis Compact Wrist Assembly (J4 Roll, J5 Pitch, J6 Roll)
     * @returns {THREE.Group}
     */
    buildWrist() {
        const group = new THREE.Group();
        group.name = 'WristAssembly';

        // 1. Wrist Base Collar
        const collarGeom = new THREE.CylinderGeometry(0.18, 0.2, 0.2, 16);
        const collarMesh = new THREE.Mesh(collarGeom, this.mat.get('jointGraphite'));
        collarMesh.position.y = 0.1;
        collarMesh.castShadow = true;
        group.add(collarMesh);

        // 2. Wrist Articulation Pitch Yoke
        const yokeGeom = new THREE.BoxGeometry(0.28, 0.28, 0.24);
        const yokeMesh = new THREE.Mesh(yokeGeom, this.mat.get('chassisWhite'));
        yokeMesh.position.y = 0.32;
        yokeMesh.castShadow = true;
        group.add(yokeMesh);

        // 3. Tool Mounting Flange (J6 Roll Interface)
        const flangeGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.1, 16);
        const flangeMesh = new THREE.Mesh(flangeGeom, this.mat.get('darkTitanium'));
        flangeMesh.position.y = 0.48;
        flangeMesh.castShadow = true;
        group.add(flangeMesh);

        return group;
    }
}
