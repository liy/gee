import Stats from 'stats.js';
import StraightLayout from './layouts/StraightLayout';

import CommitManager from './ui/CommitManager';
import GraphView from './ui/GraphView';
import Repository, { RepositoryData } from './git/Repository';
import RepositoryStore from './git/RepositoryStore';
import GraphStore from './graph/GraphStore';
import { COMMIT_SELECTED, REPOSITORY_DATA_INIT } from './constants';

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
  CommitManager.on('selected', (data) => {
    window.api.send({
      type: COMMIT_SELECTED,
      data,
    });
  });
}

window.api.onReceive((event) => {
  if (event.type === REPOSITORY_DATA_INIT) init(event.data);
});
window.api.rendererReady();
