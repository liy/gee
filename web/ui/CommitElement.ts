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

  private top: HTMLElement;
  private summaryElement: HTMLElement;
  private dateTimeElement: HTMLElement;

  private bottom: HTMLElement;
  private blElement: HTMLElement;
  private hashElement: HTMLElement;

  private authorElement: HTMLElement;

  constructor() {
    this._selected = false;

    this.element = document.createElement('div');
    this.element.style.height = GraphStyle.sliceHeight + 'px';
    this.element.className = 'commit';

    this.top = document.createElement('div');
    this.top.className = 'top';
    this.element.appendChild(this.top);

    this.summaryElement = document.createElement('div');
    this.summaryElement.className = 'summary';
    this.top.appendChild(this.summaryElement);

    this.authorElement = document.createElement('span');
    this.authorElement.className = 'author';
    this.top.appendChild(this.authorElement);

    this.bottom = document.createElement('div');
    this.bottom.style.marginTop = '2px';
    this.bottom.className = 'bottom';
    this.element.appendChild(this.bottom);

    this.blElement = document.createElement('div');
    this.blElement.style.color = '#777';
    this.blElement.style.fontSize = '11px';
    this.bottom.appendChild(this.blElement);

    this.hashElement = document.createElement('span');
    this.hashElement.className = 'hash';
    this.hashElement.style.marginRight = '4px';
    this.blElement.appendChild(this.hashElement);

    this.dateTimeElement = document.createElement('span');
    this.dateTimeElement.className = 'date';
    this.bottom.appendChild(this.dateTimeElement);
  }

  update(commit: Commit__Output) {
    this.summaryElement.textContent = commit.summary?.substr(0, 100) || '';
    // this.summaryElement.innerHTML = `<div>${
    //   commit.summary?.substr(0, 100) || ''
    // }</div><div style="margin-top:2px; color: #777; font-size: 11px">${(this.authorElement.textContent =
    //   commit.author?.name || '')}</div>`;

    this.hashElement.textContent = commit.hash?.substr(0, 7) || '';

    this.authorElement.textContent = commit.author?.name || '';

    const dateTime = new Date((commit!.commitTime!.seconds as any).low * 1000);
    this.dateTimeElement.textContent = dateFormat.format(dateTime) + ' ' + timeFormat.format(dateTime);
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
    this.dateTimeElement.textContent = '';
  }
}

export default CommitElement;
