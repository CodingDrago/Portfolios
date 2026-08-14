/**
 * RobotArm - 3D 6-DOF Industrial Manipulator Hierarchy Assembly
 * Assembles the complete parent-child Object3D joint hierarchy (J1–J6 + Gripper)
 * anchored directly on top of the Phase 2 MountingPlatform at origin (0, -1.48, 0).
 */

import * as THREE from 'three';
import { RobotJoint } from './RobotJoint.js';
import { RobotGeometry } from './RobotGeometry.js';
import { Gripper } from './Gripper.js';

export class RobotArm {
    /**
     * @param {Object} materials RobotMaterials instance
     */
    constructor(materials) {
        this.materials = materials;
        this.geometryBuilder = new RobotGeometry(materials);
        this.group = new THREE.Group();
        this.group.name = 'RobotArmContainer';

        // Joint Map (J1-J6)
        this.joints = new Map();

        // Subsystems
        this.gripper = null;
        this.endEffectorPoint = new THREE.Vector3();

        this._initHierarchy();
    }

    /**
     * Construct complete mechanical joint hierarchy
     * @private
     */
    _initHierarchy() {
        // Base Anchor at world (0, -1.48, 0) sitting directly ON Phase 2 mounting platform flange
        this.group.position.set(0, -1.48, 0);
        this.group.scale.set(0.82, 0.82, 0.82);

        // 1. Stationary Base Assembly
        const baseMesh = this.geometryBuilder.buildBase();
        this.group.add(baseMesh);

        // -------------------------------------------------------------
        // JOINT 1: Base Rotation (Yaw - Y axis)
        // -------------------------------------------------------------
        const j1PivotNode = new THREE.Group();
        j1PivotNode.name = 'J1_BaseYaw_Pivot';
        j1PivotNode.position.set(0, 0.55, 0);
        this.group.add(j1PivotNode);

        const j1Joint = new RobotJoint({
            name: 'J1_BaseYaw',
            axis: new THREE.Vector3(0, 1, 0),
            minAngle: THREE.MathUtils.degToRad(-160),
            maxAngle: THREE.MathUtils.degToRad(160),
            initialAngle: 0,
            speed: 4.5
        });
        j1Joint.attachPivotNode(j1PivotNode);
        this.joints.set('J1', j1Joint);

        // Add Shoulder Yoke Mesh to J1 Pivot
        const shoulderYokeMesh = this.geometryBuilder.buildShoulderYoke();
        j1PivotNode.add(shoulderYokeMesh);

        // -------------------------------------------------------------
        // JOINT 2: Shoulder Pitch (Pitch - Z axis)
        // -------------------------------------------------------------
        const j2PivotNode = new THREE.Group();
        j2PivotNode.name = 'J2_ShoulderPitch_Pivot';
        j2PivotNode.position.set(0, 0.75, 0);
        j1PivotNode.add(j2PivotNode);

        const j2Joint = new RobotJoint({
            name: 'J2_ShoulderPitch',
            axis: new THREE.Vector3(0, 0, 1),
            minAngle: THREE.MathUtils.degToRad(-45),
            maxAngle: THREE.MathUtils.degToRad(75),
            initialAngle: THREE.MathUtils.degToRad(25),
            speed: 4.0
        });
        j2Joint.attachPivotNode(j2PivotNode);
        this.joints.set('J2', j2Joint);

        // Add Upper Arm Mesh to J2 Pivot
        const upperArmMesh = this.geometryBuilder.buildUpperArm();
        j2PivotNode.add(upperArmMesh);

        // -------------------------------------------------------------
        // JOINT 3: Elbow Pitch (Pitch - Z axis at upper arm tip y = 1.8)
        // -------------------------------------------------------------
        const j3PivotNode = new THREE.Group();
        j3PivotNode.name = 'J3_ElbowPitch_Pivot';
        j3PivotNode.position.set(0, 1.8, 0);
        j2PivotNode.add(j3PivotNode);

        const j3Joint = new RobotJoint({
            name: 'J3_ElbowPitch',
            axis: new THREE.Vector3(0, 0, 1),
            minAngle: THREE.MathUtils.degToRad(-110),
            maxAngle: THREE.MathUtils.degToRad(20),
            initialAngle: THREE.MathUtils.degToRad(-45),
            speed: 4.0
        });
        j3Joint.attachPivotNode(j3PivotNode);
        this.joints.set('J3', j3Joint);

        // Add Elbow Housing Mesh to J3 Pivot
        const elbowHousingMesh = this.geometryBuilder.buildElbowHousing();
        j3PivotNode.add(elbowHousingMesh);

        // Add Forearm Mesh to J3 Pivot
        const forearmMesh = this.geometryBuilder.buildForearm();
        j3PivotNode.add(forearmMesh);

        // -------------------------------------------------------------
        // JOINT 4: Wrist Roll (Roll - Y axis at forearm tip y = 1.6)
        // -------------------------------------------------------------
        const j4PivotNode = new THREE.Group();
        j4PivotNode.name = 'J4_WristRoll_Pivot';
        j4PivotNode.position.set(0, 1.6, 0);
        j3PivotNode.add(j4PivotNode);

        const j4Joint = new RobotJoint({
            name: 'J4_WristRoll',
            axis: new THREE.Vector3(0, 1, 0),
            minAngle: THREE.MathUtils.degToRad(-180),
            maxAngle: THREE.MathUtils.degToRad(180),
            initialAngle: 0,
            speed: 5.5
        });
        j4Joint.attachPivotNode(j4PivotNode);
        this.joints.set('J4', j4Joint);

        // Add Wrist Mesh to J4 Pivot
        const wristMesh = this.geometryBuilder.buildWrist();
        j4PivotNode.add(wristMesh);

        // -------------------------------------------------------------
        // JOINT 5: Wrist Pitch (Pitch - Z axis at y = 0.32)
        // -------------------------------------------------------------
        const j5PivotNode = new THREE.Group();
        j5PivotNode.name = 'J5_WristPitch_Pivot';
        j5PivotNode.position.set(0, 0.32, 0);
        j4PivotNode.add(j5PivotNode);

        const j5Joint = new RobotJoint({
            name: 'J5_WristPitch',
            axis: new THREE.Vector3(0, 0, 1),
            minAngle: THREE.MathUtils.degToRad(-90),
            maxAngle: THREE.MathUtils.degToRad(90),
            initialAngle: THREE.MathUtils.degToRad(20),
            speed: 5.5
        });
        j5Joint.attachPivotNode(j5PivotNode);
        this.joints.set('J5', j5Joint);

        // -------------------------------------------------------------
        // JOINT 6: End-Effector Roll (Tool Flange Roll - Y axis at y = 0.16)
        // -------------------------------------------------------------
        const j6PivotNode = new THREE.Group();
        j6PivotNode.name = 'J6_ToolRoll_Pivot';
        j6PivotNode.position.set(0, 0.16, 0);
        j5PivotNode.add(j6PivotNode);

        const j6Joint = new RobotJoint({
            name: 'J6_ToolRoll',
            axis: new THREE.Vector3(0, 1, 0),
            minAngle: THREE.MathUtils.degToRad(-180),
            maxAngle: THREE.MathUtils.degToRad(180),
            initialAngle: 0,
            speed: 6.0
        });
        j6Joint.attachPivotNode(j6PivotNode);
        this.joints.set('J6', j6Joint);

        // -------------------------------------------------------------
        // 3-Finger Industrial Gripper Attachment
        // -------------------------------------------------------------
        this.gripper = new Gripper(this.materials);
        j6PivotNode.add(this.gripper.group);
    }

    /**
     * Get joint by ID ('J1', 'J2', 'J3', 'J4', 'J5', 'J6')
     * @param {string} key 
     * @returns {RobotJoint}
     */
    getJoint(key) {
        return this.joints.get(key);
    }

    /**
     * Get current 3D world position of end effector tip
     * @returns {THREE.Vector3}
     */
    getEndEffectorWorldPosition() {
        if (this.gripper) {
            this.gripper.group.getWorldPosition(this.endEffectorPoint);
        }
        return this.endEffectorPoint;
    }

    /**
     * Update joint angles and gripper state
     * @param {number} deltaTime Time elapsed in seconds
     */
    update(deltaTime) {
        // Update all 6 joints
        this.joints.forEach(joint => joint.update(deltaTime));

        // Update gripper finger animation
        if (this.gripper) {
            this.gripper.update(deltaTime);
        }
    }

    /**
     * Add robot container to target scene
     * @param {THREE.Scene} scene 
     */
    addToScene(scene) {
        if (scene) {
            scene.add(this.group);
        }
    }
}
