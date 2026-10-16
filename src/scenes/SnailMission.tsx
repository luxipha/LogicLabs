import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  1.png  teacher and three children with backpacks walking a flower-lined
//         garden path, school building behind                    -> the children walk the garden
//  2.png  the group crouches in a sunny garden, watching a snail
//         crawl over the soil among strawberry plants            -> look! something is moving
//  3.png  the four crouch closer, delighted, studying the snail   -> can a house move?
//  4.png  close-up of the snail gliding across bare soil, spiral
//         shell and green foliage behind                         -> a tiny head comes out
//  5.png  tighter close-up of the snail's head, eye stalks raised -> it slides forward, very slowly
//  6.png  the children lie in the garden as a thought bubble with a
//         big question mark floats over them                     -> what animal carries its house?
import scene1 from '../assets/snail/1.png';
import scene2 from '../assets/snail/2.png';
import scene3 from '../assets/snail/3.png';
import scene4 from '../assets/snail/4.png';
import scene5 from '../assets/snail/5.png';
import scene6 from '../assets/snail/6.png';
import narration from '../assets/snail/snail.mp3';

const FPS = 30;
const XFADE = 14;

export type SnailSceneDef = {
  image: string;
  duration: number;
  motion:
    | 'zoom-in'
    | 'zoom-out'
    | 'pan-left'
    | 'pan-right'
    | 'pan-up'
    | 'pan-down'
    | 'pan-right-slight'
    | 'pan-left-slight'
    | 'route'
    | 'static';
  overlay?: React.ReactNode;
};

// Scene cuts sit on silent pauses measured in the voiceover (44.75s of
// narration), so no crossfade lands on a word. Each cut is the end of a pause
// backed off by ~0.15s, and the 14-frame (0.467s) fade fits fully inside it:
//   0.00– 7.27  "the tiny house. Warm. Curious. The children are walking in
//                the school garden"                    (pause 6.74–7.42)   -> 1.png
//   7.27–14.90  "suddenly, one child points to the ground. Look! Something
//                small is moving near the flowers"      (pause 14.41–14.99) -> 2.png
//  14.90–24.31  "it looks like a tiny round house. The children stop. Can a
//                house move? They look closer"         (pause 23.51–24.46) -> 3.png
//  24.31–30.47  "a tiny head comes out. Then, two little feelers appear"
//                                                      (pause 29.41–30.62) -> 4.png
//  30.47–35.90  "the little animal starts to slide forward, very slowly"
//                                                      (pause 34.57–36.05) -> 5.png
//  35.90–45.30  "what animal carries its house on its back? Look at the
//                clues. Think carefully. Can you guess the mystery animal?"
//                                                                         -> 6.png
export const SNAIL_SCENES: SnailSceneDef[] = [
  {
    image: scene1,
    duration: 7.27,
    motion: 'zoom-in',
    overlay: (
      <>
        <MissionText
          style="label"
          delay={0.4}
          align="left"
          outerStyle={{
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            paddingLeft: 110,
            paddingTop: 70,
          }}
        >
          THE SNAIL
        </MissionText>
        <MissionText style="heading" delay={3.3} outerStyle={{paddingBottom: 90}}>
          WALKING IN THE SCHOOL GARDEN
        </MissionText>
      </>
    ),
  },
  {
    image: scene2,
    duration: 7.63,
    motion: 'pan-right',
    overlay: (
      <>
        <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
          LOOK! SOMETHING IS MOVING
        </MissionText>
        <MissionText style="heading" delay={4.8} outerStyle={{paddingTop: 80}}>
          NEAR THE FLOWERS
        </MissionText>
      </>
    ),
  },
  {
    image: scene3,
    duration: 9.41,
    motion: 'zoom-out',
    overlay: (
      <>
        <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
          IT LOOKS LIKE A TINY ROUND HOUSE
        </MissionText>
        <MissionText style="heading" delay={5.6} outerStyle={{paddingTop: 80}}>
          CAN A HOUSE MOVE?
        </MissionText>
      </>
    ),
  },
  {
    image: scene4,
    duration: 6.16,
    motion: 'pan-left',
    overlay: (
      <>
        <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
          A TINY HEAD COMES OUT
        </MissionText>
        <MissionText style="heading" delay={2.4} outerStyle={{paddingTop: 80}}>
          TWO LITTLE FEELERS APPEAR
        </MissionText>
      </>
    ),
  },
  {
    image: scene5,
    duration: 5.43,
    motion: 'pan-up',
    overlay: (
      <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
        IT SLIDES FORWARD, VERY SLOWLY
      </MissionText>
    ),
  },
  {
    image: scene6,
    duration: 9.4,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.5}
        title={
          <>
            WHAT ANIMAL CARRIES
            <br />
            ITS HOUSE ON ITS BACK?
          </>
        }
        tagline="Look • Think • Guess"
      />
    ),
  },
];

export const SNAIL_SCENE_FRAMES = SNAIL_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = SNAIL_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const SnailMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of SNAIL_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = SNAIL_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={SNAIL_SCENE_FRAMES[index]}
      >
        <KenBurnsImage src={scene.image} />
        {scene.overlay}
      </Camera>
    );
  };

  return (
    <AbsoluteFill style={{backgroundColor: '#08111c'}}>
      <Audio src={narration} volume={1} />

      {starts.map((start, index) => {
        const duration = SNAIL_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === SNAIL_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={SNAIL_SCENES[index].image}
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
