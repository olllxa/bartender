import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export class PlayerController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.controls = new PointerLockControls(camera, domElement);
    this.keys = {};
    this.isLocked = false;
    this.moveSpeed = 3.0;

    this.controls.addEventListener('lock', () => { this.isLocked = true; });
    this.controls.addEventListener('unlock', () => { this.isLocked = false; });

    document.addEventListener('keydown', (e) => { this.keys[e.code] = true; });
    document.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  lock() {
    this.controls.lock();
  }

  unlock() {
    this.controls.unlock();
  }

  update(dt) {
    if (!this.isLocked) return;

    const speed = this.moveSpeed * dt;

    if (this.keys['KeyW']) this.camera.position.z -= speed;
    if (this.keys['KeyS']) this.camera.position.z += speed;
    if (this.keys['KeyA']) this.camera.position.x -= speed;
    if (this.keys['KeyD']) this.camera.position.x += speed;

    this.camera.position.y = 1.6;
    this.camera.position.x = Math.max(-2.5, Math.min(2.5, this.camera.position.x));
    this.camera.position.z = Math.max(-2.0, Math.min(1.0, this.camera.position.z));
  }
}
