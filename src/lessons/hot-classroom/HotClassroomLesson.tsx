import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import content from './content.json';
import type {LessonContent} from '../../app/types';
import {HotClassroomStage} from './HotClassroomStage';
import './hot-classroom.css';

export const HotClassroomLesson: React.FC<{
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
    stage={({mode, warmupVideoUrl: stageWarmupVideoUrl, activePart, lastSelectedPart, onSelect, activityDone, completeActivity, resetActivity}) => (
      <HotClassroomStage
        mode={mode}
        warmupVideoUrl={stageWarmupVideoUrl}
        activePart={activePart}
        lastSelectedPart={lastSelectedPart}
        onSelect={onSelect}
        activityDone={activityDone}
        completeActivity={completeActivity}
        resetActivity={resetActivity}
      />
    )}
    partPreview={(part) => <span className={`hot-classroom-part-preview hot-classroom-part-preview--${part}`} aria-hidden="true" />}
  />
);

export default HotClassroomLesson;
