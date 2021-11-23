// All of the Node.js APIs are available in the preload process.

import { contextBridge, ipcRenderer } from 'electron';
import { Repository__Output } from 'protobuf/pb/Repository';
import { Notification } from '../web/@types/window';
// Routes the commmand output to the correct callback
import CommandRoute, { OutputRouteId, CommandCallback } from '../web/CommandRoute';
import { COMMAND_SUBMIT, REPOSITORY_OPEN } from '../web/constants';

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

console.log(process.argv);

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
//
// The function naming should be bounded with renderer. For example, openRepository means render ask main process to open a repository
// and onNotification should be render process listens to a notification from main process.
contextBridge.exposeInMainWorld('api', {
  openRepository: async (path: string) => {
    return await ipcRenderer.invoke(REPOSITORY_OPEN, path);
  },

  invokeCommand: async (args: Array<string>): Promise<string> => {
    return await ipcRenderer.invoke(COMMAND_SUBMIT, args);
  },

  submitCommand: (args: Array<string>, callback: CommandCallback) => {
    const routeId = CommandRoute.add(callback);
    ipcRenderer.send(COMMAND_SUBMIT, args, routeId);
  },

  onNotification: (callback: (_: Notification) => void) => {
    ipcRenderer.on('notification', (event: Electron.IpcRendererEvent, n: Notification) => callback(n));
  },

  onOpenRepository: (callback: (data: Repository__Output) => void) => {
    ipcRenderer.on('openRepository', (event: Electron.IpcRendererEvent, data: Repository__Output) => callback(data));
  },
});

// Route
ipcRenderer.on('command.output.line', (_, line: string, routeId: OutputRouteId) => {
  CommandRoute.readline(routeId, line);
});
// error
ipcRenderer.on('command.output.error', (_, err: Error, routeId: OutputRouteId) => {
  CommandRoute.error(routeId, err);
});
// Remove the route if command output is closed
ipcRenderer.on('command.output.close', (_, routeId: OutputRouteId) => {
  CommandRoute.close(routeId);
});
