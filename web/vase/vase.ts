export type ValueOf<T> = T[keyof T];

type Subscription<S, M> = {
  [K in keyof M]: (state: S, action: M[K]) => any;
};

export class Signal<S, M> {
  protected subscriptions: Array<Subscription<S, M>> = [];

  constructor() {}

  notify(type: keyof M, action: M[keyof M], state: S) {
    for (let sub of this.subscriptions) {
      if (sub[type]) {
        sub[type](state, action);
      }
    }
  }

  on(sub: Subscription<S, M>): () => void {
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

export type Transform<S, M> = {
  [K in keyof M]: (state: S, action: M[K]) => S;
};

// Constraints key of the mapping needs to be the type of the action(base action)
export type Correlate<M> = Record<keyof M, BaseAction<M>>;

export class Store<M extends Correlate<M>, State> extends Signal<State, M> {
  protected state: State;

  constructor(initialState: State, protected transform: Transform<State, M>) {
    super();
    this.state = initialState;
  }

  operate(action: ValueOf<M>) {
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
