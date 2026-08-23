import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import {ElevatorStage, ElevatorPartPreview} from './ElevatorStage';
import content from './content.json';
import '../generic/lesson.scoped.css';

export const ElevatorLesson: React.FC<{
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
    stage={(props) => <ElevatorStage {...props} mode={props.mode} />}
    partPreview={(part) => <ElevatorPartPreview part={part} />}
  />
);

export default ElevatorLesson;
