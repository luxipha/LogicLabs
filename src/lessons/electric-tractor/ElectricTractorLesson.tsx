import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import {ElectricTractorPartPreview, ElectricTractorStage} from './ElectricTractorStage';
import content from './content.json';
import type {LessonContent} from '../../app/types';
import '../generic/lesson.scoped.css';

export const ElectricTractorLesson: React.FC<{
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
    stage={(props) => <ElectricTractorStage {...props} />}
    partPreview={(part) => <ElectricTractorPartPreview part={part} />}
  />
);

export default ElectricTractorLesson;
