import { ipcMain } from 'electron';
import EventEmitter from '../web/EventEmitter';
import RPC from 'RPC';
import { spawn, execFile } from 'child_process';
import { COMMAND_INVOKE, COMMAND_SUBMIT, COMMIT_SELECTED, REPOSITORY_OPEN } from '../web/constants';
import readline from 'readline';
import { OutputRouteId } from '../web/CommandRoute';

class GeeApp extends EventEmitter {
  workingDirectory: string | undefined;

  constructor() {
    super();
  }

  init(workingDirectory: string) {
    this.workingDirectory = workingDirectory;

    ipcMain.handle(REPOSITORY_OPEN, async (_, repoPath: string) => {
      return RPC.getRepository(repoPath);
    });

    ipcMain.handle(COMMIT_SELECTED, () => {
      return 'test';
    });

    ipcMain.handle(COMMAND_INVOKE, (_, args: Array<string>) => {
      return new Promise((resolve, reject) => {
        execFile(
          'git',
          args,
          {
            cwd: this.workingDirectory,
          },
          (err: any, stdout: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(stdout);
            }
          }
        );
      });
    });

    // Command, FIXME: reuse child process
    ipcMain.on(COMMAND_SUBMIT, (event, args: Array<string>, routeId: OutputRouteId) => {
      const cli = spawn('git', args, { cwd: this.workingDirectory });
      const rl = readline.createInterface({ input: cli.stdout });
      rl.on('line', (line) => {
        event.sender.send('command.output.line', line, routeId);
      });
      // When command output is closed, CommandRoute will remove the callback
      rl.on('close', () => {
        event.sender.send('command.output.close', routeId);
      });
    });
  }
}

export default new GeeApp();
