import React, {Component, Suspense, useState, type ReactNode} from 'react';
import {KangarooCanvas} from './KangarooModel';
import {KangarooActivity} from './KangarooActivity';
import {WarmupScreen} from '../shared/WarmupScreen';
import {SketchfabEmbed, StoryVideoCard} from '../shared/lesson-ui';
import content from './content.json';

class KangarooErrorBoundary extends Component<{children: ReactNode; fallback: ReactNode}, {hasError: boolean}> {
  state = {hasError: false};
  static getDerivedStateFromError() { return {hasError: true}; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

const hasWebGLSupport = () => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
};

export const KangarooStage: React.FC<{
  lastSelectedPart: string | null;
  identified: Set<string>;
  onSelect: (part: string) => void;
  mode: string;
  warmupVideoUrl: string;
  activityDone: boolean;
  completeActivity: () => void;
  resetActivity: () => void;
  activityStep: string;
  setActivityStep: (step: string) => void;
}> = ({lastSelectedPart, identified, onSelect, mode, warmupVideoUrl, activityDone, completeActivity, resetActivity, activityStep, setActivityStep}) => {
  const [webGLAvailable] = useState(hasWebGLSupport);
  if (mode === 'warmup') return <WarmupScreen videoUrl={warmupVideoUrl} />;
  if (mode === 'story') return <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl} />;
  if (mode === 'explore') {
    return (
      <SketchfabEmbed
        embedUrl="https://sketchfab.com/models/3f00780cb67c4f0686476587c3adce3c/embed"
        modelName="Kangaroo"
        modelPageUrl="https://sketchfab.com/3d-models/kangaroo-3f00780cb67c4f0686476587c3adce3c"
        authorName="mcnhel"
        authorPageUrl="https://sketchfab.com/mcnhel"
        stageClass="kangaroo-explore-stage"
      />
    );
  }
  if (mode === 'activity') {
    return <KangarooActivity activityDone={activityDone} completeActivity={completeActivity} resetActivity={resetActivity} activityStep={activityStep} setActivityStep={setActivityStep} />;
  }
  if (!webGLAvailable) return <div className="generic-stage kangaroo-no-webgl"><strong>The kangaroo needs WebGL.</strong><span>Enable graphics acceleration to explore it.</span></div>;
  return (
    <div className="generic-stage kangaroo-model-stage">
      <KangarooErrorBoundary fallback={<div className="kangaroo-no-webgl"><strong>The kangaroo model could not load.</strong><span>Try refreshing the lesson.</span></div>}>
        <Suspense fallback={<div className="kangaroo-loading">Loading the kangaroo…</div>}>
          <KangarooCanvas highlightedPart={mode === 'identify' ? lastSelectedPart : null} identified={identified} onPartSelect={onSelect} />
        </Suspense>
      </KangarooErrorBoundary>
    </div>
  );
};

export const KangarooPartPreview: React.FC<{part: string}> = ({part}) => (
  <span className={`generic-part-preview kangaroo-part-preview kangaroo-part-preview-${part}`} aria-hidden="true">
    {part === 'legs' ? '🦘' : part === 'arms' ? '🤲' : part === 'tail' ? '〰' : '♡'}
  </span>
);
