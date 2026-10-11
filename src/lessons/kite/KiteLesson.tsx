import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import content from './content.json';
import type {LessonContent} from '../../app/types';
import {KiteStage} from './KiteStage';
import {ActivityTabs} from '../shared/lesson-ui';
import './kite.css';

export const KiteLesson: React.FC<{
  onHome?: () => void;
  onComplete?: () => void;
  onReset?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
}> = ({onHome, onComplete, onReset, warmupVideoUrl, onDraw, onBoard}) => <GenericLesson content={content as LessonContent} onHome={onHome ?? (() => {})} onComplete={onComplete ?? (() => {})} onReset={onReset} warmupVideoUrl={warmupVideoUrl} onDraw={onDraw} onBoard={onBoard} stageCompletesActivity activityTabs={({activeId, onSelect}) => <ActivityTabs activeId={activeId} onSelect={onSelect} items={[{id: 'puzzle', label: 'Build the kite'}, {id: 'wind', label: 'Test the wind'}, {id: 'game', label: 'Fly for points'}]} />} stage={(props) => <KiteStage {...props} />} partPreview={(part) => <span className={`kite-part-preview kite-part-preview--${part}`} aria-hidden="true" />} />;

export default KiteLesson;
