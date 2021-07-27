import { ipcMain } from 'electron';
import { getMainWindow } from 'main';
import { gee } from '../web/@types/gee';
import { REPOSITORY_OPEN } from '../web/constants';
import EventEmitter from '../web/EventEmitter';
import RepositoryReader from './RepositoryReader';

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
    const promise = RepositoryReader.open(repoPath);
    await this.rendererReady;
    this.send({
      type: REPOSITORY_OPEN,
      data: await promise,
    });
  }

  send(event: gee.Event) {
    getMainWindow().webContents.send('MainToRenderer', event);
  }
}

export default new GeeApp();
