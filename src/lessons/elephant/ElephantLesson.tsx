import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import type {LessonContent} from '../../app/types';
import {ElephantStage} from './ElephantStage';
import {ElephantPartPreview} from './ElephantPartPreview';
import content from './content.json';
import './elephant.css';

export const ElephantLesson: React.FC<{
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
  codingTab
  stageCompletesActivity
  stage={stageProps => <ElephantStage {...stageProps} />}
  partPreview={part => <ElephantPartPreview part={part} />}
/>;

export default ElephantLesson;
