import { CommitTag } from '../elements/Tag';
import { TagData } from '../commands/tag';
export class TagView extends HTMLElement {
  testData!: TagData[];
  constructor() {
    super();
  }

  update(data: TagData[]) {
    this.classList.add('flex-view', 'view');
    for (const tagData of data) {
      const tag = document.createElement('commit-tag') as CommitTag;
      tag.update(tagData);
      this.appendChild(tag);
    }
  }

  connectedCallback() {}

  disconnectedCallback() {}
}

customElements.define('tag-view', TagView);
