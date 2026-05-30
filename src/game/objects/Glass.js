import * as THREE from 'three';

export class Glass {
  constructor() {
    this.group = new THREE.Group();
    this.liquidMesh = null;
    this.build();
  }

  build() {
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.05,
      metalness: 0.0,
      transparent: true,
      opacity: 0.25,
    });

    const glassMat2 = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.05,
      metalness: 0.0,
      transparent: true,
      opacity: 0.15,
    });

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.08, 0.18, 10),
      glassMat
    );
    body.position.y = 0.09;
    body.castShadow = true;
    this.group.add(body);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.06, 0.02, 10),
      glassMat2
    );
    base.position.y = 0.01;
    this.group.add(base);

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.025, 0.06, 8),
      glassMat2
    );
    stem.position.y = 0.05;
    this.group.add(stem);

    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0x88cc88,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });

    this.liquidMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.095, 0.15, 10),
      liquidMat
    );
    this.liquidMesh.position.y = 0.02 + 0.075;
    this.liquidMesh.scale.y = 0.001;
    this.liquidMesh.visible = false;
    this.group.add(this.liquidMesh);

    this.group.visible = false;
  }

  setLiquidHeight(fraction) {
    if (!this.liquidMesh) return;
    const f = Math.max(0, Math.min(1, fraction));
    this.liquidMesh.scale.y = Math.max(0.001, f);
    this.liquidMesh.position.y = 0.02 + (0.15 * f) / 2;
    this.liquidMesh.visible = f > 0.01;
  }

  setLiquidColor(colorHex) {
    if (this.liquidMesh) {
      this.liquidMesh.material.color.setHex(colorHex);
    }
  }

  show() {
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
  }
}
