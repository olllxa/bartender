import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
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
    const W = 4;
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x3d2b1f,
      roughness: 0.85,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, 8), floorMat);
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
      const line = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, 0.008), plankMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.001, i);
      this.scene.add(line);
    }

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.9,
      metalness: 0.0,
    });

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, 4), wallMat);
    backWall.position.set(0, 2, -3.5);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    const wainscotMat = new THREE.MeshStandardMaterial({
      color: 0x5c4030,
      roughness: 0.85,
      metalness: 0.0,
    });
    const wainscot = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, 0.6), wainscotMat);
    wainscot.position.set(0, 0.3, -3.48);
    this.scene.add(wainscot);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 4), wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-W, 2, 0.5);
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 4), wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(W, 2, 0.5);
    this.scene.add(rightWall);

    for (const [x, z] of [[-W, 0.5], [W, 0.5]]) {
      const ws = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 0.6), wainscotMat);
      ws.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;
      ws.position.set(x, 0.3, z);
      this.scene.add(ws);
    }

    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x3d2b1f,
      roughness: 0.9, metalness: 0.0,
    });
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, 8.5), ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 4, 0.5);
    this.scene.add(ceiling);

    const crownMat = new THREE.MeshStandardMaterial({
      color: 0x6b4a34, roughness: 0.8, metalness: 0.0,
    });

    const crownMolding = new THREE.Mesh(new THREE.BoxGeometry(W * 2, 0.04, 0.08), crownMat);
    crownMolding.position.set(0, 3.98, -3.46);
    this.scene.add(crownMolding);

    const doorHalf = 0.6;
    for (const side of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(W - doorHalf, 4), wallMat);
      w.position.set(side * ((W - doorHalf) / 2 + doorHalf / 2), 2, 4.5);
      w.receiveShadow = true;
      this.scene.add(w);

      const ws = new THREE.Mesh(new THREE.PlaneGeometry(W - doorHalf, 0.6), wainscotMat);
      ws.position.set(side * ((W - doorHalf) / 2 + doorHalf / 2), 0.3, 4.48);
      this.scene.add(ws);

      const fwCrownSection = new THREE.Mesh(new THREE.BoxGeometry(W - doorHalf, 0.04, 0.08), crownMat);
      fwCrownSection.position.set(side * ((W - doorHalf) / 2 + doorHalf / 2), 3.98, 4.46);
      this.scene.add(fwCrownSection);
    }


  }

  setupWindows() {
    const W = 4;
    const positions = [
      { x: -W + 0.04, z: 1.0, ry: Math.PI / 2 },
      { x: W - 0.04, z: 1.0, ry: -Math.PI / 2 },
      { x: -W + 0.04, z: 3.0, ry: Math.PI / 2 },
      { x: W - 0.04, z: 3.0, ry: -Math.PI / 2 },
    ];

    const glowMat = new THREE.MeshStandardMaterial({
      color: 0xaaccff, roughness: 0.1, metalness: 0.0,
      transparent: true, opacity: 0.12,
    });

    const loader = new GLTFLoader();
    loader.load('gothic_window_with_painted_glass.glb', (gltf) => {
      const model = gltf.scene;
      model.scale.set(0.27, 0.27, 0.27);
      for (const p of positions) {
        const inst = model.clone();
        inst.position.set(p.x, 2.0, p.z);
        if (p.ry) inst.rotation.y = p.ry;
        this.scene.add(inst);

        const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), glowMat);
        glow.position.set(p.x, 2.0, p.z);
        if (p.ry) glow.rotation.y = p.ry;
        this.scene.add(glow);
      }
    });
  }

  createGlass(pos, yBase, color) {
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.3,
    });
    const g = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.1, 8), glassMat);
    g.position.set(pos.x, yBase + 0.05, pos.z);
    g.castShadow = true;
    this.scene.add(g);
    if (color) {
      const liquidMat = new THREE.MeshStandardMaterial({
        color, roughness: 0.05, metalness: 0.05, transparent: true, opacity: 0.7,
      });
      const liq = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.07, 8), liquidMat);
      liq.position.set(pos.x, yBase + 0.05, pos.z);
      this.scene.add(liq);
    }
  }

  createBottle(pos, yBase, color, tall) {
    const h = tall ? 0.28 : 0.2;
    const bodyMat = new THREE.MeshStandardMaterial({
      color, roughness: 0.4, metalness: 0.1,
    });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, h, 8), bodyMat);
    body.position.set(pos.x, yBase + h / 2, pos.z);
    body.castShadow = true;
    this.scene.add(body);
    const neckMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a, roughness: 0.3, metalness: 0.2,
    });
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.04, 8), neckMat);
    neck.position.set(pos.x, yBase + h + 0.02, pos.z);
    this.scene.add(neck);
  }

  createNapkin(pos, yBase) {
    const napkinMat = new THREE.MeshStandardMaterial({
      color: 0xe8ddd0, roughness: 0.9, metalness: 0,
      transparent: true, opacity: 0.4,
    });
    const nap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.005, 0.08), napkinMat);
    nap.position.set(pos.x, yBase + 0.003, pos.z);
    this.scene.add(nap);
  }

  addCounterDecor() {
    const y = 0.78;

    this.createBottle({ x: -2.15, z: 0.6 }, y, 0xcc8844, true);
    this.createGlass({ x: -2.15, z: 0.8 }, y, 0xddaa44);
    this.createBottle({ x: -2.15, z: 0.45 }, y, 0x446644, false);
    this.createGlass({ x: -2.15, z: 0.95 }, y, 0xaa6644);

    this.createBottle({ x: 2.15, z: 0.6 }, y, 0xcc5533, true);
    this.createGlass({ x: 2.15, z: 0.8 }, y, 0xcc5533);
    this.createBottle({ x: 2.15, z: 0.45 }, y, 0x886644, true);
    this.createGlass({ x: 2.15, z: 0.95 }, y, 0x88aa44);

    const tapMat = new THREE.MeshStandardMaterial({
      color: 0x888888, roughness: 0.3, metalness: 0.7,
    });
    const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.12, 8), tapMat);
    tap.position.set(0, y + 0.06, 2.0);
    this.scene.add(tap);
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0x444444, roughness: 0.3, metalness: 0.5,
    });
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 0.02), handleMat);
    handle.position.set(0, y + 0.13, 2.0);
    handle.rotation.x = 0.5;
    this.scene.add(handle);
  }

  addTableDecor() {
    const tablePositions = [
      { x: -2.5, z: 3.2 },
      { x: 2.5, z: 3.2 },
      { x: 0, z: 3.8 },
    ];
    const y = 0.74;

    for (const pos of tablePositions) {
      this.createNapkin({ x: pos.x + 0.08, z: pos.z - 0.06 }, y);
      this.createGlass({ x: pos.x + 0.08, z: pos.z + 0.06 }, y, [0xcc6644, 0x88aa44, 0xddaa44][tablePositions.indexOf(pos) % 3]);
      this.createBottle({ x: pos.x - 0.08, z: pos.z - 0.02 }, y, [0x664422, 0x553322, 0x775533][tablePositions.indexOf(pos) % 3], false);
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

    this.addCounterDecor();
    this.addTableDecor();
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
    const W = 4;

    const loadPainting = (url, x, z, ry) => {
      const loader = new GLTFLoader();
      loader.load(url, (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const s = 1.1 / size.y;
        model.scale.set(s, s, s);
        model.position.set(x, 2.0, z);
        if (ry) model.rotation.y = ry;
        model.traverse((child) => {
          if (child.isMesh && child.material.map) {
            child.material.emissive = new THREE.Color(0xffffff);
            child.material.emissiveIntensity = 0.5;
            child.material.emissiveMap = child.material.map;
          }
        });
        this.scene.add(model);
      });
    };

    loadPainting('assets/painting_by_zdzislaw_beksinski_3.glb', W - 0.04, -1.0, -Math.PI / 2);
    loadPainting('assets/painting_of_a_walrus_on_a_unicycle.glb', 3.0, -3.46, 0);
    loadPainting('assets/psx_painting.glb', -3.0, -3.46, 0);
    loadPainting('assets/4e02db196539451f8c1322b78e704c87.glb', -W + 0.04, -1.0, Math.PI / 2);

    const tvBodyMat = new THREE.MeshStandardMaterial({
      color: 0x111111, roughness: 0.3, metalness: 0.3,
    });
    const tvScreenMat = new THREE.MeshStandardMaterial({
      color: 0x223344, roughness: 0.1, metalness: 0.5, emissive: 0x112233, emissiveIntensity: 0.3,
    });
    const tv = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.06), tvBodyMat);
    tv.position.set(W - 0.04, 2.2, 0.2);
    tv.rotation.y = -Math.PI / 2;
    this.scene.add(tv);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.29), tvScreenMat);
    screen.position.set(W - 0.07, 2.2, 0.2);
    screen.rotation.y = -Math.PI / 2;
    this.scene.add(screen);
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
