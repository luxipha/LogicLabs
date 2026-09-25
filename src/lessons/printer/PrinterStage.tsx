import React, {Component, Suspense, useEffect, useRef, useState, type ReactNode} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {PrinterActivity} from './PrinterActivity';
import {PrinterCanvas, type PrinterPartId} from './PrinterModel';

const hasWebGLSupport = () => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
};

class PrinterErrorBoundary extends Component<{children: ReactNode; fallback: ReactNode}, {hasError: boolean}> {
  state = {hasError: false};
  static getDerivedStateFromError() { return {hasError: true}; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

const PrinterStory: React.FC = () => (
  <div className="printer-story" aria-label="How a printer makes a page">
    <div className="printer-story__intro">
      <span>HOW PRINTING WORKS</span>
      <strong>A picture travels from the printer to the page.</strong>
    </div>
    <div className="printer-story__steps">
      {[
        ['1', 'Load paper', 'The paper tray holds a blank sheet.'],
        ['2', 'Pull it through', 'Rollers move the sheet inside the printer.'],
        ['3', 'Add the picture', 'The printer places colored ink on the page.'],
        ['4', 'Collect the page', 'The output tray catches the finished print.'],
      ].map(([number, title, body]) => (
        <article key={number}>
          <span>{number}</span>
          <strong>{title}</strong>
          <p>{body}</p>
        </article>
      ))}
    </div>
  </div>
);

export const PrinterStage: React.FC<{
  mode: string;
  warmupVideoUrl: string;
  lastSelectedPart: string | null;
  onSelect: (part: string) => void;
  activityDone: boolean;
  completeActivity: () => void;
  resetActivity: () => void;
}> = ({mode, warmupVideoUrl, lastSelectedPart, onSelect, activityDone, completeActivity, resetActivity}) => {
  const [webGLAvailable] = useState(hasWebGLSupport);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  if (mode === 'warmup') return <WarmupScreen videoUrl={warmupVideoUrl} />;
  if (mode === 'story') return <PrinterStory />;
  if (mode === 'activity') return <PrinterActivity activityDone={activityDone} completeActivity={completeActivity} resetActivity={resetActivity} />;

  const identify = mode === 'identify';
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else stageRef.current?.requestFullscreen?.().catch(() => {});
  };

  return (
    <div className="generic-stage printer-stage" ref={stageRef} aria-label="Desktop printer model">
      {!webGLAvailable ? (
        <div className="printer-stage__message"><strong>The printer needs WebGL.</strong><span>Enable graphics acceleration, then refresh.</span></div>
      ) : (
        <PrinterErrorBoundary fallback={<div className="printer-stage__message"><strong>The printer could not load.</strong><span>Try refreshing the lesson.</span></div>}>
          <Suspense fallback={<div className="printer-stage__loading">Loading printer…</div>}>
            <PrinterCanvas
              mode={identify ? 'identify' : 'explore'}
              highlightedPart={lastSelectedPart as PrinterPartId | null}
              onPartSelect={onSelect}
            />
          </Suspense>
        </PrinterErrorBoundary>
      )}
      <button className="printer-fullscreen" type="button" onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
        {isFullscreen ? '⛶ Exit' : '⛶ Fullscreen'}
      </button>
    </div>
  );
};

export const PrinterPartPreview: React.FC<{part: string}> = ({part}) => (
  <span className={`printer-part-preview printer-part-preview--${part}`} aria-hidden="true"><span /></span>
);
