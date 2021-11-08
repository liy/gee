import { LayoutResult } from '../layouts/StraightLayout';
import Node from '../graph/Node';
import CommitElement from './CommitElement';
import EventEmitter from '../EventEmitter';
import Repository from '../git/Repository';
import { Hash } from '../@types/window';
import { Commit__Output } from 'protobuf/pb/Commit';

class CommitManager extends EventEmitter {
  elements: Array<CommitElement>;

  commits!: Map<Hash, Commit__Output>;

  nodes!: Array<Node>;

  container: HTMLElement;

  selectedCommit: CommitElement | undefined;

  map: Map<string, CommitElement>;

  initialized: boolean;

  repository!: Repository;

  constructor() {
    super();

    this.initialized = false;

    this.commits = new Map<string, Commit__Output>();
    this.map = new Map<string, CommitElement>();
    this.elements = new Array<CommitElement>();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.container = document.getElementById('commits')!;
  }

  init(layoutResult: LayoutResult, repo: Repository) {
    this.nodes = layoutResult.nodes;
    this.repository = repo;

    if (this.initialized) {
      this.container.innerHTML = '';
    } else {
      for (let i = 0; i < repo.commits.length; ++i) {
        this.commits.set(repo.commits[i].hash, repo.commits[i]);
      }
      document.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    for (let i = 0; i < repo.commits.length; ++i) {
      const node = this.nodes[i];

      this.append(node, this.commits.get(node.hash));
    }

    this.initialized = true;
  }

  append(node: Node, commit: Commit__Output | undefined): CommitElement {
    const references = this.repository.getReferences(node.hash);
    const commitElement = new CommitElement(node, commit, references);
    this.container.appendChild(commitElement.element);
    this.map.set(node.hash, commitElement);

    return commitElement;
  }

  prepend(node: Node, commit: Commit__Output): CommitElement {
    const references = this.repository.getReferences(node.hash);
    const commitElement = new CommitElement(node, commit, references);
    this.container.prepend(commitElement.element);
    this.map.set(node.hash, commitElement);

    return commitElement;
  }

  remove(hash: Hash): boolean {
    const commitElement = this.map.get(hash);
    if (commitElement) {
      this.container.removeChild(commitElement.element);
      this.map.delete(hash);
      return true;
    }
    return false;
  }

  onKeyDown(e: KeyboardEvent) {
    const index = parseInt(e.key) - 1;
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
