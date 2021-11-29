// #!/usr/bin/env node

import { app, BrowserWindow, dialog, globalShortcut, Menu, Tray } from 'electron';
import * as path from 'path';
import GeeApp from './app';
import { debugMsg } from './debugUtils';
import RPC from './RPC';

const argv = require('minimist')(process.argv.slice(2));

// If dev mode then allow reload electron main and renderer on source file changes
if (process.env.NODE_ENV !== 'production') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
  });
}

function createMainWindow() {
  const preloadPath = path.join(__dirname, './context/preload.js');
  // Create the browser window.
  const browserWindow = new BrowserWindow({
    width: 1100,
    height: 768,
    autoHideMenuBar: true,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
      additionalArguments: [],
    },
  });

  return browserWindow;
}

// Avoid GC causing tray icon disappers.
let tray = null;

if (app.requestSingleInstanceLock()) {
  app.on('ready', async () => {
    const mainWindow = createMainWindow();

    const wd = process.env.NODE_ENV !== 'production' ? '../repos/checkout' : process.cwd();

    // Loading the application
    const indexPath = path.join(__dirname, '../index.html');
    mainWindow.loadFile(indexPath).then(async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      mainWindow.webContents.send('openRepository', await RPC.getRepository(wd));
      mainWindow.title = wd;
    });
    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Second instance is passing the arguments to this first instance.
    // Simply open repository at second instance working directory
    app.on('second-instance', async (event, commandLine, workingDirectory) => {
      GeeApp.workingDirectory = workingDirectory;
      mainWindow.webContents.send('openRepository', await RPC.getRepository(workingDirectory));
      mainWindow.title = workingDirectory;
      mainWindow.show();
    });

    // Close to the tray
    mainWindow.on('close', (event) => {
      event.preventDefault();
      mainWindow.hide();
      mainWindow.setSkipTaskbar(true);
    });

    // Setup tray
    const iconPath = path.join(__dirname, '../images/git.png');
    console.log('iconPath', iconPath);
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'exit',
        click: () => mainWindow.destroy(),
      }, //We need to have a real exit here (direct forced exit here)
    ]);
    tray.setToolTip('Gee');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
      //We simulate the desktop program here to click the notification area icon to achieve the function of opening and closing the application
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      mainWindow.isVisible() ? mainWindow.setSkipTaskbar(false) : mainWindow.setSkipTaskbar(true);
    });

    // Setup shortcuts
    globalShortcut.register('Shift+Alt+E', () => {
      mainWindow.show();
    });

    GeeApp.init(wd);
  });
} else {
  console.log('single instance lock, exiting.');
  app.exit();
}

// Disable error dialogs
dialog.showErrorBox = function (title, content) {
  console.log(`${title}\n${content}`);
};
