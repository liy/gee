// C:\Users\liy\Workspace\repos\checkout\.git\rebase-merge\git-rebase-todo

import { OutputRouteId } from '../constants';

export const rebase = async () => {
  const args = ['rebase', '--interactive', 'origin/master'];
  await new Promise<void>((resolve) => {
    // Note that onClose will not be triggered when command is killed
    window.command.submit(args, {
      onReadLine: (line: string, routeId: OutputRouteId) => {
        console.log(line, routeId);
        window.command.kill(routeId);
      },
      onError: (err) => {
        console.log(err);
      },
      onClose: () => {
        console.log('close');
      },
    });
  });

  console.log('done');
};
