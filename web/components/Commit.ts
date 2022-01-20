import ConsoleMananger from '../ConsoleMananger';
import GraphStyle from '../views/log/GraphStyle';
import './commit.css';
import template from './Commit.html';
import LogLabel from './LogLabel/LogLabel';

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
  private refNode: HTMLElement;

  private data!: Log;

  constructor() {
    super();

    this.className = 'commit';
    this.style.height = GraphStyle.sliceHeight + 'px';
    this.innerHTML = template;

    this.summaryNode = this.querySelector('.summary')!;
    this.authroNode = this.querySelector('.author')!;
    this.hashNode = this.querySelector('.hash')!;
    this.refNode = this.querySelector('.refs')!;
    this.dateTimeNode = this.querySelector('.date-time')!;
  }

  update(data: Log, labelInfos?: Branch[] | Tag[]) {
    this.data = data;
    this.clear();

    this.summaryNode.textContent = data.subject;
    this.hashNode.textContent = data.hash.substring(0, 7);
    this.authroNode.textContent = data.author.name;
    this.dateTimeNode.textContent = dateFormat.format(data.commitDate) + ' ' + timeFormat.format(data.commitDate);

    if (labelInfos) {
      for (const labelInfo of labelInfos) {
        const label = document.createElement('div', { is: 'log-label' }) as LogLabel;
        this.refNode.appendChild(label);
        label.update(labelInfo);
      }
    }
  }

  onClick(e: MouseEvent) {
    // console.log(this.data);
    ConsoleMananger.process(['show', this.data.hash]);
  }

  connectedCallback() {
    this.addEventListener('click', this.onClick, true);
  }

  clear() {
    this.summaryNode.textContent = '';
    this.hashNode.textContent = '';
    this.authroNode.textContent = '';
    this.dateTimeNode.textContent = '';

    const labels = this.querySelectorAll('.log-label');
    for (const label of labels) {
      label.remove();
    }
  }
}

customElements.define('git-commit', Commit, { extends: 'div' });
