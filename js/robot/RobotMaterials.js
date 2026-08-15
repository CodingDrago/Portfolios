/**
 * RobotMaterials - Industrial PBR Material Registry for 6-DOF Manipulator
 * Provides realistic materials for robot chassis, joints, actuators, and mechanical details.
 * Implements high visual contrast so adjacent assemblies never visually merge.
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class RobotMaterials {
    constructor() {
        this.materials = new Map();
        this._initMaterials();
    }

    /**
     * Initialize high-contrast industrial material palette
     * @private
     */
    _initMaterials() {
        // 1. Warm Titanium / Light Satin Grey Primary Material (Precision Outer Casing)
        this.materials.set('chassisPrimary', new THREE.MeshStandardMaterial({
            color: 0xc2c6ce,
            roughness: 0.35,
            metalness: 0.30,
            name: 'RobotChassisPrimary'
        }));
        // Backwards compatibility alias
        this.materials.set('chassisWhite', this.materials.get('chassisPrimary'));

        // 2. Medium Metallic Graphite (Structural Ribs & Recessed Side Panels)
        this.materials.set('chassisSecondary', new THREE.MeshStandardMaterial({
            color: 0x383e4a,
            roughness: 0.45,
            metalness: 0.60,
            name: 'RobotChassisSecondary'
        }));

        // 3. Cast Gunmetal / Lighter Joint Alloy (Rotary Joint Housings, Turret Platform, Elbow Core)
        this.materials.set('jointHousing', new THREE.MeshStandardMaterial({
            color: 0x565e6d,
            roughness: 0.38,
            metalness: 0.65,
            name: 'RobotJointHousing'
        }));
        // Backwards compatibility alias
        this.materials.set('jointGraphite', this.materials.get('jointHousing'));

        // 4. Dark Titanium Mechanical Pivots, Actuator Sleeves & Motor Canisters
        this.materials.set('titaniumPivot', new THREE.MeshStandardMaterial({
            color: 0x242832,
            roughness: 0.28,
            metalness: 0.85,
            name: 'RobotTitaniumPivot'
        }));
        // Backwards compatibility alias
        this.materials.set('darkTitanium', this.materials.get('titaniumPivot'));

        // 5. Deep Mechanical Gap / Shadow Gasket (Inner Joint Cavities & Seams)
        this.materials.set('mechanicalGap', new THREE.MeshStandardMaterial({
            color: 0x0c0e12,
            roughness: 0.90,
            metalness: 0.10,
            name: 'RobotMechanicalGap'
        }));

        // 6. Polished & Brushed Steel (Hydraulic Pistons, Bearing Collars, Precision Fasteners, Knuckles)
        this.materials.set('brushedSteel', new THREE.MeshStandardMaterial({
            color: 0xc8d1dc,
            roughness: 0.20,
            metalness: 0.92,
            name: 'RobotBrushedSteel'
        }));
        // Backwards compatibility alias
        this.materials.set('brushedMetal', this.materials.get('brushedSteel'));

        // 7. Textured Matte Black Cable Conduit & High-Grip Contact Pads
        this.materials.set('conduitRubber', new THREE.MeshStandardMaterial({
            color: 0x16181f,
            roughness: 0.85,
            metalness: 0.05,
            name: 'RobotConduitRubber'
        }));

        // 8. Warm Amber Technical Accent Ring
        this.materials.set('amberAccent', new THREE.MeshStandardMaterial({
            color: CONFIG.colors.amber || 0xffb703,
            roughness: 0.35,
            metalness: 0.40,
            name: 'RobotAmberAccent'
        }));

        // 9. Emissive Amber Status LED Ring
        this.materials.set('indicatorAmber', new THREE.MeshStandardMaterial({
            color: CONFIG.colors.amber || 0xffb703,
            emissive: CONFIG.colors.amber || 0xffb703,
            emissiveIntensity: 1.0,
            roughness: 0.2,
            metalness: 0.5,
            name: 'RobotIndicatorAmber'
        }));
    }

    /**
     * Retrieve material by identifier
     * @param {string} key 
     * @returns {THREE.Material}
     */
    get(key) {
        return this.materials.get(key) || this.materials.get('chassisPrimary');
    }
}

