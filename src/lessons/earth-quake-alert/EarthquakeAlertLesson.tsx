import React from 'react';
import {EarthquakeLesson} from '../earth-quake/EarthquakeLesson';
import type {LessonProps} from '../../app/lessons';
import content from './content.json';
import {EarthquakeAlertCoding} from './EarthquakeAlertCoding';

const EarthquakeAlertLesson: React.FC<LessonProps> = (props) => (
  <EarthquakeLesson {...props} lessonContent={content} codingStage={() => <EarthquakeAlertCoding />} />
);

export default EarthquakeAlertLesson;
