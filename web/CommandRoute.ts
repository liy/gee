export interface CommandCallback {
  onReadLine: (line: string) => void;
  onClose?: () => void;
  onError?: (err: Error) => void;
}

export type OutputRouteId = number;

let counter = 0;

class CommandRoute {
  private map: Map<OutputRouteId, CommandCallback>;

  constructor() {
    this.map = new Map();
  }

  submit(args: Array<string>, callback: CommandCallback): void {
    window.api.submitCommand(args, callback);
  }

  add(callback: CommandCallback): OutputRouteId {
    this.map.set(++counter, callback);
    return counter;
  }

  readline(id: OutputRouteId, line: string) {
    const callback = this.map.get(id);
    if (callback) {
      callback.onReadLine(line);
    }
  }

  error(id: OutputRouteId, err: Error) {
    const callback = this.map.get(id);
    if (callback && callback.onError) {
      callback.onError(err);
    }
  }

  close(id: OutputRouteId) {
    const callback = this.map.get(id);
    if (callback && callback.onClose) {
      callback.onClose();
    }
    this.map.delete(id);
  }
}

export default new CommandRoute();
