import React, {Component, Suspense, useEffect, useRef, useState, type ReactNode} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import {SoccerGoalkeeperCanvas, type SoccerPartId} from './SoccerGoalkeeperModel';
import content from './content.json';

const hasWebGLSupport = () => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
};

class SoccerErrorBoundary extends Component<{children: ReactNode; fallback: ReactNode}, {hasError: boolean}> {
  state = {hasError: false};
  static getDerivedStateFromError() { return {hasError: true}; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

export const SoccerStage: React.FC<{
  lastSelectedPart: string | null;
  onSelect: (part: string) => void;
  mode: string;
  warmupVideoUrl: string;
  activityDone: boolean;
  completeActivity: () => void;
  resetActivity: () => void;
}> = ({lastSelectedPart, onSelect, mode, warmupVideoUrl, activityDone, completeActivity, resetActivity}) => {
  const [webGLAvailable] = useState(hasWebGLSupport);
  const [blocking, setBlocking] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else stageRef.current?.requestFullscreen?.().catch(() => {});
  };

  const tryAgain = () => {
    setBlocking(false);
    setAttempt((value) => value + 1);
    resetActivity();
  };

  if (mode === 'warmup') return <WarmupScreen videoUrl={warmupVideoUrl} />;
  if (mode === 'story') return <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl} />;
  if (!webGLAvailable) return <div className="generic-stage"><div className="soccer-no-webgl"><strong>The goalkeeper needs WebGL.</strong><span>Enable graphics acceleration to explore the model.</span></div></div>;

  return (
    <div className="generic-stage soccer-model-stage" ref={stageRef}>
      <SoccerErrorBoundary fallback={<div className="soccer-no-webgl"><strong>The goalkeeper could not load.</strong><span>Try refreshing the lesson.</span></div>}>
        <Suspense fallback={<div className="soccer-loading">Loading the goalkeeper…</div>}>
          <SoccerGoalkeeperCanvas
            key={attempt}
            highlightedPart={mode === 'identify' ? (lastSelectedPart as SoccerPartId | null) : null}
            mode={mode}
            blocking={blocking && !activityDone}
            onPartSelect={onSelect}
            onFinish={() => { setBlocking(false); completeActivity(); }}
          />
        </Suspense>
      </SoccerErrorBoundary>
      {mode === 'activity' ? (
        <div className="soccer-activity-overlay">
          <strong>{activityDone ? 'Great save! The goalkeeper blocked the shot.' : blocking ? 'The goalkeeper is moving into position…' : 'Move the goalkeeper across the goal to block the shot.'}</strong>
          <div className="soccer-controls">
            {activityDone ? <button className="primary-action" onClick={tryAgain}>↻ Try again</button> : <button className="primary-action" onClick={() => setBlocking(true)} disabled={blocking}>{blocking ? 'Blocking…' : 'Block shot'}</button>}
            <button className="game-frame-fullscreen soccer-fullscreen" onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>{isFullscreen ? '⛶ Exit' : '⛶ Fullscreen'}</button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const SoccerPartPreview: React.FC<{part: string}> = ({part}) => (
  <span className={`generic-part-preview soccer-part-preview soccer-part-preview-${part}`} aria-hidden="true">
    {part === 'goalkeeper' ? '🧤' : part === 'goal' ? '🥅' : '⚽'}
  </span>
);
