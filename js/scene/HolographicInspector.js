/**
 * HolographicInspector - 3D Restrained Holographic Inspection Environment Subsystem
 * Constructs an engineered spatial analysis environment around the inspected component:
 * rotating measurement rings, circular holographic base grid, 3-axis indicators,
 * subtle bounding brackets, and micro-particle aura with smooth power-up / power-down lifecycle.
 */

import * as THREE from 'three';

export class HolographicInspector {
    constructor() {
        this.group = new THREE.Group();
        this.group.name = 'HolographicInspectorGroup';
        this.group.visible = false;

        // Lifecycle & Transition State
        this.isActive = false;
        this.powerProgress = 0.0; // 0 (off) to 1 (fully powered)
        this.time = 0;

        // Visual Component References
        this.ringOuter = null;
        this.ringInner = null;
        this.ringTicks = null;
        this.gridMesh = null;
        this.axisGroup = null;
        this.particles = null;
        this.boundingBrackets = null;

        this._initHolographicGeometry();
    }

    /**
     * Build precision holographic analysis geometry
     * @private
     */
    _initHolographicGeometry() {
        // 1. Holographic Base Platform Group (Horizontal Plane y = -1.2)
        const baseGroup = new THREE.Group();
        baseGroup.position.set(0, -1.2, 0);

        // A. Circular Coordinate Grid
        const gridGeom = new THREE.RingGeometry(0.1, 2.4, 48, 6);
        const gridMat = new THREE.MeshBasicMaterial({
            color: 0xff9d00,
            wireframe: true,
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        this.gridMesh = new THREE.Mesh(gridGeom, gridMat);
        this.gridMesh.rotation.x = -Math.PI / 2;
        baseGroup.add(this.gridMesh);

        // B. Outer Rotating Concentric Measurement Ring
        const ringOuterGeom = new THREE.RingGeometry(2.35, 2.40, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xffb703,
            transparent: true,
            opacity: 0.70,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        this.ringOuter = new THREE.Mesh(ringOuterGeom, ringMat);
        this.ringOuter.rotation.x = -Math.PI / 2;
        baseGroup.add(this.ringOuter);

        // C. Inner Rotating Segmented Ring
        const ringInnerGeom = new THREE.RingGeometry(1.60, 1.63, 48);
        const ringInnerMat = new THREE.MeshBasicMaterial({
            color: 0x00b4d8,
            transparent: true,
            opacity: 0.60,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        this.ringInner = new THREE.Mesh(ringInnerGeom, ringInnerMat);
        this.ringInner.rotation.x = -Math.PI / 2;
        baseGroup.add(this.ringInner);

        // D. Radial Measurement Ticks (12 spokes)
        const tickGroup = new THREE.Group();
        const tickGeom = new THREE.BoxGeometry(0.02, 0.005, 0.30);
        const tickMat = new THREE.MeshBasicMaterial({
            color: 0xff9d00,
            transparent: true,
            opacity: 0.80,
            depthWrite: false
        });

        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const tick = new THREE.Mesh(tickGeom, tickMat);
            tick.position.set(Math.sin(angle) * 2.2, 0.01, Math.cos(angle) * 2.2);
            tick.rotation.y = angle;
            tickGroup.add(tick);
        }
        this.ringTicks = tickGroup;
        baseGroup.add(tickGroup);

        this.group.add(baseGroup);

        // 2. Technical 3-Axis Coordinate Ticks (Origin at Object Center)
        this.axisGroup = new THREE.Group();
        this.axisGroup.position.set(0, 0, 0);

        // X-Axis (Red-Amber)
        const axisXGeom = new THREE.CylinderGeometry(0.008, 0.008, 1.4, 8);
        axisXGeom.rotateZ(-Math.PI / 2);
        const axisXMat = new THREE.MeshBasicMaterial({ color: 0xff9d00, transparent: true, opacity: 0.6, depthWrite: false });
        const axisX = new THREE.Mesh(axisXGeom, axisXMat);
        axisX.position.set(0.7, -1.18, 0);
        this.axisGroup.add(axisX);

        // Z-Axis (Cyan)
        const axisZGeom = new THREE.CylinderGeometry(0.008, 0.008, 1.4, 8);
        axisZGeom.rotateX(Math.PI / 2);
        const axisZMat = new THREE.MeshBasicMaterial({ color: 0x00b4d8, transparent: true, opacity: 0.6, depthWrite: false });
        const axisZ = new THREE.Mesh(axisZGeom, axisZMat);
        axisZ.position.set(0, -1.18, 0.7);
        this.axisGroup.add(axisZ);

        this.group.add(this.axisGroup);

        // 3. Spatial Corner Bounding Brackets around Focal Space
        this._initBoundingBrackets();

        // 4. Restrained Micro-Particle Field
        this._initParticles();
    }

    /**
     * Create subtle corner bounding brackets around component focal area
     * @private
     */
    _initBoundingBrackets() {
        const bracketGroup = new THREE.Group();
        const mat = new THREE.LineBasicMaterial({
            color: 0xffb703,
            transparent: true,
            opacity: 0.70,
            depthWrite: false
        });

        const half = 1.4;
        const bLen = 0.25;

        // 8 corner brackets in 3D box
        const corners = [
            [-half, -half * 0.8, -half],
            [half, -half * 0.8, -half],
            [-half, half * 0.8, -half],
            [half, half * 0.8, -half],
            [-half, -half * 0.8, half],
            [half, -half * 0.8, half],
            [-half, half * 0.8, half],
            [half, half * 0.8, half]
        ];

        corners.forEach(([cx, cy, cz]) => {
            const sx = cx > 0 ? -1 : 1;
            const sy = cy > 0 ? -1 : 1;
            const sz = cz > 0 ? -1 : 1;

            const pts = [
                new THREE.Vector3(cx + sx * bLen, cy, cz),
                new THREE.Vector3(cx, cy, cz),
                new THREE.Vector3(cx, cy + sy * bLen, cz),
                new THREE.Vector3(cx, cy, cz),
                new THREE.Vector3(cx, cy, cz + sz * bLen)
            ];

            const geom = new THREE.BufferGeometry().setFromPoints(pts);
            const line = new THREE.Line(geom, mat);
            bracketGroup.add(line);
        });

        this.boundingBrackets = bracketGroup;
        this.group.add(bracketGroup);
    }

    /**
     * Create restrained micro-particles hovering near the platform
     * @private
     */
    _initParticles() {
        const count = 36;
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const r = 0.4 + Math.random() * 1.8;
            const theta = Math.random() * Math.PI * 2;
            positions[i * 3 + 0] = Math.cos(theta) * r;
            positions[i * 3 + 1] = -1.1 + Math.random() * 2.2;
            positions[i * 3 + 2] = Math.sin(theta) * r;
        }

        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: 0xffb703,
            size: 0.035,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geom, mat);
        this.group.add(this.particles);
    }

    /**
     * Power up the holographic inspection environment
     * @param {THREE.Vector3} [centerPosition] World position to center the hologram around
     */
    activate(centerPosition) {
        this.isActive = true;
        this.group.visible = true;

        if (centerPosition) {
            this.group.position.copy(centerPosition);
        } else {
            this.group.position.set(0, 0.4, 0);
        }
    }

    /**
     * Power down the holographic inspection environment
     */
    deactivate() {
        this.isActive = false;
    }

    /**
     * Add subsystem to target scene
     * @param {THREE.Scene} scene 
     */
    addToScene(scene) {
        if (scene) {
            scene.add(this.group);
        }
    }

    /**
     * Per-frame animation update for rotating rings, particles, and power-up opacity
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        this.time += deltaTime;

        // Smooth Power Progression
        if (this.isActive) {
            this.powerProgress = Math.min(1.0, this.powerProgress + deltaTime * 2.5);
        } else {
            this.powerProgress = Math.max(0.0, this.powerProgress - deltaTime * 3.0);
            if (this.powerProgress <= 0.0) {
                this.group.visible = false;
                return;
            }
        }

        const alpha = THREE.MathUtils.smoothstep(this.powerProgress, 0, 1);

        // Rotations
        if (this.ringOuter) {
            this.ringOuter.rotation.z = this.time * 0.25;
            this.ringOuter.material.opacity = alpha * 0.70;
        }
        if (this.ringInner) {
            this.ringInner.rotation.z = -this.time * 0.35;
            this.ringInner.material.opacity = alpha * 0.60;
        }
        if (this.gridMesh) {
            this.gridMesh.material.opacity = alpha * 0.22;
        }
        if (this.ringTicks) {
            this.ringTicks.rotation.y = this.time * 0.12;
            this.ringTicks.children.forEach(c => {
                if (c.material) c.material.opacity = alpha * 0.75;
            });
        }
        if (this.boundingBrackets) {
            this.boundingBrackets.children.forEach(c => {
                if (c.material) c.material.opacity = alpha * 0.70;
            });
            // Subtle breathing scale
            const bScale = 1.0 + Math.sin(this.time * 2.0) * 0.015;
            this.boundingBrackets.scale.set(bScale, bScale, bScale);
        }

        // Particles orbital drift
        if (this.particles && this.particles.geometry) {
            this.particles.material.opacity = alpha * 0.65;
            this.particles.rotation.y = this.time * 0.15;
        }
    }
}
