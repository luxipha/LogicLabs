import {lazy, type ComponentType} from 'react';
import airplaneContent from '../lessons/airplane/content.json';
import butterflyContent from '../lessons/butterfly/content.json';
import buttonGolferContent from '../lessons/button-golfer/content.json';
import mobileRadarContent from '../lessons/mobile-radar/content.json';
import beeContent from '../lessons/bee/content.json';
import elevatorContent from '../lessons/elevator/content.json';
import type {LessonContent} from './types';

export type LessonId =
  | 'airplane'
  | 'butterfly'
  | 'button-golfer'
  | 'mobile-radar'
  | 'bee'
  | 'elevator';

export type LessonMeta = {
  id: LessonId;
  content: LessonContent;
};

export type LessonProps = {
  onHome?: () => void;
  onComplete?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
};

// Lazy components defined at module scope — React requires a stable lazy
// component reference; creating one per render breaks Suspense.
const AirplaneLesson = lazy(() => import('../lessons/airplane/AirplaneLesson'));
const ButterflyLesson = lazy(() => import('../lessons/butterfly/ButterflyLesson'));
const ButtonGolferLesson = lazy(() => import('../lessons/button-golfer/ButtonGolferLesson'));
const MobileRadarLesson = lazy(() => import('../lessons/mobile-radar/MobileRadarLesson'));
const BeeLesson = lazy(() => import('../lessons/bee/BeeLesson'));
const ElevatorLesson = lazy(() => import('../lessons/elevator/ElevatorLesson'));

export const LESSONS: LessonMeta[] = [
  {id: 'airplane', content: airplaneContent},
  {id: 'butterfly', content: butterflyContent},
  {id: 'button-golfer', content: buttonGolferContent},
  {id: 'mobile-radar', content: mobileRadarContent},
  {id: 'bee', content: beeContent},
  {id: 'elevator', content: elevatorContent},
];

export const getLesson = (id: string | undefined): LessonMeta | undefined =>
  LESSONS.find((lesson) => lesson.id === id);

export const getLessonComponent = (id: LessonId): ComponentType<LessonProps> => {
  switch (id) {
    case 'airplane':
      return AirplaneLesson;
    case 'butterfly':
      return ButterflyLesson;
    case 'button-golfer':
      return ButtonGolferLesson;
    case 'mobile-radar':
      return MobileRadarLesson;
    case 'bee':
      return BeeLesson;
    case 'elevator':
      return ElevatorLesson;
  }
};
