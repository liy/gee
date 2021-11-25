import { TagData } from '../commands/tag';

export class CommitTag extends HTMLElement {
  _data!: TagData;

  constructor() {
    super();
  }

  update(data: TagData) {
    this.classList.add('reference');
    this._data = data;
    this.textContent = data.shorthand;
  }

  onClick(e: MouseEvent) {
    this.dispatchEvent(new CustomEvent('commit.focus', { bubbles: true, detail: this._data.targetHash }));
  }

  connectedCallback() {
    this.addEventListener('click', this.onClick, true);
  }
}

customElements.define('commit-tag', CommitTag);
