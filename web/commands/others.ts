import minimist from 'minimist';

/**
 * Whether the command is a git command
 */
export function isGit(args: minimist.ParsedArgs): boolean {
  return args._[0] === 'git';
}
