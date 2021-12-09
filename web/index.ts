import StraightLayout from './layouts/StraightLayout';

import CommitManager from './ui/CommitManager';
import GraphView from './ui/GraphView';
import Repository from './git/Repository';
import RepositoryStore from './git/RepositoryStore';
import GraphStore from './graph/GraphStore';
import './index.css';
import { Repository__Output } from '../src/protobuf/pb/Repository';

import './elements/CommandInput';
import './ConsoleMananger';

// Always import elements and views
import './elements';
import './views';
import { ActionBase, Signal, Store, ValueOf } from './vase/vase';

function openRepository(data: Repository__Output) {
  // Setup repository
  let repo = RepositoryStore.getRepository(data.path);
  if (!repo) {
    repo = new Repository(data.path, data.commits, data.references, data.head!, data.tags);
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
  CommitManager.display(result, repo, graph);
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

// type testAction = {
//   type: string;
//   payload: string;
// };

// Maps event type to event data
// interface ActionMap {
//   update: typeof updateAction;
//   test: typeof testAction;
// }

// type ActionType = typeof testAction | typeof updateAction

const initialState = {
  data: 0,
};

type AddAction = {
  type: 'add';
  data: 'data';
};

type DeleteAction = {
  type: 'delete';
  id: string;
};

interface Mapping {
  add: AddAction;
  delete: DeleteAction;
}

interface Subscriptions {
  add?: (action: AddAction, state: typeof initialState) => void;
  update?: () => void;
}

const store = new Store<Subscriptions, typeof initialState>(initialState, {
  add: (state, action) => {
    return state;
  },
});

store.on({
  add: (action, state) => {
    console.log('state updated', action, state);
  },
});

store.operate({ type: 'add' });
