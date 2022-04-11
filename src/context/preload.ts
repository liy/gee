// All of the Node.js APIs are available in the preload process.

import { contextBridge, ipcRenderer } from 'electron';
import { Notification } from '../../web/@types/window';
import {
  CallbackID,
  CommandCallback,
  CommandProcess,
  COMMAND_INVOKE,
  COMMAND_KILL,
  COMMAND_SUBMIT,
} from '../../web/constants';
// Routes the commmand output to the correct callback
import CallbackStore from './CallbackStore';

// It has the same sandbox as a Chrome extension.
// window.addEventListener('DOMContentLoaded', async () => {
//   const replaceText = (selector: string, text: string) => {
//     const element = document.getElementById(selector);
//     if (element) {
//       element.innerText = text;
//     }
//   };
//   for (const type of ['chrome', 'node', 'electron']) {
//     replaceText(`${type}-version`, process.versions[type as keyof NodeJS.ProcessVersions] as string);
//   }
// });

// console.log(process.argv);

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
//
// The function naming should be bounded with renderer. For example, openRepository means render ask main process to open a repository
// and onNotification should be render process listens to a notification from main process.
contextBridge.exposeInMainWorld('api', {
  // openRepository: async (path: string) => {
  //   return await ipcRenderer.invoke(REPOSITORY_OPEN, path);
  // },

  // onOpenRepository: (callback: (data: Repository__Output) => void) => {
  //   ipcRenderer.on('openRepository', (event: Electron.IpcRendererEvent, data: Repository__Output) => callback(data));
  // },

  appReady() {
    return ipcRenderer.invoke('app.ready');
  },

  // Get working directory from main process
  getWorkingDirectory: (): Promise<string | null> => {
    return ipcRenderer.invoke('wd.get');
  },

  // Set working directory for main process
  // setWorkingDirectory(path: string) {
  //   ipcRenderer.invoke('wd.set', path);
  // },

  // Fires if main process changes the working directory, e.g., when application is launched in a different directory via cli
  onWorkingDirectoryChanged(callback: (path: string) => void) {
    ipcRenderer.on('wd.changed', (event: Electron.IpcRendererEvent, path: string) => callback(path));
  },

  onFileSysChanged: (callback: () => void) => {
    const listener = (event: Electron.IpcRendererEvent, n: Notification) => callback();
    ipcRenderer.on('fs.changed', listener);

    return () => {
      ipcRenderer.off('fs.changed', listener);
    };
  },

  /**
   * When git index file changed
   * @param callback callback
   * @returns callback clean up
   */
  onIndexChanged: (callback: () => void) => {
    const listener = (event: Electron.IpcRendererEvent, n: Notification) => callback();
    ipcRenderer.on('git.index.changed', listener);

    return () => {
      ipcRenderer.off('git.index.changed', listener);
    };
  },

  onNotification: (callback: (_: Notification) => void) => {
    ipcRenderer.on('notification', (event: Electron.IpcRendererEvent, n: Notification) => callback(n));
  },
  readFileLine: (path: string, callback: CommandCallback, wd: string) => {
    const routeId = callbacks.add(callback);
    ipcRenderer.invoke('fileLine.read', path, routeId, wd);
  },

  readFile: (path: string, wd: string): Promise<ArrayBuffer> => {
    return ipcRenderer.invoke('file.read', path, wd);
  },

  saveFile: (path: string, patch: string, wd: string): Promise<string> => {
    return ipcRenderer.invoke('file.save', path, patch, wd);
  },
});

const callbacks = new CallbackStore();
contextBridge.exposeInMainWorld('command', {
  invoke: async (args: Array<string>, wd: string): Promise<string> => {
    return await ipcRenderer.invoke(COMMAND_INVOKE, args, wd);
  },

  kill: (routeId: CallbackID): void => {
    ipcRenderer.invoke(COMMAND_KILL, routeId);
  },

  submit: (args: Array<string>, wd: string, callback: CommandCallback) => {
    const routeId = callbacks.add(callback);
    ipcRenderer.send(COMMAND_SUBMIT, args, wd, routeId);
  },
  onCommand: (callback: (cmd: string[]) => void) => {
    ipcRenderer.on('onCommand', (event: Electron.IpcRendererEvent, cmd: string[]) => callback(cmd));
  },
});

// read line
ipcRenderer.on(CommandProcess.ReadLine, (_, line: string, routeId: CallbackID) => {
  callbacks.onReadline(routeId, line);
});

// error
ipcRenderer.on(CommandProcess.Error, (_, err: Error, routeId: CallbackID) => {
  console.log('error', err);
  callbacks.onError(routeId, err);
});

// Remove the route if command output is closed
ipcRenderer.on(CommandProcess.Close, (_, routeId: CallbackID) => {
  console.log('close', routeId);
  callbacks.onClose(routeId);
});
