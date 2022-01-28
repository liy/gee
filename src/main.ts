// #!/usr/bin/env node

import { app, BrowserWindow, dialog, globalShortcut, Menu, Tray } from 'electron';
import * as path from 'path';
import { start } from './app';

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

    // Loading the application
    const indexPath = path.join(__dirname, '../index.html');
    mainWindow.loadFile(indexPath).then(() => {
      mainWindow.title = process.cwd();
    });
    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Second instance is passing the arguments to this first instance.
    // Simply open repository at second instance working directory
    app.on('second-instance', async (event, commandLine, workingDirectory) => {
      mainWindow.webContents.send('wd.changed', workingDirectory);
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

    start(process.cwd());
  });
} else {
  // console.log('single instance lock, exiting.');
  app.exit(0);
}

// Disable error dialogs
dialog.showErrorBox = function (title, content) {
  console.log(`${title}\n${content}`);
};
