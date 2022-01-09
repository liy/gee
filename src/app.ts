import { ipcMain } from 'electron';
import { ChildProcess, spawn, execFile } from 'child_process';
import {
  COMMAND_INVOKE,
  COMMAND_KILL,
  COMMAND_SUBMIT,
  COMMIT_SELECTED,
  CommandProcess,
  CallbackID,
  REPOSITORY_OPEN,
} from '../web/constants';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

class GeeApp {
  workingDirectory: string | undefined;

  constructor() {}

  init(workingDirectory: string) {
    this.workingDirectory = workingDirectory;

    // ipcMain.handle(REPOSITORY_OPEN, async (_, repoPath: string) => {
    //   return RPC.getRepository(repoPath);
    // });

    ipcMain.handle(COMMIT_SELECTED, () => {
      return 'test';
    });

    ipcMain.handle('fileLine.read', async (event, filePath: string, id: CallbackID) => {
      const fileStream = fs.createReadStream(path.resolve(this.workingDirectory!, filePath));
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      rl.on('line', (line) => {
        event.sender.send(CommandProcess.ReadLine, line, id);
      });
      rl.on('close', () => {
        console.log('close');
        event.sender.send(CommandProcess.Close, id);
      });
    });

    ipcMain.handle('file.read', async (event, filePath: string) => {
      return new Promise((resolve, reject) => {
        fs.readFile(path.resolve(this.workingDirectory!, filePath), (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    });

    ipcMain.handle('file.save', async (event, filePath: string, patchText: string) => {
      return new Promise<string>((resolve, reject) => {
        fs.writeFile(filePath, patchText, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(filePath);
          }
        });
      });
    });

    ipcMain.handle(COMMAND_INVOKE, (_, args: Array<string>) => {
      return new Promise((resolve, reject) => {
        execFile(
          args[0],
          args.slice(1),
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

    const cliMap = new Map<CallbackID, [readline.Interface, ChildProcess]>();

    // Command, FIXME: reuse child process
    ipcMain.on(COMMAND_SUBMIT, (event, args: Array<string>, id: CallbackID) => {
      const cli = spawn(args[0], args.slice(1), { cwd: this.workingDirectory });
      const rl = readline.createInterface({ input: cli.stdout });
      cliMap.set(id, [rl, cli]);
      rl.on('line', (line) => {
        event.sender.send(CommandProcess.ReadLine, line, id);
      });
      rl.on('close', () => {
        console.log('close');
        event.sender.send(CommandProcess.Close, id);
      });
    });

    ipcMain.handle(COMMAND_KILL, (_, id: CallbackID) => {
      if (cliMap.has(id)) {
        console.log('kill', id);
        const [rl, cli] = cliMap.get(id)!;
        if (cli.kill()) {
          cliMap.delete(id);
          console.log('process successfully killed, closing readline');
          rl.close();
        } else {
          // TODO: log that the process can't be killed
        }
      }
    });
  }
}

export default new GeeApp();
