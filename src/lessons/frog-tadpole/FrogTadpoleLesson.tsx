import React from 'react';
import type {LessonContent} from '../../app/types';
import {GenericLesson} from '../generic/GenericLesson';
import content from './content.json';
import {FrogStage} from './FrogStage';

const lessonContent = content as LessonContent;

export const FrogTadpoleLesson: React.FC<{
  onHome?: () => void;
  onComplete?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
}> = ({onHome, onComplete, warmupVideoUrl, onDraw, onBoard}) => (
  <GenericLesson
    content={lessonContent}
    onHome={onHome ?? (() => {})}
    onComplete={onComplete ?? (() => {})}
    warmupVideoUrl={warmupVideoUrl}
    onDraw={onDraw}
    onBoard={onBoard}
    stage={(props) => (
      <FrogStage
        content={lessonContent}
        mode={props.mode}
        activePart={props.activePart}
        identified={props.identified}
        onSelect={props.onSelect}
        warmupVideoUrl={props.warmupVideoUrl}
      />
    )}
    partPreview={(part) => {
      const found = lessonContent.parts?.find((item) => item.id === part);
      return <span className="generic-part-preview" aria-hidden="true">{found?.label[0] ?? '•'}</span>;
    }}
  />
);

export default FrogTadpoleLesson;
