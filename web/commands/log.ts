import { CommandCallback } from '../constants';
import { LogEntry } from '../views/log/store';

type Signaure = {
  name: string;
  email: string;
};

interface CommitLog {
  hash: string;
  parents: Array<string>;
  subject: string;
  author: Signaure;
  authorDate: Date;
  committer: Signaure;
  commitDate: Date;
}

export const log = () => {
  const args = ['git', 'log', '--pretty="[%H][%P][%s][%an][%ae][%at][%cn][%ce][%ct]"', '--branches=*'];

  const logs = new Array<CommitLog>();
  return new Promise<LogEntry[]>((resolve, reject) => {
    window.command.submit(args, {
      onReadLine: (line: string) => {
        const matches = /\[(.*)\]\[(.*)\]\[(.*)\]\[(.*)\]\[(.*)\]\[(.*)\]\[(.*)\]\[(.*)\]\[(.*)\]/.exec(line);
        if (matches && matches.length != 0) {
          logs.push({
            hash: matches[1],
            parents: matches[2].split(' '),
            subject: matches[3],
            author: {
              name: matches[4],
              email: matches[5],
            },
            authorDate: new Date(parseInt(matches[6]) * 1000),
            committer: {
              name: matches[7],
              email: matches[8],
            },
            commitDate: new Date(parseInt(matches[9]) * 1000),
          });
        }
      },
      onClose: () => {
        resolve(logs);
      },
      onError: () => {
        reject();
      },
    });
  });
};
