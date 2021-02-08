import { LayoutResultPod } from '../layouts/StraightLayout';
import { NodePod } from '../Node';
import { CommitPod } from '../../src/app';
import CommitElement from './CommitElement';
import EventEmitter from '../EventEmitter';

class CommitManager extends EventEmitter {
  elements: Array<CommitElement>;

  commits!: Array<CommitPod>;

  nodes!: Array<NodePod>;

  container: HTMLElement;

  selectedCommit: CommitElement | undefined;

  map: Map<string, CommitElement>;

  constructor() {
    super();

    this.map = new Map<string, CommitElement>();
    this.elements = new Array<CommitElement>();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.container = document.getElementById('commits')!;
  }

  init(layoutResult: LayoutResultPod, commits: Array<CommitPod>) {
    this.nodes = layoutResult.nodes;
    this.commits = commits;
    for (let i = 0; i < commits.length; ++i) {
      const commitPod = this.commits[i];
      const nodePod = this.nodes[i];
      this.createElement(nodePod, commitPod);
    }

    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  onKeyDown(e: KeyboardEvent) {
    const index = parseInt(e.key);
    if (!isNaN(index) && this.selectedCommit) {
      const elm = this.selectedCommit.getParent(index);
      if (elm) {
        this.selectCommit(elm);
      }
    }
  }

  selectCommit(commitElement: CommitElement) {
    let previousIndex;
    if (this.selectedCommit) {
      this.selectedCommit.selected = false;
      previousIndex = this.selectedCommit.node.y;
    }
    this.selectedCommit = commitElement;
    this.selectedCommit.selected = true;

    this.emit('selected', {
      previousIndex,
      index: this.selectedCommit.node.y,
    });
  }

  createElement(nodePod: NodePod, commitPod: CommitPod): CommitElement {
    const commitElement = new CommitElement(nodePod, commitPod);
    this.container.appendChild(commitElement.element);
    this.map.set(commitPod.hash, commitElement);
    return commitElement;
  }

  getCommitElement(hash: string) {
    return this.map.get(hash);
  }
}

export default new CommitManager();
