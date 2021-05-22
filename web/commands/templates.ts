export interface CommandOption {
  name: string;
  description: string;
  param?: {
    type: string | 'text' | 'number' | 'hash';
    search: Array<string>;
  };
}

export interface CommandTemplate {
  name: string;
  options: Array<CommandOption>;
  description: string;
  param?: {
    type: string | 'text' | 'number' | 'hash';
    search: Array<string>;
  };
}

const templates: Array<CommandTemplate> = [
  {
    name: 'merge',
    description: '',
    options: [
      {
        name: '--commit',
        description: 'Perform the merge and commit the result. This option can be used to override --no-commit.',
      },
      {
        name: '--no-commit',
        description: 'No commit when merging',
      },
      {
        name: '--ff-only',
        description:
          'With --ff-only, resolve the merge as a fast-forward when possible. When not possible, refuse to merge and exit with a non-zero status.',
      },
    ],
    param: {
      type: 'text',
      search: ['reference.name', 'commit.hash'],
    },
  },
  {
    name: 'commit',
    description: '',
    options: [
      {
        name: '-m',
        description:
          'Use the given <msg> as the commit message. If multiple -m options are given, their values are concatenated as separate paragraphs.',
        param: {
          type: 'text',
          search: ['commit.summary', 'reference.name'],
        },
      },
    ],
  },
  {
    name: 'checkout',
    description: '',
    options: [
      {
        name: '-b',
        description: '',
        param: {
          type: 'text',
          search: [],
        },
      },
    ],
    param: {
      type: 'text',
      search: ['commit.summary', 'references.name'],
    },
  },
];

export default templates;
