import { Diff } from './DiffParser';

export const createLinePatch = (lineNo: number, hunkIndex: number, diff: Diff): string => {
  const hunk = diff.hunks[hunkIndex];
  const selectedLine = hunk.lines[lineNo - 1];

  if (!selectedLine.text.startsWith('-') && !selectedLine.text.startsWith('+')) {
    return '';
  }

  const lineTexts = [];

  let ln = lineNo;

  let startLineNo = lineNo;
  // find previous line if any
  while (--ln > 1) {
    const line = hunk.lines[ln - 1];
    if (line.text.startsWith(' ')) {
      lineTexts.push(line.text);
      startLineNo = ln;
      break;
    }
  }

  lineTexts.push(selectedLine.text);

  // find next line if any
  while (++ln <= hunk.lines.length) {
    const line = hunk.lines[ln - 1];
    if (line.text.startsWith(' ')) {
      lineTexts.push(line.text);
      break;
    }
  }

  let isRemove = selectedLine.text.startsWith('-');

  const hunkHeading = `@@ -${startLineNo},${isRemove ? lineTexts.length : lineTexts.length - 1} +${startLineNo},${
    isRemove ? lineTexts.length - 1 : lineTexts.length
  } @@`;

  // A valid patch starts with container diff header, and a hunk heading and actual patch content finally ends with a newline
  return [diff.header.text, hunkHeading, lineTexts, '\n'].flat().join('\n');
};
