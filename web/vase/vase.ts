// Constraint the action type
export type BaseAction<M> = {
  type: keyof M;
};

// Constraints key of the mapping needs to be the type of the action(base action)
export type ActionMapping<M> = Record<keyof M, BaseAction<M>>;

// Constrain the subscription function name and its parameters
export type Subscription<M extends ActionMapping<M>, S = any> = {
  [K in keyof M]?: (action: Readonly<M[K]>, state: Readonly<S>) => void;
};

// Constrain the transform function name and its parameters
export type Transform<M extends ActionMapping<M>, S = any> = {
  [K in keyof M]?: (action: Readonly<M[K]>, state: Readonly<S>) => S;
};

export type Middleware<M extends ActionMapping<M>, S> = (
  action: Readonly<M[keyof M]>,
  state: Readonly<S>
) => Readonly<M[keyof M]> | void;

export class Store<M extends ActionMapping<M> = any, State = any> {
  protected subscriptions: Array<Subscription<M, State>> = [];
  private reducedMiddleware: Middleware<M, State>;

  constructor(
    protected state: State,
    protected transform: Transform<M, State>,
    middilewares: Middleware<M, State>[] = []
  ) {
    this.reducedMiddleware = middilewares.reverse().reduce(
      (a, b) => {
        return (action, state) => {
          const newAction = b(action, state);
          if (newAction) {
            return a(newAction, state);
          }
        };
      },
      // dummy pass through function so we don't get conditional check in operate
      (action) => action
    );
  }

  operate(action: M[keyof M]) {
    const newAction = this.reducedMiddleware(action, this.state);
    // Halt the operate if action is not valid anymore
    if (!newAction) return;

    const transformer = this.transform[newAction.type];
    if (transformer) {
      this.state = transformer(newAction, this.state);
      this.notify(newAction, this.state);
    }
  }

  notify(action: Readonly<M[keyof M]>, state: Readonly<State>) {
    for (let subscription of this.subscriptions) {
      // Optional chaining function call
      subscription[action.type]?.(action, state);
    }
  }

  on(sub: Subscription<M, State>): () => void {
    this.subscriptions.push(sub);

    return () => {
      const temp = [...this.subscriptions];
      const index = temp.indexOf(sub);
      temp.splice(index, 1);
      this.subscriptions = temp;
    };
  }

  get currentState() {
    return this.state;
  }
}
