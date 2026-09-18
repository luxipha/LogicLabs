import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import {SeesawPartPreview, SeesawStage} from './SeesawStage';
import content from './content.json';
import type {LessonContent} from '../../app/types';
import '../generic/lesson.scoped.css';

export const SeesawLesson: React.FC<{
  onHome?: () => void;
  onComplete?: () => void;
  onReset?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
}> = ({onHome, onComplete, onReset, warmupVideoUrl, onDraw, onBoard}) => (
  <GenericLesson
    content={content as LessonContent}
    onHome={onHome ?? (() => {})}
    onComplete={onComplete ?? (() => {})}
    onReset={onReset}
    warmupVideoUrl={warmupVideoUrl}
    onDraw={onDraw}
    onBoard={onBoard}
    stage={(props) => <SeesawStage {...props} />}
    partPreview={(part) => <SeesawPartPreview part={part} />}
  />
);

export default SeesawLesson;
