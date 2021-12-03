// C:\Users\liy\Workspace\repos\checkout\.git\rebase-merge\git-rebase-todo

import { CallbackID } from '../constants';

export type RebaseAction =
  | 'pick'
  | 'reword'
  | 'edit'
  | 'squash'
  | 'fix'
  | 'exec'
  | 'break'
  | 'drop'
  | 'label'
  | 'reset'
  | 'merge';

const map: Record<string, RebaseAction> = {
  p: 'pick',
  pick: 'pick',
  r: 'reword',
  reword: 'reword',
  e: 'edit',
  edit: 'edit',
  s: 'squash',
  squash: 'squash',
  f: 'fix',
  fix: 'fix',
  x: 'exec',
  exec: 'exec',
  b: 'break',
  break: 'break',
  d: 'drop',
  drop: 'drop',
  l: 'label',
  label: 'label',
  t: 'reset',
  reset: 'reset',
  m: 'merge',
  merge: 'merge',
};

export interface Todo {
  action: RebaseAction;
  hash: string;
  message: string;
}

function readTodos() {
  return new Promise<Array<Todo>>((resolve) => {
    const todos = new Array<Todo>();
    window.api.readFileLine('./.git/rebase-merge/git-rebase-todo', {
      onReadLine: (line: string, id: CallbackID) => {
        line = line.trim();
        if (line === '' || line.startsWith('#')) return;

        const matches = line.match(/([a-zA-Z]+) (\S+) (.+)/);
        if (matches && matches.length >= 2) {
          todos.push({
            action: map[matches[1].toLowerCase()],
            hash: matches[2],
            message: matches[3] || '',
          });
        }
      },
      onClose: () => {
        resolve(todos.reverse());
      },
    });
  });
}

export const rebase = async () => {
  const args = ['git', 'rebase', '--interactive', 'origin/master'];
  await new Promise<void>((resolve) => {
    window.command.submit(args, {
      onReadLine: (line: string, routeId: CallbackID) => {
        window.command.kill(routeId);
      },
      onClose: () => {
        resolve();
      },
    });
  });

  return await readTodos();
};
