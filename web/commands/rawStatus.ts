export interface TagData {
  name: string;
  shorthand: string;
  hash: string;
  targetHash: string;
}

const regex = /([AMRDC]) (.+)/;

export enum StatusCode {
  M,
  A,
  D,
  R,
  C,
  '??',
}

export interface StatusData {
  code: StatusCode;
  file: string;
}

export const statusOneline = async () => {
  const args = ['git', 'status', '--porcelain'];
  const outputs = await window.command.invoke(args);
  const lines = outputs.split('\n');
  const statusResults = new Array<StatusData>();
  lines.forEach((line) => {
    line = line.trim();
    const matches = regex.exec(line);
    if (matches) {
      statusResults.push({
        code: matches[1] as unknown as StatusCode,
        file: matches[2],
      });
    }
  });

  return statusResults;
};

export const status = async () => {
  const args = ['git', 'status', '-vv'];
};
