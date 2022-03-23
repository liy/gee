import React, { FC } from 'react';
import { TagData } from '../commands/tag';

export type Props = {
  tags: TagData[];
};

export const TagPrompt: FC<Props> = ({ tags }) => {
  return (
    <div className="tag-prompt">
      {tags?.map((tag) => (
        <span key={tag.name}>{tag.shorthand}</span>
      ))}
    </div>
  );
};

export type TagAction = {
  type: 'command.getTags';
  prompt: {
    component: React.FC<Props>;
    props: {
      key: string;
      tags: TagData[];
    };
  };
};
