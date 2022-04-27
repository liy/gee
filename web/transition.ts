import EventEmitter from './EventEmitter'

export type TransitionEventMap = {
    'log.focus': string;
}

export const transition = new EventEmitter<TransitionEventMap>()