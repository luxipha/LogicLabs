import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  1.png   two children side by side on a level seesaw at the playground   -> a game that will not balance
//  2.png   the boy sinks low, the girl rises high                          -> one goes down, one goes up
//  3.png   both sit hands-on-chin, the board still tilted                  -> they try again, still uneven
//  4.png   thought bubbles: a level seesaw (=) beside a rock vs teddy (?)   -> how do we make both sides level?
//  5.png   chalkboards "Think, Test, Try Together"                         -> the mission
import scene1 from '../assets/seesaw/1.png';
import scene2 from '../assets/seesaw/2.png';
import scene3 from '../assets/seesaw/3.png';
import scene4 from '../assets/seesaw/4.png';
import scene5 from '../assets/seesaw/5.png';
import narration from '../assets/seesaw/seesaw.mp3';

const FPS = 30;
const XFADE = 14;

export type SeesawSceneDef = {
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

// Scene timings follow the voiceover pauses (42.03s total):
//   0.0–7.5    "the seesaw won't balance ... two children go to the playground"   -> 1.png
//   7.5–17.2   "they sit on a seesaw ... one goes down, the other goes up"        -> 2.png
//  17.2–21.5   "they try again, but the seesaw still does not balance"            -> 3.png
//  21.5–26.4   "the children look at the seesaw and ask, how can we make both
//               sides stay level?"                                                -> 4.png
//  26.4–42.03  "your mission is to find a way to balance the seesaw ... test."     -> 5.png
export const SEESAW_SCENES: SeesawSceneDef[] = [
  {
    image: scene1,
    duration: 7.5,
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
        A TRIP TO THE PLAYGROUND
      </MissionText>
    ),
  },
  {
    image: scene2,
    duration: 9.7,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        ONE GOES UP • ONE GOES DOWN
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 4.3,
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.6} outerStyle={{paddingBottom: 90}}>
        IT STILL WON&apos;T BALANCE
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 4.9,
    motion: 'pan-left',
    overlay: (
      <MissionText style="heading" delay={0.6} outerStyle={{paddingTop: 80}}>
        HOW DO WE MAKE BOTH SIDES LEVEL?
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 15.63,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.4}
        title={
          <>
            CAN YOU BALANCE
            <br />
            THE SEESAW?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const SEESAW_SCENE_FRAMES = SEESAW_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = SEESAW_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const SeesawMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of SEESAW_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = SEESAW_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={SEESAW_SCENE_FRAMES[index]}
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
        const duration = SEESAW_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === SEESAW_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={SEESAW_SCENES[index].image}
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
