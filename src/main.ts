// #!/usr/bin/env node

import { app, BrowserWindow, dialog, globalShortcut, Menu, Tray } from 'electron';
import path from 'path';
import GeeApp from 'app';
import { debugMsg } from './debugUtils';
import RPC from 'RPC';

const argv = require('minimist')(process.argv.slice(2));

// Avoid GC causing tray icon disappers.
let tray = null;

if (process.env.NODE_ENV !== 'production') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
  });
}

function createMainWindow() {
  console.log('__dirname', __dirname);
  const preloadPath = path.join(__dirname, './preload.js');
  console.log('preloadPath', preloadPath);
  // Create the browser window.
  const browserWindow = new BrowserWindow({
    width: 1100,
    height: 768,
    autoHideMenuBar: true,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  const indexPath = path.join(__dirname, '../index.html');
  browserWindow.loadFile(indexPath).then(async () => {
    const d = await RPC.getRepository('../repos/topo-sort');
    browserWindow.webContents.send('openRepository', d);
  });

  // Open the DevTools.
  browserWindow.webContents.openDevTools();

  return browserWindow;
}

let mainWindow: BrowserWindow;
export function getMainWindow(): BrowserWindow {
  if (mainWindow) return mainWindow;
  mainWindow = createMainWindow();
  return mainWindow;
}

function createTray(mainWindow: BrowserWindow) {
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
}

if (app.requestSingleInstanceLock()) {
  app.on('second-instance', async (event, commandLine, workingDirectory) => {
    // TODO: pass the directory to application
    // console.log('second-instance', commandLine, workingDirectory);

    // debugMsg(`${commandLine} cwd: ${workingDirectory}`);

    getMainWindow().webContents.send('openRepository', await RPC.getRepository(workingDirectory));
  });

  app.on('ready', async () => {
    const mainWindow = getMainWindow();
    globalShortcut.register('Shift+Alt+E', () => {
      mainWindow.show();
    });

    // debugMsg(`${JSON.stringify(argv)} cwd: ${process.cwd()}`);

    // Close to the tray
    mainWindow.on('close', (event) => {
      event.preventDefault();
      mainWindow.hide();
      mainWindow.setSkipTaskbar(true);
    });

    createTray(mainWindow);

    GeeApp.init();
  });
} else {
  console.log('single instance lock, exiting');
  app.quit();
}
