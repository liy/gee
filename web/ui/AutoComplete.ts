import parse from 'ght';
import CommandEvent from '../CommandEvent';
import CommandProcessor from '../commands/CommandProcessor';
import EventEmitter from '../EventEmitter';
import Search from '../Search';
import './AutoComplete.scss';
import CommandInput from './CommandInput';

export interface CandidateData {
  name: string;
  description: string;
  value: any;
}

class Candidate {
  element = document.createElement('div');

  data: CandidateData;

  nameField: HTMLElement;
  descriptionField: HTMLElement;
  constructor(candidateData: CandidateData) {
    this.element.classList.add('candidate');
    this.data = candidateData;
    this.nameField = document.createElement('div');
    this.nameField.className = 'name-field';
    this.element.appendChild(this.nameField);
    this.descriptionField = document.createElement('div');
    this.descriptionField.className = 'description';
    this.element.appendChild(this.descriptionField);

    this.update(candidateData);
  }

  update(data: CandidateData) {
    this.nameField.textContent = data.name;
    this.descriptionField.textContent = data.description;
    this.data = data;
  }

  remove() {
    this.element.remove();
  }

  focus(flag: boolean) {
    if (flag) {
      this.element.classList.add('focus');
    } else {
      this.element.classList.remove('focus');
    }
  }
}

export default class AutoComplete {
  element = document.createElement('div');

  private _isOpen = false;

  private candidates = new Array<Candidate>();

  private _focusedIndex = -1;

  constructor(dataEntries?: Array<CandidateData>) {
    this.element.classList.add('autocomplete');
    if (dataEntries) {
      for (const data of dataEntries) {
        this.createCandidate(data);
      }
    }

    document.addEventListener('keydown', this.onKeyboard.bind(this));
  }

  init() {
    CommandInput.input.addEventListener('input', this.onInput.bind(this));
  }

  onInput(e: Event) {
    // TODO: update auto complete candidates
  }

  onKeyboard(e: KeyboardEvent) {
    if (!this.isOpen) {
      switch (e.key) {
        case ' ':
          if (e.ctrlKey) {
            this.open();
          }
          break;
        case 'Escape':
          this.close();
          break;
      }
    } else {
      if (this.candidates.length === 0) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          this.focusedIndex--;
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.focusedIndex++;
          break;
        case 'Enter':
          e.preventDefault();
          this.select(this.candidates[this.focusedIndex].data);
          break;
      }
    }
  }

  open(): void {
    this._isOpen = true;
  }

  close(): void {
    this._isOpen = false;
  }

  update(dataEntries: Array<CandidateData>): void {
    // Simply update existing candidates
    const len = Math.min(dataEntries.length, this.candidates.length);
    for (let i = 0; i < len; ++i) {
      const data = dataEntries[i];
      const candidate = this.candidates[i];
      candidate.update(data);
    }

    // Remove candidate if data entries size is smaller, note it is in reverse order
    // so it should not triggers any layout changes in the container element
    for (let i = this.candidates.length - 1; i > dataEntries.length - 1; --i) {
      this.candidates[i].remove();
      this.candidates.pop();
    }

    // Add candidate if data entries size is larger
    for (let i = this.candidates.length; i < dataEntries.length; ++i) {
      this.createCandidate(dataEntries[i]);
    }

    this.focusedIndex = 0;
  }

  updateReferences(pattern: string): void {
    const candidateEntries = new Array<CandidateData>();
    const results = Search.references(pattern);
    for (let i = 0; i < results.length; ++i) {
      if (results.length > 10) {
        break;
      }

      const result = results[i];
      candidateEntries.push({
        name: result.item.shorthand,
        description: result.item.name,
        value: result.item.name,
      });
    }
    this.update(candidateEntries);
  }

  updateCommits(pattern: string): void {
    const candidateEntries = new Array<CandidateData>();
    const results = Search.commits(pattern);
    for (let i = 0; i < results.length; ++i) {
      if (results.length > 10) {
        break;
      }

      const result = results[i];
      candidateEntries.push({
        name: result.item.summary,
        description: result.item.body,
        value: result.item.hash,
      });
    }
    this.update(candidateEntries);
  }

  createCandidate(data: CandidateData): void {
    const candidate = new Candidate(data);
    this.candidates.push(candidate);
    this.element.appendChild(candidate.element);
    candidate.element.addEventListener('click', () => {
      this.select(candidate.data);
    });
  }

  select(data: CandidateData): void {
    // insert auto completed word into caret position
    CommandInput.insertText(data.value);
  }

  set focusedIndex(value: number) {
    if (this.candidates[this.focusedIndex]) {
      this.candidates[this.focusedIndex].focus(false);
    }

    this._focusedIndex = value;
    this._focusedIndex =
      this._focusedIndex < 0
        ? this.candidates.length + this._focusedIndex
        : this._focusedIndex % this.candidates.length;

    if (this.candidates[this.focusedIndex]) {
      this.candidates[this.focusedIndex].focus(true);
    }
  }

  get focusedIndex(): number {
    return this._focusedIndex;
  }

  clear(): void {
    if (this.candidates[this.focusedIndex]) {
      this.candidates[this.focusedIndex].focus(true);
    }
    this._focusedIndex = -1;

    // Remove candidate if data entries size is smaller, note it is in reverse order
    // so it should not triggers any layout changes in the container element
    for (let i = this.candidates.length - 1; i >= 0; --i) {
      this.candidates[i].remove();
    }
    this.candidates = [];
  }

  get isOpen(): boolean {
    return this._isOpen;
  }
}
