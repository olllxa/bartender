import * as THREE from 'three';

export class Shaker {
  constructor() {
    this.group = new THREE.Group();
    this.liquidMesh = null;
    this.shakerMesh = null;
    this.maxLiquidHeight = 0.28;
    this.build();
  }

  build() {
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xa0a0b0,
      roughness: 0.25,
      metalness: 0.85,
    });

    const shinyMat = new THREE.MeshStandardMaterial({
      color: 0xc0c0d0,
      roughness: 0.15,
      metalness: 0.9,
    });

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.18, 0.32, 14),
      metalMat
    );
    body.position.y = 0.16;
    body.castShadow = true;
    this.group.add(body);

    const lid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 0.06, 14),
      shinyMat
    );
    lid.position.y = 0.33;
    this.group.add(lid);

    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.06, 0.08, 10),
      shinyMat
    );
    cap.position.y = 0.4;
    this.group.add(cap);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.015, 8, 14),
      shinyMat
    );
    rim.position.y = 0.0;
    rim.rotation.x = Math.PI / 2;
    this.group.add(rim);

    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0x88cc88,
      roughness: 0.05,
      metalness: 0.0,
      transparent: true,
      opacity: 0.7,
    });

    this.liquidMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, this.maxLiquidHeight, 14),
      liquidMat
    );
    this.liquidMesh.position.y = 0.01 + this.maxLiquidHeight / 2;
    this.liquidMesh.scale.y = 0.001;
    this.liquidMesh.visible = false;
    this.group.add(this.liquidMesh);

    this.shakerMesh = body;
  }

  setLiquidHeight(fraction) {
    if (!this.liquidMesh) return;
    const f = Math.max(0, Math.min(1, fraction));
    this.liquidMesh.scale.y = Math.max(0.001, f);
    this.liquidMesh.position.y = 0.01 + (this.maxLiquidHeight * f) / 2;
    this.liquidMesh.visible = f > 0.01;
  }

  setLiquidColor(colorHex) {
    if (this.liquidMesh) {
      this.liquidMesh.material.color.setHex(colorHex);
    }
  }

  reset() {
    this.setLiquidHeight(0);
  }
}
