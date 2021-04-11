import Stats from 'stats.js';
import StraightLayout from './layouts/StraightLayout';

import CommitManager from './ui/CommitManager';
import GraphView from './ui/GraphView';
import Commander from './Commander';
import Repository, { RepositoryData } from './git/Repository';
import RepositoryStore from './git/RepositoryStore';
import GraphStore from './graph/GraphStore';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
stats.dom.style.left = 'unset';
stats.dom.style.right = '0';

function init(repoData: RepositoryData) {
  // Setup repository
  const repo = new Repository(repoData.id, repoData.commits, repoData.references, repoData.head);
  RepositoryStore.addRepository(repo);
  RepositoryStore.use(repo.id);

  // Setup graph
  const graph = GraphStore.createGraph(repo.id);
  for (const commit of repo.commits) {
    graph.createNode(commit.hash, commit.parents);
  }

  const layout = new StraightLayout(graph);
  const result = layout.process();

  CommitManager.init(result, repo);
  GraphView.init(result);
  Commander.init(repo);

  const term = new Terminal({ cols: 80, rows: 24 });
  term.open(document.getElementById('terminal')!);

  term.onData((e) => {
    console.log(e);
    window.api.terminalKeyStroke(e);
  });

  window.api.terminalData((data: any) => {
    term.write(data);
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
window.api.receive(init);
window.api.send('some user interaction data');
