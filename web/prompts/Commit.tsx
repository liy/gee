import React, { FC } from 'react';
import { commit } from '../commands/commit';
import { Diff } from '../Diff';

export type Props = {
  workingDirectory: string;
};

export const CommitPrompt: FC<Props> = ({ workingDirectory }) => {
  return (
    <div className="commit-prompt">
      <div
        contentEditable
        className="commit-message-input"
        placeholder="commit message"
        onKeyDown={async (e) => {
          if (e.ctrlKey && e.key === 'Enter') {
            if (e.currentTarget.innerText.trim()) {
              try {
                await commit(e.currentTarget.innerText, workingDirectory);
                // diffStore.invoke(status(appStore.currentState.workingDirectory));

                // // remove this view
                // this.remove();

                // // update log
                // logStore.invoke(log(appStore.currentState.workingDirectory));
              } catch (err) {
                console.log(err);
              }
            }
          }
        }}
      ></div>
      <div className="editor-container"></div>
    </div>
  );
};

export type CommitAction = {
  type: 'command.commit';
  prompt: {
    component: React.FC<Props>;
    props: {
      key: string;
      workspaceChanges: Diff[];
      stagedChanges: Diff[];
    };
  };
};
