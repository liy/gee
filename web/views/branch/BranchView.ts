import { BranchData } from '../../commands/branch';
import { Branch } from '../../components-old/Branch';
import { ViewBase } from '../ViewBase';
import './BranchView.css';

export class BranchView extends ViewBase {
  constructor() {
    super();

    this.title = 'branch';
    this.heading.textContent = this.title;
    this.content.classList.add('branch-view');
  }

  update(data: BranchData[]) {
    for (const d of data) {
      const branch = document.createElement('git-branch') as Branch;
      branch.update(d);
      // branch.style.color = '#' + CommitManager.getCommitColor(d.hash).toString(16).padStart(6, '0');
      this.content.appendChild(branch);
    }
  }

  connectedCallback() {}

  disconnectedCallback() {}
}

customElements.define('branch-view', BranchView, { extends: 'div' });
