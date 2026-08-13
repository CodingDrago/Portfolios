/**
 * Materials - Centralized Industrial PBR Material System
 * Configurable material definitions for dark graphite, steel, titanium, and amber indicators
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js';

export class Materials {
    constructor() {
        this.materials = {};
        this._initMaterials();
    }

    /**
     * Create industrial PBR materials
     * @private
     */
    _initMaterials() {
        // 1. Dark Graphite Wall Panel
        this.materials.graphiteWall = new THREE.MeshStandardMaterial({
            color: 0x0e1116,
            roughness: 0.85,
            metalness: 0.25,
            flatShading: false
        });

        // 2. Structural Steel Columns / Beams
        this.materials.structuralSteel = new THREE.MeshStandardMaterial({
            color: 0x1a1e26,
            roughness: 0.5,
            metalness: 0.7,
            flatShading: true
        });

        // 3. Brushed Titanium / Steel Fasteners & Fittings
        this.materials.brushedSteel = new THREE.MeshStandardMaterial({
            color: 0x4a5260,
            roughness: 0.35,
            metalness: 0.85
        });

        // 4. Industrial Floor Plates
        this.materials.floorPlates = new THREE.MeshStandardMaterial({
            color: 0x0b0d11,
            roughness: 0.65,
            metalness: 0.4,
            flatShading: false
        });

        // 5. Floor Plate Seam Lines
        this.materials.floorSeams = new THREE.MeshBasicMaterial({
            color: 0x161a22,
            wireframe: false
        });

        // 6. Central Mounting Base Platform
        this.materials.mountingPlatform = new THREE.MeshStandardMaterial({
            color: 0x161a22,
            roughness: 0.45,
            metalness: 0.65,
            flatShading: true
        });

        // 7. Heavy Mechanical Mounting Flange Ring
        this.materials.mountingFlange = new THREE.MeshStandardMaterial({
            color: 0x242a36,
            roughness: 0.3,
            metalness: 0.8,
            flatShading: true
        });

        // 8. Work-Cell Floor Boundary Markings (Restrained Amber Paint)
        this.materials.cellMarkings = new THREE.MeshBasicMaterial({
            color: CONFIG.colors.amber || 0xffb703,
            transparent: true,
            opacity: 0.75
        });

        // 9. Emissive Amber Practical Indicator LED
        this.materials.indicatorAmber = new THREE.MeshStandardMaterial({
            color: CONFIG.colors.amber || 0xffb703,
            emissive: CONFIG.colors.amber || 0xffb703,
            emissiveIntensity: 0.8,
            roughness: 0.2,
            metalness: 0.1
        });

        // 10. Cable Conduit Channels
        this.materials.conduitPipe = new THREE.MeshStandardMaterial({
            color: 0x181c24,
            roughness: 0.6,
            metalness: 0.5
        });
    }

    /**
     * Get material by key
     * @param {string} key Material name
     * @returns {THREE.Material}
     */
    get(key) {
        return this.materials[key] || this.materials.graphiteWall;
    }

    /**
     * Dispose all materials on destroy
     */
    destroy() {
        Object.values(this.materials).forEach(mat => mat.dispose());
        this.materials = {};
    }
}
