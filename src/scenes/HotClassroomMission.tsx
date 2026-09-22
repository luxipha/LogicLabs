import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  1.png   the teacher and three children smiling on the class rug          -> the hot classroom
//  2.png   the same group wilting, fanning and wiping their foreheads       -> the children are sitting
//  3.png   the room with a thermometer pushed to the top of its scale       -> they feel hot, very hot
//  4.png   a child holding a sheet of paper up, back to the class           -> one child waves a book
//  5.png   everyone bright and cheerful, "Moving air helps!" on the board   -> ah, that feels better
//  6.png   a child with a book, a thought bubble showing an aching arm      -> after a while, my arm is tired
//  7.png   the board filled with ideas: fan, pinwheel, scoop               -> how can we make the air move?
//  8.png   the craft table loaded with building materials                   -> the mission
import scene1 from '../assets/fan/1.png';
import scene2 from '../assets/fan/2.png';
import scene3 from '../assets/fan/3.png';
import scene4 from '../assets/fan/4.png';
import scene5 from '../assets/fan/5.png';
import scene6 from '../assets/fan/6.png';
import scene7 from '../assets/fan/7.png';
import scene8 from '../assets/fan/8.png';
import narration from '../assets/fan/fan.mp3';

const FPS = 30;
const XFADE = 14;

export type HotClassroomSceneDef = {
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

// Scene timings follow the voiceover pauses (53.63s total):
//   0.0–5.04   "the hot classroom ... it is a very hot day at school"                -> 1.png
//   5.04–7.60  "the children are sitting in the classroom"                           -> 2.png
//   7.60–10.60 "they feel hot, very hot"                                             -> 3.png
//  10.60–15.20 "one child waves a book, woosh, woosh"                                -> 4.png
//  15.20–21.12 "a little air moves across their face ... ah, that feels better"      -> 5.png
//  21.12–29.12 "another child tries too, but after a while, my arm is tired"         -> 6.png
//  29.12–39.19 "how can we make the air move without using our hands? ... more wind?" -> 7.png
//  39.19–53.63 "your mission is to find a way to move the air ... think, build, test" -> 8.png
export const HOT_CLASSROOM_SCENES: HotClassroomSceneDef[] = [
  {
    image: scene1,
    duration: 5.04,
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
        THE HOT CLASSROOM
      </MissionText>
    ),
  },
  {
    image: scene2,
    duration: 2.56,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={0.4} outerStyle={{paddingTop: 80}}>
        A VERY HOT DAY AT SCHOOL
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 3,
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
        THEY FEEL HOT • VERY HOT
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 4.6,
    motion: 'pan-left',
    overlay: (
      <MissionText style="heading" delay={0.5} outerStyle={{paddingTop: 80}}>
        ONE CHILD WAVES A BOOK
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 5.92,
    motion: 'zoom-in',
    overlay: (
      <MissionText style="heading" delay={0.6} outerStyle={{paddingBottom: 90}}>
        AH, THAT FEELS BETTER
      </MissionText>
    ),
  },
  {
    image: scene6,
    duration: 8,
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={1.8} outerStyle={{paddingTop: 80}}>
        AFTER A WHILE, MY ARM IS TIRED
      </MissionText>
    ),
  },
  {
    image: scene7,
    duration: 10.07,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={1.4} outerStyle={{paddingBottom: 90}}>
        HOW CAN WE MOVE THE AIR?
      </MissionText>
    ),
  },
  {
    image: scene8,
    duration: 14.44,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={1.2}
        title={
          <>
            CAN YOU MOVE THE AIR
            <br />
            AND COOL THE CLASSROOM?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const HOT_CLASSROOM_SCENE_FRAMES = HOT_CLASSROOM_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = HOT_CLASSROOM_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const HotClassroomMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of HOT_CLASSROOM_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = HOT_CLASSROOM_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={HOT_CLASSROOM_SCENE_FRAMES[index]}
      >
        <KenBurnsImage src={scene.image} />
        {scene.overlay}
      </Camera>
    );
  };

  return (
    <AbsoluteFill style={{backgroundColor: '#2a1a0b'}}>
      <Audio src={narration} volume={1} />

      {starts.map((start, index) => {
        const duration = HOT_CLASSROOM_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === HOT_CLASSROOM_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={HOT_CLASSROOM_SCENES[index].image}
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
