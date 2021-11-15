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

  private contentElement: HTMLElement;
  private summaryElement: HTMLElement;
  private metaElement: HTMLElement;
  private hashElement: HTMLElement;
  private authorElement: HTMLElement;
  private dateElement: HTMLElement;
  private timeElement: HTMLElement;

  constructor() {
    this._selected = false;

    this.element = document.createElement('tr');
    this.element.style.height = GraphStyle.sliceHeight + 'px';
    this.element.className = 'commit';

    this.contentElement = document.createElement('td');
    this.contentElement.className = 'content';
    this.contentElement.style.minWidth = '550px';
    this.contentElement.style.maxWidth = '550px';
    this.element.appendChild(this.contentElement);

    this.summaryElement = document.createElement('div');
    this.summaryElement.className = 'summary';
    this.contentElement.appendChild(this.summaryElement);

    this.metaElement = document.createElement('div');
    this.metaElement.className = 'meta';
    this.metaElement.style.marginTop = '2px';
    this.metaElement.style.color = '#777';
    this.metaElement.style.fontSize = '11px';
    this.contentElement.appendChild(this.metaElement);

    this.hashElement = document.createElement('span');
    this.hashElement.className = 'hash';
    this.hashElement.style.marginRight = '4px';
    this.metaElement.appendChild(this.hashElement);

    this.authorElement = document.createElement('span');
    this.authorElement.className = 'author';
    this.metaElement.appendChild(this.authorElement);

    this.dateElement = document.createElement('td');
    this.dateElement.className = 'date';
    this.dateElement.style.minWidth = '68px';
    this.dateElement.style.maxWidth = '68px';
    this.dateElement.style.fontSize = '11px';
    this.element.appendChild(this.dateElement);

    this.timeElement = document.createElement('td');
    this.timeElement.className = 'time';
    this.timeElement.style.fontSize = '11px';
    this.element.appendChild(this.timeElement);
  }

  update(commit: Commit__Output) {
    this.summaryElement.textContent = commit.summary?.substr(0, 100) || '';
    // this.summaryElement.innerHTML = `<div>${
    //   commit.summary?.substr(0, 100) || ''
    // }</div><div style="margin-top:2px; color: #777; font-size: 11px">${(this.authorElement.textContent =
    //   commit.author?.name || '')}</div>`;

    this.hashElement.textContent = (commit.hash?.substr(0, 7) || '').toUpperCase();

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
