import React, {useState} from 'react';
import {EarthquakeExperience, type EarthquakeProgress} from './EarthquakeExperience';
import {EarthquakeIdentify, EarthquakePartPreview} from './EarthquakeIdentify';
import {EarthquakeExplore} from './EarthquakeExplore';
import {DataDrivenLesson} from '../shared/DataDrivenLesson';
import content from './content.json';
import {ActivityTabs} from '../shared/lesson-ui';

const activities = [
  {id: 'puzzle', label: 'Earth’s crust'},
  {id: 'stress', label: 'Push, pull, slide'},
  {id: 'fault', label: 'Release a quake'},
  {id: 'program', label: 'Program the platform'},
];

export const EarthquakeLesson: React.FC<{
  onHome?: () => void;
  onComplete?: () => void;
  onReset?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
}> = (props) => {
  const [progress, setProgress] = useState<EarthquakeProgress>({done: []});
  return <DataDrivenLesson content={content} {...props} stageCompletesActivity
    activityTabs={({activeId, onSelect}) => <ActivityTabs items={activities} activeId={activeId} onSelect={onSelect} />}
    identifyStage={props => <EarthquakeIdentify {...props} />}
    partPreview={part => <EarthquakePartPreview part={part} />}
    exploreStage={() => <EarthquakeExplore />}
    activityStage={({completeActivity, resetActivity, activityStep, setActivityStep}) => <EarthquakeExperience key="activity" view={Math.max(0, activities.findIndex(activity => activity.id === activityStep))} onSelectView={index => setActivityStep(activities[index].id)} progress={progress} setProgress={setProgress} completeActivity={completeActivity} resetActivity={resetActivity} />}
  />;
};

export default EarthquakeLesson;
