import React, {Component, useEffect, useRef, useState, type ReactNode} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import {ClockCanvas, type ClockPartId} from './ClockModel';
import {ClockTemperatureActivity} from './ClockTemperatureActivity';
import {ClockReadActivity} from './ClockReadActivity';
import content from './content.json';

const hasWebGL = () => typeof document !== 'undefined' && Boolean(document.createElement('canvas').getContext('webgl2'));

class ClockErrorBoundary extends Component<{children: ReactNode; fallback: ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export const ClockStage: React.FC<{
  mode: string;
  activePart: string;
  lastSelectedPart: string | null;
  onSelect: (part: string) => void;
  warmupVideoUrl: string;
  activityDone: boolean;
  completeActivity: () => void;
  resetActivity: () => void;
  activityStep: string;
}> = ({mode, activePart, lastSelectedPart, onSelect, warmupVideoUrl, activityDone, completeActivity, resetActivity, activityStep}) => {
  const [answer, setAnswer] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const ready = hasWebGL();

  useEffect(() => {
    const listener = () => setFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener('fullscreenchange', listener);
    return () => document.removeEventListener('fullscreenchange', listener);
  }, []);

  if (mode === 'warmup') return <WarmupScreen videoUrl={warmupVideoUrl} />;
  if (mode === 'story') return <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl} />;
  if (mode === 'activity' && activityStep === 'puzzle') return <ClockReadActivity onComplete={completeActivity} completed={activityDone} onReset={resetActivity} />;
  if (mode === 'activity' && activityStep === 'temperature') return <ClockTemperatureActivity />;
  if (!ready) return <div className="generic-stage"><div className="clock-no-webgl"><strong>The clock needs WebGL.</strong><span>Enable graphics acceleration to explore it.</span></div></div>;

  const tryAgain = () => { setAnswer(null); setAttempt((value) => value + 1); resetActivity(); };
  const choose = (value: string) => { setAnswer(value); if (value === '10:10') completeActivity(); };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else stageRef.current?.requestFullscreen?.().catch(() => {});
  };

  return (
    <div className="generic-stage clock-model-stage" ref={stageRef}>
      <ClockErrorBoundary fallback={<div className="clock-no-webgl"><strong>The clock model could not load.</strong><span>Try refreshing the lesson.</span></div>}>
        <ClockCanvas key={attempt} mode={mode} highlightedPart={(mode === 'identify' ? lastSelectedPart : mode === 'explore' ? activePart : null) as ClockPartId | null} onPartSelect={onSelect as (part: ClockPartId) => void} />
      </ClockErrorBoundary>
      {mode === 'activity' ? (
        <div className="clock-activity-overlay">
          <strong>{activityDone ? 'You read the clock!' : 'What time is shown on the clock?'}</strong>
          <div className="clock-controls">
            {activityDone ? <button type="button" className="primary-action" onClick={tryAgain}>↻ Try again</button> : ['10:10', '12:00', '3:30'].map((value) => <button type="button" key={value} className="secondary-action" onClick={() => choose(value)}>{value}</button>)}
            <button type="button" className="game-frame-fullscreen clock-fullscreen" onClick={toggleFullscreen}>{fullscreen ? '⛶ Exit' : '⛶ Fullscreen'}</button>
          </div>
          {answer && answer !== '10:10' ? <span className="clock-try-again">Look at the digital display and try again.</span> : null}
        </div>
      ) : null}
    </div>
  );
};

export const ClockPartPreview: React.FC<{part: string}> = ({part}) => <span className={`generic-part-preview clock-part-preview-${part}`} aria-hidden="true">{part === 'display' ? '▣' : part === 'buttons' ? '●' : part === 'stand' ? '⌞' : '■'}</span>;
