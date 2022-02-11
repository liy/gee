import { CommitTag } from '../components/Tag';
import { TagData } from '../commands/tag';
import { ViewBase } from './ViewBase';
import './TagView.css';

export class TagView extends ViewBase {
  testData!: TagData[];

  constructor() {
    super();

    this.title = 'tag';
    this.heading.textContent = this.title;
    this.content.classList.add('tag-view-content');
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
