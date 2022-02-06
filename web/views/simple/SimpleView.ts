import { ViewBase } from '../ViewBase';

export class SimpleView extends ViewBase {
  constructor() {
    super();

    this.title = 'simple';
    this.heading.textContent = this.title;
  }

  update(text: string) {
    this.content.textContent = text;
  }

  connectedCallback() {}

  disconnectedCallback() {}
}

customElements.define('simple-view', SimpleView, { extends: 'div' });
