import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import type {LessonContent} from '../../app/types';
import {ActivityTabs} from '../shared/lesson-ui';
import {SnailStage} from './SnailStage';
import {SnailPartPreview} from './SnailPartPreview';
import content from './content.json';
import './snail.css';

export const SnailLesson: React.FC<{
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
  activityTabs={({activeId, onSelect}) => <ActivityTabs items={[{id: 'puzzle', label: 'Crawl to the leaf'}, {id: 'snail-picture', label: 'Snail puzzle'}]} activeId={activeId} onSelect={onSelect} />}
  stage={(stageProps) => <SnailStage {...stageProps} />}
  partPreview={(part) => <SnailPartPreview part={part} />}
/>;

export default SnailLesson;
