import './log-label.css';

export default class LogLabel extends HTMLDivElement {
  constructor() {
    super();
  }

  update(data: Branch | Tag, head: { hash: string | null; ref: string | null }) {
    this.classList.add('log-label');
    if ((<Tag>data).hash === '') {
      this.classList.add('tag');
    } else {
      this.classList.add('branch');
    }

    console.log(data.shorthand);
    if (data.shorthand === head.ref) {
      this.classList.add('head');
    }

    this.textContent = data.shorthand;
  }
}

customElements.define('log-label', LogLabel, { extends: 'div' });
