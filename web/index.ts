import Stats from 'stats.js';
import StraightLayout from './layouts/StraightLayout';

import CommitManager from './ui/CommitManager';
import GraphView from './ui/GraphView';
import Repository from './git/Repository';
import RepositoryStore from './git/RepositoryStore';
import GraphStore from './graph/GraphStore';
import './index.css';

CommitManager.on('selected', (data) => {
  console.log(data);
});

const data = await window.api.openRepository('../repos/checkout');
// Setup repository
const repo = new Repository(data.path, data.commits as any, data.references as any, data.head as any);
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
GraphView.init(result, repo);

window.api.onNotification((notification) => {
  console.log(notification);
});
