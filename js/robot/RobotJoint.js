/**
 * RobotJoint - 1-DOF Rotational Joint Abstraction
 * Encapsulates joint axis, current/target angles, min/max limits, speed, and smooth lerp updates.
 * For continuous joints spanning [-π, +π] (like J1 base yaw), uses shortest angular path interpolation
 * via atan2(sin(delta), cos(delta)) to eliminate wraparound delay across the ±π boundary.
 */

import * as THREE from 'three';

export class RobotJoint {
    /**
     * @param {Object} config Joint configuration
     * @param {string} config.name Name identifier (e.g., 'J1_BaseYaw')
     * @param {THREE.Vector3} config.axis Axis of rotation (e.g., Vector3(0, 1, 0))
     * @param {number} config.minAngle Minimum limit in radians
     * @param {number} config.maxAngle Maximum limit in radians
     * @param {number} [config.initialAngle=0] Initial angle in radians
     * @param {number} [config.speed=5.0] Interpolation speed
     */
    constructor(config) {
        this.name = config.name || 'Joint';
        this.axis = config.axis || new THREE.Vector3(0, 1, 0);
        this.minAngle = config.minAngle !== undefined ? config.minAngle : -Math.PI;
        this.maxAngle = config.maxAngle !== undefined ? config.maxAngle : Math.PI;
        
        this.currentAngle = config.initialAngle || 0;
        this.targetAngle = config.initialAngle || 0;
        this.speed = config.speed || 5.0;

        // Continuous joint check: spans the full [-π, +π] circle (~2π total range)
        this.isContinuous = (this.maxAngle - this.minAngle) >= (2 * Math.PI - 0.05) ||
                            (this.minAngle <= -Math.PI + 0.05 && this.maxAngle >= Math.PI - 0.05);

        // Reference to Three.js Object3D joint pivot node
        this.pivotNode = null;
    }

    /**
     * Attach to target Three.js pivot node
     * @param {THREE.Object3D} node 
     */
    attachPivotNode(node) {
        this.pivotNode = node;
        this._applyRotation(this.currentAngle);
    }

    /**
     * Set new target angle. For continuous joints, normalizes to [-π, +π].
     * For restricted joints, clamps within [minAngle, maxAngle].
     * @param {number} angle Angle in radians
     */
    setTargetAngle(angle) {
        if (this.isContinuous) {
            this.targetAngle = Math.atan2(Math.sin(angle), Math.cos(angle));
        } else {
            this.targetAngle = THREE.MathUtils.clamp(angle, this.minAngle, this.maxAngle);
        }
    }

    /**
     * Smoothly update joint angle toward target using delta time.
     * Uses shortest-path angular delta for continuous joints.
     * @param {number} deltaTime Time elapsed in seconds
     */
    update(deltaTime) {
        if (this.isContinuous) {
            // Shortest angular path delta via atan2(sin, cos)
            const delta = Math.atan2(
                Math.sin(this.targetAngle - this.currentAngle),
                Math.cos(this.targetAngle - this.currentAngle)
            );

            if (Math.abs(delta) < 0.0001) {
                this.currentAngle = this.targetAngle;
            } else {
                const step = delta * Math.min(deltaTime * this.speed, 1.0);
                this.currentAngle += step;
            }

            // Normalize current angle to [-π, +π]
            this.currentAngle = Math.atan2(Math.sin(this.currentAngle), Math.cos(this.currentAngle));
        } else {
            // Standard linear interpolation for joints with mechanical limits (J2, J3, J5)
            if (Math.abs(this.currentAngle - this.targetAngle) < 0.0001) {
                this.currentAngle = this.targetAngle;
            } else {
                const step = (this.targetAngle - this.currentAngle) * Math.min(deltaTime * this.speed, 1.0);
                this.currentAngle += step;
            }

            // Clamp current angle as safety safeguard
            this.currentAngle = THREE.MathUtils.clamp(this.currentAngle, this.minAngle, this.maxAngle);
        }

        this._applyRotation(this.currentAngle);
    }

    /**
     * Apply rotation to Three.js pivot node along defined axis
     * @private
     * @param {number} angle Radians
     */
    _applyRotation(angle) {
        if (!this.pivotNode) return;

        if (this.axis.x === 1) {
            this.pivotNode.rotation.x = angle;
        } else if (this.axis.y === 1) {
            this.pivotNode.rotation.y = angle;
        } else if (this.axis.z === 1) {
            this.pivotNode.rotation.z = angle;
        } else {
            this.pivotNode.setRotationFromAxisAngle(this.axis, angle);
        }
    }
}
