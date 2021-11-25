import { BranchData } from '../commands/branch';
import { Branch } from '../elements/Branch';

export class BranchView extends HTMLElement {
  constructor() {
    super();
  }

  update(data: BranchData[]) {
    this.classList.add('flex-view', 'view');
    for (const d of data) {
      const branch = document.createElement('git-branch') as Branch;
      branch.update(d);
      this.appendChild(branch);
    }
  }

  connectedCallback() {}

  disconnectedCallback() {}
}

customElements.define('branch-view', BranchView);
