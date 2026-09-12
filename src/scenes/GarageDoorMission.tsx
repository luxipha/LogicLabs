import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  1.png   family driving home in the car, garage door shut          -> the car can't get in
//  2.png   they reach the garage in the rain, big door is closed     -> door is closed
//  3.png   Dad studies the door, hand on chin                        -> too big to open by hand
//  4.png   Dad pushes the door up with both hands, kids watching     -> can it open by itself?
//  5.png   the team puzzles over the problem                         -> mission challenge
import scene1 from '../assets/garage/1.png';
import scene2 from '../assets/garage/2.png';
import scene3 from '../assets/garage/3.png';
import scene4 from '../assets/garage/4.png';
import scene5 from '../assets/garage/5.png';
import narration from '../assets/garage/ElevenLabs_2026-09-11T16_00_55_Jane - Professional Audiobook Reader_pvc_sp100_s40_sb40_v3.mp3';

const FPS = 30;
const XFADE = 14;

export type GarageSceneDef = {
  image: string;
  duration: number;
  motion:
    | 'zoom-in'
    | 'zoom-out'
    | 'pan-left'
    | 'pan-right'
    | 'pan-up'
    | 'pan-down'
    | 'route';
  overlay?: React.ReactNode;
};

// Scene timings follow the voiceover pauses (43.36s total):
//   0.0–7.3    "the car cannot get in ... it starts to rain"        -> 1.png
//   7.3–14.8   "they reach the garage, but the big door is closed"  -> 2.png
//  14.8–21.0   "he tries to open the door ... big and heavy"        -> 3.png
//  21.0–25.2   "can the door open by itself?"                       -> 4.png
//  25.2–44.3   "your mission ... solve the garage door challenge"   -> 5.png
export const GARAGE_SCENES: GarageSceneDef[] = [
  {
    image: scene1,
    duration: 7.3,
    motion: 'zoom-in',
    overlay: (
      <MissionText
        style="label"
        delay={0.6}
        align="left"
        outerStyle={{
          paddingLeft: 110,
          paddingTop: 70,
          alignItems: 'flex-start',
        }}
      >
        A RAINY DRIVE HOME
      </MissionText>
    ),
  },
  {
    image: scene2,
    duration: 7.5,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        THE GARAGE DOOR IS CLOSED
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 6.2,
    motion: 'zoom-out',
    overlay: (
      <MissionText
        style="heading"
        delay={0.8}
        outerStyle={{paddingBottom: 90}}
      >
        TOO BIG TO OPEN BY HAND
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 4.2,
    motion: 'route',
    overlay: (
      <MissionText style="heading" delay={0.6} outerStyle={{paddingTop: 80}}>
        CAN IT OPEN BY ITSELF?
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 19.1,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.4}
        title={
          <>
            CAN YOU BUILD
            <br />
            THE GARAGE DOOR OPENER?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const GARAGE_SCENE_FRAMES = GARAGE_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = GARAGE_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const GarageDoorMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of GARAGE_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = GARAGE_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={GARAGE_SCENE_FRAMES[index]}
      >
        <KenBurnsImage src={scene.image} />
        {scene.overlay}
      </Camera>
    );
  };

  return (
    <AbsoluteFill style={{backgroundColor: '#0b1b2b'}}>
      <Audio src={narration} volume={1} />

      {starts.map((start, index) => {
        const duration = GARAGE_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === GARAGE_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (
          frame < sequenceFrom ||
          frame >= sequenceFrom + sequenceDuration
        ) {
          return null;
        }

        const opacity =
          index === 0
            ? 1
            : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={GARAGE_SCENES[index].image}
            from={sequenceFrom}
            durationInFrames={sequenceDuration}
          >
            <AbsoluteFill style={{opacity}}>
              {renderScene(index, localFrame)}
              {index > 0 ? <Whoosh at={0} volume={0.1} /> : null}
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
