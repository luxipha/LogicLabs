import React from 'react';
import {DuskLampCanvas} from './DuskDawnLamp';
import {lightShouldBeOn} from './smartLightLogic';
const TIMES = [{label: 'Day', level: 220}, {label: 'Dusk', level: 40}, {label: 'Night', level: 10}, {label: 'Dawn', level: 210}];
export const SmartLightExplore: React.FC<{
  level: number; threshold: number; viewToken: number;
  setLevel: (level: number) => void; setThreshold: (threshold: number) => void;
}> = ({level, threshold, viewToken, setLevel, setThreshold}) => {
  const lit = lightShouldBeOn(level, threshold), time = TIMES.find(item => item.level === level)?.label ?? (level < 128 ? 'Low light' : 'Daylight');
  return <div className="sl-lamp-workspace sl-lamp-explorer">
    <div className={`sl-live-world ${level < 128 ? 'is-dark' : 'is-bright'}`}>
      <div className="sl-live-canvas"><DuskLampCanvas night={level < 128} lit={lit} reset={viewToken}/></div>
      <div className="sl-world-heading"><strong>{time}</strong><span>The sensor watches the surroundings.</span></div>
      <div className="sl-world-reading" role="status">Lamp {lit ? 'ON' : 'OFF'} · Reading {level}</div>
      <span className="sl-orbit-hint">Drag to turn · Scroll or pinch to zoom</span>
    </div>
    <div className="sl-explorer-panel">
      <h3>From dusk to dawn</h3><p>Change the surroundings and watch the lamp respond automatically.</p>
      <div className="sl-time-presets">{TIMES.map(time => <button type="button" key={time.label} aria-pressed={level === time.level} onClick={() => setLevel(time.level)}>{time.label}</button>)}</div>
      <label className="sl-slider">Light level <output>{level}</output><input aria-label="Explore light level" type="range" min="0" max="255" value={level} onChange={event => setLevel(Number(event.target.value))}/></label>
      <div className="sl-light-scale"><span>0 · Dark</span><span>255 · Bright</span></div>
      <label className="sl-slider">Switching threshold <output>{threshold}</output><input aria-label="Threshold" type="range" min="0" max="255" value={threshold} onChange={event => setThreshold(Number(event.target.value))}/></label>
      <div className="sl-live-rule"><span>Sensor reading {level}</span><strong>{level} {level < threshold ? '<' : '≥'} {threshold}</strong><span>Controller tells the lamp: <b>{lit ? 'ON' : 'OFF'}</b></span></div>
      <button type="button" onClick={() => {setLevel(220); setThreshold(128);}}>Reset explorer</button>
      <p className="sl-microbit-bridge">Light values are simulated micro:bit readings. The threshold decides when the lamp switches.</p>
    </div>
  </div>;
};
