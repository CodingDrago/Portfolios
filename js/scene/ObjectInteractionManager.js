/**
 * ObjectInteractionManager - Raycasting, Subtle Hover Feedback & Click-to-Explore Subsystem
 * Casts precision rays from camera through pointer NDC to detect registered 3D hardware objects,
 * displays a compact spatially-anchored "CLICK TO EXPLORE" indicator, highlights objects with a subtle
 * solid emissive edge response, and triggers exploration transitions.
 */

import * as THREE from 'three';

export class ObjectInteractionManager {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
        this.mouseNDC = new THREE.Vector2(0, 0);

        // Registry of interactive targets
        this.interactiveTargets = [];
        this.targetMeshes = [];

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
        window.addEventListener('click', (event) => {
            if (!this.isEnabled || !this.hoveredTarget) return;

            // Only trigger if click wasn't consumed by UI element
            const targetEl = event.target;
            if (targetEl && (targetEl.closest('.inspection-panel') || targetEl.closest('.inspection-close') || targetEl.closest('button'))) {
                return;
            }

            // Notify subscribers of clicked target
            const target = this.hoveredTarget;
            this.clickListeners.forEach(listener => listener(target));
        });
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
    registerTarget(config) {
        if (!config) return;

        this.interactiveTargets.push(config);

        // Collect all child meshes from the object for precise raycasting
        if (config.mesh) {
            config.mesh.traverse((child) => {
                if (child.isMesh) {
                    child.userData.targetConfig = config;
                    this.targetMeshes.push(child);
                }
            });
        }

        // Bounding volume for reliable raycasting hitbox
        const bounds = config.boundsSize || new THREE.Vector3(0.6, 0.4, 0.5);
        const boundGeom = new THREE.BoxGeometry(bounds.x, bounds.y, bounds.z);
        const boundMat = new THREE.MeshBasicMaterial({ visible: false });
        const boundMesh = new THREE.Mesh(boundGeom, boundMat);
        boundMesh.position.copy(config.anchorPoint || new THREE.Vector3(0, 0, 0));
        boundMesh.userData.targetConfig = config;

        if (this.scene) {
            this.scene.add(boundMesh);
        }
        this.targetMeshes.push(boundMesh);
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
     * Clear active hover state and restore meshes
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

        const amberColor = new THREE.Color(0xff9d00);

        target.mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                const mat = child.material;
                if (mat.emissive) {
                    if (!this.originalEmissives.has(child)) {
                        this.originalEmissives.set(child, {
                            color: mat.emissive.clone(),
                            intensity: mat.emissiveIntensity !== undefined ? mat.emissiveIntensity : 0
                        });
                    }
                    mat.emissive.lerpColors(this.originalEmissives.get(child).color, amberColor, intensity * 0.25);
                    mat.emissiveIntensity = THREE.MathUtils.lerp(this.originalEmissives.get(child).intensity, 0.35, intensity);
                }
            }
        });
    }

    /**
     * Restore original mesh emissive properties
     * @private
     * @param {Object} target 
     */
    _restoreMeshHighlight(target) {
        if (!target || !target.mesh) return;

        // Skip robot arm since it was never modified
        if (target.id === 'robot') return;

        target.mesh.traverse((child) => {
            if (child.isMesh && child.material && this.originalEmissives.has(child)) {
                const orig = this.originalEmissives.get(child);
                child.material.emissive.copy(orig.color);
                if (child.material.emissiveIntensity !== undefined) {
                    child.material.emissiveIntensity = orig.intensity;
                }
                this.originalEmissives.delete(child);
            }
        });
    }

    /**
     * Per-frame update: Raycast against interactive meshes and animate spatial hover prompt
     * @param {number} deltaTime 
     * @param {Object} pointerTracker 
     * @param {SpatialCursor} [spatialCursor] 
     */
    update(deltaTime, pointerTracker, spatialCursor) {
        if (!this.isEnabled || !this.camera || !pointerTracker) {
            if (this.promptGroup) this.promptGroup.visible = false;
            return;
        }

        // Raycasting
        let hitTarget = null;
        if (pointerTracker.hasMovedEver && !pointerTracker.isDragging) {
            this.mouseNDC.set(pointerTracker.normalizedX, pointerTracker.normalizedY);
            this.raycaster.setFromCamera(this.mouseNDC, this.camera);

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

        // Hover State Transitions
        if (hitTarget) {
            if (this.hoveredTarget !== hitTarget) {
                if (this.hoveredTarget) {
                    this._restoreMeshHighlight(this.hoveredTarget);
                }
                this.hoveredTarget = hitTarget;
            }

            this.hoverProgress = Math.min(1.0, this.hoverProgress + deltaTime * 8.0);
            this._applyMeshHighlight(this.hoveredTarget, this.hoverProgress);

            if (spatialCursor) {
                spatialCursor.setMode('hover', 'EXPLORE');
            }
        } else {
            this.hoverProgress = Math.max(0.0, this.hoverProgress - deltaTime * 6.0);
            if (this.hoveredTarget) {
                this._applyMeshHighlight(this.hoveredTarget, this.hoverProgress);
                if (this.hoverProgress <= 0.0) {
                    this._restoreMeshHighlight(this.hoveredTarget);
                    this.hoveredTarget = null;
                }
            }

            if (spatialCursor && !pointerTracker.isDragging) {
                spatialCursor.setMode('default');
            }
        }

        // Update 3D Spatial Prompt
        if (this.promptGroup && this.hoveredTarget && this.hoverProgress > 0.01) {
            this.promptGroup.visible = true;

            // Position prompt slightly above object anchor point
            let anchor = this.hoveredTarget.anchorPoint
                ? this.hoveredTarget.anchorPoint.clone()
                : new THREE.Vector3(0, 0, 0);

            // Dynamic anchor for robot arm shoulder
            if (this.hoveredTarget.id === 'robot' && this.hoveredTarget.mesh) {
                anchor.set(0, 1.8, 0);
            } else {
                anchor.y += 0.45;
            }

            this.promptGroup.position.copy(anchor);

            // Billboard towards camera
            this.promptGroup.quaternion.copy(this.camera.quaternion);

            // Adaptive scale based on camera distance
            const dist = this.camera.position.distanceTo(anchor);
            const scale = THREE.MathUtils.clamp(dist / 10.0, 0.75, 1.3);
            this.promptGroup.scale.set(scale, scale, scale);

            // Opacity
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
}
