import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
  }

  emitBurst(position, color, count = 12, speed = 1.5, lifetime = 0.8) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const colors = new Float32Array(count * 3);

    const c = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;
      const v = speed * (0.5 + Math.random() * 0.5);
      velocities.push(
        Math.sin(theta) * Math.cos(phi) * v,
        Math.sin(phi) * v + 0.3,
        Math.cos(theta) * Math.cos(phi) * v
      );

      const brightness = 0.6 + Math.random() * 0.4;
      colors[i * 3] = c.r * brightness;
      colors[i * 3 + 1] = c.g * brightness;
      colors[i * 3 + 2] = c.b * brightness;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const mesh = new THREE.Points(geometry, material);
    this.scene.add(mesh);

    this.particles.push({
      mesh,
      velocities,
      lifetime,
      elapsed: 0,
    });
  }

  emitPourStream(origin, color, count = 3) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const colors = new Float32Array(count * 3);

    const c = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = origin.x + (Math.random() - 0.5) * 0.02;
      positions[i * 3 + 1] = origin.y;
      positions[i * 3 + 2] = origin.z + (Math.random() - 0.5) * 0.02;

      velocities.push(
        0,
        -(0.4 + Math.random() * 0.3),
        0
      );

      const b = 0.7 + Math.random() * 0.3;
      colors[i * 3] = c.r * b;
      colors[i * 3 + 1] = c.g * b;
      colors[i * 3 + 2] = c.b * b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const mesh = new THREE.Points(geometry, material);
    this.scene.add(mesh);

    this.particles.push({
      mesh,
      velocities,
      lifetime: 0.5,
      elapsed: 0,
    });
  }

  update(dt) {
    this.particles = this.particles.filter(p => {
      p.elapsed += dt;
      const life = p.elapsed / p.lifetime;

      if (life >= 1) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        return false;
      }

      const pos = p.mesh.geometry.attributes.position;
      const array = pos.array;

      for (let i = 0; i < pos.count; i++) {
        const idx = i * 3;
        array[idx] += p.velocities[i * 3] * dt;
        array[idx + 1] += p.velocities[i * 3 + 1] * dt;
        array[idx + 2] += p.velocities[i * 3 + 2] * dt;

        p.velocities[i * 3 + 1] -= 2.0 * dt;
      }

      pos.needsUpdate = true;

      p.mesh.material.opacity = Math.max(0, 1 - life);

      return true;
    });
  }

  dispose() {
    for (const p of this.particles) {
      this.scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
    }
    this.particles = [];
  }
}
