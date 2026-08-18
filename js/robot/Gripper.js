/**
 * Gripper - 3-Finger Industrial Mechanical End-Effector
 * Features 3 articulated fingers spaced symmetrically at 120° around the tool axis,
 * pointing forward along the tool axis and closing toward a central grasping origin.
 * Built with alternating warm titanium, dark titanium, brushed steel, and rubber grips.
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
        const baseGeom = new THREE.CylinderGeometry(0.24, 0.28, 0.12, 16);
        const baseMesh = new THREE.Mesh(baseGeom, this.mat.get('jointHousing'));
        baseMesh.position.y = 0.06;
        baseMesh.castShadow = true;
        this.group.add(baseMesh);

        // 2. Central Actuator Housing Box
        const actuatorGeom = new THREE.CylinderGeometry(0.19, 0.22, 0.20, 16);
        const actuatorMesh = new THREE.Mesh(actuatorGeom, this.mat.get('titaniumPivot'));
        actuatorMesh.position.y = 0.20;
        actuatorMesh.castShadow = true;
        this.group.add(actuatorMesh);

        // 3. Status LED Ring around Gripper Base
        const ledRingGeom = new THREE.TorusGeometry(0.20, 0.02, 8, 24);
        ledRingGeom.rotateX(Math.PI / 2);
        const ledRingMesh = new THREE.Mesh(ledRingGeom, this.mat.get('indicatorAmber'));
        ledRingMesh.position.y = 0.30;
        this.group.add(ledRingMesh);

        // 4. Construct 3 Articulated Fingers at 120° Intervals (Scaled with distinct mechanical separation)
        const fingerRadius = 0.18;

        for (let i = 0; i < 3; i++) {
            const radialAngle = (i / 3) * Math.PI * 2;

            // Finger Root Pivot Group (positioned on radial perimeter, facing outward)
            const pivotGroup = new THREE.Group();
            pivotGroup.name = `FingerPivot_${i}`;
            pivotGroup.position.set(
                Math.cos(radialAngle) * fingerRadius,
                0.30,
                Math.sin(radialAngle) * fingerRadius
            );
            pivotGroup.rotation.y = radialAngle;

            // A. Base Knuckle Clevis Mount (Cast Gunmetal bracket anchored to actuator)
            const clevisGeom = new THREE.BoxGeometry(0.062, 0.06, 0.06);
            const clevisMesh = new THREE.Mesh(clevisGeom, this.mat.get('jointHousing'));
            clevisMesh.position.set(0, 0.03, 0);
            clevisMesh.castShadow = true;
            pivotGroup.add(clevisMesh);

            // B. Transverse Knuckle Pivot Pin (Polished Brushed Steel)
            const pinGeom = new THREE.CylinderGeometry(0.016, 0.016, 0.082, 12);
            pinGeom.rotateZ(Math.PI / 2);
            const pinMesh = new THREE.Mesh(pinGeom, this.mat.get('brushedSteel'));
            pinMesh.position.set(0, 0.035, 0);
            pivotGroup.add(pinMesh);

            // C. Proximal Finger Linkage (Warm Titanium Casing)
            const proxGeom = new THREE.BoxGeometry(0.046, 0.20, 0.055);
            const proxMesh = new THREE.Mesh(proxGeom, this.mat.get('chassisPrimary'));
            proxMesh.position.set(0, 0.15, 0.012);
            proxMesh.castShadow = true;
            pivotGroup.add(proxMesh);

            // D. Mid-Knuckle Articulation Bushing & Shadow Washers
            const midBushingGeom = new THREE.CylinderGeometry(0.014, 0.014, 0.054, 12);
            midBushingGeom.rotateZ(Math.PI / 2);
            const midBushing = new THREE.Mesh(midBushingGeom, this.mat.get('brushedSteel'));
            midBushing.position.set(0, 0.26, 0.005);
            pivotGroup.add(midBushing);

            const washerGeom = new THREE.CylinderGeometry(0.018, 0.018, 0.060, 12);
            washerGeom.rotateZ(Math.PI / 2);
            const washerMesh = new THREE.Mesh(washerGeom, this.mat.get('mechanicalGap'));
            washerMesh.position.set(0, 0.26, 0.005);
            pivotGroup.add(washerMesh);

            // E. Distal Gripping Claw Finger Link (Brushed Steel Core, Angled Inward)
            const distGeom = new THREE.BoxGeometry(0.038, 0.24, 0.042);
            const distMesh = new THREE.Mesh(distGeom, this.mat.get('brushedSteel'));
            distMesh.position.set(0, 0.38, -0.024);
            distMesh.rotation.x = -0.32; // Inward angle facing tool axis
            distMesh.castShadow = true;
            pivotGroup.add(distMesh);

            // F. Inner Rubberized Contact Grip Pad (Matte Black Rubber on contact face)
            const tipGeom = new THREE.BoxGeometry(0.040, 0.14, 0.018);
            const tipMesh = new THREE.Mesh(tipGeom, this.mat.get('conduitRubber'));
            tipMesh.position.set(0, 0.49, -0.050);
            pivotGroup.add(tipMesh);

            this.group.add(pivotGroup);
            this.fingerNodes.push(pivotGroup);
        }

        // 5. Dedicated Tool Center Point (TCP) Object3D situated between the grasping claw tips
        this.tcp = new THREE.Object3D();
        this.tcp.name = 'ToolCenterPoint_TCP';
        this.tcp.position.set(0, 0.82, 0); // Positioned at the fingertip grasping plane along tool axis
        this.group.add(this.tcp);
    }

    /**
     * Get world position of the actual claw tip TCP
     * @param {THREE.Vector3} [targetVec]
     * @returns {THREE.Vector3}
     */
    getTCPWorldPosition(targetVec = new THREE.Vector3()) {
        if (this.tcp) {
            this.tcp.getWorldPosition(targetVec);
        }
        return targetVec;
    }

    /**
     * Set target grasping state
     * @param {'OPEN'|'READY'|'CLOSED'} newState 
     */
    setState(newState) {
        this.state = newState;
        switch (newState) {
            case 'OPEN':
                this.targetFingerAngle = 0.42;
                break;
            case 'READY':
                this.targetFingerAngle = 0.22;
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
