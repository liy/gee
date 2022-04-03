import React, { FC, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import GraphStore from '../graph/GraphStore';
import StraightLayout from '../layouts/StraightLayout';
import { AppState } from '../store';
import GraphStyle from '../views/log/GraphStyle';
import GraphView from '../views/log/GraphView';
import '../views/log/LogView.css';
import { LogEntry } from './LogEntry';

export interface Props {
  logs: Log[];
  workingDirectory: string;
}

export const LogPane: FC<Props> = ({ logs, workingDirectory }) => {
  const table = useRef<HTMLDivElement>(null);

  const [numRows, setNumRows] = useState(Math.ceil(window.innerHeight / GraphStyle.sliceHeight) + 1);
  const [startIndex, setStartIndex] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);

  // Re-render graph and logs?
  useEffect(() => {
    const graph = GraphStore.getGraph(workingDirectory);
    graph.clear();
    for (const log of logs) {
      graph.createNode(log.hash, log.parents);
    }
    const layout = new StraightLayout(graph);
    GraphView.display(layout.process());
    setScrollHeight(GraphStyle.sliceHeight * logs.length);

    const onResize = () => {
      setNumRows(Math.ceil(window.innerHeight / GraphStyle.sliceHeight) + 1);
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [logs]);

  const logEntries = logs.slice(startIndex, startIndex + numRows).map((log) => {
    return <LogEntry key={log.hash} log={log}></LogEntry>;
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
          {logEntries}
        </div>
        <div style={{ height: `${scrollHeight}px` }} className="scroll-content"></div>
      </div>
    </main>
  );
};

export const LogPaneContainer: FC = () => {
  const workingDirectory = useSelector((state: AppState) => state.workingDirectory);
  const logs = useSelector((state: AppState) => state.logs);
  const simulations = useSelector((state: AppState) => state.simulations);

  return <LogPane logs={[...simulations, ...logs]} workingDirectory={workingDirectory}></LogPane>;
};
