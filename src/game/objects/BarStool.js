import * as THREE from 'three';

export class BarStool {
  constructor() {
    this.group = new THREE.Group();
    this.build();
  }

  build() {
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x888899, roughness: 0.4, metalness: 0.7,
    });
    const seatMat = new THREE.MeshStandardMaterial({
      color: 0x5a2d1a, roughness: 0.9, metalness: 0.0,
    });
    const footMat = new THREE.MeshStandardMaterial({
      color: 0x666677, roughness: 0.5, metalness: 0.5,
    });

    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.04, 12), seatMat);
    seat.position.y = 0.72;
    seat.castShadow = true;
    this.group.add(seat);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.015, 6, 12), seatMat);
    ring.position.y = 0.74;
    ring.rotation.x = Math.PI / 2;
    this.group.add(ring);

    const legPositions = [
      [-0.1, -0.1],
      [0.1, -0.1],
      [-0.1, 0.1],
      [0.1, 0.1],
    ];

    for (const [lx, lz] of legPositions) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.7, 6), metalMat);
      leg.position.set(lx, 0.35, lz);
      leg.castShadow = true;
      this.group.add(leg);
    }

    const crossPositions = [
      [-0.1, 0.1], [-0.1, -0.1],
      [0.1, 0.1], [0.1, -0.1],
    ];
    for (const [cx, cz] of crossPositions) {
      const cross = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.04, 5), metalMat);
      cross.position.set(cx, 0.18, cz);
      this.group.add(cross);
    }

    const footRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 6, 16), footMat);
    footRing.position.y = 0.2;
    footRing.rotation.x = Math.PI / 2;
    this.group.add(footRing);
  }
}
