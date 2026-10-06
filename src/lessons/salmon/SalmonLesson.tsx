import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import type {LessonContent} from '../../app/types';
import {SalmonStage} from './SalmonStage';
import content from './content.json';
import './salmon.css';

export const SalmonLesson: React.FC<{
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
    codingTab
    stage={({mode, warmupVideoUrl, lastSelectedPart, onSelect, activityDone, completeActivity, resetActivity}) => <SalmonStage mode={mode} warmupVideoUrl={warmupVideoUrl} lastSelectedPart={lastSelectedPart} onSelect={onSelect} activityDone={activityDone} completeActivity={completeActivity} resetActivity={resetActivity} />}
    partPreview={(part) => <span className={`salmon-part-preview salmon-part-preview--${part}`} aria-hidden="true" />}
  />
);

export default SalmonLesson;
