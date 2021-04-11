import Stats from 'stats.js';
import StraightLayout from './layouts/StraightLayout';

import CommitManager from './ui/CommitManager';
import GraphView from './ui/GraphView';
import Commander from './Commander';
import Repository, { RepositoryData } from './git/Repository';
import RepositoryStore from './git/RepositoryStore';
import GraphStore from './graph/GraphStore';

// import * as os from 'os';
// import { Terminal } from 'xterm';
// import * as pty from 'node-pty';
// import 'xterm/css/xterm.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
window.api.receive(init);
window.api.send('some user interaction data');
