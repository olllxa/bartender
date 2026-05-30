import * as THREE from 'three';

const COLORS = [0xd4a574, 0xc89860, 0xe0b888, 0xb88050];

export class BarCustomer {
  constructor(colorIndex) {
    this.group = new THREE.Group();
    this.build(colorIndex || 0);
  }

  build(ci) {
    const skinColors = [0xf0d0b0, 0xe8c8a0, 0xdeb887, 0xd2b48c];
    const skinMat = new THREE.MeshStandardMaterial({
      color: skinColors[ci % skinColors.length],
      roughness: 0.7, metalness: 0.0,
    });
    const clothMat = new THREE.MeshStandardMaterial({
      color: COLORS[ci % COLORS.length],
      roughness: 0.8, metalness: 0.0,
    });
    const darkClothMat = new THREE.MeshStandardMaterial({
      color: [0x3a2a1a, 0x2a1a0e, 0x4a3020, 0x222233][ci % 4],
      roughness: 0.9, metalness: 0.0,
    });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.28, 8), clothMat);
    body.position.y = 0.14;
    body.castShadow = true;
    this.group.add(body);

    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.12, 8), darkClothMat);
    chest.position.y = 0.34;
    chest.castShadow = true;
    this.group.add(chest);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), skinMat);
    head.position.y = 0.48;
    head.castShadow = true;
    this.group.add(head);

    const armMat = new THREE.MeshStandardMaterial({
      color: skinColors[ci % skinColors.length],
      roughness: 0.7, metalness: 0.0,
    });
    for (const sx of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.16, 6), armMat);
      arm.position.set(sx * 0.17, 0.22, 0);
      arm.rotation.z = sx * 0.15;
      this.group.add(arm);
    }

    const hairMat = new THREE.MeshStandardMaterial({
      color: [0x332211, 0x221100, 0x443322, 0x554433][ci % 4],
      roughness: 0.9, metalness: 0.0,
    });
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), hairMat);
    hair.position.y = 0.50;
    this.group.add(hair);
  }
}
