function parseReference(str: string) {
  const chunks = str.split(', ');
  const branches = [];
  const tags = [];
  for (const chunk of chunks) {
    // head
    if (chunk.startsWith('HEAD -> ')) {
    }
    // tags
    else if (chunk.startsWith('tag: ')) {
      // console.log(chunk.substring(4).trim());
      tags.push(chunk.substring(4).trim());
    }
    // branches
    else if (chunk.trim() != '') {
      // console.log(chunk);
      branches.push(chunk.trim());
    }
  }

  return [branches, tags];
}

export const log = (workingDirectory: string) => {
  const args = ['git', 'log', '--pretty="[%H][%P][%s][%an][%ae][%at][%cn][%ce][%ct][%D]"', '--branches=*'];

  const logs = new Array<Log>();
  const branchList = new Array<Branch>();
  const tagList = new Array<Tag>();
  return new Promise<[Log[], Branch[], Tag[]]>((resolve, reject) => {
    window.command.submit(args, workingDirectory, {
      onReadLine: (line: string) => {
        const matches = /\[(.*)\]\[(.*)\]\[(.*)\]\[(.*)\]\[(.*)\]\[(.*)\]\[(.*)\]\[(.*)\]\[(.*)\]\[(.*)\]/.exec(line);
        if (matches && matches.length != 0) {
          logs.push({
            hash: matches[1],
            parents: matches[2] === '' ? [] : matches[2].split(' '),
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

          const [branches, tags] = parseReference(matches[10]);
          if (branches) {
            for (const info of branches) {
              branchList.push({
                name: info,
                shorthand: info,
                targetHash: matches[1],
              });
            }
          }

          if (tags) {
            for (const info of tags) {
              tagList.push({
                hash: '',
                name: info,
                shorthand: info,
                targetHash: matches[1],
              });
            }
          }
        }
      },
      onClose: () => {
        resolve([logs, branchList, tagList]);
      },
      onError: () => {
        reject();
      },
    });
  });
};
