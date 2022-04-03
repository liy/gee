import React, { FC } from 'react';
import { DiffBlock } from '../components/DiffBlock';
import { DiffFile } from '../components/DiffFile';
import { Diff } from '../Diff';

export type Props = {
  title: string;
  diffs: Diff[];
  log: Log;
  logBody: string;
  branches: string[];
  tags: string[];
};

export const ShowPrompt: FC<Props> = ({ title, diffs, log, logBody }) => {
  const elements = diffs.map((diff) => (
    <DiffBlock key={diff.heading.from + ' > ' + diff.heading.to} diff={diff}></DiffBlock>
  ));

  return (
    <div className="prompt">
      <h3 style={{ top: 0 }}>{title}</h3>
      {elements}
    </div>
  );
};

export type PromptShowAction = {
  type: 'prompt.show';
  prompt: {
    component: React.FC<Props>;
    props: Props & {
      key: string;
    };
  };
};
