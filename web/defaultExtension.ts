import { keymap, highlightSpecialChars, drawSelection, highlightActiveLine } from '@codemirror/view';
import { Extension, EditorState } from '@codemirror/state';
import { highlightActiveLineGutter } from '@codemirror/gutter';
import { bracketMatching } from '@codemirror/matchbrackets';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { defaultHighlightStyle } from '@codemirror/highlight';

export const diffExtension: Extension = [
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  drawSelection(),
  EditorState.allowMultipleSelections.of(true),
  defaultHighlightStyle.fallback,
  bracketMatching(),
  highlightActiveLine(),
  highlightSelectionMatches(),
];
