import { ipcMain } from 'electron';
import RPC from './RPC';
import { ChildProcess, spawn, execFile } from 'child_process';
import {
  COMMAND_INVOKE,
  COMMAND_KILL,
  COMMAND_SUBMIT,
  COMMIT_SELECTED,
  GitProcess,
  OutputRouteId,
  REPOSITORY_OPEN,
} from '../web/constants';
import * as readline from 'readline';

class GeeApp {
  workingDirectory: string | undefined;

  constructor() {}

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

    const cliMap = new Map<OutputRouteId, [readline.Interface, ChildProcess]>();

    // Command, FIXME: reuse child process
    ipcMain.on(COMMAND_SUBMIT, (event, args: Array<string>, id: OutputRouteId) => {
      const cli = spawn('git', args, { cwd: this.workingDirectory });
      const rl = readline.createInterface({ input: cli.stdout });
      cliMap.set(id, [rl, cli]);
      rl.on('line', (line) => {
        event.sender.send(GitProcess.ReadLine, line, id);
      });

      // cli.on('exit', () => {
      //   console.log('exit');
      //   event.sender.send(GitProcess.Exit, id);
      // });
      rl.on('close', () => {
        console.log('close');
        event.sender.send(GitProcess.Close, id);
      });
    });

    ipcMain.handle(COMMAND_KILL, (_, id: OutputRouteId) => {
      if (cliMap.has(id)) {
        console.log('kill', id);
        const [rl, cli] = cliMap.get(id)!;
        if (cli.kill()) {
          rl.close();
          cliMap.delete(id);
          console.log('successfully killed, close rl');
        } else {
          // TODO: log that the process can't be killed
        }
      }
    });
  }
}

export default new GeeApp();
