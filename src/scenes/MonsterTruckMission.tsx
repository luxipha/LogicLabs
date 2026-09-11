import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Scene images (1672x941 source, displayed 16:9 cover)
// Story mapping (verified from artwork + narration):
//  1.png the delivery truck carrying chairs and tables — mission intro
//  2.png the rough country road ahead, full of bumps and rocks
//  3.png the truck gets stuck on the rocky road, wheels too small
//  4.png the children study the truck and ask how to help it across
//  5.png the team plans bigger wheels — "ROUGH ROAD CHALLENGE" finish
import scene1 from '../assets/monster_truck/1.png';
import scene2 from '../assets/monster_truck/2.png';
import scene3 from '../assets/monster_truck/3.png';
import scene4 from '../assets/monster_truck/4.png';
import scene5 from '../assets/monster_truck/5.png';
import narration from '../assets/monster_truck/ElevenLabs_2026-09-10T04_28_29_Jane - Professional Audiobook Reader_pvc_sp100_s40_sb40_v3.mp3';

const FPS = 30;
const XFADE = 14; // frames — soft crossfade per project taste

export type MonsterTruckSceneDef = {
  image: string;
  duration: number; // seconds
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

// Scene timings locked to the voiceover (50.16s total) — cuts land on
// narration pauses. Narration beats (from whisper word timestamps) -> image:
//   0.0–5.9    "The rough road challenge. A delivery truck is carrying chairs and tables."   -> 1.png
//   5.9–14.8   "It needs to cross a rough road... full of bumps, rocks, and small hills."    -> 2.png
//  14.8–26.3   "The truck starts moving... gets stuck. Its wheels are too small."           -> 3.png
//  26.3–38.6   "The children look and ask 'How can we help it across?' Your mission is to build a truck that can climb over rocks." -> 4.png
//  38.6–50.6   "What should we change? Bigger wheels? Taller? Think, build, test. Can your team conquer the bad road?" -> 5.png
export const MONSTER_TRUCK_SCENES: MonsterTruckSceneDef[] = [
  {
    image: scene1,
    duration: 5.9,
    motion: 'zoom-in',
    overlay: (
      <MissionText style="label" delay={0.6} align="left" outerStyle={{paddingLeft: 110, paddingTop: 70, alignItems: 'flex-start'}}>
        THE ROUGH ROAD CHALLENGE
      </MissionText>
    ),
  },
  {
    image: scene2,
    duration: 8.9, // 5.9 -> 14.8
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        BUMPS, ROCKS AND SMALL HILLS
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 11.5, // 14.8 -> 26.3
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingBottom: 90}}>
        THE TRUCK GETS STUCK
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 12.3, // 26.3 -> 38.6
    motion: 'route',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        HOW CAN WE HELP IT ACROSS?
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 12.0, // 38.6 -> 50.6 (hold past narration end)
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.4}
        title={
          <>
            CAN YOUR TEAM CONQUER
            <br />
            THE BAD ROAD?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const MONSTER_TRUCK_SCENE_FRAMES = MONSTER_TRUCK_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = MONSTER_TRUCK_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const MonsterTruckMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of MONSTER_TRUCK_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = MONSTER_TRUCK_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={MONSTER_TRUCK_SCENE_FRAMES[index]}
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
        const duration = MONSTER_TRUCK_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === MONSTER_TRUCK_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={MONSTER_TRUCK_SCENES[index].image}
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