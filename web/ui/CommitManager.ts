import { LayoutResult } from '../layouts/StraightLayout';
import Node from '../graph/Node';
import { CommitPod, RefPod } from '../../src/app';
import CommitElement from './CommitElement';
import EventEmitter from '../EventEmitter';
import { Hash } from '../graph/Graph';

class CommitManager extends EventEmitter {
  elements: Array<CommitElement>;

  commits!: Map<string, CommitPod>;

  nodes!: Array<Node>;

  container: HTMLElement;

  selectedCommit: CommitElement | undefined;

  map: Map<string, CommitElement>;

  initialized: boolean;

  constructor() {
    super();

    this.initialized = false;

    this.commits = new Map<string, CommitPod>();
    this.map = new Map<string, CommitElement>();
    this.elements = new Array<CommitElement>();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.container = document.getElementById('commits')!;
  }

  init(layoutResult: LayoutResult, commits: Array<CommitPod>, refMap: Map<Hash, Array<RefPod>>) {
    this.nodes = layoutResult.nodes;

    if (this.initialized) {
      this.container.innerHTML = '';
    } else {
      for (let i = 0; i < commits.length; ++i) {
        this.commits.set(commits[i].hash, commits[i]);
      }
      document.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    for (let i = 0; i < commits.length; ++i) {
      const node = this.nodes[i];
      const commitPod = this.commits.get(node.hash);
      this.createElement(node, commitPod, refMap);
    }

    this.initialized = true;
  }
  createElement(node: Node, commitPod: CommitPod | undefined, refMap: Map<Hash, Array<RefPod>>): CommitElement {
    const commitElement = new CommitElement(node, commitPod);
    this.container.appendChild(commitElement.element);
    this.map.set(node.hash, commitElement);

    const refs = refMap.get(node.hash);
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
