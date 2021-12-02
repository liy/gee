import { CommandCallback, CallbackID } from '../../web/constants';

let idTracker = 0;

export default class CallbackStore {
  private map: Map<CallbackID, CommandCallback>;

  constructor() {
    this.map = new Map();
  }

  add(callback: CommandCallback): CallbackID {
    const id = ++idTracker;
    this.map.set(id, callback);
    return id;
  }

  onReadline(id: CallbackID, line: string) {
    const callback = this.map.get(id);
    if (callback) {
      callback.onReadLine!(line, id);
    }
  }

  onError(id: CallbackID, err: Error) {
    const callback = this.map.get(id);
    if (callback && callback.onError) {
      callback.onError(err, id);
    }
    // TODO: should I delete callbacks?
  }

  onClose(id: CallbackID) {
    const callback = this.map.get(id);
    if (callback && callback.onClose) {
      callback.onClose(id);
    }
    this.map.delete(id);
  }
}
