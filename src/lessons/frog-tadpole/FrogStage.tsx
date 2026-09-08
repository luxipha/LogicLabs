import React, {Component, Suspense, useState, type ReactNode} from 'react';
import type {LessonContent, LifeCycleStage} from '../../app/types';
import {SketchfabEmbed, StoryVideoCard} from '../shared/lesson-ui';
import {WarmupScreen} from '../shared/WarmupScreen';
import {FrogLifeCycleStage, type FrogPartId} from './FrogModel3D';

const hasWebGLSupport = () => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return Boolean(
    canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl'),
  );
};

class Frog3DErrorBoundary extends Component<
  {children: ReactNode; fallback: ReactNode},
  {hasError: boolean}
> {
  state = {hasError: false};

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

const FALLBACK_STAGES: LifeCycleStage[] = [
  {id: 'eggs', label: 'Frog eggs', shortLabel: 'Eggs', description: 'A tiny tadpole grows inside each egg.'},
  {id: 'tadpole', label: 'Tadpole', shortLabel: 'Tadpole', description: 'The tadpole swims with a long tail.'},
  {id: 'legs', label: 'Tadpole with legs', shortLabel: 'Back legs', description: 'The tadpole begins to grow strong back legs.'},
  {id: 'froglet', label: 'Froglet', shortLabel: 'Froglet', description: 'The froglet grows front legs and its tail gets shorter.'},
  {id: 'adult', label: 'Adult frog', shortLabel: 'Adult frog', description: 'The adult frog has four legs and no tail.'},
];

export const FrogStage: React.FC<{
  content: LessonContent;
  mode: string;
  activePart: string;
  identified: Set<string>;
  onSelect: (part: string) => void;
  warmupVideoUrl: string;
}> = ({content, mode, activePart, identified, onSelect, warmupVideoUrl}) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [showAdultModel, setShowAdultModel] = useState(false);
  const [webGLAvailable] = useState(hasWebGLSupport);
  const stages = content.lifeCycleStages?.length ? content.lifeCycleStages : FALLBACK_STAGES;
  const stage = stages[stageIndex] ?? stages[0];

  if (mode === 'warmup') return <WarmupScreen videoUrl={warmupVideoUrl} />;
  if (mode === 'story') {
    return <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl} />;
  }

  // Identify mode: the learner finds each life-cycle stage on the 3D frog.
  if (mode === 'identify') {
    const targetStage = content.parts?.find((part) => !identified.has(part.id))?.id ?? null;
    return (
      <div className="generic-stage frog-lifecycle-stage frog-identify-stage">
        <div className="frog-lifecycle-heading">
          <span>Identify each stage</span>
          <strong>{content.parts?.find((p) => p.id === targetStage)?.label ?? 'Pick a stage'}</strong>
        </div>
        <div className="frog-lifecycle-canvas">
          {webGLAvailable ? (
            <Frog3DErrorBoundary
              fallback={<div className="frog-3d-fallback">The 3D life cycle could not load.</div>}
            >
              <Suspense fallback={<div className="frog-3d-fallback">Loading frog…</div>}>
                <FrogLifeCycleStage
                  mode="identify"
                  visibleStage={null}
                  activeStage={activePart as FrogPartId | null}
                  onStageSelect={onSelect}
                />
              </Suspense>
            </Frog3DErrorBoundary>
          ) : (
            <div className="frog-3d-fallback">Enable graphics acceleration to view the 3D life cycle.</div>
          )}
        </div>
        <p className="frog-stage-description" aria-live="polite">
          Tap the stage that matches “{content.parts?.find((p) => p.id === targetStage)?.label ?? ''}”.
        </p>
      </div>
    );
  }

  if (mode !== 'explore') {
    return null;
  }

  if (showAdultModel && content.sketchfabEmbedUrl) {
    return (
      <div className="frog-explore-shell">
        <SketchfabEmbed
          embedUrl={content.sketchfabEmbedUrl}
          modelName={content.sketchfabModelName ?? 'Adult frog'}
          modelPageUrl={content.sketchfabModelPageUrl ?? content.sketchfabEmbedUrl}
          authorName={content.sketchfabAuthorName}
          authorPageUrl={content.sketchfabAuthorPageUrl}
          stageClass="frog-sketchfab-stage"
        />
        <button className="frog-model-toggle" onClick={() => setShowAdultModel(false)}>
          ← Back to life cycle
        </button>
      </div>
    );
  }

  return (
    <div className="generic-stage frog-lifecycle-stage">
      <div className="frog-lifecycle-heading">
        <span>Stage {stageIndex + 1} of {stages.length}</span>
        <strong>{stage.label}</strong>
      </div>

      <div className="frog-lifecycle-canvas">
        {webGLAvailable ? (
          <Frog3DErrorBoundary
            fallback={<div className="frog-3d-fallback">The 3D life cycle could not load.</div>}
          >
            <Suspense fallback={<div className="frog-3d-fallback">Loading frog…</div>}>
              <FrogLifeCycleStage
                mode="explore"
                visibleStage={stage.id}
                activeStage={null}
                onStageSelect={() => {}}
              />
            </Suspense>
          </Frog3DErrorBoundary>
        ) : (
          <div className="frog-3d-fallback">Enable graphics acceleration to view the 3D life cycle.</div>
        )}
      </div>

      <p className="frog-stage-description" aria-live="polite">{stage.description}</p>

      <div className="frog-stage-tabs" aria-label="Frog life-cycle stages">
        {stages.map((item, index) => (
          <button
            key={item.id}
            className={index === stageIndex ? 'active' : ''}
            onClick={() => setStageIndex(index)}
            aria-pressed={index === stageIndex}
          >
            <span>{index + 1}</span>
            {item.shortLabel}
          </button>
        ))}
      </div>

      <div className="frog-stage-actions">
        <button
          onClick={() => setStageIndex((index) => Math.max(0, index - 1))}
          disabled={stageIndex === 0}
        >
          ← Previous
        </button>
        {stageIndex === stages.length - 1 && content.sketchfabEmbedUrl ? (
          <button className="frog-adult-model-button" onClick={() => setShowAdultModel(true)}>
            View adult frog in detail
          </button>
        ) : (
          <button
            className="frog-next-stage"
            onClick={() => setStageIndex((index) => Math.min(stages.length - 1, index + 1))}
          >
            Next stage →
          </button>
        )}
      </div>
    </div>
  );
};
