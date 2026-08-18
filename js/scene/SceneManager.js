/**
 * SceneManager - WebGL Engine & Viewport Controller
 * Manages Three.js Scene, PerspectiveCamera, WebGLRenderer, responsive resizing,
 * and professional 3D CAD-style spherical orbit inspection with smooth damping and limits.
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class SceneManager {
    constructor(mountElement) {
        if (!mountElement) {
            throw new Error('[SceneManager] Mount container element is required');
        }

        this.container = mountElement;

        // Core Three.js Components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.resizeObserver = null;

        // Orbit Camera Spherical Coordinate System
        this.targetFocus = new THREE.Vector3(0, 0.8, 0);

        this.defaultRadius = CONFIG.camera.position.z || 11.5;
        this.defaultTheta = 0.0; // Azimuth angle (horizontal)
        this.defaultPhi = Math.PI * 0.44; // Polar angle (~79° elevation)

        this.targetRadius = this.defaultRadius;
        this.currentRadius = this.defaultRadius;

        this.targetTheta = this.defaultTheta;
        this.currentTheta = this.defaultTheta;

        this.targetPhi = this.defaultPhi;
        this.currentPhi = this.defaultPhi;

        // Orbit & Zoom Limits
        this.minRadius = 6.5;
        this.maxRadius = 15.5;
        this.minTheta = -Math.PI * 0.45; // -81°
        this.maxTheta = Math.PI * 0.45;  // +81°
        this.minPhi = 0.25;             // High overhead angle (~14°)
        this.maxPhi = Math.PI * 0.47;   // Low floor grazing angle (~84.6°, floor-safe)

        this._initScene();
        this._initCamera();
        this._initRenderer();
        this._initResizeObserver();
    }

    /**
     * Initialize Three.js Scene container
     * @private
     */
    _initScene() {
        this.scene = new THREE.Scene();
    }

    /**
     * Initialize Responsive Perspective Camera
     * @private
     */
    _initCamera() {
        const { fov, near, far, position, lookAt } = CONFIG.camera;
        const aspect = this.container.clientWidth / this.container.clientHeight || window.innerWidth / window.innerHeight;

        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(position.x, position.y, position.z);
        this.camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
    }

    /**
     * Initialize Transparent WebGL Renderer
     * @private
     */
    _initRenderer() {
        const { antialias, alpha, maxPixelRatio, powerPreference } = CONFIG.renderer;

        this.renderer = new THREE.WebGLRenderer({
            antialias,
            alpha,
            powerPreference
        });

        // Configure pixel ratio with high-DPI capping for optimal performance
        const pixelRatio = Math.min(window.devicePixelRatio, maxPixelRatio || 2);
        this.renderer.setPixelRatio(pixelRatio);

        // Configure initial renderer dimensions
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;
        this.renderer.setSize(width, height);

        // Shadow map configuration
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Append canvas to mount container
        this.container.appendChild(this.renderer.domElement);
    }

    /**
     * Setup ResizeObserver for responsive layout resizing
     * @private
     */
    _initResizeObserver() {
        this.resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.target === this.container) {
                    const width = entry.contentRect.width;
                    const height = entry.contentRect.height;
                    this.resize(width, height);
                }
            }
        });

        this.resizeObserver.observe(this.container);
    }

    /**
     * Update camera aspect ratio and renderer size on viewport resize
     * @param {number} width Container width in pixels
     * @param {number} height Container height in pixels
     */
    resize(width, height) {
        if (!width || !height) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    /**
     * Reset camera orbit to default workstation framing
     */
    resetCamera() {
        this.targetTheta = this.defaultTheta;
        this.targetPhi = this.defaultPhi;
        this.targetRadius = this.defaultRadius;
    }

    /**
     * Update camera position with smooth orbit inspection and subtle parallax
     * @param {Object} pointer PointerTracker instance
     */
    updateCameraParallax(pointer) {
        if (!this.camera || !pointer) return;

        // 1. Process drag orbit input (full 360-degree continuous horizontal rotation)
        if (pointer.isDragging) {
            this.targetTheta -= pointer.dragDeltaX * 0.0055;
            this.targetPhi -= pointer.dragDeltaY * 0.0055;
        }

        // 2. Process wheel zoom input
        if (Math.abs(pointer.wheelDelta) > 0.001) {
            this.targetRadius += pointer.wheelDelta * 0.15;
            pointer.wheelDelta *= 0.85; // Smooth decay
        }

        // 3. Enforce vertical polar and zoom boundaries (No horizontal clamp - full 360° orbit)
        this.targetPhi = THREE.MathUtils.clamp(this.targetPhi, this.minPhi, this.maxPhi);
        this.targetRadius = THREE.MathUtils.clamp(this.targetRadius, this.minRadius, this.maxRadius);

        // 4. Smooth Damping Interpolation
        this.currentTheta += (this.targetTheta - this.currentTheta) * 0.08;
        this.currentPhi += (this.targetPhi - this.currentPhi) * 0.08;
        this.currentRadius += (this.targetRadius - this.currentRadius) * 0.08;

        // 5. Subtle micro-parallax shift when NOT dragging
        let parallaxX = 0;
        let parallaxY = 0;
        if (!pointer.isDragging) {
            parallaxX = pointer.smoothX * 0.35;
            parallaxY = pointer.smoothY * 0.20;
        }

        // 6. Convert spherical coordinates to Cartesian camera position
        const sinPhi = Math.sin(this.currentPhi);
        const camX = this.currentRadius * sinPhi * Math.sin(this.currentTheta) + this.targetFocus.x + parallaxX;
        const rawCamY = this.currentRadius * Math.cos(this.currentPhi) + this.targetFocus.y + parallaxY;
        const camZ = this.currentRadius * sinPhi * Math.cos(this.currentTheta) + this.targetFocus.z;

        // Floor safety clamp (camera physically cannot pass through the workstation floor)
        const camY = Math.max(rawCamY, -0.4);

        this.camera.position.set(camX, camY, camZ);
        this.camera.lookAt(this.targetFocus);
    }

    /**
     * Render the active scene from camera perspective
     */
    render() {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Clean up WebGL resources and DOM observers on destroy
     */
    destroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentElement) {
                this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
            }
        }
    }
}

