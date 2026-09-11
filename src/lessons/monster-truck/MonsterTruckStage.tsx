import React, {Component, Suspense, useState, type ReactNode} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import {MonsterTruckCanvas, type MonsterTruckPartId} from './MonsterTruckModel';
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

class MonsterTruckErrorBoundary extends Component<
  {children: ReactNode; fallback: ReactNode},
  {hasError: boolean}
> {
  state = {hasError: false};

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export const MonsterTruckStage: React.FC<{
  activePart: string;
  lastSelectedPart: string | null;
  identified: Set<string>;
  onSelect: (part: string) => void;
  mode: string;
  warmupVideoUrl: string;
  activityDone: boolean;
  completeActivity: () => void;
}> = ({lastSelectedPart, onSelect, mode, warmupVideoUrl, activityDone, completeActivity}) => {
  const [webGLAvailable] = useState(hasWebGLSupport);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  // Video tabs do not need the 3D canvas or its full-stage background.
  if (mode === 'warmup') {
    return <WarmupScreen videoUrl={warmupVideoUrl} />;
  }

  if (mode === 'story') {
    return <StoryVideoCard title={lessonContent.title} youtubeEmbedUrl={lessonContent.storyVideoUrl} />;
  }

  if (!webGLAvailable) {
    return (
      <div className="generic-stage">
        <div className="monster-truck-no-webgl">
          <strong>The monster truck needs WebGL.</strong>
          <span>Enable graphics acceleration in Chrome, or use Firefox.</span>
        </div>
      </div>
    );
  }

  const done = finished || activityDone;

  return (
    <div className="generic-stage monster-truck-model-stage">
      <MonsterTruckErrorBoundary
        fallback={
          <div className="monster-truck-no-webgl">
            <strong>The monster truck model failed to load.</strong>
            <span>Check the browser console for details.</span>
          </div>
        }
      >
        <Suspense fallback={<div className="monster-truck-loading">Loading monster truck…</div>}>
          <MonsterTruckCanvas
            highlightedPart={mode === 'identify' ? (lastSelectedPart as MonsterTruckPartId | null) : null}
            mode={mode}
            activityRunning={running && !finished}
            activityFinished={finished}
            onPartSelect={onSelect}
            onFinish={() => {
              if (!finished) {
                setFinished(true);
                setRunning(false);
                completeActivity();
              }
            }}
          />
        </Suspense>
      </MonsterTruckErrorBoundary>
      {mode === 'activity' ? (
        <div className="monster-truck-activity monster-truck-activity-overlay">
          <div className="monster-truck-hint">
            {done ? 'Challenge complete!' : running ? 'Bouncing over the rough road…' : 'Ready to roll'}
          </div>
          {done ? (
            <div className="bee-activity-done">You made it over the rough road!</div>
          ) : (
            <button className="primary-action" onClick={() => setRunning(true)} disabled={running}>
              {running ? 'Driving...' : 'Start the challenge'}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};

export const MonsterTruckPartPreview: React.FC<{part: string}> = ({part}) => (
  <span className="generic-part-preview" aria-hidden="true">
    {part === 'body' ? '🚚' : null}
    {part === 'engine' ? '⚙️' : null}
    {part === 'tires' ? '🛞' : null}
    {part === 'roll-cage' ? '🏗️' : null}
    {part === 'shocks' ? '🌀' : null}
  </span>
);
