import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import content from './content.json';
import type {LessonContent} from '../../app/types';
import {WaterwheelStage} from './WaterwheelStage';
import './waterwheel.css';

export const WaterwheelLesson: React.FC<{
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
    stage={({mode, warmupVideoUrl: stageWarmupVideoUrl, lastSelectedPart, onSelect, activityDone, completeActivity, resetActivity}) => (
      <WaterwheelStage
        mode={mode}
        warmupVideoUrl={stageWarmupVideoUrl}
        lastSelectedPart={lastSelectedPart}
        onSelect={onSelect}
        activityDone={activityDone}
        completeActivity={completeActivity}
        resetActivity={resetActivity}
      />
    )}
    partPreview={(part) => (
      <span className={`waterwheel-part-preview waterwheel-part-preview--${part}`} aria-hidden="true" />
    )}
  />
);

export default WaterwheelLesson;
