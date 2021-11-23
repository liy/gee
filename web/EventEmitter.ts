/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Listener {
  fn: (data: any, type: any) => void;
  context: any;
  once?: (data: any, type: any) => void;
}

export default class EventEmitter<EM> {
  private listeners: Map<string, Array<Listener>>;
  constructor() {
    this.listeners = new Map<string, Array<Listener>>();
  }

  destroy(): void {
    this.removeAllListeners();
  }

  /**
   * [on description]
   * @param {[type]} type       [description]
   * @param {[type]} listener   [description]
   */
  on<K extends keyof EM & string, T extends EM[K]>(type: K, fn: (data: T, type: K) => void, context: any = fn): void {
    const listeners = this.listeners.get(type) || [];
    listeners.push({
      fn,
      context,
    });
    this.listeners.set(type, listeners);
  }

  has(type: string): boolean {
    return this.listeners.has(type);
  }

  off(type: string, fn: (data: any, type: string) => void, context: any = fn): void {
    const typedListeners = this.listeners.get(type);

    if (typedListeners) {
      for (let i = typedListeners.length - 1; i >= 0; --i) {
        const listener = typedListeners[i];
        // Note that, I also check the wrapped function in order to remove "once" listener
        if ((listener.fn === fn && listener.context === context) || listener.once == fn) {
          typedListeners.splice(i, 1);
        }
      }
    }
  }

  once(type: string, fn: (data: any, type: string) => void, context: any = fn): void {
    // this.listeners[type] = this.listeners[type] || [];
    const listeners = this.listeners.get(type) || [];
    this.listeners.set(type, listeners);

    const wrapper = (data: any, type: string) => {
      fn.call(context, data, type);
      this.off(type, wrapper, context);
    };
    listeners.push({
      fn: wrapper,
      //
      once: fn,
      context,
    });
  }

  removeAllListeners(): void {
    this.listeners = new Map<string, Array<Listener>>();
  }

  /**
   * Dispatch event with corresponding type, and add custom properties for
   * the event object being sent.
   * @param  {string} type  The type of the event.
   * @param  {Any} data  You can add extra custom properties into the event object using the object ma
   */
  emit<K extends keyof EM & string, T extends EM[K]>(type: K, data?: T): void {
    let listeners = this.listeners.get(type);
    if (listeners) {
      // Avoid looping issues when listener is removed during the dispatching process.
      listeners = listeners.concat();
      // for(let i=0; i<listeners.length; ++i) {
      for (const listener of listeners) {
        // note that every listener gets a complete new event object instance. Just in case they modified the event
        // during event dispatching
        listener.fn.call(listener.context, data, type);
      }
    }
  }
}
