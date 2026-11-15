import React from 'react';
import {DataDrivenLesson} from '../shared/DataDrivenLesson';
import content from './content.json';
import {TricyclePreview, TricycleStage} from './TricycleStage';

export const TricycleLesson: React.FC<{
  onHome?: () => void;
  onComplete?: () => void;
  onReset?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
}> = (props) => <DataDrivenLesson content={content} {...props}
  stageCompletesActivity
  partPreview={(part) => <TricyclePreview part={part} />}
  identifyStage={({onSelect, lastSelectedPart}) => <TricycleStage mode="identify" onSelect={onSelect} selected={lastSelectedPart} />}
  exploreStage={() => <TricycleStage mode="explore" />}
  activityStage={(activity) => <TricycleStage mode="activity" {...activity} />}
/>;

export default TricycleLesson;
