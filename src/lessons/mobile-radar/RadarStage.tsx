import React, {Component, Suspense, useState, type ReactNode} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import {RadarCanvas, type RadarPartId} from './RadarTruckModel';
import lessonContent from './content.json';

const hasWebGLSupport = () => {
  if (typeof document === 'undefined') {
    return false;
  }
  const canvas = document.createElement('canvas');
  return Boolean(
    canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl'),
  );
};

class RadarErrorBoundary extends Component<{children: ReactNode; fallback: ReactNode}, {hasError: boolean}> {
  state = {hasError: false};

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export const RadarStage: React.FC<{
  activePart: string;
  lastSelectedPart: string | null;
  identified: Set<string>;
  onSelect: (part: string) => void;
  mode: string;
  activityDone: boolean;
  completeActivity: () => void;
}> = ({lastSelectedPart, onSelect, mode, activityDone, completeActivity}) => {
  const [webGLAvailable] = useState(hasWebGLSupport);
  const [spinning, setSpinning] = useState(false);
  const [found, setFound] = useState(false);

  const scan = () => {
    if (activityDone) {
      return;
    }
    setSpinning(true);
    window.setTimeout(() => {
      setSpinning(false);
      setFound(true);
      completeActivity();
    }, 1400);
  };

  // Video tabs do not need the 3D canvas or its full-stage background.
  if (mode === 'warmup') {
    return <WarmupScreen videoUrl={lessonContent.warmupVideoUrl} />;
  }

  if (mode === 'story') {
    return <StoryVideoCard title={lessonContent.title} youtubeEmbedUrl={lessonContent.storyVideoUrl} />;
  }

  if (!webGLAvailable) {
    return (
      <div className="generic-stage">
        <div className="radar-no-webgl">
          <strong>The radar truck needs WebGL.</strong>
          <span>Enable graphics acceleration in Chrome, or use Firefox.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="generic-stage radar-model-stage">
      <RadarErrorBoundary
        fallback={
          <div className="radar-no-webgl">
            <strong>The radar truck model failed to load.</strong>
            <span>Check the browser console for details.</span>
          </div>
        }
      >
        <Suspense fallback={<div className="radar-loading">Loading radar truck…</div>}>
          <RadarCanvas
            highlightedPart={mode === 'identify' ? (lastSelectedPart as RadarPartId | null) : null}
            mode={mode}
            onPartSelect={onSelect}
          />
        </Suspense>
      </RadarErrorBoundary>
      {mode === 'activity' ? (
        <div className="radar-activity radar-activity-overlay">
          <div className="radar-sweep-screen">
            <div className={`radar-sweep ${spinning ? 'spin' : ''}`} />
            {found ? <div className="radar-blip">Signal found!</div> : <div className="radar-hint">Scanning for signals…</div>}
          </div>
          {found || activityDone ? (
            <div className="bee-activity-done">Signal found! The radar works.</div>
          ) : (
            <button className="primary-action" onClick={scan}>
              {spinning ? 'Scanning...' : 'Turn on the radar'}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};

export const RadarPartPreview: React.FC<{part: string}> = ({part}) => (
  <span className="generic-part-preview" aria-hidden="true">
    {part === 'antenna' ? '📡' : null}
    {part === 'radar-dish' ? '🛰️' : null}
    {part === 'cab' ? '🚙' : null}
    {part === 'body' ? '🚛' : null}
    {part === 'wheels' ? '⚙️' : null}
  </span>
);
