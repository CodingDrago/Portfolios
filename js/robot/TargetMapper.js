/**
 * TargetMapper - True Camera-Ray → 3D Panel Geometry & Workspace Surface Raycasting System
 *
 * Implements two-tier authoritative 3D raycasting with out-of-reach settling and smooth damping:
 *   1. Primary Target Priority: Real interactive 3D panel meshes AND 26x10 real wall backplane
 *      meshes across active/facing walls (WallFrontAbout, WallLeftProjects, WallRightSocial, WallBackGames).
 *      Both are queried in a single intersectObjects() pass so depth sorting resolves naturally:
 *        - Pointing at a panel -> panel hits first (closer in depth).
 *        - Pointing at blank wall space -> real 26x10 wall backplane hits at distance 12.0m (no depth jump).
 *   2. Secondary Fallback: Dedicated 3D USER_TARGET_SURFACE collision geometry (strictly for camera rays
 *      that miss all walls/panels, e.g. pointing into open floor or ceiling).
 *   3. Explicit Out-of-Reach Detection: When the raw target distance exceeds the arm's true physical
 *      max reach (~3.70m from shoulder), sets `isTargetReachable = false` and cleanly settles the target
 *      at maximum reach along the exact 3D ray direction vector from shoulder to target, maintaining a
 *      physically consistent extended pose without unnatural contortion.
 *   4. Damping / Smoothing: Interpolates currentTarget toward hitPoint (~0.30 per frame at 60fps).
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

        // Base pedestal clearance boundary
        this.minRadius = 0.60; // Cannot enter mounting base / central pedestal

        // True physical arm reach in world coordinates (from shoulder at y = -0.414)
        // (L2 1.80 + Ldistal 2.80) * 0.98 * 0.82 scale ≈ 3.70m
        this.shoulderWorldPos = new THREE.Vector3(0, -0.414, 0);
        this.maxPhysicalReach = 3.70;

        // Reachability flag
        this.isTargetReachable = true;

        // Authoritative world-space target
        this.currentTarget = new THREE.Vector3(0, 0.8, 2.2);

        // Raycasting engine
        this.raycaster = new THREE.Raycaster();

        // Registered real panel meshes for primary raycasting
        this.panelMeshes = [];

        // Registered real 26x10 wall backplane meshes
        this.wallBackplaneMeshes = [];

        // Debug ray telemetry
        this.lastRayOrigin = new THREE.Vector3();
        this.lastRayDirection = new THREE.Vector3();
        this.lastHitPoint = new THREE.Vector3();
        this.hasHit = false;
        this.hitType = 'NONE'; // 'PANEL' | 'WALL' | 'SURFACE' | 'NONE'

        // Build dedicated USER_TARGET_SURFACE 3D collision structure (fallback)
        this.workspaceSurface = this._buildTargetSurface();
    }

    /**
     * Constructs the dedicated 3D USER_TARGET_SURFACE compound collision mesh.
     * Represents the reachable 3D envelope of the robot:
     *   1. Horizontal deck disc at working height y = -0.65 (covers table / cell surface)
     *   2. Upright cylinder shell of radius 3.2m spanning y = -0.65 to y = 2.55
     *   3. Upper spherical dome cap from y = 2.55 to y = 4.15
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
     * Register interactive panel meshes or groups from the 4 walls
     * @param {Array<THREE.Object3D>|THREE.Object3D} objects
     */
    registerPanelMeshes(objects) {
        if (!objects) return;
        const list = Array.isArray(objects) ? objects : [objects];
        list.forEach(obj => {
            if (!obj) return;
            if (obj.isMesh) {
                if (!this.panelMeshes.includes(obj)) {
                    this.panelMeshes.push(obj);
                }
            } else if (obj.traverse) {
                obj.traverse(child => {
                    if (child.isMesh && !this.panelMeshes.includes(child)) {
                        // Exclude the 26x10 full-room wall backplane plane mesh from panelMeshes (registered separately)
                        if (child.geometry && child.geometry.parameters &&
                            child.geometry.parameters.width >= 20 && child.geometry.parameters.height >= 8) {
                            return;
                        }
                        this.panelMeshes.push(child);
                    }
                });
            }
        });
    }

    /**
     * Register the real 26x10 wall backplane meshes from the 4 walls
     * @param {Array<THREE.Mesh>|THREE.Mesh} meshes
     */
    registerWallBackplanes(meshes) {
        if (!meshes) return;
        const list = Array.isArray(meshes) ? meshes : [meshes];
        list.forEach(mesh => {
            if (!mesh) return;
            if (mesh.isMesh && !this.wallBackplaneMeshes.includes(mesh)) {
                this.wallBackplaneMeshes.push(mesh);
            } else if (mesh.traverse) {
                mesh.traverse(child => {
                    if (child.isMesh && !this.wallBackplaneMeshes.includes(child)) {
                        this.wallBackplaneMeshes.push(child);
                    }
                });
            }
        });
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
     * Returns the latest ray origin, direction, hit point, and reachability for visual debugging.
     * @returns {{origin: THREE.Vector3, direction: THREE.Vector3, hitPoint: THREE.Vector3, hasHit: boolean, hitType: string, isTargetReachable: boolean}}
     */
    getLastRayInfo() {
        return {
            origin: this.lastRayOrigin.clone(),
            direction: this.lastRayDirection.clone(),
            hitPoint: this.lastHitPoint.clone(),
            hasHit: this.hasHit,
            hitType: this.hitType,
            isTargetReachable: this.isTargetReachable
        };
    }

    /**
     * Casts a camera ray through pointer NDC coordinates.
     * Priority 1: Real panel meshes AND 26x10 wall backplane meshes in a single depth-sorted pass.
     * Priority 2: Dedicated USER_TARGET_SURFACE 3D envelope (fallback for open floor/ceiling).
     * Enforces physical boundaries in world space with explicit out-of-reach settling.
     * Smoothly lerps currentTarget and returns the authoritative 3D target.
     *
     * @param {Object}        pointer  PointerTracker instance
     * @param {THREE.Camera}  camera   Three.js perspective camera (current frame)
     * @returns {THREE.Vector3}        Authoritative 3D world target
     */
    mapPointerToTarget(pointer, camera) {
        if (!pointer || !camera) {
            return this.currentTarget;
        }

        const ndcX = pointer.normalizedX !== undefined ? pointer.normalizedX : 0;
        const ndcY = pointer.normalizedY !== undefined ? pointer.normalizedY : 0;

        // 1. Set Ray from current Camera and Pointer NDC
        this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
        this.lastRayOrigin.copy(this.raycaster.ray.origin);
        this.lastRayDirection.copy(this.raycaster.ray.direction);

        let hitPoint = null;
        let detectedType = 'NONE';

        // 2. PRIORITY 1: Raycast against combined active panel meshes + wall backplanes in a single pass
        const combinedMeshes = [...this.panelMeshes, ...this.wallBackplaneMeshes];
        if (combinedMeshes.length > 0) {
            // Filter meshes whose parent hierarchy is currently visible (respects WallVisibilityManager)
            const visibleTargets = combinedMeshes.filter(m => {
                let curr = m;
                while (curr) {
                    if (curr.visible === false) return false;
                    curr = curr.parent;
                }
                return true;
            });

            if (visibleTargets.length > 0) {
                const intersects = this.raycaster.intersectObjects(visibleTargets, false);
                if (intersects.length > 0) {
                    hitPoint = intersects[0].point.clone();
                    const isPanel = this.panelMeshes.includes(intersects[0].object);
                    detectedType = isPanel ? 'PANEL' : 'WALL';
                }
            }
        }

        // 3. PRIORITY 2: If no panel or wall was hit (open floor/ceiling), fallback to USER_TARGET_SURFACE
        if (!hitPoint && this.workspaceSurface) {
            const surfaceIntersects = this.raycaster.intersectObject(this.workspaceSurface, true);
            if (surfaceIntersects.length > 0) {
                hitPoint = surfaceIntersects[0].point.clone();
                detectedType = 'SURFACE';
            }
        }

        // 4. Enforce physical constraints with explicit out-of-reach settling
        if (hitPoint) {
            this.hasHit = true;
            this.hitType = detectedType;
            this.lastHitPoint.copy(hitPoint);

            // Compute 3D distance from robot shoulder
            const rawDistance = hitPoint.distanceTo(this.shoulderWorldPos);

            if (rawDistance > this.maxPhysicalReach) {
                // Out-of-reach target (e.g. workbench objects, distant walls)
                this.isTargetReachable = false;

                // Settle cleanly to natural extended reach limit along the 3D direction vector from shoulder
                const dir = new THREE.Vector3().subVectors(hitPoint, this.shoulderWorldPos).normalize();
                const settled = this.shoulderWorldPos.clone().addScaledVector(dir, this.maxPhysicalReach);

                // Enforce vertical height safety envelope
                settled.y = THREE.MathUtils.clamp(settled.y, this.bounds.minY, this.bounds.maxY);
                hitPoint.copy(settled);
            } else {
                // Reachable target
                this.isTargetReachable = true;

                // Base pedestal clearance radial clamp
                let r = Math.hypot(hitPoint.x, hitPoint.z);
                if (r < this.minRadius) {
                    const scale = this.minRadius / (r || 1);
                    hitPoint.x *= scale;
                    hitPoint.z *= scale;
                }

                // Standard bounding box & height clamp
                hitPoint.y = THREE.MathUtils.clamp(hitPoint.y, this.bounds.minY, this.bounds.maxY);
                hitPoint.x = THREE.MathUtils.clamp(hitPoint.x, this.bounds.minX, this.bounds.maxX);
                hitPoint.z = THREE.MathUtils.clamp(hitPoint.z, this.bounds.minZ, this.bounds.maxZ);
            }

            // D. Smooth interpolation toward hitPoint (~0.30 per frame at 60fps)
            this.currentTarget.lerp(hitPoint, 0.30);
        } else {
            this.hasHit = false;
            this.hitType = 'NONE';
            this.isTargetReachable = true;
            // On complete ray miss: retain previously calculated valid world target
        }

        return this.currentTarget;
    }
}
