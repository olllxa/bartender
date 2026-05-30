import * as THREE from 'three';

export class BarTable {
  constructor() {
    this.group = new THREE.Group();
    this.build();
  }

  build() {
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x6b4226, roughness: 0.8, metalness: 0.05,
    });
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x888899, roughness: 0.4, metalness: 0.7,
    });

    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.37, 0.04, 14), woodMat);
    top.position.y = 0.74;
    top.castShadow = true;
    top.receiveShadow = true;
    this.group.add(top);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.01, 6, 14), woodMat);
    rim.position.y = 0.76;
    rim.rotation.x = Math.PI / 2;
    this.group.add(rim);

    const centerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.72, 8), metalMat);
    centerLeg.position.y = 0.36;
    centerLeg.castShadow = true;
    this.group.add(centerLeg);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.03, 10), metalMat);
    base.position.y = 0.015;
    base.receiveShadow = true;
    this.group.add(base);

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.06, 5), metalMat);
      foot.position.set(Math.cos(angle) * 0.24, 0.01, Math.sin(angle) * 0.24);
      this.group.add(foot);
    }
  }
}
