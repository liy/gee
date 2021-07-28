import { Message } from '../src/message';
import RepositoryReader from './RepositoryReader';

// receive message from master process
process.on('message', async (msg: Message) => {
  switch (msg.type) {
    case 'repo.open':
      RepositoryReader.open(msg.data).then((repoData) => {
        process.send({
          type: 'repo.response',
          data: repoData,
        });
      });
      break;
  }
});
