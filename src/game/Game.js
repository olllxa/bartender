import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { InputManager } from './InputManager.js';
import { PlayerController } from './PlayerController.js';
import { AudioManager } from './AudioManager.js';
import { BarCounter } from './objects/BarCounter.js';
import { BottleShelf } from './objects/BottleShelf.js';
import { Shaker } from './objects/Shaker.js';
import { Hand } from './objects/Hand.js';
import { Glass } from './objects/Glass.js';
import { UIManager } from '../ui/UIManager.js';
import { COCKTAILS, getRandomCocktail, getCocktailColor } from '../data/cocktails.js';
import { INGREDIENTS } from '../data/ingredients.js';
import { calculateLevelChange, drinksNeededForLevel } from '../data/levels.js';
import { computeMixColor, computeTotalPercent } from './effects/LiquidEffect.js';
import { ParticleSystem } from './effects/ParticleSystem.js';

export class Game {
  constructor(container) {
    if (!container) throw new Error('Game container is required');
    this.container = container;
    this.state = 'INIT';

    this.sceneManager = null;
    this.inputManager = null;
    this.playerController = null;
    this.uiManager = null;
    this.objects = {};

    this.playerMix = {};
    this.currentIngredientId = null;
    this.isPouring = false;
    this.pourTimer = 0;

    this.currentCocktail = null;
    this.animations = [];
    this.level = 1;
    this.prevLevel = 1;
    this.levelSegments = 0;

    this.audio = new AudioManager();
    this.particles = null;

    this.barCustomers = [];
    this.lastCustomerIndex = -1;
    this.hiddenCustomerIndex = -1;
  }

  init() {
    this.sceneManager = new SceneManager(this.container);
    this.sceneManager.init();

    const { camera, renderer } = this.sceneManager;

    this.playerController = new PlayerController(camera, renderer.domElement);

    this.inputManager = new InputManager(camera, renderer.domElement);
    this.inputManager.setPlayerController(this.playerController);

    this.playerController.controls.addEventListener('lock', () => {
      this.reticle.classList.add('visible');
      this.lockHint.classList.remove('visible');
    });
    this.playerController.controls.addEventListener('unlock', () => {
      this.reticle.classList.remove('visible');
      if (this.state === 'PLAYING' && !this.playerController.isLocked) {
        this.lockHint.classList.add('visible');
      }
    });

    this.objects.counter = new BarCounter();
    this.objects.counter.mesh.position.set(0, 0, 0);
    this.sceneManager.scene.add(this.objects.counter.mesh);

    this.objects.shelf = new BottleShelf();
    this.sceneManager.scene.add(this.objects.shelf.group);

    this.objects.shaker = new Shaker();
    this.objects.shaker.group.position.set(0.50, -0.25, -0.60);
    this.objects.shaker.group.rotation.z = 0.15;
    this.objects.shaker.group.scale.set(1.3, 1.3, 1.3);
    camera.add(this.objects.shaker.group);

    this.objects.hand = new Hand();
    this.objects.hand.group.position.set(0.50, -0.25, -0.60);
    this.objects.hand.group.rotation.z = 0.15;
    this.objects.hand.group.scale.set(1.3, 1.3, 1.3);
    camera.add(this.objects.hand.group);

    this.objects.glass = new Glass();
    this.objects.glass.group.position.set(0, 0.78, 1.5);
    this.sceneManager.scene.add(this.objects.glass.group);

    this.particles = new ParticleSystem(this.sceneManager.scene);
    this.barCustomers = this.sceneManager.getBarCustomerGroups();

    this.setupInput();
    this.setupUI();

    this.setState('WELCOME');
    this.lastTime = performance.now();
    this.animate();
  }

  setupInput() {
    const bottleMeshes = this.objects.shelf.getBottleMeshes();
    for (const bm of bottleMeshes) {
      this.inputManager.addClickable(bm.mesh, bm.ingredientId);
    }

    this.inputManager.onPourStart = (ingredientId) => {
      if (this.state !== 'PLAYING') return;
      this.objects.shelf.tiltBottle(ingredientId);
      this.audio.playClick();
      this.audio.startPour();
      this.currentIngredientId = ingredientId;
      this.isPouring = true;
      this.pourTimer = 0;
    };

    this.inputManager.onPourEnd = (ingredientId) => {
      this.isPouring = false;
      this.audio.stopPour();
      this.objects.shelf.untiltBottle(ingredientId);
      this.currentIngredientId = null;
    };

    this.inputManager.onHoverStart = (ingredientId) => {
      if (this.state !== 'PLAYING') return;
      this.objects.shelf.setGlow(ingredientId, true);
    };

    this.inputManager.onHoverEnd = (ingredientId) => {
      this.objects.shelf.setGlow(ingredientId, false);
    };

    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE' && this.state === 'PLAYING') {
        this.serveDrink();
      }
      if (e.code === 'KeyR' && this.state === 'PLAYING') {
        this.audio.playClick();
        this.resetDrink();
      }
    });
  }

  setupUI() {
    this.uiManager = new UIManager(this);
    this.uiManager.init();

    this.uiManager.pourPanel.bindReset(() => {
      this.audio.playClick();
      this.resetDrink();
    });
    this.uiManager.pourPanel.bindServe(() => {
      this.audio.playClick();
      this.serveDrink();
    });
  }

  setState(newState) {
    this.state = newState;
    this.onStateChange();
  }

  onStateChange() {
    switch (this.state) {
      case 'WELCOME':
        this.uiManager.showWelcome();
        break;
      case 'PLAYING':
        this.showOneCustomer();
        if (!this.playerController.isLocked) {
          this.lockHint.classList.add('visible');
        }
        this.currentCocktail = getRandomCocktail();
        this.uiManager.orderPanel.setOrder(this.currentCocktail);
        this.uiManager.orderPanel.show();
        this.uiManager.pourPanel.show();
        this.objects.glass.hide();
        break;
      case 'EVALUATING':
        this.uiManager.pourPanel.hide();
        break;
      case 'RESULT':
        break;
    }
  }

  startGame() {
    this.audio.startBGM();
    this.setState('PLAYING');
  }

  get reticle() {
    return document.getElementById('reticle');
  }

  get lockHint() {
    return document.getElementById('lock-hint');
  }

  resetDrink() {
    this.playerMix = {};
    this.currentIngredientId = null;
    this.isPouring = false;
    this.objects.shaker.reset();
    this.objects.shelf.untiltAll();
    this.uiManager.pourPanel.update(this.playerMix, null);
  }

  serveDrink() {
    if (this.state !== 'PLAYING') return;
    const total = computeTotalPercent(this.playerMix);
    if (total < 1) return;
    this.objects.shelf.untiltAll();
    this.objects.shelf.clearGlow();
    this.setState('EVALUATING');
    this.startShakeAnimation();
  }

  pickVisibleCustomer() {
    if (this.barCustomers.length === 0) return null;
    const available = this.barCustomers
      .map((g, i) => ({ group: g, index: i }))
      .filter(({ group }) => group.visible);
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  hideOneCustomer() {
    const pick = this.pickVisibleCustomer();
    if (!pick) return;
    this.hiddenCustomerIndex = pick.index;
    const origX = pick.group.position.x;
    pick.group.userData.origX = origX;
    this.animations.push({
      update: (t) => { pick.group.position.x = origX + t * 2.0; },
      duration: 0.8,
      elapsed: 0,
      onComplete: () => {
        pick.group.position.x = origX;
        pick.group.visible = false;
      },
    });
  }

  showOneCustomer() {
    if (this.barCustomers.length === 0) return;
    let group, origX;
    if (this.hiddenCustomerIndex >= 0) {
      group = this.barCustomers[this.hiddenCustomerIndex];
      origX = group.userData.origX || group.position.x;
      group.visible = true;
      group.position.x = origX + 2.0;
      this.hiddenCustomerIndex = -1;
    } else {
      const all = this.barCustomers.filter(g => g.visible);
      if (all.length < this.barCustomers.length) {
        const hidden = this.barCustomers.findIndex(g => !g.visible);
        if (hidden >= 0) {
          group = this.barCustomers[hidden];
          origX = group.userData.origX || group.position.x;
          group.visible = true;
          group.position.x = origX + 2.0;
        } else {
          return;
        }
      } else {
        return;
      }
    }
    this.animations.push({
      update: (t) => { group.position.x = origX + 2.0 - t * 2.0; },
      duration: 1.0,
      elapsed: 0,
      onComplete: () => { group.position.x = origX; },
    });
  }

  startShakeAnimation() {
    this.audio.playShake();
    this.uiManager.orderPanel.hide();

    const shaker = this.objects.shaker;
    const hand = this.objects.hand;
    const startRotZ = 0.15;
    let elapsed = 0;
    const duration = 1.0;

    const shakeUpdate = (t) => {
      const intensity = Math.sin(t * Math.PI * 12) * 0.18 * (1 - t * 0.7);
      hand.group.rotation.z = startRotZ + intensity;
      shaker.group.rotation.z = startRotZ + intensity;
    };

    const shakeComplete = () => {
      hand.group.rotation.z = startRotZ;
      shaker.group.rotation.z = startRotZ;
      this.startPourAnimation();
    };

    this.animations.push({
      update: shakeUpdate,
      isDone: () => false,
      setDone: null,
      duration,
      elapsed: 0,
      onComplete: shakeComplete,
    });
  }

  startPourAnimation() {
    this.audio.playServe();
    const shaker = this.objects.shaker;
    const glass = this.objects.glass;

    const glassPos = new THREE.Vector3();
    glass.group.getWorldPosition(glassPos);
    const color = computeMixColor(this.playerMix, INGREDIENTS);
    this.particles.emitBurst(glassPos, color, 16, 1.2, 0.6);
    const hand = this.objects.hand;

    glass.show();
    glass.setLiquidColor(color);

    const startRotX = 0;
    const targetRotX = -0.5;

    this.animations.push({
      update: (t) => {
        const eased = t < 0.3 ? t / 0.3 : 1;
        shaker.group.rotation.x = startRotX + (targetRotX - startRotX) * eased;
        hand.group.rotation.x = startRotX + (targetRotX - startRotX) * eased;
        shaker.setLiquidHeight(1 - t);
        glass.setLiquidHeight(t * 0.9);
      },
      isDone: () => false,
      setDone: null,
      duration: 0.6,
      elapsed: 0,
      onComplete: () => {
        shaker.reset();
        shaker.group.rotation.x = 0;
        hand.group.rotation.x = 0;
        this.startDeliverAnimation();
      },
    });
  }

  startDeliverAnimation() {
    const glass = this.objects.glass;
    const startZ = glass.group.position.z;
    const pick = this.pickVisibleCustomer();
    if (!pick) { this.evaluateDrink(); return; }
    this.hiddenCustomerIndex = pick.index;
    const origX = pick.group.position.x;
    pick.group.userData.origX = origX;

    this.animations.push({
      update: (t) => {
        glass.group.position.z = startZ + t * 0.7;
        pick.group.position.x = origX + t * 2.0;
      },
      duration: 0.8,
      elapsed: 0,
      onComplete: () => {
        glass.hide();
        glass.group.position.z = startZ;
        pick.group.position.x = origX;
        pick.group.visible = false;
        this.evaluateDrink();
      },
    });
  }

  evaluateDrink() {
    const cocktail = this.currentCocktail;
    const mix = this.playerMix;
    const details = [];

    for (const recipe of cocktail.ingredients) {
      const actual = mix[recipe.id] || 0;
      const diff = actual - recipe.percent;
      details.push({
        id: recipe.id,
        expected: recipe.percent,
        actual,
        diff,
        withinTolerance: Math.abs(diff) <= 5,
      });
    }

    for (const id of Object.keys(mix)) {
      if (!cocktail.ingredients.find(r => r.id === id)) {
        details.push({
          id,
          expected: 0,
          actual: mix[id],
          diff: mix[id],
          withinTolerance: false,
          extra: true,
        });
      }
    }

    const correct = details.every(d => d.withinTolerance);
    const prevLevel = this.level;

    if (correct) {
      this.audio.stopPour();
      this.audio.playSuccess();
      const result = calculateLevelChange(this.level, this.levelSegments, true);
      this.level = result.level;
      this.levelSegments = result.segments;
    } else {
      this.audio.stopPour();
      this.audio.playFail();
      const result = calculateLevelChange(this.level, this.levelSegments, false);
      this.level = result.level;
      this.levelSegments = result.segments;
    }

    if (this.level > prevLevel) {
      this.audio.playLevelUp();
      this.uiManager.showLevelNotification('up');
    } else if (this.level < prevLevel) {
      this.audio.playLevelDown();
      this.uiManager.showLevelNotification('down');
    }

    this.uiManager.updateLevel(this.level, this.levelSegments);
    this.uiManager.orderPanel.hide();

    this.setState('RESULT');

    this.uiManager.resultPanel.show(correct).then(() => {
      this.resetDrink();
      this.objects.glass.hide();
      this.setState('PLAYING');
    });
  }

  updateGame(dt) {
    this.inputManager.update();

    if (this.isPouring && this.currentIngredientId) {
      this.updatePour(dt);
    }
  }

  updatePour(dt) {
    const id = this.currentIngredientId;
    if (!id) return;

    const totalWithoutCurrent = Object.entries(this.playerMix)
      .filter(([k]) => k !== id)
      .reduce((s, [, v]) => s + v, 0);

    const remaining = 100 - totalWithoutCurrent;
    if (remaining <= 0.1) {
      this.isPouring = false;
      this.currentIngredientId = null;
      return;
    }

    const current = this.playerMix[id] || 0;
    const fillRate = 10;
    const newAmount = Math.min(current + fillRate * dt, remaining);
    this.playerMix[id] = Math.round(newAmount * 10) / 10;

    const total = computeTotalPercent(this.playerMix);
    const color = computeMixColor(this.playerMix, INGREDIENTS);
    this.objects.shaker.setLiquidHeight(total / 100);
    this.objects.shaker.setLiquidColor(color);

    this.uiManager.pourPanel.update(this.playerMix, id);
  }

  updateAnimations(dt) {
    const completed = [];
    this.animations = this.animations.filter(anim => {
      if (anim.done) return false;
      anim.elapsed += dt;
      const t = Math.min(anim.elapsed / anim.duration, 1);
      anim.update(t);
      if (t >= 1) {
        anim.done = true;
        completed.push(anim);
        return false;
      }
      return true;
    });
    for (const anim of completed) {
      if (anim.onComplete) anim.onComplete();
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    switch (this.state) {
      case 'PLAYING':
        this.playerController.update(dt);
        this.updateGame(dt);
        this.updateAnimations(dt);
        break;
      case 'EVALUATING':
        this.updateAnimations(dt);
        break;
    }

    if (this.particles) this.particles.update(dt);
    this.sceneManager.render();
  }
}
