import parse, { Match } from 'ght';
import templates from './templates';

export default function predict(inputString: string, caretPosition: number): void {
  const { context, options, matches } = parse(inputString);

  // Appending the trail chunk
  if (caretPosition > inputString.trim().length) {
    console.log('last', matches[matches.length - 1]);
  } else if (caretPosition < inputString.length + 1) {
    matches.forEach((match, index) => {
      if (caretPosition >= match.index && caretPosition <= match.index + match.text.length + 1) {
        // Update on intermediate chunks, non-first and non-trail
        if (matches[index - 1]) {
          console.log('inter', matches[index - 1]);
        }
        // Update on first chunk, e.g., git
        else {
          console.log('first', matches[index]);
        }
      }
    });
  }
}
