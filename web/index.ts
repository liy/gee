import Stats from 'stats.js';
import StraightLayout from './layouts/StraightLayout';

import CommitManager from './ui/CommitManager';
import GraphView from './ui/GraphView';
import Repository from './git/Repository';
import RepositoryStore from './git/RepositoryStore';
import GraphStore from './graph/GraphStore';
import './index.css';
import { Repository__Output } from 'protobuf/pb/Repository';

CommitManager.on('selected', (data) => {
  console.log(data);
});

function openRepository(data: Repository__Output) {
  // Setup repository
  let repo = RepositoryStore.getRepository(data.path);
  if (!repo) {
    repo = new Repository(data.path, data.commits as any, data.references as any, data.head as any);
    RepositoryStore.addRepository(repo);
  }
  RepositoryStore.use(repo.path);

  // Setup graph data
  let graph = GraphStore.getGraph(data.path);
  if (!graph) {
    graph = GraphStore.createGraph(data.path);
  } else {
    graph.reset();
  }
  // Populate graph with commit nodes
  for (const commit of repo.commits) {
    graph.createNode(commit.hash, commit.parents);
  }

  // Layout
  const layout = new StraightLayout(graph);
  const result = layout.process();

  // Display commits and visual graph
  GraphView.display(result, repo);
  CommitManager.display(result, repo);
}

window.api.onOpenRepository((data) => {
  // Prevent errors escape to main process which won't give full stacktrace
  try {
    openRepository(data);
  } catch (err) {
    console.error(err);
  }
});
window.api.onNotification((notification) => {
  console.log(notification);
});
