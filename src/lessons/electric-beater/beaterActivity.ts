import type {BeaterSpeed} from './beaterParts';
export const MIX_SECONDS = 3;
export type MixState = {bowl: boolean; speed: BeaterSpeed; slow: number; fast: number; finished: boolean};
export const INITIAL_MIX: MixState = {bowl: false, speed: 0, slow: 0, fast: 0, finished: false};
export type MixAction = {type: 'bowl'} | {type: 'speed'; speed: 1 | 2} | {type: 'off'} | {type: 'tick'; seconds: number} | {type: 'reset'};

export function mixReducer(state: MixState, action: MixAction): MixState {
  if (action.type === 'reset') return {...INITIAL_MIX};
  if (action.type === 'bowl') return state.speed !== 0 ? state : state.bowl ? {...INITIAL_MIX} : {...state, bowl: true};
  if (action.type === 'off') return {...state, speed: 0, finished: state.bowl && state.slow >= MIX_SECONDS && state.fast >= MIX_SECONDS};
  if (action.type === 'speed') {
    if (!state.bowl || state.finished || (state.slow >= MIX_SECONDS && state.fast >= MIX_SECONDS) || (action.speed === 2 && state.slow < MIX_SECONDS)) return state;
    return {...state, speed: action.speed};
  }
  if (!state.bowl || state.finished || !state.speed) return state;
  const step = Math.max(0, Math.min(action.seconds, .25));
  if (state.speed === 1 && state.slow < MIX_SECONDS) return {...state, slow: Math.min(MIX_SECONDS, state.slow + step)};
  if (state.speed === 2 && state.slow >= MIX_SECONDS && state.fast < MIX_SECONDS) return {...state, fast: Math.min(MIX_SECONDS, state.fast + step)};
  return state;
}

export const mixInstruction = (state: MixState) => state.finished ? 'Smooth mix! The motor is off. Remove the bowl or try again.'
  : !state.bowl ? 'Place the bowl under the beaters.'
  : state.fast >= MIX_SECONDS ? 'The mixture is smooth. Switch Off to finish.'
  : state.slow >= MIX_SECONDS ? 'Slow mixing is done. Choose Fast to finish the mix.'
  : state.speed === 1 ? 'Mixing gently… watch both beaters turn.'
  : 'Choose Slow to begin. You can pause with Off.';
