/**
 * Lighting - Industrial Workstation Lighting System
 * Configures Key Light, Fill Light, Rim Light, Ambient Light, and 5 Ceiling Spotlights
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class Lighting {

    constructor() {
        // Base Ambient & Directional Lights
        this.ambientLight = null;
        this.keyLight = null;
        this.fillLight = null;
        this.rimLight = null;
        this.practicalLight = null;
        this.leftBenchLight = null;
        this.rightBenchLight = null;

        // 5 Primary Ceiling Mounted Spotlights
        this.spotlights = {
            center: null,
            front: null,
            left: null,
            right: null,
            back: null
        };

        this.spotTargets = [];

        this._initLights();
    }

    /**
     * Create industrial light sources and 5 primary ceiling spotlights
     * @private
     */
    _initLights() {
        const { ambient, keyLight, fillLight, rimLight } = CONFIG.lighting;

        // 1. Ambient Light (Subtle dark environment fill)
        this.ambientLight = new THREE.AmbientLight(
            ambient.color || 0xffffff,
            ambient.intensity || 0.55
        );

        // 1.5. Hemisphere Light (Sky/Ground natural fill for physical realism)
        this.hemisphereLight = new THREE.HemisphereLight(
            0x8090b0, // Cool blue-grey sky
            0x1a140e, // Warm dark ground bounce
            0.35
        );

        // 2. Global Directional Key Light (Shadow caster)
        this.keyLight = new THREE.DirectionalLight(
            keyLight.color || 0xfff4e0,
            keyLight.intensity || 1.2
        );
        this.keyLight.position.set(4, 10, 6);
        this.keyLight.castShadow = true;
        this.keyLight.shadow.mapSize.width = 2048;
        this.keyLight.shadow.mapSize.height = 2048;
        this.keyLight.shadow.camera.near = 0.5;
        this.keyLight.shadow.camera.far = 35;
        this.keyLight.shadow.bias = -0.0005;

        // 3. Cool Technical Fill Light
        this.fillLight = new THREE.DirectionalLight(
            fillLight.color || 0x405878,
            fillLight.intensity || 0.5
        );
        this.fillLight.position.set(-6, 2, -2);

        // 4. Warm Amber Rim Backlight
        this.rimLight = new THREE.DirectionalLight(
            rimLight.color || 0xffb703,
            rimLight.intensity || 0.9
        );
        this.rimLight.position.set(0, 6, -8);

        // 5. Local Practical Base Point Light
        this.practicalLight = new THREE.PointLight(CONFIG.colors.amber || 0xffb703, 0.5, 8);
        this.practicalLight.position.set(0, -1.2, 0.5);

        // 6. Workbench Task Lights
        this.leftBenchLight = new THREE.PointLight(CONFIG.colors.amber || 0xffb703, 0.4, 6);
        this.leftBenchLight.position.set(-5.8, -0.4, -3.2);

        this.rightBenchLight = new THREE.PointLight(0xe2e8f0, 0.35, 6);
        this.rightBenchLight.position.set(5.8, -0.4, -3.2);

        // =========================================================================
        // 5 PRIMARY CEILING MOUNTED SPOTLIGHTS
        // =========================================================================

        // 1. CENTER SPOTLIGHT (Aimed at Central Robot Manipulator Platform: 0, -2.0, 0)
        const targetCenter = new THREE.Object3D();
        targetCenter.position.set(0, -1.5, 0);
        this.spotTargets.push(targetCenter);

        const spotCenter = new THREE.SpotLight(0xfff6e8, 2.4, 26, Math.PI * 0.24, 0.45, 1.2);
        spotCenter.position.set(0, 6.8, 0);
        spotCenter.target = targetCenter;
        spotCenter.castShadow = true;
        spotCenter.shadow.mapSize.width = 1024;
        spotCenter.shadow.mapSize.height = 1024;
        spotCenter.shadow.bias = -0.0005;
        this.spotlights.center = spotCenter;

        // 2. FRONT SPOTLIGHT (Aimed at Front Wall / About Profile: 0, 1.5, -12.0)
        const targetFront = new THREE.Object3D();
        targetFront.position.set(0, 1.5, -12.0);
        this.spotTargets.push(targetFront);

        const spotFront = new THREE.SpotLight(0xffedd5, 2.0, 28, Math.PI * 0.30, 0.55, 1.2);
        spotFront.position.set(0, 6.8, -3.5);
        spotFront.target = targetFront;
        this.spotlights.front = spotFront;

        // 3. LEFT SPOTLIGHT (Aimed at Left Wall / Projects & Builds: -12.0, 1.5, -1.5)
        const targetLeft = new THREE.Object3D();
        targetLeft.position.set(-12.0, 1.5, -1.5);
        this.spotTargets.push(targetLeft);

        const spotLeft = new THREE.SpotLight(0xe0f2fe, 1.9, 28, Math.PI * 0.30, 0.55, 1.2);
        spotLeft.position.set(-3.5, 6.8, 0);
        spotLeft.target = targetLeft;
        this.spotlights.left = spotLeft;

        // 4. RIGHT SPOTLIGHT (Aimed at Right Wall / Social Network: +12.0, 1.5, -1.5)
        const targetRight = new THREE.Object3D();
        targetRight.position.set(12.0, 1.5, -1.5);
        this.spotTargets.push(targetRight);

        const spotRight = new THREE.SpotLight(0xfef3c7, 1.9, 28, Math.PI * 0.30, 0.55, 1.2);
        spotRight.position.set(3.5, 6.8, 0);
        spotRight.target = targetRight;
        this.spotlights.right = spotRight;

        // 5. BACK SPOTLIGHT (Aimed at Back Wall / Games & Simulation: 0, 1.5, +12.0)
        const targetBack = new THREE.Object3D();
        targetBack.position.set(0, 1.5, 12.0);
        this.spotTargets.push(targetBack);

        const spotBack = new THREE.SpotLight(0xede9fe, 2.0, 28, Math.PI * 0.30, 0.55, 1.2);
        spotBack.position.set(0, 6.8, 3.5);
        spotBack.target = targetBack;
        this.spotlights.back = spotBack;

        // Base Intensities Cache for Exploration Dimming
        this.baseIntensities = {
            ambient: ambient.intensity || 0.45,
            key: keyLight.intensity || 1.2,
            fill: fillLight.intensity || 0.5,
            rim: rimLight.intensity || 0.9,
            practical: 0.5,
            leftBench: 0.4,
            rightBench: 0.35,
            spotCenter: 2.4,
            spotFront: 2.0,
            spotLeft: 1.9,
            spotRight: 1.9,
            spotBack: 2.0
        };
    }

    /**
     * Add all lights and targets to scene
     * @param {THREE.Scene} scene 
     */
    addToScene(scene) {
        if (!scene) return;

        scene.add(this.ambientLight);
        scene.add(this.hemisphereLight);
        scene.add(this.keyLight);
        scene.add(this.fillLight);
        scene.add(this.rimLight);
        scene.add(this.practicalLight);
        scene.add(this.leftBenchLight);
        scene.add(this.rightBenchLight);

        // Add spot targets & spotlights
        this.spotTargets.forEach(t => scene.add(t));
        scene.add(this.spotlights.center);
        scene.add(this.spotlights.front);
        scene.add(this.spotlights.left);
        scene.add(this.spotlights.right);
        scene.add(this.spotlights.back);
    }

    /**
     * Smoothly dim workstation environmental lighting during component exploration
     * @param {number} dimFactor 1.0 (full brightness) to 0.28 (dimmed)
     */
    setDimLevel(dimFactor) {
        const factor = Math.max(0.1, Math.min(1.0, dimFactor));
        if (this.ambientLight) this.ambientLight.intensity = this.baseIntensities.ambient * factor;
        if (this.keyLight) this.keyLight.intensity = this.baseIntensities.key * factor;
        if (this.fillLight) this.fillLight.intensity = this.baseIntensities.fill * factor;
        if (this.rimLight) this.rimLight.intensity = this.baseIntensities.rim * factor;
        if (this.practicalLight) this.practicalLight.intensity = this.baseIntensities.practical * factor;
        if (this.leftBenchLight) this.leftBenchLight.intensity = this.baseIntensities.leftBench * factor;
        if (this.rightBenchLight) this.rightBenchLight.intensity = this.baseIntensities.rightBench * factor;

        // Dim wall spotlights while keeping center inspection spotlight active
        if (this.spotlights.center) this.spotlights.center.intensity = this.baseIntensities.spotCenter * (0.6 + factor * 0.4);
        if (this.spotlights.front) this.spotlights.front.intensity = this.baseIntensities.spotFront * factor;
        if (this.spotlights.left) this.spotlights.left.intensity = this.baseIntensities.spotLeft * factor;
        if (this.spotlights.right) this.spotlights.right.intensity = this.baseIntensities.spotRight * factor;
        if (this.spotlights.back) this.spotlights.back.intensity = this.baseIntensities.spotBack * factor;
    }
}


