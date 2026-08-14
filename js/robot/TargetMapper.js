/**
 * TargetMapper - Pointer NDC to 3D Workstation Workspace Coordinate Mapper
 * Translates PointerTracker normalized device coordinates [-1.0, 1.0]
 * into a bounded 3D target coordinate (x, y, z) in front of the robotic arm.
 */

import * as THREE from 'three';

export class TargetMapper {
    constructor() {
        // Workspace Bounding Box Definition (in world coordinates relative to robot base origin)
        this.bounds = {
            minX: -3.2,
            maxX: 3.2,
            minY: -0.2,
            maxY: 3.0,
            minZ: -0.5,
            maxZ: 2.5
        };

        this.currentTarget = new THREE.Vector3(0, 1.2, 1.0);
    }

    /**
     * Map pointer NDC coordinates to 3D workspace position
     * @param {Object} pointer PointerTracker instance
     * @returns {THREE.Vector3}
     */
    mapPointerToTarget(pointer) {
        if (!pointer) return this.currentTarget;

        const ndcX = pointer.smoothX || 0; // [-1, 1]
        const ndcY = pointer.smoothY || 0; // [-1, 1]

        // X: Maps directly to horizontal workspace reach
        const x = ndcX * this.bounds.maxX;

        // Y: Maps pointer Y (inverted NDC) to vertical height reach
        const yLerp = (ndcY + 1.0) / 2.0; // [0, 1]
        const y = THREE.MathUtils.lerp(this.bounds.minY, this.bounds.maxY, yLerp);

        // Z: Maps pointer distance/height to workspace depth
        const z = THREE.MathUtils.lerp(1.8, 0.4, yLerp) + Math.abs(ndcX) * 0.3;

        this.currentTarget.set(x, y, z);
        return this.currentTarget;
    }
}
