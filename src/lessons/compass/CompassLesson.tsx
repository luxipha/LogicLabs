import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import type {LessonContent} from '../../app/types';
import content from './content.json';
import {CompassStage} from './CompassStage';
import './compass.css';
import {ActivityTabs, StoryVideoCard} from '../shared/lesson-ui';

export const CompassLesson: React.FC<{
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
    codingTab
    activityTabs={({activeId, onSelect}) => <ActivityTabs items={[{id: 'directions', label: 'Activity 1'}, {id: 'person', label: 'Activity 2'}]} activeId={activeId === 'person' ? 'person' : 'directions'} onSelect={onSelect} />}
    stage={({mode, warmupVideoUrl: stageWarmupVideoUrl, lastSelectedPart, onSelect, activityDone, completeActivity, resetActivity, activityStep, setActivityStep}) =>
      mode === 'story' ? (
        <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl} />
      ) : (
        <CompassStage mode={mode} warmupVideoUrl={stageWarmupVideoUrl} lastSelectedPart={lastSelectedPart} onSelect={onSelect} activityDone={activityDone} completeActivity={completeActivity} resetActivity={resetActivity} activityStep={activityStep} setActivityStep={setActivityStep} />
      )
    }
    partPreview={(part) => <span className={`compass-part-preview compass-part-preview--${part}`} aria-hidden="true" />}
  />
);

export default CompassLesson;
