import React, {Component, Suspense, useCallback, useEffect, useRef, useState} from 'react';
import {ElephantCanvas, type ElephantMotion} from './ElephantModel';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import content from './content.json';
import {ElephantCoding} from './ElephantCoding';

class ElephantBoundary extends Component<{children: React.ReactNode; onFailure: () => void}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() {return {failed: true};}
  componentDidCatch() {this.props.onFailure();}
  render() {return this.state.failed ? <div className="elephant-message" role="alert">The elephant could not load. Check graphics acceleration and reload the lesson.</div> : this.props.children;}
}
const JOURNEY: {prompt: string; motion: ElephantMotion; observation: string}[] = [
  {prompt: 'Walk to the feeding place. Which action uses the legs?', motion: 'walk', observation: 'Watch the legs take turns supporting the elephant.'},
  {prompt: 'Time for food. Which action uses the trunk?', motion: 'eating', observation: 'Watch the trunk move as the elephant eats.'},
  {prompt: 'The journey is over. Help the elephant rest.', motion: 'rest', observation: 'Watch the elephant settle into its resting pose.'},
];
const ACTIONS: {motion: ElephantMotion; label: string}[] = [{motion: 'walk', label: 'Walk'}, {motion: 'eating', label: 'Eat'}, {motion: 'rest', label: 'Rest'}];
export const ElephantStage: React.FC<{
  mode: string; activePart: string; lastSelectedPart: string | null; warmupVideoUrl: string;
  onSelect: (part: string) => void; activityDone: boolean;
  completeActivity: () => void; resetActivity: () => void;
}> = ({mode, warmupVideoUrl, onSelect, activityDone, completeActivity, resetActivity}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const [motion, setMotion] = useState<ElephantMotion>('idle'), [playing, setPlaying] = useState(false);
  const [token, setToken] = useState(0), [viewToken, setViewToken] = useState(0);
  const [step, setStep] = useState(0), [running, setRunning] = useState(false), [hint, setHint] = useState('');
  const [fullscreen, setFullscreen] = useState(false), [fullscreenError, setFullscreenError] = useState('');
  const runningRef = useRef(false);
  const readyModel = useCallback(() => setReady(true), []);
  const failure = useCallback(() => {setReady(false); setFailed(true); setPlaying(false);}, []);
  useEffect(() => {
    setPlaying(false); setRunning(false); runningRef.current = false; setMotion('idle'); setToken(value => value + 1); setHint('');
  }, [mode]);
  useEffect(() => {
    const changed = () => setFullscreen(Boolean(ref.current && document.fullscreenElement === ref.current));
    document.addEventListener('fullscreenchange', changed);
    return () => document.removeEventListener('fullscreenchange', changed);
  }, []);
  const finished = useCallback(() => {
    if (!runningRef.current) return;
    runningRef.current = false; setRunning(false); setPlaying(false);
    setStep(step + 1); setHint('');
    if (step === JOURNEY.length - 1) completeActivity();
  }, [step, completeActivity]);
  const rewind = (next: number) => {
    runningRef.current = false; setRunning(false); setPlaying(false); setStep(next); setHint('');
    setMotion('idle'); setToken(value => value + 1); resetActivity();
  };
  const act = (next: ElephantMotion) => {
    if (!ready || running || step >= JOURNEY.length) return;
    if (next !== JOURNEY[step].motion) {setHint('Try again. Read the mission clue before choosing.'); return;}
    runningRef.current = true; setRunning(true); setMotion(next); setPlaying(true); setToken(value => value + 1); setHint('');
  };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (ref.current?.requestFullscreen) await ref.current.requestFullscreen();
      else setFullscreenError('Fullscreen is unavailable in this browser.');
    } catch {setFullscreenError('Fullscreen is unavailable in this browser.');}
  };
  const activity = mode === 'activity';
  if (mode === 'warmup') return warmupVideoUrl ? <WarmupScreen videoUrl={warmupVideoUrl} /> : <div className="generic-stage"><p>Select a class to load its warmup video.</p></div>;
  if (mode === 'story') return <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl} />;
  if (mode === 'coding') return <ElephantCoding />;
  return <div ref={ref} data-model-ready={ready} className={`generic-stage elephant-stage elephant-stage--${mode}`}>
    <div className="elephant-heading"><strong>{mode === 'identify' ? 'Find the elephant’s parts' : activity ? 'An elephant’s day' : 'Meet the elephant'}</strong><span>Drag to turn · Pinch or scroll to zoom</span></div>
    <div className="elephant-viewport"><ElephantBoundary onFailure={failure}><Suspense fallback={<div className="elephant-message" role="status">Loading elephant…</div>}><ElephantCanvas motion={motion} playing={playing} once={activity} token={token} viewToken={viewToken} identify={mode === 'identify'} onSelect={onSelect} onReady={readyModel} onFinished={finished} /></Suspense></ElephantBoundary></div>
    <div className="elephant-controls">
      {mode === 'explore' ? <div className="elephant-actions"><label>Motion <select aria-label="Elephant motion" disabled={!ready} value={motion} onChange={event => {setMotion(event.target.value as ElephantMotion); setToken(value => value + 1); setPlaying(true);}}><option value="idle">Stand</option><option value="walk">Walk</option><option value="eating">Eat</option><option value="rest">Rest</option></select></label><button disabled={!ready} aria-pressed={playing} onClick={() => setPlaying(value => !value)}>{playing ? 'Pause motion' : 'Play motion'}</button><button disabled={!ready} onClick={() => {setPlaying(false); setToken(value => value + 1);}}>Reset motion</button></div> : null}
      {activity ? <><p role="status" aria-live="polite">{failed ? 'The model is unavailable.' : !ready ? 'Loading the 3D elephant…' : hint || (running ? JOURNEY[step].observation : activityDone ? 'Walk, eat, rest — you helped the elephant through its day!' : JOURNEY[step]?.prompt ?? 'Your elephant’s day is complete.')}</p><div className="elephant-actions">{ACTIONS.map(action => <button key={action.motion} disabled={!ready || running || step === JOURNEY.length} onClick={() => act(action.motion)}>{action.label}</button>)}<button disabled={step === 0 && !running} onClick={() => rewind(Math.max(0, step - 1))}>Back one step</button><button onClick={() => rewind(0)}>Try again</button></div><label className="elephant-progress">Day: {step} / {JOURNEY.length}<progress value={step} max={JOURNEY.length} aria-label="Elephant day progress" /></label></> : null}
      <div className="elephant-actions elephant-view-actions"><button onClick={() => setViewToken(value => value + 1)}>Reset view</button><button onClick={() => void toggleFullscreen()}>{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button>{fullscreenError ? <span role="status">{fullscreenError}</span> : null}</div>
    </div>
  </div>;
};
