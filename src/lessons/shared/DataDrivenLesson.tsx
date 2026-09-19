import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import {PartsStage} from './PartsStage';
import {SketchfabEmbed, StoryVideoCard} from './lesson-ui';
import {WarmupScreen} from './WarmupScreen';
import type {LessonContent} from '../../app/types';
import '../generic/lesson.scoped.css';

const asContent = (json: unknown): LessonContent => json as LessonContent;

/**
 * Data-driven lesson: the whole experience (parts geometry, background,
 * videos, questions, quiz, games) comes from content.json. No per-lesson
 * stage component needed.
 */
export const DataDrivenLesson: React.FC<{
  content: unknown;
  onHome?: () => void;
  onComplete?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
  activityStage?: (props: {activityDone: boolean; completeActivity: () => void; resetActivity: () => void}) => React.ReactNode;
  identifyStage?: (props: {activePart: string; lastSelectedPart: string | null; identified: Set<string>; onSelect: (part: string) => void}) => React.ReactNode;
}> = ({content: rawContent, onHome, onComplete, warmupVideoUrl, onDraw, onBoard, activityStage, identifyStage}) => {
  const content = asContent(rawContent);
  return (
    <GenericLesson
      content={content}
      onHome={onHome ?? (() => {})}
      onComplete={onComplete ?? (() => {})}
      warmupVideoUrl={warmupVideoUrl}
      onDraw={onDraw}
      onBoard={onBoard}
      stage={(props) => (
        props.mode === 'warmup' ? (
          <WarmupScreen videoUrl={props.warmupVideoUrl} />
        ) : props.mode === 'story' ? (
          <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl} />
        ) : props.mode === 'activity' && activityStage ? (
          activityStage({
            activityDone: props.activityDone,
            completeActivity: props.completeActivity,
            resetActivity: props.resetActivity,
          })
        ) : props.mode === 'identify' && identifyStage ? (
          identifyStage({
            activePart: props.activePart,
            lastSelectedPart: props.lastSelectedPart,
            identified: props.identified,
            onSelect: props.onSelect,
          })
        ) : props.mode === 'explore' && content.sketchfabEmbedUrl ? (
          <SketchfabEmbed
            embedUrl={content.sketchfabEmbedUrl}
            modelName={content.sketchfabModelName ?? content.title}
            modelPageUrl={content.sketchfabModelPageUrl ?? content.sketchfabEmbedUrl}
            authorName={content.sketchfabAuthorName}
            authorPageUrl={content.sketchfabAuthorPageUrl}
          />
        ) : (
          <PartsStage
            activePart={props.activePart}
            identified={props.identified}
            onSelect={props.onSelect}
            mode={props.mode}
            parts={content.parts ?? []}
            background={content.stageBackground}
          />
        )
      )}
      partPreview={(part) => {
        const found = content.parts?.find((p) => p.id === part);
        return <span className="generic-part-preview" aria-hidden="true">{found ? found.label[0] : '•'}</span>;
      }}
    />
  );
};
