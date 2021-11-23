import { DataElement } from '../@types/window';
import { TagData } from '../commands/tag';
import './Tag.css';

export class CommitTag<T extends TagData> extends HTMLElement implements DataElement<T> {
  _data!: T;

  constructor() {
    super();
  }

  set data(data: T) {
    this._data = data;
    // this.setAttribute('target-hash', data.targetHash);
    // this.setAttribute('hash', data.hash);
    this.textContent = data.shorthand;
  }

  get data(): T {
    return this._data;
  }

  onClick(e: MouseEvent) {
    this.dispatchEvent(new CustomEvent<T>('tag-click', { bubbles: true, detail: { ...this._data } }));
  }

  connectedCallback() {
    this.addEventListener('click', this.onClick, true);
  }
}

customElements.define('commit-tag', CommitTag);
