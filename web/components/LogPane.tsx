import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import { log as logCommand } from '../commands/log';
import { numChanges } from '../commands/numChanges';
import { StateContext } from '../contexts';
import GraphStore from '../graph/GraphStore';
import StraightLayout from '../layouts/StraightLayout';
import GraphStyle from '../views/log/GraphStyle';
import GraphView from '../views/log/GraphView';
import '../views/log/LogView.css';
import { Commit } from './Commit';
import { LogCommit } from './LogCommit';

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
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    window.api.onFileSysChanged(async () => {
      console.log('fs changed, get git status');
      const num = await numChanges(workingDirectory);
      setHasChanges(num !== 0);
    });

    numChanges(workingDirectory).then((num) => {
      console.log(num);
      setHasChanges(num !== 0);
    });
  }, []);

  // TODO: move logs to a state
  useEffect(() => {
    logCommand(workingDirectory)
      .then(([logs]) => {
        const graph = GraphStore.getGraph(workingDirectory);
        graph.clear();
        for (const log of logs) {
          graph.createNode(log.hash, log.parents);
        }
        const layout = new StraightLayout(graph);
        GraphView.display(layout.process());

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
          {hasChanges && (
            <LogCommit
              onSubmit={(msg) => {
                console.log(msg);
              }}
            ></LogCommit>
          )}
          {commits}
        </div>
        <div style={{ height: `${scrollHeight}px` }} className="scroll-content"></div>
      </div>
    </main>
  );
};
