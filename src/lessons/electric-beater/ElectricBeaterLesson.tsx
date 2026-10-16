import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import type {LessonContent} from '../../app/types';
import {ElectricBeaterStage} from './ElectricBeaterStage';
import {BeaterPartPreview} from './BeaterPartPreview';
import content from './content.json';
import './electric-beater.css';

export const ElectricBeaterLesson: React.FC<{
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
  stageCompletesActivity
  stage={(stageProps) => <ElectricBeaterStage {...stageProps} />}
  partPreview={(part) => <BeaterPartPreview part={part} />}
/>;

export default ElectricBeaterLesson;
