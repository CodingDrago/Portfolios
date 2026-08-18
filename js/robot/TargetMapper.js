/**
 * TargetMapper - Pointer NDC to 3D Workstation Workspace Coordinate Mapper
 * Translates PointerTracker normalized device coordinates [-1.0, 1.0]
 * into a synchronized 3D target coordinate (x, y, z) in front of the robotic arm.
 */

import * as THREE from 'three';

export class TargetMapper {
    constructor() {
        // Workspace Bounding Box Definition (in world coordinates relative to workstation)
        this.bounds = {
            minX: -3.6,
            maxX: 3.6,
            minY: 0.1,
            maxY: 3.8,
            minZ: 0.6,
            maxZ: 3.2
        };

        this.currentTarget = new THREE.Vector3(0, 1.4, 1.2);
        this.raycaster = new THREE.Raycaster();
        this.workspacePlane = new THREE.Plane();
        this.planeIntersectPoint = new THREE.Vector3();
    }

    /**
     * Map pointer NDC coordinates to 3D workspace position across the entire viewport
     * @param {Object} pointer PointerTracker instance
     * @param {THREE.Camera} [camera] Three.js perspective camera
     * @returns {THREE.Vector3}
     */
    mapPointerToTarget(pointer, camera) {
        if (!pointer) return this.currentTarget;

        const ndcX = pointer.smoothX || 0; // [-1 (left) to +1 (right)]
        const ndcY = pointer.smoothY || 0; // [-1 (bottom) to +1 (top)]

        if (camera) {
            // Raycast through camera NDC onto the robot's front interaction plane
            this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

            // Interaction plane centered in front of robot (0, 0.8, 1.2) facing camera
            const camDir = camera.getWorldDirection(new THREE.Vector3());
            const planeCenter = new THREE.Vector3(0, 0.8, 1.2);
            this.workspacePlane.setFromNormalAndCoplanarPoint(camDir.negate(), planeCenter);

            const hit = this.raycaster.ray.intersectPlane(this.workspacePlane, this.planeIntersectPoint);
            if (hit) {
                // Allow target to traverse the full viewport plane
                this.currentTarget.copy(hit);
                return this.currentTarget;
            }
        }

        // Direct analytical mapping fallback
        const x = ndcX * 6.5;
        const yNorm = (ndcY + 1.0) * 0.5; // [0, 1]
        const y = THREE.MathUtils.lerp(-0.5, 4.8, yNorm);
        const z = THREE.MathUtils.lerp(2.6, 0.4, yNorm) + Math.abs(ndcX) * 0.4;

        this.currentTarget.set(x, y, z);
        return this.currentTarget;
    }
}

