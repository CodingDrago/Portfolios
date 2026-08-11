/**
 * Centralized Application Configuration & State Constants
 * Phase 1 Foundation: Configurable parameters for 3D robotics workstation hero
 */

// Application States Enum
export const STATES = Object.freeze({
    IDLE: 'IDLE',
    TRACKING: 'TRACKING',
    REACHING: 'REACHING',
    GRABBING: 'GRABBING',
    EXPANDED: 'EXPANDED',
    RELEASING: 'RELEASING'
});

// System Configuration Object
export const CONFIG = {
    // Camera settings
    camera: {
        fov: 45,
        near: 0.1,
        far: 1000,
        position: { x: 0, y: 0, z: 8 },
        lookAt: { x: 0, y: 0, z: 0 }
    },

    // Renderer settings
    renderer: {
        antialias: true,
        alpha: true,
        maxPixelRatio: 2,
        powerPreference: 'high-performance'
    },

    // Industrial Lighting parameters
    lighting: {
        ambient: {
            color: 0xffffff,
            intensity: 0.6
        },
        keyLight: {
            color: 0xfff4e0,
            intensity: 1.4,
            position: { x: 5, y: 7, z: 6 }
        },
        fillLight: {
            color: 0x64b5f6,
            intensity: 0.5,
            position: { x: -6, y: -2, z: -4 }
        },
        rimLight: {
            color: 0xffb703,
            intensity: 0.9,
            position: { x: 0, y: 6, z: -5 }
        }
    },

    // Industrial Color Palette Tokens (Hex & Decimal format for Three.js)
    colors: {
        bgDark: 0x08090b,
        graphite: 0x0d0f13,
        titanium: 0x2d323e,
        offWhite: 0xe6e9ee,
        amber: 0xffb703,
        cyan: 0x00b4d8
    },

    // Pointer Input parameters
    pointer: {
        smoothFactor: 0.08,        // Interpolation speed for smooth coordinates
        inactivityTimeoutMs: 3000  // Duration before auto-transitioning to IDLE state
    },

    // Debugging & Development Flags
    debug: true
};
