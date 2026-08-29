import React from 'react';
import {DataDrivenLesson} from '../shared/DataDrivenLesson';
import content from './content.json';

export const BanknoteVerifierLesson: React.FC<{
  onHome?: () => void;
  onComplete?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
}> = (props) => <DataDrivenLesson content={content} {...props} />;

export default BanknoteVerifierLesson;
