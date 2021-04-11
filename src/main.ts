import { app, BrowserWindow } from 'electron';
import path = require('path');
// import init from './app';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('electron-reload')(__dirname);

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 1000,
    width: 1720,
    webPreferences: {
      preload: path.join(__dirname, '../dist/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  const mainWindow = createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  init(mainWindow);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

import os from 'os';
import pty from 'node-pty';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
stats.dom.style.left = 'unset';
stats.dom.style.right = '0';

function init(repoData: RepositoryData) {
  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  });

  ptyProcess.on('data', function (data) {
    process.stdout.write(data);
  });

  ptyProcess.write('ls\r');
  ptyProcess.resize(100, 40);
  ptyProcess.write('ls\r');
}
