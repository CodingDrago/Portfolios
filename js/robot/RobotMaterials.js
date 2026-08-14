/**
 * RobotMaterials - Industrial PBR Material Registry for 6-DOF Manipulator
 * Provides realistic materials for robot chassis, joints, actuators, and mechanical details.
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class RobotMaterials {
    constructor() {
        this.materials = new Map();
        this._initMaterials();
    }

    /**
     * Initialize material palette matching Phase 2 workstation aesthetic
     * @private
     */
    _initMaterials() {
        // 1. Off-White Primary Chassis Paint (Semi-gloss engineering polymer/ceramic finish)
        this.materials.set('chassisWhite', new THREE.MeshStandardMaterial({
            color: 0xdddfdc,
            roughness: 0.35,
            metalness: 0.15,
            name: 'RobotChassisWhite'
        }));

        // 2. Graphite Metallic Joint Covers & Housings
        this.materials.set('jointGraphite', new THREE.MeshStandardMaterial({
            color: CONFIG.colors.graphite || 0x0d0f13,
            roughness: 0.5,
            metalness: 0.7,
            name: 'RobotJointGraphite'
        }));

        // 3. Dark Titanium Mechanical Pivots & Actuator Sleeves
        this.materials.set('darkTitanium', new THREE.MeshStandardMaterial({
            color: CONFIG.colors.titanium || 0x2d323e,
            roughness: 0.3,
            metalness: 0.85,
            name: 'RobotDarkTitanium'
        }));

        // 4. Brushed Steel Pistons, Bolts & Bearing Rings
        this.materials.set('brushedMetal', new THREE.MeshStandardMaterial({
            color: 0xb0b8c4,
            roughness: 0.25,
            metalness: 0.9,
            name: 'RobotBrushedMetal'
        }));

        // 5. Matte Black Cable Conduit Wrap
        this.materials.set('conduitRubber', new THREE.MeshStandardMaterial({
            color: 0x14161b,
            roughness: 0.85,
            metalness: 0.05,
            name: 'RobotConduitRubber'
        }));

        // 6. Subtle Amber Technical Accent Ring
        this.materials.set('amberAccent', new THREE.MeshStandardMaterial({
            color: CONFIG.colors.amber || 0xffb703,
            roughness: 0.4,
            metalness: 0.3,
            name: 'RobotAmberAccent'
        }));

        // 7. Amber Emissive Status LED
        this.materials.set('indicatorAmber', new THREE.MeshStandardMaterial({
            color: CONFIG.colors.amber || 0xffb703,
            emissive: CONFIG.colors.amber || 0xffb703,
            emissiveIntensity: 0.8,
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
        return this.materials.get(key) || this.materials.get('chassisWhite');
    }
}
