import React from 'react';
import {HotClassroomLesson} from '../hot-classroom/HotClassroomLesson';
import type {LessonContent} from '../../app/types';
import content from './content.json';

export const ElectricFanLesson: React.FC<Omit<React.ComponentProps<typeof HotClassroomLesson>, 'lessonContent' | 'codingTab'>> = (props) => (
  <HotClassroomLesson {...props} lessonContent={content as LessonContent} codingTab={false} />
);

export default ElectricFanLesson;
