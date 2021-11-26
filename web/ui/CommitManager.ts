import { LayoutResult } from '../layouts/StraightLayout';
// import CommitElement from './CommitElement';
import Repository from '../git/Repository';
import './table.css';
import GraphStyle from './GraphStyle';
import Graph from '../graph/Graph';
import EventEmitter from '../EventEmitter';
import { EventMap } from '../@types/event';
import { Commit } from '../elements/Commit';
import { Tag__Output } from 'protobuf/pb/Tag';
import { Reference__Output } from 'protobuf/pb/Reference';
import { Hash } from '../@types/window';

class CommitManager extends EventEmitter<EventMap> {
  elements: Array<Commit>;

  selectedCommit: Commit | undefined;

  repository!: Repository;

  scrollbar: HTMLElement;

  table: HTMLElement;

  scrollElement: HTMLElement;

  numRows: number = 0;

  startIndex: number = 0;

  private graph!: Graph;

  constructor() {
    super();

    this.elements = new Array<Commit>();

    this.scrollbar = document.querySelector('.scrollbar-y')!;
    this.table = document.getElementById('commit-table')!;
    this.table.style.transform = 'translate(0px)';
    this.scrollElement = this.scrollbar.querySelector<HTMLElement>('.scroll-content')!;

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  display(layoutResult: LayoutResult, repo: Repository, graph: Graph) {
    this.repository = repo;
    this.graph = graph;
    // 2 extra rows for top and bottom, so smooth scroll display commit outside of the viewport
    this.numRows = Math.ceil(window.innerHeight / GraphStyle.sliceHeight) + 1;
    this.scrollElement.style.height = GraphStyle.sliceHeight * this.repository.commits.length + 'px';

    this.clear();
    this.layout();
    this.update();

    this.scrollbar.removeEventListener('scroll', this.onScroll);
    this.scrollbar.addEventListener('scroll', this.onScroll, { passive: true });
    window.removeEventListener('resize', this.onResize);
    window.addEventListener('resize', this.onResize, { passive: true });

    document.addEventListener('commit.focus', (e) => {
      const node = graph.getNode(e.detail);
      this.scroll(node.y);
    });
  }

  /**
   * Layout commit elements
   */
  layout() {
    this.numRows = Math.ceil(window.innerHeight / GraphStyle.sliceHeight) + 1;

    const limit = Math.max(this.numRows, this.elements.length);
    for (let i = 0; i < limit; ++i) {
      if (i >= this.elements.length) {
        const ce = document.createElement('div', { is: 'git-commit' }) as Commit;
        this.elements.push(ce);
        this.table.appendChild(ce);
      }

      if (i >= this.numRows) {
        const ce = this.elements.pop();
        ce?.remove();
      }
    }
  }

  /**
   * Update elements with commit data
   */
  update() {
    this.startIndex = Math.floor(
      (this.scrollbar.scrollTop + this.table.getBoundingClientRect().y) / GraphStyle.sliceHeight
    );
    for (let i = 0, ii = this.startIndex; i < this.numRows; ++i, ++ii) {
      if (i < this.elements.length) {
        const node = this.elements[i];
        const commit = this.repository.commits[ii];
        const branches = this.repository.getReferences(commit.hash)?.filter((ref) => ref.isBranch) || [];
        const tags = this.repository.getTags(commit.hash) || [];
        if (ii < this.repository.commits.length) node.update(commit, branches, tags, this.graph.getNode(commit.hash));
      }
    }
  }

  /**
   * Clear all commit information from the elements
   */
  clear() {
    // scroll back to the top
    this.scrollbar.scrollTop = 0;

    for (const element of this.elements) {
      element.clear();
    }
  }

  onResize() {
    this.layout();
    this.update();
  }

  onScroll(e: Event) {
    this.table.style.top = `${-(this.scrollbar.scrollTop % GraphStyle.sliceHeight)}px`;

    this.update();
  }

  scroll(index: number) {
    this.scrollbar.scrollTop = GraphStyle.sliceHeight * index;
  }

  getCommitColor(hash: Hash): number {
    const node = this.graph.getNode(hash);
    if (node) {
      return GraphStyle.getLineColour(node.x, false);
    }
    return 0;
  }
}

export default new CommitManager();
