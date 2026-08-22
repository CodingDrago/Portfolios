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

        // Registry of interactive targets: Array of { id, title, category, description, mesh, anchorPoint, panelOffset, getData(), onHover(), onUnhover() }
        this.interactiveTargets = [];
        this.targetMeshes = [];

        // Active State
        this.activeTarget = null;
        this.previousTarget = null;
        this.hoverProgress = 0; // 0 (hidden) to 1 (fully visible)
        this.hasInteractedOnce = false; // Tracks if user has begun exploring (to fade intro hologram)
    }

    /**
     * Register an interactive 3D object
     * @param {Object} config 
     * @param {string} config.id Unique identifier (e.g. 'oscilloscope', 'mcuPrototype', 'robot')
     * @param {string} config.title Display title
     * @param {string} config.category Engineering discipline category
     * @param {string} config.description Concise engineering summary
     * @param {THREE.Object3D} config.mesh 3D Mesh / Group for collision
     * @param {THREE.Vector3} config.anchorPoint World-space connection point for leader line
     * @param {THREE.Vector3} [config.boundsSize] Tight physical bounding dimensions
     * @param {THREE.Vector3} config.panelOffset World-space offset for holographic panel placement
     * @param {Function} config.getData Callback returning dynamic technical data array
     * @param {Function} [config.onHover] Callback when cursor enters object
     * @param {Function} [config.onUnhover] Callback when cursor leaves object
     */
    registerTarget(config) {
        if (!config) return;

        this.interactiveTargets.push(config);

        // 1. Collect all real child meshes from the object, excluding environment geometry
        if (config.mesh) {
            config.mesh.traverse((child) => {
                if (child.isMesh && child.userData.isEnvironment !== true) {
                    child.userData.targetConfig = config;
                    this.targetMeshes.push(child);
                }
            });
        }
        // No invisible BoxGeometry bounding mesh — removed to prevent false-positive hits
        // on table surfaces, floors, and non-interactive geometry at the anchor point
    }

    /**
     * Update hover detection and transitions per frame
     * @param {number} deltaTime 
     * @param {Object} pointerTracker 
     */
    update(deltaTime, pointerTracker) {
        if (!this.camera || !pointerTracker) return;

        // Suppress hover during camera drag
        if (pointerTracker.isDragging) {
            if (this.activeTarget) {
                if (this.activeTarget.onUnhover) this.activeTarget.onUnhover();
                this.activeTarget = null;
                this.previousTarget = null;
            }
            this.hoverProgress = 0;
            return;
        }

        let hitTarget = null;
        if (pointerTracker.hasMovedEver) {
            this.mouseNDC.set(pointerTracker.normalizedX, pointerTracker.normalizedY);
            this.raycaster.setFromCamera(this.mouseNDC, this.camera);

            // Perform pure 3D raycast against registered hardware meshes & bounds
            const intersects = this.raycaster.intersectObjects(this.targetMeshes, false);

            if (intersects.length > 0) {
                for (const hit of intersects) {
                    if (hit.object.userData && hit.object.userData.targetConfig) {
                        hitTarget = hit.object.userData.targetConfig;
                        break;
                    }
                }
            }
        }

        // State Transition Handling
        if (hitTarget) {
            this.hasInteractedOnce = true;
            if (this.activeTarget !== hitTarget) {
                if (this.activeTarget && this.activeTarget.onUnhover) {
                    this.activeTarget.onUnhover();
                }
                this.previousTarget = this.activeTarget;
                this.activeTarget = hitTarget;
                if (this.activeTarget && this.activeTarget.onHover) {
                    this.activeTarget.onHover();
                }
            }
            // Fade in smoothly
            this.hoverProgress = Math.min(1.0, this.hoverProgress + deltaTime * 6.0);
        } else {
            // Fade out smoothly
            this.hoverProgress = Math.max(0.0, this.hoverProgress - deltaTime * 4.0);
            if (this.hoverProgress <= 0.0) {
                if (this.activeTarget && this.activeTarget.onUnhover) {
                    this.activeTarget.onUnhover();
                }
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
