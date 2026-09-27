import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (narration beats; artwork supplied as 1–6.jpg):
//  1.jpg  teacher and three children walking a path beside a calm pond
//         with lily pads, reeds and a footbridge                          -> something is moving in the water
//  2.jpg  the quiet pond, everything calm and still                       -> the water is still, then splash!
//  3.jpg  the children stop and peer into the pond                        -> something moves under the water
//  4.jpg  ripples spreading out across the pond                           -> ripples, then two eyes above the water
//  5.jpg  the long shape and strong tail gliding under the surface        -> the eyes stay still, a long shape
//  6.jpg  the mystery unresolved — who is hiding in the pond?             -> the mission question
import scene1 from '../assets/alligator/1.jpg';
import scene2 from '../assets/alligator/2.jpg';
import scene3 from '../assets/alligator/3.jpg';
import scene4 from '../assets/alligator/4.jpg';
import scene5 from '../assets/alligator/5.jpg';
import scene6 from '../assets/alligator/6.jpg';
import narration from '../assets/alligator/alligatot.mp3';

const FPS = 30;
const XFADE = 14;

export type AlligatorSceneDef = {
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

// Scene cuts sit on the silent pauses measured in the voiceover (68.21s of
// narration), each inside a pause long enough to hold the 14-frame crossfade:
//   0.00– 8.11  "logic labs narration ... something is moving in the water ...
//                the children are walking beside a quiet pond"
//                                              (pause 7.48–8.26)        -> 1.jpg
//   8.11–15.40  "the water is still ... everything looks peaceful. then
//                suddenly, splash!"            (pause 14.78–15.55)      -> 2.jpg
//  15.40–24.41  "something moves under the water. the children stop. they
//                look carefully. did you see that?"
//                                              (pause 23.33–24.56)      -> 3.jpg
//  24.41–34.59  "the water moves again. ripples spread across the pond.
//                then two eyes appear above the water"
//                                              (pause 33.26–34.74)      -> 4.jpg
//  34.59–52.49  "the eyes stay very still ... they slowly move away ... a
//                long shape under the water and a strong tail behind it"
//                                              (pause 51.14–52.64)      -> 5.jpg
//  52.49–68.37  "what animal could be hiding there? your mission is to look
//                at the clues ... can your team solve the mystery?"       -> 6.jpg
export const ALLIGATOR_SCENES: AlligatorSceneDef[] = [
  {
    image: scene1,
    duration: 8.11,
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
          THE ALLIGATOR
        </MissionText>
        <MissionText style="heading" delay={3.6} outerStyle={{paddingBottom: 90}}>
          SOMETHING IS MOVING IN THE WATER
        </MissionText>
      </>
    ),
  },
  {
    image: scene2,
    duration: 7.29,
    motion: 'pan-right',
    overlay: (
      <>
        <MissionText style="heading" delay={1} outerStyle={{paddingBottom: 90}}>
          THE WATER IS STILL
        </MissionText>
        <MissionText style="alert" delay={4.6} outerStyle={{paddingTop: 80}}>
          THEN — SPLASH!
        </MissionText>
      </>
    ),
  },
  {
    image: scene3,
    duration: 9.01,
    motion: 'zoom-out',
    overlay: (
      <>
        <MissionText style="heading" delay={0.6} outerStyle={{paddingBottom: 90}}>
          SOMETHING MOVES UNDER THE WATER
        </MissionText>
        <MissionText style="alert" delay={7.3} outerStyle={{paddingTop: 80}}>
          DID YOU SEE THAT?
        </MissionText>
      </>
    ),
  },
  {
    image: scene4,
    duration: 10.18,
    motion: 'pan-left',
    overlay: (
      <>
        <MissionText style="heading" delay={2.2} outerStyle={{paddingBottom: 90}}>
          RIPPLES SPREAD ACROSS THE POND
        </MissionText>
        <MissionText style="heading" delay={6.6} outerStyle={{paddingTop: 80}}>
          TWO EYES APPEAR ABOVE THE WATER
        </MissionText>
      </>
    ),
  },
  {
    image: scene5,
    duration: 17.9,
    motion: 'zoom-in',
    overlay: (
      <>
        <MissionText style="heading" delay={1.4} outerStyle={{paddingBottom: 90}}>
          THE EYES STAY VERY STILL
        </MissionText>
        <MissionText style="heading" delay={10} outerStyle={{paddingTop: 80}}>
          A LONG SHAPE AND A STRONG TAIL
        </MissionText>
      </>
    ),
  },
  {
    image: scene6,
    duration: 15.88,
    motion: 'zoom-out',
    overlay: (
      <FinalCard
        showAt={0.5}
        title={
          <>
            WHAT ANIMAL IS HIDING
            <br />
            IN THE POND?
          </>
        }
        tagline="Look • Think • Discover"
      />
    ),
  },
];

export const ALLIGATOR_SCENE_FRAMES = ALLIGATOR_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = ALLIGATOR_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const AlligatorMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of ALLIGATOR_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = ALLIGATOR_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={ALLIGATOR_SCENE_FRAMES[index]}
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
        const duration = ALLIGATOR_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === ALLIGATOR_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={ALLIGATOR_SCENES[index].image}
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
