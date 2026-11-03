import React from 'react';
import {DataDrivenLesson} from '../shared/DataDrivenLesson';
import {MudslideCoding} from './MudslideCoding';
import {MudslideActivity, MudslideExplore, MudslideIdentify} from './MudslideStages';
import content from './content.json';

export const MudslideLesson: React.FC<{
  onHome?: () => void;
  onComplete?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
}> = (props) => <DataDrivenLesson content={content} codingStage={() => <MudslideCoding />} identifyStage={stageProps => <MudslideIdentify {...stageProps} />} exploreStage={() => <MudslideExplore />} activityStage={({completeActivity, resetActivity}) => <MudslideActivity completeActivity={completeActivity} resetActivity={resetActivity} />} stageCompletesActivity {...props} />;

export default MudslideLesson;
