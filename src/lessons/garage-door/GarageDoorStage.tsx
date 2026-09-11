import React, {Component, useEffect, useState, type ReactNode} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import {GarageDoorCanvas, type GarageDoorPartId} from './GarageDoorModel';
import lessonContent from './content.json';

const hasWebGLSupport = () => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
};

class GarageDoorErrorBoundary extends Component<{children: ReactNode; fallback: ReactNode}, {hasError: boolean}> {
  state = {hasError: false};
  static getDerivedStateFromError() { return {hasError: true}; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

export const GarageDoorStage: React.FC<{
  activePart: string;
  lastSelectedPart: string | null;
  onSelect: (part: string) => void;
  mode: string;
  warmupVideoUrl: string;
  activityDone: boolean;
  completeActivity: () => void;
}> = ({lastSelectedPart, onSelect, mode, warmupVideoUrl, activityDone, completeActivity}) => {
  const [webGLAvailable] = useState(hasWebGLSupport);
  const [open, setOpen] = useState(false);
  const [carPosition, setCarPosition] = useState(0);

  // Explore mode demonstrates the complete real-world sequence on a loop.
  useEffect(() => {
    if (mode !== 'explore') {
      setOpen(false);
      setCarPosition(0);
      return undefined;
    }
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (callback: () => void, delay: number) => timers.push(setTimeout(() => { if (!cancelled) callback(); }, delay));
    const play = () => {
      setOpen(false);
      setCarPosition(0);
      later(() => setOpen(true), 700);
      later(() => setCarPosition(1), 1900);
      later(() => setOpen(false), 5200);
      later(play, 8200);
    };
    play();
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [mode]);

  if (mode === 'warmup') return <WarmupScreen videoUrl={warmupVideoUrl} />;
  if (mode === 'story') return <StoryVideoCard title={lessonContent.title} youtubeEmbedUrl={lessonContent.storyVideoUrl} />;
  if (!webGLAvailable) return <div className="generic-stage"><div className="garage-door-no-webgl"><strong>The garage needs WebGL.</strong><span>Enable graphics acceleration to explore the door.</span></div></div>;

  return (
    <div className="generic-stage garage-door-model-stage">
      <GarageDoorErrorBoundary fallback={<div className="garage-door-no-webgl"><strong>The garage model could not load.</strong><span>Try refreshing the lesson.</span></div>}>
        <GarageDoorCanvas
          highlightedPart={mode === 'identify' ? (lastSelectedPart as GarageDoorPartId | null) : null}
          mode={mode}
          open={open}
          carPosition={carPosition}
          onPartSelect={onSelect}
        />
      </GarageDoorErrorBoundary>
      {mode === 'activity' ? (
        <div className="garage-door-activity-overlay">
          <strong>{activityDone ? 'Great parking job!' : carPosition === 0 ? 'Open the garage, then bring the car in.' : open ? 'Car is inside. Close the garage door.' : 'The car is parked safely inside.'}</strong>
          <div className="garage-door-controls">
            <button className="secondary-action" onClick={() => setOpen(true)} disabled={open}>Open door</button>
            <button className="secondary-action" onClick={() => setCarPosition(1)} disabled={!open || carPosition === 1}>Drive in</button>
            <button className="primary-action" onClick={() => { setOpen(false); if (carPosition === 1) completeActivity(); }} disabled={!open}>Close door</button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const GarageDoorPartPreview: React.FC<{part: string}> = ({part}) => (
  <span className="generic-part-preview" aria-hidden="true">
    {part === 'door' ? '▤' : null}{part === 'chain' ? '⛓' : null}{part === 'motor' ? 'MOTOR' : null}{part === 'sensor' ? '◉' : null}{part === 'track' ? '∥' : null}
  </span>
);
