export class WelcomeScreen {
  constructor(onStart) {
    this.onStart = onStart;
    this.element = null;
    this.build();
  }

  build() {
    this.element = document.createElement('div');
    this.element.className = 'welcome-screen';

    this.element.innerHTML = `
      <div class="welcome-backdrop"></div>
      <div class="welcome-card">
        <div class="welcome-icon">🍸</div>
        <h1 class="welcome-title">Bartender</h1>
        <p class="welcome-subtitle">3D симулятор бара</p>

        <div class="rules-section">
          <h2 class="rules-title">Правила игры</h2>
          <ul class="rules-list">
            <li><strong>WASD</strong> — двигайтесь по бару</li>
            <li><strong>Мышь</strong> — осматривайтесь (нажмите на экран)</li>
            <li><strong>ESC</strong> — открыть меню и кнопки</li>
            <li>Вы — бармен за стойкой. Заказ отображается справа.</li>
            <li>Откройте <strong>Книгу рецептов</strong> (слева вверху), чтобы узнать состав напитка.</li>
            <li>Наведите прицел на бутылку, нажмите и <strong>удерживайте</strong>, чтобы налить в шейкер.</li>
            <li>Добавляйте ингредиенты, пока шейкер не заполнится на 100%.</li>
            <li>Нажмите <strong>«Подать»</strong>, чтобы встряхнуть и подать коктейль.</li>
            <li>Попадите в рецепт с точностью <strong>±5%</strong> — получите +1 к прогрессу уровня.</li>
            <li>Ошибка отнимает один сегмент прогресса.</li>
          </ul>
        </div>

        <button class="start-button">Начать игру</button>
      </div>
    `;

    const startBtn = this.element.querySelector('.start-button');
    startBtn.addEventListener('click', () => {
      this.hide();
      if (this.onStart) this.onStart();
    });
  }

  show() {
    document.getElementById('game-container').appendChild(this.element);
    requestAnimationFrame(() => {
      this.element.classList.add('visible');
    });
  }

  hide() {
    this.element.classList.remove('visible');
    setTimeout(() => {
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }, 400);
  }
}
