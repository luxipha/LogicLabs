import React from 'react';
import {DataDrivenLesson} from '../shared/DataDrivenLesson';
import {DragsterStage, DragsterPreview} from './DragsterStage';
import content from './content.json';
import {DragsterCoding} from './DragsterCoding';

export const DragsterLesson: React.FC<{
  onHome?: () => void;
  onComplete?: () => void;
  onReset?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
}> = props => <DataDrivenLesson content={content} {...props}
  codingTabLabel="Code"
  identifyStage={p => <DragsterStage mode="identify" selected={p.lastSelectedPart} onSelect={p.onSelect} />}
  partPreview={id => <DragsterPreview id={id} />}
  exploreStage={() => <DragsterStage mode="explore" />}
  activityStage={p => <DragsterStage mode="activity" {...p} />}
  stageCompletesActivity
  codingStage={() => <DragsterCoding />}
/>;

export default DragsterLesson;
