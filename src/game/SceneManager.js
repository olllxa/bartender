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
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a0f0a);
    this.scene.fog = new THREE.Fog(0x1a0f0a, 6, 14);

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
    warmLight.shadow.camera.far = 12;
    warmLight.shadow.camera.left = -6;
    warmLight.shadow.camera.right = 6;
    warmLight.shadow.camera.top = 6;
    warmLight.shadow.camera.bottom = -6;
    this.scene.add(warmLight);

    const fillLight = new THREE.DirectionalLight(0x8899ff, 0.2);
    fillLight.position.set(-2, 1, 3);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xff8844, 0.4);
    rimLight.position.set(-1, 2, -5);
    this.scene.add(rimLight);

    for (const z of [1.5, -1.0]) {
      const light = new THREE.PointLight(0xffd8a0, 0.5, 5);
      light.position.set(0, 3.0, z);
      this.scene.add(light);
    }

    for (const z of [3.5, 4.5]) {
      const tableLight = new THREE.PointLight(0xffd8a0, 0.2, 4);
      tableLight.position.set(2.5, 2.8, z);
      this.scene.add(tableLight);
    }

    const shelfLight = new THREE.SpotLight(0xffeedd, 0.5);
    shelfLight.position.set(0, 3.2, -2.5);
    shelfLight.angle = 0.8;
    shelfLight.penumbra = 0.5;
    shelfLight.decay = 1;
    shelfLight.distance = 6;
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
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 14), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 1);
    floor.receiveShadow = true;
    this.scene.add(floor);

    const plankMat = new THREE.MeshStandardMaterial({
      color: 0x4a3524,
      roughness: 0.85,
      metalness: 0.03,
      transparent: true,
      opacity: 0.06,
    });
    for (let i = -6; i <= 6; i += 0.4) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(18, 0.008), plankMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.001, i);
      this.scene.add(line);
    }

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.9,
      metalness: 0.0,
    });

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(18, 4), wallMat);
    backWall.position.set(0, 2, -4);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    const wainscotMat = new THREE.MeshStandardMaterial({
      color: 0x5c4030,
      roughness: 0.85,
      metalness: 0.0,
    });
    const wainscot = new THREE.Mesh(new THREE.PlaneGeometry(18, 0.6), wainscotMat);
    wainscot.position.set(0, 0.3, -3.98);
    this.scene.add(wainscot);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 4), wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-9, 2, 0);
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 4), wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(9, 2, 0);
    this.scene.add(rightWall);

    for (const [x, z] of [[-9, 0], [9, 0]]) {
      const ws = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.6), wainscotMat);
      ws.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;
      ws.position.set(x, 0.3, 0);
      this.scene.add(ws);
    }

    const crownMat = new THREE.MeshStandardMaterial({
      color: 0x6b4a34,
      roughness: 0.8,
      metalness: 0.0,
    });
    const crownMolding = new THREE.Mesh(new THREE.BoxGeometry(18, 0.04, 0.08), crownMat);
    crownMolding.position.set(0, 3.98, -3.96);
    this.scene.add(crownMolding);
  }

  setupWindows() {
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xc8a060,
      roughness: 0.5,
      metalness: 0.2,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x88aacc,
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0.15,
    });
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0xaaccff,
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0.05,
    });

    const windowPositions = [
      { x: -7.5, z: -3.96, ry: 0 },
      { x: -4.0, z: -3.96, ry: 0 },
      { x: 7.5, z: -3.96, ry: 0 },
      { x: 4.0, z: -3.96, ry: 0 },
      { x: -8.96, z: 3.0, ry: Math.PI / 2 },
      { x: 8.96, z: 3.0, ry: -Math.PI / 2 },
    ];

    for (const wp of windowPositions) {
      const outer = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.04), frameMat);
      outer.position.set(wp.x, 2.2, wp.z);
      if (wp.ry) outer.rotation.y = wp.ry;
      this.scene.add(outer);

      const inner = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.7), glowMat);
      inner.position.set(wp.x, 2.2, wp.z);
      if (wp.ry) inner.rotation.y = wp.ry;
      this.scene.add(inner);

      const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.65), glassMat);
      glass.position.set(wp.x, 2.2, wp.z);
      if (wp.ry) glass.rotation.y = wp.ry;
      this.scene.add(glass);
    }

    const paneMat = new THREE.MeshStandardMaterial({
      color: 0x8a6040,
      roughness: 0.6,
      metalness: 0.0,
    });
    const crossPositions = [
      { x: -7.5, z: -3.96 }, { x: -4.0, z: -3.96 },
      { x: 7.5, z: -3.96 }, { x: 4.0, z: -3.96 },
    ];
    for (const cp of crossPositions) {
      const hBar = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.02, 0.03), paneMat);
      hBar.position.set(cp.x, 2.2, cp.z);
      this.scene.add(hBar);

      const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.75, 0.03), paneMat);
      vBar.position.set(cp.x, 2.2, cp.z);
      this.scene.add(vBar);
    }
  }

  setupFurniture() {
    const stoolPositions = [
      { x: -1.2, z: 2.7 },
      { x: -0.4, z: 2.7 },
      { x: 0.4, z: 2.7 },
      { x: 1.2, z: 2.7 },
    ];

    for (const pos of stoolPositions) {
      const stool = new BarStool();
      stool.group.position.set(pos.x, 0, pos.z);
      this.scene.add(stool.group);
    }

    const tablePositions = [
      { x: -3.0, z: 3.8 },
      { x: 3.0, z: 3.8 },
      { x: 0, z: 4.5 },
    ];

    for (const pos of tablePositions) {
      const table = new BarTable();
      table.group.position.set(pos.x, 0, pos.z);
      this.scene.add(table.group);
    }
  }

  setupCustomers() {
    const customerPositions = [
      { x: -1.2, z: 2.55 },
      { x: -0.4, z: 2.55 },
      { x: 0.4, z: 2.55 },
      { x: 1.2, z: 2.55 },
    ];

    customerPositions.forEach((pos, i) => {
      const customer = new BarCustomer(i);
      customer.group.position.set(pos.x, 0.72, pos.z);
      customer.group.rotation.y = Math.PI;
      this.scene.add(customer.group);
    });

    const seatedPositions = [
      { x: -3.0, z: 3.5 },
      { x: 3.0, z: 3.5 },
      { x: 0, z: 4.2 },
    ];

    seatedPositions.forEach((pos, i) => {
      const customer = new BarCustomer(i + 4);
      customer.group.position.set(pos.x, 0.74, pos.z);
      customer.group.rotation.y = (i + 1) * 0.3;
      this.scene.add(customer.group);
    });
  }

  setupDecor() {
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xc8a060,
      roughness: 0.5,
      metalness: 0.2,
    });

    const artColors = [0x8b5e3c, 0x5c3a1e, 0x6b4226, 0x7a4a34, 0x9a6a4a, 0x4a2a18];
    const artPositions = [
      { x: -6.0, z: -3.96 },
      { x: -3.8, z: -3.96 },
      { x: 3.8, z: -3.96 },
      { x: 6.0, z: -3.96 },
      { x: -8.96, z: -1.0, ry: Math.PI / 2 },
      { x: 8.96, z: -1.0, ry: -Math.PI / 2 },
    ];

    artPositions.forEach((ap, i) => {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.04), frameMat);
      frame.position.set(ap.x, 2.0, ap.z);
      if (ap.ry) frame.rotation.y = ap.ry;
      this.scene.add(frame);

      const art = new THREE.Mesh(
        new THREE.PlaneGeometry(0.85, 0.55),
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
      color: 0xcc8844,
      roughness: 0.6,
      metalness: 0.2,
      transparent: true,
      opacity: 0.6,
    });
    const shadeMat = new THREE.MeshStandardMaterial({
      color: 0x332211,
      roughness: 0.9,
      metalness: 0.0,
    });

    for (const z of [1.5, -1.0, 3.8]) {
      const xPos = z === 3.8 ? 2.5 : 0;
      const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.15, 10), shadeMat);
      shade.position.set(xPos, 2.9, z);
      this.scene.add(shade);

      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), pendantMat);
      glow.position.set(xPos, 2.82, z);
      this.scene.add(glow);
    }
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
