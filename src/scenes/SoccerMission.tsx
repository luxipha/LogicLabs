import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  1.png   three children race across the field, goal in the distance   -> the children play soccer
//  2.png   a boy strikes the ball, it lifts toward the open goal         -> the ball rolls closer
//  3.png   the three freeze, ball sailing into the net                   -> nobody guards the goal
//  4.png   shock as the ball hits the back of the net                    -> goal!
//  5.png   hands on chins, studying the goal                             -> who can stop the ball?
import scene1 from '../assets/soccer/1.png';
import scene2 from '../assets/soccer/2.png';
import scene3 from '../assets/soccer/3.png';
import scene4 from '../assets/soccer/4.png';
import scene5 from '../assets/soccer/5.png';
import narration from '../assets/soccer/enpty goal.mp3';

const FPS = 30;
const XFADE = 14;

export type SoccerSceneDef = {
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

// Scene timings follow the voiceover pauses (41.09s total):
//   0.0–8.4    "the children are playing soccer ... one team has the ball"       -> 1.png
//   8.4–13.1   "a player kicks it toward the goal ... closer and closer"          -> 2.png
//  13.1–20.1   "nobody is standing in front of the goal ... the ball goes in"     -> 3.png
//  20.1–25.6   "goal! the children"                                              -> 4.png
//  25.6–41.09  "who can stop the ball ... think, build, test."                    -> 5.png
export const SOCCER_SCENES: SoccerSceneDef[] = [
  {
    image: scene1,
    duration: 8.4,
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
        A SOCCER GAME ON THE FIELD
      </MissionText>
    ),
  },
  {
    image: scene2,
    duration: 4.7,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        THE BALL ROLLS CLOSER
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 7.0,
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.6} outerStyle={{paddingBottom: 90}}>
        NOBODY GUARDS THE GOAL
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 5.5,
    motion: 'pan-left',
    overlay: (
      <MissionText style="heading" delay={0.5} outerStyle={{paddingTop: 80}}>
        GOAL!
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 15.49,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.4}
        title={
          <>
            CAN YOU BUILD
            <br />
            THE SOCCER KICKER?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const SOCCER_SCENE_FRAMES = SOCCER_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = SOCCER_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const SoccerMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of SOCCER_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = SOCCER_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={SOCCER_SCENE_FRAMES[index]}
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
        const duration = SOCCER_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === SOCCER_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={SOCCER_SCENES[index].image}
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
