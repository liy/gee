import { tag, TagData } from './commands/tag';
import EventEmitter from './EventEmitter';

type Test = 123 | 'test';

type NewTest = Extract<Test, number>;

// FIXME: remove this move it into command-input component
export interface EventMap {
  'command.tag': TagData[];
}

class CommandManager extends EventEmitter<EventMap> {
  constructor() {
    super();
  }

  async exec(cmd: string) {
    switch (cmd.toLowerCase()) {
      case 'tag':
        this.emit('command.tag', await tag());
        break;
    }
  }
}

export default new CommandManager();
