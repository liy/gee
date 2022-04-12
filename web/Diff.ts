class LineReader {
  // line start
  public lineStart: number = 0;
  // line end
  public lineEnd: number = -1;

  constructor(private text: string) {}

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

  peek() {
    return this.text[this.lineEnd + 1];
  }

  get currentLine(): string {
    return this.text.substring(this.lineStart, this.lineEnd);
  }

  [Symbol.iterator]() {
    return {
      next: () => {
        const value = this.readLine();
        return {
          done: value === null,
          value: value!,
        };
      },
    };
  }
}

export interface HunkHeading {
  text: string;
  // The first line that starts with -, and the number of lines which start with ' '(space, normal) and '-'
  oldRange: [number, number?];
  // The first line that starts with +, and the number of lines which start with ' '(space, normal) and '+'
  newRange: [number, number?];
  title: string;
}

export enum HunkLineType {
  heading,
  default,
  add,
  delete,
  noTrailingNewLine,
}

export class HunkLine {
  readonly type: HunkLineType;
  constructor(readonly text: string, readonly oldLineNo: string, readonly newLineNo: string) {
    if (text.startsWith('@@')) {
      this.type = HunkLineType.heading;
    } else if (text.startsWith('+')) {
      this.type = HunkLineType.add;
    } else if (text.startsWith('-')) {
      this.type = HunkLineType.delete;
    } else if (text.startsWith('\\')) {
      this.type = HunkLineType.noTrailingNewLine;
    } else {
      this.type = HunkLineType.default;
    }
  }

  get content() {
    if (this.type === HunkLineType.heading || this.type === HunkLineType.noTrailingNewLine) {
      return this.text;
    }
    return this.text.substring(1);
  }
}

const hunkHeaderRegex = /^@@ -(\d+),?(\d+)? \+(\d+),?(\d+)? @@ ?(.*)?/;
export class Hunk {
  static parse(text: string) {
    const reader = new LineReader(text);

    const lines = new Array<HunkLine>();

    const headingText = reader.readLine()!;
    const result = hunkHeaderRegex.exec(headingText)!;
    const heading: HunkHeading = {
      text: headingText,
      oldRange: [parseInt(result[1]), parseInt(result[2])],
      newRange: [parseInt(result[3]), parseInt(result[4])],
      title: result[5],
    };
    lines.push(new HunkLine(headingText, '', ''));

    let o = heading.oldRange[0];
    let n = heading.newRange[0];
    while (reader.nextLine()) {
      let hunkLine: HunkLine;
      if (reader.lineStartWith('-')) {
        hunkLine = new HunkLine(reader.currentLine, o.toString(), '');
        o++;
      } else if (reader.lineStartWith('+')) {
        hunkLine = new HunkLine(reader.currentLine, '', n.toString());
        n++;
      } else if (reader.lineStartWith('\\')) {
        hunkLine = new HunkLine(reader.currentLine, '', '');
      } else {
        hunkLine = new HunkLine(reader.currentLine, o.toString(), n.toString());
        o++;
        n++;
      }
      lines.push(hunkLine);
    }

    return new Hunk(text, heading, lines);
  }

  constructor(readonly text: string, readonly heading: HunkHeading, readonly lines: HunkLine[]) {}

  get content() {
    return this.lines
      .slice(1)
      .map((line) => line.text)
      .join('\n');
  }

  get oldLineNo(): string[] {
    return this.lines.map((line) => line.oldLineNo);
  }

  get newLineNo(): string[] {
    return this.lines.map((line) => line.newLineNo);
  }
}

export interface DiffHeading {
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
  // contains all the text of the diff heading
  text: string;
  // Contains lines of the heading, so it can be filterred
  lines: string[];
}

export type ChangeType = 'edit' | 'delete' | 'rename' | 'new';

export class Diff {
  static parse(text: string): Diff[] {
    text = text.trimEnd();
    const diffs = [];
    const indices = Array.from(text.matchAll(/^diff --git .*/gm)).map((r) => r.index!);
    for (let i = 0; i < indices.length; ++i) {
      diffs[i] = Diff.create(text.substring(indices[i], indices[i + 1] ? indices[i + 1] - 1 : undefined));
    }
    return diffs;
  }

  static create(text: string): Diff {
    const heading: DiffHeading = {
      from: '',
      to: '',
      index: ['0000000', '0000000'],
      deleted: false,
      binary: false,
      new: false,
      rename: false,
      similarity: '0%',
      text,
      lines: [],
    };

    const indices = Array.from(text.matchAll(/^@@.*@@/gm)).map((r) => r.index!);
    // Check whether the diff contains hunk. Because rename will not have hunk at all. So the heading text will be the diff text passed in
    if (indices[0] !== undefined) {
      heading.text = text.substring(0, indices[0] - 1);
    }

    const reader = new LineReader(heading.text);
    const result = /^diff --git (?:[ia]\/(.*)) (?:[wb]\/(.*))/.exec(reader.readLine()!);
    if (result) {
      heading.from = result[1];
      heading.to = result[2];
    }
    heading.lines.push(reader.currentLine);

    for (const line of reader) {
      if (reader.lineStartWith('index')) {
        const result = /^index ([\da-zA-Z]+)..([\da-zA-Z]+)/.exec(line);
        if (result) {
          heading.index = [result[1], result[2]];
        }
      } else if (reader.lineStartWith('deleted file mode')) {
        heading.deleted = true;
      } else if (reader.lineStartWith('new file mode')) {
        heading.new = true;
      } else if (reader.lineStartWith('similarity index ')) {
        heading.rename = true;
        const result = /^.+ (\d+%)/.exec(reader.currentLine);
        if (result) {
          heading.similarity = result[1];
        }
      } else if (reader.lineStartWith('Binary files ') && reader.lineEndWith('differ')) {
        heading.binary = true;
      } else if (reader.lineStartWith('+++')) {
        heading.binary = false;
      }

      heading.lines.push(line);
    }

    // it is a rename, not diff content
    if (heading.rename) {
      return new Diff(text, heading, '', [], []);
    }

    const hunkRanges = new Array<[number, number]>();
    const hunks = new Array();
    for (let i = 0; i < indices.length; ++i) {
      const start = indices[i];
      const end = indices[i + 1] ? indices[i + 1] - 1 : text.length;
      hunks[i] = Hunk.parse(text.substring(start, end));
      hunkRanges[i] = [start - indices[0], end - indices[0]];
    }

    return new Diff(text, heading, text.substring(indices[0]), hunks, hunkRanges);
  }

  readonly lines: HunkLine[] = new Array();

  private lineNos: Map<HunkLine, number> = new Map();

  constructor(
    readonly text: string,
    readonly heading: DiffHeading,
    readonly content: string,
    readonly hunks: Hunk[],
    // range based on characters
    readonly hunkRanges: [number, number][]
  ) {
    this.lines = this.hunks.map((hunk) => hunk.lines).flat();
    this.lines.forEach((line, index) => {
      this.lineNos.set(line, index + 1);
    });
  }

  /**
   * Get the owner hunk of a specific line number.
   * @param lineNo Line number
   * @returns The hunk that owns the line
   */
  getHunk(lineNo: number): Hunk | null {
    let lineNoTrack = 0;
    for (const hunk of this.hunks) {
      lineNoTrack += hunk.lines.length;
      if (lineNo <= lineNoTrack) {
        return hunk;
      }
    }

    return null;
  }

  /**
   * Get the hunk line at specific line number
   * @param lineNo Line number
   * @returns A hunk line at the line number
   */
  getLine(lineNo: number) {
    return this.lines[lineNo - 1];
  }

  /**
   * Get the line number of the hunk line in the diff
   * @param hunkLine Hunk line
   * @returns Line number of the hunk line in the diff
   */
  getLineNo(hunkLine: HunkLine) {
    return this.lineNos.get(hunkLine);
  }

  get changeType(): ChangeType {
    if (this.heading.rename) {
      return 'rename';
    } else if (this.heading.deleted) {
      return 'delete';
    } else if (this.heading.new) {
      return 'new';
    } else {
      return 'edit';
    }
  }
}
