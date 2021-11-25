import { Commit__Output } from '../../src/protobuf/pb/Commit';
import template from './Commit.html';
import './commit.css';
import GraphStyle from '../ui/GraphStyle';

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

export class Commit extends HTMLDivElement {
  private summaryNode: HTMLElement;
  private dateTimeNode: HTMLElement;
  private hashNode: HTMLElement;
  private authroNode: HTMLElement;

  constructor() {
    super();

    this.className = 'commit';
    this.style.height = GraphStyle.sliceHeight + 'px';
    this.innerHTML = template;

    this.summaryNode = this.querySelector('.summary')!;
    this.authroNode = this.querySelector('.author')!;
    this.hashNode = this.querySelector('.hash')!;
    this.dateTimeNode = this.querySelector('.date-time')!;
  }

  update(data: Commit__Output) {
    this.summaryNode.textContent = data.summary;
    this.hashNode.textContent = data.hash?.substr(0, 7) || '';
    this.authroNode.textContent = data.author?.name || '';
    const dateTime = new Date((data!.commitTime!.seconds as any).low * 1000);
    this.dateTimeNode.textContent = dateFormat.format(dateTime) + ' ' + timeFormat.format(dateTime);
  }

  onClick(e: MouseEvent) {}

  connectedCallback() {
    this.addEventListener('click', this.onClick, true);
  }

  clear() {
    this.summaryNode.textContent = '';
    this.hashNode.textContent = '';
    this.authroNode.textContent = '';
    this.dateTimeNode.textContent = '';
  }
}

customElements.define('git-commit', Commit, { extends: 'div' });
