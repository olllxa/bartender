import * as THREE from 'three';

export class BarCounter {
  constructor() {
    this.mesh = null;
    this.build();
  }

  build() {
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x6b3a2a, roughness: 0.7, metalness: 0.05,
    });
    const topMat = new THREE.MeshStandardMaterial({
      color: 0x7a4a34, roughness: 0.6, metalness: 0.05,
    });

    const group = new THREE.Group();
    const cx = 1.8, wingW = 0.7, wingD = 0.75;

    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(cx * 2, 0.75, 1.0), woodMat);
    mainBody.position.set(0, 0.375, 1.5);
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    group.add(mainBody);

    const mainTop = new THREE.Mesh(new THREE.BoxGeometry(cx * 2 + 0.2, 0.06, 1.05), topMat);
    mainTop.position.set(0, 0.78, 1.5);
    mainTop.castShadow = true;
    mainTop.receiveShadow = true;
    group.add(mainTop);

    const frontTrim = new THREE.Mesh(new THREE.BoxGeometry(cx * 2 + 0.2, 0.05, 0.06), topMat);
    frontTrim.position.set(0, 0.78, 2.025);
    group.add(frontTrim);

    const leftWing = new THREE.Mesh(new THREE.BoxGeometry(wingW, 0.75, wingD), woodMat);
    leftWing.position.set(-cx - wingW / 2, 0.375, 1.5 - 0.5 - wingD / 2);
    leftWing.castShadow = true;
    leftWing.receiveShadow = true;
    group.add(leftWing);

    const leftTop = new THREE.Mesh(new THREE.BoxGeometry(wingW + 0.06, 0.06, wingD + 0.05), topMat);
    leftTop.position.set(-cx - wingW / 2, 0.78, 1.5 - 0.5 - wingD / 2);
    group.add(leftTop);

    const rightWing = new THREE.Mesh(new THREE.BoxGeometry(wingW, 0.75, wingD), woodMat);
    rightWing.position.set(cx + wingW / 2, 0.375, 1.5 - 0.5 - wingD / 2);
    rightWing.castShadow = true;
    rightWing.receiveShadow = true;
    group.add(rightWing);

    const rightTop = new THREE.Mesh(new THREE.BoxGeometry(wingW + 0.06, 0.06, wingD + 0.05), topMat);
    rightTop.position.set(cx + wingW / 2, 0.78, 1.5 - 0.5 - wingD / 2);
    group.add(rightTop);

    this.mesh = group;
  }
}
