export class OrderPanel {
  constructor() {
    this.element = null;
    this.build();
  }

  build() {
    this.element = document.createElement('div');
    this.element.className = 'order-panel hidden';
    this.element.innerHTML = `
      <div class="order-header">ЗАКАЗ</div>
      <div class="order-divider"></div>
      <div class="order-name" id="order-name">—</div>
      <div class="order-hint">Налейте [Reticle] и подайте [E]</div>
    `;
  }

  show() {
    this.element.classList.remove('hidden');
  }

  hide() {
    this.element.classList.add('hidden');
  }

  setOrder(cocktail) {
    this.element.querySelector('#order-name').textContent = cocktail ? cocktail.name : '—';
  }
}
