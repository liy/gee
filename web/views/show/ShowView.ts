import { DiffFile } from '../../components/DiffFile';
import HashLink from '../../components/HashLink';
import { Diff } from '../../Diff';
import { ViewBase } from '../ViewBase';
import './ShowView.css';
import template from './ShowView.html';

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

export class ShowView extends ViewBase {
  private cleanup: (() => void) | undefined;

  private branchNode: HTMLDivElement;
  private tagNode: HTMLDivElement;

  private hashNode: HTMLDivElement;
  private parentNodes: HTMLDivElement;

  private authorNameNode: HTMLSpanElement;
  private authorEmailNode: HTMLSpanElement;
  private authorDateNode: HTMLSpanElement;

  private committerNameNode: HTMLSpanElement;
  private committerEmailNode: HTMLSpanElement;
  private committerDateNode: HTMLSpanElement;

  private bodyNode: HTMLDivElement;

  private editorContainer: HTMLDivElement;

  constructor() {
    super();

    this.classList.add('show');

    this.heading.textContent = this.title;
    this.content.innerHTML = template;

    this.branchNode = this.content.querySelector('.branch-ref')!;
    this.tagNode = this.content.querySelector('.tag-ref')!;

    this.hashNode = this.content.querySelector('.hash')!;
    this.parentNodes = this.content.querySelector<HTMLDivElement>('.parent-hashes')!;

    this.authorNameNode = this.content.querySelector('.author .name')!;
    this.authorEmailNode = this.content.querySelector('.author .email')!;
    this.authorDateNode = this.content.querySelector('.author .datetime')!;

    this.committerNameNode = this.content.querySelector('.committer .name')!;
    this.committerEmailNode = this.content.querySelector('.committer .email')!;
    this.committerDateNode = this.content.querySelector('.committer .datetime')!;

    this.bodyNode = this.content.querySelector('.body')!;

    this.editorContainer = this.content.querySelector('.editor-container')!;
  }

  update(diffs: Diff[], log: Log, logBody: string, branches: string[], tags: string[]) {
    this.heading.textContent = `show ${log.subject.trim()}`;

    this.branchNode.textContent = branches.join(', ');
    this.tagNode.textContent = tags.join(', ');

    const elm = document.createElement('a', { is: 'hash-link' }) as HashLink;
    elm.update(log.hash, true);
    this.hashNode.appendChild(elm);

    log.parents.forEach((hashStr) => {
      const elm = document.createElement('a', { is: 'hash-link' }) as HashLink;
      elm.update(hashStr, true);
      this.parentNodes.appendChild(elm);
    });

    this.authorNameNode.textContent = log.author.name;
    this.authorEmailNode.textContent = log.author.email;
    this.authorDateNode.textContent = dateFormat.format(log.authorDate) + ' ' + timeFormat.format(log.authorDate);

    this.committerNameNode.textContent = log.committer.name;
    this.committerEmailNode.textContent = log.committer.email;
    this.committerDateNode.textContent = dateFormat.format(log.commitDate) + ' ' + timeFormat.format(log.commitDate);

    this.bodyNode.textContent = logBody;

    const editors = Array.from(this.editorContainer.children) as Array<DiffFile>;
    let i = 0;
    for (; i < editors.length; ++i) {
      if (diffs[i]) {
        editors[i].update(diffs[i]);
      } else {
        editors[i].remove();
      }
    }

    for (; i < diffs.length; ++i) {
      const elm = document.createElement('div', { is: 'diff-file' }) as DiffFile;
      elm.update(diffs[i], true);
      this.content.appendChild(elm);
    }
  }

  connectedCallback() {}

  disconnectedCallback() {
    this.cleanup?.();
  }
}

customElements.define('show-view', ShowView, { extends: 'div' });
