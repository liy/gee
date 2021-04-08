import { gee } from '../@types/git';
import './RefLabel.css';

export default class RefLabel {
  readonly element: HTMLElement;
  constructor(refPod: gee.Reference, colour: string) {
    this.element = document.createElement('span');
    this.element.className = 'ref-label';
    this.element.innerHTML = refPod.shorthand;
    this.element.style.backgroundColor = colour;
  }
}
