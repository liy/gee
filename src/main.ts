import { app, BrowserWindow, globalShortcut, Menu, Tray } from 'electron';
import path = require('path');
import init from './app';

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
    // frame: false,
    // titleBarStyle: 'hidden',
    transparent: true,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  return mainWindow;
}

function createTray(mainWindow: BrowserWindow) {
  const tray = new Tray(path.join(__dirname, '../git.png'));
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

  // mainWindow.on('show', () => {
  //   tray.setHighlightMode('always');
  // });
  // mainWindow.on('hide', () => {
  //   tray.setHighlightMode('never');
  // });
}

function shortcut(mainWindow: BrowserWindow) {
  globalShortcut.register('Control+Shift+L', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  const mainWindow = createWindow();
  shortcut(mainWindow);

  // Close to the tray
  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide();
    mainWindow.setSkipTaskbar(true);
  });

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  await init(mainWindow);
  createTray(mainWindow);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
