import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  1.png   the teller greets the children behind towers of notes        -> a huge pile to count
//  2.png   she holds a single note up to the light                      -> is the money real?
//  3.png   hand to her forehead, the pile untouched, the kids aghast    -> checking one by one takes forever
//  4.png   the group sketches a note->machine->tick diagram             -> is there a faster way?
//  5.png   a child feeds a note into a brick-built machine, all cheer   -> the money checker
import scene1 from '../assets/money/1.png';
import scene2 from '../assets/money/2.png';
import scene3 from '../assets/money/3.png';
import scene4 from '../assets/money/4.png';
import scene5 from '../assets/money/5.png';
import narration from '../assets/money/money.mp3';

const FPS = 30;
const XFADE = 14;

export type BanknoteSceneDef = {
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

// Scene timings follow the voiceover pauses (49.32s total):
//   0.0–10.0   "too much money to check ... she needs to count all the money"     -> 1.png
//  10.0–16.9   "she also needs to check if the money is real"                     -> 2.png
//  16.9–33.6   "checking the bank notes one by one, one, two, three ... this is
//               taking too long"                                                  -> 3.png
//  33.6–39.1   "is there a faster way to count and check all this money?"          -> 4.png
//  39.1–49.32  "your mission is to find a machine ... think, build, test."         -> 5.png
export const BANKNOTE_SCENES: BanknoteSceneDef[] = [
  {
    image: scene1,
    duration: 10.0,
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
        A BIG PILE OF MONEY TO COUNT
      </MissionText>
    ),
  },
  {
    image: scene2,
    duration: 6.9,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        IS THE MONEY REAL?
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 16.7,
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.6} outerStyle={{paddingBottom: 90}}>
        CHECKING THEM ONE BY ONE
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 5.5,
    motion: 'pan-left',
    overlay: (
      <MissionText style="heading" delay={0.6} outerStyle={{paddingTop: 80}}>
        IS THERE A FASTER WAY?
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 10.22,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.4}
        title={
          <>
            CAN YOU BUILD
            <br />
            THE MONEY CHECKER?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const BANKNOTE_SCENE_FRAMES = BANKNOTE_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = BANKNOTE_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const BanknoteVerifierMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of BANKNOTE_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = BANKNOTE_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={BANKNOTE_SCENE_FRAMES[index]}
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
        const duration = BANKNOTE_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === BANKNOTE_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={BANKNOTE_SCENES[index].image}
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
