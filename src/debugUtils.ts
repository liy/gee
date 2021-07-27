import { dialog } from 'electron';

export const debugMsg = (message: string) => {
  dialog.showMessageBox({
    buttons: ['OK'],
    message,
  });
};
