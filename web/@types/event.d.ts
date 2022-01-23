import { LineMouseDownData } from '../components/DiffFile';

// Maps event type to event data
interface CustomEventMap {
  // input command
  'input.command': string;

  // Diff line is clicked
  'line.mousedown': LineMouseDownData;

  // console reference clicked
  'reference.clicked': {
    name: string;
    hash: string;
  };

  // hash element clicked
  'hash.clicked': {
    hash: string;
  };

  // Log commit is clicked.
  'commit.clicked': string;
}
