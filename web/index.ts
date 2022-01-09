// Always import elements and views
import './components';
import './components/CommandInput';
import './ConsoleMananger';
import './index.css';
import './views';
import { LogView } from './views/log/LogView';

// function openRepository(data: Repository__Output) {
//   // Setup repository
//   let repo = RepositoryStore.getRepository(data.path);
//   if (!repo) {
//     repo = new Repository(data.path, data.commits, data.references, data.head!, data.tags);
//     RepositoryStore.addRepository(repo);
//   }
//   RepositoryStore.use(repo.path);

//   // Setup graph data
//   let graph = GraphStore.getGraph(data.path);
//   if (!graph) {
//     graph = GraphStore.createGraph(data.path);
//   } else {
//     graph.reset();
//   }
//   // Populate graph with commit nodes
//   for (const commit of repo.commits) {
//     graph.createNode(commit.hash, commit.parents);
//   }

//   // Layout
//   const layout = new StraightLayout(graph);
//   const result = layout.process();

//   // Display commits and visual graph
//   GraphView.display(result, repo);
//   CommitManager.display(result, repo, graph);
// }

// window.api.onOpenRepository((data) => {
//   // Prevent errors escape to main process which won't give full stacktrace
//   try {
//     openRepository(data);
//   } catch (err) {
//     console.error(err);
//   }
// });

const logView = document.createElement('div', { is: 'log-view' }) as LogView;
const root = document.getElementById('root')!;
root?.prepend(logView);

window.api.onNotification((notification) => {
  console.log(notification);
});
