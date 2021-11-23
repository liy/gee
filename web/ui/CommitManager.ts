import { LayoutResult } from '../layouts/StraightLayout';
import Node from '../graph/Node';
import CommitElement from './CommitElement';
import EventEmitter from '../EventEmitter';
import Repository from '../git/Repository';
import { Hash } from '../@types/window';
import { Commit__Output } from 'protobuf/pb/Commit';
import './table.css';
import GraphStyle from './GraphStyle';
import { TagData } from '../commands/tag';
import Graph from '../graph/Graph';

class CommitManager extends EventEmitter {
  elements: Array<CommitElement>;

  selectedCommit: CommitElement | undefined;

  repository!: Repository;

  scrollbar: HTMLElement;

  table: HTMLElement;

  scrollElement: HTMLElement;

  numRows: number = 0;

  startIndex: number = 0;

  consoleElement: HTMLElement;

  constructor() {
    super();

    this.elements = new Array<CommitElement>();

    this.scrollbar = document.querySelector('.scrollbar-y')!;
    this.table = document.getElementById('commit-table')!;
    this.table.style.transform = 'translate(0px)';
    this.scrollElement = this.scrollbar.querySelector<HTMLElement>('.scroll-content')!;

    this.consoleElement = document.getElementById('console')!;

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  display(layoutResult: LayoutResult, repo: Repository, graph: Graph) {
    this.repository = repo;
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

    document.addEventListener('tag-click', (e: CustomEvent<TagData>) => {
      const node = graph.getNode(e.detail.targetHash);
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
    this.startIndex = Math.floor(
      (this.scrollbar.scrollTop + this.table.getBoundingClientRect().y) / GraphStyle.sliceHeight
    );
    for (let i = 0, ii = this.startIndex; i < this.numRows; ++i, ++ii) {
      if (i < this.elements.length) {
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
    this.table.style.top = `${-(this.scrollbar.scrollTop % GraphStyle.sliceHeight)}px`;

    this.update();
  }

  scroll(index: number) {
    this.scrollbar.scrollTop = GraphStyle.sliceHeight * index;
  }
}

export default new CommitManager();
