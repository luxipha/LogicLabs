import React, {Component, Suspense, useState, type ReactNode} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import {BeeCanvas, type BeePartId} from './BeeModel';
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

class BeeErrorBoundary extends Component<
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

export const BeeStage: React.FC<{
  activePart: string;
  lastSelectedPart: string | null;
  identified: Set<string>;
  onSelect: (part: string) => void;
  mode: string;
  warmupVideoUrl: string;
  activityDone: boolean;
  completeActivity: () => void;
}> = ({activePart, lastSelectedPart, onSelect, mode, warmupVideoUrl, activityDone, completeActivity}) => {
  const [webGLAvailable] = useState(hasWebGLSupport);

  // Video tabs do not need the 3D canvas.
  if (mode === 'warmup') {
    return <WarmupScreen videoUrl={warmupVideoUrl} />;
  }

  if (mode === 'story') {
    return (
      <StoryVideoCard title={lessonContent.title} youtubeEmbedUrl={lessonContent.storyVideoUrl} />
    );
  }

  if (!webGLAvailable) {
    return (
      <div className="generic-stage">
        <div className="bee-no-webgl">
          <strong>The bee needs WebGL.</strong>
          <span>Enable graphics acceleration in Chrome, or use Firefox.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="generic-stage bee-model-stage">
      <BeeErrorBoundary
        fallback={
          <div className="bee-no-webgl">
            <strong>The bee model failed to load.</strong>
            <span>Check the browser console for details.</span>
          </div>
        }
      >
        <Suspense fallback={<div className="bee-loading">Loading bee…</div>}>
          <BeeCanvas
            highlightedPart={
              mode === 'identify'
                ? (lastSelectedPart as BeePartId | null)
                : mode === 'explore'
                  ? (activePart as BeePartId | null)
                  : null
            }
            mode={mode}
            activityStep={0}
            activityDone={activityDone}
            onPartSelect={onSelect}
          />        </Suspense>
      </BeeErrorBoundary>
      {mode === 'activity' ? (
        <div className="bee-activity-controls">
          <div className="bee-activity-legend">
            <span>🌸 Flower</span>
            <span>🏠 Hive</span>
          </div>
          {activityDone ? (
            <div className="bee-activity-done">Pollen delivered! The hive is stocked.</div>
          ) : (
            <button className="primary-action" onClick={completeActivity}>
              Complete Activity
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};

export const BeePartPreview: React.FC<{part: string}> = ({part}) => (
  <span className="generic-part-preview" aria-hidden="true">
    {part === 'head' ? '🐝' : null}
    {part === 'antennae' ? '^^' : null}
    {part === 'wings' ? '🪽' : null}
    {part === 'body' ? '🟡' : null}
    {part === 'legs' ? '🦵' : null}
  </span>
);
