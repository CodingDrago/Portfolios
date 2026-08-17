/**
 * SpatialInterfaces - Contextual Holographic Telemetry & Spatial Discovery System
 * Manages the initial interactive introduction hologram, contextual high-contrast
 * inspection panels with camera billboarding, spatial leader lines, and workcell floor grids.
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

        // 3. Projected Floor Grid
        this.projectedGridMesh = null;

        this._initIntroHologram();
        this._initContextualInspectionPanel();
        this._initWorkcellTargetingGrid();
        this._initSpatialCoordinateCompass();
    }

    /**
     * Build Initial Floating Introduction Hologram
     * @private
     */
    _initIntroHologram() {
        const group = new THREE.Group();
        group.name = 'IntroHologram';
        group.position.set(0, 2.2, -0.8); // Positioned comfortably above robot shoulder

        // Glass Backplane (3.0 x 1.4)
        const geom = new THREE.PlaneGeometry(3.0, 1.4);
        const glassMat = new THREE.MeshBasicMaterial({
            color: 0x060a12,
            transparent: true,
            opacity: 0.92,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const glassMesh = new THREE.Mesh(geom, glassMat);
        group.add(glassMesh);

        // Amber Wireframe Border
        const wireGeom = new THREE.EdgesGeometry(geom);
        const wireMat = new THREE.LineBasicMaterial({
            color: 0xff9d00,
            transparent: true,
            opacity: 0.95
        });
        const wireMesh = new THREE.LineSegments(wireGeom, wireMat);
        group.add(wireMesh);

        // Canvas for High-Resolution Text (1024x512)
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
        textMesh.position.z = 0.006;
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

        // Dark Smoked Opaque Background
        ctx.fillStyle = 'rgba(6, 10, 18, 0.95)';
        ctx.fillRect(0, 0, 1024, 512);

        // Header Tag
        ctx.fillStyle = '#ff9d00';
        ctx.font = 'bold 28px monospace';
        ctx.fillText('[ WORKSTATION ONLINE // SPATIAL R&D LAB ]', 48, 70);

        // Divider
        ctx.strokeStyle = '#ff9d00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(48, 90);
        ctx.lineTo(976, 90);
        ctx.stroke();

        // Main Title (Large, bold, ultra-high contrast)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px monospace';
        ctx.fillText('HOVER OVER HARDWARE TO INSPECT', 48, 175);

        // Subtitle
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '28px monospace';
        ctx.fillText('Move cursor across instruments, boards & robot to reveal telemetry', 48, 240);

        // Interactive Targets Prompt
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('TARGETS: [OSCILLOSCOPE] [MCU PROTOTYPE] [6-DOF ROBOT] [BENCH SUPPLY]', 48, 340);

        // Instructions Footer
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 26px monospace';
        ctx.fillText('● SYSTEM READY — 360° SPATIAL ORBIT ACTIVE', 48, 445);

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

        const geom = new THREE.PlaneGeometry(2.8, 1.7);

        // 1. High-Resolution Dynamic Canvas Texture (1024x640)
        this.inspectCanvas = document.createElement('canvas');
        this.inspectCanvas.width = 1024;
        this.inspectCanvas.height = 640;
        this.inspectContext = this.inspectCanvas.getContext('2d');

        this.inspectTexture = new THREE.CanvasTexture(this.inspectCanvas);
        this.inspectTexture.minFilter = THREE.LinearFilter;

        const dataMat = new THREE.MeshBasicMaterial({
            map: this.inspectTexture,
            transparent: true,
            opacity: 0.98,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        this.inspectDataMesh = new THREE.Mesh(geom, dataMat);
        this.inspectDataMesh.renderOrder = 10;
        group.add(this.inspectDataMesh);

        // 2. Crisp Glowing Amber Frame
        const wireGeom = new THREE.EdgesGeometry(geom);
        const wireMat = new THREE.LineBasicMaterial({
            color: 0xff9d00,
            transparent: true,
            opacity: 0.98
        });
        this.inspectFrameMesh = new THREE.LineSegments(wireGeom, wireMat);
        this.inspectFrameMesh.renderOrder = 11;
        group.add(this.inspectFrameMesh);

        // 3. Spatial Leader Line Connecting Panel to Hovered Target
        const lineGeom = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -0.85, 0),
            new THREE.Vector3(0, -2.0, 0)
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
     * Build Workcell Polar/Cartesian Targeting Grid Projected on Floor
     * @private
     */
    _initWorkcellTargetingGrid() {
        const gridGroup = new THREE.Group();
        gridGroup.name = 'WorkcellTargetingGrid';
        gridGroup.position.set(0, -1.97, 0);

        // Concentric Holographic Range Rings (r = 1.4, 2.4, 3.4)
        const ringRadii = [1.4, 2.4, 3.4];
        const ringMat = this.materials.get('holoLineAmber');

        ringRadii.forEach((radius, idx) => {
            const ringGeom = new THREE.RingGeometry(radius - 0.008, radius + 0.008, 64);
            ringGeom.rotateX(-Math.PI / 2);
            const ringMesh = new THREE.Mesh(ringGeom, new THREE.MeshBasicMaterial({
                color: 0xff9d00,
                transparent: true,
                opacity: 0.25 - idx * 0.05,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            }));
            gridGroup.add(ringMesh);
        });

        // Radial Quadrant Azimuth Lines (0°, 90°, 180°, 270°)
        const lineGeom = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-3.5, 0, 0),
            new THREE.Vector3(3.5, 0, 0),
            new THREE.Vector3(0, 0, -3.5),
            new THREE.Vector3(0, 0, 3.5)
        ]);
        const crossMesh = new THREE.LineSegments(lineGeom, ringMat);
        gridGroup.add(crossMesh);

        this.projectedGridMesh = gridGroup;
        this.group.add(gridGroup);
    }

    /**
     * Build 3D Spatial Coordinate Compass Triad near Robot Mounting Base
     * @private
     */
    _initSpatialCoordinateCompass() {
        const compassGroup = new THREE.Group();
        compassGroup.name = 'SpatialCompass';
        compassGroup.position.set(-1.8, -1.42, 1.4);

        const axisX = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.3, 0, 0)]),
            new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 })
        );
        const axisY = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.3, 0, 0)]),
            new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 })
        );
        const axisZ = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0.3)]),
            new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 })
        );

        compassGroup.add(axisX, axisY, axisZ);
        this.group.add(compassGroup);
    }

    /**
     * Render Contextual Technical Telemetry to Inspection Panel Canvas with layered scanline assembly
     * @private
     * @param {Object} target Target configuration
     * @param {Object} robotController 
     */
    _renderInspectionCanvas(target, robotController) {
        const ctx = this.inspectContext;
        if (!ctx || !target) return;

        ctx.clearRect(0, 0, 1024, 640);

        // 1. Dark Opaque Backing for 100% Text Legibility
        ctx.fillStyle = 'rgba(6, 10, 16, 0.95)';
        ctx.fillRect(0, 0, 1024, 640);

        // 2. Subtle Background Engineering Scanline Grid
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
        ctx.lineWidth = 1;
        for (let y = 30; y < 640; y += 40) {
            ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(1004, y); ctx.stroke();
        }

        // 3. Corner Accent Brackets
        ctx.strokeStyle = '#ff9d00';
        ctx.lineWidth = 3;
        const bLen = 24;
        // Top-Left
        ctx.beginPath(); ctx.moveTo(14, 14 + bLen); ctx.lineTo(14, 14); ctx.lineTo(14 + bLen, 14); ctx.stroke();
        // Top-Right
        ctx.beginPath(); ctx.moveTo(1010 - bLen, 14); ctx.lineTo(1010, 14); ctx.lineTo(1010, 14 + bLen); ctx.stroke();
        // Bottom-Left
        ctx.beginPath(); ctx.moveTo(14, 626 - bLen); ctx.lineTo(14, 626); ctx.lineTo(14 + bLen, 626); ctx.stroke();
        // Bottom-Right
        ctx.beginPath(); ctx.moveTo(1010 - bLen, 626); ctx.lineTo(1010, 626); ctx.lineTo(1010, 626 - bLen); ctx.stroke();

        // 4. Header Category Banner
        ctx.fillStyle = '#ff9d00';
        ctx.font = 'bold 22px monospace';
        ctx.fillText(`[ ${target.category || 'HARDWARE SUBSYSTEM'} ]`, 36, 52);

        // 5. Target Title (Large, Bold & High Contrast)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 34px monospace';
        ctx.fillText(target.title || 'DEVICE TELEMETRY', 36, 96);

        // 6. Glowing Amber Divider Line
        ctx.strokeStyle = '#ff9d00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(36, 116);
        ctx.lineTo(988, 116);
        ctx.stroke();

        // 7. Dynamic Technical Rows
        let rows = [];
        if (target.getData) {
            rows = target.getData(robotController);
        } else {
            rows = [
                ['STATUS:', 'ONLINE [NOMINAL]', '#10b981'],
                ['BUS PROTOCOL:', 'SPI / I2C REGULATED', '#ff9d00'],
                ['TELEMETRY:', 'STREAMING 60 Hz', '#38bdf8']
            ];
        }

        ctx.font = '24px monospace';
        rows.forEach((r, i) => {
            const y = 175 + i * 48;

            // Indicator Bullet
            ctx.fillStyle = r[2] || '#ff9d00';
            ctx.fillRect(38, y - 18, 12, 12);

            // Label
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText(r[0], 62, y - 6);

            // Value
            ctx.fillStyle = r[2] || '#ff9d00';
            ctx.font = 'bold 24px monospace';
            ctx.fillText(r[1], 460, y - 6);
            ctx.font = '24px monospace';
        });

        // 8. Bottom Footer Status
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(`HARDWARE ID: ${target.id.toUpperCase()} // LATENCY: 0.4ms // R&D BENCH-01`, 38, 595);

        // 9. Restrained Scanline Assembly Glitch (First 100ms of activation)
        if (this.glitchTimer > 0) {
            const scanY = (1.0 - (this.glitchTimer / 0.12)) * 640;
            ctx.fillStyle = 'rgba(255, 157, 0, 0.25)';
            ctx.fillRect(0, scanY - 10, 1024, 20);

            // Subtle RGB chromatic displacement slice
            ctx.fillStyle = 'rgba(56, 189, 248, 0.20)';
            ctx.fillRect(10, scanY + 15, 1004, 6);
        }

        this.inspectTexture.needsUpdate = true;
    }

    /**
     * Add spatial interface elements to target scene
     * @param {THREE.Scene} scene 
     */
    addToScene(scene) {
        if (scene) {
            scene.add(this.group);
        }
    }

    /**
     * Per-frame animation update:
     * - Handles Intro Hologram fade-out once user explores
     * - Manages Contextual Inspection Panel adaptive scaling, dynamic positioning, camera billboarding, and scanline glitch
     * - Animates floor targeting grid
     * @param {number} deltaTime 
     * @param {Object} robotController 
     * @param {Object} pointerTracker 
     * @param {Object} hoverManager 
     * @param {THREE.Camera} camera 
     */
    update(deltaTime, robotController, pointerTracker, hoverManager, camera) {
        this.time += deltaTime;

        // 1. Manage Intro Hologram Fade
        if (hoverManager && this.introGroup) {
            const { hasInteractedOnce } = hoverManager.getActiveState();
            if (hasInteractedOnce) {
                this.introOpacity = Math.max(0.0, this.introOpacity - deltaTime * 3.0);
            }
            this.introGroup.visible = this.introOpacity > 0.001;

            if (this.introGroup.visible) {
                // Gentle breathing hover
                this.introGroup.position.y = 2.2 + Math.sin(this.time * 1.5) * 0.02;

                // Subtle Billboard alignment to camera
                if (camera) {
                    this.introGroup.quaternion.copy(camera.quaternion);
                }

                // Apply opacity
                this.introGroup.children.forEach(c => {
                    if (c.material) c.material.opacity = this.introOpacity * 0.94;
                });
            }
        }

        // 2. Manage Contextual Inspection Panel
        if (hoverManager && this.inspectGroup) {
            const { target, progress } = hoverManager.getActiveState();

            if (progress > 0.001 && target) {
                this.inspectGroup.visible = true;

                // Trigger brief scanline glitch pulse on new target activation
                if (this.lastTarget !== target) {
                    this.glitchTimer = 0.12; // 120ms scanline assembly pulse
                } else if (this.glitchTimer > 0) {
                    this.glitchTimer = Math.max(0, this.glitchTimer - deltaTime);
                }

                // Render dynamic telemetry
                this._renderInspectionCanvas(target, robotController);

                // Compute Dynamic Object Anchor Point
                let anchor = target.anchorPoint ? target.anchorPoint.clone() : new THREE.Vector3(0, 0, 0);

                // If target is robot, track the live shoulder/arm world position
                if (target.id === 'robot' && robotController && robotController.arm) {
                    const shoulder = robotController.arm.getJoint('J2');
                    if (shoulder && shoulder.group) {
                        anchor = shoulder.group.getWorldPosition(new THREE.Vector3());
                    }
                }

                // Camera-Aware Spatial Offset: Keep panel on the side relative to camera view
                let targetPos;
                if (target.id === 'robot' && camera) {
                    const camDir = new THREE.Vector3();
                    camera.getWorldDirection(camDir);
                    const camRight = new THREE.Vector3().crossVectors(camDir, camera.up).normalize();
                    // Place robot panel offset to the right in camera view space
                    targetPos = anchor.clone().add(camRight.clone().multiplyScalar(2.2)).add(new THREE.Vector3(0, 1.4, 0));
                } else {
                    const offset = target.panelOffset || new THREE.Vector3(0, 1.4, 0.4);
                    targetPos = new THREE.Vector3().addVectors(anchor, offset);
                }

                // Subtle floating breathing animation
                targetPos.y += Math.sin(this.time * 2.0) * 0.02;

                if (!this.lastTarget || this.lastTarget !== target) {
                    this.inspectGroup.position.copy(targetPos);
                    this.lastTarget = target;
                } else {
                    this.inspectGroup.position.lerp(targetPos, 0.25);
                }

                // Intelligent Billboarding: Face the camera directly
                if (camera) {
                    this.inspectGroup.quaternion.copy(camera.quaternion);

                    // Adaptive Distance Scaling: Keep text readable at all camera distances
                    const camDist = this.inspectGroup.position.distanceTo(camera.position);
                    const adaptiveScale = THREE.MathUtils.clamp(camDist / 5.2, 0.80, 1.30);
                    this.inspectGroup.scale.set(adaptiveScale, adaptiveScale, adaptiveScale);
                }
                this.inspectGroup.updateMatrixWorld(true);

                // Update Spatial Leader Line from Panel Bottom to Target Anchor
                if (this.inspectLine) {
                    const localAnchor = this.inspectGroup.worldToLocal(anchor.clone());
                    const positions = this.inspectLine.geometry.attributes.position.array;
                    positions[0] = 0;
                    positions[1] = -0.85;
                    positions[2] = 0;
                    positions[3] = localAnchor.x;
                    positions[4] = localAnchor.y;
                    positions[5] = localAnchor.z;
                    this.inspectLine.geometry.attributes.position.needsUpdate = true;
                }

                // Apply Smooth Transition Opacity
                if (this.inspectFrameMesh) this.inspectFrameMesh.material.opacity = progress * 0.98;
                if (this.inspectDataMesh) this.inspectDataMesh.material.opacity = progress * 0.98;
                if (this.inspectLine) this.inspectLine.material.opacity = progress * 0.90;

            } else {
                this.inspectGroup.visible = false;
                this.lastTarget = null;
                this.glitchTimer = 0;
            }
        }

        // 3. Subtle Ambient Pulsing of Projected Floor Grid
        if (this.projectedGridMesh) {
            const gridOpacity = 0.20 + Math.sin(this.time * 2.0) * 0.06;
            this.projectedGridMesh.children.forEach(child => {
                if (child.material) child.material.opacity = gridOpacity;
            });
        }
    }
}
