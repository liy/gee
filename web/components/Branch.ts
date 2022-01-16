import { BranchData } from '../commands/branch';

export class Branch extends HTMLElement {
  _data!: BranchData;

  constructor() {
    super();
  }

  update(data: BranchData) {
    this.classList.add('reference', 'branch');

    this._data = data;
    this.textContent = data.shorthand;
  }

  onClick(e: MouseEvent) {
    this.dispatchEvent(
      new CustomEvent('reference.clicked', {
        bubbles: true,
        detail: {
          name: this._data.name,
          hash: this._data.hash,
        },
      })
    );
  }

  connectedCallback() {
    this.addEventListener('click', this.onClick, true);
  }
}

customElements.define('git-branch', Branch);
