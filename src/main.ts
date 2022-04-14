// #!/usr/bin/env node

import chokidar from 'chokidar';
import { app, BrowserWindow, dialog, globalShortcut, Menu, Tray } from 'electron';
import { Stats } from 'original-fs';
import * as path from 'path';
import { createDebounce } from '../web/utils/delay';
import { start } from './app';

const watcher = chokidar.watch('.', {
  ignored: /node_modules|\.git|dist/,
});

const indexWatcher = chokidar.watch('.git/index');

const args = process.env.NODE_ENV !== 'production' ? process.argv.slice(3) : process.argv.slice(1);

// If dev mode then allow reload electron main and renderer on source file changes
// if (process.env.NODE_ENV !== 'production') {
//   require('electron-reload')(__dirname, {
//     electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
//   });
// }

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

const changeDebounce = createDebounce(500);

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

      // Send command line to renderer
      mainWindow.webContents.send('onCommand', commandLine.slice(2));

      watcher.unwatch('.');
      watcher.add(workingDirectory);

      indexWatcher.unwatch('.git/index');
      indexWatcher.add(workingDirectory + '/.git/index');
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

    start(process.cwd(), args);

    let ready = false;
    const notifyFileChanged = (path: string) => {
      if (ready) {
        changeDebounce(() => {
          console.log(`File ${path} changed`);
          mainWindow.webContents.send('fs.changed');
        });
      }
    };
    watcher
      .on('add', notifyFileChanged)
      .on('change', notifyFileChanged)
      .on('unlink', notifyFileChanged)
      .on('ready', () => {
        ready = true;
      });

    indexWatcher.on('change', (path, stats) => {
      console.log('index change?', path, stats);
      mainWindow.webContents.send('git.index.changed');
    });
  });
} else {
  // console.log('single instance lock, exiting.');
  app.exit(0);
}

// Disable error dialogs
dialog.showErrorBox = function (title, content) {
  console.log(`${title}\n${content}`);
};
