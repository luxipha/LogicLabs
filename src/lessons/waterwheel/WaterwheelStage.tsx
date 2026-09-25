import React, {Component, Suspense, useState, type ReactNode} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import {WaterwheelActivity} from './WaterwheelActivity';
import {
  WaterwheelExploreCanvas,
  WaterwheelIdentifyCanvas,
  type WaterwheelPartId,
} from './WaterwheelModel';
import content from './content.json';

const hasWebGLSupport = () => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
};

class WaterwheelErrorBoundary extends Component<{children: ReactNode; fallback: ReactNode}, {hasError: boolean}> {
  state = {hasError: false};

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

const SetupCard: React.FC<{headline: string; body: string}> = ({headline, body}) => (
  <div className="generic-stage waterwheel-stage">
    <div className="waterwheel-stage__card">
      <span>CONTENT COMING SOON</span>
      <strong>{headline}</strong>
      <p>{body}</p>
    </div>
  </div>
);

export const WaterwheelStage: React.FC<{
  mode: string;
  warmupVideoUrl: string;
  lastSelectedPart: string | null;
  onSelect: (part: string) => void;
  activityDone: boolean;
  completeActivity: () => void;
  resetActivity: () => void;
}> = ({mode, warmupVideoUrl, lastSelectedPart, onSelect, activityDone, completeActivity, resetActivity}) => {
  const [webGLAvailable] = useState(hasWebGLSupport);

  if (mode === 'warmup') return <WarmupScreen videoUrl={warmupVideoUrl} />;
  if (mode === 'story') {
    return content.storyVideoUrl ? (
      <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl} />
    ) : (
      <SetupCard headline="The story is not ready yet." body="Add a storyVideoUrl to this lesson's content.json." />
    );
  }
  if (mode === 'activity') {
    return (
      <WaterwheelActivity activityDone={activityDone} completeActivity={completeActivity} resetActivity={resetActivity} />
    );
  }

  return (
    <div className="generic-stage waterwheel-stage" aria-label="The waterwheel model">
      {!webGLAvailable ? (
        <div className="waterwheel-stage__fallback">
          <strong>The waterwheel needs WebGL.</strong>
          <span>Enable graphics acceleration, then refresh the lesson.</span>
        </div>
      ) : (
        <div className="waterwheel-stage__model">
          <WaterwheelErrorBoundary
            fallback={
              <div className="waterwheel-stage__fallback">
                <strong>The waterwheel model could not load.</strong>
                <span>Try refreshing the lesson.</span>
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="waterwheel-stage__loading" role="status" aria-live="polite">
                  Loading waterwheel…
                </div>
              }
            >
              {mode === 'identify' ? (
                <WaterwheelIdentifyCanvas
                  highlightedPart={lastSelectedPart as WaterwheelPartId | null}
                  onPartSelect={onSelect}
                />
              ) : (
                <WaterwheelExploreCanvas />
              )}
            </Suspense>
          </WaterwheelErrorBoundary>
        </div>
      )}
    </div>
  );
};
