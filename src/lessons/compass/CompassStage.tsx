import React, {Component, Suspense, useState, type ReactNode} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {CompassActivity} from './CompassActivity';
import {CompassCanvas, type CompassPartId} from './CompassModel';
import {CompassCoding} from './CompassCoding';

const hasWebGLSupport = () => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
};

class CompassErrorBoundary extends Component<{children: ReactNode; fallback: ReactNode}, {hasError: boolean}> {
  state = {hasError: false};
  static getDerivedStateFromError() { return {hasError: true}; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

export const CompassStage: React.FC<{mode: string; warmupVideoUrl: string; lastSelectedPart: string | null; onSelect: (part: string) => void; activityDone: boolean; completeActivity: () => void; resetActivity: () => void; activityStep: string; setActivityStep: (step: string) => void}> = ({mode, warmupVideoUrl, lastSelectedPart, onSelect, activityDone, completeActivity, resetActivity, activityStep, setActivityStep}) => {
  const [webGLAvailable] = useState(hasWebGLSupport);
  if (mode === 'warmup') return <WarmupScreen videoUrl={warmupVideoUrl} />;
  if (mode === 'coding') return <CompassCoding />;
  if (mode === 'activity') return <CompassActivity activityDone={activityDone} completeActivity={completeActivity} resetActivity={resetActivity} activityStep={activityStep} />;
  return <div className="generic-stage compass-stage" aria-label="3D compass">
    {!webGLAvailable ? <div className="compass-message"><strong>The compass needs WebGL.</strong><span>Enable graphics acceleration, then refresh the lesson.</span></div> :
      <CompassErrorBoundary fallback={<div className="compass-message"><strong>The compass model could not load.</strong><span>Try refreshing the lesson.</span></div>}>
        <Suspense fallback={<div className="compass-message">Loading compass…</div>}>
          <CompassCanvas identify={mode === 'identify'} autoplay={mode === 'explore'} highlightedPart={mode === 'identify' ? lastSelectedPart as CompassPartId | null : null} onPartSelect={onSelect} />
        </Suspense>
      </CompassErrorBoundary>}
  </div>;
};
