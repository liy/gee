// #!/usr/bin/env node

import { app, BrowserWindow, dialog, globalShortcut, Menu, Tray } from 'electron';
import path from 'path';
import GeeApp from 'app';
import { debugMsg } from './debugUtils';

const argv = require('minimist')(process.argv.slice(2));

// Avoid GC causing tray icon disappers.
let tray = null;

require('electron-reload')(__dirname, {
  electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
});

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
  console.log('indexPath', indexPath);
  browserWindow.loadFile(indexPath);

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
  // TODO: parse command line arguments
  console.log('launch from command line', argv, process.defaultApp);

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // TODO: pass the directory to application
    console.log('second-instance', commandLine, workingDirectory);

    getMainWindow().webContents.send('notification', {
      title: 'second-instance',
      message: {
        commandLine,
        workingDirectory,
      },
    });
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

dialog.showErrorBox = function (title, content) {
  // TODO: log
  console.log(`${title}\n${content}`);
};

// const { app } = require('electron');
// const process = require('process');
// const args = process.argv;

// let myWindow: BrowserWindow | null = null;

// const gotTheLock = app.requestSingleInstanceLock();

// if (!gotTheLock) {
//   app.quit();
// } else {
//   app.on('second-instance', (event, commandLine, workingDirectory) => {
//     // Someone tried to run a second instance, we should focus our window.
//     if (myWindow) {
//       if (myWindow.isMinimized()) myWindow.restore();
//       myWindow.focus();
//     }
//     console.log('???', args, commandLine);
//   });

//   // Create myWindow, load the rest of the app, etc...
//   app.whenReady().then(() => {
//     myWindow = new BrowserWindow({
//       width: 1100,
//       height: 768,
//       autoHideMenuBar: true,
//       webPreferences: {
//         nodeIntegration: false,
//         contextIsolation: true,
//       },
//     });
//     console.log('!!!', args);
//   });
// }
