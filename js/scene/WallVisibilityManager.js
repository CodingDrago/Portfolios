/**
 * WallVisibilityManager - Camera-Facing Based Visibility Scoping for Laboratory Walls
 *
 * Computes which wall the camera is currently facing by evaluating the camera's forward
 * viewing direction in the X-Z plane against each wall's normal orientation:
 *   - FRONT Wall (Z = -12.0): Target direction ( 0, -1) -> Score: -dirZ
 *   - LEFT  Wall (X = -12.0): Target direction (-1,  0) -> Score: -dirX
 *   - BACK  Wall (Z = +12.0): Target direction ( 0, +1) -> Score: +dirZ
 *   - RIGHT Wall (X = +12.0): Target direction (+1,  0) -> Score: +dirX
 *
 * Hysteresis Scoping Rules:
 *   - Uses a dual-threshold hysteresis band to eliminate visibility flickering near boundaries:
 *     * Falling threshold (hideThreshold = 0.25): only hide a visible wall when score drops below 0.25.
 *     * Rising threshold (showThreshold = 0.40): only re-show a hidden wall when score rises above 0.40.
 *   - Visible walls render with smooth opacity scaling between hideThreshold (0.25) and fullThreshold (0.70).
 *   - Non-facing walls (below hideThreshold) are culled from the render pass (group.visible = false)
 *     to prevent any 3D panel overlap, text clutter, or z-fighting across wall corners.
 *   - Evaluated every frame in the main RequestAnimationFrame loop (during drag orbit and idle).
 */

import * as THREE from 'three';

export class WallVisibilityManager {
    /**
     * @param {Object} options
     * @param {THREE.Camera} options.camera Three.js PerspectiveCamera
     * @param {Object} options.walls Dictionary of wall instances { front, left, right, back }
     */
    constructor({ camera, walls = {} }) {
        this.camera = camera;
        this.walls = walls;

        // Reusable vectors for zero garbage collection
        this._camDir = new THREE.Vector3();

        // Facing scores cache
        this.scores = {
            front: 1.0,
            left: 0.0,
            back: -1.0,
            right: 0.0
        };

        // Hysteresis state tracking per wall
        this.wallStates = {
            front: true,
            left: false,
            back: false,
            right: false
        };

        this.primaryFacingWall = 'front';

        // Dual-threshold hysteresis band
        this.hideThreshold = 0.25; // Score below which a visible wall becomes hidden
        this.showThreshold = 0.40; // Score above which a hidden wall becomes visible
        this.fullThreshold = 0.70; // Score at which a visible wall reaches 1.0 full opacity

        // Cache original material opacities
        this._materialOpacities = new Map();
        this._initMaterialCache();
    }

    /**
     * Cache all panel mesh materials across the four walls
     * @private
     */
    _initMaterialCache() {
        Object.entries(this.walls).forEach(([wallKey, wallInstance]) => {
            if (wallInstance && wallInstance.group) {
                wallInstance.group.traverse((child) => {
                    if (child.isMesh && child.material) {
                        const mats = Array.isArray(child.material) ? child.material : [child.material];
                        mats.forEach((mat) => {
                            if (!this._materialOpacities.has(mat)) {
                                this._materialOpacities.set(mat, {
                                    opacity: mat.opacity !== undefined ? mat.opacity : 1.0,
                                    transparent: mat.transparent !== undefined ? mat.transparent : false
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    /**
     * Register or update wall instance references
     * @param {Object} walls
     */
    setWalls(walls) {
        this.walls = { ...this.walls, ...walls };
        this._initMaterialCache();
    }

    /**
     * Update camera-facing visibility for all 4 walls every frame with hysteresis
     * @param {number} [deltaTime] Time elapsed in seconds
     */
    update(deltaTime) {
        if (!this.camera) return;

        // 1. Calculate camera forward horizontal viewing direction (X-Z plane)
        this.camera.getWorldDirection(this._camDir);
        const lookX = this._camDir.x;
        const lookZ = this._camDir.z;
        const len = Math.hypot(lookX, lookZ) || 1;
        const nx = lookX / len;
        const nz = lookZ / len;

        // 2. Compute facing alignment score for each wall (dot product with wall normal direction from center)
        this.scores.front = -nz;
        this.scores.left  = -nx;
        this.scores.back  = nz;
        this.scores.right = nx;

        // 3. Determine the single primary facing wall
        let maxScore = -Infinity;
        let primary = 'front';
        for (const [key, score] of Object.entries(this.scores)) {
            if (score > maxScore) {
                maxScore = score;
                primary = key;
            }
        }
        this.primaryFacingWall = primary;

        // 4. Apply hysteresis visibility scoping and smooth opacity to each wall group
        for (const [wallKey, wallInstance] of Object.entries(this.walls)) {
            if (!wallInstance || !wallInstance.group) continue;

            const score = this.scores[wallKey];
            const group = wallInstance.group;
            const wasVisible = this.wallStates[wallKey] !== undefined ? this.wallStates[wallKey] : true;
            let isVisible = wasVisible;

            // Hysteresis state transition
            if (wasVisible) {
                // Falling edge: only hide if score drops below hideThreshold (0.25)
                if (score < this.hideThreshold) {
                    isVisible = false;
                }
            } else {
                // Rising edge: only re-show if score exceeds showThreshold (0.40)
                if (score > this.showThreshold) {
                    isVisible = true;
                }
            }

            this.wallStates[wallKey] = isVisible;
            group.visible = isVisible;

            if (isVisible) {
                // Calculate smooth opacity factor between hideThreshold (0.25) and fullThreshold (0.70)
                const alpha = THREE.MathUtils.clamp(
                    (score - this.hideThreshold) / (this.fullThreshold - this.hideThreshold),
                    0.0,
                    1.0
                );

                // Apply opacity to child mesh materials
                group.traverse((child) => {
                    if (child.isMesh && child.material) {
                        const mats = Array.isArray(child.material) ? child.material : [child.material];
                        mats.forEach((mat) => {
                            const cached = this._materialOpacities.get(mat);
                            if (cached) {
                                if (alpha < 0.99) {
                                    mat.transparent = true;
                                    mat.opacity = cached.opacity * alpha;
                                } else {
                                    mat.transparent = cached.transparent;
                                    mat.opacity = cached.opacity;
                                }
                            }
                        });
                    }
                });
            }
        }
    }

    /**
     * Get the current primary facing wall ID ('front', 'left', 'back', 'right')
     * @returns {string}
     */
    getFacingWall() {
        return this.primaryFacingWall;
    }

    /**
     * Get current alignment scores for all 4 walls
     * @returns {{ front: number, left: number, back: number, right: number }}
     */
    getScores() {
        return { ...this.scores };
    }
}
