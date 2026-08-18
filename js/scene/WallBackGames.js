/**
 * WallBackGames - Back Wall (Z = +12.0): Games, Simulations & Experimental Systems
 * Constructs experimental laboratory engineering and simulation stations:
 * 1. Autonomous 3D Chess AI Matrix & Evaluation Display
 * 2. Physics & Kinematics Trajectory Simulator Station
 * 3. Retro-Futuristic Logic & Arcade Hardware Terminal
 * 4. Calibration Rigs & Mobile Instrument Carts
 */

import * as THREE from 'three';

export class WallBackGames {
    constructor(materials) {
        this.materials = materials;
        this.group = new THREE.Group();
        this.group.name = 'WallBackGames';
        this.group.position.set(0, 0, 12.0);
        this.group.rotation.y = Math.PI; // Facing into the laboratory (-Z)

        this.time = 0;
        this.chessCanvas = null;
        this.chessContext = null;
        this.chessTexture = null;

        this.simCanvas = null;
        this.simContext = null;
        this.simTexture = null;

        this._initWallArchitecture();
        this._initChessAIStation();
        this._initPhysicsSimStation();
        this._initArcadeTestTerminal();
        this._initLabClutter();
    }

    /**
     * Create physical wall architecture and structural equipment rails
     * @private
     */
    _initWallArchitecture() {
        const wallMat = this.materials.get('graphiteWall');
        const steelMat = this.materials.get('structuralSteel');
        const railMat = this.materials.get('brushedSteel');

        // Main Wall Plane (26m wide x 10m high)
        const wallGeom = new THREE.PlaneGeometry(26, 10);
        const wallMesh = new THREE.Mesh(wallGeom, wallMat);
        wallMesh.position.set(0, 2.5, 0);
        wallMesh.receiveShadow = true;
        this.group.add(wallMesh);

        // Heavy Rack Framework Columns (x = -8.5, -3.8, 3.8, 8.5)
        const colGeom = new THREE.BoxGeometry(0.50, 10, 0.50);
        [-8.5, -3.8, 3.8, 8.5].forEach(xPos => {
            const col = new THREE.Mesh(colGeom, steelMat);
            col.position.set(xPos, 2.5, 0.25);
            col.castShadow = true;
            this.group.add(col);
        });

        // Horizontal Mounting Rails
        const railGeom = new THREE.BoxGeometry(24, 0.08, 0.08);
        [0.6, 2.8, 5.2].forEach(yPos => {
            const rail = new THREE.Mesh(railGeom, railMat);
            rail.position.set(0, yPos, 0.28);
            this.group.add(rail);
        });

        // Section Title Header
        const headerGroup = new THREE.Group();
        headerGroup.position.set(0, 5.2, 0.35);

        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 160;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#0a0e16';
        ctx.fillRect(0, 0, 1024, 160);
        ctx.fillStyle = '#a78bfa';
        ctx.font = 'bold 22px "JetBrains Mono", monospace';
        ctx.fillText('// SIMULATION ENGINE & EXPERIMENTAL SYSTEMS', 36, 45);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 52px "Inter", sans-serif';
        ctx.fillText('GAMES & INTERACTIVE SANDBOX', 36, 110);

        const tex = new THREE.CanvasTexture(canvas);
        const headerMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(6.4, 1.0),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true })
        );
        headerGroup.add(headerMesh);
        this.group.add(headerGroup);
    }

    /**
     * Station 1: Autonomous 3D Chess AI Matrix & Evaluation Display (x = -4.5)
     * @private
     */
    _initChessAIStation() {
        const station = new THREE.Group();
        station.position.set(-4.5, 1.4, 0.45);

        // Mounting Desk
        const deskGeom = new THREE.BoxGeometry(3.6, 0.08, 1.2);
        const desk = new THREE.Mesh(deskGeom, this.materials.get('workbenchTop'));
        desk.position.set(0, -0.2, 0.4);
        station.add(desk);

        // 3D Physical Chess Board Matrix (8x8 grid)
        const boardGeom = new THREE.BoxGeometry(1.0, 0.04, 1.0);
        const board = new THREE.Mesh(boardGeom, this.materials.get('instrumentChassis'));
        board.position.set(0, -0.14, 0.4);
        station.add(board);

        // Stylized Miniature Chess Pieces (Cylinders & cones)
        const pieceMatWhite = this.materials.get('brushedSteel');
        const pieceMatBlack = this.materials.get('graphiteWall');

        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 8; col++) {
                const px = -0.4 + col * 0.11;
                const pz = -0.4 + row * 0.11;
                const piece = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.02, 0.03, 0.08, 8),
                    pieceMatWhite
                );
                piece.position.set(px, -0.08, 0.4 + pz);
                station.add(piece);
            }
        }

        // Live Chess AI Evaluation Display Canvas (1024x512)
        this.chessCanvas = document.createElement('canvas');
        this.chessCanvas.width = 1024;
        this.chessCanvas.height = 512;
        this.chessContext = this.chessCanvas.getContext('2d');

        this.chessTexture = new THREE.CanvasTexture(this.chessCanvas);
        this.chessTexture.minFilter = THREE.LinearFilter;

        const screenMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2.4, 1.2),
            new THREE.MeshBasicMaterial({ map: this.chessTexture })
        );
        screenMesh.position.set(0, 1.0, 0.2);
        station.add(screenMesh);

        this.group.add(station);
    }

    /**
     * Station 2: Physics & Kinematics Trajectory Simulator (x = 0)
     * @private
     */
    _initPhysicsSimStation() {
        const station = new THREE.Group();
        station.position.set(0, 1.4, 0.45);

        // Desk
        const deskGeom = new THREE.BoxGeometry(3.6, 0.08, 1.2);
        const desk = new THREE.Mesh(deskGeom, this.materials.get('workbenchTop'));
        desk.position.set(0, -0.2, 0.4);
        station.add(desk);

        // Physical Miniature Trajectory Arc Wire
        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(-0.6, -0.15, 0.4),
            new THREE.Vector3(0, 0.45, 0.4),
            new THREE.Vector3(0.6, -0.15, 0.4)
        );
        const tubeGeom = new THREE.TubeGeometry(curve, 20, 0.015, 8, false);
        const tube = new THREE.Mesh(tubeGeom, this.materials.get('holoLineAmber'));
        station.add(tube);

        // Live Simulation Canvas Display (1024x512)
        this.simCanvas = document.createElement('canvas');
        this.simCanvas.width = 1024;
        this.simCanvas.height = 512;
        this.simContext = this.simCanvas.getContext('2d');

        this.simTexture = new THREE.CanvasTexture(this.simCanvas);
        this.simTexture.minFilter = THREE.LinearFilter;

        const screenMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2.4, 1.2),
            new THREE.MeshBasicMaterial({ map: this.simTexture })
        );
        screenMesh.position.set(0, 1.0, 0.2);
        station.add(screenMesh);

        this.group.add(station);
    }

    /**
     * Station 3: Retro-Futuristic Logic & Arcade Test Terminal (x = +4.5)
     * @private
     */
    _initArcadeTestTerminal() {
        const termGroup = new THREE.Group();
        termGroup.position.set(4.5, 1.4, 0.45);

        // Console Cabinet
        const cabinetGeom = new THREE.BoxGeometry(2.6, 3.2, 0.9);
        const cabinet = new THREE.Mesh(cabinetGeom, this.materials.get('instrumentChassis'));
        cabinet.position.set(0, 0, 0.4);
        cabinet.castShadow = true;
        termGroup.add(cabinet);

        // Slanted Control Panel Deck
        const deckGeom = new THREE.BoxGeometry(2.4, 0.08, 0.5);
        const deck = new THREE.Mesh(deckGeom, this.materials.get('instrumentDial'));
        deck.position.set(0, -0.2, 0.88);
        deck.rotation.x = 0.25;
        termGroup.add(deck);

        // Arcade Buttons (Amber, Cyan, Green)
        const btnGeom = new THREE.CylinderGeometry(0.03, 0.035, 0.03, 12);
        [-0.4, -0.2, 0, 0.2, 0.4].forEach((bx, idx) => {
            const mat = (idx % 2 === 0) ? this.materials.get('ledAmber') : this.materials.get('ledBlue');
            const btn = new THREE.Mesh(btnGeom, mat);
            btn.position.set(bx, -0.15, 0.9);
            btn.rotation.x = 0.25;
            termGroup.add(btn);
        });

        // CRT Screen Canvas Display - 1024x512
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#060d09';
        ctx.fillRect(0, 0, 1024, 512);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.strokeRect(8, 8, 1008, 496);

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 36px "JetBrains Mono", monospace';
        ctx.fillText('HARDWARE LOGIC & TEST ARCADE', 48, 85);

        ctx.fillStyle = '#ff9d00';
        ctx.font = 'bold 52px "JetBrains Mono", monospace';
        ctx.fillText('SCORE: 094200 // HIGH: 128000', 48, 185);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '36px "JetBrains Mono", monospace';
        ctx.fillText('• 6-DOF INVERSE KINEMATICS TRIAL', 48, 275);
        ctx.fillText('• 100% HARDWARE LEVEL CONVERGENCE', 48, 340);

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 32px "JetBrains Mono", monospace';
        ctx.fillText('● INSERT HARDWARE INTERRUPT TO PLAY', 48, 440);

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        const screenMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2.1, 1.1),
            new THREE.MeshBasicMaterial({ map: tex })
        );
        screenMesh.position.set(0, 0.6, 0.86);
        termGroup.add(screenMesh);

        this.group.add(termGroup);
    }

    /**
     * Create mobile instrument carts and laboratory cable reels
     * @private
     */
    _initLabClutter() {
        // Mobile Instrument Cart (x = -7.2, y = -1.2)
        const cartGroup = new THREE.Group();
        cartGroup.position.set(-7.2, -1.2, 0.6);

        const cartTop = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 0.05, 1.0),
            this.materials.get('workbenchTop')
        );
        cartTop.position.y = 0.8;
        cartGroup.add(cartTop);

        const cartLegGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
        const cartLegMat = this.materials.get('brushedSteel');
        [[-0.7, -0.4], [0.7, -0.4], [-0.7, 0.4], [0.7, 0.4]].forEach(([cx, cz]) => {
            const leg = new THREE.Mesh(cartLegGeom, cartLegMat);
            leg.position.set(cx, 0.4, cz);
            cartGroup.add(leg);
        });

        this.group.add(cartGroup);
    }

    /**
     * Add subsystem to target scene
     * @param {THREE.Scene} scene 
     */
    addToScene(scene) {
        if (scene) {
            scene.add(this.group);
        }
    }

    /**
     * Per-frame animation update for dynamic simulation curves and chess evaluation
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        this.time += deltaTime;

        // 1. Update Chess AI Screen
        if (this.chessContext && this.chessTexture) {
            const ctx = this.chessContext;
            const w = this.chessCanvas.width;
            const h = this.chessCanvas.height;

            ctx.fillStyle = '#060a12';
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#a78bfa';
            ctx.font = 'bold 36px "JetBrains Mono", monospace';
            ctx.fillText('CHESS AI // ALPHA-BETA PRUNING', 36, 70);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 50px "JetBrains Mono", monospace';
            const evalScore = (+1.45 + Math.sin(this.time * 2) * 0.15).toFixed(2);
            ctx.fillText(`EVAL: +${evalScore} [WHITE ADVANTAGE]`, 36, 170);

            ctx.fillStyle = '#38bdf8';
            ctx.font = '34px "JetBrains Mono", monospace';
            ctx.fillText('DEPTH: 18 PLY · NODES: 2,450 kN/s', 36, 260);
            ctx.fillText('BEST LINE: 1. e4 e5 2. Nf3 Nc6 3. Bb5', 36, 325);

            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 30px "JetBrains Mono", monospace';
            ctx.fillText('● ENGINE: ONLINE · 60Hz SEARCH CONVERGED', 36, 440);

            this.chessTexture.needsUpdate = true;
        }

        // 2. Update Kinematics Physics Screen
        if (this.simContext && this.simTexture) {
            const ctx = this.simContext;
            const w = this.simCanvas.width;
            const h = this.simCanvas.height;

            ctx.fillStyle = '#080c14';
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#ff9d00';
            ctx.font = 'bold 36px "JetBrains Mono", monospace';
            ctx.fillText('KINEMATICS // TRAJECTORY VELOCITY & TORQUE', 36, 70);

            // Dynamic sine curve
            ctx.strokeStyle = '#ff9d00';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            for (let x = 0; x < w; x++) {
                const y = 260 + Math.sin(x * 0.02 + this.time * 4) * 80;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 30px "JetBrains Mono", monospace';
            ctx.fillText('● GRAVITY COMPENSATION: ACTIVE (±0.01 Nm)', 36, 440);

            this.simTexture.needsUpdate = true;
        }
    }
}
