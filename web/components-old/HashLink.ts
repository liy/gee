import './HashLink.css';

export default class HashLink extends HTMLAnchorElement {
  constructor() {
    super();
    this.onClick = this.onClick.bind(this);
  }

  update(hash: string, short = true) {
    this.href = '#';
    this.classList.add('hash');
    this.dataset.hash = hash;
    this.textContent = short ? hash.substring(0, 6) : hash;
  }

  onClick(e: MouseEvent) {
    this.dispatchEvent(
      new CustomEvent('hash.clicked', {
        bubbles: true,
        detail: { hash: this.dataset.hash! },
      })
    );
  }

  connectedCallback() {
    this.addEventListener('click', this.onClick, true);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.onClick);
  }
}

customElements.define('hash-link', HashLink, { extends: 'a' });
