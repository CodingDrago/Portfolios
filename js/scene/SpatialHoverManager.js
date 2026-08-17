/**
 * SpatialHoverManager - 3D Spatial Raycasting & Interactive Object Hover Subsystem
 * Casts rays from camera through pointer NDC to detect interactive hardware objects
 * in the 3D workstation, managing hover states, smooth transitions, and target metadata.
 */

import * as THREE from 'three';

export class SpatialHoverManager {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
        this.mouseNDC = new THREE.Vector2(0, 0);

        // Registry of interactive targets: Array of { id, name, category, mesh, anchorPoint, getData() }
        this.interactiveTargets = [];
        this.targetMeshes = [];

        // Active State
        this.activeTarget = null;
        this.previousTarget = null;
        this.hoverProgress = 0; // 0 (hidden) to 1 (fully visible)
        this.hasInteractedOnce = false; // Tracks if user has hovered over an object (to fade intro hologram)
    }

    /**
     * Register an interactive 3D object
     * @param {Object} config 
     * @param {string} config.id Unique identifier (e.g. 'oscilloscope', 'mcu', 'robot')
     * @param {string} config.title Display title
     * @param {string} config.category Engineering discipline category
     * @param {THREE.Object3D} [config.mesh] Optional 3D Mesh / Group for collision
     * @param {THREE.Vector3} config.anchorPoint World-space connection point for leader line
     * @param {THREE.Vector3} [config.hitboxSize] World-space dimensions for collision hitbox
     * @param {THREE.Vector3} config.panelOffset World-space offset for holographic panel placement
     * @param {Function} config.getData Callback returning dynamic technical data array
     */
    registerTarget(config) {
        if (!config) return;

        this.interactiveTargets.push(config);

        // Create a dedicated collision hitbox centered at anchorPoint
        const hitboxSize = config.hitboxSize || new THREE.Vector3(0.9, 0.7, 0.7);
        const hitboxGeom = new THREE.BoxGeometry(hitboxSize.x, hitboxSize.y, hitboxSize.z);
        const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitboxMesh = new THREE.Mesh(hitboxGeom, hitboxMat);
        hitboxMesh.position.copy(config.anchorPoint || new THREE.Vector3(0, 0, 0));
        hitboxMesh.userData.targetConfig = config;
        if (this.scene) {
            this.scene.add(hitboxMesh);
        }
        this.targetMeshes.push(hitboxMesh);

        // Also collect child meshes if mesh is provided
        if (config.mesh) {
            config.mesh.traverse((child) => {
                if (child.isMesh) {
                    child.userData.targetConfig = config;
                    this.targetMeshes.push(child);
                }
            });
        }
    }

    /**
     * Update hover detection and transitions per frame
     * @param {number} deltaTime 
     * @param {Object} pointerTracker 
     */
    update(deltaTime, pointerTracker) {
        if (!this.camera || !pointerTracker) return;

        let hitTarget = null;
        if (pointerTracker.hasMovedEver) {
            this.mouseNDC.set(pointerTracker.normalizedX, pointerTracker.normalizedY);
            this.raycaster.setFromCamera(this.mouseNDC, this.camera);

            // Perform raycast against registered hardware meshes
            const intersects = this.raycaster.intersectObjects(this.targetMeshes, false);

            if (intersects.length > 0) {
                // Find targetConfig on intersected mesh
                for (const hit of intersects) {
                    if (hit.object.userData && hit.object.userData.targetConfig) {
                        hitTarget = hit.object.userData.targetConfig;
                        break;
                    }
                }
            }

            // If direct mesh intersection didn't hit, check proximity from camera ray to anchor points
            if (!hitTarget) {
                let closestDist = 1.35; // Maximum proximity threshold in meters
                for (const target of this.interactiveTargets) {
                    if (target.anchorPoint) {
                        const d = this.raycaster.ray.distanceToPoint(target.anchorPoint);
                        if (d < closestDist) {
                            closestDist = d;
                            hitTarget = target;
                        }
                    }
                }
            }
        }

        // State Transition Handling
        if (hitTarget) {
            this.hasInteractedOnce = true;
            if (this.activeTarget !== hitTarget) {
                this.previousTarget = this.activeTarget;
                this.activeTarget = hitTarget;
            }
            // Fade in smoothly
            this.hoverProgress = Math.min(1.0, this.hoverProgress + deltaTime * 4.0);
        } else {
            // Fade out smoothly
            this.hoverProgress = Math.max(0.0, this.hoverProgress - deltaTime * 3.0);
            if (this.hoverProgress <= 0.0) {
                this.activeTarget = null;
            }
        }
    }

    /**
     * Get currently active target metadata and transition progress
     * @returns {Object} { target, progress, hasInteractedOnce }
     */
    getActiveState() {
        return {
            target: this.activeTarget,
            progress: this.hoverProgress,
            hasInteractedOnce: this.hasInteractedOnce
        };
    }
}
