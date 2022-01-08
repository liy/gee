// #!/usr/bin/env node

import { app, BrowserWindow, dialog, globalShortcut, Menu, Tray } from 'electron';
import * as path from 'path';
import GeeApp from './app';
import RPC from './RPC';
import { spawn } from 'child_process';
import * as readline from 'readline';
import { createPatch } from '../web/Patch';

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

const commits = [];

type Signaure = {
  name: string;
  email: string;
};

interface CommitLog {
  hash: string;
  parents: Array<string>;
  subject: string;
  author: Signaure;
  authorDate: Date;
  committer: Signaure;
  commitDate: Date;
}

function openRepository(path: string) {
  const logs = new Array<CommitLog>();
  const cli = spawn('git', ['log', '--pretty="[%H][%P][%s][%an][%ae][%at][%cn][%ce][%ct]"', '--branches=*'], {
    cwd: path,
  });
  const rl = readline.createInterface({ input: cli.stdout });

  return new Promise<Array<CommitLog>>((resolve) => {
    rl.on('line', (line) => {
      const matches = /\[(.*)\]\[(.*)\]\[(.*)\]\[(.*)\]\[(.*)\]\[(.*)\]\[(.*)\]\[(.*)\]\[(.*)\]/.exec(line);
      if (matches && matches.length != 0) {
        logs.push({
          hash: matches[1],
          parents: matches[2].split(' '),
          subject: matches[3],
          author: {
            name: matches[4],
            email: matches[5],
          },
          authorDate: new Date(parseInt(matches[6])),
          committer: {
            name: matches[7],
            email: matches[8],
          },
          commitDate: new Date(parseInt(matches[9])),
        });
      }
    });
    rl.on('close', () => {
      resolve(logs);
    });
  });
}

// Avoid GC causing tray icon disappers.
let tray = null;

if (app.requestSingleInstanceLock()) {
  app.on('ready', async () => {
    const mainWindow = createMainWindow();

    // Loading the application
    const indexPath = path.join(__dirname, '../index.html');
    mainWindow.loadFile(indexPath).then(async () => {
      mainWindow.webContents.send('openRepository', await RPC.getRepository(process.cwd()));
      // mainWindow.webContents.send('openRepository', await openRepository(process.cwd()));
      mainWindow.title = process.cwd();
    });
    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Second instance is passing the arguments to this first instance.
    // Simply open repository at second instance working directory
    app.on('second-instance', async (event, commandLine, workingDirectory) => {
      GeeApp.workingDirectory = workingDirectory;
      mainWindow.webContents.send('openRepository', await RPC.getRepository(workingDirectory));
      // mainWindow.webContents.send('openRepository', await openRepository(workingDirectory));
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

    GeeApp.init(process.cwd());
  });
} else {
  console.log('single instance lock, exiting.');
  app.exit(0);
}

// Disable error dialogs
dialog.showErrorBox = function (title, content) {
  console.log(`${title}\n${content}`);
};
