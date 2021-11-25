import './CommandInput.css';

export class CommandInput extends HTMLInputElement {
  constructor() {
    super();
  }

  connectedCallback() {
    document.addEventListener('keydown', async (e: KeyboardEvent) => {
      if (e.key == 'p' && e.ctrlKey) {
        this.style.display = this.style.display !== 'block' ? 'block' : 'none';
        this.focus();
      }
    });

    this.addEventListener('keydown', async (e: KeyboardEvent) => {
      if (e.key == 'Enter') {
        this.style.display = 'none';
      }
    });
  }
}

customElements.define('command-input', CommandInput, { extends: 'input' });
