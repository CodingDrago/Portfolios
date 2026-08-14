/**
 * Gripper - 3-Finger Industrial Mechanical End-Effector
 * Features 3 articulated fingers spaced symmetrically at 120° around the tool axis,
 * pointing forward along the tool axis and closing toward a central grasping origin.
 */

import * as THREE from 'three';

export class Gripper {
    /**
     * @param {Object} materials RobotMaterials instance
     */
    constructor(materials) {
        this.mat = materials;
        this.group = new THREE.Group();
        this.group.name = 'GripperAssembly';

        // Gripper States: 'OPEN', 'READY', 'CLOSED'
        this.state = 'OPEN';
        this.fingerAngle = 0.35; // Open angle in radians
        this.targetFingerAngle = 0.35;
        this.fingerNodes = [];

        this._initGripper();
    }

    /**
     * Construct 3-finger mechanical end effector
     * @private
     */
    _initGripper() {
        // 1. Tool Flange Base Plate (Mounts to J6 Roll flange)
        const baseGeom = new THREE.CylinderGeometry(0.18, 0.22, 0.1, 16);
        const baseMesh = new THREE.Mesh(baseGeom, this.mat.get('darkTitanium'));
        baseMesh.position.y = 0.05;
        baseMesh.castShadow = true;
        this.group.add(baseMesh);

        // 2. Central Actuator Housing Box
        const actuatorGeom = new THREE.CylinderGeometry(0.14, 0.16, 0.16, 12);
        const actuatorMesh = new THREE.Mesh(actuatorGeom, this.mat.get('jointGraphite'));
        actuatorMesh.position.y = 0.18;
        actuatorMesh.castShadow = true;
        this.group.add(actuatorMesh);

        // 3. Status LED Ring around Gripper Base
        const ledRingGeom = new THREE.TorusGeometry(0.15, 0.015, 8, 24);
        ledRingGeom.rotateX(Math.PI / 2);
        const ledRingMesh = new THREE.Mesh(ledRingGeom, this.mat.get('indicatorAmber'));
        ledRingMesh.position.y = 0.26;
        this.group.add(ledRingMesh);

        // 4. Construct 3 Articulated Fingers at 120° Intervals
        const fingerRadius = 0.12;
        const fingerLength = 0.45;

        for (let i = 0; i < 3; i++) {
            const radialAngle = (i / 3) * Math.PI * 2;

            // Finger Root Pivot Group (positioned on radial perimeter, facing outward)
            const pivotGroup = new THREE.Group();
            pivotGroup.name = `FingerPivot_${i}`;
            pivotGroup.position.set(
                Math.cos(radialAngle) * fingerRadius,
                0.26,
                Math.sin(radialAngle) * fingerRadius
            );
            pivotGroup.rotation.y = radialAngle;

            // Proximal Finger Linkage
            const proxGeom = new THREE.BoxGeometry(0.04, fingerLength * 0.5, 0.06);
            const proxMesh = new THREE.Mesh(proxGeom, this.mat.get('chassisWhite'));
            proxMesh.position.set(0, fingerLength * 0.25, 0.02);
            proxMesh.castShadow = true;
            pivotGroup.add(proxMesh);

            // Distal Gripping Finger Pad (angled inward toward central grasping axis)
            const distGeom = new THREE.BoxGeometry(0.035, fingerLength * 0.55, 0.05);
            const distMesh = new THREE.Mesh(distGeom, this.mat.get('brushedMetal'));
            distMesh.position.set(0, fingerLength * 0.65, -0.02);
            distMesh.rotation.x = -0.3; // Inward angle facing center
            distMesh.castShadow = true;
            pivotGroup.add(distMesh);

            // Rubberized Contact Grip Tip
            const tipGeom = new THREE.BoxGeometry(0.04, 0.12, 0.03);
            const tipMesh = new THREE.Mesh(tipGeom, this.mat.get('conduitRubber'));
            tipMesh.position.set(0, fingerLength * 0.88, -0.045);
            pivotGroup.add(tipMesh);

            this.group.add(pivotGroup);
            this.fingerNodes.push(pivotGroup);
        }
    }

    /**
     * Set target grasping state
     * @param {'OPEN'|'READY'|'CLOSED'} newState 
     */
    setState(newState) {
        this.state = newState;
        switch (newState) {
            case 'OPEN':
                this.targetFingerAngle = 0.4;
                break;
            case 'READY':
                this.targetFingerAngle = 0.2;
                break;
            case 'CLOSED':
                this.targetFingerAngle = -0.15;
                break;
        }
    }

    /**
     * Smoothly update finger articulation angle
     * @param {number} deltaTime Time elapsed in seconds
     */
    update(deltaTime) {
        if (Math.abs(this.fingerAngle - this.targetFingerAngle) > 0.001) {
            this.fingerAngle += (this.targetFingerAngle - this.fingerAngle) * Math.min(deltaTime * 8.0, 1.0);
            
            // Apply opening/closing rotation to each finger pivot
            for (let i = 0; i < this.fingerNodes.length; i++) {
                this.fingerNodes[i].rotation.x = this.fingerAngle;
            }
        }
    }
}
