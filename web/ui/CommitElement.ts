import Node from '../graph/Node';
import CommitManager from './CommitManager';
import RefLabel from './RefLabel';
import { gee } from '../@types/gee';
import Simulator from '../Simulator';
import { Commit } from 'protobuf/pb/Commit';

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

  constructor(node: Node, commit?: Commit, references?: Array<gee.Reference>) {
    this.node = node;
    this.commit = commit;
    this.hash = commit?.hash;
    this._selected = false;

    this.element = document.createElement('tr');
    this.element.className = 'commit';

    const summaryElm = document.createElement('td');
    summaryElm.className = 'summary';
    summaryElm.textContent = commit?.summary?.substr(0, 100) || '';
    this.element.appendChild(summaryElm);

    const hashElm = document.createElement('td');
    hashElm.className = 'hash';
    hashElm.textContent = commit?.hash?.substr(0, 7) || '';
    this.element.appendChild(hashElm);

    const authorElm = document.createElement('td');
    authorElm.className = 'author';
    authorElm.textContent = commit?.author?.name || '';
    this.element.appendChild(authorElm);

    const dateTime = new Date((commit!.commitTime!.seconds as any).low * 1000);
    const dateElm = document.createElement('td');
    dateElm.className = 'date';
    dateElm.textContent = dateFormat.format(dateTime);
    this.element.appendChild(dateElm);

    const timeElm = document.createElement('td');
    timeElm.className = 'time';
    timeElm.textContent = timeFormat.format(dateTime);
    this.element.appendChild(timeElm);

    if (references) {
      const index = this.node.x % laneColours.length;
      for (const ref of references) {
        const refElm = new RefLabel(ref, laneColours[index]);
        this.element.firstChild?.insertBefore(refElm.element, this.element.firstChild?.firstChild);
      }
    }

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
}

export default CommitElement;
