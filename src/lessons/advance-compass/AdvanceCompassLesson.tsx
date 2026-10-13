import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import type {LessonContent} from '../../app/types';
import content from './content.json';
import {AdvanceCompassStage} from './AdvanceCompassStage';
import './advance-compass.css';
import {ActivityTabs, StoryVideoCard} from '../shared/lesson-ui';

export const AdvanceCompassLesson: React.FC<{
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
        <AdvanceCompassStage mode={mode} warmupVideoUrl={stageWarmupVideoUrl} lastSelectedPart={lastSelectedPart} onSelect={onSelect} activityDone={activityDone} completeActivity={completeActivity} resetActivity={resetActivity} activityStep={activityStep} setActivityStep={setActivityStep} />
      )
    }
    partPreview={(part) => <span className={`advance-compass-part-preview advance-compass-part-preview--${part}`} aria-hidden="true" />}
  />
);

export default AdvanceCompassLesson;
