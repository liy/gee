import { ViewBase } from '../ViewBase';

export class SimpleView extends ViewBase {
  constructor() {
    super();

    this.title = 'simple';
    this.heading.textContent = this.title;
  }

  update(text: string, cmd: string) {
    this.heading.textContent = cmd;
    this.content.innerText = text;
  }

  connectedCallback() {}

  disconnectedCallback() {}
}

customElements.define('simple-view', SimpleView, { extends: 'div' });
