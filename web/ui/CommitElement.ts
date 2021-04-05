import { NodePod } from '../Node';
import { CommitPod, RefPod } from '../../src/app';
import CommitManager from './CommitManager';
import RefLabel from './RefLabel';

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
  commit: CommitPod;
  hash: string;
  node: NodePod;

  private _selected: boolean;

  constructor(node: NodePod, commitPod: CommitPod) {
    this.node = node;
    this.commit = commitPod;
    this.hash = commitPod.hash;
    this._selected = false;

    const { summary, author, hash, date, time } = commitPod;

    this.element = document.createElement('tr');
    this.element.className = 'commit';

    const summaryElm = document.createElement('td');
    summaryElm.className = 'summary';
    summaryElm.textContent = summary.substr(0, 100);
    this.element.appendChild(summaryElm);

    const hashElm = document.createElement('td');
    hashElm.className = 'hash';
    hashElm.textContent = hash.substr(0, 7);
    this.element.appendChild(hashElm);

    const authorElm = document.createElement('td');
    authorElm.className = 'author';
    authorElm.textContent = author.name;
    this.element.appendChild(authorElm);

    const dateElm = document.createElement('td');
    dateElm.className = 'date';
    dateElm.textContent = dateFormat.format(date);
    this.element.appendChild(dateElm);

    const timeElm = document.createElement('td');
    timeElm.className = 'time';
    timeElm.textContent = timeFormat.format(time);
    this.element.appendChild(timeElm);

    this.element.addEventListener('click', this.onSelect.bind(this));
  }

  addRef(ref: RefPod): void {
    // FIXME: fix it by convert it to RGB
    const index = this.node.x % laneColours.length;
    const refElm = new RefLabel(ref, laneColours[index]);
    this.element.firstChild?.insertBefore(refElm.element, this.element.firstChild?.firstChild);
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
    const parent = this.node.parents[index];
    if (parent) {
      return CommitManager.getCommitElement(parent.hash);
    }
    return undefined;
  }
}

export default CommitElement;
