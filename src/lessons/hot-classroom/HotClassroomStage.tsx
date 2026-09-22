import React, {Component, Suspense, useState, type ReactNode} from 'react';
import {HotClassroomFanCanvas, HotClassroomIdentifyCanvas, type FanPartId} from './HotClassroomModel';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import {HotClassroomActivity} from './HotClassroomActivity';
import content from './content.json';

const hasWebGLSupport = () => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
};

class HotClassroomErrorBoundary extends Component<{children: ReactNode; fallback: ReactNode}, {hasError: boolean}> {
  state = {hasError: false};

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

const SetupCard: React.FC<{mode: string}> = ({mode}) => (
  <div className="hot-classroom-stage__card">
    <span>{mode.toUpperCase()}</span>
    <strong>Ready for lesson content</strong>
    <p>This shared classroom space is ready for its warmup, story, activities, and questions.</p>
  </div>
);

export const HotClassroomStage: React.FC<{
  mode: string;
  warmupVideoUrl: string;
  activePart: string;
  lastSelectedPart: string | null;
  onSelect: (part: string) => void;
  activityDone: boolean;
  completeActivity: () => void;
  resetActivity: () => void;
}> = ({mode, warmupVideoUrl, activePart, lastSelectedPart, onSelect, activityDone, completeActivity, resetActivity}) => {
  const [webGLAvailable] = useState(hasWebGLSupport);
  const isModelMode = mode === 'identify' || mode === 'explore';

  if (mode === 'warmup') return <WarmupScreen videoUrl={warmupVideoUrl} />;
  if (mode === 'story') return <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl} />;
  if (mode === 'activity') {
    return <HotClassroomActivity activityDone={activityDone} completeActivity={completeActivity} resetActivity={resetActivity} />;
  }

  return (
    <div className="generic-stage hot-classroom-stage" aria-label="The Hot Classroom lesson setup">
      {!isModelMode ? <SetupCard mode={mode} /> : !webGLAvailable ? (
        <div className="hot-classroom-stage__fallback">
          <strong>The electric fan needs WebGL.</strong>
          <span>Enable graphics acceleration, then refresh the lesson.</span>
        </div>
      ) : (
        <div className="hot-classroom-stage__model" aria-label="Electric fan model">
          <HotClassroomErrorBoundary
            fallback={
              <div className="hot-classroom-stage__fallback">
                <strong>The electric fan model could not load.</strong>
                <span>Try refreshing the lesson.</span>
              </div>
            }
          >
            <Suspense fallback={<div className="hot-classroom-stage__loading">Loading electric fan…</div>}>
              {mode === 'identify' ? (
                <HotClassroomIdentifyCanvas
                  highlightedPart={lastSelectedPart as FanPartId | null}
                  onPartSelect={onSelect}
                />
              ) : <HotClassroomFanCanvas />}
            </Suspense>
          </HotClassroomErrorBoundary>
        </div>
      )}
    </div>
  );
};
