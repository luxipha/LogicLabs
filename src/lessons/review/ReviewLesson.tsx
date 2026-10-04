import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import {ActivityTabs} from '../shared/lesson-ui';
import {ReviewStage} from './ReviewStage';
import content from './content.json';
import '../generic/lesson.scoped.css';
import './review.css';

export const ReviewLesson: React.FC<{
  onHome?: () => void;
  onComplete?: () => void;
  onReset?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
}> = ({onHome, onComplete, onReset, warmupVideoUrl, onDraw, onBoard}) => (
  <GenericLesson
    content={content}
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
          {id: 'letter-challenge', label: 'Letter Challenge'},
          {id: 'picture-match', label: 'Match Pictures'},
          {id: 'circle-letter', label: 'Circle the Letter'},
        ]}
        activeId={activeId === 'puzzle' ? 'letter-challenge' : activeId}
        onSelect={onSelect}
      />
    )}
    stage={(props) => <ReviewStage {...props} />}
    partPreview={() => <span aria-hidden="true">★</span>}
  />
);

export default ReviewLesson;
