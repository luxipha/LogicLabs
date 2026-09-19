import React from 'react';
import {DataDrivenLesson} from '../shared/DataDrivenLesson';
import {GameEmbed} from '../shared/lesson-ui';
import {MoneyCounterIdentifyCanvas} from './MoneyCounterIdentifyModel';
import content from './content.json';

export const BanknoteVerifierLesson: React.FC<{
  onHome?: () => void;
  onComplete?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
}> = (props) => (
  <DataDrivenLesson
    content={content}
    {...props}
    activityStage={({completeActivity}) => (
      <GameEmbed
        title="Money Counter Simulator"
        src="banknote-activities/money-counter-simulator.html"
        open
        onComplete={completeActivity}
      />
    )}
    identifyStage={({lastSelectedPart, identified, onSelect}) => (
      <MoneyCounterIdentifyCanvas
        highlightedPart={lastSelectedPart}
        identified={identified}
        onPartSelect={onSelect}
      />
    )}
  />
);

export default BanknoteVerifierLesson;
