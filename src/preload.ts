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
    ipcRenderer.send('toMain', data);
  },
  // receive from main
  receive: (func: (args: any) => void) => {
    // Deliberately strip event as it includes `sender`
    ipcRenderer.on('fromMain', (event, args) => {
      func(args);
    });
  },
  git: (args: { command: string; data: any }) => {
    ipcRenderer.send('git', args);
  },
  terminalKeyStroke: (data: any) => {
    ipcRenderer.send('terminal.keystroke', data);
  },
  terminalData: (func: (args: any) => void) => {
    ipcRenderer.on('terminal.incomingData', (event, args) => {
      func(args);
    });
  },
});
