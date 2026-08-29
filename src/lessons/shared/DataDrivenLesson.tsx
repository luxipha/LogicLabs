import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import {PartsStage} from './PartsStage';
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
}> = ({content: rawContent, onHome, onComplete, warmupVideoUrl, onDraw, onBoard}) => {
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
        <PartsStage
          activePart={props.activePart}
          identified={props.identified}
          onSelect={props.onSelect}
          mode={props.mode}
          parts={content.parts ?? []}
          background={content.stageBackground}
        />
      )}
      partPreview={(part) => {
        const found = content.parts?.find((p) => p.id === part);
        return <span className="generic-part-preview" aria-hidden="true">{found ? found.label[0] : '•'}</span>;
      }}
    />
  );
};
