/**
 * WallRightSocial - Right Wall (X = +12.0): Social, Network & Communication Hub
 * Constructs communication server racks, optical patch bays, and spatial networking nodes:
 * 1. GitHub Version Control & Repository Gateway
 * 2. LinkedIn Engineering Network Transceiver Node
 * 3. Direct Engineering Terminal & Comms Gateway
 * Fully routed with physical cable conduits into overhead and floor channels.
 */

import * as THREE from 'three';

export class WallRightSocial {
    constructor(materials) {
        this.materials = materials;
        this.group = new THREE.Group();
        this.group.name = 'WallRightSocial';
        this.group.position.set(12.0, 0, 0);
        this.group.rotation.y = -Math.PI / 2; // Facing into the laboratory (-X)

        this.time = 0;
        this.blinkingLEDs = [];

        this._initWallArchitecture();
        this._initGitHubRack();
        this._initLinkedInNode();
        this._initDirectCommsTerminal();
    }

    /**
     * Create physical wall architecture, server rack bays, and conduit channels
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
        this.wallMesh = wallMesh;
        this.group.add(wallMesh);

        // Heavy Rack Framework Columns (z = -6, -2, 2, 6)
        const colGeom = new THREE.BoxGeometry(0.40, 10, 0.40);
        [-6.5, -2.2, 2.2, 6.5].forEach(zPos => {
            const col = new THREE.Mesh(colGeom, steelMat);
            col.position.set(zPos, 2.5, 0.22);
            col.castShadow = true;
            this.group.add(col);
        });

        // Horizontal Cable Routing Trays (y = -0.5, 1.8, 4.2, 6.2)
        // Positioned BEHIND content panels (z = 0.15)
        const strutGeom = new THREE.BoxGeometry(24, 0.05, 0.05);
        [-0.5, 1.8, 4.2, 6.2].forEach(yPos => {
            const strut = new THREE.Mesh(strutGeom, railMat);
            strut.position.set(0, yPos, 0.15);
            this.group.add(strut);
        });

        // Section Title Header
        const headerGroup = new THREE.Group();
        headerGroup.position.set(0, 5.2, 0.58);

        const backGeom = new THREE.BoxGeometry(7.4, 1.35, 0.06);
        const backMesh = new THREE.Mesh(backGeom, this.materials.get('holoPanelCyan'));
        headerGroup.add(backMesh);

        const borderGeom = new THREE.EdgesGeometry(backGeom);
        const borderMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
        const border = new THREE.LineSegments(borderGeom, borderMat);
        border.position.z = 0.035;
        headerGroup.add(border);

        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(6, 10, 18, 0.20)';
        ctx.fillRect(0, 0, 2048, 360);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.40)';
        ctx.lineWidth = 4;
        ctx.strokeRect(6, 6, 2036, 348);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 50px "JetBrains Mono", monospace';
        ctx.fillText('// TELEMETRY & PROFESSIONAL NETWORK INTERFACES', 54, 90);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 110px "Inter", sans-serif';
        ctx.fillText('COMMUNICATION GATEWAYS', 54, 215);

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 40px "JetBrains Mono", monospace';
        ctx.fillText('● 3 GATEWAYS ONLINE // 100% LINK QUALITY', 54, 305);

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;

        const headerMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(7.2, 1.25),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
        );
        headerMesh.position.z = 0.04;
        headerGroup.add(headerMesh);
        this.group.add(headerGroup);
    }

    /**
     * Node 1: GitHub Repository & Version Control Gateway Server Rack (z = -3.5)
     * @private
     */
    _initGitHubRack() {
        const rackGroup = new THREE.Group();
        rackGroup.position.set(-3.5, 1.6, 0.45);

        // 42U Server Cabinet Enclosure
        const rackGeom = new THREE.BoxGeometry(2.4, 3.2, 0.9);
        const rack = new THREE.Mesh(rackGeom, this.materials.get('serverRack'));
        rack.position.set(0, 0, 0.4);
        rack.castShadow = true;
        rackGroup.add(rack);

        // Stack of 8 Modular Server Blades (1U-2U chassis)
        const bladeGeom = new THREE.BoxGeometry(2.1, 0.26, 0.85);
        const bladeMat = this.materials.get('serverUnit');

        for (let i = 0; i < 8; i++) {
            const y = -1.1 + i * 0.32;
            const blade = new THREE.Mesh(bladeGeom, bladeMat);
            blade.position.set(0, y, 0.42);
            rackGroup.add(blade);

            // Blinking Activity LEDs on each server blade
            for (let ledIdx = 0; ledIdx < 4; ledIdx++) {
                const led = new THREE.Mesh(
                    new THREE.SphereGeometry(0.012, 6, 6),
                    (ledIdx % 2 === 0) ? this.materials.get('ledGreen') : this.materials.get('ledAmber')
                );
                led.position.set(0.6 + ledIdx * 0.08, y, 0.86);
                rackGroup.add(led);

                this.blinkingLEDs.push({
                    mesh: led,
                    rate: 3.0 + (i * 4 + ledIdx) * 0.8,
                    phase: (i + ledIdx) * 0.5
                });
            }
        }

        // Telemetry Status Display Screen (Top of Rack) - 1024x512
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(6, 10, 18, 0.20)';
        ctx.fillRect(0, 0, 1024, 512);
        ctx.strokeStyle = '#ff9d00';
        ctx.lineWidth = 4;
        ctx.strokeRect(6, 6, 1012, 500);

        ctx.fillStyle = '#ff9d00';
        ctx.font = 'bold 48px "JetBrains Mono", monospace';
        ctx.fillText('NODE: GITHUB / REPOSITORY GATEWAY', 48, 85);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 68px "JetBrains Mono", monospace';
        ctx.fillText('github.com/gunal', 48, 185);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 44px "JetBrains Mono", monospace';
        ctx.fillText('• 32 REPOSITORIES [OPEN-SOURCE]', 48, 280);
        ctx.fillText('• EMBEDDED C/C++ · PYTHON · ROS 2', 48, 355);

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 38px "JetBrains Mono", monospace';
        ctx.fillText('● CI/CD PIPELINE: PASSED (100% HEALTH)', 48, 450);

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        const screenMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2.1, 1.05),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
        );
        screenMesh.position.set(0, 2.0, 0.88);
        rackGroup.add(screenMesh);

        this.group.add(rackGroup);
    }

    /**
     * Node 2: LinkedIn Professional Network Transceiver Station (z = 0)
     * @private
     */
    _initLinkedInNode() {
        const nodeGroup = new THREE.Group();
        nodeGroup.position.set(0, 1.6, 0.45);

        // Rack Unit
        const rackGeom = new THREE.BoxGeometry(2.2, 2.6, 0.75);
        const rack = new THREE.Mesh(rackGeom, this.materials.get('serverRack'));
        rack.position.set(0, 0, 0.35);
        nodeGroup.add(rack);

        // Display Screen - 1024x512
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(6, 10, 18, 0.20)';
        ctx.fillRect(0, 0, 1024, 512);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.strokeRect(6, 6, 1012, 500);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 48px "JetBrains Mono", monospace';
        ctx.fillText('NODE: LINKEDIN / PROFESSIONAL NETWORK', 48, 85);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 68px "JetBrains Mono", monospace';
        ctx.fillText('linkedin.com/in/gunal', 48, 185);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 44px "JetBrains Mono", monospace';
        ctx.fillText('• HARDWARE & EMBEDDED R&D', 48, 280);
        ctx.fillText('• ROBOTICS & APPLIED ML SYSTEMS', 48, 355);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 38px "JetBrains Mono", monospace';
        ctx.fillText('● NETWORK STATUS: CONNECTED & OPEN', 48, 450);

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        const screenMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2.0, 1.0),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
        );
        screenMesh.position.set(0, 0.3, 0.75);
        nodeGroup.add(screenMesh);

        this.group.add(nodeGroup);
    }

    /**
     * Node 3: Direct Engineering Comms Terminal (z = +3.5)
     * @private
     */
    _initDirectCommsTerminal() {
        const termGroup = new THREE.Group();
        termGroup.position.set(3.5, 1.6, 0.45);

        // Terminal Console Body
        const bodyGeom = new THREE.BoxGeometry(2.4, 3.2, 0.9);
        const body = new THREE.Mesh(bodyGeom, this.materials.get('serverRack'));
        body.position.set(0, 0, 0.4);
        body.castShadow = true;
        termGroup.add(body);

        // Display Screen - 1024x512
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(6, 10, 18, 0.20)';
        ctx.fillRect(0, 0, 1024, 512);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.strokeRect(6, 6, 1012, 500);

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 48px "JetBrains Mono", monospace';
        ctx.fillText('GATEWAY: DIRECT ENGINEERING LINK', 48, 85);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 60px "JetBrains Mono", monospace';
        ctx.fillText('contact@guna.engineering', 48, 185);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 44px "JetBrains Mono", monospace';
        ctx.fillText('• SECURE PROTOCOL // 256-BIT PGP', 48, 280);
        ctx.fillText('• COLLABORATION & INQUIRIES', 48, 355);

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 38px "JetBrains Mono", monospace';
        ctx.fillText('● TRANSMITTER: ACTIVE [LISTENING]', 48, 450);

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        const screenMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2.1, 1.05),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
        );
        screenMesh.position.set(0, 0.6, 0.88);
        termGroup.add(screenMesh);

        this.group.add(termGroup);
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
     * Per-frame animation update for server rack status LEDs
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        this.time += deltaTime;

        for (const item of this.blinkingLEDs) {
            const val = (Math.sin(this.time * Math.PI * item.rate + item.phase) > 0.1);
            item.mesh.visible = val;
        }
    }
}
