import React, {Component, Suspense, useCallback, useEffect, useReducer, useRef, useState} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import {ElectricBeaterCanvas} from './ElectricBeaterModel';
import {INITIAL_MIX, MIX_SECONDS, mixInstruction, mixReducer} from './beaterActivity';
import type {BeaterSpeed} from './beaterParts';
import content from './content.json';

class MixerBoundary extends Component<{children: React.ReactNode; onFailure: () => void}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? <div className="beater-message" role="alert">The 3D mixer could not load. Enable graphics acceleration, then reload the lesson.</div> : this.props.children; }
}

export const ElectricBeaterStage: React.FC<{
  mode: string; lastSelectedPart: string | null; onSelect: (part: string) => void;
  warmupVideoUrl: string; activityDone: boolean; completeActivity: () => void; resetActivity: () => void;
}> = ({mode, lastSelectedPart, onSelect, warmupVideoUrl, activityDone, completeActivity, resetActivity}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false), [viewToken, setViewToken] = useState(0), [resetToken, setResetToken] = useState(0);
  const [exploreSpeed, setExploreSpeed] = useState<BeaterSpeed>(0), [ready, setReady] = useState(false);
  const [mix, dispatch] = useReducer(mixReducer, INITIAL_MIX);
  const modelReady = useCallback(() => setReady(true), []), modelFailed = useCallback(() => setReady(false), []);
  const needsMixing = mix.speed === 1 ? mix.slow < MIX_SECONDS : mix.speed === 2 && mix.fast < MIX_SECONDS;
  useEffect(() => {
    const changed = () => setFullscreen(Boolean(ref.current && document.fullscreenElement === ref.current));
    document.addEventListener('fullscreenchange', changed);
    return () => document.removeEventListener('fullscreenchange', changed);
  }, []);
  useEffect(() => { if (mode !== 'explore') setExploreSpeed(0); }, [mode]);
  useEffect(() => {
    if (mode !== 'activity' || !ready || !mix.bowl || !mix.speed || mix.finished || !needsMixing) return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now(), seconds = (now - previous) / 1000; previous = now;
      if (!document.hidden) dispatch({type: 'tick', seconds});
    }, 100);
    return () => window.clearInterval(timer);
  }, [mode, ready, mix.bowl, mix.speed, mix.finished, needsMixing]);
  useEffect(() => { if (mode === 'activity' && mix.finished && !activityDone) completeActivity(); }, [mode, mix.finished, activityDone, completeActivity]);
  const retry = () => { dispatch({type: 'reset'}); setResetToken(value => value + 1); resetActivity(); };
  const toggleBowl = () => {
    if (mix.bowl) { setResetToken(value => value + 1); resetActivity(); }
    dispatch({type: 'bowl'});
  };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void ref.current?.requestFullscreen?.().catch(() => {});
  };
  if (mode === 'warmup') return <WarmupScreen videoUrl={warmupVideoUrl} />;
  if (mode === 'story') return <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl} />;
  const speed = mode === 'activity' ? mix.speed : mode === 'explore' ? exploreSpeed : 0;
  const mixed = (mix.slow + mix.fast) / (MIX_SECONDS * 2);
  const controlsLocked = !ready || !mix.bowl || mix.finished || mixed === 1;
  return <div ref={ref} className={`generic-stage beater-stage beater-stage--${mode}`}>
    <div className="beater-canvas"><MixerBoundary onFailure={modelFailed}><Suspense fallback={<div className="beater-message" role="status">Loading the electric beater…</div>}>
      <ElectricBeaterCanvas speed={speed} highlightedPart={mode === 'identify' ? lastSelectedPart : null} onSelect={mode === 'identify' ? onSelect : undefined} resetToken={resetToken} viewToken={viewToken} onReady={modelReady} bowl={mode === 'activity' && mix.bowl} progress={mixed} />
    </Suspense></MixerBoundary></div>
    <div className="beater-caption"><strong>{mode === 'activity' ? 'Virtual mixing lab' : mode === 'identify' ? 'Find the parts in 3D' : 'Meet the electric beater'}</strong><span>{mode === 'activity' ? 'Two beaters • One motor' : 'Drag to turn · Pinch or scroll to zoom'}</span></div>
    <div className="beater-toolbar">{mode !== 'activity' ? <button type="button" onClick={() => setViewToken(value => value + 1)}>Reset view</button> : null}<button type="button" onClick={toggleFullscreen}>{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button></div>
    {mode === 'explore' ? <div className="beater-explore-controls" aria-label="Explore motor speed"><span>Motor: <strong>{speed === 0 ? 'Off' : speed === 1 ? 'Slow' : 'Fast'}</strong></span>{([0, 1, 2] as const).map(value => <button type="button" key={value} disabled={!ready} aria-pressed={exploreSpeed === value} onClick={() => setExploreSpeed(value)}>{value === 0 ? 'Off' : value === 1 ? 'Slow' : 'Fast'}</button>)}</div> : null}
    {mode === 'activity' ? <div className="beater-activity-panel">
      <strong className="beater-status" role="status" aria-live="polite">{ready ? mixInstruction(mix) : 'Loading the 3D mixer…'}</strong>
      <div className="beater-meters"><label>1 · Slow <span>{mix.slow.toFixed(1)} / 3 s</span><progress max={MIX_SECONDS} value={mix.slow} aria-label="Slow mixing progress" /></label><label>2 · Fast <span>{mix.fast.toFixed(1)} / 3 s</span><progress max={MIX_SECONDS} value={mix.fast} aria-label="Fast mixing progress" /></label></div>
      <div className="beater-mix-controls">
        <button type="button" className="beater-bowl-control" disabled={!ready || mix.speed !== 0} onClick={toggleBowl}>{mix.bowl ? 'Remove bowl' : 'Place bowl'}</button>
        <button type="button" disabled={controlsLocked || mix.speed === 1} aria-pressed={mix.speed === 1} onClick={() => dispatch({type: 'speed', speed: 1})}>Slow</button>
        <button type="button" disabled={controlsLocked || mix.slow < MIX_SECONDS || mix.speed === 2} aria-pressed={mix.speed === 2} onClick={() => dispatch({type: 'speed', speed: 2})}>Fast</button>
        <button type="button" className="beater-off" disabled={mix.speed === 0} onClick={() => dispatch({type: 'off'})}>Off</button>
        <button type="button" onClick={retry}>↻ Try again</button>
      </div>
    </div> : null}
  </div>;
};
