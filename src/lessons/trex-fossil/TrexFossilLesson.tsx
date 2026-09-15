import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import {TrexPartPreview, TrexStage} from './TrexStage';
import content from './content.json';
import '../generic/lesson.scoped.css';

export const TrexFossilLesson: React.FC<{
  onHome?: () => void;
  onComplete?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
}> = ({onHome, onComplete, warmupVideoUrl, onDraw, onBoard}) => (
  <GenericLesson
    content={content}
    onHome={onHome ?? (() => {})}
    onComplete={onComplete ?? (() => {})}
    warmupVideoUrl={warmupVideoUrl}
    onDraw={onDraw}
    onBoard={onBoard}
    stageCompletesActivity
    stage={(props) => <TrexStage {...props} />}
    partPreview={(part) => <TrexPartPreview part={part} />}
  />
);

export default TrexFossilLesson;
