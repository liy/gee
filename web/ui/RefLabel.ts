import { gee } from '../@types/gee';
import './RefLabel.css';

export default class RefLabel {
  readonly element: HTMLElement;
  constructor(ref: gee.Reference, colour: string) {
    this.element = document.createElement('span');
    this.element.className = 'ref-label';
    this.element.innerHTML = ref.shorthand;
    this.element.style.backgroundColor = colour;
  }
}
