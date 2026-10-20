import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import type {LessonContent} from '../../app/types';
import {UltrasonicStage, UltrasonicPartPreview} from './UltrasonicStage';
import content from './content.json';
import {UltrasonicCoding} from './UltrasonicCoding';
import {WarmupScreen} from '../shared/WarmupScreen';
import {ActivityTabs, StoryVideoCard} from '../shared/lesson-ui';
import './ultrasonic.css';

export const UltrasonicLesson: React.FC<{
  onHome?: () => void;
  onComplete?: () => void;
  onReset?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
}> = ({onHome, onComplete, onReset, warmupVideoUrl, onDraw, onBoard}) => (
  <GenericLesson content={content as LessonContent}
    onHome={onHome ?? (() => {})} onComplete={onComplete ?? (() => {})} onReset={onReset}
    warmupVideoUrl={warmupVideoUrl}
    onDraw={onDraw} onBoard={onBoard} stageCompletesActivity codingTab
    activityTabs={({activeId, onSelect}) => <ActivityTabs
      items={[{id: 'puzzle', label: 'Robot alarm'}, {id: 'vacuum-room', label: 'Vacuum room'}]}
      activeId={activeId} onSelect={onSelect} />}
    stage={props => props.mode === 'warmup' ? <WarmupScreen videoUrl={props.warmupVideoUrl} />
      : props.mode === 'story' ? <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl} />
      : props.mode === 'coding' ? <UltrasonicCoding />
      : <UltrasonicStage {...props} />}
    partPreview={part => <UltrasonicPartPreview part={part} />} />
);
export default UltrasonicLesson;
