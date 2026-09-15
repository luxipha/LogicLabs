import React, {Component, Suspense, useState, type ReactNode} from 'react';
import {StoryVideoCard} from '../shared/lesson-ui';
import {WarmupScreen} from '../shared/WarmupScreen';
import content from './content.json';
import {FossilActivity} from './FossilActivity';
import {TrexCoding} from './TrexCoding';
import {TrexCanvas, type TrexPartId as ModelTrexPartId} from './TrexModel';
import './trex.scoped.css';

const skeletonImage = 'assets/trex-skeleton.jpg';
const PARTS = content.parts;
type TrexPartId = (typeof PARTS)[number]['id'];

const HOTSPOTS: Record<TrexPartId, {x: number; y: number; width: number; height: number}> = {
  skull: {x: 4, y: 18, width: 26, height: 34},
  neck: {x: 28, y: 20, width: 14, height: 30},
  ribs: {x: 39, y: 21, width: 27, height: 36},
  tail: {x: 67, y: 20, width: 31, height: 25},
  leg: {x: 57, y: 43, width: 22, height: 47},
};

const isTrexPart = (part: string): part is TrexPartId => part in HOTSPOTS;

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

class TrexErrorBoundary extends Component<
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

const SkeletonBoard: React.FC<{
  mode: string;
  activePart?: string | null;
  onSelect?: (part: string) => void;
  placed?: Set<TrexPartId>;
  targetPart?: TrexPartId | null;
}> = ({mode, activePart, onSelect, placed, targetPart}) => (
  <div className={`trex-skeleton-board trex-skeleton-${mode}`}>
    <img src={skeletonImage} alt="A mounted T-Rex fossil skeleton in a museum" />
    <div className="trex-photo-shade" />
    {PARTS.map((part) => {
      const spot = HOTSPOTS[part.id];
      const isPlaced = placed?.has(part.id) ?? false;
      const isActive = activePart === part.id;
      return (
        <button
          key={part.id}
          type="button"
          className={[
            'trex-hotspot',
            isActive ? 'active' : '',
            isPlaced ? 'placed' : '',
            targetPart === part.id ? 'target' : '',
          ].filter(Boolean).join(' ')}
          style={{left: `${spot.x}%`, top: `${spot.y}%`, width: `${spot.width}%`, height: `${spot.height}%`}}
          aria-label={`${mode === 'activity' ? 'Place' : 'Select'} ${part.label}`}
          onClick={() => onSelect?.(part.id)}
          disabled={!onSelect}
        >
          <span>{isPlaced ? '✓ ' : ''}{part.label}</span>
        </button>
      );
    })}
  </div>
);

const TrexStageContent: React.FC<{
  activePart: string;
  lastSelectedPart: string | null;
  onSelect: (part: string) => void;
  mode: string;
  warmupVideoUrl: string;
  activityDone: boolean;
  completeActivity: () => void;
  resetActivity: () => void;
}> = ({activePart, lastSelectedPart, onSelect, mode, warmupVideoUrl, activityDone, completeActivity, resetActivity}) => {
  const [webGLAvailable] = useState(hasWebGLSupport);

  if (mode === 'coding') {
    return <TrexCoding />;
  }
  if (mode === 'warmup') {
    return <WarmupScreen videoUrl={warmupVideoUrl} />;
  }
  if (mode === 'story') {
    return <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl} />;
  }
  if (mode === 'identify' || mode === 'explore') {
    if (!webGLAvailable) {
      return (
        <div className={`generic-stage trex-model-stage trex-model-${mode}`}>
          <div className="trex-model-message">
            <strong>The T-Rex model needs WebGL.</strong>
            <span>Enable graphics acceleration to use the fossil model.</span>
          </div>
        </div>
      );
    }
    return (
      <div className={`generic-stage trex-model-stage trex-model-${mode}`}>
        <TrexErrorBoundary
          fallback={
            <div className="trex-model-message">
              <strong>The T-Rex model could not load.</strong>
              <span>Refresh the lesson and try again.</span>
            </div>
          }
        >
          <Suspense fallback={<div className="trex-model-message">Loading T-Rex fossil…</div>}>
            <TrexCanvas
              mode={mode}
              highlightedPart={(mode === 'identify' ? lastSelectedPart : activePart) as ModelTrexPartId | null}
              onPartSelect={onSelect}
            />
          </Suspense>
        </TrexErrorBoundary>
      </div>
    );
  }

  return (
    <div className={`generic-stage trex-stage trex-stage-${mode}`}>
      <SkeletonBoard mode={mode} />
      <div className="trex-stage-caption">
        {mode === 'quiz'
          ? 'Use the real fossil skeleton to answer each question.'
          : 'Study the fossil and tap the bone named in Your Task.'}
      </div>
    </div>
  );
};

export const TrexPartPreview: React.FC<{part: string}> = ({part}) => (
  <img
    className="trex-part-preview"
    src={`assets/trex-parts/${part}.svg`}
    alt=""
    aria-hidden="true"
  />
);

// Keep the activity mounted so changing lesson tabs preserves the dig and build.
export const TrexStage: React.FC<React.ComponentProps<typeof TrexStageContent>> = (props) => (
  <>
    <div style={{display: props.mode === 'activity' ? 'contents' : 'none'}}>
      <FossilActivity activityDone={props.activityDone} completeActivity={props.completeActivity} resetActivity={props.resetActivity} />
    </div>
    {props.mode !== 'activity' && <TrexStageContent {...props} />}
  </>
);
