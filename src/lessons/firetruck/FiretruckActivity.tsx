import React from 'react';
import {FiretruckDiagram} from './FiretruckDiagram';

export const PRACTICE_TARGETS = [280, 190, 100];
export const INITIAL_RESCUE = {angle: 6, pump: false, water: 6, cleared: [] as number[], message: 'Turn on the pump, then aim at a practice flame.', sprayed: false};
export type RescueState = typeof INITIAL_RESCUE;
export type RescueAction = {type: 'aim'; angle: number} | {type: 'pump'} | {type: 'refill'} | {type: 'spray'} | {type: 'reset'};
export const aimHeight = (angle: number) => 360 - 405 * Math.tan(angle * Math.PI / 180);

export function rescueReducer(state: RescueState, action: RescueAction): RescueState {
  if (action.type === 'reset') return {...INITIAL_RESCUE, cleared: []};
  if (action.type === 'aim') return {...state, angle: action.angle, sprayed: false, message: 'Line up the blue aiming circle with a flame.'};
  if (action.type === 'pump') return {...state, pump: !state.pump, sprayed: false, message: state.pump ? 'Pump off. The water has stopped.' : 'Pump on! Aim the hose, then spray.'};
  if (action.type === 'refill') return {...state, water: 6, sprayed: false, message: 'Tank refilled. Try aiming again.'};
  if (!state.pump || state.water === 0 || state.cleared.length === PRACTICE_TARGETS.length) return state;
  const hit = PRACTICE_TARGETS.findIndex((y, index) => !state.cleared.includes(index) && Math.abs(y - aimHeight(state.angle)) < 23);
  const cleared = hit < 0 ? state.cleared : [...state.cleared, hit];
  return {...state, water: state.water - 1, sprayed: true, cleared, message: cleared.length === 3 ? 'All three practice flames are out! Turn off the pump to finish.' : hit < 0 ? 'Missed! Move the aiming circle onto a flame and try again.' : `Good aim! ${cleared.length} of 3 practice flames out.`};
}

export const FiretruckActivity: React.FC<{state: RescueState; dispatch: React.Dispatch<RescueAction>; done: boolean; onRetry: () => void}> = ({state, dispatch, done, onRetry}) => <div className="firetruck-rescue">
  <div className="firetruck-rescue__heading"><span>HOSE CONTROL LAB</span><strong>{done ? 'Mission complete!' : `${state.cleared.length} / 3 practice flames out`}</strong><span>Water: {state.water} / 6</span></div>
  <svg className="firetruck-rescue__scene" viewBox="0 0 900 460" role="img" aria-label={`Practice yard. Hose angle ${state.angle} degrees. ${state.cleared.length} of 3 flames out.`}>
    <rect width="900" height="460" rx="20" fill="#e8f4f8" />
    <path d="M0 426H900" stroke="#b7cdd7" strokeWidth="10" />
    <rect x="659" y="52" width="155" height="370" rx="12" fill="#b9ccd5" />
    <path d="M645 53H828" stroke="#7892a2" strokeWidth="12" strokeLinecap="round" />
    {PRACTICE_TARGETS.map((y, i) => <g key={y}>
      <rect x="692" y={y-31} width="76" height="65" rx="8" fill={state.cleared.includes(i) ? '#b3dfd0' : '#fff1cc'} stroke="#7892a2" strokeWidth="4" />
      {state.cleared.includes(i) ? <path d={`M710 ${y}l13 13 24-28`} fill="none" stroke="#277d64" strokeWidth="7" strokeLinecap="round" /> : <><path d={`M731 ${y-33}C752 ${y-9} 758 ${y+8} 743 ${y+23}C720 ${y+42} 695 ${y+13} 716 ${y-6}L719 ${y+4}Z`} fill="#ef7637" /><path d={`M732 ${y-3}Q750 ${y+24} 729 ${y+25}Q716 ${y+23} 732 ${y-3}`} fill="#ffcf58" /></>}
    </g>)}
    <svg x="18" y="270" width="350" height="179" viewBox="0 0 860 440"><FiretruckDiagram labels={false} /></svg>
    <path d="M228 378Q255 432 287 398L325 360" fill="none" stroke="#e6ba52" strokeWidth="13" />
    <g transform={`translate(325 360) rotate(${-state.angle})`}><path d="M-18 0H17" stroke="#33566b" strokeWidth="19" strokeLinecap="round" /></g>
    <path d={`M325 360Q525 ${aimHeight(state.angle) + 45} 730 ${aimHeight(state.angle)}`} fill="none" stroke={state.sprayed ? '#208ac8' : '#7eb9d4'} strokeWidth={state.sprayed ? 10 : 3} strokeDasharray={state.sprayed ? undefined : '9 9'} opacity={state.pump ? 1 : .4} />
    <circle cx="730" cy={aimHeight(state.angle)} r="21" fill="none" stroke="#1777ac" strokeWidth="3" strokeDasharray="5 4" />
    <text x="42" y="57" fill="#365a6e" fontSize="22" fontWeight="800">Firefighter training yard</text>
    <text x="42" y="88" fill="#56788b" fontSize="17">Aim • Spray • Switch off</text>
  </svg>
  <p className="firetruck-rescue__message" role="status" aria-live="polite">{done ? 'Great teamwork! The water is off and the training yard is clear.' : state.message}</p>
  <div className="firetruck-rescue__controls">
    <label className="firetruck-angle">Hose angle <strong>{state.angle}°</strong><input type="range" min="5" max="38" value={state.angle} onChange={(event) => dispatch({type: 'aim', angle: Number(event.target.value)})} /></label>
    <button type="button" aria-pressed={state.pump} onClick={() => dispatch({type: 'pump'})}>Pump {state.pump ? 'off' : 'on'}</button>
    <button type="button" className="firetruck-spray" disabled={!state.pump || state.water === 0 || state.cleared.length === 3} onClick={() => dispatch({type: 'spray'})}>Spray water</button>
    <button type="button" disabled={state.water === 6} onClick={() => dispatch({type: 'refill'})}>Refill tank</button>
    <button type="button" onClick={onRetry}>↻ Try again</button>
  </div>
</div>;
