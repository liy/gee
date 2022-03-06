import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import GraphStyle from '../views/log/GraphStyle';
import { Commit } from './Commit';
import { log as logCommand } from '../commands/log';
import '../views/log/LogView.css';

export interface Head {
  hash: string;
  branch: string | null;
}

export interface Props {
  workingDirectory: string;
}

export const LogPane: FC<Props> = ({ workingDirectory }) => {
  const table = useRef<HTMLDivElement>(null);

  const [numRows, setNumRows] = useState(Math.ceil(window.innerHeight / GraphStyle.sliceHeight) + 1);
  const [startIndex, setStartIndex] = useState(0);
  const [logs, setLogs] = useState<Log[]>([]);
  const [scrollHeight, setScrollHeight] = useState(0);

  useEffect(() => {
    logCommand(workingDirectory)
      .then(([logs]) => {
        setLogs(logs);
        setScrollHeight(GraphStyle.sliceHeight * logs.length);
      })
      .catch((err) => console.log(err));

    const onResize = () => {
      setNumRows(Math.ceil(window.innerHeight / GraphStyle.sliceHeight) + 1);
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const commits = logs.slice(startIndex, startIndex + numRows).map((log) => {
    return <Commit key={log.hash} log={log}></Commit>;
  });

  return (
    <main className="log-view">
      <div
        style={{ height: '100vh' }}
        className="container scrollbar-y"
        onScroll={(e) => {
          const scrollTop = e.currentTarget.scrollTop;
          // Table offset style needs to set as soon as the start index changes.
          // MUST NOT use state as it will produce flickering
          table.current!.style.top = `${-(scrollTop % GraphStyle.sliceHeight)}px`;
          setStartIndex(Math.floor((scrollTop + table.current!.getBoundingClientRect().y) / GraphStyle.sliceHeight));
        }}
      >
        <canvas className="graph"></canvas>

        <div ref={table} id="commit-table">
          {commits}
        </div>
        <div style={{ height: `${scrollHeight}px` }} className="scroll-content"></div>
      </div>
    </main>
  );
};
