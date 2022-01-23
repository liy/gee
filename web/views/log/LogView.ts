import { appStore } from '../../appStore';
import { Commit } from '../../components/Commit';
import Graph from '../../graph/Graph';
import GraphStore from '../../graph/GraphStore';
import StraightLayout from '../../layouts/StraightLayout';
import { SelectLog, Update } from './actions';
import GraphStyle from './GraphStyle';
import GraphView from './GraphView';
import './LogView.css';
import template from './LogView.html';
import { State, store } from './store';

export class LogView extends HTMLElement {
  private unsubscribe: (() => void) | undefined;

  elements: Array<Commit>;

  scrollbar: HTMLElement;

  table: HTMLElement;

  scrollElement: HTMLElement;

  numRows: number = 0;

  startIndex: number = 0;

  graph: Graph;

  protected _selectedCommit: Commit | null = null;

  constructor() {
    super();

    this.innerHTML = template;

    this.title = 'log';
    this.classList.add('log-view');

    this.elements = new Array<Commit>();

    this.scrollbar = this.querySelector('.scrollbar-y')!;
    this.table = this.querySelector('#commit-table')!;
    this.table.style.transform = 'translate(0px)';
    this.scrollElement = this.scrollbar.querySelector<HTMLElement>('.scroll-content')!;
    this.graph = GraphStore.getGraph(appStore.currentState.workingDirectory);

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
    this.focusCommit = this.focusCommit.bind(this);
    this.clearSelection = this.clearSelection.bind(this);

    this.scrollbar.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });

    this.unsubscribe = store.subscribe(this);
  }
  /**
   * Update elements with commit data
   */
  update(action: Update, _: State) {
    // this.map.clear();
    // for (const log of action.logs) {
    //   this.map.set(log.hash, log);
    // }

    this.graph = GraphStore.getGraph(appStore.currentState.workingDirectory);
    this.graph.clear();
    for (const log of this.logs) {
      this.graph.createNode(log.hash, log.parents);
    }

    const layout = new StraightLayout(this.graph);
    GraphView.display(layout.process());

    this.populate();
  }

  selectLog(action: SelectLog, state: State) {
    const node = this.graph.getNode(action.log.hash);
    this.scrollView(node.y);

    for (let i = this.startIndex; i < this.numRows; ++i) {
      if (i < this.elements.length) {
        const element = this.elements[i];
        element.setSelection(store.currentState.selectedLog?.hash === this.logs[i].hash);
      }
    }
  }

  private focusCommit(e: CustomEvent) {
    // const log = this.map.get(e.detail.hash);
    const index = store.currentState.map.get(e.detail.hash);
    if (index) {
      store.operate({
        type: 'selectLog',
        log: store.currentState.logs[index],
      });
    }
  }

  /**
   * Layout commit DOM elements
   */
  private layout() {
    this.numRows = Math.ceil(window.innerHeight / GraphStyle.sliceHeight) + 1;

    const limit = Math.max(this.numRows, this.elements.length);
    for (let i = 0; i < limit; ++i) {
      if (i >= this.elements.length) {
        const ce = document.createElement('div', { is: 'git-commit' }) as Commit;
        this.elements.push(ce);
        this.table.appendChild(ce);

        ce.addEventListener('click', (e) => {
          this.clearSelection();
          ce.setSelection(true);
        });
      }

      if (i >= this.numRows) {
        const ce = this.elements.pop();
        ce?.remove();
      }
    }
  }

  private populate() {
    this.startIndex = Math.floor(
      (this.scrollbar.scrollTop + this.table.getBoundingClientRect().y) / GraphStyle.sliceHeight
    );

    this.scrollElement.style.height = GraphStyle.sliceHeight * this.logs.length + 'px';

    for (let i = 0, ii = this.startIndex; i < this.numRows; ++i, ++ii) {
      if (i < this.elements.length) {
        const element = this.elements[i];
        if (ii < this.logs.length) {
          const branches = store.currentState.branches.get(this.logs[ii].hash) || [];
          const tags = store.currentState.tags.get(this.logs[ii].hash) || [];
          element.update(
            this.logs[ii],
            [...branches, ...tags],
            store.currentState.selectedLog?.hash === this.logs[ii].hash
          );
        }
      }
    }
  }

  get logs() {
    return store.currentState.logs;
  }

  connectedCallback() {
    // 2 extra rows for top and bottom, so smooth scroll display commit outside of the viewport
    this.numRows = Math.ceil(window.innerHeight / GraphStyle.sliceHeight) + 1;
    this.scrollElement.style.height = GraphStyle.sliceHeight * this.logs.length + 'px';

    document.addEventListener('hash.clicked', this.focusCommit);
    document.addEventListener('reference.clicked', this.focusCommit);
    // document.addEventListener('commit.clicked', this.clearSelection);

    this.layout();
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.scrollbar.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);

    document.removeEventListener('hash.clicked', this.focusCommit);
    document.removeEventListener('reference.clicked', this.focusCommit);
    // document.removeEventListener('commit.clicked', this.clearSelection);
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

  protected clearSelection() {
    for (const element of this.elements) {
      element.setSelection(false);
    }
  }

  onResize() {
    this.layout();
    this.populate();
  }

  onScroll(e: Event) {
    this.table.style.top = `${-(this.scrollbar.scrollTop % GraphStyle.sliceHeight)}px`;
    this.populate();
  }

  scrollView(index: number) {
    this.scrollbar.scrollTop = GraphStyle.sliceHeight * index;
  }
}

customElements.define('log-view', LogView, { extends: 'main' });
