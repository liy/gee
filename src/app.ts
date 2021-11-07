import { ipcMain } from 'electron';
import { getMainWindow } from 'main';
import { gee } from '../web/@types/gee';
import { REPOSITORY_OPEN } from '../web/constants';
import EventEmitter from '../web/EventEmitter';
import { fork, ChildProcess } from 'child_process';
import path from 'path';
import { Message } from './message';
import RPC from 'RPC';

class GeeApp extends EventEmitter {
  private rendererReady: Promise<void>;
  constructor() {
    super();

    let rendererReadyResolve: (() => void) | null;
    this.rendererReady = new Promise((resolve) => (rendererReadyResolve = resolve));
    ipcMain.on('RendererReady', async () => rendererReadyResolve!());
    ipcMain.on('RendererToMain', (_, event: gee.Event) => {
      this.emit(event.type, event.data);
    });
  }

  async open(repoPath: string) {
    // listen for messages from forked process for the repository data
    // this.readerProcess.on('message', async (message: Message) => {
    //   if (message.type === 'repo.open.response') {
    //     await this.rendererReady;
    //     this.send({
    //       type: REPOSITORY_OPEN,
    //       data: message.data,
    //     });
    //   } else if (message.type === 'repo.changed') {
    //     console.log(message);
    //   }
    // });

    // // Send message to reader process
    // this.readerProcess.send({
    //   type: 'repo.open',
    //   data: repoPath,
    // });
    const [data] = await Promise.all([RPC.getRepository(), this.rendererReady]);

    this.send({
      type: REPOSITORY_OPEN,
      data,
    });
  }

  send(event: gee.Event) {
    getMainWindow().webContents.send('MainToRenderer', event);
  }
}

export default new GeeApp();
