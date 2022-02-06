import { ViewBase } from '../ViewBase';

export class PushView extends ViewBase {
  constructor() {
    super();

    this.title = 'push';
    this.heading.textContent = this.title;
  }

  update(text: string) {
    this.content.textContent = text;
  }

  connectedCallback() {}

  disconnectedCallback() {}
}

customElements.define('push-view', PushView, { extends: 'div' });
