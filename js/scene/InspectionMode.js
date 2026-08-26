/**
 * InspectionMode - Master Spatial Object Exploration Controller & Lifecycle Manager
 * Coordinates state transitions, smooth physical object translation to inspection space,
 * hierarchy preservation, holographic environment activation, 360° orbit camera,
 * right-side technical data panel, upper-right exit button, and exact transform return.
 */

import * as THREE from 'three';
import { CONFIG, STATES } from '../config.js';

export class InspectionMode {
    constructor({ scene, camera, lighting, stateManager, spatialCursor, interactionManager, holographicInspector, inspectionCamera }) {
        this.scene = scene;
        this.camera = camera;
        this.lighting = lighting;
        this.stateManager = stateManager;
        this.spatialCursor = spatialCursor;
        this.interactionManager = interactionManager;
        this.holographicInspector = holographicInspector;
        this.inspectionCamera = inspectionCamera;

        // Active State
        this.isExploring = false;
        this.currentStage = STATES.NORMAL;
        this.activeTarget = null;
        this.hasExploredOnce = false;

        // Transition Animation Variables
        this.transitionProgress = 0.0;
        this.transitionDuration = CONFIG.inspection.transitionDuration || 0.85;
        this.isTransitioning = false;
        this.transitionDirection = 1; // 1 = entering, -1 = exiting

        // Stored Exact Original Transform State
        this.storedTransform = {
            position: new THREE.Vector3(),
            quaternion: new THREE.Quaternion(),
            scale: new THREE.Vector3(),
            parent: null,
            worldPosition: new THREE.Vector3(),
            worldQuaternion: new THREE.Quaternion(),
            exitStartCamPos: new THREE.Vector3(),
            exitStartCamQuat: new THREE.Quaternion(),
            inspectionCamPos: new THREE.Vector3(),
            inspectionCamQuat: new THREE.Quaternion()
        };

        // Inspection Dedicated World Space Position (Slightly left of center to balance right panel)
        this.inspectionPosition = new THREE.Vector3(-0.6, 0.4, 0.0);
        this.inspectionScale = new THREE.Vector3(1, 1, 1);

        // DOM Handles
        this.panelElement = null;
        this.closeButtonElement = null;
        this.introInstructionElement = null;

        this._initDOM();
        this._bindEvents();

        // The hint starts only after the boot overlay finishes; otherwise a boot
        // skip click would dismiss it before the visitor can ever see it.
        this._introAutoDismissTimer = null;
        this._introPointerHandler = () => this._dismissIntro();
    }

    /**
     * Create Right-Side Technical Information Panel & Exit 'X' Button in DOM
     * @private
     */
    _initDOM() {
        // 1. Right-Side Technical Inspection Panel
        const panel = document.createElement('aside');
        panel.id = 'inspection-panel';
        panel.className = 'inspection-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <span class="panel-category" id="inspect-category">SUBSYSTEM</span>
                <h2 class="panel-title" id="inspect-title">DEVICE INSPECTION</h2>
                <p class="panel-desc" id="inspect-desc">Technical telemetry and physical component overview.</p>
            </div>
            <div class="panel-divider"></div>
            <div class="panel-section">
                <h3 class="section-title">KEY FEATURES</h3>
                <ul class="features-list" id="inspect-features"></ul>
            </div>
            <div class="panel-section">
                <h3 class="section-title">TECHNICAL SPECIFICATIONS</h3>
                <div class="specs-grid" id="inspect-specs"></div>
            </div>
            <div class="panel-footer">
                <span class="footer-tag">360° SPATIAL INSPECTION</span>
                <span class="footer-hint">DRAG TO ORBIT · SCROLL TO ZOOM</span>
            </div>
        `;
        document.body.appendChild(panel);
        this.panelElement = panel;

        // 2. Upper-Right Exit 'X' Button
        const closeBtn = document.createElement('button');
        closeBtn.id = 'inspection-close-btn';
        closeBtn.className = 'inspection-close';
        closeBtn.setAttribute('aria-label', 'Exit Inspection Mode');
        closeBtn.innerHTML = `
            <span class="close-icon">✕</span>
            <span class="close-label">EXIT</span>
        `;
        document.body.appendChild(closeBtn);
        this.closeButtonElement = closeBtn;

        // 3. Initial Subtle Holographic Instruction
        const intro = document.createElement('div');
        intro.id = 'workstation-intro-hint';
        intro.className = 'workstation-intro-hint';
        intro.innerHTML = `
            <div class="intro-box">
                <div class="intro-tag">SPATIAL LAB // CELL-01</div>
                <div class="intro-title">EXPLORE THE WORKSTATION</div>
                <div class="intro-sub">Hover over an object then click to inspect it</div>
            </div>
        `;
        document.body.appendChild(intro);
        this.introInstructionElement = intro;
    }

    /**
     * Bind button click and hover events
     * @private
     */
    _bindEvents() {
        if (this.closeButtonElement) {
            this.closeButtonElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.exitExploration();
            });

            this.closeButtonElement.addEventListener('mouseenter', () => {
                if (this.spatialCursor) {
                    this.spatialCursor.setMode('action', 'EXIT');
                }
            });

            this.closeButtonElement.addEventListener('mouseleave', () => {
                if (this.spatialCursor && this.isExploring) {
                    this.spatialCursor.setMode('default');
                }
            });
        }

        // Connect click-to-explore from ObjectInteractionManager
        if (this.interactionManager) {
            this.interactionManager.onClickTarget((target) => {
                if (!this.isExploring && target) {
                    this.enterExploration(target);
                }
            });
        }

        // Keyboard shortcut: Escape key to exit inspection
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isExploring && !this.isTransitioning) {
                this.exitExploration();
            }
        });

        // Prevent dragging on the inspection panel from triggering 3D orbit
        if (this.panelElement) {
            this.panelElement.addEventListener('pointerdown', (e) => e.stopPropagation());
            this.panelElement.addEventListener('wheel', (e) => e.stopPropagation());
        }
    }

    /**
     * Dismiss the initial intro instruction hint permanently
     * @private
     */
    _dismissIntro() {
        if (this.introInstructionElement && !this.introInstructionElement.classList.contains('fade-out')) {
            this.introInstructionElement.classList.add('fade-out');
            // Remove from DOM after CSS transition completes
            setTimeout(() => {
                if (this.introInstructionElement && this.introInstructionElement.parentElement) {
                    this.introInstructionElement.parentElement.removeChild(this.introInstructionElement);
                }
            }, 1000);
        }
        clearTimeout(this._introAutoDismissTimer);
        window.removeEventListener('pointerdown', this._introPointerHandler);
    }

    /**
     * Start the post-boot exploration hint lifecycle.
     */
    startIntroTimer() {
        if (!this.introInstructionElement || this.hasExploredOnce || this._introAutoDismissTimer) return;

        this._introAutoDismissTimer = setTimeout(() => this._dismissIntro(), 5000);
        window.addEventListener('pointerdown', this._introPointerHandler, { once: true });
    }

    /**
     * Populate the right-side information panel with object metadata
     * @private
     * @param {Object} target 
     */
    _populatePanel(target) {
        if (!target) return;

        const catEl = document.getElementById('inspect-category');
        const titleEl = document.getElementById('inspect-title');
        const descEl = document.getElementById('inspect-desc');
        const featList = document.getElementById('inspect-features');
        const specsGrid = document.getElementById('inspect-specs');

        if (catEl) catEl.textContent = target.category || 'HARDWARE SUBSYSTEM';
        if (titleEl) titleEl.textContent = target.title || 'COMPONENT TELEMETRY';
        if (descEl) descEl.textContent = target.description || '';

        // Key Features
        if (featList) {
            featList.innerHTML = '';
            const features = target.features || [
                'Precision calibrated hardware node',
                'Isolated 3D spatial telemetry stream',
                'Real-time bus integrity verification'
            ];
            features.forEach(f => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="bullet">▹</span> ${f}`;
                featList.appendChild(li);
            });
        }

        // Technical Specs
        if (specsGrid) {
            specsGrid.innerHTML = '';
            const rows = (target.getData ? target.getData() : []) || [];
            if (rows.length > 0) {
                rows.forEach(([k, v, color]) => {
                    const row = document.createElement('div');
                    row.className = 'spec-row';
                    row.innerHTML = `
                        <span class="spec-key">${k}</span>
                        <span class="spec-val" style="color: ${color || '#ff9d00'}">${v}</span>
                    `;
                    specsGrid.appendChild(row);
                });
            } else if (target.technicalData) {
                Object.entries(target.technicalData).forEach(([k, v]) => {
                    const row = document.createElement('div');
                    row.className = 'spec-row';
                    row.innerHTML = `
                        <span class="spec-key">${k}:</span>
                        <span class="spec-val">${v}</span>
                    `;
                    specsGrid.appendChild(row);
                });
            }
        }
    }

    /**
     * Enter 3D Exploration Mode for a registered interactive object
     * @param {Object} target 
     */
    enterExploration(target) {
        if (!target || !target.mesh) return;

        console.log(`[InspectionMode] Entering exploration mode for: ${target.id}`);
        this.isExploring = true;
        this.activeTarget = target;
        this.hasExploredOnce = true;

        // Permanently fade initial intro instruction.
        this._dismissIntro();

        // Update State Manager
        if (this.stateManager) {
            this.stateManager.setState(STATES.ENTERING_EXPLORATION, { targetId: target.id });
        }

        // Disable normal hover raycasting during inspection
        if (this.interactionManager) {
            this.interactionManager.disable();
        }

        // 1. Store EXACT original local transform and parent
        const obj = target.mesh;
        this.storedTransform.position.copy(obj.position);
        this.storedTransform.quaternion.copy(obj.quaternion);
        this.storedTransform.scale.copy(obj.scale);
        this.storedTransform.parent = obj.parent;

        // Attach to scene while preserving exact world transform
        if (this.scene && obj.parent && obj.parent !== this.scene) {
            this.scene.attach(obj);
        }

        // Store world transform for smooth interpolation in world space
        this.storedTransform.worldPosition.copy(obj.position);
        this.storedTransform.worldQuaternion.copy(obj.quaternion);

        // 2. Setup transition animation variables
        this.transitionProgress = 0.0;
        this.isTransitioning = true;
        this.transitionDirection = 1;

        // 3. Determine inspection framing center
        let inspectCenter = this.inspectionPosition.clone();
        if (target.id === 'robot') {
            inspectCenter.set(-0.4, 0.2, 0.0);
        }

        // 4. Activate Holographic Environment around inspection space
        if (this.holographicInspector) {
            this.holographicInspector.activate(inspectCenter);
        }

        // 5. Activate Dedicated Inspection Camera
        const customDist = target.boundsSize
            ? Math.max(target.boundsSize.x, target.boundsSize.y, target.boundsSize.z) * 2.8
            : (CONFIG.inspection.inspectionDistance || 4.8);

        if (this.inspectionCamera) {
            this.inspectionCamera.activate(inspectCenter, customDist);
        }

        // 6. Populate and show Right-Side Information Panel & Exit Button
        this._populatePanel(target);
        if (this.panelElement) {
            this.panelElement.classList.add('visible');
        }
        if (this.closeButtonElement) {
            this.closeButtonElement.classList.add('visible');
        }
    }

    /**
     * Exit 3D Exploration Mode and restore physical workstation
     */
    exitExploration() {
        if (!this.isExploring || !this.activeTarget) return;

        console.log('[InspectionMode] Exiting exploration mode...');
        this.isTransitioning = true;
        this.transitionDirection = -1;

        // Record camera start pose for smooth exit blend back to workstation camera
        if (this.camera) {
            this.storedTransform.exitStartCamPos.copy(this.camera.position);
            this.storedTransform.exitStartCamQuat.copy(this.camera.quaternion);
        }

        if (this.stateManager) {
            this.stateManager.setState(STATES.EXITING_EXPLORATION);
        }

        // 1. Hide UI Panel & Exit Button
        if (this.panelElement) {
            this.panelElement.classList.remove('visible');
        }
        if (this.closeButtonElement) {
            this.closeButtonElement.classList.remove('visible');
        }

        // 2. Power down holographic environment
        if (this.holographicInspector) {
            this.holographicInspector.deactivate();
        }

        // 3. Deactivate inspection camera
        if (this.inspectionCamera) {
            this.inspectionCamera.deactivate();
        }
    }

    /**
     * Complete exit transition after object has returned to exact workstation transform
     * @private
     */
    _completeExit() {
        this.isExploring = false;
        this.isTransitioning = false;

        // Restore exact transforms and hierarchy
        if (this.activeTarget && this.activeTarget.mesh) {
            const obj = this.activeTarget.mesh;
            if (this.storedTransform.parent && this.storedTransform.parent !== this.scene) {
                this.storedTransform.parent.attach(obj);
            }
            obj.position.copy(this.storedTransform.position);
            obj.quaternion.copy(this.storedTransform.quaternion);
            obj.scale.copy(this.storedTransform.scale);
        }

        this.activeTarget = null;

        // Re-enable normal workstation hover raycasting
        if (this.interactionManager) {
            this.interactionManager.enable();
        }

        // Update State Manager back to NORMAL / IDLE
        if (this.stateManager) {
            this.stateManager.setState(STATES.NORMAL);
        }

        if (this.spatialCursor) {
            this.spatialCursor.setMode('default');
        }
    }

    /**
     * Per-frame update for smooth physical transitions and camera updates
     * @param {number} deltaTime 
     * @param {Object} pointerTracker 
     */
    update(deltaTime, pointerTracker) {
        // Handle Transition Interpolation
        if (this.isTransitioning && this.activeTarget && this.activeTarget.mesh) {
            const step = (deltaTime / this.transitionDuration) * this.transitionDirection;
            this.transitionProgress = THREE.MathUtils.clamp(this.transitionProgress + step, 0, 1);

            const t = THREE.MathUtils.smoothstep(this.transitionProgress, 0, 1);
            const obj = this.activeTarget.mesh;

            let targetPos = this.inspectionPosition.clone();
            if (this.activeTarget.id === 'robot') {
                targetPos.set(-0.4, 0.2, 0.0);
            }

            // Smooth position interpolation in world space
            obj.position.lerpVectors(this.storedTransform.worldPosition, targetPos, t);

            // Subtle smooth tilt orientation during inspection
            const inspectQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.15);
            obj.quaternion.slerpQuaternions(this.storedTransform.worldQuaternion, inspectQuat, t);

            // Blend the camera into and out of inspection so neither transition jumps.
            if (this.camera && this.inspectionCamera) {
                if (this.transitionDirection === 1) {
                    this.inspectionCamera.getPose(
                        this.storedTransform.inspectionCamPos,
                        this.storedTransform.inspectionCamQuat
                    );
                    this.camera.position.lerpVectors(
                        this.inspectionCamera.savedCameraPosition,
                        this.storedTransform.inspectionCamPos,
                        t
                    );
                    this.camera.quaternion.slerpQuaternions(
                        this.inspectionCamera.savedCameraQuaternion,
                        this.storedTransform.inspectionCamQuat,
                        t
                    );
                } else {
                    this.camera.position.lerpVectors(
                        this.inspectionCamera.savedCameraPosition,
                        this.storedTransform.exitStartCamPos,
                        t
                    );
                    this.camera.quaternion.slerpQuaternions(
                        this.inspectionCamera.savedCameraQuaternion,
                        this.storedTransform.exitStartCamQuat,
                        t
                    );
                }
            }

            // Workstation Lighting Dim Factor Interpolation
            if (this.lighting && this.lighting.setDimLevel) {
                const targetDim = THREE.MathUtils.lerp(1.0, CONFIG.inspection.dimLevel || 0.28, t);
                this.lighting.setDimLevel(targetDim);
            }

            // Check completion
            if (this.transitionDirection === 1 && this.transitionProgress >= 1.0) {
                this.isTransitioning = false;
                if (this.stateManager) {
                    this.stateManager.setState(STATES.EXPLORING);
                }
            } else if (this.transitionDirection === -1 && this.transitionProgress <= 0.0) {
                this._completeExit();
            }
        }

        // Update Subsystems
        if (this.holographicInspector) {
            this.holographicInspector.update(deltaTime);
        }

        if (this.isExploring && !this.isTransitioning && this.inspectionCamera) {
            this.inspectionCamera.update(deltaTime, pointerTracker, this.spatialCursor);
        }
    }
}
