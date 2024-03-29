import { TagData } from '../commands/tag';
import { CommitTag } from '../components-old/Tag';
import './TagView.css';
import { ViewBase } from './ViewBase';

export class TagView extends ViewBase {
  testData!: TagData[];

  constructor() {
    super();

    this.title = 'tag';
    this.heading.textContent = this.title;
    this.content.classList.add('tag-view');
  }

  update(data: TagData[]) {
    for (const tagData of data) {
      const tag = document.createElement('commit-tag') as CommitTag;
      tag.update(tagData);
      this.content.appendChild(tag);
    }
  }

  connectedCallback() {}

  disconnectedCallback() {}
}

customElements.define('tag-view', TagView, { extends: 'div' });
