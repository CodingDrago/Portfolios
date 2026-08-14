/**
 * RobotController - Master 6-DOF Manipulator Controller & IK Solver
 * Manages 3D workspace targeting, analytical 6-DOF IK joint angle solving,
 * mechanical limits enforcement, idle breathing animation, and RAF loop updates.
 */

import * as THREE from 'three';
import { RobotMaterials } from './RobotMaterials.js';
import { RobotArm } from './RobotArm.js';
import { TargetMapper } from './TargetMapper.js';

export class RobotController {
    /**
     * @param {Object} [globalMaterials] Optional Phase 2 materials registry
     */
    constructor(globalMaterials) {
        this.robotMaterials = new RobotMaterials();
        this.arm = new RobotArm(this.robotMaterials);
        this.targetMapper = new TargetMapper();

        // Idle Motion Control
        this.idleTime = 0;
        this.isTracking = false;

        // Kinematic Link Lengths (matching geometry definitions)
        this.L1 = 0.75; // Shoulder height offset
        this.L2 = 1.8;  // Upper arm length
        this.L3 = 1.6;  // Forearm length
        this.L4 = 0.6;  // Wrist + Tool offset
    }

    /**
     * Add robot assembly to target scene
     * @param {THREE.Scene} scene 
     */
    addToScene(scene) {
        if (this.arm) {
            this.arm.addToScene(scene);
        }
    }

    /**
     * Solve 6-DOF Analytic IK Joint Angles for 3D Target Vector
     * Calculates J1 (Base Yaw), J2 (Shoulder Pitch), J3 (Elbow Pitch), J4-J6 (Wrist Roll/Pitch/Roll)
     * @param {THREE.Vector3} targetWorld 3D target coordinates in world space
     */
    solveIK(targetWorld) {
        if (!this.arm || !targetWorld) return;

        // Convert target to local coordinates relative to robot base origin (0, -1.48, 0)
        const localTarget = targetWorld.clone().sub(this.arm.group.position);

        // 1. Solve J1 (Base Yaw): Angle in X-Z plane
        const j1Angle = Math.atan2(localTarget.x, localTarget.z);
        const j1 = this.arm.getJoint('J1');
        if (j1) j1.setTargetAngle(j1Angle);

        // Radial distance in X-Z plane
        const r = Math.sqrt(localTarget.x * localTarget.x + localTarget.z * localTarget.z);
        // Vertical distance relative to shoulder pivot (y = 0.55 + 0.75 = 1.30)
        const dy = localTarget.y - 1.30;

        // Target distance from shoulder pivot to target
        const D = Math.sqrt(r * r + dy * dy);

        // 2. Solve 2-Link Arm IK (Upper Arm L2, Forearm L3)
        // Clamp reach distance D to prevent NaN on out-of-reach targets
        const maxReach = (this.L2 + this.L3) * 0.98;
        const minReach = Math.abs(this.L2 - this.L3) * 1.05;
        const clampedD = THREE.MathUtils.clamp(D, minReach, maxReach);

        // Law of Cosines for Elbow angle (J3)
        const cosElbow = (clampedD * clampedD - this.L2 * this.L2 - this.L3 * this.L3) / (2 * this.L2 * this.L3);
        const clampedCosElbow = THREE.MathUtils.clamp(cosElbow, -1.0, 1.0);
        const j3Angle = -Math.acos(clampedCosElbow); // Elbow flex angle

        // Law of Cosines for Shoulder angle (J2)
        const alpha = Math.atan2(dy, r);
        const beta = Math.atan2(this.L3 * Math.sin(-j3Angle), this.L2 + this.L3 * Math.cos(-j3Angle));
        const j2Angle = alpha + beta;

        const j2 = this.arm.getJoint('J2');
        const j3 = this.arm.getJoint('J3');

        if (j2) j2.setTargetAngle(j2Angle);
        if (j3) j3.setTargetAngle(j3Angle);

        // 3. Solve Wrist Articulation (J4 Roll, J5 Pitch, J6 Roll)
        // Keep end-effector tool pointing forward toward target
        const j5Angle = -(j2Angle + j3Angle) * 0.7;
        const j4Angle = -j1Angle * 0.3;
        const j6Angle = j1Angle * 0.1;

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

        // Extremely small mechanical adjustments (slow, controlled, non-exaggerated)
        const baseSway = Math.sin(time * 0.8) * 0.04;
        const shoulderBreathing = Math.cos(time * 1.2) * 0.02;
        const wristLeveling = Math.sin(time * 1.5) * 0.03;

        const j1 = this.arm.getJoint('J1');
        const j2 = this.arm.getJoint('J2');
        const j5 = this.arm.getJoint('J5');

        if (j1) j1.setTargetAngle(j1.targetAngle + baseSway * 0.1);
        if (j2) j2.setTargetAngle(j2.targetAngle + shoulderBreathing * 0.1);
        if (j5) j5.setTargetAngle(j5.targetAngle + wristLeveling * 0.1);

        if (this.arm.gripper) {
            this.arm.gripper.setState('OPEN');
        }
    }

    /**
     * Master update loop called by RAF loop
     * @param {number} deltaTime Time elapsed in seconds
     * @param {Object} pointer PointerTracker instance
     * @param {string} [appState] StateManager state string
     */
    update(deltaTime, pointer, appState) {
        if (!this.arm) return;

        const isActive = pointer && pointer.active;

        if (isActive) {
            this.isTracking = true;

            // 1. Map pointer to 3D target in workspace
            const targetPos = this.targetMapper.mapPointerToTarget(pointer);

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
