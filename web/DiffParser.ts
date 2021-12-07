const hunkHeaderRegex = /@@ -(\d+),(\d+) \+(\d+),(\d+) @@ ?(.*)?/;

const linePrefixes = new Set([' ', '-', '+']);

interface Hunk {
  header: string;
  before: [number, number];
  after: [number, number];
  lines: string[];
}

interface Diff {
  header: {
    before: string;
    after: string;
  };
  hunks: Hunk[];
}

export class DiffParser {
  // line start
  public lineStart: number = 0;
  // line end
  public lineEnd: number = -1;

  constructor(private text: string) {
    if (!this.text.startsWith('diff --git')) {
      throw new Error('invalid diff');
    }
  }

  nextLine(): boolean {
    this.lineStart = this.lineEnd + 1;
    if (this.lineStart >= this.text.length) return false;

    this.lineEnd = this.text.indexOf('\n', this.lineStart);
    if (this.lineEnd === -1) this.lineEnd = this.text.length;

    return this.lineStart != this.lineEnd;
  }

  readLine(): string | null {
    return this.nextLine() ? this.text.substring(this.lineStart, this.lineEnd) : null;
  }

  lineStartWith(str: string): boolean {
    return this.text.startsWith(str, this.lineStart);
  }

  lineEndWith(str: string): boolean {
    return this.text.endsWith(str, this.lineEnd);
  }

  get currentLine(): string {
    return this.text.substring(this.lineStart, this.lineEnd);
  }

  peek() {
    return this.text[this.lineEnd + 1];
  }

  isValidLine(char: string) {
    return linePrefixes.has(char);
  }

  parseHeader() {
    // TODO: diff header is ignored
    while (this.nextLine()) {
      if (this.lineStartWith('+++')) return;
    }
  }

  parseHunk() {
    const result = hunkHeaderRegex.exec(this.currentLine);
    if (!result) {
      throw new Error('invalid hunk');
    }

    // hunk header
    const lines = new Array<string>();
    const header = result[5];
    const before: [number, number] = [parseInt(result[1]), parseInt(result[2])];
    const after: [number, number] = [parseInt(result[3]), parseInt(result[4])];

    while (this.isValidLine(this.peek())) {
      const line = this.readLine()!;
      lines.push(line);
    }

    return {
      header,
      before,
      after,
      lines,
    };
  }

  parseHunks() {
    const hunks = new Array<Hunk>();
    while (this.nextLine()) {
      if (this.lineStartWith('diff --git')) break;
      hunks.push(this.parseHunk());
    }

    return hunks;
  }

  parse() {
    const diffs = new Array<Hunk[]>();
    while (this.nextLine()) {
      this.parseHeader();
      const hunks = this.parseHunks();
      diffs.push(hunks);
    }
    return diffs;
  }
}
