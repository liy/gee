// All of the Node.js APIs are available in the preload process.

import { contextBridge, ipcRenderer } from 'electron';
import { gee } from '../web/@types/gee';

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
  send: (event: gee.Event) => {
    ipcRenderer.send('RendererToMain', event);
  },
  rendererReady: () => {
    ipcRenderer.send('RendererReady');
  },
  // receive from main
  onReceive: (func: (evt: gee.Event) => void) => {
    // Deliberately strip event as it includes `sender`
    ipcRenderer.on('MainToRenderer', (_, event: gee.Event) => {
      console.log(event);
      func(event);
    });
  },
});
