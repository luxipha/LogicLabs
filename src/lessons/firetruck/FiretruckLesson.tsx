import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import type {LessonContent} from '../../app/types';
import {FiretruckStage} from './FiretruckStage';
import {FiretruckPartPreview} from './FiretruckDiagram';
import content from './content.json';
import './firetruck.css';

export const FiretruckLesson: React.FC<{
  onHome?: () => void;
  onComplete?: () => void;
  onReset?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
}> = ({onHome, onComplete, ...props}) => <GenericLesson
  content={content as LessonContent}
  onHome={onHome ?? (() => {})}
  onComplete={onComplete ?? (() => {})}
  {...props}
  storyPresentation="video"
  stageCompletesActivity
  stage={(stageProps) => <FiretruckStage {...stageProps} />}
  partPreview={(part) => <FiretruckPartPreview part={part} />}
/>;

export default FiretruckLesson;
