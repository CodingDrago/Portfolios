/**
 * Lighting - Industrial Workstation Lighting Setup
 * Configures key light, ambient light, fill light, and rim light for depth & form
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class Lighting {
    constructor() {
        this.ambientLight = null;
        this.keyLight = null;
        this.fillLight = null;
        this.rimLight = null;

        this._initLights();
    }

    /**
     * Create industrial light sources
     * @private
     */
    _initLights() {
        const { ambient, keyLight, fillLight, rimLight } = CONFIG.lighting;

        // Ambient Light (subtle overall illumination)
        this.ambientLight = new THREE.AmbientLight(
            ambient.color,
            ambient.intensity
        );

        // Primary Directional Key Light (industrial overhead spotlight effect)
        this.keyLight = new THREE.DirectionalLight(
            keyLight.color,
            keyLight.intensity
        );
        this.keyLight.position.set(keyLight.position.x, keyLight.position.y, keyLight.position.z);
        this.keyLight.castShadow = true;
        this.keyLight.shadow.mapSize.width = 2048;
        this.keyLight.shadow.mapSize.height = 2048;
        this.keyLight.shadow.camera.near = 0.5;
        this.keyLight.shadow.camera.far = 25;
        this.keyLight.shadow.bias = -0.0005;

        // Fill Light (cool technical fill from bottom left)
        this.fillLight = new THREE.DirectionalLight(
            fillLight.color,
            fillLight.intensity
        );
        this.fillLight.position.set(fillLight.position.x, fillLight.position.y, fillLight.position.z);

        // Rim Light (warm amber backlighting to highlight mechanical silhouettes)
        this.rimLight = new THREE.DirectionalLight(
            rimLight.color,
            rimLight.intensity
        );
        this.rimLight.position.set(rimLight.position.x, rimLight.position.y, rimLight.position.z);
    }

    /**
     * Add all created lights to the target Three.js scene
     * @param {THREE.Scene} scene 
     */
    addToScene(scene) {
        if (!scene) return;
        scene.add(this.ambientLight);
        scene.add(this.keyLight);
        scene.add(this.fillLight);
        scene.add(this.rimLight);
    }
}
