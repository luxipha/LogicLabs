import React, {Component, Suspense, useState, type ReactNode} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import {GolfCanvas, type GolfPartId} from './GolfModel';
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

class GolfErrorBoundary extends Component<
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

export const GolfStage: React.FC<{
  activePart: string;
  identified: Set<string>;
  onSelect: (part: string) => void;
  mode: string;
  warmupVideoUrl: string;
  activityDone: boolean;
  completeActivity: () => void;
}> = ({activePart, identified, onSelect, mode, warmupVideoUrl, activityDone, completeActivity}) => {
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

  // Explore uses the 3D course: rotate the model and tap a part to read about it.
  if (mode === 'explore') {
    if (!webGLAvailable) {
      return (
        <div className="generic-stage">
          <div className="golf-no-webgl">
            <strong>The golfer needs WebGL.</strong>
            <span>Enable graphics acceleration in Chrome, or use Firefox.</span>
          </div>
        </div>
      );
    }
    return (
      <div className="generic-stage golf-model-stage">
        <GolfErrorBoundary
          fallback={
            <div className="golf-no-webgl">
              <strong>The golfer model failed to load.</strong>
              <span>Check the browser console for details.</span>
            </div>
          }
        >
          <Suspense fallback={<div className="golf-loading">Loading golfer…</div>}>
            <GolfCanvas
              highlightedPart={activePart as GolfPartId | null}
              onPartSelect={onSelect}
            />
          </Suspense>
        </GolfErrorBoundary>
      </div>
    );
  }

  if (mode === 'activity') {
    return (
      <div className="generic-stage">
        <div className="golf-game-embed">
          <iframe
            title="Golf Bit"
            src="https://cloud.onlinegames.io/games/2026/construct/328/golf-bit/index.html"
            allow="fullscreen; autoplay; gamepad"
            allowFullScreen
          />
          <div className="golf-game-bar">
            {activityDone ? (
              <div className="bee-activity-done">Nice round! You played the course.</div>
            ) : (
              <button className="primary-action" onClick={completeActivity}>
                Done playing
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Identify tab — 3D golf club iron from Sketchfab.
  return (
    <div className="generic-stage golf-identify-stage">
      <div className="sketchfab-embed-wrapper">
        <iframe
          title="Golf club Iron"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen; xr-spatial-tracking; web-share"
          src="https://sketchfab.com/models/dc748ddd268c4acab25c54c4048b3912/embed"
        />
        <p>
          <a
            href="https://sketchfab.com/3d-models/golf-club-iron-dc748ddd268c4acab25c54c4048b3912"
            target="_blank"
            rel="nofollow"
          >
            Golf club Iron
          </a>{' '}
          by{' '}
          <a href="https://sketchfab.com/real_slimshady" target="_blank" rel="nofollow">
            ℜ𝔢𝔞𝔩 𝔖𝔩𝔦𝔪 𝔖𝔥𝔞𝔡𝔶
          </a>{' '}
          on{' '}
          <a href="https://sketchfab.com" target="_blank" rel="nofollow">
            Sketchfab
          </a>
        </p>
      </div>
    </div>
  );
};

export const GolfPartPreview: React.FC<{part: string}> = ({part}) => (
  <span className="generic-part-preview" aria-hidden="true">
    {part === 'hat' ? '🧢' : null}
    {part === 'head' ? '😀' : null}
    {part === 'body' ? '👕' : null}
    {part === 'arms' ? '💪' : null}
    {part === 'club' ? '🏌️' : null}
  </span>
);
