import parse from 'ght';
import { option } from 'yargs';
import { templates, CommandTemplate } from './templates';

export default function predict(inputString: string, caretPosition: number): void {
  inputString = inputString.substring(0, caretPosition);
  const endingWithSpace = /\s$/.test(inputString);
  const { args, options, matches } = parse(inputString);
  // console.log(args, options);

  // Suggest all the commands
  if ((endingWithSpace && args.length === 1) || (!endingWithSpace && args.length === 2 && option.length === 0)) {
  } else if (endingWithSpace && args.length === 2) {
  }
  // const lastMatch = matches[matches.length - 1];
  // if (lastMatch.isOption) {
  // }

  // if (args[2]) {
  // }
  // // typing options
  // else if (options.length !== 0) {
  //   // ending with space or ending with = sign, then it should suggests value of the option
  //   if (endingWithSpace || /=$/.test(inputString)) {
  //     // suggests option values, e.g., branches etc.
  //     const option = options[options.length - 1];
  //     const optionTemplate = templates[args[0]]
  //       .find((arg) => arg.name === args[1])
  //       ?.options.find((o) => o.name === option.name);
  //     if (optionTemplate?.param) {
  //       // TODO: suggest param
  //       console.log('suggest option params', optionTemplate.param);
  //     }
  //   } else {
  //     const regex = new RegExp(`^${options[options.length - 1].name}`);
  //     // suggests rest (filter out typed options) of the options
  //     const candiadates = templates[args[0]].find((arg) => arg.name === args[1])?.options;
  //     const suggestions = candiadates?.filter((o) => regex.test(o.name));
  //     console.log('suggest options', suggestions);
  //   }
  // }
  // // typing arg 2
  // else if (args[1]) {
  //   // suggests all options
  //   if (endingWithSpace) {
  //     const allOptions = templates[args[0]].find((arg) => arg.name === args[1])?.options;
  //     console.log('opiion', allOptions);
  //   }
  //   // suggests arguments that begin with typed arg 2
  //   else {
  //     const regex = new RegExp(`^${args[1]}`);
  //     const suggestions = templates[args[0]].filter((arg) => regex.test(arg.name));
  //     console.log('suggest args2', suggestions);
  //   }
  // }
  // // Typing first arg or starting next arg
  // else {
  //   // suggests arguments 2
  //   if (endingWithSpace) {
  //     const allArgs2 = templates[args[0]];
  //     console.log('all args2', allArgs2);
  //   }
  //   // suggests arguments 1
  //   else {
  //     const regex = new RegExp(`^${inputString}`);
  //     const candiadates = Object.keys(templates).filter((arg) => regex.test(arg));
  //     const suggestions = candiadates.map((arg) => templates[arg]);
  //     console.log('suggest args1', suggestions);
  //   }
  // }
}
