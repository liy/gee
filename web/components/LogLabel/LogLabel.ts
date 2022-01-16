import './log-label.css';

export default class LogLabel extends HTMLDivElement {
  constructor() {
    super();
  }

  update(data: Branch | Tag) {
    this.classList.add('log-label');
    if ((<Tag>data).hash === '') {
      this.classList.add('tag');
    } else {
      this.classList.add('branch');
    }
    this.textContent = data.shorthand;
  }
}

customElements.define('log-label', LogLabel, { extends: 'div' });
