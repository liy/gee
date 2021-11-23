import CommandRoute from '../CommandRoute';

export interface TagData {
  name: string;
  shorthand: string;
  hash: string;
  targetHash: string;
}

export const tag = () => {
  const args = ['show-ref', '--tags', '-d'];
  return new Promise<Array<TagData>>((resolve, reject) => {
    // tag name -> tag
    const entries = new Array<TagData>();
    // tag name -> annotated tag object hash
    const annoated = new Map<string, string>();
    CommandRoute.submit(args, {
      onReadLine: (line: string) => {
        const [hash, name] = line.split(' ');
        const tagName = name.replace(/\^\{\}$/, '');
        const shorthand = tagName.replace(/^refs\/tags\//, '');

        // Annotated tag
        if (!/\^\{\}$/.test(line)) {
          annoated.set(shorthand, hash);
        }
        // hash -> commit
        else {
          entries.push({
            name: tagName,
            shorthand,
            hash: annoated.get(shorthand) || hash,
            targetHash: hash,
          });
        }
      },
      onClose: () => {
        resolve(entries);
      },
      onError: () => {
        reject();
      },
    });
  });
};
