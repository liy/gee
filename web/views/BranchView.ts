import { BranchData } from '../commands/branch';
import { Branch } from '../elements/Branch';
import { ViewBase } from './ViewBase';

export class BranchView extends ViewBase {
  constructor() {
    super();

    this.title = 'branch';
    this.heading.textContent = this.title;
    this.content.classList.add('content-flex');
  }

  update(data: BranchData[]) {
    for (const d of data) {
      const branch = document.createElement('git-branch') as Branch;
      branch.update(d);
      this.content.appendChild(branch);
    }
  }

  connectedCallback() {}

  disconnectedCallback() {}
}

customElements.define('branch-view', BranchView, { extends: 'div' });
