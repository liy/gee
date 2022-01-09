import GraphStyle from '../ui/GraphStyle';
import { LogEntry } from '../views/log/store';
import './commit.css';
import template from './Commit.html';

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
  private refsNode: HTMLElement;

  constructor() {
    super();

    this.className = 'commit';
    this.style.height = GraphStyle.sliceHeight + 'px';
    this.innerHTML = template;

    this.summaryNode = this.querySelector('.summary')!;
    this.authroNode = this.querySelector('.author')!;
    this.hashNode = this.querySelector('.hash')!;
    this.dateTimeNode = this.querySelector('.date-time')!;
    this.refsNode = this.querySelector('.refs')!;
  }

  update(data: LogEntry) {
    this.summaryNode.textContent = data.subject;
    this.hashNode.textContent = data.hash.substring(0, 7);
    this.authroNode.textContent = data.author.name;
    this.dateTimeNode.textContent = dateFormat.format(data.commitDate) + ' ' + timeFormat.format(data.commitDate);

    this.refsNode.innerHTML = '';
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
    this.refsNode.innerHTML = '';
  }
}

customElements.define('git-commit', Commit, { extends: 'div' });
