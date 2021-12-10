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
import { Middleware, Store, Transform } from './vase/vase';
import { AddAction, DeleteAction } from './vase/type';
import { stat } from 'original-fs';

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

const initialState = {
  data: 0,
};

type WrongAction = {
  type: 'wrong';
  wrong: 'missing type';
};

interface Mapping {
  add: AddAction;
  delete: DeleteAction;
  test: {
    type: 'test';
  };
  wood: {
    type: 'wood';
  };
  dog: {
    type: 'dog';
  };
}

// const transform: Transform<Mapping, typeof initialState> = ;

const middleware: Middleware<Mapping, typeof initialState> = (action, state) => {
  console.log('1', JSON.stringify(action), state);
  if (action.type === 'add') {
    action.obj.name = 'modified';
  }
  return action;
};

const SubOperation: Transform<Mapping, typeof initialState> = {
  wood: (action, state) => {
    return state;
  },
  dog: (action, state) => {
    return state;
  },
};

const store = new Store<Mapping, typeof initialState>(
  initialState,
  {
    add: (action, state) => {
      return state;
    },
    delete: (action, state) => {
      return state;
    },
    test: (action, state) => {
      console.log('transform test', action);
      return state;
    },
    ...SubOperation,
  },
  [
    middleware,
    (action, state) => {
      console.log('2', action, state);
      return action;
    },
  ]
);

const cleanup = store.on({
  add: (action, state) => {
    console.log('add notification', action, state);
  },
  delete: (action, state) => {},
  test: (action, state) => {},
  dog: (action, state) => {},
});

setTimeout(() => {
  cleanup();

  store.operate({
    type: 'add',
    obj: {
      name: 'object name',
    },
  });
}, 3000);

store.operate({
  type: 'add',
  obj: {
    name: 'object name',
  },
});
