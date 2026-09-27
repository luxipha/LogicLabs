import React from 'react';
import type {LessonContent} from '../../app/types';
import {GenericLesson} from '../generic/GenericLesson';
import {AlligatorPartPreview, AlligatorStage} from './AlligatorStage';
import {ActivityTabs} from '../shared/lesson-ui';
import content from './content.json';
import './alligator.css';

export const AlligatorLesson: React.FC<{
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
    activityTabs={({activeId, onSelect}) => (
      <ActivityTabs
        items={[
          {id: 'puzzle', label: 'Moves'},
          {id: 'scratch', label: 'Scratch to reveal'},
          {id: 'rearrange', label: 'Rearrange puzzle'},
        ]}
        activeId={activeId}
        onSelect={onSelect}
      />
    )}
    stage={(props) => <AlligatorStage {...props} />}
    partPreview={(part) => <AlligatorPartPreview part={part} />}
  />
);

export default AlligatorLesson;
