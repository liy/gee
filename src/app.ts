import { ipcMain } from 'electron';
import { getMainWindow } from 'main';
import { gee } from '../web/@types/gee';
import { REPOSITORY_OPEN } from '../web/constants';
import EventEmitter from '../web/EventEmitter';
import { fork, ChildProcess } from 'child_process';
import path from 'path';
import { Message } from './message';

class GeeApp extends EventEmitter {
  private rendererReady: Promise<void>;
  private readerProcess: ChildProcess;
  constructor() {
    super();

    this.readerProcess = fork(path.join(__dirname, '../dist/readerProcess.js'));

    let rendererReadyResolve: (() => void) | null;
    this.rendererReady = new Promise((resolve) => (rendererReadyResolve = resolve));
    ipcMain.on('RendererReady', async () => rendererReadyResolve!());
    ipcMain.on('RendererToMain', (_, event: gee.Event) => {
      this.emit(event.type, event.data);
    });
  }

  async open(repoPath: string) {
    // listen for messages from forked process for the repository data
    this.readerProcess.on('message', async (message: Message) => {
      if (message.type === 'repo.open.response') {
        await this.rendererReady;
        this.send({
          type: REPOSITORY_OPEN,
          data: message.data,
        });
      } else if (message.type === 'repo.changed') {
        console.log(message);
      }
    });

    // Send message to reader process
    this.readerProcess.send({
      type: 'repo.open',
      data: repoPath,
    });
  }

  send(event: gee.Event) {
    getMainWindow().webContents.send('MainToRenderer', event);
  }
}

export default new GeeApp();
