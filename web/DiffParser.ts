const hunkHeaderRegex = /@@ -(\d+),(\d+) \+(\d+),(\d+) @@ ?(.*)?/;

const linePrefixes = new Set([' ', '-', '+']);

type LineNo = [number | typeof NaN, number | typeof NaN];

interface Hunk {
  header: {
    text: string;
    before: [number, number];
    after: [number, number];
  };
  content: [number, number];
  lineNo: LineNo[];
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
    const text = result[5];
    const before: [number, number] = [parseInt(result[1]), parseInt(result[2])];
    const after: [number, number] = [parseInt(result[3]), parseInt(result[4])];

    const lineNo = new Array<LineNo>();

    this.nextLine();
    const start = this.lineStart;
    let end = this.lineEnd;
    let b = before[0];
    let a = after[0];
    while (this.isValidLine(this.peek())) {
      end = this.lineEnd;

      const no = [];
      if (this.lineStartWith('-')) {
        no[0] = b;
        no[1] = NaN;
        b++;
      } else if (this.lineStartWith('+')) {
        no[0] = NaN;
        no[1] = a;
        a++;
      } else {
        no[0] = b;
        no[1] = a;
        b++;
        a++;
      }
      lineNo.push(no as LineNo);
      this.nextLine();
    }

    return {
      header: {
        text,
        before,
        after,
      },
      content: [start, end] as [number, number],
      lineNo,
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
