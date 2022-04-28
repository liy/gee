/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { FC, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import GraphStore from '../graph/GraphStore';
import StraightLayout from '../layouts/StraightLayout';
import { AppState } from '../store';
import { transition } from '../transition';
import GraphStyle from '../views/log/GraphStyle';
import GraphView from '../views/log/GraphView';
import '../views/log/LogView.css';
import { LogEntry } from './LogEntry';

export interface Props {
  logs: Log[];
  workingDirectory: string;
}

export const LogPane: FC<Props> = ({ logs, workingDirectory }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null)

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

    // Transitional log focus change.
    // Log focus event is not part of the react state. It uses transitional event
    // for simplicity reason.
    // Imagine if we store selected log index in a state, every time we add a new log, simulated or
    // not, the log index will need to be calculated manually. It is going to rather tedious and slow.
    // I think log focus is a perfect use case for transitional event.
    // test
    transition.on('log.focus', (hash) => {
      const index = logs.findIndex(v => v.hash === hash);
      if(index !== -1) {
        if(scrollbarRef.current) scrollbarRef.current.scrollTop = (index * GraphStyle.sliceHeight);
        setStartIndex(index);
      }
    })

    return () => {
      window.removeEventListener('resize', onResize);
      transition.clear('log.focus');
    };
  }, [logs]);

  const logEntries = logs.slice(startIndex, startIndex + numRows).map((log) => {
    return <LogEntry key={log.hash} log={log}></LogEntry>;
  });

  return (
    <main className="log-view">
      <div
        ref={scrollbarRef}
        style={{ height: '100vh' }}
        className="container scrollbar-y"
        onScroll={(e) => {
          const scrollTop = e.currentTarget.scrollTop;
          // Table offset style needs to set as soon as the start index changes.
          // MUST NOT use state as it will produce flickering
          tableRef.current!.style.top = `${-(scrollTop % GraphStyle.sliceHeight)}px`;
          setStartIndex(Math.floor((scrollTop + tableRef.current!.getBoundingClientRect().y) / GraphStyle.sliceHeight));
        }}
      >
        <canvas className="graph"></canvas>

        <div ref={tableRef} id="commit-table">
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
