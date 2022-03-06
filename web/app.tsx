import React, { FC } from 'react';
import ReactDOM from 'react-dom';
import { CommandInput } from './comps/CommandInput';
import { LogPane } from './comps/LogPane';
import './index.css';

// window.api.onWorkingDirectoryChanged((path) => {
//   if (path !== appStore.currentState.workingDirectory) {
//     appStore.operate({
//       type: 'wd.update',
//       path,
//     });
//     logStore.invoke(log(appStore.currentState.workingDirectory));
//   }
// });

window.api.onNotification((notification) => {
  console.log(notification);
});

const wd = await window.api.getWorkingDirectory();
if (wd) {
  ReactDOM.render(
    <>
      <CommandInput></CommandInput>
      <LogPane workingDirectory={wd}></LogPane>
    </>,
    document.getElementById('root')
  );
} else {
  // Display splash screen
}

window.api.appReady();
