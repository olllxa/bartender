import { INGREDIENTS } from '../data/ingredients.js';

export class PourPanel {
  constructor() {
    this.element = null;
    this.build();
  }

  build() {
    this.element = document.createElement('div');
    this.element.className = 'pour-panel hidden';
    this.element.innerHTML = `
      <div class="pour-header">Приготовление коктейля</div>
      <div class="pour-ingredients" id="pour-ingredients"></div>
      <div class="pour-total-row">
        <span class="pour-total-label">Всего:</span>
        <div class="pour-total-bar">
          <div class="pour-total-fill" id="pour-total-fill"></div>
        </div>
        <span class="pour-total-value" id="pour-total-value">0%</span>
      </div>
      <div class="pour-actions">
        <button class="pour-btn pour-btn-reset" id="pour-reset">Сбросить</button>
        <button class="pour-btn pour-btn-serve" id="pour-serve">Подать</button>
      </div>
    `;
  }

  show() {
    this.element.classList.remove('hidden');
  }

  hide() {
    this.element.classList.add('hidden');
  }

  update(mix, currentIngredientId) {
    const container = this.element.querySelector('#pour-ingredients');
    const total = Object.values(mix).reduce((s, v) => s + v, 0);
    const entries = Object.entries(mix).filter(([, v]) => v > 0);

    container.innerHTML = entries.map(([id, percent]) => {
      const ing = INGREDIENTS[id];
      if (!ing) return '';
      const isCurrent = id === currentIngredientId;
      return `
        <div class="pour-row ${isCurrent ? 'pour-row-active' : ''}">
          <span class="pour-ing-name">${ing.name}</span>
          <div class="pour-ing-bar">
            <div class="pour-ing-fill" style="width:${Math.min(percent, 100)}%;background:${this.colorToCSS(ing.color)}"></div>
          </div>
          <span class="pour-ing-value">${percent.toFixed(1)}%</span>
        </div>
      `;
    }).join('');

    const totalFill = this.element.querySelector('#pour-total-fill');
    const totalValue = this.element.querySelector('#pour-total-value');
    if (totalFill) totalFill.style.width = `${Math.min(total, 100)}%`;
    if (totalValue) totalValue.textContent = `${total.toFixed(1)}%`;
  }

  colorToCSS(colorHex) {
    const r = (colorHex >> 16) & 0xff;
    const g = (colorHex >> 8) & 0xff;
    const b = colorHex & 0xff;
    return `rgb(${r},${g},${b})`;
  }

  bindReset(callback) {
    this.element.querySelector('#pour-reset').addEventListener('click', callback);
  }

  bindServe(callback) {
    this.element.querySelector('#pour-serve').addEventListener('click', callback);
  }
}
