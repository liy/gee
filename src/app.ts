import { ipcMain } from 'electron';
import EventEmitter from '../web/EventEmitter';
import RPC from 'RPC';
import { COMMIT_SELECTED, REPOSITORY_OPEN } from '../web/constants';

class GeeApp extends EventEmitter {
  constructor() {
    super();
  }

  init() {
    ipcMain.handle(REPOSITORY_OPEN, async (_, repoPath: string) => {
      return RPC.getRepository(repoPath);
    });

    ipcMain.handle(COMMIT_SELECTED, () => {
      return 'test';
    });
  }
}

export default new GeeApp();
