import Stats from 'stats.js';
import { LayoutResultPod } from './layouts/StraightLayout';
import { CommitPod } from '../src/app';

import CommitManager from './ui/CommitManager';
import GraphView from './ui/GraphView';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
stats.dom.style.left = 'unset';
stats.dom.style.right = '0';

let initialized = false;
const layoutResultValue = localStorage.getItem('layoutResult');
const commitsValue = localStorage.getItem('commits');
if (layoutResultValue && commitsValue) {
  const layoutResultPod = JSON.parse(layoutResultValue);
  const commits = JSON.parse(commitsValue);
  init(layoutResultPod, commits);
}

function init(layoutResult: LayoutResultPod, commits: Array<CommitPod>) {
  if (initialized) return;

  CommitManager.init(layoutResult, commits);

  GraphView.init(layoutResult);

  initialized = true;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
window.api.receive(([layoutResult, commits]: [LayoutResultPod, Array<CommitPod>]) => {
  localStorage.setItem('layoutResult', JSON.stringify(layoutResult));
  localStorage.setItem('commits', JSON.stringify(commits));
  init(layoutResult, commits);
});
window.api.send('some user interaction data');
