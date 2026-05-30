import * as THREE from 'three';

export class InputManager {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.clickables = [];
    this.isPouring = false;
    this.currentIngredientId = null;
    this.onPourStart = null;
    this.onPourEnd = null;
    this.onHoverStart = null;
    this.onHoverEnd = null;
    this.hoveredIngredientId = null;
    this.playerController = null;

    this.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.domElement.addEventListener('mouseup', (e) => this.onMouseUp(e));
    this.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }

  setPlayerController(pc) {
    this.playerController = pc;
  }

  addClickable(mesh, ingredientId) {
    this.clickables.push({ mesh, ingredientId });
  }

  removeClickable(mesh) {
    this.clickables = this.clickables.filter(c => c.mesh !== mesh);
  }

  onMouseMove(event) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  onMouseDown(event) {
    if (this.playerController && !this.playerController.isLocked) {
      this.playerController.lock();
      return;
    }
    this.mouse.set(0, 0);
    const hit = this.raycastClickables();
    if (hit) {
      this.isPouring = true;
      this.currentIngredientId = hit.ingredientId;
      if (this.onPourStart) this.onPourStart(hit.ingredientId);
    }
  }

  onMouseUp(event) {
    if (this.isPouring) {
      this.isPouring = false;
      if (this.onPourEnd) this.onPourEnd(this.currentIngredientId);
      this.currentIngredientId = null;
    }
  }

  raycastClickables() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = this.clickables.map(c => c.mesh);
    const intersects = this.raycaster.intersectObjects(meshes, false);
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const clickable = this.clickables.find(c => c.mesh === hitMesh);
      return clickable || null;
    }
    return null;
  }

  update() {
    if (this.playerController && this.playerController.isLocked) {
      this.mouse.set(0, 0);
    }
    const hit = this.raycastClickables();
    const newHover = hit ? hit.ingredientId : null;
    if (newHover !== this.hoveredIngredientId) {
      const old = this.hoveredIngredientId;
      this.hoveredIngredientId = newHover;
      if (old && this.onHoverEnd) this.onHoverEnd(old);
      if (newHover && this.onHoverStart) this.onHoverStart(newHover);
    }
  }
}
