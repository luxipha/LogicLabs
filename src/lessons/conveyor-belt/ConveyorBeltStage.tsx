import React, {Component, Suspense, useState, type ReactNode} from 'react';
import {Canvas} from '@react-three/fiber';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import {ConveyorCanvas, ConveyorLights, MovingConveyorCanvas, type ConveyorPartId} from './ConveyorBeltModel';
import {ConveyorBeltActivity} from './ConveyorBeltActivity';
import content from './content.json';

const hasWebGL = () => typeof document !== 'undefined' && Boolean(document.createElement('canvas').getContext('webgl') || document.createElement('canvas').getContext('webgl2'));
class CanvasBoundary extends Component<{children: ReactNode}, {failed: boolean}> { state = {failed: false}; static getDerivedStateFromError() { return {failed: true}; } render() { return this.state.failed ? <div className="conveyor-fallback"><strong>The conveyor needs WebGL.</strong><span>Enable graphics acceleration and refresh.</span></div> : this.props.children; } }

export const ConveyorBeltStage: React.FC<{mode: string; warmupVideoUrl: string; lastSelectedPart: string | null; onSelect: (part: string) => void; activityDone: boolean; completeActivity: () => void; resetActivity: () => void}> = ({mode, warmupVideoUrl, lastSelectedPart, onSelect, activityDone, completeActivity, resetActivity}) => {
  const [webgl] = useState(hasWebGL);
  if (mode === 'warmup') return <WarmupScreen videoUrl={warmupVideoUrl} />;
  if (mode === 'story') return <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl} />;
  if (mode === 'activity') return <ConveyorBeltActivity activityDone={activityDone} completeActivity={completeActivity} resetActivity={resetActivity} />;
  return <div className="generic-stage conveyor-stage"><div className="conveyor-stage__model">{!webgl ? <div className="conveyor-fallback"><strong>The conveyor needs WebGL.</strong><span>Enable graphics acceleration and refresh.</span></div> : <CanvasBoundary><Suspense fallback={<div className="conveyor-loading">Loading conveyor belt…</div>}><ConveyorCanvas highlightedPart={mode === 'identify' ? lastSelectedPart as ConveyorPartId | null : null} onPartSelect={mode === 'identify' ? (part) => onSelect(part) : undefined} /></Suspense></CanvasBoundary>}</div></div>;
};
