import { ipcMain } from "electron";
import { getMainWindow } from "main";

export function send(data: any) {
    getMainWindow().webContents.send('MainToRenderer', data);
}

export function onReceive(callback: (data:any) => void):void {
    ipcMain.on('RendererToMain', (event, args) => callback(args));
}

export function onGitCommand(callback: (data:any) => void):void {
    ipcMain.on('GitCommand', (event, args) => callback(args));
}