import { Diff } from './DiffParser';

export enum LineType {
  add,
  remove,
  normal,
}

export const createLinePatch = (lineNo: number, hunkIndex: number, diff: Diff): string => {
  const lines = diff.hunks.map((hunk) => hunk.lines).flat();
  const selectedLine = lines[lineNo - 1];

  // if (!selectedLine.text.startsWith('-') && !selectedLine.text.startsWith('+')) {
  //   return '';
  // }
  let lineType = LineType.normal;
  if (selectedLine.text.startsWith('-')) {
    lineType = LineType.remove;
  } else if (selectedLine.text.startsWith('+')) {
    lineType = LineType.add;
  } else {
    return '';
  }

  const lineTexts = [];

  let ln = lineNo;

  let startLineNo = lineNo;
  // find previous line if any
  while (--ln > 1) {
    const line = lines[ln - 1];
    if (line.text.startsWith(' ')) {
      lineTexts.push(line.text);
      startLineNo = ln;
      break;
    } else if (line.text.startsWith('-')) {
      lineTexts.push(line.text.replace(/\-/, ' '));
      startLineNo = ln;
      break;
    }

    if (line.text.startsWith('@@')) {
      break;
    }
  }

  lineTexts.push(selectedLine.text);

  ln = lineNo;
  // find next line if any
  while (++ln <= lines.length) {
    const line = lines[ln - 1];
    if (line.text.startsWith(' ')) {
      lineTexts.push(line.text);
      break;
    } else if (line.text.startsWith('-')) {
      lineTexts.push(line.text.replace(/\-/, ' '));
      break;
    }

    if (line.text.startsWith('@@')) {
      break;
    }
  }

  let isRemove = selectedLine.text.startsWith('-');

  const hunkHeading = `@@ -${startLineNo},${isRemove ? lineTexts.length : lineTexts.length - 1} +${startLineNo},${
    isRemove ? lineTexts.length - 1 : lineTexts.length
  } @@`;

  // filter out the index line from the diff header, which does not make sense in patch scenarios
  const headerText = diff.header.lines.filter((l) => !l.startsWith('index '));

  // A valid patch starts with container diff header, and a hunk heading and actual patch content finally ends with a newline
  return [headerText, hunkHeading, lineTexts, '\n'].flat().join('\n');
};
