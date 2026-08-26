/**
 * ObjectInteractionManager - Raycasting, Subtle Hover Feedback & Click-to-Explore Subsystem
 * Casts precision rays from camera through pointer NDC to detect registered 3D hardware objects,
 * displays a compact spatially-anchored "CLICK TO EXPLORE" indicator, highlights objects with a subtle
 * solid emissive edge response, and triggers exploration transitions.
 */

import * as THREE from 'three';

export class ObjectInteractionManager {
    constructor(camera, scene, pointerTracker = null) {
        this.camera = camera;
        this.scene = scene;
        this.pointerTracker = pointerTracker;
        this.raycaster = new THREE.Raycaster();
        this.mouseNDC = new THREE.Vector2(0, 0);

        // Registry of interactive targets
        this.interactiveTargets = [];
        this.targetMeshes = [];
        this.visibleTargetMeshes = [];

        // Active Hover State
        this.hoveredTarget = null;
        this.hoverProgress = 0.0;
        this.isEnabled = true;

        // Hover Highlight State Management
        this.originalEmissives = new Map(); // mesh -> original emissive hex/intensity
        this.highlightIntensity = 0.0;

        // Small 3D Spatial Prompt Object
        this.promptGroup = null;
        this.promptCanvas = null;
        this.promptContext = null;
        this.promptTexture = null;
        this.promptMesh = null;

        // Click handler callback
        this.clickListeners = new Set();

        this._onClick = this._onClick.bind(this);

        this._initSpatialPrompt();
        this._bindClick();
    }

    /**
     * Create compact 3D billboarded spatial prompt "[ CLICK TO EXPLORE ]"
     * @private
     */
    _initSpatialPrompt() {
        this.promptGroup = new THREE.Group();
        this.promptGroup.name = 'SpatialHoverPrompt';
        this.promptGroup.visible = false;

        // 2D High-Resolution Canvas for crisp subtle rendering (512x128)
        this.promptCanvas = document.createElement('canvas');
        this.promptCanvas.width = 512;
        this.promptCanvas.height = 128;
        this.promptContext = this.promptCanvas.getContext('2d');

        this.promptTexture = new THREE.CanvasTexture(this.promptCanvas);
        this.promptTexture.minFilter = THREE.LinearFilter;

        const geom = new THREE.PlaneGeometry(1.2, 0.30);
        const mat = new THREE.MeshBasicMaterial({
            map: this.promptTexture,
            transparent: true,
            opacity: 0.0,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        this.promptMesh = new THREE.Mesh(geom, mat);
        this.promptMesh.renderOrder = 20;
        this.promptGroup.add(this.promptMesh);

        if (this.scene) {
            this.scene.add(this.promptGroup);
        }

        this._renderPromptCanvas();
    }

    /**
     * Render compact technical text and amber bracket to canvas
     * @private
     */
    _renderPromptCanvas() {
        const ctx = this.promptContext;
        if (!ctx) return;

        ctx.clearRect(0, 0, 512, 128);

        // Dark Smoked Background Pill
        ctx.fillStyle = 'rgba(8, 11, 18, 0.92)';
        ctx.beginPath();
        ctx.roundRect(24, 20, 464, 88, 8);
        ctx.fill();

        // Glowing Amber Border
        ctx.strokeStyle = '#ff9d00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(24, 20, 464, 88, 8);
        ctx.stroke();

        // Corner Technical Bracket Accents
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        const b = 14;
        // Left bracket
        ctx.beginPath();
        ctx.moveTo(34, 40);
        ctx.lineTo(24, 40);
        ctx.lineTo(24, 88);
        ctx.lineTo(34, 88);
        ctx.stroke();
        // Right bracket
        ctx.beginPath();
        ctx.moveTo(478, 40);
        ctx.lineTo(488, 40);
        ctx.lineTo(488, 88);
        ctx.lineTo(478, 88);
        ctx.stroke();

        // Hexagon Icon
        ctx.fillStyle = '#ff9d00';
        ctx.font = 'bold 26px monospace';
        ctx.fillText('⬡', 46, 73);

        // Main Text "CLICK TO EXPLORE"
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px "JetBrains Mono", monospace';
        ctx.fillText('CLICK TO EXPLORE', 92, 72);

        // Micro-status indicator
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(456, 64, 5, 0, Math.PI * 2);
        ctx.fill();

        this.promptTexture.needsUpdate = true;
    }

    /**
     * Bind click listener to window to catch clicks on hovered interactive objects
     * @private
     */
    _bindClick() {
        window.addEventListener('click', this._onClick);
    }

    /**
     * Open an inspection only for a deliberate click/tap, never the click emitted
     * after orbiting the camera.
     * @private
     */
    _onClick(event) {
        if (!this.isEnabled || (this.pointerTracker && this.pointerTracker.didDrag)) return;

        // Only trigger if click wasn't consumed by UI element
        const targetEl = event.target;
        if (targetEl && (targetEl.closest('.inspection-panel') || targetEl.closest('.inspection-close') || targetEl.closest('button'))) {
            return;
        }

        let clickedTarget = null;

        // Always raycast from the click itself. The hover state can be one frame
        // old if a visitor moves and clicks quickly.
        if (this.camera && this.targetMeshes.length > 0 && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
            const clickNDC = new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2.0 - 1.0,
                -(event.clientY / window.innerHeight) * 2.0 + 1.0
            );
            this.raycaster.setFromCamera(clickNDC, this.camera);
            const intersects = this.raycaster.intersectObjects(this._getVisibleTargetMeshes(), false);
            if (intersects.length > 0) {
                for (const hit of intersects) {
                    if (hit.object.userData && hit.object.userData.interactiveTarget) {
                        clickedTarget = hit.object.userData.interactiveTarget;
                        break;
                    }
                }
            }
        } else {
            clickedTarget = this.hoveredTarget;
        }

        if (clickedTarget) {
            this.clickListeners.forEach(listener => listener(clickedTarget));
        }
    }

    /**
     * Register an interactive 3D object
     * @param {Object} config 
     * @param {string} config.id Unique identifier
     * @param {string} config.title Display title
     * @param {string} config.category Engineering discipline category
     * @param {string} config.description Concise engineering summary
     * @param {Array<string>} [config.features] List of key features/bullet points
     * @param {Object} [config.technicalData] Key-value dictionary of specs
     * @param {THREE.Object3D} config.mesh 3D Mesh / Group for collision
     * @param {THREE.Vector3} config.anchorPoint World-space connection point for prompt
     * @param {THREE.Vector3} [config.boundsSize] Tight physical bounding dimensions
     * @param {Function} [config.getData] Dynamic parameters callback
     */
    /**
     * Register an interactive 3D object with strict per-mesh material isolation
     * @param {Object} config 
     * @param {string} config.id Unique identifier
     * @param {string} config.title Display title
     * @param {string} config.category Engineering discipline category
     * @param {string} config.description Concise engineering summary
     * @param {Array<string>} [config.features] List of key features/bullet points
     * @param {Object} [config.technicalData] Key-value dictionary of specs
     * @param {THREE.Object3D} config.mesh 3D Mesh / Group for collision
     * @param {THREE.Vector3} config.anchorPoint World-space connection point for prompt
     * @param {Function} [config.getData] Dynamic parameters callback
     */
    registerTarget(config) {
        if (!config || !config.mesh) return;

        this.interactiveTargets.push(config);

        // Collect all physical child meshes and isolate their materials to prevent shared-material mutation.
        // Environment geometry (userData.isEnvironment === true) is excluded from the raycast layer (C4).
        config.mesh.traverse((child) => {
            if (child.isMesh && child.userData.isEnvironment !== true) {
                // Clone material so changes to this interactive object never bleed into walls, rails, or architecture
                if (child.material && config.id !== 'robot') {
                    if (Array.isArray(child.material)) {
                        child.material = child.material.map(m => m.clone());
                    } else {
                        child.material = child.material.clone();
                    }
                }

                child.userData.interactiveTarget = config;
                child.userData.interactiveRootId = config.id;
                this.targetMeshes.push(child);
            }
        });
    }

    /**
     * Subscribe to object click event
     * @param {Function} listener 
     * @returns {Function} Unsubscribe function
     */
    onClickTarget(listener) {
        this.clickListeners.add(listener);
        return () => this.clickListeners.delete(listener);
    }

    /**
     * Enable raycasting and hover prompt
     */
    enable() {
        this.isEnabled = true;
    }

    /**
     * Disable raycasting (e.g. during exploration mode)
     */
    disable() {
        this.isEnabled = false;
        this._clearHover();
    }

    /**
     * Clear active hover state and restore meshes immediately
     * @private
     */
    _clearHover() {
        if (this.hoveredTarget) {
            this._restoreMeshHighlight(this.hoveredTarget);
            this.hoveredTarget = null;
        }
        this.hoverProgress = 0.0;
        if (this.promptGroup) {
            this.promptGroup.visible = false;
        }
    }

    /**
     * Apply subtle hover response to object meshes without making them transparent or tinting the robot
     * @private
     * @param {Object} target 
     * @param {number} intensity [0 to 1]
     */
    _applyMeshHighlight(target, intensity) {
        if (!target || !target.mesh) return;

        // Strict Requirement: NEVER tint, recolor, or modify robot arm materials on hover
        if (target.id === 'robot') return;

        const highlightColor = new THREE.Color(0xffffff);

        target.mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach(mat => {
                    if (mat && mat.emissive) {
                        if (!this.originalEmissives.has(mat)) {
                            this.originalEmissives.set(mat, {
                                color: mat.emissive.clone(),
                                intensity: mat.emissiveIntensity !== undefined ? mat.emissiveIntensity : 0
                            });
                        }
                        const orig = this.originalEmissives.get(mat);
                        mat.emissive.lerpColors(orig.color, highlightColor, intensity * 0.15);
                        mat.emissiveIntensity = THREE.MathUtils.lerp(orig.intensity, 0.12, intensity);
                    }
                });
            }
        });
    }

    /**
     * Restore original mesh emissive properties immediately
     * @private
     * @param {Object} target 
     */
    _restoreMeshHighlight(target) {
        if (!target || !target.mesh) return;

        // Skip robot arm since it was never modified
        if (target.id === 'robot') return;

        target.mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach(mat => {
                    if (mat && this.originalEmissives.has(mat)) {
                        const orig = this.originalEmissives.get(mat);
                        mat.emissive.copy(orig.color);
                        if (mat.emissiveIntensity !== undefined) {
                            mat.emissiveIntensity = orig.intensity;
                        }
                        this.originalEmissives.delete(mat);
                    }
                });
            }
        });
    }

    /**
     * Raycasting individual meshes bypasses parent visibility in Three.js, so
     * discard targets inside walls or groups currently hidden from the camera.
     * @private
     * @returns {THREE.Mesh[]}
     */
    _getVisibleTargetMeshes() {
        this.visibleTargetMeshes.length = 0;

        for (const mesh of this.targetMeshes) {
            let node = mesh;
            let isVisible = true;
            while (node) {
                if (node.visible === false) {
                    isVisible = false;
                    break;
                }
                node = node.parent;
            }
            if (isVisible) {
                this.visibleTargetMeshes.push(mesh);
            }
        }

        return this.visibleTargetMeshes;
    }

    /**
     * Per-frame update: Raycast against ONLY registered target meshes and animate spatial hover prompt
     * @param {number} deltaTime 
     * @param {Object} pointerTracker 
     * @param {SpatialCursor} [spatialCursor] 
     */
    update(deltaTime, pointerTracker, spatialCursor) {
        // Immediately clear hover when drag begins — prevents stale emissive highlight during camera orbit (C3)
        if (pointerTracker && pointerTracker.isDragging) {
            this._clearHover();
            return;
        }

        if (!this.isEnabled || !this.camera || !pointerTracker) {
            if (this.promptGroup) this.promptGroup.visible = false;
            return;
        }

        // Raycasting against registered interactive meshes only
        let hitTarget = null;
        if (pointerTracker.hasMovedEver && !pointerTracker.isDragging) {
            this.mouseNDC.set(pointerTracker.normalizedX, pointerTracker.normalizedY);
            this.raycaster.setFromCamera(this.mouseNDC, this.camera);

            const intersects = this.raycaster.intersectObjects(this._getVisibleTargetMeshes(), false);
            if (intersects.length > 0) {
                for (const hit of intersects) {
                    if (hit.object.userData && hit.object.userData.interactiveTarget) {
                        hitTarget = hit.object.userData.interactiveTarget;
                        break;
                    }
                }
            }
        }

        // Hover State Transitions (Strict: 0 or 1 object active)
        if (hitTarget) {
            if (this.hoveredTarget !== hitTarget) {
                if (this.hoveredTarget) {
                    this._restoreMeshHighlight(this.hoveredTarget);
                }
                this.hoveredTarget = hitTarget;
                this.hoverProgress = 1.0;
            }

            this._applyMeshHighlight(this.hoveredTarget, this.hoverProgress);

            if (spatialCursor) {
                spatialCursor.setMode('hover', 'EXPLORE');
            }

            // Position and billboard the 3D prompt
            if (this.promptGroup && this.promptMesh) {
                this.promptGroup.visible = true;
                this.promptMesh.material.opacity = 1.0;

                // Calculate bounding center of physical target
                const box = new THREE.Box3().setFromObject(this.hoveredTarget.mesh);
                const targetCenter = new THREE.Vector3();
                box.getCenter(targetCenter);
                const promptY = Math.max(targetCenter.y + 0.35, box.max.y + 0.20);

                this.promptGroup.position.set(targetCenter.x, promptY, targetCenter.z);

                // Billboard smoothly toward camera
                this.promptGroup.quaternion.copy(this.camera.quaternion);
            }
        } else {
            // No hit: Instantly clear hover
            if (this.hoveredTarget) {
                this._restoreMeshHighlight(this.hoveredTarget);
                this.hoveredTarget = null;
            }
            this.hoverProgress = 0.0;

            if (spatialCursor) {
                spatialCursor.setMode('default');
            }

            if (this.promptGroup && this.promptMesh) {
                this.promptGroup.visible = false;
                this.promptMesh.material.opacity = 0.0;
            }
        }

        // Update 3D Spatial Prompt position, scale and billboarding
        if (this.promptGroup && this.hoveredTarget && this.hoverProgress > 0.01) {
            this.promptGroup.visible = true;

            // Anchor point
            let anchor = new THREE.Vector3();
            if (this.hoveredTarget.id === 'robot') {
                anchor.set(0, 1.6, 0);
            } else if (this.hoveredTarget.mesh) {
                const box = new THREE.Box3().setFromObject(this.hoveredTarget.mesh);
                box.getCenter(anchor);
                anchor.y = Math.max(anchor.y + 0.35, box.max.y + 0.18);
            } else if (this.hoveredTarget.anchorPoint) {
                anchor.copy(this.hoveredTarget.anchorPoint);
                anchor.y += 0.35;
            }

            this.promptGroup.position.copy(anchor);

            // Billboard towards camera
            this.promptGroup.quaternion.copy(this.camera.quaternion);

            // Distance adaptive scale
            const dist = this.camera.position.distanceTo(anchor);
            const scale = THREE.MathUtils.clamp(dist / 9.0, 0.75, 1.25);
            this.promptGroup.scale.set(scale, scale, scale);

            if (this.promptMesh && this.promptMesh.material) {
                this.promptMesh.material.opacity = THREE.MathUtils.smoothstep(this.hoverProgress, 0, 1) * 0.95;
            }
        } else if (this.promptGroup) {
            this.promptGroup.visible = false;
        }
    }

    /**
     * Get active hover target
     * @returns {Object|null}
     */
    getActiveTarget() {
        return this.hoveredTarget;
    }

    /**
     * Release transient DOM listeners when this manager is discarded.
     */
    destroy() {
        window.removeEventListener('click', this._onClick);
        this._clearHover();
        this.clickListeners.clear();
        this.interactiveTargets = [];
        this.targetMeshes = [];
        this.visibleTargetMeshes = [];
    }

    /**
     * Mark all descendant meshes of an Object3D as environment geometry
     * (excluded from interactive raycasting)
     * @param {THREE.Object3D} object3D
     */
    static markAsEnvironment(object3D) {
        if (!object3D) return;
        object3D.traverse((child) => {
            if (child.isMesh) {
                child.userData.isEnvironment = true;
            }
        });
    }
}
