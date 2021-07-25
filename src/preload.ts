// All of the Node.js APIs are available in the preload process.

import { contextBridge, ipcRenderer } from 'electron';

// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', async () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerText = text;
    }
  };
  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type as keyof NodeJS.ProcessVersions]);
  }
});

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Send to main
  send: (data: any) => {
    ipcRenderer.send('RendererToMain', data);
  },
  // receive from main
  onReceive: (func: (args: any) => void) => {
    // Deliberately strip event as it includes `sender`
    ipcRenderer.on('MainToRenderer', (event, args) => {
      func(args);
    });
  },
  git: (command: string) => {
    ipcRenderer.send('git', command);
  },
});
