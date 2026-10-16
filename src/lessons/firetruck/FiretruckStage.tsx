import React, {Component, Suspense, useEffect, useReducer, useRef, useState} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import {FiretruckCanvas} from './FiretruckModel';
import {FiretruckDiagram, FiretruckPartPreview} from './FiretruckDiagram';
import {FiretruckActivity, INITIAL_RESCUE, rescueReducer} from './FiretruckActivity';
import content from './content.json';

class ModelBoundary extends Component<{children: React.ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  render() { return this.state.failed ? <div className="firetruck-loading" role="alert">The 3D truck could not load. Enable graphics acceleration, then reload to try again. The part cards and Activity are still available.</div> : this.props.children; }
}

const STORY = [
  {part: 'cab', title: 'A team gets ready', text: 'The firefighters climb into the crew cab. Their firetruck carries the team and the equipment they need.'},
  {part: 'hose', title: 'Water has a job to do', text: 'A pump moves water through a hose. Firefighters aim the nozzle so the water goes where it is needed.'},
  {part: 'ladder', title: 'Different tools help', text: 'Wheels help the truck travel. A ladder helps firefighters reach high places. Each part has a different job.'},
];

export const FiretruckStage: React.FC<{
  mode: string; lastSelectedPart: string | null; onSelect: (part: string) => void;
  warmupVideoUrl: string; activityDone: boolean; completeActivity: () => void; resetActivity: () => void;
}> = ({mode, lastSelectedPart, onSelect, warmupVideoUrl, activityDone, completeActivity, resetActivity}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [view, setView] = useState(0);
  const [state, dispatch] = useReducer(rescueReducer, INITIAL_RESCUE);
  useEffect(() => {
    const changed = () => setFullscreen(document.fullscreenElement === ref.current);
    document.addEventListener('fullscreenchange', changed);
    return () => document.removeEventListener('fullscreenchange', changed);
  }, []);
  useEffect(() => {
    if (state.cleared.length === 3 && !state.pump && !activityDone) completeActivity();
  }, [state.cleared.length, state.pump, activityDone, completeActivity]);
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void ref.current?.requestFullscreen?.().catch(() => {});
  };
  if (mode === 'warmup' && warmupVideoUrl) return <WarmupScreen videoUrl={warmupVideoUrl} />;
  if (mode === 'story' && content.storyVideoUrl) return <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl} />;
  return <div ref={ref} className={`generic-stage firetruck-stage firetruck-stage--${mode}`}>
    {mode === 'explore' ? <>
      <div className="firetruck-stage__canvas"><ModelBoundary><Suspense fallback={<div className="firetruck-loading" role="status">Loading the firetruck…</div>}><FiretruckCanvas key={view} /></Suspense></ModelBoundary></div>
      <div className="firetruck-explore-caption"><strong>A real firetruck, in 3D</strong><span>Drag to turn · Pinch or scroll to zoom</span></div>
    </> : mode === 'identify' ? <>
      <div className="firetruck-stage__canvas"><ModelBoundary><Suspense fallback={<div className="firetruck-loading" role="status">Loading the firetruck…</div>}><FiretruckCanvas highlightedPart={lastSelectedPart} onPartSelect={onSelect} /></Suspense></ModelBoundary></div>
      <div className="firetruck-explore-caption firetruck-identify-caption"><strong>Find the parts in 3D</strong><span>Tap the truck · Drag to turn · Zoom in</span><small>Hose on the side · Ladder at the back</small></div>
    </> : mode === 'activity' ? <FiretruckActivity state={state} dispatch={(action) => {
      if (action.type === 'pump' && activityDone) resetActivity();
      dispatch(action);
    }} done={activityDone} onRetry={() => { dispatch({type: 'reset'}); resetActivity(); }} />
    : mode === 'story' ? <div className="firetruck-story"><header><span>READ TOGETHER</span><h2>The firetruck team</h2><p>Read each card. What does each part help the team do?</p></header><div className="firetruck-story__cards">{STORY.map((card, i) => <article key={card.part}><FiretruckPartPreview part={card.part} /><span>0{i+1}</span><h3>{card.title}</h3><p>{card.text}</p></article>)}</div></div>
    : mode === 'warmup' ? <div className="firetruck-intro"><span>READY, RESCUE TEAM?</span><h2>Meet the firetruck</h2><FiretruckDiagram labels={false} /><p>Pretend to turn a steering wheel. Stretch your arms like a long hose. Now open Story to meet the team!</p></div>
    : <div className="firetruck-intro"><span>MISSION CHECK</span><h2>What can a firetruck do?</h2><FiretruckDiagram /><p>Use the questions to show what you discovered.</p></div>}
    <div className="firetruck-stage__toolbar">{mode === 'explore' ? <button type="button" onClick={() => setView((value) => value + 1)}>Reset view</button> : null}<button type="button" onClick={toggleFullscreen}>{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button></div>
  </div>;
};
