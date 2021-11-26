import { Commit__Output } from '../../src/protobuf/pb/Commit';
import template from './Commit.html';
import './commit.css';
import GraphStyle from '../ui/GraphStyle';
import { Reference__Output } from 'protobuf/pb/Reference';
import Node from '../graph/Node';
import { Tag__Output } from 'protobuf/pb/Tag';

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

  update(data: Commit__Output, branches: Reference__Output[], tags: Tag__Output[], graphNode: Node) {
    this.summaryNode.textContent = data.summary;
    this.hashNode.textContent = data.hash?.substr(0, 7) || '';
    this.authroNode.textContent = data.author?.name || '';
    const dateTime = new Date((data!.commitTime!.seconds as any).low * 1000);
    this.dateTimeNode.textContent = dateFormat.format(dateTime) + ' ' + timeFormat.format(dateTime);

    this.refsNode.innerHTML = '';
    for (const branch of branches) {
      const node = document.createElement('span');
      node.classList.add('ref');
      node.textContent = branch.shorthand;
      const c = '#' + GraphStyle.getLineColour(graphNode.x, false).toString(16).padStart(6, 0);
      console.log(branch.shorthand, c);
      node.style.color = c;
      this.refsNode.appendChild(node);
    }

    for (const tag of tags) {
      const node = document.createElement('span');
      node.classList.add('ref', 'tag');
      node.textContent = '🏷️' + tag.name;
      node.style.color = '#FF9900';
      this.refsNode.appendChild(node);
    }
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
