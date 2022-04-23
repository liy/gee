import React, { FC, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { applyPatch, stage, unstage } from '../commands/apply';
import { stagedChanges, workspaceChanges } from '../commands/changes';
import { DiffBlock } from '../components/DiffBlock';
import { Diff } from '../Diff';
import { createPatch } from '../Patch';
import { AppState, store } from '../store';
import './Status.scss';

const updateStatus = async (workingDirectory: string) => {
  const [workspaceDiffText, stagedDiffText] = await Promise.all([
    workspaceChanges(workingDirectory),
    stagedChanges(workingDirectory),
  ]);

  store.dispatch({
    type: 'status.update',
    workspaceChanges: Diff.parse(workspaceDiffText),
    stagedChanges: Diff.parse(stagedDiffText),
  });
};

const onLineClick = async (workingDirectory: string, editorLineNo: number, diff: Diff, reverse: boolean) => {
  const patchText = createPatch([editorLineNo], diff, reverse);
  if (patchText) {
    await applyPatch(patchText, workingDirectory);
    // No need to manually update status, as StatusPrompt will listening
    // to local fs changes to auto update status by default?
    // updateStatus(workingDirectory);
  }
};

export const StatusPrompt: FC = () => {
  const workspaceChanges = useSelector((state: AppState) => state.workspaceChanges);
  const stagedChanges = useSelector((state: AppState) => state.stagedChanges);
  const workingDirectory = useSelector((state: AppState) => state.workingDirectory);

  const onStageBtnClick = useCallback((filePath) => {
    stage(filePath, store.getState().workingDirectory)
  }, []);

  const onUnstageBtnClick = useCallback((filePath) => {
    unstage(filePath, store.getState().workingDirectory)
  }, []);

  const stagedElements =
    stagedChanges.length != 0 ? (
      stagedChanges.map((diff) => (
        <DiffBlock
          key={diff.heading.from + ' > ' + diff.heading.to}
          diff={diff}
          onLineClick={(editorLineNo, diff) => onLineClick(workingDirectory, editorLineNo, diff, true)}
          headingButton={<button onClick={(e) => {
            e.stopPropagation();
            onUnstageBtnClick(diff.heading.to);
          }}>unstage</button>}
        ></DiffBlock>
      ))
    ) : (
      <h4>nothing to commit</h4>
    );

  const workspaceElements =
    workspaceChanges.length !== 0 ? (
      workspaceChanges.map((diff) => (
        <DiffBlock
          key={diff.heading.from + ' > ' + diff.heading.to}
          diff={diff}
          onLineClick={(editorLineNo, diff) => onLineClick(workingDirectory, editorLineNo, diff, false)}
          headingButton={<button onClick={(e) => {
            e.stopPropagation();
            onStageBtnClick(diff.heading.to)
          }}>stage</button>}
        ></DiffBlock>
      ))
    ) : (
      <h4>working tree clean</h4>
    );

  // listening to the file changes to update status
  // remove listener if prompt component is removed
  useEffect(() => {
    const cleanup = window.api.onIndexChanged(() => updateStatus(workingDirectory));
    return cleanup;
  }, []);

  return (
    <div className="prompt">
      <div className="stage">
        <h3 style={{ top: 0 }}>staged</h3>
        {stagedElements}
      </div>
      <div className="workspace">
        <h3 style={{ top: 0 }}>workspace</h3>
        {workspaceElements}
      </div>
    </div>
  );
};

export type StatusAction = {
  type: 'prompt.status';
  prompt: {
    component: React.FC;
    props: {
      key: string;
    };
  };
};
