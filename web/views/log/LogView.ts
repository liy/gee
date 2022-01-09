import GraphStore from '../../graph/GraphStore';
import StraightLayout from '../../layouts/StraightLayout';
import GraphStyle from '../../ui/GraphStyle';
import { ViewBase } from '../ViewBase';
import GraphView from './GraphView';
import { LogEntry, store } from './store';
import { log } from './subroutines';
import template from './LogView.html';
import Graph from '../../graph/Graph';
import { Commit } from '../../components/Commit';
import './table.css';

export class LogView extends ViewBase {
  private cleanup: (() => void) | undefined;

  elements: Array<Commit>;

  selectedCommit: LogEntry | undefined;

  scrollbar: HTMLElement;

  table: HTMLElement;

  scrollElement: HTMLElement;

  numRows: number = 0;

  startIndex: number = 0;

  constructor() {
    super();

    this.innerHTML = template;

    this.title = 'log';
    this.heading.textContent = this.title;

    this.elements = new Array<Commit>();

    this.scrollbar = this.querySelector('.scrollbar-y')!;
    this.table = this.querySelector('#commit-table')!;
    this.table.style.transform = 'translate(0px)';
    this.scrollElement = this.scrollbar.querySelector<HTMLElement>('.scroll-content')!;

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  display(graph: Graph, logs: Array<LogEntry>) {
    // 2 extra rows for top and bottom, so smooth scroll display commit outside of the viewport
    this.numRows = Math.ceil(window.innerHeight / GraphStyle.sliceHeight) + 1;
    this.scrollElement.style.height = GraphStyle.sliceHeight * logs.length + 'px';

    this.clear();
    this.layout();
    this.update();

    this.scrollbar.removeEventListener('scroll', this.onScroll);
    this.scrollbar.addEventListener('scroll', this.onScroll, { passive: true });
    window.removeEventListener('resize', this.onResize);
    window.addEventListener('resize', this.onResize, { passive: true });

    document.addEventListener('commit.focus', (e) => {
      const node = graph.getNode(e.detail);
      this.scrollView(node.y);
    });
  }

  /**
   * Update elements with commit data
   */
  update() {
    this.startIndex = Math.floor(
      (this.scrollbar.scrollTop + this.table.getBoundingClientRect().y) / GraphStyle.sliceHeight
    );

    const logs = store.currentState.logs;

    for (let i = 0, ii = this.startIndex; i < this.numRows; ++i, ++ii) {
      if (i < this.elements.length) {
        const node = this.elements[i];
        if (ii < logs.length) node.update(logs[ii]);
      }
    }
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

  async connectedCallback() {
    await store.invoke(log());
    this.cleanup = store.on({
      update: (_, state) => {
        this.update();
      },
    });

    // const logs = store.currentState.logs;

    // this.numRows = Math.ceil(window.innerHeight / GraphStyle.sliceHeight) + 1;
    // this.scrollElement.style.height = GraphStyle.sliceHeight * logs.length + 'px';

    // const graph = GraphStore.createGraph('test');
    // for (const entry of logs) {
    //   graph.createNode(entry.hash, entry.parents);
    // }

    // const layout = new StraightLayout(graph);
    // const result = layout.process();
    // GraphView.display(result);

    // this.clear();
    // this.layout();
    // this.update();

    // this.scrollbar.removeEventListener('scroll', this.onScroll);
    // this.scrollbar.addEventListener('scroll', this.onScroll, { passive: true });
    // window.removeEventListener('resize', this.onResize);
    // window.addEventListener('resize', this.onResize, { passive: true });

    // document.addEventListener('commit.focus', (e) => {
    //   const node = graph.getNode(e.detail);
    //   this.scrollView(node.y);
    // });

    const logs = store.currentState.logs;

    const graph = GraphStore.createGraph('test');
    for (const entry of logs) {
      graph.createNode(entry.hash, entry.parents);
    }

    const layout = new StraightLayout(graph);
    const result = layout.process();
    GraphView.display(result);
    this.display(graph, logs);
  }

  disconnectedCallback() {
    this.cleanup?.();
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

  scrollView(index: number) {
    this.scrollbar.scrollTop = GraphStyle.sliceHeight * index;
  }
}

customElements.define('log-view', LogView, { extends: 'div' });
