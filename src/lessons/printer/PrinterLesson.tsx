import React from 'react';
import type {LessonContent} from '../../app/types';
import {GenericLesson} from '../generic/GenericLesson';
import {PrinterPartPreview, PrinterStage} from './PrinterStage';
import content from './content.json';
import './printer.css';

export const PrinterLesson: React.FC<{
  onHome?: () => void;
  onComplete?: () => void;
  onReset?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
}> = ({onHome, onComplete, onReset, warmupVideoUrl, onDraw, onBoard}) => (
  <GenericLesson
    content={content as LessonContent}
    onHome={onHome ?? (() => {})}
    onComplete={onComplete ?? (() => {})}
    onReset={onReset}
    warmupVideoUrl={warmupVideoUrl}
    onDraw={onDraw}
    onBoard={onBoard}
    stageCompletesActivity
    stage={(props) => <PrinterStage {...props} />}
    partPreview={(part) => <PrinterPartPreview part={part} />}
  />
);

export default PrinterLesson;
