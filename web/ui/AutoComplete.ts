import './AutoComplete.scss';

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
    this.nameField = document.createElement('span');
    this.element.appendChild(this.nameField);
    this.descriptionField = document.createElement('span');
    this.element.appendChild(this.descriptionField);

    this.update(candidateData);
  }

  update(data: CandidateData) {
    this.nameField.textContent = data.name;
    this.descriptionField.textContent = data.description ? data.description.substr(0, 20) : '';
    this.data = data;
  }

  remove() {
    this.element.remove();
  }
}

export default class AutoComplete {
  element = document.createElement('div');

  private candidates = new Array<Candidate>();

  constructor(dataEntries?: Array<CandidateData>) {
    this.element.classList.add('autocomplete');
    if (dataEntries) {
      for (const data of dataEntries) {
        const candidate = new Candidate(data);
        this.candidates.push(candidate);
      }
    }
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
      const candidate = new Candidate(dataEntries[i]);
      this.candidates.push(candidate);
      this.element.appendChild(candidate.element);
    }
  }

  show() {}

  hide() {}
}
