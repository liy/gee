// All of the Node.js APIs are available in the preload process.

import { contextBridge, ipcRenderer } from 'electron';
import { Notification } from '../web/@types/window';
import { REPOSITORY_OPEN } from '../web/constants';

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
});
