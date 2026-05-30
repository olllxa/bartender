import { INGREDIENTS } from '../data/ingredients.js';

export class ResultPanel {
  constructor() {
    this.element = null;
    this.build();
  }

  build() {
    this.element = document.createElement('div');
    this.element.className = 'result-panel hidden';
    this.element.innerHTML = `
      <div class="result-backdrop"></div>
      <div class="result-card">
        <div class="result-icon" id="result-icon">✅</div>
        <div class="result-title" id="result-title">Правильно!</div>
        <div class="result-subtitle" id="result-subtitle"></div>
        <div class="result-details" id="result-details"></div>
        <button class="result-btn" id="result-continue">Продолжить</button>
      </div>
    `;
  }

  show(result, cocktail) {
    this.element.classList.remove('hidden');
    const icon = this.element.querySelector('#result-icon');
    const title = this.element.querySelector('#result-title');
    const subtitle = this.element.querySelector('#result-subtitle');
    const details = this.element.querySelector('#result-details');
    const btn = this.element.querySelector('#result-continue');

    if (result.correct) {
      icon.textContent = '✅';
      title.textContent = 'Правильно!';
      subtitle.innerHTML = `Коктейль <strong>${cocktail.name}</strong> приготовлен верно`;
      details.innerHTML = '<div class="result-good">+1 к прогрессу уровня</div>';
    } else {
      icon.textContent = '❌';
      title.textContent = 'Неправильно!';
      subtitle.innerHTML = `Ошибки в коктейле <strong>${cocktail.name}</strong>:`;
      details.innerHTML = result.details.map(d => {
        const ing = INGREDIENTS[d.id];
        const name = ing ? ing.name : d.id;
        return `<div class="result-detail-row">
          <span class="result-detail-name">${name}</span>
          <span class="result-detail-wrong">${d.actual.toFixed(1)}%</span>
          <span class="result-detail-arrow">→</span>
          <span class="result-detail-expected">${d.expected}%</span>
          <span class="result-detail-diff ${d.diff > 5 ? 'result-diff-bad' : 'result-diff-good'}">${d.diff > 0 ? '+' : ''}${d.diff.toFixed(1)}%</span>
        </div>`;
      }).join('');
      details.innerHTML += '<div class="result-bad">-1 к прогрессу уровня</div>';
    }

    return new Promise(resolve => {
      const done = () => {
        document.removeEventListener('keydown', onKey);
        this.hide();
        resolve();
      };
      const onKey = (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); done(); }
      };
      document.addEventListener('keydown', onKey);
      btn.onclick = done;
    });
  }

  hide() {
    this.element.classList.add('hidden');
  }
}
