// Always import elements and views
import './components';
import './components/CommandInput';
import './ConsoleMananger';
import './index.css';
import { appStore } from './appStore';
import './views';
import { LogView } from './views/log/LogView';
import { log } from './views/log/subroutines';
import { store as logStore } from './views/log/store';

window.api.onWorkingDirectoryChanged((path) => {
  console.log(path);
  appStore.operate({
    type: 'wd.update',
    path,
  });
  logStore.invoke(log(appStore.currentState.workingDirectory));
});

window.api.onNotification((notification) => {
  console.log(notification);
});

const wd = await window.api.getWorkingDirectory();
if (wd) {
  appStore.operate({
    type: 'wd.update',
    path: wd,
  });

  const logView = document.createElement('div', { is: 'log-view' }) as LogView;
  const root = document.getElementById('root')!;
  root.prepend(logView);

  await logStore.invoke(log(wd));
} else {
  // Display splash screen
}
