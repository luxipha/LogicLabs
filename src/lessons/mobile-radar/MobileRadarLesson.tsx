import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import {RadarStage, RadarPartPreview} from './RadarStage';
import content from './content.json';
import '../generic/lesson.scoped.css';

export const MobileRadarLesson: React.FC<{
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
    stage={(props) => <RadarStage {...props} mode={props.mode} />}
    partPreview={(part) => <RadarPartPreview part={part} />}
  />
);

export default MobileRadarLesson;
