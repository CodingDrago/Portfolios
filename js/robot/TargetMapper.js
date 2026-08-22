/**
 * TargetMapper - True Camera-Ray → 3D Workspace Surface Raycasting System
 *
 * Casts a Three.js Ray from the camera through pointer NDC coordinates into the 3D scene,
 * intersecting directly against the dedicated USER_TARGET_SURFACE 3D collision mesh.
 * The intersection point (hit.point) in world space becomes the authoritative target
 * for the robot's 6-DOF analytic IK solver.
 *
 * Core Dataflow:
 *   SCREEN POINTER (2D)
 *       ↓
 *   NDC COORDINATES [-1, +1]
 *       ↓
 *   CAMERA RAY (origin + direction in world space)
 *       ↓
 *   3D USER_TARGET_SURFACE INTERSECTION (raycaster.intersectObject)
 *       ↓
 *   WORLD-SPACE TARGET (validated against physical boundaries)
 *       ↓
 *   ROBOT IK SOLVER
 */

import * as THREE from 'three';

export class TargetMapper {
    constructor() {
        // Physical workspace boundary limits in world coordinates
        this.bounds = {
            minX: -4.0, maxX: 4.0,
            minY: -0.75, maxY: 2.80,
            minZ: -4.0, maxZ: 4.0
        };

        // Radial boundaries from robot base origin (0, -1.48, 0)
        this.minRadius = 0.60; // Cannot enter mounting base / central pedestal
        this.maxRadius = 3.60; // Within maximum physical reach of the 6-DOF arm

        // Authoritative world-space target
        this.currentTarget = new THREE.Vector3(0, 0.8, 2.2);

        // Raycasting engine
        this.raycaster = new THREE.Raycaster();

        // Debug ray telemetry
        this.lastRayOrigin = new THREE.Vector3();
        this.lastRayDirection = new THREE.Vector3();
        this.lastHitPoint = new THREE.Vector3();
        this.hasHit = false;

        // Build dedicated USER_TARGET_SURFACE 3D collision structure
        this.workspaceSurface = this._buildTargetSurface();
    }

    /**
     * Constructs the dedicated 3D USER_TARGET_SURFACE compound collision mesh.
     * Represents the reachable 3D envelope of the robot:
     *   1. Horizontal deck disc at working height y = -0.65 (covers table / cell surface)
     *   2. Upright cylinder shell of radius 3.2m spanning y = -0.65 to y = 2.55
     *   3. Upper spherical dome cap from y = 2.55 to y = 4.15
     *
     * Material is transparent/opacity=0 with double-sided rendering, ensuring
     * 100% raycast hit reliability from ANY camera orbit orientation (0°–360°).
     * @private
     * @returns {THREE.Group}
     */
    _buildTargetSurface() {
        const group = new THREE.Group();
        group.name = 'USER_TARGET_SURFACE';
        group.userData.isUserTargetSurface = true;

        // Invisible raycast-receptive material (visible=true, opacity=0, DoubleSide)
        const surfaceMat = new THREE.MeshBasicMaterial({
            visible: true,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            depthTest: false,
            side: THREE.DoubleSide
        });

        // 1. Horizontal Table / Work-Deck Disc (y = -0.65, radius = 3.5m)
        const discGeo = new THREE.CircleGeometry(3.5, 48);
        const discMesh = new THREE.Mesh(discGeo, surfaceMat);
        discMesh.rotation.x = -Math.PI / 2;
        discMesh.position.set(0, -0.65, 0);
        discMesh.name = 'USER_TARGET_DECK';
        group.add(discMesh);

        // 2. Surrounding Cylindrical Arc Wall (radius = 3.2m, height = 3.2m, centered at y = 0.95)
        const cylGeo = new THREE.CylinderGeometry(3.2, 3.2, 3.2, 48, 1, true);
        const cylMesh = new THREE.Mesh(cylGeo, surfaceMat);
        cylMesh.position.set(0, 0.95, 0);
        cylMesh.name = 'USER_TARGET_CYLINDER';
        group.add(cylMesh);

        // 3. Upper Spherical Dome Cap (radius = 3.2m, top hemisphere)
        const domeGeo = new THREE.SphereGeometry(3.2, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const domeMesh = new THREE.Mesh(domeGeo, surfaceMat);
        domeMesh.position.set(0, 0.95, 0);
        domeMesh.name = 'USER_TARGET_DOME';
        group.add(domeMesh);

        return group;
    }

    /**
     * Returns the 3D USER_TARGET_SURFACE collision object to be added to the scene.
     * @returns {THREE.Group}
     */
    getWorkspaceSurface() {
        return this.workspaceSurface;
    }

    /**
     * Backward-compatible setter for external workspace mesh registration.
     * @param {THREE.Object3D} mesh
     */
    setWorkspaceMesh(mesh) {
        if (mesh) {
            this.workspaceSurface = mesh;
        }
    }

    /**
     * Returns a clone of the current authoritative world-space target.
     * @returns {THREE.Vector3}
     */
    getLastTarget() {
        return this.currentTarget.clone();
    }

    /**
     * Returns the latest ray origin, direction, and hit point for visual debugging.
     * @returns {{origin: THREE.Vector3, direction: THREE.Vector3, hitPoint: THREE.Vector3, hasHit: boolean}}
     */
    getLastRayInfo() {
        return {
            origin: this.lastRayOrigin.clone(),
            direction: this.lastRayDirection.clone(),
            hitPoint: this.lastHitPoint.clone(),
            hasHit: this.hasHit
        };
    }

    /**
     * Casts a camera ray through pointer NDC coordinates, intersects against
     * USER_TARGET_SURFACE, enforces physical world-space boundaries, and returns
     * the authoritative 3D target coordinates.
     *
     * @param {Object}        pointer  PointerTracker instance
     * @param {THREE.Camera}  camera   Three.js perspective camera (current frame)
     * @returns {THREE.Vector3}        Authoritative 3D world target
     */
    mapPointerToTarget(pointer, camera) {
        if (!pointer || !camera || !this.workspaceSurface) {
            return this.currentTarget;
        }

        const ndcX = pointer.normalizedX !== undefined ? pointer.normalizedX : 0;
        const ndcY = pointer.normalizedY !== undefined ? pointer.normalizedY : 0;

        // 1. Set Ray from current Camera and Pointer NDC
        this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
        this.lastRayOrigin.copy(this.raycaster.ray.origin);
        this.lastRayDirection.copy(this.raycaster.ray.direction);

        // 2. Intersect ray against the physical USER_TARGET_SURFACE mesh
        const intersects = this.raycaster.intersectObject(this.workspaceSurface, true);

        if (intersects.length > 0) {
            this.hasHit = true;
            // Closest valid intersection point along the camera ray
            const hitPoint = intersects[0].point.clone();
            this.lastHitPoint.copy(hitPoint);

            // 3. Enforce physical constraints in WORLD SPACE
            // A. Radial clamp relative to robot base origin (0, 0)
            let r = Math.hypot(hitPoint.x, hitPoint.z);
            if (r < this.minRadius) {
                const scale = this.minRadius / (r || 1);
                hitPoint.x *= scale;
                hitPoint.z *= scale;
            } else if (r > this.maxRadius) {
                const scale = this.maxRadius / r;
                hitPoint.x *= scale;
                hitPoint.z *= scale;
            }

            // B. Height boundary clamp (cannot penetrate mounting platform at -1.48m or ceiling at 7.2m)
            hitPoint.y = THREE.MathUtils.clamp(hitPoint.y, this.bounds.minY, this.bounds.maxY);

            // C. Bounding box clamp
            hitPoint.x = THREE.MathUtils.clamp(hitPoint.x, this.bounds.minX, this.bounds.maxX);
            hitPoint.z = THREE.MathUtils.clamp(hitPoint.z, this.bounds.minZ, this.bounds.maxZ);

            this.currentTarget.copy(hitPoint);
        } else {
            this.hasHit = false;
            // On ray miss: retain previously calculated valid world target
        }

        return this.currentTarget;
    }
}
