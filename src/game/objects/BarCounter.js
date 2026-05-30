import * as THREE from 'three';

export class BarCounter {
  constructor() {
    this.mesh = null;
    this.build();
  }

  build() {
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x6b3a2a,
      roughness: 0.7,
      metalness: 0.05,
    });

    const topMat = new THREE.MeshStandardMaterial({
      color: 0x7a4a34,
      roughness: 0.6,
      metalness: 0.05,
    });

    const group = new THREE.Group();

    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.75, 1.0), woodMat);
    mainBody.position.set(0, 0.375, 1.5);
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    group.add(mainBody);

    const top = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.06, 1.05), topMat);
    top.position.set(0, 0.78, 1.5);
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    const frontTrim = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.05, 0.06), topMat);
    frontTrim.position.set(0, 0.78, 2.025);
    group.add(frontTrim);

    this.mesh = group;
  }
}
