import { ChildProcess, execFile, spawn } from 'child_process';
import { ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { CallbackID, CommandProcess, COMMAND_INVOKE, COMMAND_KILL, COMMAND_SUBMIT } from '../web/constants';

let currentWorkingDirectory = '';

export const start = async (initialWorkingDirectory: string) => {
  currentWorkingDirectory = initialWorkingDirectory;

  ipcMain.handle('wd.get', () => currentWorkingDirectory);
  ipcMain.handle('wd.set', (event, wd) => (currentWorkingDirectory = wd));

  ipcMain.handle('fileLine.read', async (event, filePath: string, id: CallbackID, wd: string) => {
    const fileStream = fs.createReadStream(path.resolve(wd, filePath));
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

  ipcMain.handle('file.read', async (event, filePath: string, wd: string) => {
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(wd, filePath), (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  });

  ipcMain.handle('file.save', async (event, filePath: string, patchText: string, wd: string) => {
    return new Promise<string>((resolve, reject) => {
      fs.writeFile(path.resolve(wd, filePath), patchText, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(filePath);
        }
      });
    });
  });

  ipcMain.handle(COMMAND_INVOKE, (_, args: Array<string>, wd: string) => {
    return new Promise((resolve, reject) => {
      execFile(
        args[0],
        args.slice(1),
        {
          cwd: wd,
          shell: true,
        },
        (err, stdout, stderr) => {
          if (err) {
            reject(err);
          } else {
            // some times the result is in stderr, even though there is not error
            resolve(stdout || stderr);
          }
        }
      );
    });
  });

  const cliMap = new Map<CallbackID, [readline.Interface, ChildProcess]>();

  // Command, FIXME: reuse child process
  ipcMain.on(COMMAND_SUBMIT, (event, args: Array<string>, wd: string, id: CallbackID) => {
    const cli = spawn(args[0], args.slice(1), { cwd: wd });
    const rl = readline.createInterface({ input: cli.stdout || cli.stderr });
    cliMap.set(id, [rl, cli]);
    rl.on('line', (line) => {
      event.sender.send(CommandProcess.ReadLine, line, id);
    });
    rl.on('close', () => {
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
};
