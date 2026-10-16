import React, { Component, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { WarmupScreen } from '../shared/WarmupScreen';
import { StoryVideoCard } from '../shared/lesson-ui';
import { SnailCanvas } from './SnailModel';
import content from './content.json';
import {SnailPuzzle, SNAIL_PUZZLE_START, isSnailPuzzleSolved} from './SnailPuzzle';
class SnailBoundary extends Component<{
    children: React.ReactNode;
    onFailure: () => void;
}, {
    failed: boolean;
}> {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    componentDidCatch() { this.props.onFailure(); }
    render() { return this.state.failed ? <div className="snail-message" role="alert">The snail could not load. Enable graphics acceleration, then reload this lesson.</div> : this.props.children; }
}
export const SnailStage: React.FC<{
    mode: string;
    activityStep: string;
    lastSelectedPart: string | null;
    onSelect: (part: string) => void;
    warmupVideoUrl: string;
    activityDone: boolean;
    completeActivity: () => void;
    resetActivity: () => void;
}> = ({ mode, activityStep, lastSelectedPart, onSelect, warmupVideoUrl, activityDone, completeActivity, resetActivity }) => {
    const [tiles, setTiles] = useState(SNAIL_PUZZLE_START);
    const puzzleSolved = isSnailPuzzleSolved(tiles);
    const pictureActive = mode === 'activity' && activityStep === 'snail-picture';
    const ref = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false), [playing, setPlaying] = useState(false), [viewToken, setViewToken] = useState(0), [resetToken, setResetToken] = useState(0), [step, setStep] = useState(0), [path, setPath] = useState<'damp' | 'dry' | null>(null), [moving, setMoving] = useState(false), [moveToken, setMoveToken] = useState(0), [resting, setResting] = useState(false), [fullscreen, setFullscreen] = useState(false);
    const modelReady = useCallback(() => setReady(true), []), modelFailed = useCallback(() => setReady(false), []), settled = useCallback(() => setMoving(false), []);
    useEffect(() => { if (mode !== 'explore')
        setPlaying(false); setMoving(false); }, [mode, pictureActive]);
    useEffect(() => { const changed = () => setFullscreen(Boolean(ref.current && document.fullscreenElement === ref.current)); document.addEventListener('fullscreenchange', changed); return () => document.removeEventListener('fullscreenchange', changed); }, []);
    useEffect(() => { if (mode === 'activity' && resting && puzzleSolved && !activityDone)
        completeActivity(); }, [resting, puzzleSolved, mode, activityDone, completeActivity]);
    const reset = () => { setStep(0); setPath(null); setMoving(false); setResting(false); setMoveToken(0); setResetToken(v => v + 1); resetActivity(); };
    const back = () => { setResting(false); setStep(v => Math.max(0, v - 1)); setMoveToken(v => v + 1); setMoving(true); resetActivity(); };
    const toggleFullscreen = () => { if (document.fullscreenElement)
        void document.exitFullscreen().catch(() => { });
    else
        void ref.current?.requestFullscreen?.().catch(() => { }); };
    if (mode === 'warmup')
        return <WarmupScreen videoUrl={warmupVideoUrl}/>;
    if (mode === 'story')
        return <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl}/>;
    if (pictureActive) return <SnailPuzzle tiles={tiles} crawlDone={resting} onChange={next => {setTiles(next); resetActivity();}} onRestart={() => {setTiles([...SNAIL_PUZZLE_START]); resetActivity();}}/>;
    const message = resting ? (puzzleSolved ? 'Both activities complete! Well done.' : 'Five steps! The snail is resting. Try Activity 2: Snail puzzle.') : moving ? 'Watch the snail glide.' : path === 'dry' ? 'That path is hot and dry. Try the damp garden path.' : path !== 'damp' ? 'Choose a path for our garden snail.' : step === 5 ? 'Five steps! Choose Rest by the leaf.' : `Crawl to the leaf. Count: ${step} of 5.`;
    return <div ref={ref} className={`generic-stage snail-stage snail-stage--${mode}`}>
  <div className="snail-canvas"><SnailBoundary onFailure={modelFailed}><Suspense fallback={<div className="snail-message" role="status">Loading the snail…</div>}><SnailCanvas mode={mode} playing={mode === 'explore' && playing} step={step} moveToken={moveToken} resetToken={resetToken} selected={lastSelectedPart} onSelect={onSelect} onReady={modelReady} onSettled={settled} viewToken={viewToken}/></Suspense></SnailBoundary></div>
  <div className="snail-caption"><strong>{mode === 'identify' ? 'Find three snail parts' : mode === 'activity' ? 'A garden journey' : 'Meet the snail'}</strong><span>{mode === 'identify' ? 'Tap a part or a green marker' : 'Drag to turn · Scroll or pinch to zoom'}</span></div>
  <div className="snail-toolbar"><button type="button" onClick={() => setViewToken(v => v + 1)}>Reset view</button><button type="button" onClick={toggleFullscreen}>{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button></div>
  {mode === 'explore' ? <div className="snail-explore"><button type="button" disabled={!ready} aria-pressed={playing} onClick={() => setPlaying(v => !v)}>{playing ? 'Pause movement' : 'Play movement'}</button><span>Watch the snail move.</span></div> : null}
  {mode === 'activity' ? <div className="snail-activity-panel"><strong role="status" aria-live="polite">{ready ? message : 'Loading the 3D snail…'}</strong><div className="snail-paths"><button type="button" disabled={!ready || step > 0} aria-pressed={path === 'damp'} onClick={() => setPath('damp')}>💧 Damp path</button><button type="button" disabled={!ready || step > 0} aria-pressed={path === 'dry'} onClick={() => setPath('dry')}>☀ Dry path</button></div><label className="snail-progress">Steps: {step} / 5<progress value={step} max={5} aria-label="Crawl steps"/></label><div className="snail-actions"><button type="button" disabled={!ready || path !== 'damp' || moving || step === 5 || resting} onClick={() => { setStep(v => v + 1); setMoveToken(v => v + 1); setMoving(true); }}>Crawl →</button><button type="button" disabled={!ready || step !== 5 || moving || resting} onClick={() => setResting(true)}>Rest</button><button type="button" disabled={!ready || step === 0 || moving} onClick={back}>← Back one step</button><button type="button" onClick={reset}>↻ Try again</button></div></div> : null}
 </div>;
};
