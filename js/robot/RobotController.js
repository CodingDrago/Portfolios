/**
 * RobotController - Master 6-DOF Manipulator Controller & IK Solver
 * Manages 3D workspace targeting, analytical 6-DOF IK joint angle solving,
 * mechanical limits enforcement, idle breathing animation, and 3D debug target marker.
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js?v=39';
import { RobotMaterials } from './RobotMaterials.js?v=39';
import { RobotArm } from './RobotArm.js?v=39';
import { TargetMapper } from './TargetMapper.js?v=39';

export class RobotController {
    /**
     * @param {Object} [globalMaterials] Optional Phase 2 materials registry
     */
    constructor(globalMaterials) {
        this.robotMaterials = new RobotMaterials();
        this.arm = new RobotArm(this.robotMaterials);
        this.targetMapper = new TargetMapper();
        this.scene = null;

        // Idle Motion Control
        this.idleTime = 0;
        this.isTracking = false;

        // Kinematic Link Lengths (calibrated directly to Claw Tip TCP)
        this.L1 = 1.30;      // Shoulder pivot height (0.55 base + 0.75 yoke)
        this.L2 = 1.80;      // Upper arm length (J2 to J3)
        this.Ldistal = 2.80; // Distance from J3 Elbow pivot directly to the grasping Claw Tip TCP
    }

    /**
     * Add robot assembly to target scene
     * @param {THREE.Scene} scene 
     */
    addToScene(scene) {
        if (!scene) return;
        this.scene = scene;

        if (this.arm) {
            this.arm.addToScene(scene);
        }
    }

    /**
     * Solve 6-DOF Analytic IK Joint Angles for Claw Tip TCP Target
     * Directs the actual fingertips / Claw TCP to converge on targetWorld.
     * Calculates J1 (Base Yaw Y), J2 (Shoulder Pitch X), J3 (Elbow Pitch X - Forward Flex),
     * J4 (Forearm Roll Y), J5 (Wrist Pitch X), J6 (Tool Roll Y)
     * @param {THREE.Vector3} targetWorld 3D target coordinates in world space
     */
    solveIK(targetWorld) {
        if (!this.arm || !targetWorld) return;

        // Transform target into local unscaled coordinates of RobotArm (scaled by 0.82)
        const armScale = this.arm.group.scale.x || 0.82;
        const localTarget = targetWorld.clone().sub(this.arm.group.position).divideScalar(armScale);

        // 1. Solve J1 (Base Yaw): Angle in X-Z plane around Y-axis
        const j1Angle = Math.atan2(localTarget.x, localTarget.z);
        const j1 = this.arm.getJoint('J1');
        if (j1) j1.setTargetAngle(j1Angle);

        // 2. Solve Planar IK for Shoulder (J2) and Elbow (J3) around local X-axis
        const r = Math.sqrt(localTarget.x * localTarget.x + localTarget.z * localTarget.z);
        const dy = localTarget.y - this.L1; // Relative to shoulder height (y = 1.30)
        const D = Math.sqrt(r * r + dy * dy);

        // Clamp reach distance D to robot's physical reach capacity
        const L2 = this.L2;
        const Ldistal = this.Ldistal;
        const maxReach = (L2 + Ldistal) * 0.98;
        const minReach = Math.abs(L2 - Ldistal) * 1.05;
        const clampedD = THREE.MathUtils.clamp(D, minReach, maxReach);

        // Law of Cosines for Shoulder interior angle psi
        const cosPsi = (L2 * L2 + clampedD * clampedD - Ldistal * Ldistal) / (2 * L2 * clampedD);
        const psi = Math.acos(THREE.MathUtils.clamp(cosPsi, -0.9999, 0.9999));

        // Elevation angle gamma of target relative to horizontal plane
        const gamma = Math.atan2(dy, Math.max(r, 0.1));

        // Shoulder Pitch J2: (PI/2) - gamma - psi (Clamped to prevent base collision)
        const j2Angle = THREE.MathUtils.clamp((Math.PI * 0.5) - gamma - psi, -0.45, 1.30);

        // Law of Cosines for Elbow interior angle beta
        const cosBeta = (L2 * L2 + Ldistal * Ldistal - clampedD * clampedD) / (2 * L2 * Ldistal);
        const beta = Math.acos(THREE.MathUtils.clamp(cosBeta, -0.9999, 0.9999));

        // Elbow flex angle J3: Bending FORWARD toward target (Clamped for joint clearance)
        const j3Angle = THREE.MathUtils.clamp(Math.PI - beta, 0.08, 1.90);

        const j2 = this.arm.getJoint('J2');
        const j3 = this.arm.getJoint('J3');

        if (j2) j2.setTargetAngle(j2Angle);
        if (j3) j3.setTargetAngle(j3Angle);

        // 3. Solve Coherent Wrist Articulation (J4 Roll Y, J5 Pitch X, J6 Tool Roll Y)
        // J5 maintains rigid coaxial tool alignment with distal link (theta5 = 0) so Claw Tip TCP hits targetWorld exactly
        const j5Angle = 0;
        const j4Angle = -j1Angle * 0.25;
        const j6Angle = j1Angle * 0.15;

        const j4 = this.arm.getJoint('J4');
        const j5 = this.arm.getJoint('J5');
        const j6 = this.arm.getJoint('J6');

        if (j4) j4.setTargetAngle(j4Angle);
        if (j5) j5.setTargetAngle(j5Angle);
        if (j6) j6.setTargetAngle(j6Angle);
    }

    /**
     * Apply subtle mechanical idle breathing motion when pointer is inactive
     * @private
     * @param {number} deltaTime 
     */
    _applyIdleBreathing(deltaTime) {
        this.idleTime += deltaTime;
        const time = this.idleTime;

        // Extremely small mechanical adjustments in forward-bending pose
        const baseSway = Math.sin(time * 0.8) * 0.05;
        const shoulderBreathing = Math.cos(time * 1.1) * 0.03;
        const elbowBreathing = Math.sin(time * 1.1) * 0.02;

        const j1 = this.arm.getJoint('J1');
        const j2 = this.arm.getJoint('J2');
        const j3 = this.arm.getJoint('J3');
        const j5 = this.arm.getJoint('J5');

        if (j1) j1.setTargetAngle(baseSway);
        if (j2) j2.setTargetAngle(THREE.MathUtils.degToRad(20) + shoulderBreathing);
        if (j3) j3.setTargetAngle(THREE.MathUtils.degToRad(35) + elbowBreathing);
        if (j5) j5.setTargetAngle(0);

        if (this.arm.gripper) {
            this.arm.gripper.setState('OPEN');
        }
    }

    /**
     * Master update loop called by RAF loop
     * @param {number} deltaTime Time elapsed in seconds
     * @param {Object} pointer PointerTracker instance
     * @param {string} [appState] StateManager state string
     * @param {THREE.Camera} [camera] Three.js camera for screen-to-world synchronization
     */
    update(deltaTime, pointer, appState, camera) {
        if (!this.arm) return;

        // If user is click-and-dragging to orbit the camera, hold current arm posture
        if (pointer && pointer.isDragging) {
            this.isTracking = false;
            this.arm.update(deltaTime);
            return;
        }

        const isActive = pointer && pointer.active;

        if (isActive) {
            this.isTracking = true;

            // 1. Map pointer to 3D target in workspace (synchronized with camera view)
            const targetPos = this.targetMapper.mapPointerToTarget(pointer, camera);

            // 2. Solve 6-DOF IK joint angles
            this.solveIK(targetPos);

            // 3. Set gripper to READY posture during cursor tracking
            if (this.arm.gripper) {
                this.arm.gripper.setState('READY');
            }
        } else {
            this.isTracking = false;
            // Apply subtle mechanical idle breathing
            this._applyIdleBreathing(deltaTime);
        }

        // 4. Update joint interpolations and gripper fingers
        this.arm.update(deltaTime);
    }
}


