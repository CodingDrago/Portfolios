/**
 * InspectionCamera - Dedicated 360-Degree Object Inspection Camera Controller
 * Manages full 360° horizontal drag orbit, vertical pitch with anti-flip/floor limits,
 * collision-safe wheel zoom, double-click reset, and smooth camera damping for isolated exploration.
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class InspectionCamera {
    constructor(camera) {
        this.camera = camera;
        this.isActive = false;

        // Target Object Center in World Space
        this.targetFocus = new THREE.Vector3(0, 0.4, 0);

        // Spherical Coordinates
        this.defaultRadius = CONFIG.inspection.inspectionDistance || 4.8;
        this.defaultTheta = 0.0;             // Azimuth angle
        this.defaultPhi = Math.PI * 0.42;    // Polar elevation angle (~75°)

        this.targetRadius = this.defaultRadius;
        this.currentRadius = this.defaultRadius;

        this.targetTheta = this.defaultTheta;
        this.currentTheta = this.defaultTheta;

        this.targetPhi = this.defaultPhi;
        this.currentPhi = this.defaultPhi;

        // Orbit Limits
        this.minRadius = 2.4;  // Collision safe boundary
        this.maxRadius = 8.5;  // View boundary
        this.minPhi = 0.15;    // Overhead limit (~8.5°)
        this.maxPhi = Math.PI * 0.48; // Floor grazing limit (~86.4°, never underground)

        // Saved Main Workstation Camera State
        this.savedCameraPosition = new THREE.Vector3();
        this.savedCameraQuaternion = new THREE.Quaternion();
        this._lookAtMatrix = new THREE.Matrix4();
        this._up = new THREE.Vector3(0, 1, 0);
    }

    /**
     * Activate 360° inspection camera mode focused on target object
     * @param {THREE.Vector3} focusPosition Center point of the object
     * @param {number} [customRadius] Optional initial inspection distance
     */
    activate(focusPosition, customRadius = 4.8) {
        this.isActive = true;

        if (focusPosition) {
            this.targetFocus.copy(focusPosition);
        }

        // Save current workstation camera transform
        if (this.camera) {
            this.savedCameraPosition.copy(this.camera.position);
            this.savedCameraQuaternion.copy(this.camera.quaternion);
        }

        this.defaultRadius = customRadius;
        this.minRadius = Math.max(1.8, customRadius * 0.5);
        this.maxRadius = customRadius * 1.8;

        this.targetRadius = customRadius;
        this.currentRadius = customRadius;
        this.targetTheta = 0.0;
        this.currentTheta = 0.0;
        this.targetPhi = this.defaultPhi;
        this.currentPhi = this.defaultPhi;
    }

    /**
     * Deactivate inspection camera mode
     */
    deactivate() {
        this.isActive = false;
    }

    /**
     * Reset inspection orientation to default
     */
    reset() {
        this.targetTheta = this.defaultTheta;
        this.targetPhi = this.defaultPhi;
        this.targetRadius = this.defaultRadius;
    }

    /**
     * Resolve the current orbital camera pose without applying it. This lets the
     * inspection controller blend into the view instead of jumping on entry.
     * @param {THREE.Vector3} position Target vector for the calculated position
     * @param {THREE.Quaternion} quaternion Target quaternion for the calculated orientation
     * @returns {{ position: THREE.Vector3, quaternion: THREE.Quaternion }}
     */
    getPose(position = new THREE.Vector3(), quaternion = new THREE.Quaternion()) {
        const sinPhi = Math.sin(this.currentPhi);
        position.set(
            this.currentRadius * sinPhi * Math.sin(this.currentTheta) + this.targetFocus.x,
            this.currentRadius * Math.cos(this.currentPhi) + this.targetFocus.y,
            this.currentRadius * sinPhi * Math.cos(this.currentTheta) + this.targetFocus.z
        );
        quaternion.setFromRotationMatrix(this._lookAtMatrix.lookAt(position, this.targetFocus, this._up));
        return { position, quaternion };
    }

    /**
     * Per-frame update for 360° inspection orbit & camera positioning
     * @param {number} deltaTime 
     * @param {Object} pointerTracker 
     * @param {SpatialCursor} [spatialCursor] 
     */
    update(deltaTime, pointerTracker, spatialCursor) {
        if (!this.isActive || !this.camera || !pointerTracker) return;

        // 1. Process Drag Orbit Input (Continuous 360° horizontal rotation without clamp)
        if (pointerTracker.isDragging) {
            const sens = CONFIG.inspection.orbitSensitivity || 0.0055;
            this.targetTheta -= pointerTracker.dragDeltaX * sens;
            this.targetPhi -= pointerTracker.dragDeltaY * sens;

            if (spatialCursor) {
                spatialCursor.setMode('orbit', '360° ORBIT');
            }
        } else if (spatialCursor && spatialCursor.currentMode === 'orbit') {
            spatialCursor.setMode('default');
        }

        // 2. Process Mouse Wheel Zoom Input
        if (Math.abs(pointerTracker.wheelDelta) > 0.001) {
            const zoomSens = CONFIG.inspection.zoomSensitivity || 0.12;
            this.targetRadius += pointerTracker.wheelDelta * zoomSens;
            pointerTracker.wheelDelta *= 0.85; // Smooth exponential decay
        }

        // 3. Enforce Polar Limits (Continuous 360° horizontal, safe vertical limits)
        this.targetPhi = THREE.MathUtils.clamp(this.targetPhi, this.minPhi, this.maxPhi);
        this.targetRadius = THREE.MathUtils.clamp(this.targetRadius, this.minRadius, this.maxRadius);

        // 4. Smooth Damping Interpolation
        const damping = Math.min(1.0, deltaTime * 12.0);
        this.currentTheta += (this.targetTheta - this.currentTheta) * damping;
        this.currentPhi += (this.targetPhi - this.currentPhi) * damping;
        this.currentRadius += (this.targetRadius - this.currentRadius) * damping;

        // 5. Convert spherical coordinates into the active camera pose.
        this.getPose(this.camera.position, this.camera.quaternion);
    }
}
