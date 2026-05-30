import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { INGREDIENTS } from '../../data/ingredients.js';

export class BottleShelf {
  constructor() {
    this.group = new THREE.Group();
    this.bottles = {};
    this.labels = {};
    this.build();
  }

  build() {
    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x4a2e14, roughness: 0.85, metalness: 0.0,
    });
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x5c3a1e, roughness: 0.85, metalness: 0.0,
    });
    const shelfMat = new THREE.MeshStandardMaterial({
      color: 0x6b4226, roughness: 0.8, metalness: 0.0,
    });

    const cabinetH = 3.0;
    const cabCenter = cabinetH / 2;

    const back = new THREE.Mesh(new THREE.BoxGeometry(3.0, cabinetH, 0.08), darkWoodMat);
    back.position.set(0, cabCenter, -3.0);
    back.receiveShadow = true;
    this.group.add(back);

    for (const x of [-1.5, 1.5]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.06, cabinetH, 0.5), woodMat);
      side.position.set(x, cabCenter, -2.75);
      this.group.add(side);
    }

    const top = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.06, 0.5), woodMat);
    top.position.set(0, cabinetH, -2.75);
    this.group.add(top);

    const bottom = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.06, 0.5), darkWoodMat);
    bottom.position.set(0, 0, -2.75);
    this.group.add(bottom);

    const shelfY = [0.65, 1.25, 1.85, 2.45];
    for (const y of shelfY) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.04, 0.42), shelfMat);
      plank.position.set(0, y, -2.75);
      plank.receiveShadow = true;
      this.group.add(plank);
    }

    const ingredientIds = Object.keys(INGREDIENTS);
    const positions = this.calculatePositions(ingredientIds.length, shelfY);

    ingredientIds.forEach((id, i) => {
      const ingredient = INGREDIENTS[id];
      const bottle = this.createBottle(ingredient.color);
      bottle.group.position.copy(positions[i]);
      this.group.add(bottle.group);
      this.bottles[id] = bottle;

      const labelDiv = document.createElement('div');
      labelDiv.className = 'bottle-label';
      labelDiv.textContent = ingredient.name;
      const label = new CSS2DObject(labelDiv);
      label.position.set(0, 0.6, 0);
      bottle.group.add(label);
      this.labels[id] = label;
    });
  }

  calculatePositions(count, shelfY) {
    const shelves = shelfY.slice(0, -1);
    const perShelf = Math.ceil(count / shelves.length);
    const positions = [];

    for (let si = 0; si < shelves.length; si++) {
      const yBase = shelves[si] + 0.02;
      const start = si * perShelf;
      const end = Math.min(start + perShelf, count);
      const countOnShelf = end - start;

      for (let i = 0; i < countOnShelf; i++) {
        const spacing = Math.min(0.38, 2.6 / countOnShelf);
        const xOffset = (i - (countOnShelf - 1) / 2) * spacing;
        positions.push(new THREE.Vector3(xOffset, yBase, -2.75));
      }
    }

    return positions;
  }

  createBottle(colorHex) {
    const bodyMat = new THREE.MeshStandardMaterial({
      color: colorHex, roughness: 0.3, metalness: 0.1,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 0.1, metalness: 0.0,
      transparent: true, opacity: 0.13,
    });
    const labelMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5dc, roughness: 0.6, metalness: 0.0,
    });
    const neckMat = new THREE.MeshStandardMaterial({
      color: colorHex, roughness: 0.4, metalness: 0.05,
    });
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 0.1, metalness: 0.0,
      transparent: true, opacity: 0.0,
    });

    const group = new THREE.Group();

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.28, 10), bodyMat);
    body.position.y = 0.14;
    body.castShadow = true;
    group.add(body);

    const outer = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.18, 0.30, 10), glassMat);
    outer.position.y = 0.14;
    group.add(outer);

    const glowRing = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.19, 0.32, 10), glowMat);
    glowRing.position.y = 0.14;
    group.add(glowRing);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.14, 8), neckMat);
    neck.position.y = 0.35;
    group.add(neck);

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.035, 8), neckMat);
    cap.position.y = 0.44;
    group.add(cap);

    const labelMesh = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.1, 0.16), labelMat);
    labelMesh.position.set(0.14, 0.14, 0);
    group.add(labelMesh);

    return { group, body, bodyMat, glowMat, neckMat };
  }

  getBottleMeshes() {
    const result = [];
    for (const [id, bottle] of Object.entries(this.bottles)) {
      result.push({ mesh: bottle.body, ingredientId: id });
    }
    return result;
  }

  tiltBottle(ingredientId) {
    const bottle = this.bottles[ingredientId];
    if (!bottle) return;
    bottle.group.rotation.x = -0.25;
  }

  untiltBottle(ingredientId) {
    const bottle = this.bottles[ingredientId];
    if (!bottle) return;
    bottle.group.rotation.x = 0;
  }

  untiltAll() {
    for (const id of Object.keys(this.bottles)) {
      this.bottles[id].group.rotation.x = 0;
    }
  }

  setGlow(ingredientId, on) {
    const bottle = this.bottles[ingredientId];
    if (!bottle) return;
    bottle.glowMat.opacity = on ? 0.18 : 0;
  }

  clearGlow() {
    for (const id of Object.keys(this.bottles)) {
      this.bottles[id].glowMat.opacity = 0;
    }
  }
}
