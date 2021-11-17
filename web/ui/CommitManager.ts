import { LayoutResult } from '../layouts/StraightLayout';
import Node from '../graph/Node';
import CommitElement from './CommitElement';
import EventEmitter from '../EventEmitter';
import Repository from '../git/Repository';
import { Hash } from '../@types/window';
import { Commit__Output } from 'protobuf/pb/Commit';
import './table.css';
import GraphStyle from './GraphStyle';

class CommitManager extends EventEmitter {
  elements: Array<CommitElement>;

  selectedCommit: CommitElement | undefined;

  repository!: Repository;

  scrollbar: HTMLElement;

  table: HTMLElement;

  scrollElement: HTMLElement;

  numRows: number = 0;

  startIndex: number = 0;

  constructor() {
    super();

    this.elements = new Array<CommitElement>();

    this.scrollbar = document.querySelector('.scrollbar-y')!;
    this.table = document.getElementById('commit-table')!;
    this.scrollElement = this.scrollbar.querySelector<HTMLElement>('.scroll-content')!;

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  display(layoutResult: LayoutResult, repo: Repository) {
    this.repository = repo;
    // 2 extra rows for top and bottom, so smooth scroll display commit outside of the viewport
    this.numRows = Math.floor(window.innerHeight / GraphStyle.sliceHeight) + 2;
    this.scrollElement.style.height = GraphStyle.sliceHeight * this.repository.commits.length + 'px';

    this.clear();
    this.layout();
    this.update();

    this.scrollbar.removeEventListener('scroll', this.onScroll);
    this.scrollbar.addEventListener('scroll', this.onScroll, { passive: true });
    window.removeEventListener('resize', this.onResize);
    window.addEventListener('resize', this.onResize, { passive: true });
  }

  /**
   * Layout commit elements
   */
  layout() {
    this.numRows = Math.floor(window.innerHeight / GraphStyle.sliceHeight) + 2;

    const limit = Math.max(this.numRows, this.elements.length);
    for (let i = 0; i < limit; ++i) {
      if (i >= this.elements.length) {
        const ce = new CommitElement();
        this.elements.push(ce);
        this.table.appendChild(ce.element);
      }

      if (i >= this.numRows) {
        const ce = this.elements.pop();
        ce?.element.remove();
      }
    }
  }

  /**
   * Update elements with commit data
   */
  update() {
    this.startIndex = Math.floor(this.scrollbar.scrollTop / GraphStyle.sliceHeight);
    for (let i = 0, ii = this.startIndex; i < this.numRows; ++i, ++ii) {
      if (i < this.elements.length - 1) {
        const commitElement = this.elements[i];
        if (ii < this.repository.commits.length) commitElement.update(this.repository.commits[ii]);
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
    // Update table position to fake scrolling
    // this.table.style.transform = `translateY(${
    //   -window.innerHeight - (this.scrollbar.scrollTop % GraphStyle.sliceHeight)
    // }px)`;
    this.table.style.transform = `translateY(${-(this.scrollbar.scrollTop % GraphStyle.sliceHeight)}px)`;

    this.update();
  }
}

export default new CommitManager();
