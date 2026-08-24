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

        // 11. Physical Engineering Workbench Desktop (Matte Dark Industrial Composite)
        this.materials.workbenchTop = new THREE.MeshStandardMaterial({
            color: 0x14181f,
            roughness: 0.7,
            metalness: 0.2,
            flatShading: false
        });

        // 12. Extruded T-Slot Anodized Aluminum Frame
        this.materials.workbenchFrame = new THREE.MeshStandardMaterial({
            color: 0x101317,
            roughness: 0.35,
            metalness: 0.85
        });

        // 13. Test Instruments Dark Casing (Oscilloscope, Power Supply, Rework Station)
        this.materials.instrumentChassis = new THREE.MeshStandardMaterial({
            color: 0x1a202c,
            roughness: 0.45,
            metalness: 0.6
        });

        // 14. Instrument Front Bezels & Dials (Brushed Steel & Gunmetal)
        this.materials.instrumentDial = new THREE.MeshStandardMaterial({
            color: 0x2d3748,
            roughness: 0.3,
            metalness: 0.8
        });

        // 15. Active Prototype Circuit Board (FR4 Dark Green/Black Solder Mask)
        this.materials.pcbSubstrate = new THREE.MeshStandardMaterial({
            color: 0x0c1512,
            roughness: 0.4,
            metalness: 0.3
        });

        // 16. PCB Gold-Plated Solder Test Pads & Traces
        this.materials.pcbGold = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.25,
            metalness: 0.95
        });

        // 17. SMD IC Chips & Microcontrollers (Matte Epoxy Resin)
        this.materials.icEpoxy = new THREE.MeshStandardMaterial({
            color: 0x080a0c,
            roughness: 0.8,
            metalness: 0.1
        });

        // 18. Optical Calibration Breadboard Matrix (Anodized Aluminum with Precision Matrix)
        this.materials.opticalBreadboard = new THREE.MeshStandardMaterial({
            color: 0x1e242d,
            roughness: 0.3,
            metalness: 0.75
        });

        // 19. Status Indicator LEDs (Amber, Green, Blue)
        this.materials.ledGreen = new THREE.MeshBasicMaterial({
            color: 0x10b981
        });

        this.materials.ledBlue = new THREE.MeshBasicMaterial({
            color: 0x38bdf8
        });

        this.materials.ledAmber = new THREE.MeshBasicMaterial({
            color: CONFIG.colors.amber || 0xffb703
        });

        // 20. Futuristic Spatial Interface Smoked Translucent Glass
        this.materials.smokedGlassHolo = new THREE.MeshPhysicalMaterial({
            color: 0x080c12,
            transparent: true,
            opacity: 0.42,
            roughness: 0.12,
            metalness: 0.85,
            transmission: 0.6,
            ior: 1.45,
            reflectivity: 0.5,
            depthWrite: false
        });

        // 21. Spatial Holographic Vector Lines (Glowing Amber)
        this.materials.holoLineAmber = new THREE.LineBasicMaterial({
            color: CONFIG.colors.amber || 0xffb703,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            linewidth: 1
        });

        // 22. Spatial Holographic Vector Lines (Crisp Off-White)
        this.materials.holoLineWhite = new THREE.LineBasicMaterial({
            color: 0xe2e8f0,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending,
            linewidth: 1
        });

        // 23. Spatial Projected Grid Surface (Additive Amber Glow)
        this.materials.projectedGrid = new THREE.MeshBasicMaterial({
            color: CONFIG.colors.amber || 0xffb703,
            transparent: true,
            opacity: 0.22,
            wireframe: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        // 24. Ceiling Structural Panels & Tiles
        this.materials.ceilingTile = new THREE.MeshStandardMaterial({
            color: 0x090b0f,
            roughness: 0.85,
            metalness: 0.3,
            flatShading: true
        });

        // 25. Ventilation Louvers & Grilles
        this.materials.ventilationLouver = new THREE.MeshStandardMaterial({
            color: 0x141820,
            roughness: 0.45,
            metalness: 0.75
        });

        // 26. Spotlight Fixture Metal Body & Brackets
        this.materials.spotlightHousing = new THREE.MeshStandardMaterial({
            color: 0x101318,
            roughness: 0.35,
            metalness: 0.85
        });

        // 27. Spotlight Glowing Fresnel Lens Glass
        this.materials.spotlightLens = new THREE.MeshStandardMaterial({
            color: 0xfff4e0,
            emissive: 0xffe8c0,
            emissiveIntensity: 0.9,
            roughness: 0.1,
            metalness: 0.1
        });

        // 28. Server Rack & Equipment Cabinet Enclosures
        this.materials.serverRack = new THREE.MeshStandardMaterial({
            color: 0x11141a,
            roughness: 0.55,
            metalness: 0.65
        });

        // 29. Server Rack Modular Drawers & Panels
        this.materials.serverUnit = new THREE.MeshStandardMaterial({
            color: 0x171c24,
            roughness: 0.4,
            metalness: 0.7
        });

        // 30. Antistatic ESD Workbench Top Mat
        this.materials.esdMat = new THREE.MeshStandardMaterial({
            color: 0x121822,
            roughness: 0.75,
            metalness: 0.15
        });

        // 31. Copper & Bronze Heat Sinks
        this.materials.copperHeatSink = new THREE.MeshStandardMaterial({
            color: 0xc87533,
            roughness: 0.3,
            metalness: 0.9
        });

        // 32. Additional PCB Solder Masks (Blue & Red)
        this.materials.pcbBlue = new THREE.MeshStandardMaterial({
            color: 0x0a1c2e,
            roughness: 0.4,
            metalness: 0.3
        });

        this.materials.pcbRed = new THREE.MeshStandardMaterial({
            color: 0x2e0c12,
            roughness: 0.4,
            metalness: 0.3
        });

        // 33. Flexible Industrial Wiring Conduits
        this.materials.wireBlack = new THREE.MeshStandardMaterial({
            color: 0x080a0d,
            roughness: 0.7,
            metalness: 0.15
        });

        this.materials.wireAmber = new THREE.MeshStandardMaterial({
            color: 0xff9d00,
            roughness: 0.5,
            metalness: 0.2
        });

        this.materials.wireCyan = new THREE.MeshStandardMaterial({
            color: 0x00b4d8,
            roughness: 0.5,
            metalness: 0.2
        });

        // 34. Smoked Transparent Acrylic Covers
        this.materials.acrylicCover = new THREE.MeshPhysicalMaterial({
            color: 0x0c121c,
            transparent: true,
            opacity: 0.45,
            roughness: 0.1,
            metalness: 0.8,
            transmission: 0.7,
            ior: 1.45,
            depthWrite: false
        });

        // 35. White Engineering Surface
        this.materials.whiteChassis = new THREE.MeshStandardMaterial({
            color: 0xdde2ea,
            roughness: 0.35,
            metalness: 0.2
        });

        // 36. Holographic Panel Backings (Translucent UI plane)
        this.materials.holoPanel = new THREE.MeshBasicMaterial({
            color: CONFIG.colors.amber || 0xffb703,
            transparent: true,
            opacity: 0.15,
            blending: THREE.NormalBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.materials.holoPanelAmber = this.materials.holoPanel;

        this.materials.holoPanelCyan = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.15,
            blending: THREE.NormalBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.materials.holoPanelPurple = new THREE.MeshBasicMaterial({
            color: 0xa78bfa,
            transparent: true,
            opacity: 0.15,
            blending: THREE.NormalBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.materials.holoPanelGreen = new THREE.MeshBasicMaterial({
            color: 0x10b981,
            transparent: true,
            opacity: 0.15,
            blending: THREE.NormalBlending,
            side: THREE.DoubleSide,
            depthWrite: false
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
