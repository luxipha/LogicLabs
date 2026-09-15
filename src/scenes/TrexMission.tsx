import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  1.png   a mystery box with a big "?" arrives in class      -> something strange is here
//  2.png   the class opens the box and finds old bones         -> very old bones
//  3.png   the bones are laid out, question marks everywhere   -> nobody knows the animal
//  4.png   teacher points at a tooth, kids use a magnifier     -> big legs, tiny arms, sharp teeth
//  5.png   "FINAL MISSION!" the team celebrates                -> solve the fossil mystery
import scene1 from '../assets/trex/1.png';
import scene2 from '../assets/trex/2.png';
import scene3 from '../assets/trex/3.png';
import scene4 from '../assets/trex/4.png';
import scene5 from '../assets/trex/5.png';
import narration from '../assets/trex/TREX.mp3';

const FPS = 30;
const XFADE = 14;

export type TrexSceneDef = {
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

// Scene timings follow the voiceover pauses (56.08s total):
//   0.0–7.3    "The mystery fossil box ... a strange box arrives at school"  -> 1.png
//   7.3–14.2   "Inside are some very old bones"                              -> 2.png
//  14.2–18.6   "nobody knows what animal they came from ... look closely"    -> 3.png
//  18.6–33.2   "big leg bones, tiny arm bones ... a mystery to solve"        -> 4.png
//  33.2–56.08  "Your mission is to study the fossil clues ..."              -> 5.png
export const TREX_SCENES: TrexSceneDef[] = [
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
        A STRANGE BOX ARRIVES
      </MissionText>
    ),
  },
  {
    image: scene2,
    duration: 6.9,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        VERY OLD BONES
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 4.4,
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.6} outerStyle={{paddingBottom: 90}}>
        WHAT ANIMAL IS IT?
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 14.6,
    motion: 'pan-left',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        BIG LEGS • TINY ARMS • SHARP TEETH
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 22.88,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.4}
        title={
          <>
            CAN YOU SOLVE
            <br />
            THE FOSSIL MYSTERY?
          </>
        }
        tagline="Think • Discover • Solve"
      />
    ),
  },
];

export const TREX_SCENE_FRAMES = TREX_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = TREX_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const TrexMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of TREX_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = TREX_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={TREX_SCENE_FRAMES[index]}
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
        const duration = TREX_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === TREX_SCENES.length - 1 ? duration : duration + XFADE;
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
            key={TREX_SCENES[index].image}
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
