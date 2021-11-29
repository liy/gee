import { CommandCallback, OutputRouteId } from '../../web/constants';

let idTracker = 0;

export default class CallbackStore {
  private map: Map<OutputRouteId, CommandCallback>;

  constructor() {
    this.map = new Map();
  }

  add(callback: CommandCallback): OutputRouteId {
    const id = ++idTracker;
    this.map.set(id, callback);
    return id;
  }

  onReadline(id: OutputRouteId, line: string) {
    const callback = this.map.get(id);
    if (callback) {
      callback.onReadLine!(line, id);
    }
  }

  onError(id: OutputRouteId, err: Error) {
    const callback = this.map.get(id);
    if (callback && callback.onError) {
      callback.onError(err, id);
    }
  }

  // onExit(id: OutputRouteId) {
  //   const callback = this.map.get(id);
  //   if (callback && callback.onExit) {
  //     // In this case that onExit callback returns truthy, it will remove callback straightway and onClose will not be called anymore.
  //     if (callback.onExit(id)) {
  //       this.map.delete(id);
  //     }
  //   }
  // }

  onClose(id: OutputRouteId) {
    const callback = this.map.get(id);
    if (callback && callback.onClose) {
      const success = this.map.delete(id);
      callback.onClose(id);
      console.log('onClose', id, this.map, success);
    }
  }
}
