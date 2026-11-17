import React from 'react';
import {DataDrivenLesson} from '../shared/DataDrivenLesson';
import content from './content.json';
import {AnemometerStage, AnemometerCoding, PartPreview} from './AnemometerStages';

export const AnemometerLesson: React.FC<{
  onHome?: () => void;
  onComplete?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
}> = (props) => <DataDrivenLesson content={content} {...props}
  identifyStage={p => <AnemometerStage onSelect={p.onSelect} selected={p.lastSelectedPart} identified={p.identified} />}
  partPreview={id => <PartPreview id={id} />}
  exploreStage={() => <AnemometerStage interactive />}
  activityStage={p => <AnemometerStage interactive activity {...p} />}
  stageCompletesActivity
  codingStage={() => <AnemometerCoding />}
/>;

export default AnemometerLesson;
