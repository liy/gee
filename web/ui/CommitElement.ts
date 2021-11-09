import Node from '../graph/Node';
import CommitManager from './CommitManager';
import RefLabel from './RefLabel';
import Simulator from '../Simulator';
import { Commit, Commit__Output } from 'protobuf/pb/Commit';
import { Reference__Output } from 'protobuf/pb/Reference';
import './commit.css';

const laneColours = [
  '#f44336',
  '#9c27b0',
  '#2196f3',
  '#00bcd4',
  '#4caf50',
  '#cddc39',
  '#ffc107',
  '#ff5722',
  '#795548',
  '#9e9e9e',
  '#607d8b',
];
const dateFormat = Intl.DateTimeFormat('en-GB', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
});

const timeFormat = Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: 'numeric',
  hour12: false,
});

class CommitElement {
  element: HTMLElement;
  commit: Commit | undefined;
  hash: string | undefined;
  node: Node;

  private _selected: boolean;

  private summaryElement: HTMLElement;
  private hashElement: HTMLElement;
  private authorElement: HTMLElement;
  private dateElement: HTMLElement;
  private timeElement: HTMLElement;

  constructor(node: Node, commit?: Commit__Output, references?: Array<Reference__Output>) {
    this.node = node;
    this.commit = commit;
    this.hash = commit?.hash;
    this._selected = false;

    this.element = document.createElement('tr');
    this.element.className = 'commit';

    this.summaryElement = document.createElement('td');
    this.summaryElement.className = 'summary';
    this.summaryElement.style.minWidth = '550px';
    this.summaryElement.style.maxWidth = '550px';
    this.summaryElement.textContent = commit?.summary?.substr(0, 100) || '';
    this.element.appendChild(this.summaryElement);

    this.hashElement = document.createElement('td');
    this.hashElement.className = 'hash';
    this.hashElement.textContent = commit?.hash?.substr(0, 7) || '';
    this.element.appendChild(this.hashElement);

    this.authorElement = document.createElement('td');
    this.authorElement.className = 'author';
    this.authorElement.textContent = commit?.author?.name || '';
    this.authorElement.style.width = '100px';
    this.element.appendChild(this.authorElement);

    const dateTime = new Date((commit!.commitTime!.seconds as any).low * 1000);
    this.dateElement = document.createElement('td');
    this.dateElement.className = 'date';
    this.dateElement.style.minWidth = '68px';
    this.dateElement.style.maxWidth = '68px';
    this.dateElement.textContent = dateFormat.format(dateTime);
    this.element.appendChild(this.dateElement);

    this.timeElement = document.createElement('td');
    this.timeElement.className = 'time';
    this.timeElement.textContent = timeFormat.format(dateTime);
    this.element.appendChild(this.timeElement);

    // if (references) {
    //   const index = this.node.x % laneColours.length;
    //   for (const ref of references) {
    //     const refElm = new RefLabel(ref, laneColours[index]);
    //     this.element.firstChild?.insertBefore(refElm.element, this.element.firstChild?.firstChild);
    //   }
    // }

    if (Simulator.isSimulated(node.hash)) {
      this.element.style.opacity = '0.5';
    }

    this.element.addEventListener('click', this.onSelect.bind(this));
  }

  set selected(value: boolean) {
    this._selected = value;
    if (!this._selected) {
      this.element.classList.remove('selected');
    } else {
      this.element.classList.add('selected');
    }
  }

  get selected(): boolean {
    return this._selected;
  }

  onSelect(e: MouseEvent): void {
    CommitManager.selectCommit(this);
  }

  getParent(index: number): CommitElement | undefined {
    const parentHash = this.node.parents[index];
    if (parentHash) {
      return CommitManager.getCommitElement(parentHash);
    }
    return undefined;
  }

  update(commit: Commit__Output) {
    this.summaryElement.textContent = commit.summary?.substr(0, 100) || '';

    this.hashElement.textContent = commit.hash?.substr(0, 7) || '';

    this.authorElement.textContent = commit.author?.name || '';

    const dateTime = new Date((commit!.commitTime!.seconds as any).low * 1000);
    this.dateElement.textContent = dateFormat.format(dateTime);

    this.timeElement.textContent = timeFormat.format(dateTime);
  }
}

export default CommitElement;
