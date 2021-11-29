// All of the Node.js APIs are available in the preload process.

import { contextBridge, ipcRenderer } from 'electron';
import { Repository__Output } from 'protobuf/pb/Repository';
import { Notification } from '../../web/@types/window';
// Routes the commmand output to the correct callback
import CallbackStore from './CallbackStore';
import {
  CommandCallback,
  COMMAND_KILL,
  COMMAND_SUBMIT,
  GitProcess,
  OutputRouteId,
  REPOSITORY_OPEN,
} from '../../web/constants';

// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', async () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerText = text;
    }
  };
  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type as keyof NodeJS.ProcessVersions] as string);
  }
});

// console.log(process.argv);

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
//
// The function naming should be bounded with renderer. For example, openRepository means render ask main process to open a repository
// and onNotification should be render process listens to a notification from main process.
contextBridge.exposeInMainWorld('api', {
  openRepository: async (path: string) => {
    return await ipcRenderer.invoke(REPOSITORY_OPEN, path);
  },

  onNotification: (callback: (_: Notification) => void) => {
    ipcRenderer.on('notification', (event: Electron.IpcRendererEvent, n: Notification) => callback(n));
  },

  onOpenRepository: (callback: (data: Repository__Output) => void) => {
    ipcRenderer.on('openRepository', (event: Electron.IpcRendererEvent, data: Repository__Output) => callback(data));
  },
});

const callbacks = new CallbackStore();
contextBridge.exposeInMainWorld('command', {
  invoke: async (args: Array<string>): Promise<string> => {
    return await ipcRenderer.invoke(COMMAND_SUBMIT, args);
  },

  kill: (routeId: OutputRouteId): void => {
    ipcRenderer.invoke(COMMAND_KILL, routeId);
  },

  submit: (args: Array<string>, callback: CommandCallback) => {
    const routeId = callbacks.add(callback);
    console.log('submitCommand', routeId);
    ipcRenderer.send(COMMAND_SUBMIT, args, routeId);
  },
});

// read line
ipcRenderer.on(GitProcess.ReadLine, (_, line: string, routeId: OutputRouteId) => {
  callbacks.onReadline(routeId, line);
});

// error
ipcRenderer.on(GitProcess.Error, (_, err: Error, routeId: OutputRouteId) => {
  callbacks.onError(routeId, err);
});

// Remove the route if command output is closed
ipcRenderer.on(GitProcess.Close, (_, routeId: OutputRouteId) => {
  callbacks.onClose(routeId);
});

// ipcRenderer.on(GitProcess.Exit, (_, routeId: OutputRouteId) => {
//   callbacks.onExit(routeId);
// });
