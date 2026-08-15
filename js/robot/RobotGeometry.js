/**
 * RobotGeometry - Procedural 3D Mechanical Geometry Builder
 * Constructs engineered industrial assemblies for Base, Shoulder Yoke,
 * Muscular Upper Arm, Rotary Elbow, Tapered Forearm, and Multi-Axis Wrist.
 * Built with precise physical clearances so adjacent parts never intersect.
 */

import * as THREE from 'three';

export class RobotGeometry {
    constructor(materials) {
        this.mat = materials;
    }

    /**
     * Build Stationary Base Assembly
     * Sits ON top of Phase 2 mounting platform surface
     * @returns {THREE.Group}
     */
    buildBase() {
        const group = new THREE.Group();
        group.name = 'BaseAssembly';

        // 1. Lower Stationary Mounting Flange (Dark Titanium)
        const mountRingGeom = new THREE.CylinderGeometry(0.82, 0.88, 0.12, 24);
        const mountRingMesh = new THREE.Mesh(mountRingGeom, this.mat.get('titaniumPivot'));
        mountRingMesh.position.y = 0.06;
        mountRingMesh.castShadow = true;
        mountRingMesh.receiveShadow = true;
        group.add(mountRingMesh);

        // 2. Mechanical Shadow Gap / Gasket Seam
        const gasketGeom = new THREE.CylinderGeometry(0.79, 0.79, 0.03, 24);
        const gasketMesh = new THREE.Mesh(gasketGeom, this.mat.get('mechanicalGap'));
        gasketMesh.position.y = 0.135;
        group.add(gasketMesh);

        // 3. Primary Base Housing (Warm Titanium chamfered body)
        const bodyGeom = new THREE.CylinderGeometry(0.74, 0.80, 0.38, 24);
        const bodyMesh = new THREE.Mesh(bodyGeom, this.mat.get('chassisPrimary'));
        bodyMesh.position.y = 0.34;
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        group.add(bodyMesh);

        // 4. Recessed Graphite Service Hatches / Ventilation Louvers
        const ventGeom = new THREE.BoxGeometry(0.82, 0.16, 0.30);
        const ventMesh = new THREE.Mesh(ventGeom, this.mat.get('chassisSecondary'));
        ventMesh.position.y = 0.34;
        ventMesh.castShadow = true;
        group.add(ventMesh);

        // 5. Upper Bearing Race Collar (Cast Gunmetal)
        const collarGeom = new THREE.CylinderGeometry(0.71, 0.73, 0.06, 24);
        const collarMesh = new THREE.Mesh(collarGeom, this.mat.get('jointHousing'));
        collarMesh.position.y = 0.51;
        collarMesh.castShadow = true;
        group.add(collarMesh);

        // 6. Amber Technical Accent Ring
        const ringGeom = new THREE.CylinderGeometry(0.72, 0.72, 0.02, 24);
        const ringMesh = new THREE.Mesh(ringGeom, this.mat.get('amberAccent'));
        ringMesh.position.y = 0.54;
        group.add(ringMesh);

        // 7. Base Perimeter Hex Bolts (8 precision brushed steel bolts)
        const boltGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6);
        const boltMat = this.mat.get('brushedSteel');
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const bolt = new THREE.Mesh(boltGeom, boltMat);
            bolt.position.set(Math.cos(angle) * 0.66, 0.55, Math.sin(angle) * 0.66);
            bolt.castShadow = true;
            group.add(bolt);
        }

        return group;
    }

    /**
     * Build Shoulder Yoke Assembly (Dual vertical support pillars rotating with J1 Base Yaw)
     * @returns {THREE.Group}
     */
    buildShoulderYoke() {
        const group = new THREE.Group();
        group.name = 'ShoulderYoke';

        // 1. Heavy Central Turret Platform (Cast Gunmetal)
        const turretGeom = new THREE.CylinderGeometry(0.66, 0.70, 0.24, 24);
        const turretMesh = new THREE.Mesh(turretGeom, this.mat.get('jointHousing'));
        turretMesh.position.y = 0.12;
        turretMesh.castShadow = true;
        group.add(turretMesh);

        // 2. Mechanical Shadow Gap
        const gapGeom = new THREE.CylinderGeometry(0.62, 0.62, 0.03, 20);
        const gapMesh = new THREE.Mesh(gapGeom, this.mat.get('mechanicalGap'));
        gapMesh.position.y = 0.255;
        group.add(gapMesh);

        // 3. Dual Vertical Yoke Pillars (Left & Right Support Arms)
        // Space between pillars is from x = -0.24 to +0.24 (width 0.48) where upper arm pivots
        const pillarWidth = 0.22;
        const pillarHeight = 0.72;
        const pillarDepth = 0.54;

        const pillarGeom = new THREE.BoxGeometry(pillarWidth, pillarHeight, pillarDepth);
        const pillarMat = this.mat.get('chassisPrimary');

        // Left Support Arm
        const leftPillar = new THREE.Mesh(pillarGeom, pillarMat);
        leftPillar.position.set(-0.35, 0.56, 0);
        leftPillar.castShadow = true;

        // Right Support Arm
        const rightPillar = new THREE.Mesh(pillarGeom, pillarMat);
        rightPillar.position.set(0.35, 0.56, 0);
        rightPillar.castShadow = true;

        // Recessed Graphite Side Panels
        const trimGeom = new THREE.BoxGeometry(0.04, pillarHeight * 0.7, pillarDepth * 0.65);
        const trimMat = this.mat.get('chassisSecondary');

        const leftTrim = new THREE.Mesh(trimGeom, trimMat);
        leftTrim.position.set(-0.46, 0.56, 0);

        const rightTrim = new THREE.Mesh(trimGeom, trimMat);
        rightTrim.position.set(0.46, 0.56, 0);

        group.add(leftPillar, rightPillar, leftTrim, rightTrim);

        // 4. Side Motor Actuator Canisters (Dark Titanium with Polished Steel Caps)
        const motorGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.10, 20);
        motorGeom.rotateZ(Math.PI / 2);
        const motorMat = this.mat.get('titaniumPivot');

        const leftMotor = new THREE.Mesh(motorGeom, motorMat);
        leftMotor.position.set(-0.50, 0.75, 0);
        leftMotor.castShadow = true;

        const rightMotor = new THREE.Mesh(motorGeom, motorMat);
        rightMotor.position.set(0.50, 0.75, 0);
        rightMotor.castShadow = true;

        // Concentric Polished Steel Bearing Hubs
        const hubGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.12, 16);
        hubGeom.rotateZ(Math.PI / 2);
        const hubMat = this.mat.get('brushedSteel');

        const leftHub = new THREE.Mesh(hubGeom, hubMat);
        leftHub.position.set(-0.52, 0.75, 0);

        const rightHub = new THREE.Mesh(hubGeom, hubMat);
        rightHub.position.set(0.52, 0.75, 0);

        // Amber Indicator Pips
        const pipGeom = new THREE.CylinderGeometry(0.035, 0.035, 0.13, 12);
        pipGeom.rotateZ(Math.PI / 2);
        const pipMat = this.mat.get('indicatorAmber');

        const leftPip = new THREE.Mesh(pipGeom, pipMat);
        leftPip.position.set(-0.53, 0.75, 0);

        const rightPip = new THREE.Mesh(pipGeom, pipMat);
        rightPip.position.set(0.53, 0.75, 0);

        group.add(leftMotor, rightMotor, leftHub, rightHub, leftPip, rightPip);

        return group;
    }

    /**
     * Build Upper Arm Linkage Geometry (Length 1.8 units between J2 shoulder and J3 elbow)
     * Fits cleanly inside the shoulder yoke pillar gap with distinct mechanical separation
     * @returns {THREE.Group}
     */
    buildUpperArm() {
        const group = new THREE.Group();
        group.name = 'UpperArmMesh';

        const length = 1.8;

        // 1. Lower Shoulder Pivot Core (Cast Gunmetal Shoulder Boss, width 0.42 fits between pillars x = ±0.24)
        const lowerCoreGeom = new THREE.CylinderGeometry(0.20, 0.20, 0.40, 20);
        lowerCoreGeom.rotateZ(Math.PI / 2);
        const lowerCore = new THREE.Mesh(lowerCoreGeom, this.mat.get('jointHousing'));
        lowerCore.position.y = 0;
        lowerCore.castShadow = true;
        group.add(lowerCore);

        // Dark Mechanical Shadow Seam & Polished Bearing Discs at Shoulder Pivot
        const shoulderDiscGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.42, 20);
        shoulderDiscGeom.rotateZ(Math.PI / 2);
        const shoulderDisc = new THREE.Mesh(shoulderDiscGeom, this.mat.get('mechanicalGap'));
        shoulderDisc.position.y = 0;
        group.add(shoulderDisc);

        // Shoulder Transition Neck Collar (Medium Graphite, provides visible gap to body)
        const neckGeom = new THREE.BoxGeometry(0.34, 0.12, 0.36);
        const neckMesh = new THREE.Mesh(neckGeom, this.mat.get('chassisSecondary'));
        neckMesh.position.y = 0.14;
        neckMesh.castShadow = true;
        group.add(neckMesh);

        // 2. Primary Structural Upper Arm Body (Warm Titanium - Muscular & Substantial)
        const armGeom = new THREE.BoxGeometry(0.38, length * 0.68, 0.42);
        const armMesh = new THREE.Mesh(armGeom, this.mat.get('chassisPrimary'));
        armMesh.position.y = length * 0.46;
        armMesh.castShadow = true;
        armMesh.receiveShadow = true;
        group.add(armMesh);

        // 3. Recessed Graphite Side Truss Panels
        const panelGeom = new THREE.BoxGeometry(0.40, length * 0.54, 0.28);
        const panelMesh = new THREE.Mesh(panelGeom, this.mat.get('chassisSecondary'));
        panelMesh.position.y = length * 0.46;
        panelMesh.castShadow = true;
        group.add(panelMesh);

        // 4. Heavy Hydraulic Piston Damper (Mounted along front spine)
        const cylBarrelGeom = new THREE.CylinderGeometry(0.060, 0.060, length * 0.44, 16);
        const cylBarrel = new THREE.Mesh(cylBarrelGeom, this.mat.get('titaniumPivot'));
        cylBarrel.position.set(0, length * 0.35, 0.24);
        cylBarrel.castShadow = true;

        const pistonRodGeom = new THREE.CylinderGeometry(0.035, 0.035, length * 0.36, 16);
        const pistonRod = new THREE.Mesh(pistonRodGeom, this.mat.get('brushedSteel'));
        pistonRod.position.set(0, length * 0.65, 0.24);
        pistonRod.castShadow = true;

        group.add(cylBarrel, pistonRod);

        // 5. Upper Elbow Transition Neck (Stops cleanly at y = 1.55 before fork opening)
        const upperNeckGeom = new THREE.BoxGeometry(0.30, 0.10, 0.32);
        const upperNeck = new THREE.Mesh(upperNeckGeom, this.mat.get('chassisSecondary'));
        upperNeck.position.y = 1.50;
        upperNeck.castShadow = true;
        group.add(upperNeck);

        // Dual Outer Clevis Fork Ears (Left x = -0.21, Right x = +0.21, leaving clear inner gap x = -0.18 to +0.18)
        const clevisEarGeom = new THREE.BoxGeometry(0.05, 0.32, 0.34);
        const clevisMat = this.mat.get('jointHousing');

        const leftEar = new THREE.Mesh(clevisEarGeom, clevisMat);
        leftEar.position.set(-0.21, 1.68, 0);
        leftEar.castShadow = true;

        const rightEar = new THREE.Mesh(clevisEarGeom, clevisMat);
        rightEar.position.set(0.21, 1.68, 0);
        rightEar.castShadow = true;

        // Concentric Bearing Rings on Fork Outer Faces
        const earRingGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.02, 16);
        earRingGeom.rotateZ(Math.PI / 2);
        const earRingMat = this.mat.get('brushedSteel');

        const leftRing = new THREE.Mesh(earRingGeom, earRingMat);
        leftRing.position.set(-0.24, length, 0);

        const rightRing = new THREE.Mesh(earRingGeom, earRingMat);
        rightRing.position.set(0.24, length, 0);

        group.add(leftEar, rightEar, leftRing, rightRing);

        // 6. Amber Technical Indicator Band
        const bandGeom = new THREE.BoxGeometry(0.40, 0.03, 0.44);
        const bandMesh = new THREE.Mesh(bandGeom, this.mat.get('amberAccent'));
        bandMesh.position.y = length * 0.74;
        group.add(bandMesh);

        return group;
    }

    /**
     * Build Elbow Joint Housing Assembly (Transverse Rotary Drum Module)
     * Fits centered at J3 Elbow Pivot (0, 0, 0) inside upper arm clevis fork ears
     * @returns {THREE.Group}
     */
    buildElbowHousing() {
        const group = new THREE.Group();
        group.name = 'ElbowHousing';

        // 1. Central Transverse Rotary Drum (Cast Gunmetal Cylinder along X-axis, width 0.35, radius 0.18)
        const cylGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.35, 24);
        cylGeom.rotateZ(Math.PI / 2);
        const cylMesh = new THREE.Mesh(cylGeom, this.mat.get('jointHousing'));
        cylMesh.castShadow = true;
        group.add(cylMesh);

        // 2. Mechanical Shadow Gap Bushings
        const gapGeom = new THREE.CylinderGeometry(0.185, 0.185, 0.015, 24);
        gapGeom.rotateZ(Math.PI / 2);
        const gapMeshLeft = new THREE.Mesh(gapGeom, this.mat.get('mechanicalGap'));
        gapMeshLeft.position.x = -0.12;

        const gapMeshRight = new THREE.Mesh(gapGeom, this.mat.get('mechanicalGap'));
        gapMeshRight.position.x = 0.12;

        group.add(gapMeshLeft, gapMeshRight);

        // 3. Dual Concentric Bearing Retaining Rings (Polished Brushed Steel, x = ±0.14)
        const ringGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.03, 20);
        ringGeom.rotateZ(Math.PI / 2);
        const ringMat = this.mat.get('brushedSteel');

        const leftBearing = new THREE.Mesh(ringGeom, ringMat);
        leftBearing.position.x = -0.14;

        const rightBearing = new THREE.Mesh(ringGeom, ringMat);
        rightBearing.position.x = 0.14;

        group.add(leftBearing, rightBearing);

        // 4. Side Pivot End-Caps (Dark Titanium, x = ±0.245)
        const capGeom = new THREE.CylinderGeometry(0.11, 0.11, 0.03, 16);
        capGeom.rotateZ(Math.PI / 2);
        const capMat = this.mat.get('titaniumPivot');

        const leftCap = new THREE.Mesh(capGeom, capMat);
        leftCap.position.x = -0.245;

        const rightCap = new THREE.Mesh(capGeom, capMat);
        rightCap.position.x = 0.245;

        group.add(leftCap, rightCap);

        // 5. Center Axle Lock Hex Bolt (Brushed Steel)
        const boltGeom = new THREE.CylinderGeometry(0.045, 0.045, 0.52, 6);
        boltGeom.rotateZ(Math.PI / 2);
        const boltMesh = new THREE.Mesh(boltGeom, this.mat.get('brushedSteel'));
        group.add(boltMesh);

        return group;
    }

    /**
     * Build Forearm Linkage Geometry (Tapered Casing extending from y = 0.22 to y = 1.6)
     * Attaches to J3 Elbow Pivot at (0,0,0) via central concentric saddle boss
     * @returns {THREE.Group}
     */
    buildForearm() {
        const group = new THREE.Group();
        group.name = 'ForearmMesh';

        const length = 1.6;

        // 1. Central Concentric Pivot Saddle Boss (Medium Graphite, width 0.20 along X-axis, radius 0.20)
        // Fits centered at x = 0 between the upper arm fork ears with 0.075 gap on each side
        const saddleGeom = new THREE.CylinderGeometry(0.20, 0.20, 0.20, 20);
        saddleGeom.rotateZ(Math.PI / 2);
        const saddleMesh = new THREE.Mesh(saddleGeom, this.mat.get('chassisSecondary'));
        saddleMesh.position.set(0, 0, 0);
        saddleMesh.castShadow = true;
        group.add(saddleMesh);

        // Forearm Transition Collar (extends from y = 0.12 to y = 0.26)
        const collarGeom = new THREE.BoxGeometry(0.22, 0.14, 0.26);
        const collarMesh = new THREE.Mesh(collarGeom, this.mat.get('chassisSecondary'));
        collarMesh.position.set(0, 0.19, 0);
        collarMesh.castShadow = true;
        group.add(collarMesh);

        // 2. Tapered Main Forearm Shell (Warm Titanium, y = 0.26 to y = 1.45)
        const armGeom = new THREE.CylinderGeometry(0.17, 0.23, length * 0.74, 16);
        const armMesh = new THREE.Mesh(armGeom, this.mat.get('chassisPrimary'));
        armMesh.position.y = length * 0.54;
        armMesh.castShadow = true;
        armMesh.receiveShadow = true;
        group.add(armMesh);

        // 3. Rear-Mounted Linear Actuator Guide Channel (Graphite + Polished Steel Rails on BACK side)
        const channelGeom = new THREE.BoxGeometry(0.13, length * 0.62, 0.08);
        const channelMesh = new THREE.Mesh(channelGeom, this.mat.get('chassisSecondary'));
        channelMesh.position.set(0, length * 0.54, -0.14);
        channelMesh.castShadow = true;
        group.add(channelMesh);

        // Twin Brushed Steel Linear Guide Rails (Solidly mounted on BACK side)
        const railGeom = new THREE.CylinderGeometry(0.014, 0.014, length * 0.58, 12);
        const railMat = this.mat.get('brushedSteel');

        const railLeft = new THREE.Mesh(railGeom, railMat);
        railLeft.position.set(-0.038, length * 0.54, -0.19);

        const railRight = new THREE.Mesh(railGeom, railMat);
        railRight.position.set(0.038, length * 0.54, -0.19);

        // Solid Mechanical Standoff Clamps (Upper and Lower mounting anchors to forearm shell)
        const clampGeom = new THREE.BoxGeometry(0.14, 0.04, 0.08);
        const clampMat = this.mat.get('jointHousing');

        const clampTop = new THREE.Mesh(clampGeom, clampMat);
        clampTop.position.set(0, length * 0.80, -0.15);
        clampTop.castShadow = true;

        const clampBottom = new THREE.Mesh(clampGeom, clampMat);
        clampBottom.position.set(0, length * 0.28, -0.15);
        clampBottom.castShadow = true;

        // Clamp Fastener Hex Bolts
        const clampBoltGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.09, 6);
        clampBoltGeom.rotateX(Math.PI / 2);
        const boltTop = new THREE.Mesh(clampBoltGeom, railMat);
        boltTop.position.set(0, length * 0.80, -0.19);

        const boltBottom = new THREE.Mesh(clampBoltGeom, railMat);
        boltBottom.position.set(0, length * 0.28, -0.19);

        group.add(railLeft, railRight, clampTop, clampBottom, boltTop, boltBottom);

        // 4. Cable Conduit Routing Loops (Matte Rubber)
        const ringGeom = new THREE.TorusGeometry(0.20, 0.020, 8, 16);
        ringGeom.rotateX(Math.PI / 2);
        const ringMat = this.mat.get('conduitRubber');

        const loop1 = new THREE.Mesh(ringGeom, ringMat);
        loop1.position.y = length * 0.40;

        const loop2 = new THREE.Mesh(ringGeom, ringMat);
        loop2.position.y = length * 0.70;

        group.add(loop1, loop2);

        // 5. Forearm-to-Wrist Rotary Collar (Cast Gunmetal + Amber Accent Ring)
        const wristCollarGeom = new THREE.CylinderGeometry(0.19, 0.19, 0.12, 16);
        const wristCollarMesh = new THREE.Mesh(wristCollarGeom, this.mat.get('jointHousing'));
        wristCollarMesh.position.y = length - 0.06;
        wristCollarMesh.castShadow = true;

        const amberBandGeom = new THREE.CylinderGeometry(0.195, 0.195, 0.02, 16);
        const amberBand = new THREE.Mesh(amberBandGeom, this.mat.get('amberAccent'));
        amberBand.position.y = length - 0.02;

        group.add(wristCollarMesh, amberBand);

        return group;
    }

    /**
     * Build J4 Wrist Roll Collar Assembly
     * Sits at J4 Wrist Roll node (y = 0 to y = 0.20)
     * @returns {THREE.Group}
     */
    buildWristRollCollar() {
        const group = new THREE.Group();
        group.name = 'WristRollCollar';

        // 1. J4 Roll Sleeve (Cast Gunmetal)
        const collarGeom = new THREE.CylinderGeometry(0.18, 0.19, 0.16, 16);
        const collarMesh = new THREE.Mesh(collarGeom, this.mat.get('jointHousing'));
        collarMesh.position.y = 0.08;
        collarMesh.castShadow = true;
        group.add(collarMesh);

        // 2. Mechanical Shadow Gap
        const gapGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.03, 16);
        const gapMesh = new THREE.Mesh(gapGeom, this.mat.get('mechanicalGap'));
        gapMesh.position.y = 0.18;
        group.add(gapMesh);

        return group;
    }

    /**
     * Build J5 Wrist Pitch Yoke Fork Assembly
     * Sits at J5 Wrist Pitch node (y = 0 to y = 0.20)
     * @returns {THREE.Group}
     */
    buildWristPitchYoke() {
        const group = new THREE.Group();
        group.name = 'WristPitchYoke';

        // 1. J5 Pitch Fork (Warm Titanium Body)
        const yokeGeom = new THREE.BoxGeometry(0.26, 0.18, 0.22);
        const yokeMesh = new THREE.Mesh(yokeGeom, this.mat.get('chassisPrimary'));
        yokeMesh.position.y = 0.09;
        yokeMesh.castShadow = true;
        group.add(yokeMesh);

        // 2. Side Pivot Discs (Dark Titanium + Brushed Steel Core)
        const pivotDiscGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.28, 16);
        pivotDiscGeom.rotateZ(Math.PI / 2);
        const pivotDisc = new THREE.Mesh(pivotDiscGeom, this.mat.get('titaniumPivot'));
        pivotDisc.position.y = 0.09;
        group.add(pivotDisc);

        return group;
    }

    /**
     * Build J6 Tool Flange Plate
     * Sits at J6 Tool Roll node (y = 0 to y = 0.08)
     * @returns {THREE.Group}
     */
    buildToolFlange() {
        const group = new THREE.Group();
        group.name = 'ToolFlange';

        const flangeGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.06, 16);
        const flangeMesh = new THREE.Mesh(flangeGeom, this.mat.get('brushedSteel'));
        flangeMesh.position.y = 0.03;
        flangeMesh.castShadow = true;
        group.add(flangeMesh);

        return group;
    }

    /**
     * Build Complete Wrist Group (Composite of Roll Collar + Pitch Yoke + Tool Flange)
     * @returns {THREE.Group}
     */
    buildWrist() {
        const group = new THREE.Group();
        group.name = 'WristAssembly';
        group.add(this.buildWristRollCollar());
        const pitchGroup = this.buildWristPitchYoke();
        pitchGroup.position.y = 0.20;
        group.add(pitchGroup);
        const toolGroup = this.buildToolFlange();
        toolGroup.position.y = 0.38;
        group.add(toolGroup);
        return group;
    }
}


