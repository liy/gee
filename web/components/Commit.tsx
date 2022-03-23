import React, { FC } from 'react';
import '../components-old/Commit.css';
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
}

export const Commit: FC<Props> = ({ log }) => {
  return (
    <div className="commit" style={{ height: GraphStyle.sliceHeight + 'px' }}>
      <div className="top">
        <div className="summary">{log.subject}</div>
        <span className="author">{log.author.name}</span>
      </div>
      <div className="bottom">
        <span className="hash">{log.hash.substring(0, 7)}</span>
        <div className="refs"></div>
        <span className="date-time">{dateFormat.format(log.commitDate) + ' ' + timeFormat.format(log.commitDate)}</span>
      </div>
    </div>
  );
};
