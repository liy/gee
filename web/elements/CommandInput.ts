export class CommandInput extends HTMLInputElement {
  constructor() {
    super();
  }

  connectedCallback() {}
}

customElements.define('command-input', CommandInput, { extends: 'input' });
