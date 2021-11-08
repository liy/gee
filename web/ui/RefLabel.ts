import { Reference__Output } from 'protobuf/pb/Reference';
import './RefLabel.css';

export default class RefLabel {
  readonly element: HTMLElement;
  constructor(ref: Reference__Output, colour: string) {
    this.element = document.createElement('span');
    this.element.className = 'ref-label';
    this.element.innerHTML = ref.shorthand;
    this.element.style.backgroundColor = colour;
  }
}
