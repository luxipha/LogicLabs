import React, {Component, Suspense, useEffect, useRef, useState, type ReactNode} from 'react';
import {StoryVideoCard} from '../shared/lesson-ui';
import {WarmupScreen} from '../shared/WarmupScreen';
import {AlligatorActivity} from './AlligatorActivity';
import {
  AlligatorCanvas,
  type AlligatorPartId,
} from './AlligatorModel';
import content from './content.json';

const hasWebGLSupport = () => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
};

class AlligatorErrorBoundary extends Component<{children: ReactNode; fallback: ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export const AlligatorStage: React.FC<{
  mode: string;
  warmupVideoUrl: string;
  activePart: string;
  lastSelectedPart: string | null;
  identified: Set<string>;
  onSelect: (part: string) => void;
  activityDone: boolean;
  completeActivity: () => void;
  resetActivity: () => void;
  activityStep: string;
  setActivityStep: (step: string) => void;
}> = ({mode, warmupVideoUrl, activePart, lastSelectedPart, identified, onSelect, activityDone, completeActivity, resetActivity, activityStep, setActivityStep}) => {
  const [webGLAvailable] = useState(hasWebGLSupport);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  if (mode === 'warmup') return <WarmupScreen videoUrl={warmupVideoUrl} />;
  if (mode === 'story') {
    return <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl} />;
  }

  const fallback = (
    <div className="alligator-stage__message">
      <strong>The alligator could not load.</strong>
      <span>Try refreshing the lesson.</span>
    </div>
  );

  if (!webGLAvailable) {
    return <div className="generic-stage alligator-stage">{fallback}</div>;
  }

  if (mode === 'activity') {
    return (
      <AlligatorErrorBoundary fallback={fallback}>
        <Suspense fallback={<div className="alligator-stage__loading">Loading alligator…</div>}>
          <AlligatorActivity
            activityDone={activityDone}
            completeActivity={completeActivity}
            resetActivity={resetActivity}
            activityStep={activityStep}
            setActivityStep={setActivityStep}
          />
        </Suspense>
      </AlligatorErrorBoundary>
    );
  }

  const identify = mode === 'identify';
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else stageRef.current?.requestFullscreen?.().catch(() => {});
  };

  return (
    <div className="generic-stage alligator-stage" ref={stageRef} aria-label="Animated alligator model">
      <AlligatorErrorBoundary fallback={fallback}>
        <Suspense fallback={<div className="alligator-stage__loading">Loading alligator…</div>}>
          <AlligatorCanvas
            mode={identify ? 'identify' : 'explore'}
            animation={null}
            highlightedPart={(lastSelectedPart ?? activePart) as AlligatorPartId}
            identified={identified}
            onPartSelect={onSelect as (part: AlligatorPartId) => void}
          />
        </Suspense>
      </AlligatorErrorBoundary>

      <button type="button" className="alligator-fullscreen" onClick={toggleFullscreen}>
        {isFullscreen ? '⛶ Exit' : '⛶ Fullscreen'}
      </button>
    </div>
  );
};

export const AlligatorPartPreview: React.FC<{part: string}> = ({part}) => (
  <span className={`alligator-part-preview alligator-part-preview--${part}`} aria-hidden="true">
    {part === 'body' ? '▰' : part === 'head' ? '🐊' : part === 'teeth' ? '△△' : part === 'legs' ? '🐾' : '〰'}
  </span>
);
