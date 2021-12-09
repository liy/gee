type Subscription<L> = {
  [E in keyof L]: (...args: any[]) => any;
};

export class Signal<Sub extends Subscription<Sub>> {
  protected subscriptions: Array<Sub> = [];

  constructor() {}

  notify(type: keyof Sub, ...args: any[]) {
    for (let sub of this.subscriptions) {
      if (sub[type]) {
        sub[type](args);
      }
    }
  }

  on(sub: Sub): () => void {
    this.subscriptions.push(sub);

    return () => {
      const temp = [...this.subscriptions];
      const index = temp.indexOf(sub);
      temp.splice(index, 1);
      this.subscriptions = temp;
    };
  }
}

export type BaseAction<M> = {
  type: keyof M;
};

export type Transform<S, M> = Partial<Record<keyof M, (state: S, action: any) => S>>;

export class Store<M extends Subscription<M>, State> extends Signal<M> {
  protected state: State;

  constructor(initialState: State, protected transform: Transform<State, M>) {
    super();
    this.state = initialState;
  }

  operate<A extends BaseAction<M>>(action: A) {
    const transformer = this.transform[action.type];
    if (transformer) {
      this.state = transformer(this.state, action);
    }
    this.notify(action.type, action, this.state);
  }

  get currentState() {
    return this.state;
  }
}
