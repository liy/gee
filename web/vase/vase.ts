/**
 * Constraint the action type
 */
export type BaseAction<M> = {
  type: keyof M;
};

/**
 * Constraints key of the mapping needs to be the type of the action(base action)
 */
export type ActionMapping<M> = Record<keyof M, BaseAction<M>>;

/**
 * Constrain the subscription function name and its parameters
 */
export type Subscription<M extends ActionMapping<M>, S = any> = {
  [K in keyof M]?: (action: Readonly<M[K]>, newState: Readonly<S>, oldState: Readonly<S>) => void;
};

/**
 * Constrain the transform function name and its parameters
 */
export type Transform<M extends ActionMapping<M>, S = any> = {
  [K in keyof M]?: (action: Readonly<M[K]>, state: Readonly<S>) => S;
};

/**
 * Middleware is a function which intercepts an action and output another action (usually be the same action). Return nothing will halt the operation
 */
export type Middleware<M extends ActionMapping<M>, State, ST extends Store<M, State>> = (
  action: Readonly<M[keyof M]>,
  store: ST
) => Readonly<M[keyof M]> | void;

export type Config = {};

export class Store<M extends ActionMapping<M> = any, State = any> {
  protected subscriptions: Array<Subscription<M, State>> = [];
  private reducedMiddleware: Middleware<M, State, Store<M, State>>;

  constructor(
    protected state: State,
    protected transform: Transform<M, State>,
    middilewares: Middleware<M, State, Store<M, State>>[] = []
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

  updateTransform(transform: Transform<M, State>) {
    this.transform = transform;
  }

  operate(action: M[keyof M]) {
    const newAction = this.reducedMiddleware(action, this);
    // Halt the operate if action is not valid anymore
    if (!newAction) return;

    const transformer = this.transform[newAction.type];
    if (transformer) {
      const oldState = this.state;
      this.state = transformer(newAction, this.state);
      this.notify(newAction, this.state, oldState);
    }
  }

  notify(action: Readonly<M[keyof M]>, newState: Readonly<State>, oldState: Readonly<State>) {
    for (let subscription of this.subscriptions) {
      // Optional chaining function call
      subscription[action.type]?.(action, newState, oldState);
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
