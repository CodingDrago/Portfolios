/**
 * PlaceholderObject - Phase 1 Verification 3D Test Object
 * A mechanical node mesh used to verify WebGL rendering, lighting, camera, pointer tracking, and state pipeline
 */

import * as THREE from 'three';
import { CONFIG, STATES } from '../config.js';

export class PlaceholderObject {
    constructor() {
        this.group = new THREE.Group();

        this.outerMesh = null;
        this.innerCore = null;
        this.wireframeMesh = null;

        this.outerMaterial = null;
        this.coreMaterial = null;

        this._initMesh();
    }

    /**
     * Create engineered 3D test geometry
     * @private
     */
    _initMesh() {
        // 1. Outer Faceted Polyhedron Shell
        const outerGeometry = new THREE.OctahedronGeometry(1.2, 1);
        this.outerMaterial = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.titanium,
            metalness: 0.85,
            roughness: 0.25,
            flatShading: true
        });
        this.outerMesh = new THREE.Mesh(outerGeometry, this.outerMaterial);
        this.outerMesh.castShadow = true;
        this.outerMesh.receiveShadow = true;

        // 2. Wireframe Overlay Frame
        const wireframeGeometry = new THREE.OctahedronGeometry(1.25, 1);
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: CONFIG.colors.amber,
            wireframe: true,
            transparent: true,
            opacity: 0.35
        });
        this.wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);

        // 3. Central Energy Core
        const coreGeometry = new THREE.IcosahedronGeometry(0.5, 2);
        this.coreMaterial = new THREE.MeshBasicMaterial({
            color: CONFIG.colors.amber,
            wireframe: false
        });
        this.innerCore = new THREE.Mesh(coreGeometry, this.coreMaterial);

        // Assemble Group
        this.group.add(this.outerMesh);
        this.group.add(this.wireframeMesh);
        this.group.add(this.innerCore);

        // Slight initial tilt
        this.group.rotation.x = 0.3;
        this.group.rotation.y = 0.4;
    }

    /**
     * Add placeholder group to scene
     * @param {THREE.Scene} scene 
     */
    addToScene(scene) {
        if (scene) {
            scene.add(this.group);
        }
    }

    /**
     * Handle system state transition color feedback
     * @param {string} state Current system state
     */
    onStateChange(state) {
        if (!this.coreMaterial || !this.outerMaterial) return;

        switch (state) {
            case STATES.TRACKING:
            case STATES.REACHING:
                this.coreMaterial.color.setHex(CONFIG.colors.amber);
                this.wireframeMesh.material.opacity = 0.6;
                break;
            case STATES.GRABBING:
            case STATES.EXPANDED:
                this.coreMaterial.color.setHex(CONFIG.colors.cyan);
                this.wireframeMesh.material.opacity = 0.85;
                break;
            case STATES.IDLE:
            default:
                this.coreMaterial.color.setHex(0x7a889b);
                this.wireframeMesh.material.opacity = 0.25;
                break;
        }
    }

    /**
     * Update placeholder rotation and orientation per frame loop
     * @param {number} deltaTime Time elapsed since last frame
     * @param {Object} pointer PointerTracker instance containing smoothX, smoothY
     */
    update(deltaTime, pointer) {
        if (!this.group) return;

        // Continuous ambient rotation
        this.outerMesh.rotation.y += deltaTime * 0.4;
        this.outerMesh.rotation.x += deltaTime * 0.2;
        this.innerCore.rotation.y -= deltaTime * 0.6;

        // Orient group smoothly toward pointer position
        if (pointer) {
            const targetRotationX = pointer.smoothY * 0.6; // Vertical tilt
            const targetRotationY = pointer.smoothX * 0.8; // Horizontal rotation

            this.group.rotation.x += (targetRotationX - this.group.rotation.x) * 0.05;
            this.group.rotation.y += (targetRotationY - this.group.rotation.y) * 0.05;
        }
    }
}
