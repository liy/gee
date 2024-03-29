import classNames from 'classnames';
import { nanoid } from 'nanoid';
import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { show } from '../commands/show';
import './Commit.scss';
import { Diff } from '../Diff';
import { ShowPrompt } from '../prompts/Show';
import { AppState, store } from '../store';
import GraphStyle from '../views/log/GraphStyle';

const dateFormat = Intl.DateTimeFormat('en-GB', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
});

const timeFormat = Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: 'numeric',
  hour12: false,
});

export interface LabelProps {
  name: string;
}

export const LogLabel: FC<LabelProps> = ({ name }) => {
  return <div>{name}</div>;
};

export interface Props {
  log: Log;
  tags?: string[];
  branches?: string[];
}

export const Commit: FC<Props> = ({ log, branches, tags }) => {
  const workingDirectory = useSelector((state: AppState) => state.workingDirectory);
  const selectedHash = useSelector((state: AppState) => state.selectedHash);

  return (
    <div
      className={classNames('commit', { selected: selectedHash === log.hash })}
      style={{ height: GraphStyle.sliceHeight + 'px' }}
      onClick={async () => {
        // If selection did not change do nothing
        if (log.hash === selectedHash) return;

        const { bodyText, diffText } = await show(log.hash, workingDirectory);

        store.dispatch({
          type: 'log.selection',
          hash: log.hash,
        });

        store.dispatch({
          type: 'prompt.show',
          prompt: {
            component: ShowPrompt,
            props: {
              key: nanoid(),
              diffs: Diff.parse(diffText),
              log: log,
              logBody: bodyText,
              branches,
              tags,
              title: `show ${log.hash.substring(0, 6)}`,
            },
          },
        });
      }}
    >
      <div className="top">
        <div className="summary">{log.subject}</div>
        <span className="author">{log.author.name}</span>
      </div>
      <div className="bottom">
        <span className="hash">{log.hash.substring(0, 7)}</span>
        <div className="refs">
          {branches?.map((b) => {
            return (
              <span className="branch" key={b}>
                {b}
              </span>
            );
          })}
          {tags?.map((t) => {
            return (
              <span className="tag" key={t}>
                {t}
              </span>
            );
          })}
        </div>
        <span className="date-time">{dateFormat.format(log.commitDate) + ' ' + timeFormat.format(log.commitDate)}</span>
      </div>
    </div>
  );
};
