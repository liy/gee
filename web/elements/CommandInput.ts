export class CommandInput extends HTMLInputElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const input = document.getElementById('command-input') as HTMLInputElement;
    input.addEventListener('keydown', async (e: KeyboardEvent) => {
      if (e.key == 'Enter') {
        // this.exec(input.value);
        this.dispatchEvent(new CustomEvent('input.command', { detail: input.value }));
        input.value = '';
      }
    });
  }
}

customElements.define('command-input', CommandInput, { extends: 'input' });
