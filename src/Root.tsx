import React from 'react';
import {Composition} from 'remotion';
import {MotionDemo} from './scenes/MotionDemo';
import {PlaneDemo} from './scenes/PlaneDemo';
import {PlaneAssemblyLesson} from './scenes/PlaneAssemblyLesson';
import {PlaneAssemblyPlayground} from './scenes/PlaneAssemblyPlayground';
import {LysSonMission, TOTAL_FRAMES} from './scenes/LysSonMission';
import {AppleMission, TOTAL_FRAMES as APPLE_FRAMES} from './scenes/AppleMission';
import {RadarMission, TOTAL_FRAMES as RADAR_FRAMES} from './scenes/RadarMission';
import {GolfMission, TOTAL_FRAMES as GOLF_FRAMES} from './scenes/GolfMission';
import {ElevatorMission, TOTAL_FRAMES as ELEVATOR_FRAMES} from './scenes/ElevatorMission';
import {FrogMission, TOTAL_FRAMES as FROG_FRAMES} from './scenes/FrogMission';
import {MonsterTruckMission, TOTAL_FRAMES as MONSTER_TRUCK_FRAMES} from './scenes/MonsterTruckMission';
import {GarageDoorMission, TOTAL_FRAMES as GARAGE_DOOR_FRAMES} from './scenes/GarageDoorMission';

const LYS_DURATION = TOTAL_FRAMES;
const APPLE_DURATION = APPLE_FRAMES;
const RADAR_DURATION = RADAR_FRAMES;
const GOLF_DURATION = GOLF_FRAMES;
const ELEVATOR_DURATION = ELEVATOR_FRAMES;
const FROG_DURATION = FROG_FRAMES;
const MONSTER_TRUCK_DURATION = MONSTER_TRUCK_FRAMES;
const GARAGE_DOOR_DURATION = GARAGE_DOOR_FRAMES;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LysSonMission"
        component={LysSonMission}
        durationInFrames={LYS_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AppleMission"
        component={AppleMission}
        durationInFrames={APPLE_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="RadarMission"
        component={RadarMission}
        durationInFrames={RADAR_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="GolfMission"
        component={GolfMission}
        durationInFrames={GOLF_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ElevatorMission"
        component={ElevatorMission}
        durationInFrames={ELEVATOR_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FrogMission"
        component={FrogMission}
        durationInFrames={FROG_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MonsterTruckMission"
        component={MonsterTruckMission}
        durationInFrames={MONSTER_TRUCK_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="GarageDoorMission"
        component={GarageDoorMission}
        durationInFrames={GARAGE_DOOR_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MotionDemo"
        component={MotionDemo}
        durationInFrames={9 * 30}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PlaneDemo"
        component={PlaneDemo}
        durationInFrames={12 * 30}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PlaneAssemblyLesson"
        component={PlaneAssemblyLesson}
        durationInFrames={10 * 30}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PlaneAssemblyPlayground"
        component={PlaneAssemblyPlayground}
        durationInFrames={60 * 30}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
