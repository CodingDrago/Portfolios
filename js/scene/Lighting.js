/**
 * Lighting - Industrial Workstation Lighting System
 * Configures Key Light, Fill Light, Rim Light, Ambient Light, and Base Practical Light
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class Lighting {
    constructor() {
        this.ambientLight = null;
        this.keyLight = null;
        this.fillLight = null;
        this.rimLight = null;
        this.practicalLight = null;

        this._initLights();
    }

    /**
     * Create industrial light sources
     * @private
     */
    _initLights() {
        const { ambient, keyLight, fillLight, rimLight } = CONFIG.lighting;

        // 1. Ambient Light (Subtle environment fill)
        this.ambientLight = new THREE.AmbientLight(
            ambient.color || 0xffffff,
            ambient.intensity || 0.5
        );

        // 2. Overhead Directional Key Spotlight (Primary shadow caster)
        this.keyLight = new THREE.DirectionalLight(
            keyLight.color || 0xfff4e0,
            keyLight.intensity || 1.6
        );
        this.keyLight.position.set(
            keyLight.position.x || 4,
            keyLight.position.y || 10,
            keyLight.position.z || 6
        );
        this.keyLight.castShadow = true;
        this.keyLight.shadow.mapSize.width = 2048;
        this.keyLight.shadow.mapSize.height = 2048;
        this.keyLight.shadow.camera.near = 0.5;
        this.keyLight.shadow.camera.far = 30;
        this.keyLight.shadow.bias = -0.0005;

        // 3. Cool Technical Fill Light (Prevents harsh dark shadows)
        this.fillLight = new THREE.DirectionalLight(
            fillLight.color || 0x405878,
            fillLight.intensity || 0.6
        );
        this.fillLight.position.set(
            fillLight.position.x || -6,
            fillLight.position.y || 1,
            fillLight.position.z || -2
        );

        // 4. Warm Amber Rim Backlight (Separates platform & columns from background)
        this.rimLight = new THREE.DirectionalLight(
            rimLight.color || 0xffb703,
            rimLight.intensity || 1.2
        );
        this.rimLight.position.set(
            rimLight.position.x || 0,
            rimLight.position.y || 6,
            rimLight.position.z || -8
        );

        // 5. Local Practical Base Point Light (Gradients floor & mounting platform)
        this.practicalLight = new THREE.PointLight(
            CONFIG.colors.amber || 0xffb703,
            0.6,
            8
        );
        this.practicalLight.position.set(0, -1.2, 0.5);

        // 6. Left Electronics Workbench Task Light
        this.leftBenchLight = new THREE.PointLight(
            CONFIG.colors.amber || 0xffb703,
            0.45,
            6
        );
        this.leftBenchLight.position.set(-3.4, -0.4, -2.0);

        // 7. Right Robotics Bench Task Light
        this.rightBenchLight = new THREE.PointLight(
            0xe2e8f0,
            0.35,
            6
        );
        this.rightBenchLight.position.set(3.4, -0.4, -2.0);
    }

    /**
     * Add all lights to target scene
     * @param {THREE.Scene} scene 
     */
    addToScene(scene) {
        if (!scene) return;
        scene.add(this.ambientLight);
        scene.add(this.keyLight);
        scene.add(this.fillLight);
        scene.add(this.rimLight);
        scene.add(this.practicalLight);
        scene.add(this.leftBenchLight);
        scene.add(this.rightBenchLight);
    }
}
