/**
 * RobotController - Master 6-DOF Manipulator Controller & IK Solver
 * Manages 3D workspace targeting, analytical 6-DOF IK joint angle solving,
 * mechanical limits enforcement, idle breathing animation, and 3D debug target marker.
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js?v=62';
import { RobotMaterials } from './RobotMaterials.js?v=62';
import { RobotArm } from './RobotArm.js?v=62';
import { TargetMapper } from './TargetMapper.js?v=62';

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

        // Debug target marker (bright magenta sphere, visible in scene)
        this._debugMarker = null;
        this._debugLine = null;
        this._debugEnabled = false;
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

        if (this.targetMapper && typeof this.targetMapper.getWorkspaceSurface === 'function') {
            scene.add(this.targetMapper.getWorkspaceSurface());
        }

        this._initDebugMarker(scene);
    }

    /**
     * Create visible debug target marker (magenta sphere) and camera→target ray line.
     * Hidden by default; enabled when _debugEnabled is set to true.
     * @private
     * @param {THREE.Scene} scene
     */
    _initDebugMarker(scene) {
        if (!scene) return;

        // Bright magenta sphere at target position
        const markerGeo = new THREE.SphereGeometry(0.12, 12, 12);
        const markerMat = new THREE.MeshBasicMaterial({ color: 0xff00ff, depthTest: false });
        this._debugMarker = new THREE.Mesh(markerGeo, markerMat);
        this._debugMarker.renderOrder = 999;
        this._debugMarker.name = 'IKTargetMarker';
        this._debugMarker.visible = false;
        scene.add(this._debugMarker);

        // Debug ray line (camera origin → target)
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(), new THREE.Vector3()
        ]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x00ffff, depthTest: false });
        this._debugLine = new THREE.Line(lineGeo, lineMat);
        this._debugLine.renderOrder = 998;
        this._debugLine.visible = false;
        scene.add(this._debugLine);
    }

    /**
     * Update debug marker position and ray line endpoints each frame.
     * @private
     * @param {THREE.Vector3} targetWorld
     * @param {THREE.Camera}  camera
     */
    _updateDebugMarker(targetWorld, camera) {
        if (!this._debugEnabled || !this._debugMarker) return;

        this._debugMarker.visible = true;
        this._debugMarker.position.copy(targetWorld);

        if (this._debugLine && camera) {
            this._debugLine.visible = true;
            const positions = this._debugLine.geometry.attributes.position;
            positions.setXYZ(0, camera.position.x, camera.position.y, camera.position.z);
            positions.setXYZ(1, targetWorld.x, targetWorld.y, targetWorld.z);
            positions.needsUpdate = true;
        }
    }

    /**
     * Enable or disable the debug marker and ray line.
     * @param {boolean} enabled
     */
    setDebugEnabled(enabled) {
        this._debugEnabled = enabled;
        if (!enabled) {
            if (this._debugMarker) this._debugMarker.visible = false;
            if (this._debugLine)   this._debugLine.visible   = false;
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

            // 2. Update debug marker at the resolved world-space target
            this._updateDebugMarker(targetPos, camera);

            // 3. Solve 6-DOF IK joint angles
            this.solveIK(targetPos);

            // 4. Set gripper to READY posture during cursor tracking
            if (this.arm.gripper) {
                this.arm.gripper.setState('READY');
            }
        } else {
            this.isTracking = false;
            // Apply subtle mechanical idle breathing
            this._applyIdleBreathing(deltaTime);
        }

        // 5. Update joint interpolations and gripper fingers
        this.arm.update(deltaTime);
    }
}
