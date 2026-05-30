import * as THREE from 'three';
import { COCKTAILS, getCocktailColor } from '../data/cocktails.js';
import { INGREDIENTS } from '../data/ingredients.js';

export class RecipeBook {
  constructor() {
    this.element = null;
    this.currentPage = 0;
    this.previewRenderer = null;
    this.previewScene = null;
    this.previewCamera = null;
    this.previewGlass = null;
    this.previewLiquid = null;
    this.build();
  }

  build() {
    this.element = document.createElement('div');
    this.element.className = 'recipe-book hidden';
    this.element.innerHTML = `
      <div class="recipe-backdrop"></div>
      <div class="recipe-card recipe-card-wide">
        <div class="recipe-header">
          <span class="recipe-title">📖 РЕЦЕПТЫ</span>
          <button class="recipe-close" id="recipe-close">✕</button>
        </div>
        <div class="recipe-layout">
          <div class="recipe-preview-col" id="recipe-preview-col">
            <div class="recipe-preview" id="recipe-preview"></div>
          </div>
          <div class="recipe-content-col">
            <div class="recipe-name" id="recipe-name"></div>
            <div class="recipe-list" id="recipe-list"></div>
          </div>
        </div>
        <div class="recipe-nav">
          <button class="recipe-nav-btn" id="recipe-prev">◀</button>
          <span class="recipe-page" id="recipe-page">1/1</span>
          <button class="recipe-nav-btn" id="recipe-next">▶</button>
        </div>
      </div>
    `;

    this.element.querySelector('#recipe-prev').addEventListener('click', (e) => {
      e.stopPropagation();
      this.prevPage();
    });
    this.element.querySelector('#recipe-next').addEventListener('click', (e) => {
      e.stopPropagation();
      this.nextPage();
    });
    this.element.querySelector('#recipe-close').addEventListener('click', (e) => {
      e.stopPropagation();
    });

    this._onKeyDown = (e) => {
      if (this.element.classList.contains('hidden')) return;
      if (e.key === 'ArrowLeft') this.prevPage();
      if (e.key === 'ArrowRight') this.nextPage();
      if (e.key === 'Escape') {
        if (this._closeCb) this._closeCb();
      }
    };
    document.addEventListener('keydown', this._onKeyDown);
  }

  show() {
    this.element.classList.remove('hidden');
    this.currentPage = 0;
    this.renderPage();
    this.initPreview();
    this.startPreviewLoop();
  }

  hide() {
    this.element.classList.add('hidden');
    this.stopPreviewLoop();
    this.disposePreview();
  }

  renderPage() {
    const cocktail = COCKTAILS[this.currentPage];
    if (!cocktail) return;

    const nameEl = this.element.querySelector('#recipe-name');
    const listEl = this.element.querySelector('#recipe-list');
    const pageLabel = this.element.querySelector('#recipe-page');
    const total = COCKTAILS.length;

    pageLabel.textContent = `${this.currentPage + 1}/${total}`;
    nameEl.textContent = cocktail.name;

    listEl.innerHTML = cocktail.ingredients.map(ing => {
      const ingData = INGREDIENTS[ing.id];
      return `
        <div class="recipe-ingredient">
          <span class="recipe-ing-color" style="background:${this.colorToCSS(ingData ? ingData.color : 0xffffff)}"></span>
          <span class="recipe-ing-name">${ingData ? ingData.name : ing.id}</span>
          <span class="recipe-ing-percent">${ing.percent}%</span>
        </div>
      `;
    }).join('');

    this.updatePreview(cocktail);
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.renderPage();
    }
  }

  nextPage() {
    if (this.currentPage < COCKTAILS.length - 1) {
      this.currentPage++;
      this.renderPage();
    }
  }

  initPreview() {
    const container = this.element.querySelector('#recipe-preview');
    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    canvas.width = 140;
    canvas.height = 200;
    canvas.style.width = '140px';
    canvas.style.height = '200px';
    container.appendChild(canvas);

    this.previewRenderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.previewScene = new THREE.Scene();
    this.previewScene.background = null;

    this.previewCamera = new THREE.PerspectiveCamera(35, 140 / 200, 0.1, 10);
    this.previewCamera.position.set(0, 0.15, 0.65);
    this.previewCamera.lookAt(0, 0.06, 0);

    const ambient = new THREE.AmbientLight(0x8899aa, 0.6);
    this.previewScene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 1.5);
    keyLight.position.set(1, 2, 2);
    this.previewScene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8899ff, 0.3);
    fillLight.position.set(-1, 0.5, -1);
    this.previewScene.add(fillLight);

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 0.05, metalness: 0.0,
      transparent: true, opacity: 0.25,
    });

    this.previewGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.095, 0.2, 12),
      glassMat
    );
    this.previewGlass.position.y = 0.1;
    this.previewScene.add(this.previewGlass);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.07, 0.025, 10),
      glassMat
    );
    base.position.y = 0.0125;
    this.previewScene.add(base);

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.025, 0.06, 8),
      glassMat
    );
    stem.position.y = 0.055;
    this.previewScene.add(stem);

    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0x88cc88, roughness: 0.05, metalness: 0.0,
      transparent: true, opacity: 0.65,
    });

    this.previewLiquid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.105, 0.11, 0.16, 12),
      liquidMat
    );
    this.previewLiquid.position.y = 0.1;
    this.previewScene.add(this.previewLiquid);

    this.animating = true;
  }

  updatePreview(cocktail) {
    if (!this.previewLiquid) return;
    const color = getCocktailColor(cocktail, INGREDIENTS);
    this.previewLiquid.material.color.setHex(color);
  }

  startPreviewLoop() {
    this.animating = true;
    const loop = () => {
      if (!this.animating) return;
      this.previewFrame();
      requestAnimationFrame(loop);
    };
    this._previewRAF = requestAnimationFrame(loop);
  }

  stopPreviewLoop() {
    this.animating = false;
    if (this._previewRAF) {
      cancelAnimationFrame(this._previewRAF);
      this._previewRAF = null;
    }
  }

  previewFrame() {
    if (this.previewGlass) this.previewGlass.rotation.y += 0.008;
    if (this.previewLiquid) this.previewLiquid.rotation.y += 0.008;
    if (this.previewRenderer && this.previewScene && this.previewCamera) {
      this.previewRenderer.render(this.previewScene, this.previewCamera);
    }
  }

  disposePreview() {
    if (this.previewRenderer) {
      this.previewRenderer.dispose();
      this.previewRenderer = null;
    }
    this.previewScene = null;
    this.previewCamera = null;
    this.previewGlass = null;
    this.previewLiquid = null;
  }

  colorToCSS(colorHex) {
    const r = (colorHex >> 16) & 0xff;
    const g = (colorHex >> 8) & 0xff;
    const b = colorHex & 0xff;
    return `rgb(${r},${g},${b})`;
  }

  bindClose(callback) {
    this._closeCb = callback;
    this.element.querySelector('#recipe-close').addEventListener('click', callback);
  }

  destroy() {
    document.removeEventListener('keydown', this._onKeyDown);
    this.disposePreview();
  }
}
