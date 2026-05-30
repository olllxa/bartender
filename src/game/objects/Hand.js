import * as THREE from 'three';

export class Hand {
  constructor() {
    this.group = new THREE.Group();
    this.build();
  }

  build() {
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xf0d0b0,
      roughness: 0.7,
      metalness: 0.0,
    });

    const sleeveMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.0,
    });

    const forearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 0.5, 8),
      sleeveMat
    );
    forearm.position.set(-0.45, -0.35, 0.0);
    forearm.rotation.z = -0.35;
    forearm.rotation.x = 0.15;
    this.group.add(forearm);

    const palm = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.07, 0.12),
      skinMat
    );
    palm.position.set(-0.08, -0.02, 0.0);
    this.group.add(palm);

    const fingerPositions = [
      { x: -0.02, z: -0.05, rot: -0.05 },
      { x: -0.02, z: -0.015, rot: 0 },
      { x: -0.02, z: 0.015, rot: 0 },
      { x: -0.02, z: 0.05, rot: 0.05 },
    ];

    for (const fp of fingerPositions) {
      const finger = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.02, 0.06, 6),
        skinMat
      );
      finger.position.set(fp.x, -0.06, fp.z);
      finger.rotation.x = fp.rot;
      this.group.add(finger);
    }

    const thumb = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.025, 0.07, 6),
      skinMat
    );
    thumb.position.set(-0.14, -0.03, -0.07);
    thumb.rotation.x = -0.3;
    thumb.rotation.z = 0.2;
    this.group.add(thumb);

    const wrist = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.085, 0.08, 8),
      skinMat
    );
    wrist.position.set(-0.28, -0.02, 0.0);
    wrist.rotation.z = -0.1;
    this.group.add(wrist);
  }
}
