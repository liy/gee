import { TagData } from '../commands/tag';
import { LineMouseDownEvent } from '../components/DiffFile';
import { Hash } from './window';

// Maps event type to event data
interface EventMap {
  'commit-click': number;
  'commit.focus': Hash;
  'command.tag': TagData[];
  'input.command': string;
  'line.mousedown': LineMouseDownEvent;
}
