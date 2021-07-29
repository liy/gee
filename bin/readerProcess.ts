import { Message } from '../src/message';
import RepositoryReader from './RepositoryReader';
import chokidar from 'chokidar';
import path from 'path';
import { createThrottle } from '../web/utils';

let watcher = null;
const throttle = createThrottle(5000);

async function repoChanged(path: string, stats: any) {
  throttle(() => {
    process.send({
      type: 'repo.changed',
      data: path,
    });
  });
}

// receive message from master process
process.on('message', async (msg: Message) => {
  switch (msg.type) {
    case 'repo.open':
      RepositoryReader.open(msg.data).then((repoData) => {
        process.send({
          type: 'repo.open.response',
          data: repoData,
        });
      });

      // Stop previous watcher
      if (watcher) {
        await watcher.stop();
      }
      watcher = chokidar.watch(path.join(msg.data, '.git'));
      watcher.on('change', repoChanged);

      break;
  }
});
