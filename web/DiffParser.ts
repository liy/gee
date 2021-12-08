const hunkHeaderRegex = /@@ -(\d+),(\d+) \+(\d+),(\d+) @@ ?(.*)?/;

const linePrefixes = new Set([' ', '-', '+']);

type LineNo = [string, string];

interface Hunk {
  header: {
    text: string;
    before: [number, number];
    after: [number, number];
  };
  content: [number, number];
  lineNo: LineNo[];
}

interface DiffHeader {
  from: string;
  to: string;
  index: [string, string];
  // True if change is adding a new file
  new: boolean;
  // True if change is file renaming
  rename: boolean;
  // If it is rename, then this will give similarity in percentage
  similarity: string;
  // True if file is a binary file
  binary: boolean;
  // True if file is deleted
  deleted: boolean;
}

interface Diff {
  header: DiffHeader;
  // The detail changes
  hunks: Hunk[];
}

export class DiffParser {
  // line start
  public lineStart: number = 0;
  // line end
  public lineEnd: number = -1;

  constructor(private text: string) {}

  eof(): boolean {
    return this.lineEnd + 1 >= this.text.length;
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

  private isValidHunkLine(char: string) {
    return linePrefixes.has(char);
  }

  /**
   *
   * @returns diff title
   */
  parseHeader() {
    const header: DiffHeader = {
      from: '',
      to: '',
      index: ['0000000', '0000000'],
      deleted: false,
      binary: false,
      new: false,
      rename: false,
      similarity: '0%',
    };

    const result = /^diff --git (?:[ia]\/(.*)) (?:[wb]\/(.*))/.exec(this.currentLine);
    if (result) {
      header.from = result[1];
      header.to = result[2];
    }

    // other stuff
    while (this.nextLine()) {
      if (this.lineStartWith('index')) {
        const result = /^index ([\da-zA-Z]+)..([\da-zA-Z]+)/.exec(this.currentLine);
        if (result) {
          header.index = [result[1], result[2]];
        }
      } else if (this.lineStartWith('deleted file mode')) {
        header.deleted = true;
      } else if (this.lineStartWith('new file mode')) {
        header.new = true;
      } else if (this.lineStartWith('similarity index ')) {
        header.rename = true;
        const result = /^.+ (\d+%)/.exec(this.currentLine);
        if (result) {
          header.similarity = result[1];
        }
      } else if (this.lineStartWith('Binary files ') && this.lineEndWith('differ')) {
        header.binary = true;
        break;
      } else if (this.lineStartWith('+++')) {
        header.binary = false;
        break;
      }
    }

    return header;
  }

  parseHunk() {
    const result = hunkHeaderRegex.exec(this.currentLine);
    if (!result) {
      throw new Error('invalid hunk');
    }

    // hunk header
    const text = result[5];
    const before: [number, number] = [parseInt(result[1]), parseInt(result[2])];
    const after: [number, number] = [parseInt(result[3]), parseInt(result[4])];

    const lineNo = new Array<LineNo>();

    this.nextLine();
    const start = this.lineStart;
    let end = this.lineEnd;
    let b = before[0];
    let a = after[0];
    while (this.isValidHunkLine(this.peek())) {
      end = this.lineEnd;

      const no: LineNo = ['', ''];
      if (this.lineStartWith('-')) {
        no[0] = b.toString();
        b++;
      } else if (this.lineStartWith('+')) {
        no[1] = a.toString();
        a++;
      } else {
        no[0] = b.toString();
        no[1] = a.toString();
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
    // Invalid diff
    if (!this.text.startsWith('diff --git')) {
      return [];
    }

    const diffs = new Array<Diff>();
    this.nextLine();
    while (!this.eof()) {
      const header = this.parseHeader();
      const hunks = this.parseHunks();
      diffs.push({ header, hunks });
    }
    return diffs;
  }
}
