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
  onReset?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
  activityStage?: (props: {activityDone: boolean; completeActivity: () => void; resetActivity: () => void; activityStep: string; setActivityStep: (id: string) => void}) => React.ReactNode;
  activityTabs?: (props: {activeId: string; onSelect: (id: string) => void}) => React.ReactNode;
  partPreview?: (part: string) => React.ReactNode;
  codingStage?: () => React.ReactNode;
  exploreStage?: () => React.ReactNode;
  stageCompletesActivity?: boolean;
  identifyStage?: (props: {activePart: string; lastSelectedPart: string | null; identified: Set<string>; onSelect: (part: string) => void}) => React.ReactNode;
}> = ({content: rawContent, onHome, onComplete, onReset, warmupVideoUrl, onDraw, onBoard, activityStage, identifyStage, exploreStage, stageCompletesActivity, activityTabs, partPreview, codingStage}) => {
  const content = asContent(rawContent);
  return (
    <GenericLesson
      content={content}
      onHome={onHome ?? (() => {})}
      onComplete={onComplete ?? (() => {})}
      onReset={onReset}
      warmupVideoUrl={warmupVideoUrl}
      onDraw={onDraw}
      onBoard={onBoard}
      stageCompletesActivity={stageCompletesActivity}
      activityTabs={activityTabs}
      codingTab={Boolean(codingStage)}
      stage={(props) => (
        props.mode === 'warmup' ? (
          <WarmupScreen videoUrl={props.warmupVideoUrl} />
        ) : props.mode === 'story' ? (
          <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl} />
        ) : props.mode === 'coding' && codingStage ? (
          codingStage()
        ) : props.mode === 'activity' && activityStage ? (
          activityStage({
            activityDone: props.activityDone,
            completeActivity: props.completeActivity,
            resetActivity: props.resetActivity,
            activityStep: props.activityStep,
            setActivityStep: props.setActivityStep,
          })
        ) : props.mode === 'identify' && identifyStage ? (
          identifyStage({
            activePart: props.activePart,
            lastSelectedPart: props.lastSelectedPart,
            identified: props.identified,
            onSelect: props.onSelect,
          })
        ) : props.mode === 'explore' && exploreStage ? (
          exploreStage()
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
      partPreview={partPreview ?? ((part) => {
        const found = content.parts?.find((p) => p.id === part);
        return <span className="generic-part-preview" aria-hidden="true">{found ? found.label[0] : '•'}</span>;
      })}
    />
  );
};
