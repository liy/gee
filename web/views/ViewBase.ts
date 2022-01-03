export class ViewBase extends HTMLDivElement {
  protected heading: HTMLHeadingElement;
  protected content: HTMLDivElement;
  constructor() {
    super();

    this.classList.add('view');

    this.heading = document.createElement('h3');
    this.appendChild(this.heading);

    this.content = document.createElement('div');
    this.content.classList.add('content');
    this.appendChild(this.content);
  }

  clearContent() {
    this.content.replaceChildren();
  }
}

customElements.define('view-base', ViewBase, { extends: 'div' });
