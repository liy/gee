const hunkHeaderRegex = /@@ -(\d+),(\d+) \+(\d+),(\d+) @@ ?(.*)?/;

const linePrefixes = new Set([' ', '-', '+']);

export enum HunkLineType {
  heading,
  default,
  add,
  delete,
}

export class HunkLine {
  constructor(
    readonly text: string,
    readonly type: HunkLineType,
    readonly beforeLineNo: string,
    readonly afterLineNo: string
  ) {}

  get content() {
    if (this.type === HunkLineType.heading) {
      return this.text;
    }
    return this.text.substr(1);
  }
}

export interface Hunk {
  header: {
    text: string;
    // The first line that starts with -, and the number of lines which start with ' '(space, normal) and '-'
    before: [number, number];
    // The first line that starts with +, and the number of lines which start with ' '(space, normal) and '+'
    after: [number, number];
  };
  // Range is based on per diff text
  range: [number, number];
  text: string;
  lines: HunkLine[];
  beforeLineNo: string[];
  afterLineNo: string[];
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
  text: string;
}

export interface Diff {
  header: DiffHeader;
  // The detail changes
  hunks: Hunk[];
  text: string;
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
      text: '',
    };

    const lines = [];

    const result = /^diff --git (?:[ia]\/(.*)) (?:[wb]\/(.*))/.exec(this.currentLine);
    if (result) {
      header.from = result[1];
      header.to = result[2];
      lines.push(result[0]);
    }

    // other stuff
    let breakLoop = false;
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
        breakLoop = true;
      } else if (this.lineStartWith('+++')) {
        header.binary = false;
        breakLoop = true;
      }

      lines.push(this.currentLine);
      if (breakLoop) {
        break;
      }
    }

    header.text = lines.join('\n');

    return header;
  }

  parseHunks(rangeTrack: number) {
    const hunks = new Array<Hunk>();
    while (true) {
      const result = this.parseHunk(rangeTrack);
      if (result) {
        hunks.push(result);
        rangeTrack += result.text.length + 1;
      } else {
        return hunks;
      }
    }
  }

  parseHunk(rangeTrack: number): Hunk | null {
    const line = this.readLine();
    if (!line) return null;

    // Stores the start of the hunk, so we can use range to specifies the hunk content
    // Note that the content includes hunk heading
    const start = this.lineStart;

    const result = hunkHeaderRegex.exec(line);
    if (!result) {
      return null;
    }

    // hunk heading
    const heading = line;
    const before: [number, number] = [parseInt(result[1]), parseInt(result[2])];
    const after: [number, number] = [parseInt(result[3]), parseInt(result[4])];

    const lines: HunkLine[] = [];

    // First line is the hunk heading
    const beforeLineNo = [''];
    const afterLineNo = [''];
    lines.push(new HunkLine(line, HunkLineType.heading, '', ''));

    let b = before[0];
    let a = after[0];
    while (this.isValidHunkLine(this.peek())) {
      const line = this.readLine();
      if (!line) return null;

      let type: HunkLineType;
      if (this.lineStartWith('-')) {
        type = HunkLineType.delete;
        beforeLineNo.push(b.toString());
        afterLineNo.push('');
        b++;
      } else if (this.lineStartWith('+')) {
        type = HunkLineType.add;
        beforeLineNo.push('');
        afterLineNo.push(a.toString());
        a++;
      } else {
        type = HunkLineType.default;
        beforeLineNo.push(b.toString());
        afterLineNo.push(a.toString());
        b++;
        a++;
      }
      lines.push(new HunkLine(line, type, beforeLineNo[beforeLineNo.length - 1], afterLineNo[afterLineNo.length - 1]));
    }

    const text = this.text.substring(start, this.lineEnd);

    return {
      header: {
        text: heading,
        before,
        after,
      },
      text,
      range: [rangeTrack, rangeTrack + text.length],
      lines,
      beforeLineNo,
      afterLineNo,
    };
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
      const hunks = this.parseHunks(header.text.length + 1);

      const text = header.text + '\n' + hunks.map((hunk) => hunk.text).join('\n');

      diffs.push({ header, hunks, text });
    }

    return diffs;
  }
}
