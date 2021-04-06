import Stats from 'stats.js';
import StraightLayout, { LayoutResultPod } from './layouts/StraightLayout';
import { CommitPod, HeadPod, RefPod } from '../src/app';

import CommitManager from './ui/CommitManager';
import GraphView from './ui/GraphView';
// eslint-disable-next-line import/no-unresolved
// import Yargs from 'https://unpkg.com/yargs@16.0.0-beta.1/browser.mjs';
import minimist from 'minimist';
import Graph, { Hash } from './graph/Graph';
import { createDebounce } from 'utils';
import { merge } from 'commands';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
stats.dom.style.left = 'unset';
stats.dom.style.right = '0';

const graph = new Graph();
let currentHead: HeadPod;
let references: Array<RefPod>;
let commits: Array<CommitPod>;
let refMap: Map<Hash, Array<RefPod>>;

function init(commitsIn: Array<CommitPod>, refs: Array<RefPod>, head: HeadPod) {
  currentHead = head;
  references = refs;
  commits = commitsIn;

  refMap = new Map<Hash, Array<RefPod>>();
  for (const ref of refs) {
    const arr = refMap.get(ref.hash) || [];
    if (arr) {
      arr.push(ref);
    }
    refMap.set(ref.hash, arr);
  }

  for (const commit of commits) {
    graph.createNode(commit.hash, commit.parents);
  }

  const layout = new StraightLayout(graph);
  const result = layout.process();

  CommitManager.init(result, commits, refMap);
  GraphView.init(result);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
window.api.receive(([commits, refs, head]: [Array<CommitPod>, Array<RefPod>, HeadPod]) => {
  // localStorage.setItem('layoutResult', JSON.stringify(layoutResult));
  // localStorage.setItem('commits', JSON.stringify(commits));

  init(commits, refs, head);
});
window.api.send('some user interaction data');

const cmdInput = document.querySelector('.command-input')!;
const debounce = createDebounce(200);
cmdInput.addEventListener('input', async (e) => {
  await debounce();

  const value = (e.target as HTMLInputElement).value;
  const args = minimist(value.split(' '));

  if (args._[0] === 'git' && args._[1] === 'merge') {
    const sourceBranchNames = args._.slice(2);

    const sourceHashes = references
      .filter((ref) => sourceBranchNames.some((name) => name === ref.shorthand || name === ref.name))
      .map((ref) => {
        return ref.hash;
      });

    const draft = graph.clone();

    merge(draft, currentHead.hash, sourceHashes);
    const layout = new StraightLayout(draft);
    const result = layout.process();
    GraphView.update(result);
    CommitManager.init(result, commits, refMap);
  } else {
    const layout = new StraightLayout(graph);
    const result = layout.process();
    GraphView.update(result);
    CommitManager.init(result, commits, refMap);
  }
});
