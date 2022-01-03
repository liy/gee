import { Diff } from './Diff';

// TODO: clean this up
function transformLine(lineText: string, isSelected: boolean, reverse: boolean): string {
  if (reverse) {
    // In reverse mode non-selected + line need sign removing
    if (!isSelected && lineText.startsWith('+')) {
      return ' ' + lineText.substring(1);
    }
    // Selected line start with + needs reverting the sign, e.g., unstage a + line needs - the same line)
    else if (lineText.startsWith('+')) {
      return '-' + lineText.substring(1);
    }
    // Selected or non-selected line start with - needs reverting the sign
    else if (lineText.startsWith('-')) {
      return '+' + lineText.substring(1);
    }
    // Should not happen, only - or + line should be selectable
    // just return the original line text
    else {
      return lineText;
    }
  }

  // Line not selected and start with - needs removing sign
  if (!isSelected && lineText.startsWith('-')) {
    return ' ' + lineText.substring(1);
  }

  return lineText;
}

function getPatchHeading(diff: Diff, reverse: boolean): string {
  // manually construct diff heading if diff is deleting
  if (diff.heading.deleted && reverse) {
    return diff.heading.lines[0] + '\n' + 'new file mode 100644';
  } else if (diff.heading.new && reverse) {
    const chunks = diff.heading.lines[0].split(' ');
    return `${diff.heading.lines[0]}\n--- ${chunks[2]}\n+++ ${chunks[3]}`;
  } else {
    return diff.heading.lines.filter((text) => !text.startsWith('index')).join('\n');
  }
}

/**
 *
 * @param lineNos
 * @param diff
 * @param reverse Whether to reverse the diff manually. Set it to true if you are unstaging individual line or hunk
 * @returns
 */
export const createPatch = (lineNos: number[], diff: Diff, reverse = false) => {
  // Only allows select add or remove lines
  lineNos = lineNos.filter((lineNo) => {
    const line = diff.getLine(lineNo);
    return line.text.startsWith('-') || line.text.startsWith('+');
  });
  const selectedLineNos = new Set(lineNos);

  // Loop all hunks and make the necessary transformation on first character of each line
  const hunkContents = diff.hunks
    .map((hunk) => {
      // Transform the first character of every line
      const lineTexts = hunk.lines
        .map((line) => {
          const lineNo = diff.getLineNo(line);
          const isLineSelected = lineNo ? selectedLineNos.has(lineNo) : false;
          const lineText = transformLine(line.text, isLineSelected, reverse);

          // Ignore any line starts with + and not selected. + means newly added line and if it is not selected
          // it should not be added to the patch. Note that - line is different, it means it is a old line and should
          // still be added to the patch even the line is not selected
          if (lineText.startsWith('+') && !isLineSelected) {
            return null;
          }

          return lineText;
        })
        // Filter out the unselected + line
        .filter((lineText) => {
          return lineText !== null;
        }) as Array<string>;

      // Count the new, old and total number of changes
      let oldLength = 0;
      let newLength = 0;
      let numChanges = 0;
      for (const lineText of lineTexts) {
        if (lineText.startsWith('-') || lineText.startsWith(' ')) {
          oldLength++;
        }
        if (lineText.startsWith('+') || lineText.startsWith(' ')) {
          newLength++;
        }
        if (lineText.startsWith('+') || lineText.startsWith('-')) {
          numChanges++;
        }
      }

      // If this hunk has no change simply return null so we can filter it out later
      if (numChanges == 0) return null;

      const heading = `@@ -${hunk.heading.oldRange[0]},${oldLength} +${hunk.heading.newRange[0]},${newLength} @@`;

      return heading + '\n' + lineTexts.slice(1).join('\n');
    })
    // Filter out any empty hunk text
    .filter((text) => text !== null);

  // Patch is empty if no hunk needs applying
  if (hunkContents.length == 0) return null;

  // Specifies correct diff heading, it add correct header for new or deleted file patch
  return getPatchHeading(diff, reverse) + '\n' + hunkContents.join('\n') + '\n';
};
