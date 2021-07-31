#!/usr/bin/env node

import { app, BrowserWindow, globalShortcut, Menu, Tray } from 'electron';
import path = require('path');
// import fastifyLauncher from 'fastify';
import express from 'express';
import GeeApp from 'app';
import { debugMsg } from './debugUtils';

const server = express();
server.use(express.json());

const argv = require('minimist')(process.argv.slice(2));

// Avoid GC causing tray icon disappers.
let tray = null;

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('electron-reload')(__dirname);

function createMainWindow() {
  const preloadPath = path.join(__dirname, '../dist/preload.js');
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
  // browserWindow.webContents.openDevTools();

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

  // Open repo via rest request
  server.post('/gee', (req, res) => {
    GeeApp.open(req.body.repo || process.cwd());
    mainWindow.show();
    return res.json({ status: 200 });
  });

  server.listen(28230);

  app.on('ready', () => {
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

    GeeApp.open(argv.repo || process.cwd());
    createTray(mainWindow);
  });
} else {
  console.log('single instance lock, exiting');
  app.quit();
}
