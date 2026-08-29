import React, {Component, Suspense, useState, type ReactNode} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {GameEmbed, SketchfabEmbed, StoryVideoCard} from '../shared/lesson-ui';
import {ElevatorCanvas, type ElevatorPartId} from './ElevatorModel';
import lessonContent from './content.json';

const hasWebGLSupport = () => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
};

class ElevatorErrorBoundary extends Component<{children: ReactNode; fallback: ReactNode}, {hasError: boolean}> {
  state = {hasError: false};

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export const ElevatorStage: React.FC<{
  activePart: string;
  lastSelectedPart: string | null;
  identified: Set<string>;
  onSelect: (part: string) => void;
  mode: string;
  warmupVideoUrl: string;
  activityDone: boolean;
  completeActivity: () => void;
}> = ({activePart, lastSelectedPart, identified, onSelect, mode, warmupVideoUrl, activityDone, completeActivity}) => {
  const [webGLAvailable] = useState(hasWebGLSupport);

  if (mode === 'warmup') {
    return (
      <div className="generic-stage">
        <WarmupScreen videoUrl={warmupVideoUrl} />
      </div>
    );
  }

  if (mode === 'story') {
    return (
      <div className="generic-stage">
        <StoryVideoCard title={lessonContent.title} youtubeEmbedUrl={lessonContent.storyVideoUrl} />
      </div>
    );
  }

  if (mode === 'activity') {
    return (
      <div className="generic-stage">
        <div className="elevator-stage-placeholder">
          <span className="elevator-stage-icon">🛗</span>
          <span>Press the play button to start the game.</span>
        </div>
      </div>
    );
  }

  // Keep the existing Explore experience until the local GLB is approved.
  if (mode === 'explore') {
    return (
      <SketchfabEmbed
        embedUrl={lessonContent.sketchfabEmbedUrl}
        modelName="Freight Elevator"
        modelPageUrl="https://sketchfab.com/3d-models/freight-elevator-61ded500c8fa498d8ae7eeb2ba546df9"
      />
    );
  }

  if (!webGLAvailable) {
    return <div className="generic-stage"><div className="elevator-no-webgl"><strong>The elevator needs WebGL.</strong><span>Enable graphics acceleration to explore the model.</span></div></div>;
  }

  // Identify is the review surface for the new local GLB model.
  return (
    <div className="generic-stage elevator-model-stage">
      <ElevatorErrorBoundary fallback={<div className="elevator-no-webgl"><strong>The elevator model failed to load.</strong><span>Try refreshing the lesson.</span></div>}>
        <Suspense fallback={<div className="elevator-loading">Loading elevator…</div>}>
          <ElevatorCanvas
            highlightedPart={(mode === 'identify' ? lastSelectedPart : activePart) as ElevatorPartId | null}
            mode={mode}
            onPartSelect={onSelect}
          />
        </Suspense>
      </ElevatorErrorBoundary>
    </div>
  );
};

export const ElevatorPartPreview: React.FC<{part: string}> = ({part}) => (
  <span className="generic-part-preview" aria-hidden="true">
    {part === 'cab' ? '🛗' : null}
    {part === 'doors' ? '🚪' : null}
    {part === 'cable' ? '〰️' : null}
    {part === 'pulley' ? '⚙️' : null}
    {part === 'motor' ? 'MOTOR' : null}
    {part === 'counterweight' ? 'WEIGHT' : null}
  </span>
);
