import React, {Component, useEffect, useRef, useState, type ReactNode} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {SketchfabEmbed, StoryVideoCard} from '../shared/lesson-ui';
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
  resetActivity: () => void;
}> = ({lastSelectedPart, onSelect, mode, warmupVideoUrl, activityDone, completeActivity, resetActivity}) => {
  const [webGLAvailable] = useState(hasWebGLSupport);
  const [open, setOpen] = useState(false);
  const [carPosition, setCarPosition] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      stageRef.current?.requestFullscreen?.().catch(() => {});
    }
  };

  const tryAgain = () => {
    setOpen(false);
    setCarPosition(0);
    setAttempt((current) => current + 1);
    resetActivity();
  };

  if (mode === 'warmup') return <WarmupScreen videoUrl={warmupVideoUrl} />;
  if (mode === 'story') return <StoryVideoCard title={lessonContent.title} youtubeEmbedUrl={lessonContent.storyVideoUrl} />;
  if (mode === 'explore') {
    return (
      <SketchfabEmbed
        embedUrl="https://sketchfab.com/models/5a2060a34e91468e866dd12f1405eeb5/embed"
        modelName="Garage - Hangar"
        modelPageUrl="https://sketchfab.com/3d-models/garage-hangar-5a2060a34e91468e866dd12f1405eeb5"
        authorName="Elvair Lima"
        authorPageUrl="https://sketchfab.com/elvair"
        stageClass="garage-door-sketchfab-stage"
      />
    );
  }
  if (!webGLAvailable) return <div className="generic-stage"><div className="garage-door-no-webgl"><strong>The garage needs WebGL.</strong><span>Enable graphics acceleration to explore the door.</span></div></div>;

  return (
    <div className="generic-stage garage-door-model-stage" ref={stageRef}>
      <GarageDoorErrorBoundary fallback={<div className="garage-door-no-webgl"><strong>The garage model could not load.</strong><span>Try refreshing the lesson.</span></div>}>
        <GarageDoorCanvas
          key={attempt}
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
            {activityDone ? (
              <button className="primary-action" onClick={tryAgain}>↻ Try again</button>
            ) : (
              <>
                <button className="secondary-action" onClick={() => setOpen(true)} disabled={open}>Open door</button>
                <button className="secondary-action" onClick={() => setCarPosition(1)} disabled={!open || carPosition === 1}>Drive in</button>
                <button className="primary-action" onClick={() => { setOpen(false); if (carPosition === 1) completeActivity(); }} disabled={!open}>Close door</button>
              </>
            )}
            <button className="game-frame-fullscreen garage-door-fullscreen" onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              {isFullscreen ? '⛶ Exit' : '⛶ Fullscreen'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const GarageDoorPartPreview: React.FC<{part: string}> = ({part}) => (
  <span className={`generic-part-preview garage-part-preview garage-part-preview-${part}`} aria-hidden="true">
    {part === 'motor' ? <span className="garage-motor-rail" /> : null}
    {part === 'pulleys' ? <span className="garage-pulley-cable" /> : null}
    {part === 'rails' ? <span className="garage-rail-crossbar" /> : null}
  </span>
);
