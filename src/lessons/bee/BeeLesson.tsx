import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import {BeeStage, BeePartPreview} from './BeeStage';
import content from './content.json';
import '../generic/lesson.scoped.css';

export const BeeLesson: React.FC<{
  onHome?: () => void;
  onComplete?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
}> = ({onHome, onComplete, warmupVideoUrl, onDraw, onBoard}) => (
  <GenericLesson
    content={content}
    onHome={onHome ?? (() => {})}
    onComplete={onComplete ?? (() => {})}
    warmupVideoUrl={warmupVideoUrl}
    onDraw={onDraw}
    onBoard={onBoard}
    stage={(props) => <BeeStage {...props} mode={props.mode} />}
    partPreview={(part) => <BeePartPreview part={part} />}
  />
);

export default BeeLesson;
