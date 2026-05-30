export class ResultPanel {
  constructor() {
    this.element = null;
    this.build();
  }

  build() {
    this.element = document.createElement('div');
    this.element.className = 'result-notification hidden';
    this.element.innerHTML = `
      <div class="result-notif-icon" id="result-notif-icon"></div>
      <div class="result-notif-text" id="result-notif-text"></div>
    `;
  }

  show(correct) {
    this.element.classList.remove('hidden');
    const icon = this.element.querySelector('#result-notif-icon');
    const text = this.element.querySelector('#result-notif-text');
    if (correct) {
      icon.textContent = '';
      text.textContent = 'Верно! +1 к прогрессу';
      this.element.className = 'result-notification result-correct';
    } else {
      icon.textContent = '';
      text.textContent = 'Ошибка! -1 к прогрессу';
      this.element.className = 'result-notification result-wrong';
    }
    this.element.classList.remove('hidden');

    return new Promise(resolve => {
      let resolved = false;
      const done = () => {
        if (resolved) return;
        resolved = true;
        document.removeEventListener('keydown', onKey);
        this.hide();
        resolve();
      };
      const onKey = (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); done(); }
      };
      document.addEventListener('keydown', onKey);
      setTimeout(done, 2000);
    });
  }

  hide() {
    this.element.classList.add('hidden');
  }
}
