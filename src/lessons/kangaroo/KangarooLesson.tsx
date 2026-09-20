import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import {KangarooPartPreview, KangarooStage} from './KangarooStage';
import {ActivityTabs} from '../shared/lesson-ui';
import content from './content.json';
import '../generic/lesson.scoped.css';

export const KangarooLesson: React.FC<{
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
        items={[{id: 'puzzle', label: 'Puzzle'}, {id: 'scratch', label: 'Scratch to reveal'}]}
        activeId={activeId}
        onSelect={onSelect}
      />
    )}
    stage={(props) => <KangarooStage {...props} />}
    partPreview={(part) => <KangarooPartPreview part={part} />}
  />
);

export default KangarooLesson;
