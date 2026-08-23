/**
 * SceneManager - WebGL Engine & Viewport Controller
 * Manages Three.js Scene, PerspectiveCamera, WebGLRenderer, responsive resizing,
 * and professional 3D CAD-style spherical orbit inspection with smooth damping and limits.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
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
        this.composer = null;
        this.bloomPass = null;
        this.resizeObserver = null;

        // Orbit Camera Spherical Coordinate System
        this.targetFocus = new THREE.Vector3(0, 0.8, 0);
        this.currentFocus = this.targetFocus.clone();

        this.defaultRadius = CONFIG.camera.position.z || 9.5;
        this.defaultTheta = 0.0; // Azimuth angle (horizontal)
        this.defaultPhi = Math.PI * 0.44; // Polar angle (~79° elevation)

        this.targetRadius = this.defaultRadius;
        this.currentRadius = this.defaultRadius;

        this.targetTheta = this.defaultTheta;
        this.currentTheta = this.defaultTheta;

        this.targetPhi = this.defaultPhi;
        this.currentPhi = this.defaultPhi;

        // Programmatic Transition State
        this.isTransitioning = false;

        // Camera Section Presets (front / left / right / back)
        // Matches Lighting.js spot targets and WallVisibilityManager wall IDs
        this.sectionPresets = {
            front: {
                theta: 0.0,
                phi: this.defaultPhi,
                radius: this.defaultRadius,
                focus: new THREE.Vector3(0, 0.8, 0)
            },
            left: {
                theta: Math.PI * 0.5, // +90° azimuth facing Left Wall (X = -12.0)
                phi: this.defaultPhi,
                radius: this.defaultRadius,
                focus: new THREE.Vector3(0, 0.8, 0)
            },
            back: {
                theta: Math.PI, // 180° azimuth facing Back Wall (Z = +12.0)
                phi: this.defaultPhi,
                radius: this.defaultRadius,
                focus: new THREE.Vector3(0, 0.8, 0)
            },
            right: {
                theta: -Math.PI * 0.5, // -90° (270°) azimuth facing Right Wall (X = +12.0)
                phi: this.defaultPhi,
                radius: this.defaultRadius,
                focus: new THREE.Vector3(0, 0.8, 0)
            }
        };

        // Orbit & Zoom Limits (Bounded inside 24m x 24m room)
        this.minRadius = 2.4;
        this.maxRadius = 10.8;
        this.minPhi = 0.05;            // Top-down overhead viewing (~2.8°)
        this.maxPhi = Math.PI * 0.85;  // Upward elevation angle looking up at ceiling gantry (~153°)

        // Room Physical Boundaries (Walls at ±12.0, Floor at -2.0, Ceiling at 7.2)
        this.roomBounds = {
            minX: -10.2,
            maxX: 10.2,
            minY: -1.6,
            maxY: 6.8,
            minZ: -10.2,
            maxZ: 10.2
        };

        this._initScene();
        this._initCamera();
        this._initRenderer();
        this._initPostProcessing();
        this._initEnvironmentMap();
        this._initResizeObserver();
    }

    /**
     * Initialize Three.js Scene container
     * @private
     */
    _initScene() {
        this.scene = new THREE.Scene();

        // Deep dark laboratory background — physically correct dark environment
        this.scene.background = new THREE.Color(0x050709);

        // Distance fog for atmospheric depth falloff (dark industrial haze)
        this.scene.fog = new THREE.FogExp2(0x050709, 0.012);
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
            alpha: false,
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

        // CINEMATIC TONE MAPPING — ACESFilmic for premium industrial render quality
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        // Append canvas to mount container
        this.container.appendChild(this.renderer.domElement);
    }

    /**
     * Initialize post-processing pipeline with EffectComposer, RenderPass, UnrealBloomPass, and OutputPass
     * Configured with HDR WebGLRenderTarget (HalfFloatType) for accurate linear scene bloom prior to tone mapping
     * @private
     */
    _initPostProcessing() {
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;

        // Explicit HDR HalfFloatType render target in linear space (THREE.NoColorSpace)
        // OutputPass performs ACESFilmic tone-mapping and final sRGB transfer at the end of the chain
        const hdrRenderTarget = new THREE.WebGLRenderTarget(width, height, {
            type: THREE.HalfFloatType,
            format: THREE.RGBAFormat,
            colorSpace: THREE.NoColorSpace
        });

        this.composer = new EffectComposer(this.renderer, hdrRenderTarget);

        // 1. Base Scene Render Pass
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // 2. Unreal Bloom Pass tuned for HDR industrial environment
        // Threshold: 0.90 (restricts bloom strictly to high-luminance emissives, LEDs & spotlights)
        // Strength: 0.35 (crisp, restrained glow without haze on white chassis)
        // Radius: 0.45 (contained optical falloff)
        const resolution = new THREE.Vector2(width, height);
        this.bloomPass = new UnrealBloomPass(resolution, 0.35, 0.45, 0.90);
        this.composer.addPass(this.bloomPass);

        // 3. Output Pass — handles ACESFilmic tone mapping & SRGBColorSpace output post-bloom
        const outputPass = new OutputPass();
        this.composer.addPass(outputPass);
    }

    /**
     * Generate image-based lighting environment map from RoomEnvironment
     * Provides realistic ambient reflections for metallic and rough PBR materials
     * @private
     */
    _initEnvironmentMap() {
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();

        const roomEnvironment = new RoomEnvironment();
        this.scene.environment = pmremGenerator.fromScene(roomEnvironment, 0.04).texture;

        pmremGenerator.dispose();
        roomEnvironment.dispose();
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

        if (this.composer) {
            this.composer.setSize(width, height);
        }
        if (this.bloomPass && this.bloomPass.resolution) {
            this.bloomPass.resolution.set(width, height);
        }
    }

    /**
     * Set bloom parameters dynamically
     * @param {Object} params
     * @param {number} [params.threshold]
     * @param {number} [params.strength]
     * @param {number} [params.radius]
     */
    setBloomParams({ threshold, strength, radius } = {}) {
        if (!this.bloomPass) return;
        if (threshold !== undefined) this.bloomPass.threshold = threshold;
        if (strength !== undefined) this.bloomPass.strength = strength;
        if (radius !== undefined) this.bloomPass.radius = radius;
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
     * Smoothly transition camera orbit to a predefined section preset
     * @param {string} sectionId 'front' | 'left' | 'right' | 'back'
     * @returns {boolean} True if preset exists and target was set
     */
    goToSection(sectionId) {
        if (!sectionId) return false;
        const key = String(sectionId).toLowerCase().trim();
        const preset = this.sectionPresets[key];
        if (!preset) {
            console.warn(`[SceneManager] Unknown section preset: "${sectionId}". Available: front, left, right, back`);
            return false;
        }

        this.isTransitioning = true;
        this.targetTheta = preset.theta;
        this.targetPhi = preset.phi;
        this.targetRadius = preset.radius;
        if (preset.focus) {
            this.targetFocus.copy(preset.focus);
        }
        return true;
    }

    /**
     * Returns true if camera is currently navigating to a preset
     * @returns {boolean}
     */
    isNavigating() {
        return this.isTransitioning;
    }

    /**
     * Update camera position with smooth orbit inspection and subtle parallax
     * @param {Object} pointer PointerTracker instance
     * @param {number} [deltaTime=0.016] Elapsed frame delta time in seconds
     */
    updateCameraParallax(pointer, deltaTime = 0.016) {
        if (!this.camera || !pointer) return;

        // 1. Process drag orbit input (full 360-degree continuous horizontal rotation & wide vertical range)
        if (pointer.isDragging) {
            this.isTransitioning = false; // User drag overrides any programmatic transition
            this.targetTheta -= pointer.dragDeltaX * 0.0055;
            this.targetPhi -= pointer.dragDeltaY * 0.0055;
        }

        // 2. Process wheel zoom input (Responsive smooth CAD-style zoom)
        if (Math.abs(pointer.wheelDelta) > 0.0001) {
            this.targetRadius += pointer.wheelDelta * 1.2;
            pointer.wheelDelta *= 0.5; // Fast decay for crisp response
        }

        // 3. Enforce vertical polar and zoom boundaries (No horizontal clamp - full 360° orbit)
        this.targetPhi = THREE.MathUtils.clamp(this.targetPhi, this.minPhi, this.maxPhi);
        this.targetRadius = THREE.MathUtils.clamp(this.targetRadius, this.minRadius, this.maxRadius);

        // 4. Smooth Damping Interpolation with shortest-path theta wraparound
        const damping = deltaTime ? Math.min(1.0, deltaTime * 8.0) : 0.10;

        const thetaDelta = Math.atan2(
            Math.sin(this.targetTheta - this.currentTheta),
            Math.cos(this.targetTheta - this.currentTheta)
        );
        this.currentTheta += thetaDelta * damping;
        this.currentPhi += (this.targetPhi - this.currentPhi) * damping;
        this.currentRadius += (this.targetRadius - this.currentRadius) * damping;
        this.currentFocus.lerp(this.targetFocus, damping);

        // 4.5. Check Programmatic Transition Arrival Threshold
        if (this.isTransitioning) {
            const thetaDiff = Math.abs(thetaDelta);
            const phiDiff = Math.abs(this.targetPhi - this.currentPhi);
            const radiusDiff = Math.abs(this.targetRadius - this.currentRadius);
            const focusDiff = this.currentFocus.distanceTo(this.targetFocus);

            if (thetaDiff < 0.02 && phiDiff < 0.02 && radiusDiff < 0.04 && focusDiff < 0.04) {
                this.isTransitioning = false;
            }
        }

        // 5. Subtle micro-parallax shift when NOT dragging
        let parallaxX = 0;
        let parallaxY = 0;
        if (!pointer.isDragging) {
            parallaxX = pointer.smoothX * 0.35;
            parallaxY = pointer.smoothY * 0.20;
        }

        // 6. Direction-Preserving Ray-Box Radius Bounding
        // Limits camera distance along the spherical ray so it never penetrates floor, ceiling, or walls,
        // while strictly preserving the spherical look direction so looking up at the ceiling works cleanly.
        const sinPhi = Math.sin(this.currentPhi);
        const cosPhi = Math.cos(this.currentPhi);
        const sinTheta = Math.sin(this.currentTheta);
        const cosTheta = Math.cos(this.currentTheta);

        const ux = sinPhi * sinTheta;
        const uy = cosPhi;
        const uz = sinPhi * cosTheta;

        let maxAllowedRadius = this.currentRadius;

        // Bounded within physical room interior: X in [-10.2, 10.2], Y in [-1.6, 6.8], Z in [-10.2, 10.2]
        if (Math.abs(ux) > 0.0001) {
            const rx = ux > 0 ? (this.roomBounds.maxX - this.currentFocus.x) / ux : (this.roomBounds.minX - this.currentFocus.x) / ux;
            if (rx > 0) maxAllowedRadius = Math.min(maxAllowedRadius, rx);
        }
        if (Math.abs(uy) > 0.0001) {
            const ry = uy > 0 ? (this.roomBounds.maxY - this.currentFocus.y) / uy : (this.roomBounds.minY - this.currentFocus.y) / uy;
            if (ry > 0) maxAllowedRadius = Math.min(maxAllowedRadius, ry);
        }
        if (Math.abs(uz) > 0.0001) {
            const rz = uz > 0 ? (this.roomBounds.maxZ - this.currentFocus.z) / uz : (this.roomBounds.minZ - this.currentFocus.z) / uz;
            if (rz > 0) maxAllowedRadius = Math.min(maxAllowedRadius, rz);
        }

        const effectiveRadius = Math.max(this.minRadius, Math.min(this.currentRadius, maxAllowedRadius));

        const camX = effectiveRadius * ux + this.currentFocus.x + parallaxX;
        const camY = effectiveRadius * uy + this.currentFocus.y + parallaxY;
        const camZ = effectiveRadius * uz + this.currentFocus.z;

        this.camera.position.set(camX, camY, camZ);
        this.camera.lookAt(this.currentFocus);
    }

    /**
     * Render the active scene from camera perspective via EffectComposer post-processing pipeline
     */
    render() {
        if (this.composer) {
            this.composer.render();
        } else if (this.renderer && this.scene && this.camera) {
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

        if (this.composer) {
            this.composer.dispose();
        }

        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentElement) {
                this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
            }
        }
    }
}

