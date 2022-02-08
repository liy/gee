import ConsoleMananger from '../ConsoleMananger';
import GraphStyle from '../views/log/GraphStyle';
import './Commit.css';
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

  update(data: Log, branches: Branch[] | undefined, tags: Tag[] | undefined, selected = false) {
    this.data = data;
    this.clear();

    this.summaryNode.innerText = data.subject;
    this.hashNode.textContent = data.hash.substring(0, 7);
    this.authroNode.textContent = data.author.name;
    this.dateTimeNode.textContent = dateFormat.format(data.commitDate) + ' ' + timeFormat.format(data.commitDate);

    if (branches) {
      for (const labelInfo of branches) {
        const label = document.createElement('div', { is: 'log-label' }) as LogLabel;
        this.refNode.appendChild(label);
        label.update(labelInfo);
      }
    }

    if (tags) {
      for (const labelInfo of tags) {
        const label = document.createElement('div', { is: 'log-label' }) as LogLabel;
        this.refNode.appendChild(label);
        label.update(labelInfo);
      }
    }

    this.setSelection(selected);
  }

  setSelection(selected: boolean) {
    if (selected) {
      this.classList.add('selected');
    } else {
      this.classList.remove('selected');
    }
  }

  connectedCallback() {
    this.addEventListener(
      'click',
      () => {
        this.dispatchEvent(new CustomEvent('commit.clicked', { detail: this.data.hash, bubbles: true }));
      },
      true
    );
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
