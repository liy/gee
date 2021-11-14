import Node from '../graph/Node';
import CommitManager from './CommitManager';
import RefLabel from './RefLabel';
import Simulator from '../Simulator';
import { Commit, Commit__Output } from 'protobuf/pb/Commit';
import { Reference__Output } from 'protobuf/pb/Reference';
import './commit.css';
import GraphStyle from './GraphStyle';

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

  private _selected: boolean;

  private summaryElement: HTMLElement;
  private hashElement: HTMLElement;
  private authorElement: HTMLElement;
  private dateElement: HTMLElement;
  private timeElement: HTMLElement;

  constructor() {
    this._selected = false;

    this.element = document.createElement('tr');
    this.element.style.height = GraphStyle.sliceHeight + 'px';
    this.element.className = 'commit';

    this.summaryElement = document.createElement('td');
    this.summaryElement.className = 'summary';
    this.summaryElement.style.minWidth = '550px';
    this.summaryElement.style.maxWidth = '550px';
    this.element.appendChild(this.summaryElement);

    this.hashElement = document.createElement('td');
    this.hashElement.className = 'hash';
    this.element.appendChild(this.hashElement);

    this.authorElement = document.createElement('td');
    this.authorElement.className = 'author';
    this.authorElement.style.width = '100px';
    this.element.appendChild(this.authorElement);

    this.dateElement = document.createElement('td');
    this.dateElement.className = 'date';
    this.dateElement.style.minWidth = '68px';
    this.dateElement.style.maxWidth = '68px';
    this.element.appendChild(this.dateElement);

    this.timeElement = document.createElement('td');
    this.timeElement.className = 'time';
    this.element.appendChild(this.timeElement);
  }

  update(commit: Commit__Output) {
    this.summaryElement.textContent = commit.summary?.substr(0, 100) || '';

    this.hashElement.textContent = commit.hash?.substr(0, 7) || '';

    this.authorElement.textContent = commit.author?.name || '';

    const dateTime = new Date((commit!.commitTime!.seconds as any).low * 1000);
    this.dateElement.textContent = dateFormat.format(dateTime);

    this.timeElement.textContent = timeFormat.format(dateTime);
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

  clear() {
    this.summaryElement.textContent = '';
    this.hashElement.textContent = '';
    this.authorElement.textContent = '';
    this.dateElement.textContent = '';
    this.timeElement.textContent = '';
  }
}

export default CommitElement;
