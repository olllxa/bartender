import { WelcomeScreen } from './WelcomeScreen.js';
import { PourPanel } from './PourPanel.js';
import { OrderPanel } from './OrderPanel.js';
import { ResultPanel } from './ResultPanel.js';
import { RecipeBook } from './RecipeBook.js';
import { drinksNeededForLevel } from '../data/levels.js';

export class UIManager {
  constructor(game) {
    this.game = game;
    this.welcomeScreen = null;
    this.pourPanel = null;
    this.orderPanel = null;
    this.resultPanel = null;
    this.recipeBook = null;
    this.uiLayer = null;
    this.levelDisplay = null;
    this.recipeBtn = null;
  }

  init() {
    this.uiLayer = document.createElement('div');
    this.uiLayer.id = 'ui-layer';
    document.getElementById('game-container').appendChild(this.uiLayer);

    this.pourPanel = new PourPanel();
    this.uiLayer.appendChild(this.pourPanel.element);

    this.orderPanel = new OrderPanel();
    this.uiLayer.appendChild(this.orderPanel.element);

    this.resultPanel = new ResultPanel();
    this.uiLayer.appendChild(this.resultPanel.element);

    this.recipeBook = new RecipeBook();
    this.recipeBook.bindClose(() => this.recipeBook.hide());
    this.uiLayer.appendChild(this.recipeBook.element);

    this.buildTopBar();
  }

  buildTopBar() {
    const topBar = document.createElement('div');
    topBar.className = 'top-bar';

    this.recipeBtn = document.createElement('button');
    this.recipeBtn.className = 'recipe-btn';
    this.recipeBtn.innerHTML = '📖 Рецепты';
    this.recipeBtn.addEventListener('click', () => {
      if (this.game && this.game.audio) this.game.audio.playClick();
      this.recipeBook.show();
    });
    topBar.appendChild(this.recipeBtn);

    this.levelDisplay = document.createElement('div');
    this.levelDisplay.className = 'level-display';
    topBar.appendChild(this.levelDisplay);

    this.uiLayer.appendChild(topBar);
    this.updateLevel(1, 0);
  }

  updateLevel(level, segments) {
    if (!this.levelDisplay) return;
    const needed = drinksNeededForLevel(level);
    this.levelDisplay.innerHTML = `
      <div class="level-info">
        <span class="level-star">★</span>
        <span class="level-number">Уровень ${level}</span>
      </div>
      <div class="level-bar">
        ${Array.from({ length: needed }, (_, i) => `
          <div class="level-segment ${i < segments ? 'level-segment-filled' : ''}"></div>
        `).join('')}
      </div>
      <div class="level-text">${segments}/${needed}</div>
    `;
  }

  showLevelNotification(type) {
    const el = document.createElement('div');
    el.className = `level-notification level-notification-${type}`;
    el.textContent = type === 'up' ? '★ Уровень повышен!' : '★ Уровень понижен';
    document.getElementById('game-container').appendChild(el);
    requestAnimationFrame(() => {
      el.classList.add('level-notification-visible');
    });
    setTimeout(() => {
      el.classList.remove('level-notification-visible');
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 400);
    }, 1800);
  }

  showWelcome() {
    this.welcomeScreen = new WelcomeScreen(() => {
      this.game.startGame();
    });
    this.welcomeScreen.show();
  }

  hideWelcome() {
    if (this.welcomeScreen) {
      this.welcomeScreen.hide();
      this.welcomeScreen = null;
    }
  }
}
