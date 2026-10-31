import React, {useState} from 'react';
import {EarthquakeExperience, type EarthquakeProgress} from './EarthquakeExperience';
import {EarthquakeIdentify, EarthquakePartPreview} from './EarthquakeIdentify';
import {EarthquakeCoding} from './EarthquakeCoding';
import {EarthquakeExplore} from './EarthquakeExplore';
import {DataDrivenLesson} from '../shared/DataDrivenLesson';
import content from './content.json';
import type {LessonContent} from '../../app/types';
import {ActivityTabs} from '../shared/lesson-ui';
import {EARTHQUAKE_ACTIVITIES as activities} from './activities';



export const EarthquakeLesson: React.FC<{
  lessonContent?: LessonContent;
  codingStage?: () => React.ReactNode;
  onHome?: () => void;
  onComplete?: () => void;
  onReset?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
}> = ({lessonContent = content as LessonContent, codingStage = () => <EarthquakeCoding />, ...props}) => {
  const [progress, setProgress] = useState<EarthquakeProgress>({done: []});
  return <DataDrivenLesson content={lessonContent} {...props} stageCompletesActivity
    activityTabs={({activeId, onSelect}) => <ActivityTabs items={activities} activeId={activeId} onSelect={onSelect} />}
    identifyStage={props => <EarthquakeIdentify {...props} />}
    partPreview={part => <EarthquakePartPreview part={part} />}
    codingStage={codingStage}
    exploreStage={() => <EarthquakeExplore />}
    activityStage={({completeActivity, resetActivity, activityStep, setActivityStep}) => <EarthquakeExperience key="activity" view={Math.max(0, activities.findIndex(activity => activity.id === activityStep))} onSelectView={index => setActivityStep(activities[index].id)} progress={progress} setProgress={setProgress} completeActivity={completeActivity} resetActivity={resetActivity} />}
  />;
};

export default EarthquakeLesson;
