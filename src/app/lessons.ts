import {lazy, type ComponentType} from 'react';
import airplaneContent from '../lessons/airplane/content.json';
import butterflyContent from '../lessons/butterfly/content.json';
import buttonGolferContent from '../lessons/button-golfer/content.json';
import mobileRadarContent from '../lessons/mobile-radar/content.json';
import beeContent from '../lessons/bee/content.json';
import elevatorContent from '../lessons/elevator/content.json';
import garageDoorContent from '../lessons/garage-door/content.json';
import banknoteVerifierContent from '../lessons/banknote-verifier/content.json';
import printerContent from '../lessons/printer/content.json';
import conveyorBeltContent from '../lessons/conveyor-belt/content.json';
import electricFanContent from '../lessons/electric-fan/content.json';
import frogTadpoleContent from '../lessons/frog-tadpole/content.json';
import trexFossilContent from '../lessons/trex-fossil/content.json';
import fanL4Content from '../lessons/fan-l4/content.json';
import monsterTruckContent from '../lessons/monster-truck/content.json';
import type {LessonContent} from './types';

const content = (json: unknown): LessonContent => json as LessonContent;

export type LessonId =
  | 'airplane'
  | 'butterfly'
  | 'button-golfer'
  | 'mobile-radar'
  | 'bee'
  | 'elevator'
  | 'garage-door'
  | 'banknote-verifier'
  | 'printer'
  | 'conveyor-belt'
  | 'electric-fan'
  | 'frog-tadpole'
  | 'trex-fossil'
  | 'fan-l4'
  | 'monster-truck';

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
const GarageDoorLesson = lazy(() => import('../lessons/garage-door/GarageDoorLesson'));
const BanknoteVerifierLesson = lazy(() => import('../lessons/banknote-verifier/BanknoteVerifierLesson'));
const PrinterLesson = lazy(() => import('../lessons/printer/PrinterLesson'));
const ConveyorBeltLesson = lazy(() => import('../lessons/conveyor-belt/ConveyorBeltLesson'));
const ElectricFanLesson = lazy(() => import('../lessons/electric-fan/ElectricFanLesson'));
const FrogTadpoleLesson = lazy(() => import('../lessons/frog-tadpole/FrogTadpoleLesson'));
const TrexFossilLesson = lazy(() => import('../lessons/trex-fossil/TrexFossilLesson'));
const FanL4Lesson = lazy(() => import('../lessons/fan-l4/FanL4Lesson'));
const MonsterTruckLesson = lazy(() => import('../lessons/monster-truck/MonsterTruckLesson'));

export const LESSONS: LessonMeta[] = [
  {id: 'airplane', content: content(airplaneContent)},
  {id: 'butterfly', content: content(butterflyContent)},
  {id: 'button-golfer', content: content(buttonGolferContent)},
  {id: 'mobile-radar', content: content(mobileRadarContent)},
  {id: 'bee', content: content(beeContent)},
  {id: 'elevator', content: content(elevatorContent)},
  {id: 'garage-door', content: content(garageDoorContent)},
  {id: 'banknote-verifier', content: content(banknoteVerifierContent)},
  {id: 'printer', content: content(printerContent)},
  {id: 'conveyor-belt', content: content(conveyorBeltContent)},
  {id: 'electric-fan', content: content(electricFanContent)},
  {id: 'frog-tadpole', content: content(frogTadpoleContent)},
  {id: 'trex-fossil', content: content(trexFossilContent)},
  {id: 'fan-l4', content: content(fanL4Content)},
  {id: 'monster-truck', content: content(monsterTruckContent)},
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
    case 'garage-door':
      return GarageDoorLesson;
    case 'banknote-verifier':
      return BanknoteVerifierLesson;
    case 'printer':
      return PrinterLesson;
    case 'conveyor-belt':
      return ConveyorBeltLesson;
    case 'electric-fan':
      return ElectricFanLesson;
    case 'frog-tadpole':
      return FrogTadpoleLesson;
    case 'trex-fossil':
      return TrexFossilLesson;
    case 'fan-l4':
      return FanL4Lesson;
    case 'monster-truck':
      return MonsterTruckLesson;
  }
};
