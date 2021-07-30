import { Message } from '../src/message';
import RepositoryReader from './RepositoryReader';
import chokidar from 'chokidar';
import path from 'path';
import { createThrottle } from '../web/utils';

let watcher = null;
const throttle = createThrottle(5000);

async function repoChanged(repoPath: string) {
  throttle(() => {
    process.send({
      type: 'repo.changed',
      data: repoPath,
    });

    sendRepoData(repoPath);
  });
}

const sendRepoData = (repoPath: string) => {
  return RepositoryReader.read(repoPath).then((repoData) => {
    process.send({
      type: 'repo.open.response',
      data: repoData,
    });
  });
};

// receive message from master process
process.on('message', async (msg: Message) => {
  const { type, data: repoPath } = msg;
  switch (msg.type) {
    case 'repo.open':
      sendRepoData(repoPath);

      // Stop previous watcher
      if (watcher) {
        await watcher.stop();
      }
      watcher = chokidar.watch(path.join(msg.data, '.git'));
      watcher.on('change', () => repoChanged(repoPath));

      break;
  }
});
