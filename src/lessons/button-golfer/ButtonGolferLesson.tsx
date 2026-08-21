import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import {GolfStage, GolfPartPreview} from './GolfStage';
import content from './content.json';
import '../generic/lesson.scoped.css';

export const ButtonGolferLesson: React.FC<{onHome?: () => void; onComplete?: () => void}> = ({
  onHome,
  onComplete,
}) => (
  <GenericLesson
    content={content}
    onHome={onHome ?? (() => {})}
    onComplete={onComplete ?? (() => {})}
    stage={(props) => <GolfStage {...props} mode={props.mode} />}
    partPreview={(part) => <GolfPartPreview part={part} />}
  />
);

export default ButtonGolferLesson;
