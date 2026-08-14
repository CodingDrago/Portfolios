/**
 * SceneManager - WebGL Engine & Viewport Controller
 * Manages Three.js Scene, PerspectiveCamera, WebGLRenderer, and responsive resizing
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

        // Shadow map configuration (prepared for Phase 2 physical shadows)
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Append canvas to mount container
        this.container.appendChild(this.renderer.domElement);
    }

    /**
     * Setup ResizeObserver for robust responsive layout resizing across mobile, tablet, desktop
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

        // Update Camera Aspect Ratio
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        // Update WebGL Renderer Size
        this.renderer.setSize(width, height);
    }

    /**
     * Update camera position micro-parallax based on pointer input
     * Keeps all 3D meshes (floor, platform, wall) 100% stationary in world space,
     * while creating natural 3D perspective depth as the camera shifts slightly.
     * @param {Object} pointer PointerTracker instance
     */
    updateCameraParallax(pointer) {
        if (!this.camera || !pointer) return;

        const basePos = CONFIG.camera.position;
        const targetX = (basePos.x || 0) + pointer.smoothX * 0.45;
        const targetY = (basePos.y || 0) + pointer.smoothY * 0.25;

        this.camera.position.x += (targetX - this.camera.position.x) * 0.05;
        this.camera.position.y += (targetY - this.camera.position.y) * 0.05;
        this.camera.lookAt(0, -0.8, 0);
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
