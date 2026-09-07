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

// Story mapping (verified from the artwork and narration):
//  1.png    the children arrive at a small pond and discover frog eggs
//  2.png    they watch the eggs and wait for baby frogs to appear
//  3.png    the eggs hatch into tiny swimmers with long tails
//  4.png    the children wonder where the baby frogs went
//  5.png    the team begins its pond-mystery exploration
import scene1 from '../assets/frog/1.png';
import scene2 from '../assets/frog/2.png';
import scene3 from '../assets/frog/3.png';
import scene4 from '../assets/frog/4.png';
import scene5 from '../assets/frog/5.png';
import narration from '../assets/frog/ElevenLabs_2026-09-07T05_01_38_Jane - Professional Audiobook Reader_pvc_sp100_s40_sb40_v3.mp3';

const FPS = 30;
const XFADE = 14;

export type FrogSceneDef = {
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

// Scene timings follow the voiceover pauses (51.44s total):
//   0.0–7.0    children visit the pond                              -> 1.png
//   7.0–18.0   they discover eggs and wait                          -> 2.png
//  18.0–29.2   the eggs hatch into long-tailed swimmers             -> 3.png
//  29.2–41.2   "Where did the baby frogs go?"                       -> 4.png
//  41.2–52.0   discover how the swimmers change as they grow        -> 5.png
export const FROG_SCENES: FrogSceneDef[] = [
  {
    image: scene1,
    duration: 7,
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
        A MORNING AT THE POND
      </MissionText>
    ),
  },
  {
    image: scene2,
    duration: 11,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        TINY EGGS IN THE WATER
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 11.2,
    motion: 'zoom-out',
    overlay: (
      <MissionText
        style="heading"
        delay={0.8}
        outerStyle={{paddingBottom: 90}}
      >
        THE EGGS HAVE HATCHED!
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 12,
    motion: 'route',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        WHERE DID THE BABY FROGS GO?
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 10.8,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.4}
        title={
          <>
            CAN YOUR TEAM SOLVE
            <br />
            THE POND MYSTERY?
          </>
        }
        tagline="Watch • Discover • Grow"
      />
    ),
  },
];

export const FROG_SCENE_FRAMES = FROG_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = FROG_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const FrogMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of FROG_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = FROG_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={FROG_SCENE_FRAMES[index]}
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
        const duration = FROG_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === FROG_SCENES.length - 1 ? duration : duration + XFADE;
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
            key={FROG_SCENES[index].image}
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
