export type OutputCallback = (line: string) => void;

export type OutputRouteId = number;

let counter = 0;

class CommandRoute {
  private map: Map<OutputRouteId, OutputCallback>;

  constructor() {
    this.map = new Map();
  }

  submit(input: string, callback: OutputCallback): void {
    let args = input.split(' ');
    if (args[0] === 'git') {
      args = args.slice(1);
    }

    window.api.submitCommand(args, callback);
  }

  add(callback: OutputCallback): OutputRouteId {
    this.map.set(++counter, callback);
    return counter;
  }

  route(id: OutputRouteId, line: string) {
    const callback = this.map.get(id);
    if (callback) {
      callback(line);
    }
  }

  remove(id: OutputRouteId) {
    this.map.delete(id);
  }
}

export default new CommandRoute();
