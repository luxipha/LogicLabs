import {lazy, type ComponentType} from 'react';
import airplaneContent from '../lessons/airplane/content.json';
import butterflyContent from '../lessons/butterfly/content.json';
import honeyBeeContent from '../lessons/honey-bee/content.json';
import buttonGolferContent from '../lessons/button-golfer/content.json';
import mobileRadarContent from '../lessons/mobile-radar/content.json';
import type {LessonContent} from './types';

export type LessonId =
  | 'airplane'
  | 'butterfly'
  | 'honey-bee'
  | 'button-golfer'
  | 'mobile-radar';

export type LessonMeta = {
  id: LessonId;
  content: LessonContent;
};

export type LessonProps = {
  onHome?: () => void;
  onComplete?: () => void;
};

// Lazy components defined at module scope — React requires a stable lazy
// component reference; creating one per render breaks Suspense.
const AirplaneLesson = lazy(() => import('../lessons/airplane/AirplaneLesson'));
const ButterflyLesson = lazy(() => import('../lessons/butterfly/ButterflyLesson'));
const HoneyBeeLesson = lazy(() => import('../lessons/honey-bee/HoneyBeeLesson'));
const ButtonGolferLesson = lazy(() => import('../lessons/button-golfer/ButtonGolferLesson'));
const MobileRadarLesson = lazy(() => import('../lessons/mobile-radar/MobileRadarLesson'));

export const LESSONS: LessonMeta[] = [
  {id: 'airplane', content: airplaneContent},
  {id: 'butterfly', content: butterflyContent},
  {id: 'honey-bee', content: honeyBeeContent},
  {id: 'button-golfer', content: buttonGolferContent},
  {id: 'mobile-radar', content: mobileRadarContent},
];

export const getLesson = (id: string | undefined): LessonMeta | undefined =>
  LESSONS.find((lesson) => lesson.id === id);

export const getLessonComponent = (id: LessonId): ComponentType<LessonProps> => {
  switch (id) {
    case 'airplane':
      return AirplaneLesson;
    case 'butterfly':
      return ButterflyLesson;
    case 'honey-bee':
      return HoneyBeeLesson;
    case 'button-golfer':
      return ButtonGolferLesson;
    case 'mobile-radar':
      return MobileRadarLesson;
  }
};
