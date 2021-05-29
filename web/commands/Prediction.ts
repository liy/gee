import parse, { isOption, Command } from 'ght';
import getGitTemplate from './templates';
import templates from './templates';

export default function predict(inputString: string, caretPosition: number): void {
  const endingWithSpace = /\s$/.test(inputString);
  const { args, options, matches } = parse(inputString.substring(0, caretPosition));
  // // console.log(args, options, matches);

  // typing options
  if (options.length !== 0) {
    // ending with space or ending with = sign, then it should suggests value of the option
    if (endingWithSpace || /=$/.test(inputString)) {
      // suggests option values, e.g., branches etc.
    } else {
      // suggests rest (filter out typed options) of the options
    }
  }
  // typing arg 2
  else if (args[1]) {
    // suggests all options
    if (endingWithSpace) {
    }
    // suggests arguments that begin with typed arg 2
    else {
    }
  }
  // Typing first arg or starting next arg
  else {
    // suggests arguments 2
    if (endingWithSpace) {
    }
    // suggests arguments 1
    else {
      console.log(inputString, `git`.substring(inputString.length, `git`.length));
    }
  }
}
