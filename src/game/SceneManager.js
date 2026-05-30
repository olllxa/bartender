import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { BarStool } from './objects/BarStool.js';
import { BarCustomer } from './objects/BarCustomer.js';
import { BarTable } from './objects/BarTable.js';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.cssRenderer = null;
    this.barCustomerGroups = [];
    this.tableCustomerGroups = [];
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a0f0a);
    this.scene.fog = new THREE.Fog(0x1a0f0a, 5, 10);

    this.setupCamera();
    this.setupRenderer();
    this.setupCSSRenderer();
    this.setupLighting();
    this.setupEnvironment();
    this.setupFurniture();
    this.setupDecor();
    this.setupWindows();
    this.setupCustomers();
    this.setupResize();

    this.container.appendChild(this.renderer.domElement);
    this.container.appendChild(this.cssRenderer.domElement);
  }

  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 20);
    this.camera.position.set(0, 1.6, -0.5);
    this.camera.lookAt(0, 0.5, 1.5);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
  }

  setupCSSRenderer() {
    this.cssRenderer = new CSS2DRenderer();
    this.cssRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.cssRenderer.domElement.style.position = 'absolute';
    this.cssRenderer.domElement.style.top = '0';
    this.cssRenderer.domElement.style.left = '0';
    this.cssRenderer.domElement.style.pointerEvents = 'none';
    this.cssRenderer.domElement.style.zIndex = '5';
  }

  setupLighting() {
    const ambient = new THREE.AmbientLight(0x443322, 0.35);
    this.scene.add(ambient);

    const warmLight = new THREE.DirectionalLight(0xffcc88, 1.4);
    warmLight.position.set(3, 5, 2);
    warmLight.castShadow = true;
    warmLight.shadow.mapSize.width = 1024;
    warmLight.shadow.mapSize.height = 1024;
    warmLight.shadow.camera.near = 0.1;
    warmLight.shadow.camera.far = 10;
    warmLight.shadow.camera.left = -5;
    warmLight.shadow.camera.right = 5;
    warmLight.shadow.camera.top = 5;
    warmLight.shadow.camera.bottom = -5;
    this.scene.add(warmLight);

    const fillLight = new THREE.DirectionalLight(0x8899ff, 0.2);
    fillLight.position.set(-2, 1, 3);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xff8844, 0.4);
    rimLight.position.set(-1, 2, -4);
    this.scene.add(rimLight);

    for (const z of [1.5, -1.0]) {
      const light = new THREE.PointLight(0xffd8a0, 0.5, 4);
      light.position.set(0, 3.0, z);
      this.scene.add(light);
    }

    for (const z of [3.0, 3.8]) {
      const light = new THREE.PointLight(0xffd8a0, 0.2, 3);
      light.position.set(2.0, 2.8, z);
      this.scene.add(light);
    }

    const shelfLight = new THREE.SpotLight(0xffeedd, 0.5);
    shelfLight.position.set(0, 3.2, -2.5);
    shelfLight.angle = 0.8;
    shelfLight.penumbra = 0.5;
    shelfLight.decay = 1;
    shelfLight.distance = 5;
    shelfLight.target.position.set(0, 1.5, -2.75);
    this.scene.add(shelfLight);
    this.scene.add(shelfLight.target);
  }

  setupEnvironment() {
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x3d2b1f,
      roughness: 0.85,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0.5);
    floor.receiveShadow = true;
    this.scene.add(floor);

    const plankMat = new THREE.MeshStandardMaterial({
      color: 0x4a3524,
      roughness: 0.85,
      metalness: 0.03,
      transparent: true,
      opacity: 0.06,
    });
    for (let i = -3.5; i <= 4.5; i += 0.4) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(12, 0.008), plankMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.001, i);
      this.scene.add(line);
    }

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.9,
      metalness: 0.0,
    });

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 4), wallMat);
    backWall.position.set(0, 2, -3.5);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    const wainscotMat = new THREE.MeshStandardMaterial({
      color: 0x5c4030,
      roughness: 0.85,
      metalness: 0.0,
    });
    const wainscot = new THREE.Mesh(new THREE.PlaneGeometry(12, 0.6), wainscotMat);
    wainscot.position.set(0, 0.3, -3.48);
    this.scene.add(wainscot);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 4), wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-6, 2, 0.5);
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 4), wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(6, 2, 0.5);
    this.scene.add(rightWall);

    for (const [x, z] of [[-6, 0.5], [6, 0.5]]) {
      const ws = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 0.6), wainscotMat);
      ws.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;
      ws.position.set(x, 0.3, z);
      this.scene.add(ws);
    }

    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x3d2b1f,
      roughness: 0.9, metalness: 0.0,
    });
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(12, 8.5), ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 4, 0.5);
    this.scene.add(ceiling);

    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 4), wallMat);
    frontWall.position.set(0, 2, 4.5);
    frontWall.receiveShadow = true;
    this.scene.add(frontWall);

    const fwWainscot = new THREE.Mesh(new THREE.PlaneGeometry(12, 0.6), wainscotMat);
    fwWainscot.position.set(0, 0.3, 4.48);
    this.scene.add(fwWainscot);

    const crownMat = new THREE.MeshStandardMaterial({
      color: 0x6b4a34,
      roughness: 0.8,
      metalness: 0.0,
    });
    const crownMolding = new THREE.Mesh(new THREE.BoxGeometry(12, 0.04, 0.08), crownMat);
    crownMolding.position.set(0, 3.98, -3.46);
    this.scene.add(crownMolding);

    const fwCrown = new THREE.Mesh(new THREE.BoxGeometry(12, 0.04, 0.08), crownMat);
    fwCrown.position.set(0, 3.98, 4.46);
    this.scene.add(fwCrown);
  }

  setupWindows() {
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xc8a060, roughness: 0.5, metalness: 0.2,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x88aacc, roughness: 0.1, metalness: 0.0,
      transparent: true, opacity: 0.15,
    });
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0xaaccff, roughness: 0.1, metalness: 0.0,
      transparent: true, opacity: 0.05,
    });
    const paneMat = new THREE.MeshStandardMaterial({
      color: 0x8a6040, roughness: 0.6, metalness: 0.0,
    });

    const positions = [
      { x: -4.5, z: -3.46, ry: 0 },
      { x: 4.5, z: -3.46, ry: 0 },
      { x: -5.96, z: 1.0, ry: Math.PI / 2 },
      { x: 5.96, z: 1.0, ry: -Math.PI / 2 },
      { x: -5.96, z: 3.0, ry: Math.PI / 2 },
      { x: 5.96, z: 3.0, ry: -Math.PI / 2 },
    ];

    for (const p of positions) {
      const outer = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.04), frameMat);
      outer.position.set(p.x, 2.2, p.z);
      if (p.ry) outer.rotation.y = p.ry;
      this.scene.add(outer);

      const inner = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.6), glowMat);
      inner.position.set(p.x, 2.2, p.z);
      if (p.ry) inner.rotation.y = p.ry;
      this.scene.add(inner);

      const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.55), glassMat);
      glass.position.set(p.x, 2.2, p.z);
      if (p.ry) glass.rotation.y = p.ry;
      this.scene.add(glass);

      if (Math.abs(p.x) < 6) {
        const hBar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.02, 0.03), paneMat);
        hBar.position.set(p.x, 2.2, p.z);
        this.scene.add(hBar);

        const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.65, 0.03), paneMat);
        vBar.position.set(p.x, 2.2, p.z);
        this.scene.add(vBar);
      }
    }
  }

  createBucket(pos, fillColor, fillType) {
    const bucketMat = new THREE.MeshStandardMaterial({
      color: 0x8a8a8a, roughness: 0.4, metalness: 0.6,
    });
    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.12, 12), bucketMat);
    bucket.position.set(pos.x, 0.78 + 0.06, pos.z);
    bucket.castShadow = true;
    this.scene.add(bucket);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.015, 6, 12), bucketMat);
    rim.position.set(pos.x, 0.78 + 0.125, pos.z);
    this.scene.add(rim);

    const fillMat = new THREE.MeshStandardMaterial({
      color: fillColor, roughness: 0.9, metalness: 0.0,
    });

    if (fillType === 'ice') {
      for (let i = 0; i < 5; i++) {
        const cube = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.03), fillMat);
        cube.position.set(
          pos.x + (Math.random() - 0.5) * 0.12,
          0.78 + 0.06 + Math.random() * 0.04,
          pos.z + (Math.random() - 0.5) * 0.12
        );
        this.scene.add(cube);
      }
    } else {
      const count = fillType === 'lemon' ? 3 : 4;
      for (let i = 0; i < count; i++) {
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), fillMat);
        sphere.position.set(
          pos.x + (Math.random() - 0.5) * 0.1,
          0.78 + 0.05 + Math.random() * 0.04,
          pos.z + (Math.random() - 0.5) * 0.1
        );
        this.scene.add(sphere);
      }
    }
  }

  setupFurniture() {
    const stoolPositions = [
      { x: -1.2, z: 2.4 },
      { x: -0.4, z: 2.4 },
      { x: 0.4, z: 2.4 },
      { x: 1.2, z: 2.4 },
    ];

    for (const pos of stoolPositions) {
      const stool = new BarStool();
      stool.group.position.set(pos.x, 0, pos.z);
      this.scene.add(stool.group);
    }

    const tablePositions = [
      { x: -2.5, z: 3.2 },
      { x: 2.5, z: 3.2 },
      { x: 0, z: 3.8 },
    ];

    for (const pos of tablePositions) {
      const table = new BarTable();
      table.group.position.set(pos.x, 0, pos.z);
      this.scene.add(table.group);
    }

    this.createBucket({ x: -2.15, z: 0.625 }, 0xccddff, 'ice');
    this.createBucket({ x: 2.15, z: 0.625 }, 0xffdd44, 'lemon');
    this.createBucket({ x: 1.85, z: 2.025 }, 0x44cc44, 'lime');
  }

  setupCustomers() {
    const barPositions = [
      { x: -1.2, z: 2.25 },
      { x: -0.4, z: 2.25 },
      { x: 0.4, z: 2.25 },
      { x: 1.2, z: 2.25 },
    ];

    barPositions.forEach((pos, i) => {
      const customer = new BarCustomer(i);
      customer.group.position.set(pos.x, 0.72, pos.z);
      customer.group.rotation.y = Math.PI;
      this.scene.add(customer.group);
      this.barCustomerGroups.push(customer.group);
    });

    const tablePositions = [
      { x: -2.5, z: 2.9, rot: 0.3 },
      { x: 2.5, z: 2.9, rot: -0.3 },
      { x: 0, z: 3.5, rot: 0 },
    ];

    tablePositions.forEach((pos, i) => {
      const customer = new BarCustomer(i + 4);
      customer.group.position.set(pos.x, 0.74, pos.z);
      customer.group.rotation.y = pos.rot;
      this.scene.add(customer.group);
      this.tableCustomerGroups.push(customer.group);
    });
  }

  setupDecor() {
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xc8a060, roughness: 0.5, metalness: 0.2,
    });

    const artColors = [0x8b5e3c, 0x5c3a1e, 0x6b4226, 0x7a4a34, 0x9a6a4a];
    const artPositions = [
      { x: -4.0, z: -3.46 },
      { x: 4.0, z: -3.46 },
      { x: -5.96, z: -1.0, ry: Math.PI / 2 },
      { x: 5.96, z: -1.0, ry: -Math.PI / 2 },
    ];

    artPositions.forEach((ap, i) => {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.55, 0.04), frameMat);
      frame.position.set(ap.x, 2.0, ap.z);
      if (ap.ry) frame.rotation.y = ap.ry;
      this.scene.add(frame);

      const art = new THREE.Mesh(
        new THREE.PlaneGeometry(0.68, 0.43),
        new THREE.MeshStandardMaterial({
          color: artColors[i % artColors.length],
          roughness: 0.8, metalness: 0.0,
        })
      );
      art.position.set(ap.x, 2.0, ap.z);
      if (ap.ry) art.rotation.y = ap.ry;
      this.scene.add(art);
    });

    const pendantMat = new THREE.MeshStandardMaterial({
      color: 0xcc8844, roughness: 0.6, metalness: 0.2,
      transparent: true, opacity: 0.6,
    });
    const shadeMat = new THREE.MeshStandardMaterial({
      color: 0x332211, roughness: 0.9, metalness: 0.0,
    });

    for (const [x, z] of [[0, 1.5], [0, -1.0], [2.0, 3.2]]) {
      const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.12, 10), shadeMat);
      shade.position.set(x, 2.9, z);
      this.scene.add(shade);

      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), pendantMat);
      glow.position.set(x, 2.83, z);
      this.scene.add(glow);
    }
  }

  getBarCustomerGroups() {
    return this.barCustomerGroups;
  }

  setupResize() {
    window.addEventListener('resize', () => {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.cssRenderer.setSize(w, h);
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    this.cssRenderer.render(this.scene, this.camera);
  }
}
