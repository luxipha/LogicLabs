import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import {GarageDoorPartPreview, GarageDoorStage} from './GarageDoorStage';
import content from './content.json';
import type {LessonContent} from '../../app/types';
import '../generic/lesson.scoped.css';

export const GarageDoorLesson: React.FC<{
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
    stage={(props) => <GarageDoorStage {...props} />}
    partPreview={(part) => <GarageDoorPartPreview part={part} />}
  />
);

export default GarageDoorLesson;
