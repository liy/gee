import { LayoutResultPod } from '../layouts/StraightLayout';
import { NodePod } from '../Node';
import { CommitPod, RefPod } from '../../src/app';
import CommitElement from './CommitElement';
import EventEmitter from '../EventEmitter';
import { Hash } from 'Graph';

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

  init(layoutResult: LayoutResultPod, commits: Array<CommitPod>, refMap: Map<Hash, Array<RefPod>>) {
    this.nodes = layoutResult.nodes;
    this.commits = commits;
    for (let i = 0; i < commits.length; ++i) {
      const commitPod = this.commits[i];
      const nodePod = this.nodes[i];
      this.createElement(nodePod, commitPod, refMap);
    }

    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  update(layoutResult: LayoutResultPod, commits: Array<CommitPod>, refMap: Map<Hash, Array<RefPod>>) {
    this.container.innerHTML = '';

    this.nodes = layoutResult.nodes;
    this.commits = commits;
    for (let i = 0; i < commits.length; ++i) {
      const commitPod = this.commits[i];
      const nodePod = this.nodes[i];
      this.createElement(nodePod, commitPod, refMap);
    }
  }

  createElement(nodePod: NodePod, commitPod: CommitPod, refMap: Map<Hash, Array<RefPod>>): CommitElement {
    const commitElement = new CommitElement(nodePod, commitPod);
    this.container.appendChild(commitElement.element);
    this.map.set(commitPod.hash, commitElement);

    const refs = refMap.get(commitPod.hash);
    if (refs) {
      for (const ref of refs) {
        commitElement.addRef(ref);
      }
    }

    return commitElement;
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

  getCommitElement(hash: string) {
    return this.map.get(hash);
  }
}

export default new CommitManager();
