import { Reducer } from '../../vase';
import { ActionMapping } from './store';
import { State } from './store';

export const reducer: Reducer<ActionMapping, State> = {
  update(action, state) {
    return {
      ...state,
      logs: action.logs,
    };
  },
  selectLog(action, state) {
    return {
      ...state,
      selectedLog: action.log,
    };
  },
};
