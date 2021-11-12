import { LayoutResult } from '../layouts/StraightLayout';
import Node from '../graph/Node';
import CommitElement from './CommitElement';
import EventEmitter from '../EventEmitter';
import Repository from '../git/Repository';
import { Hash } from '../@types/window';
import { Commit__Output } from 'protobuf/pb/Commit';
import './table.css';

// class CommitElementPool {
//   private pool: Array<CommitElement>;

//   constructor() {
//     this.pool = new Array<CommitElement>();
//   }

//   getElement() {
//     if (this.pool.length === 0) {
//       return new CommitElement();
//     }

//     return this.pool.pop()!;
//   }

//   putElement(element: CommitElement) {
//     this.pool.push(element);
//   }
// }

class CommitManager extends EventEmitter {
  elements: Array<CommitElement>;

  tableBody: HTMLElement;

  selectedCommit: CommitElement | undefined;

  map: Map<string, CommitElement>;

  repository!: Repository;

  mainElement: HTMLElement;

  table: HTMLTableElement;

  scrollElement: HTMLElement;

  numRows: number = 0;

  startIndex: number = 0;

  // pool: CommitElementPool;

  constructor() {
    super();

    // this.pool = new CommitElementPool();

    this.map = new Map<string, CommitElement>();
    this.elements = new Array<CommitElement>();

    this.mainElement = document.getElementById('main')!;
    this.table = this.mainElement.getElementsByTagName('table')[0];
    this.scrollElement = this.mainElement.querySelector<HTMLElement>('.scroll-content')!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.tableBody = document.querySelector('#main table tbody')!;

    this.mainElement.addEventListener('scroll', this.onScroll.bind(this), { passive: false });

    this.startIndex = Math.floor(this.mainElement.scrollTop / 24);

    window.addEventListener('resize', this.onResize.bind(this));
  }

  display(layoutResult: LayoutResult, repo: Repository) {
    this.repository = repo;
    const nodes = layoutResult.nodes;
    // 2 extra rows for top and bottom, so smooth scroll display commit outside of the viewport
    this.numRows = Math.floor(window.innerHeight / 24) + 2;
    this.scrollElement.style.height = 24 * this.repository.commits.length + 'px';

    const canvas = this.mainElement.querySelector<HTMLCanvasElement>('.graph')!;
    this.table.style.left = canvas.width + 'px';

    this.clear();
    this.layout();

    for (let i = 0, ii = this.startIndex; i < this.numRows; ++i, ++ii) {
      if (i < this.elements.length - 1) {
        const commitElement = this.elements[i];
        commitElement.update(this.repository.commits[ii]);
      }
    }
  }

  layout() {
    this.numRows = Math.floor(window.innerHeight / 24) + 2;

    const limit = Math.max(this.numRows, this.elements.length);
    for (let i = 0; i < limit; ++i) {
      if (i >= this.elements.length) {
        const ce = new CommitElement();
        this.elements.push(ce);
        this.tableBody.appendChild(ce.element);
      }
    }
  }

  onResize() {
    // this.layout();
  }

  clear() {
    for (const element of this.elements) {
      element.clear();
    }
  }

  onScroll(e: Event) {
    e.preventDefault();

    this.table.style.top = -(this.mainElement.scrollTop % 24) + 'px';

    this.startIndex = Math.floor(this.mainElement.scrollTop / 24);
    for (let i = 0, ii = this.startIndex; i < this.numRows; ++i, ++ii) {
      const commitElement = this.elements[i];
      if (this.repository.commits[ii]) commitElement.update(this.repository.commits[ii]);
    }
  }
}

export default new CommitManager();
