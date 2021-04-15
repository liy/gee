import { gee } from '../@types/git';
import RepositoryStore from '../git/RepositoryStore';
import './RefLabel.css';

export default class RefLabel {
  readonly element: HTMLElement;
  constructor(ref: gee.Reference, colour: string) {
    this.element = document.createElement('span');
    this.element.className = 'ref-label';
    this.element.innerHTML = ref.shorthand;
    this.element.style.backgroundColor = colour;
    if (RepositoryStore.current.isFake(ref)) {
      this.element.style.opacity = '0.5';
    }
  }
}
