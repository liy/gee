#!/usr/bin/env node

import cmdRequest from './cmdRequest';
import { spawn, fork } from 'child_process';
import path from 'path';

cmdRequest(
  JSON.stringify({
    repo: process.cwd(),
    cmd: process.argv.slice(1).join(' '),
  })
).catch(() => {
  // If fail to send command to the electron app
  // Electron app must be not luanched yet, manually launch it
  const mainScriptPath = path.resolve(__dirname, './main.js');
  console.log(mainScriptPath);
  spawn(`${require('electron')}`, [mainScriptPath, ...process.argv.slice(1)], {
    detached: true,
    stdio: ['ignore', 'ignore', 'ignore'],
  }).unref();
});
