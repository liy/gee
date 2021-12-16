import { LineStyle } from 'pixi.js';
import { Diff, Hunk, HunkLine, HunkLineType } from './Diff';

// TODO: handle delete file and new files
export const createPatch = (lineNos: number[], diff: Diff) => {
  // only allows select add or remove lines
  lineNos = lineNos.filter((lineNo) => {
    return diff.getLine(lineNo).text.startsWith('-') || diff.getLine(lineNo).text.startsWith('+');
  });
  const selectedLineNos = new Set(lineNos);

  const hunkLineTexts = diff.hunks
    .map((hunk, index) => {
      const hunkLines = new Array<string>();
      let oldLength = 0;
      let newLength = 0;
      let ignoreHunk = true;
      hunk.lines.forEach((line) => {
        if (line.text.startsWith('@@')) {
          // ignore the old hunk heading, it will be updated and prepended manually
        } else if (line.text.startsWith('+')) {
          const lineNo = diff.getLineNo(line);
          if (lineNo && selectedLineNos.has(lineNo)) {
            newLength++;
            ignoreHunk = false;
            hunkLines.push(line.text);
          }
          // If + line is not selected, it should no be included in the patch.
          // So it is not included in hunkLines and does not increase old or new line count
        } else if (line.text.startsWith('-')) {
          const lineNo = diff.getLineNo(line);
          // If - line is selected the line won't be in the new file so only increase old line cout
          if (lineNo && selectedLineNos.has(lineNo)) {
            oldLength++;
            ignoreHunk = false;
            hunkLines.push(line.text);
          }
          // If - line is not selected it means it means the old line will be presented in the patch
          // So both new and old line count will be increased and we have to manually remove - prefix.
          else {
            oldLength++;
            newLength++;
            hunkLines.push(line.text.replace(/\-/, ' '));
          }
        }
        // Normal lines in the patch, simply keep track of old and new line count
        else if (line.text.startsWith(' ')) {
          oldLength++;
          newLength++;
          hunkLines.push(line.text);
        }
        // Anything else we just pushing it into the patch hunk lines
        else {
          hunkLines.push(line.text);
        }
      });

      if (!ignoreHunk) {
        const oldRange = (hunk.heading.oldRange = [hunk.heading.oldRange[0], oldLength]);
        const newRange = (hunk.heading.newRange = [hunk.heading.newRange[0], newLength]);

        return `@@ -${oldRange[0]},${oldRange[1]} +${newRange[0]},${newRange[1]} @@ ${
          hunk.heading.title
        }\n${hunkLines.join('\n')}`;
      }

      return null;
    })
    .filter((text) => text !== null);

  return diff.heading.text + '\n' + hunkLineTexts.join('\n') + '\n';
};
