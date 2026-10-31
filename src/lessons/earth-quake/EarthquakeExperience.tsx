import React, {useCallback, useEffect, useRef, useState} from 'react';
import {EarthquakeScene, type Stress} from './EarthquakeScene';
import './earthquake.css';
import {EARTHQUAKE_ACTIVITIES} from './activities';
import {createShakeSiren} from './shakeSiren';

const titles = EARTHQUAKE_ACTIVITIES.map(activity => activity.label);
const stressFacts: Record<Stress, string> = {
  tension: 'Tension stretches rock. The blocks pull apart.',
  compression: 'Compression squeezes rock. The blocks push together and may rise.',
  shear: 'Shear moves rock sideways. The blocks slide past each other.',
};
const programSteps = ['Warn with light + sound', 'Set shaking level to 9', 'Run motor at level × 10%', 'Decrease level by 1', 'Repeat while level > 4', 'Stop motor'];
export type EarthquakeProgress = {done: number[]};
export function EarthquakeExperience({view, onSelectView, progress, setProgress, completeActivity, resetActivity}: {
  view: number; onSelectView: (index: number) => void; progress: EarthquakeProgress; setProgress: (p: EarthquakeProgress) => void; completeActivity: () => void; resetActivity: () => void;
}) {
  const [cutaway, setCutaway] = useState(false);
  const [layer, setLayer] = useState('');
  const [stress, setStress] = useState<Stress>('tension');
  const [amount, setAmount] = useState(0);
  const [seenStress, setSeenStress] = useState<Stress[]>([]);
  const [challenge, setChallenge] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [released, setReleased] = useState(false);
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(false);
  const [program, setProgram] = useState<number[]>([]);
  const [phase, setPhase] = useState('Ready');
  const [level, setLevel] = useState(0);
  const [shakeStrength, setShakeStrength] = useState(5);
  const [peakStrength, setPeakStrength] = useState(0);
  const [sirenEnabled, setSirenEnabled] = useState(true);
  // Matches the amplitude of the platform's simulated motion in EarthquakeMachine.
  const liveStrength = view === 4 && running ? Math.abs(Math.sin(tick * 1.8)) * shakeStrength : 0;
  const root = useRef<HTMLDivElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const siren = useRef<ReturnType<typeof createShakeSiren> | null>(null);
  const prepareAudio = () => {
    try {
      const context = audio.current ?? new AudioContext();
      audio.current = context;
      void context.resume().catch(() => setFeedback('Sound is unavailable. You can still watch the shake reading.'));
    } catch {
      setFeedback('Sound is unavailable. You can still watch the shake reading.');
    }
  };
  useEffect(() => {
    if (view !== 4 || !running || !sirenEnabled || !audio.current) return;
    const alarm = createShakeSiren(audio.current, shakeStrength);
    siren.current = alarm;
    return () => {alarm.stop(); siren.current = null;};
    // Strength changes update the current siren without restarting its sweep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, running, sirenEnabled]);
  useEffect(() => {siren.current?.update(shakeStrength);}, [shakeStrength]);
  const mark = useCallback((id: number) => {
    if (progress.done.includes(id)) return;
    const done = [...progress.done, id]; setProgress({done});
    if (done.length === EARTHQUAKE_ACTIVITIES.length) completeActivity();
  }, [progress.done, setProgress, completeActivity]);
  useEffect(() => () => {void audio.current?.close();}, []);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setTick(t => t + 1), 100);
    return () => window.clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (!running) return;
    if (view === 2 && tick >= 24) {setRunning(false); mark(2); setFeedback('The locked fault slipped. Stored energy spread outward as seismic waves.');}
    if (view === 4 && tick >= 20) mark(4);
    if (view === 3) {
      if (tick < 10) {setPhase('Warning: light + sound'); setLevel(0);}
      else if (tick < 60) {const nextLevel = 9 - Math.floor((tick - 10) / 10); setLevel(nextLevel); setPhase(`Motor running at ${nextLevel * 10}%`);}
      else {setLevel(0); setPhase('Motor stopped'); setRunning(false); mark(3); setFeedback('Your program warned first, reduced shaking from level 9 to 5, then stopped.');}
    }
  }, [tick, running, view, mark]);
  useEffect(() => {
    if (view === 4 && running) setPeakStrength(peak => Math.max(peak, liveStrength));
  }, [view, running, liveStrength]);
  const chooseView = (next: number) => {onSelectView(next); setRunning(false); setReleased(false); setTick(0); setLevel(0); setAmount(0); setFeedback(''); setPhase('Ready');};
  useEffect(() => {
    setRunning(false); setReleased(false); setTick(0); setLevel(0); setAmount(0); setFeedback(''); setPhase('Ready'); setPeakStrength(0);
  }, [view]);
  const selectLayer = (name: string) => {
    setLayer(name);
    setFeedback(name === 'Crust' ? 'Yes! The crust is the thin, outer rocky layer.' : `${name}: look farther outward to find the crust.`);
    if (cutaway && name === 'Crust') mark(0);
  };
  const moveRocks = (value: number) => {
    setAmount(value);
    if (value >= 75 && !seenStress.includes(stress)) setSeenStress([...seenStress, stress]);
  };
  const answerStress = (answer: Stress) => {
    const expected: Stress[] = ['compression', 'tension', 'shear'];
    if (answer !== expected[challenge]) {setFeedback('Look at the motion: push together, pull apart, or slide sideways. Try again.'); return;}
    setFeedback(`Correct! ${stressFacts[answer]}`);
    if (challenge === 2) {setChallenge(3); mark(1);} else setChallenge(challenge + 1);
  };
  const startProgram = () => {
    if (program.length !== 6 || program.some((step, i) => step !== i)) {setFeedback('Check the order: warn, set the level, run, decrease, repeat, then stop.'); return;}
    try {
      const context = audio.current ?? new AudioContext(); audio.current = context; void context.resume();
      const oscillator = context.createOscillator(); const gain = context.createGain(); gain.gain.value = 0.06;
      oscillator.connect(gain); gain.connect(context.destination); oscillator.frequency.value = 660; oscillator.start(); oscillator.stop(context.currentTime + 0.35);
    } catch { /* The visible warning remains available when audio is unavailable. */ }
    setTick(0); setRunning(true); setPhase('Warning: light + sound'); setFeedback('');
  };
  const reset = () => {resetActivity(); setProgress({done: []}); setCutaway(false); setLayer(''); setSeenStress([]); setChallenge(0); setProgram([]); setShakeStrength(5); setPeakStrength(0); chooseView(0);};
  return <div className="eq-experience" ref={root}>
    <div className="eq-toolbar"><strong>Earthquake science lab</strong><button onClick={() => {if (document.fullscreenElement) void document.exitFullscreen(); else void root.current?.requestFullscreen();}}>Fullscreen</button></div>
    <div className="eq-layout"><div className="eq-visual"><EarthquakeScene view={view} cutaway={cutaway} stress={stress} amount={amount} released={released} tick={tick} shaking={running ? view === 3 ? level : view === 4 ? shakeStrength : 5 : 0} layer={layer} onLayer={selectLayer} />{view === 0 && layer && <strong className="eq-layer-selection" role="status">Selected: {layer}</strong>}<span className="eq-caption">Drag to rotate · Scroll or pinch to zoom · Diagram, not to scale</span>{view === 3 && <strong className={`eq-warning ${running && tick < 10 ? 'eq-warning--active' : ''}`}>{phase}</strong>}{view === 4 && <div className="eq-shake-reading">
      <span>Simulated shake strength</span>
      <output aria-label="Live shake strength">{liveStrength.toFixed(1)}<small> / 10</small></output>
      <meter min="0" max="10" value={liveStrength} aria-label="Shake strength meter" />
      <span>Peak: {peakStrength.toFixed(1)} / 10 · {running ? 'Shaking' : 'Stopped'}</span>
    </div>}</div>
    <section className="eq-controls" aria-label={titles[view]}><h2>{titles[view]}</h2>
      {view === 0 && <><p>Earth’s crust is its thin, outer rocky layer. Beneath it are the mantle and core.</p><button onClick={() => {setCutaway(!cutaway); setLayer('');}}>{cutaway ? 'Close Earth' : 'Open Earth'}</button><p>{cutaway ? 'Find the crust: tap the outer green layer or choose its name.' : 'Open Earth to see its layers.'}</p><div className="eq-actions">{['Crust', 'Mantle', 'Core'].map(name => <button disabled={!cutaway} key={name} aria-pressed={layer === name} onClick={() => selectLayer(name)}>{name}</button>)}</div><p className="eq-note">Tectonic plates contain the crust and rigid uppermost mantle. They move slowly over softer, mostly solid mantle rock.</p></>}
      {view === 1 && <><p>Explore all three movements. Move the slider to see the rocks change.</p><div className="eq-actions">{(['tension', 'compression', 'shear'] as Stress[]).map(s => <button key={s} aria-pressed={stress === s} onClick={() => {setStress(s); setAmount(0);}}>{s}{seenStress.includes(s) ? ' ✓' : ''}</button>)}</div><label>Rock movement: {amount}%<input type="range" min="0" max="100" value={amount} onChange={e => moveRocks(Number(e.target.value))} /></label><p>{stressFacts[stress]}</p>{seenStress.length === 3 && challenge < 3 && <fieldset><legend>Show what you learned: {['rocks push together', 'rocks pull apart', 'rocks slide sideways'][challenge]}.</legend>{(['tension', 'compression', 'shear'] as Stress[]).map(s => <button key={s} onClick={() => answerStress(s)}>{s}</button>)}</fieldset>}</>}
      {view === 2 && <><p>The fault is stuck while the surrounding rock keeps moving. Build stress, then release the fault.</p><label>Stored stress in this model: {amount}%<input disabled={released} type="range" min="0" max="100" value={amount} onChange={e => setAmount(Number(e.target.value))} /></label><progress value={amount} max="100" /><button disabled={amount < 75 || released} onClick={() => {setReleased(true); setTick(0); setRunning(true); setFeedback('The fault slips! Watch the waves spread.');}}>Release fault</button><button onClick={() => {setReleased(false); setRunning(false); setTick(0); setAmount(0); setFeedback('');}}>Reset fault</button><p className="eq-note">All three stress types can be involved in earthquakes. This simplified model shows a sideways slip, not an earthquake prediction.</p></>}
      {view === 3 && <><p>Build a program, then press Button A. This machine follows the classroom build guide.</p><ol className="eq-program">{program.map((step, i) => <li key={i}>{programSteps[step]}</li>)}</ol><div className="eq-code-options">{[2, 0, 4, 1, 5, 3].map(i => <button key={i} disabled={running || program.includes(i)} onClick={() => setProgram([...program, i])}>{programSteps[i]}</button>)}</div><div className="eq-actions"><button disabled={running || !program.length} onClick={() => setProgram(program.slice(0, -1))}>Undo</button><button disabled={running || program.length !== 6} onClick={startProgram}>Button A: run</button><button disabled={!running} onClick={() => {setRunning(false); setLevel(0); setPhase('Stopped by you');}}>Stop</button></div><p className="eq-note">Shaking level controls motor speed. It is not real earthquake magnitude. Playback is shortened for this model.</p></>}
      {view === 4 && <>
        <p>Press Shake to start. Watch the live reading, change the strength, then press again to stop.</p>
        <label>Shaking strength: {shakeStrength} / 10
          <input type="range" min="1" max="10" step="1" value={shakeStrength} onChange={event => setShakeStrength(Number(event.target.value))} />
        </label>
        <div className="eq-actions"><button className="eq-shake-toggle" aria-pressed={running} onClick={() => {
          if (running) {setRunning(false); setFeedback('Shaking stopped. The live reading is zero.');}
          else {setTick(0); setRunning(true); setFeedback('Watch the reading rise and fall with the platform. Try a different shaking strength.'); if (sirenEnabled) prepareAudio();}
        }}>{running ? 'Stop shaking' : 'Shake'}</button>
          <button aria-pressed={sirenEnabled} onClick={() => {if (!sirenEnabled && running) prepareAudio(); setSirenEnabled(!sirenEnabled);}}>{sirenEnabled ? 'Mute siren' : 'Enable siren'}</button>
        </div>
        <p className="eq-note">The siren gets louder, higher and faster as shaking strength increases.</p>
        <p className="eq-note">Shake for two seconds to complete this activity. The reading follows the model’s movement on a 0–10 scale; it is not a real earthquake magnitude or a sensor measurement.</p>
      </>}
      <p className="eq-feedback" role="status">{feedback || `${progress.done.length} of ${EARTHQUAKE_ACTIVITIES.length} activities complete.`}</p>
      <div className="eq-actions">
        {progress.done.includes(view) && view < EARTHQUAKE_ACTIVITIES.length - 1 && <button onClick={() => chooseView(view + 1)}>Next activity →</button>}
        <button onClick={reset}>Try again: reset all activities</button>
      </div>
    </section></div>
  </div>;
}
