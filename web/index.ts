import Stats from 'stats.js';
import StraightLayout, { LayoutResultPod } from './layouts/StraightLayout';
import { CommitPod, RefPod } from '../src/app';

import CommitManager from './ui/CommitManager';
import GraphView from './ui/GraphView';
// eslint-disable-next-line import/no-unresolved
// import Yargs from 'https://unpkg.com/yargs@16.0.0-beta.1/browser.mjs';
import minimist from 'minimist';
import Graph, { Hash } from './graph/Graph';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
stats.dom.style.left = 'unset';
stats.dom.style.right = '0';

function init(commits: Array<CommitPod>, refs: Array<RefPod>) {
  const refMap = new Map<Hash, Array<RefPod>>();
  for (const ref of refs) {
    const arr = refMap.get(ref.hash) || [];
    if (arr) {
      arr.push(ref);
    }
    refMap.set(ref.hash, arr);
  }

  const graph = new Graph();
  for (const commit of commits) {
    graph.createNode(commit.hash, commit.parents);
  }
  const layout = new StraightLayout(graph);
  const result = layout.process();

  CommitManager.init(result, commits, refMap);
  GraphView.init(result);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
window.api.receive(([commits, refs]: [Array<CommitPod>, Array<RefPod>]) => {
  // localStorage.setItem('layoutResult', JSON.stringify(layoutResult));
  // localStorage.setItem('commits', JSON.stringify(commits));
  init(commits, refs);
});
window.api.send('some user interaction data');

let debounceID = 0;
const cmdInput = document.querySelector('.command-input')!;
cmdInput.addEventListener('input', (e) => {
  clearTimeout(debounceID);
  debounceID = window.setTimeout(() => {
    const value = (e.target as HTMLInputElement).value;
    const args = minimist(value.split(' '));

    if (args._[0] === 'git' && args._[1] === 'merge') {
      const branches = args._.slice(2);
      window.api.git({
        type: 'merge',
        data: branches,
      });
    }
  }, 1000);
});
