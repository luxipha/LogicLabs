import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import {HoneyBeeStage, HoneyBeePartPreview} from './HoneyBeeStage';
import content from './content.json';
import '../generic/lesson.scoped.css';

export const HoneyBeeLesson: React.FC<{onHome?: () => void; onComplete?: () => void}> = ({
  onHome,
  onComplete,
}) => (
  <GenericLesson
    content={content}
    onHome={onHome ?? (() => {})}
    onComplete={onComplete ?? (() => {})}
    stage={(props) => <HoneyBeeStage {...props} mode={props.mode} />}
    partPreview={(part) => <HoneyBeePartPreview part={part} />}
  />
);

export default HoneyBeeLesson;
