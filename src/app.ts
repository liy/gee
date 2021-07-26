import { ipcMain } from 'electron';
import { getMainWindow } from 'main';
import { gee } from '../web/@types/gee';
import { REPOSITORY_DATA_INIT } from '../web/constants';
import EventEmitter from '../web/EventEmitter';
import RepositoryReader from './RepositoryReader';

class GeeApp extends EventEmitter {
  constructor() {
    super();
  }

  init(repoPath: string): void {
    const promise = RepositoryReader.open(repoPath);
    ipcMain.on('RendererReady', async () => {
      this.send({
        type: REPOSITORY_DATA_INIT,
        data: await promise,
      });
    });

    ipcMain.on('RendererToMain', (_, event: gee.Event) => {
      this.emit(event.type, event.data);
    });
  }

  send(event: gee.Event) {
    getMainWindow().webContents.send('MainToRenderer', event);
  }
}

export default new GeeApp();
