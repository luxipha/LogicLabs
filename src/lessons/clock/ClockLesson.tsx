import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import {ClockPartPreview, ClockStage} from './ClockStage';
import {ActivityTabs} from '../shared/lesson-ui';
import content from './content.json';
import type {LessonContent} from '../../app/types';

export const ClockLesson: React.FC<{
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
    stageCompletesActivity
    activityTabs={({activeId, onSelect}) => <ActivityTabs activeId={activeId} onSelect={onSelect} items={[{id: 'puzzle', label: 'Read the clock'}, {id: 'temperature', label: 'Temperature explorer'}]} />}
    stage={(props) => <ClockStage {...props} />}
    partPreview={(part) => <ClockPartPreview part={part} />}
  />
);

export default ClockLesson;
