import React, {Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import {SeesawCanvas, type SeesawPartId} from './SeesawModel';
import {SeesawBalanceCanvas, type SeesawBlockWeight} from './SeesawBalanceModel';
import content from './content.json';

const FLOOR_BLOCKS: Array<{id: string; weight: SeesawBlockWeight}> = [
  {id: 'block-5a', weight: 5}, {id: 'block-10a', weight: 10}, {id: 'block-20a', weight: 20},
  {id: 'block-5b', weight: 5}, {id: 'block-10b', weight: 10}, {id: 'block-20b', weight: 20},
  {id: 'block-5c', weight: 5}, {id: 'block-10c', weight: 10}, {id: 'block-20c', weight: 20},
];
type BlockLocation = 'floor' | 'left' | 'right';
const freshBlockLocations = () => Object.fromEntries(FLOOR_BLOCKS.map(({id}) => [id, 'floor' as BlockLocation]));
const totalWeight = (blocks: SeesawBlockWeight[]) => blocks.reduce((total, weight) => total + weight, 0);
const describeBlocks = (blocks: SeesawBlockWeight[]) => blocks.length ? blocks.map((weight) => `${weight} kg`).join(' + ') : 'no blocks';

const hasWebGLSupport = () => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
};

class SeesawErrorBoundary extends Component<{children: ReactNode; fallback: ReactNode}, {hasError: boolean}> {
  state = {hasError: false};
  static getDerivedStateFromError() { return {hasError: true}; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

export const SeesawStage: React.FC<{
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
  const [blockLocations, setBlockLocations] = useState<Record<string, BlockLocation>>(freshBlockLocations);
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [dragPoint, setDragPoint] = useState<{x: number; y: number} | null>(null);
  const [animating, setAnimating] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else stageRef.current?.requestFullscreen?.().catch(() => {});
  };
  const tryAgain = () => {
    setBlockLocations(freshBlockLocations());
    setDraggingBlockId(null);
    setDragPoint(null);
    setAnimating(false);
    setAttempt((value) => value + 1);
    resetActivity();
  };
  const settle = () => {
    setAnimating(false);
    if (leftBlocks.length + rightBlocks.length >= 3 && totalWeight(leftBlocks) === totalWeight(rightBlocks)) completeActivity();
  };
  const leftBlocks = useMemo(() => FLOOR_BLOCKS.filter(({id}) => blockLocations[id] === 'left').map(({weight}) => weight), [blockLocations]);
  const rightBlocks = useMemo(() => FLOOR_BLOCKS.filter(({id}) => blockLocations[id] === 'right').map(({weight}) => weight), [blockLocations]);
  const floorBlocks = useMemo(() => FLOOR_BLOCKS.filter(({id}) => blockLocations[id] === 'floor'), [blockLocations]);
  const leftWeight = totalWeight(leftBlocks);
  const rightWeight = totalWeight(rightBlocks);
  const positionGhost = (clientX: number, clientY: number) => {
    const bounds = stageRef.current?.getBoundingClientRect();
    if (bounds) setDragPoint({x: clientX - bounds.left, y: clientY - bounds.top});
  };
  const dropBlock = (blockId: string, clientX: number, clientY: number) => {
    const element = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>('[data-seesaw-drop]');
    const side = element?.dataset.seesawDrop as BlockLocation | undefined;
    if (side !== 'left' && side !== 'right') return;
    const targetBlocks = side === 'left' ? leftBlocks : rightBlocks;
    if (targetBlocks.length >= 3 || animating) return;
    setBlockLocations((current) => ({...current, [blockId]: side}));
    setAnimating(true);
  };
  const startDragging = (event: React.PointerEvent<HTMLButtonElement>, blockId: string) => {
    if (animating || activityDone) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingBlockId(blockId);
    positionGhost(event.clientX, event.clientY);
  };
  const moveDragging = (event: React.PointerEvent<HTMLButtonElement>, blockId: string) => {
    if (draggingBlockId === blockId) positionGhost(event.clientX, event.clientY);
  };
  const stopDragging = (event: React.PointerEvent<HTMLButtonElement>, blockId: string) => {
    if (draggingBlockId === blockId) dropBlock(blockId, event.clientX, event.clientY);
    setDraggingBlockId(null);
    setDragPoint(null);
  };

  if (mode === 'warmup') return <WarmupScreen videoUrl={warmupVideoUrl} />;
  if (mode === 'story') return <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl} />;
  if (!webGLAvailable) return <div className="generic-stage"><div className="seesaw-no-webgl"><strong>The seesaw needs WebGL.</strong><span>Enable graphics acceleration to explore it.</span></div></div>;

  const highlightedPart = mode === 'identify'
    ? lastSelectedPart as SeesawPartId | null
    : mode === 'explore'
      ? activePart as SeesawPartId
      : null;

  return (
    <div className="generic-stage seesaw-model-stage" ref={stageRef}>
      <SeesawErrorBoundary fallback={<div className="seesaw-no-webgl"><strong>The seesaw could not load.</strong><span>Try refreshing the lesson.</span></div>}>
        <Suspense fallback={<div className="seesaw-loading">Loading the seesaw…</div>}>
          {mode === 'explore' || mode === 'identify' ? (
            <SeesawCanvas key={attempt} highlightedPart={highlightedPart} mode={mode} tilt="level" animating={false} onPartSelect={onSelect} onSettled={settle} />
          ) : (
            <SeesawBalanceCanvas key={attempt} highlightedPart={highlightedPart} mode={mode} leftBlocks={leftBlocks} rightBlocks={rightBlocks} animating={animating} onPartSelect={onSelect} onSettled={settle} />
          )}
        </Suspense>
      </SeesawErrorBoundary>
      {mode === 'activity' ? (
        <>
          <div className="seesaw-drop-zone seesaw-drop-zone-left" data-seesaw-drop="left" aria-label="Drop blocks on the left side">Drop on left</div>
          <div className="seesaw-drop-zone seesaw-drop-zone-right" data-seesaw-drop="right" aria-label="Drop blocks on the right side">Drop on right</div>
          {draggingBlockId && dragPoint ? <div className="seesaw-drag-ghost" style={{left: dragPoint.x, top: dragPoint.y}}>{FLOOR_BLOCKS.find(({id}) => id === draggingBlockId)?.weight} kg</div> : null}
        <div className="seesaw-activity-overlay">
          <div className="seesaw-weight-readout" aria-label={`Left: ${describeBlocks(leftBlocks)}, ${leftWeight} kilograms total. Right: ${describeBlocks(rightBlocks)}, ${rightWeight} kilograms total.`}>
            <span>Left: {describeBlocks(leftBlocks)} = <b>{leftWeight} kg</b></span><span>Blocks: 5 kg · 10 kg · 20 kg</span><span>Right: {describeBlocks(rightBlocks)} = <b>{rightWeight} kg</b></span>
          </div>
          <strong>{activityDone ? 'Perfect balance! Both sides have the same total weight.' : leftBlocks.length === 0 && rightBlocks.length === 0 ? 'Drag blocks from the floor to either side. 10 kg and 20 kg are not the same.' : leftWeight > rightWeight ? 'The left side is heavier. Drag a block to the right.' : rightWeight > leftWeight ? 'The right side is heavier. Drag a block to the left.' : 'Balanced so far! Add at least three blocks to finish.'}</strong>
          {!activityDone && <div className="seesaw-block-floor" aria-label="Blocks on the floor. Drag a block onto the seesaw.">
            {floorBlocks.map(({id, weight}) => <button key={id} className={`seesaw-drag-block seesaw-drag-block-${weight}`} onPointerDown={(event) => startDragging(event, id)} onPointerMove={(event) => moveDragging(event, id)} onPointerUp={(event) => stopDragging(event, id)} onPointerCancel={() => { setDraggingBlockId(null); setDragPoint(null); }} disabled={animating}><b>{weight}</b><span>kg</span></button>)}
            {floorBlocks.length === 0 && <span className="seesaw-floor-empty">All blocks are on the seesaw.</span>}
          </div>}
          <div className="seesaw-controls">
            {activityDone ? <button className="primary-action" onClick={tryAgain}>↻ Try again</button> : <>{animating && <span className="seesaw-balancing">Balancing…</span>}{(leftBlocks.length > 0 || rightBlocks.length > 0) && <button className="secondary-action seesaw-clear" onClick={() => { setBlockLocations(freshBlockLocations()); setAnimating(false); }}>Clear blocks</button>}</>}
            <button className="game-frame-fullscreen seesaw-fullscreen" onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>{isFullscreen ? '⛶ Exit' : '⛶ Fullscreen'}</button>
          </div>
        </div>
        </>
      ) : null}
    </div>
  );
};

export const SeesawPartPreview: React.FC<{part: string}> = ({part}) => (
  <span className={`generic-part-preview seesaw-part-preview seesaw-part-preview-${part}`} aria-hidden="true">
    {part === 'beam' ? '━' : part === 'fulcrum' ? '▲' : part === 'seat' ? '▰' : '∩'}
  </span>
);
