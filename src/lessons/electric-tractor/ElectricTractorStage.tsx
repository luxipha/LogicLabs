import React, {Component, Suspense, useEffect, useRef, useState, type ReactNode} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import {ElectricTractorCanvas, type ElectricTractorPartId} from './ElectricTractorModel';
import content from './content.json';

const hasWebGLSupport = () => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
};

class ElectricTractorErrorBoundary extends Component<{children: ReactNode; fallback: ReactNode}, {hasError: boolean}> {
  state = {hasError: false};
  static getDerivedStateFromError() { return {hasError: true}; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

export const ElectricTractorStage: React.FC<{
  lastSelectedPart: string | null;
  onSelect: (part: string) => void;
  mode: string;
  warmupVideoUrl: string;
  activityDone: boolean;
  completeActivity: () => void;
  resetActivity: () => void;
}> = ({lastSelectedPart, onSelect, mode, warmupVideoUrl, activityDone, completeActivity, resetActivity}) => {
  const [webGLAvailable] = useState(hasWebGLSupport);
  const [driving, setDriving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    setDriving(false);
    setAttempt((current) => current + 1);
    resetActivity();
  };

  if (mode === 'warmup') return <WarmupScreen videoUrl={warmupVideoUrl} />;
  if (mode === 'story') return <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl} />;
  if (!webGLAvailable) return <div className="generic-stage"><div className="electric-tractor-no-webgl"><strong>The tractor needs WebGL.</strong><span>Enable graphics acceleration to explore it.</span></div></div>;

  return (
    <div className="generic-stage electric-tractor-model-stage" ref={stageRef}>
      <ElectricTractorErrorBoundary fallback={<div className="electric-tractor-no-webgl"><strong>The tractor model could not load.</strong><span>Try refreshing the lesson.</span></div>}>
        <Suspense fallback={<div className="electric-tractor-loading">Loading the electric tractor…</div>}>
          <ElectricTractorCanvas
            key={attempt}
            highlightedPart={mode === 'identify' ? (lastSelectedPart as ElectricTractorPartId | null) : null}
            mode={mode}
            driving={driving && !activityDone}
            onPartSelect={onSelect}
            onFinish={() => {
              setDriving(false);
              completeActivity();
            }}
          />
        </Suspense>
      </ElectricTractorErrorBoundary>
      {mode === 'activity' ? (
        <div className="electric-tractor-activity-overlay">
          <strong>{activityDone ? 'The vegetables made it to the field!' : driving ? 'The tractor is pulling the trailer…' : 'Drive the tractor and pull the trailer across the field.'}</strong>
          <div className="electric-tractor-controls">
            {activityDone ? <button className="primary-action" onClick={tryAgain}>↻ Try again</button> : <button className="primary-action" onClick={() => setDriving(true)} disabled={driving}>{driving ? 'Driving…' : 'Drive tractor'}</button>}
            <button className="game-frame-fullscreen electric-tractor-fullscreen" onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>{isFullscreen ? '⛶ Exit' : '⛶ Fullscreen'}</button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const ElectricTractorPartPreview: React.FC<{part: string}> = ({part}) => (
  <span className={`generic-part-preview electric-tractor-part-preview electric-tractor-part-preview-${part}`} aria-hidden="true">
    {part === 'cab' ? '▣' : part === 'wheels' ? '◉' : part === 'hitch' ? '↔' : '▰'}
  </span>
);
