import React, {Component, Suspense, useState, type ReactNode} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {AdvanceCompassActivity} from './AdvanceCompassActivity';
import {AdvanceCompassCanvas, type AdvanceCompassPartId} from './AdvanceCompassModel';
import {AdvanceCompassCoding} from './AdvanceCompassCoding';

const hasWebGLSupport = () => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
};

class AdvanceCompassErrorBoundary extends Component<{children: ReactNode; fallback: ReactNode}, {hasError: boolean}> {
  state = {hasError: false};
  static getDerivedStateFromError() { return {hasError: true}; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

export const AdvanceCompassStage: React.FC<{mode: string; warmupVideoUrl: string; lastSelectedPart: string | null; onSelect: (part: string) => void; activityDone: boolean; completeActivity: () => void; resetActivity: () => void; activityStep: string; setActivityStep: (step: string) => void}> = ({mode, warmupVideoUrl, lastSelectedPart, onSelect, activityDone, completeActivity, resetActivity, activityStep, setActivityStep}) => {
  const [webGLAvailable] = useState(hasWebGLSupport);
  if (mode === 'warmup') return <WarmupScreen videoUrl={warmupVideoUrl} />;
  if (mode === 'coding') return <AdvanceCompassCoding />;
  if (mode === 'activity') return <AdvanceCompassActivity activityDone={activityDone} completeActivity={completeActivity} resetActivity={resetActivity} activityStep={activityStep} />;
  return <div className="generic-stage advance-compass-stage" aria-label="3D advance compass">
    {!webGLAvailable ? <div className="advance-compass-message"><strong>The compass needs WebGL.</strong><span>Enable graphics acceleration, then refresh the lesson.</span></div> :
      <AdvanceCompassErrorBoundary fallback={<div className="advance-compass-message"><strong>The compass model could not load.</strong><span>Try refreshing the lesson.</span></div>}>
        <Suspense fallback={<div className="advance-compass-message">Loading compass…</div>}>
          <AdvanceCompassCanvas identify={mode === 'identify'} autoplay={mode === 'explore'} highlightedPart={mode === 'identify' ? lastSelectedPart as AdvanceCompassPartId | null : null} onPartSelect={onSelect} />
        </Suspense>
      </AdvanceCompassErrorBoundary>}
  </div>;
};
