/**
 * SpatialInterfaces - Contextual Holographic Telemetry & Spatial Discovery System
 * Manages the single introductory spatial hologram and dynamic contextual inspection
 * panels with camera billboarding, physical object leader lines, and adaptive scaling.
 */

import * as THREE from 'three';

export class SpatialInterfaces {
    constructor(materials) {
        this.materials = materials;
        this.group = new THREE.Group();
        this.group.name = 'SpatialInterfacesGroup';

        this.time = 0;

        // 1. Intro Hologram References
        this.introGroup = null;
        this.introCanvas = null;
        this.introContext = null;
        this.introTexture = null;
        this.introOpacity = 1.0;

        // 2. Contextual Inspection Hologram References
        this.inspectGroup = null;
        this.inspectCanvas = null;
        this.inspectContext = null;
        this.inspectTexture = null;
        this.inspectDataMesh = null;
        this.inspectGlassMesh = null;
        this.inspectFrameMesh = null;
        this.inspectLine = null;
        this.activeTargetId = null;

        // Scanline Glitch State
        this.glitchTimer = 0.0;
        this.isGlitching = false;

        this._initIntroHologram();
        this._initContextualInspectionPanel();
    }

    /**
     * Build Single Floating Introduction Hologram
     * Teaching the user the spatial environment is interactive.
     * @private
     */
    _initIntroHologram() {
        const group = new THREE.Group();
        group.name = 'IntroHologram';
        group.position.set(0, 2.0, -0.6); // Positioned above robot shoulder

        const width = 2.4;
        const height = 1.1;
        const geom = new THREE.PlaneGeometry(width, height);

        // Smoked Translucent Backplane
        const glassMat = new THREE.MeshBasicMaterial({
            color: 0x060a12,
            transparent: true,
            opacity: 0.90,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const glassMesh = new THREE.Mesh(geom, glassMat);
        glassMesh.renderOrder = 8;
        group.add(glassMesh);

        // Glowing Amber Wireframe Border
        const wireGeom = new THREE.EdgesGeometry(geom);
        const wireMat = new THREE.LineBasicMaterial({
            color: 0xff9d00,
            transparent: true,
            opacity: 0.90
        });
        const wireMesh = new THREE.LineSegments(wireGeom, wireMat);
        wireMesh.renderOrder = 9;
        group.add(wireMesh);

        // High-Resolution 2D Canvas for Text (1024x512)
        this.introCanvas = document.createElement('canvas');
        this.introCanvas.width = 1024;
        this.introCanvas.height = 512;
        this.introContext = this.introCanvas.getContext('2d');

        this.introTexture = new THREE.CanvasTexture(this.introCanvas);
        this.introTexture.minFilter = THREE.LinearFilter;

        const textMat = new THREE.MeshBasicMaterial({
            map: this.introTexture,
            transparent: true,
            opacity: 0.98,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const textMesh = new THREE.Mesh(geom, textMat);
        textMesh.position.z = 0.005;
        textMesh.renderOrder = 10;
        group.add(textMesh);

        this.introGroup = group;
        this.group.add(group);
        this._renderIntroCanvas();
    }

    /**
     * Render Text on Introduction Hologram Canvas
     * @private
     */
    _renderIntroCanvas() {
        const ctx = this.introContext;
        if (!ctx) return;

        ctx.clearRect(0, 0, 1024, 512);

        // Dark Smoked Opaque Backing
        ctx.fillStyle = 'rgba(6, 10, 18, 0.95)';
        ctx.fillRect(0, 0, 1024, 512);

        // Subtle Engineering Scanlines
        ctx.strokeStyle = 'rgba(255, 157, 0, 0.04)';
        ctx.lineWidth = 1;
        for (let y = 0; y < 512; y += 6) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(1024, y);
            ctx.stroke();
        }

        // Corner Structural Brackets
        ctx.strokeStyle = '#ff9d00';
        ctx.lineWidth = 4;
        const b = 24;
        // Top-Left
        ctx.beginPath(); ctx.moveTo(20, 20 + b); ctx.lineTo(20, 20); ctx.lineTo(20 + b, 20); ctx.stroke();
        // Top-Right
        ctx.beginPath(); ctx.moveTo(1004 - b, 20); ctx.lineTo(1004, 20); ctx.lineTo(1004, 20 + b); ctx.stroke();
        // Bottom-Left
        ctx.beginPath(); ctx.moveTo(20, 492 - b); ctx.lineTo(20, 492); ctx.lineTo(20 + b, 492); ctx.stroke();
        // Bottom-Right
        ctx.beginPath(); ctx.moveTo(1004 - b, 492); ctx.lineTo(1004, 492); ctx.lineTo(1004, 492 - b); ctx.stroke();

        // Header Tag
        ctx.fillStyle = '#ff9d00';
        ctx.font = 'bold 28px "JetBrains Mono", monospace';
        ctx.fillText('[ SPATIAL R&D LAB // CELL-01 ]', 48, 68);

        // Divider
        ctx.strokeStyle = 'rgba(255, 157, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(48, 86);
        ctx.lineTo(976, 86);
        ctx.stroke();

        // Main Title (Concise & Readable)
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 48px "Inter", sans-serif';
        ctx.fillText('EXPLORE THE WORKSTATION', 48, 160);

        // Subtitle Instruction
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 30px "JetBrains Mono", monospace';
        ctx.fillText('Hover over hardware to inspect telemetry', 48, 225);

        // Interaction Hints
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 26px "JetBrains Mono", monospace';
        ctx.fillText('• MOVE: Position arm target', 48, 310);
        ctx.fillText('• DRAG: 360° orbit camera view', 48, 355);
        ctx.fillText('• SCROLL: Zoom workstation perspective', 48, 400);

        // Footer
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 24px "JetBrains Mono", monospace';
        ctx.fillText('● SYSTEM READY — SPATIAL TELEMETRY ACTIVE', 48, 465);

        this.introTexture.needsUpdate = true;
    }

    /**
     * Build Dynamic Contextual Inspection Hologram Panel
     * @private
     */
    _initContextualInspectionPanel() {
        const group = new THREE.Group();
        group.name = 'ContextualInspectionPanel';
        group.position.set(0, 2.0, -1.5);
        group.visible = false;

        const panelWidth = 2.4;
        const panelHeight = 1.4;
        const geom = new THREE.PlaneGeometry(panelWidth, panelHeight);

        // 1. Smoked Glass Backing (renderOrder = 8)
        const glassMat = new THREE.MeshBasicMaterial({
            color: 0x050912,
            transparent: true,
            opacity: 0.94,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        this.inspectGlassMesh = new THREE.Mesh(geom, glassMat);
        this.inspectGlassMesh.renderOrder = 8;
        group.add(this.inspectGlassMesh);

        // 2. High-Resolution Canvas for Text (1024x576) (renderOrder = 10)
        this.inspectCanvas = document.createElement('canvas');
        this.inspectCanvas.width = 1024;
        this.inspectCanvas.height = 576;
        this.inspectContext = this.inspectCanvas.getContext('2d');

        this.inspectTexture = new THREE.CanvasTexture(this.inspectCanvas);
        this.inspectTexture.minFilter = THREE.LinearFilter;

        const textMat = new THREE.MeshBasicMaterial({
            map: this.inspectTexture,
            transparent: true,
            opacity: 1.0,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        this.inspectDataMesh = new THREE.Mesh(geom, textMat);
        this.inspectDataMesh.position.z = 0.005;
        this.inspectDataMesh.renderOrder = 10;
        group.add(this.inspectDataMesh);

        // 3. Glowing Amber Frame Wireframe (renderOrder = 11)
        const wireGeom = new THREE.EdgesGeometry(geom);
        const wireMat = new THREE.LineBasicMaterial({
            color: 0xff9d00,
            transparent: true,
            opacity: 0.95
        });
        this.inspectFrameMesh = new THREE.LineSegments(wireGeom, wireMat);
        this.inspectFrameMesh.position.z = 0.008;
        this.inspectFrameMesh.renderOrder = 11;
        group.add(this.inspectFrameMesh);

        // 4. Physical Spatial Leader Line from Object Anchor to Panel Bottom Anchor (renderOrder = 9)
        const lineGeom = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -0.70, 0), // Bottom of the panel
            new THREE.Vector3(0, -1.80, 0)  // Physical object anchor point
        ]);
        const lineMat = new THREE.LineBasicMaterial({
            color: 0xff9d00,
            transparent: true,
            opacity: 0.90
        });
        this.inspectLine = new THREE.Line(lineGeom, lineMat);
        this.inspectLine.renderOrder = 9;
        group.add(this.inspectLine);

        this.inspectGroup = group;
        this.group.add(group);
    }

    /**
     * Render Contextual Technical Telemetry to Inspection Panel Canvas
     * @private
     * @param {Object} target Target configuration
     * @param {Object} robotController 
     */
    _renderInspectionCanvas(target, robotController) {
        const ctx = this.inspectContext;
        if (!ctx || !target) return;

        ctx.clearRect(0, 0, 1024, 576);

        // 1. Dark Smoked Glass Backing
        ctx.fillStyle = 'rgba(6, 10, 18, 0.96)';
        ctx.fillRect(0, 0, 1024, 576);

        // 2. Scanline Grid
        ctx.strokeStyle = 'rgba(255, 157, 0, 0.04)';
        ctx.lineWidth = 1;
        for (let y = 0; y < 576; y += 6) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(1024, y);
            ctx.stroke();
        }

        // 3. Glowing Amber Corner Brackets
        ctx.strokeStyle = '#ff9d00';
        ctx.lineWidth = 4;
        const b = 20;
        ctx.beginPath(); ctx.moveTo(16, 16 + b); ctx.lineTo(16, 16); ctx.lineTo(16 + b, 16); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(1008 - b, 16); ctx.lineTo(1008, 16); ctx.lineTo(1008, 16 + b); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(16, 560 - b); ctx.lineTo(16, 560); ctx.lineTo(16 + b, 560); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(1008 - b, 560); ctx.lineTo(1008, 560); ctx.lineTo(1008, 560 - b); ctx.stroke();

        // 4. Glitch Assembly Sweep during first 100ms
        if (this.glitchTimer > 0) {
            const glitchProgress = 1.0 - (this.glitchTimer / 0.12);
            ctx.fillStyle = 'rgba(255, 157, 0, 0.15)';
            ctx.fillRect(0, glitchProgress * 576, 1024, 24);
        }

        // 5. Category Header Tag (Amber)
        ctx.fillStyle = '#ff9d00';
        ctx.font = 'bold 26px "JetBrains Mono", monospace';
        ctx.fillText(`[ ${target.category || 'HARDWARE SUBSYSTEM'} ]`, 36, 48);

        // 6. Title (Large, White, Bold)
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 38px "Inter", sans-serif';
        ctx.fillText(target.title || 'DEVICE TELEMETRY', 36, 92);

        // 7. Short Engineering Description
        if (target.description) {
            ctx.fillStyle = '#cbd5e1';
            ctx.font = 'bold 22px "JetBrains Mono", monospace';
            ctx.fillText(target.description, 36, 128);
        }

        // 8. Glowing Divider Line
        ctx.strokeStyle = '#ff9d00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(36, 148);
        ctx.lineTo(988, 148);
        ctx.stroke();

        // 9. Technical Key Data Rows
        const rows = target.getData ? target.getData(robotController) : [];
        const startY = 200;
        const rowSpacing = 52;

        rows.forEach((r, idx) => {
            const y = startY + idx * rowSpacing;
            if (y > 480) return;

            // Row Background Shading
            ctx.fillStyle = (idx % 2 === 0) ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.30)';
            ctx.fillRect(36, y - 30, 952, 42);

            // Row Bullet
            ctx.fillStyle = '#ff9d00';
            ctx.fillRect(44, y - 16, 10, 10);

            // Label
            ctx.fillStyle = '#cbd5e1';
            ctx.font = 'bold 24px "JetBrains Mono", monospace';
            ctx.fillText(r[0], 64, y - 6);

            // Value
            ctx.fillStyle = r[2] || '#ff9d00';
            ctx.font = 'bold 24px "JetBrains Mono", monospace';
            ctx.fillText(r[1], 440, y - 6);
        });

        // 10. Footer Status Row
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 20px "JetBrains Mono", monospace';
        ctx.fillText(`HARDWARE ID: ${target.id.toUpperCase()} // LATENCY: 0.4ms // R&D BENCH-01`, 38, 546);

        this.inspectTexture.needsUpdate = true;
    }

    /**
     * Update Spatial Interfaces Lifecycle per frame
     * @param {number} deltaTime 
     * @param {Object|SpatialHoverManager} hoverManager 
     * @param {THREE.Camera} camera 
     * @param {Object} robotController 
     * @param {Object} [pointerTracker] 
     */
    update(deltaTime, hoverManager, camera, robotController, pointerTracker) {
        this.time += deltaTime;

        const hoverState = (hoverManager && typeof hoverManager.getActiveState === 'function')
            ? hoverManager.getActiveState()
            : (hoverManager || {});

        // 1. Intro Hologram Lifecycle (Fades out when user begins exploring)
        if (this.introGroup) {
            if (hoverState && hoverState.hasInteractedOnce) {
                this.introOpacity = Math.max(0.0, this.introOpacity - deltaTime * 3.0);
            }

            this.introGroup.visible = (this.introOpacity > 0.001);
            if (this.introGroup.visible) {
                // Subtle floating oscillation
                this.introGroup.position.y = 2.0 + Math.sin(this.time * 1.5) * 0.03;
                if (camera) {
                    this.introGroup.quaternion.copy(camera.quaternion);
                }

                // Update opacity on materials
                this.introGroup.traverse((child) => {
                    if (child.material) {
                        child.material.opacity = (child.isMesh && child.material.map)
                            ? this.introOpacity * 0.98
                            : this.introOpacity * 0.85;
                    }
                });
            }
        }

        // 2. Contextual Inspection Hologram Lifecycle
        if (!this.inspectGroup) return;

        const target = hoverState ? hoverState.target : null;
        const progress = hoverState ? hoverState.progress : 0;

        if (target && progress > 0.005) {
            this.inspectGroup.visible = true;

            // Trigger activation glitch pulse when switching targets
            if (this.activeTargetId !== target.id) {
                this.activeTargetId = target.id;
                this.glitchTimer = 0.12;
                this.isGlitching = true;
            }

            if (this.glitchTimer > 0) {
                this.glitchTimer = Math.max(0, this.glitchTimer - deltaTime);
            }

            // Always update canvas for dynamic data (e.g. robot angles or oscilloscope signals)
            this._renderInspectionCanvas(target, robotController);

            // Determine Anchor Point
            let anchor = target.anchorPoint ? target.anchorPoint.clone() : new THREE.Vector3(0, 0, 0);

            // For robot: anchor dynamically to the shoulder pivot
            if (target.id === 'robot' && robotController && robotController.arm) {
                const j2 = robotController.arm.getJoint('J2');
                if (j2 && j2.group) {
                    j2.group.getWorldPosition(anchor);
                }
            }

            // Camera Billboarding
            if (camera) {
                this.inspectGroup.quaternion.copy(camera.quaternion);
            }

            // Adaptive Scale based on Camera Distance
            let adaptiveScale = 1.0;
            if (camera) {
                const camDist = camera.position.distanceTo(anchor);
                adaptiveScale = THREE.MathUtils.clamp(camDist / 5.2, 0.85, 1.25);
            }
            this.inspectGroup.scale.set(adaptiveScale, adaptiveScale, adaptiveScale);

            // Calculate Panel Placement
            let panelPos = anchor.clone().add(target.panelOffset || new THREE.Vector3(0, 1.4, 0));

            // For robot: offset along camera's right vector to prevent blocking the arm
            if (target.id === 'robot' && camera) {
                const camDir = new THREE.Vector3();
                camera.getWorldDirection(camDir);
                const camRight = new THREE.Vector3().crossVectors(camDir, camera.up).normalize();
                panelPos = anchor.clone()
                    .add(camRight.clone().multiplyScalar(2.2))
                    .add(new THREE.Vector3(0, 1.3, 0));
            }

            this.inspectGroup.position.copy(panelPos);

            // Update Physical Spatial Leader Line from Object Anchor to Panel Bottom Anchor
            if (this.inspectLine) {
                this.inspectGroup.updateMatrixWorld(true);
                const localObjAnchor = this.inspectGroup.worldToLocal(anchor.clone());
                const linePositions = this.inspectLine.geometry.attributes.position;
                linePositions.setXYZ(0, 0, -0.70, 0); // Panel bottom anchor in local space
                linePositions.setXYZ(1, localObjAnchor.x, localObjAnchor.y, localObjAnchor.z); // Object anchor
                linePositions.needsUpdate = true;
            }

            // Smooth Opacity Fade
            const panelAlpha = THREE.MathUtils.smoothstep(progress, 0, 1);
            if (this.inspectGlassMesh) {
                this.inspectGlassMesh.material.opacity = panelAlpha * 0.94;
            }
            if (this.inspectDataMesh) {
                this.inspectDataMesh.material.opacity = panelAlpha * 0.98;
            }
            if (this.inspectFrameMesh) {
                this.inspectFrameMesh.material.opacity = panelAlpha * 0.95;
            }
            if (this.inspectLine) {
                this.inspectLine.material.opacity = panelAlpha * 0.90;
            }
        } else {
            this.inspectGroup.visible = false;
            this.activeTargetId = null;
        }
    }

    /**
     * Add spatial interfaces subsystem group to scene
     * @param {THREE.Scene} scene 
     */
    addToScene(scene) {
        if (scene) {
            scene.add(this.group);
        }
    }
}
