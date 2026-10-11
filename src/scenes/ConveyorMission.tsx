import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  1.png  the classroom at the end of play, one table buried in toys — teddy,
//         ball, train, blocks, dinosaur, car — everyone still cheerful  -> the big clean-up, play time is finished
//  2.png  two round tables, a stack of books on one and toys on the other,
//         shelves behind them across the room                            -> books on one table, toys on another; the shelves are far away
//  3.png  the children carrying things away, a book and a teddy bear      -> the children start cleaning up, one item at a time
//  4.png  the children straining under stacks of books and heavy bins     -> they walk back and do it again and again
//  5.png  worried faces, every bin overflowing, the teacher thinking      -> so many things left, this is taking too long
//  6.png  hand-on-chin thinking, thought bubble of items sliding along
//         arrows                                                         -> can we make something that moves them for us?
//  7.png  a cardboard-tube conveyor built inside a box, moving books and
//         toys with arrows                                               -> move them side to side without carrying by hand
//  8.png  an inclined belt sorting everything into bins, the team cheering -> the mission
import scene1 from '../assets/conveyor/1.png';
import scene2 from '../assets/conveyor/2.png';
import scene3 from '../assets/conveyor/3.png';
import scene4 from '../assets/conveyor/4.png';
import scene5 from '../assets/conveyor/5.png';
import scene6 from '../assets/conveyor/6.png';
import scene7 from '../assets/conveyor/7.png';
import scene8 from '../assets/conveyor/8.png';
import narration from '../assets/conveyor/audio.mp3';

const FPS = 30;
const XFADE = 14;

export type ConveyorSceneDef = {
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

// Scene cuts are aligned to the silent pauses measured in the voiceover
// (56.92s of narration), so no crossfade lands in the middle of a word.
// Each cut sits at the end of a pause long enough to hold the 14-frame fade:
//   0.00– 6.90  "the big classroom clean-up. play time is finished. the
//                classroom is full of things"  (pause 6.34–6.92)       -> 1.png
//   6.90–16.17  "there are books on one table and toys on another. but the
//                bookshelf and toy shelf are all the way across the room"
//                                              (pause 14.96–16.32)     -> 2.png
//  16.17–22.13  "the children start cleaning up. one child carries a book.
//                another carries a toy"        (pause 21.28–22.28)     -> 3.png
//  22.13–27.30  "then they walk back and do it again and again"
//                                              (pause 26.15–27.43)     -> 4.png
//  27.30–35.87  "but there are still so many things left. this is taking
//                too long"                     (pause 34.48–36.01)     -> 5.png
//  35.87–43.13  "the teacher looks at all the books and toys and asks, can we
//                make something that moves them for us?"
//                                              (pause 42.07–43.29)     -> 6.png
//  43.13–51.50  "your mission is move the classroom things from one side to
//                the other without carrying every item by hand"
//                                              (pause 50.83–51.66)     -> 7.png
//  51.50–58.10  "think, build, test. can your team make classroom clean up
//                faster?"                                             -> 8.png
export const CONVEYOR_SCENES: ConveyorSceneDef[] = [
  {
    image: scene1,
    duration: 6.9,
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
          THE BIG CLEAN-UP
        </MissionText>
        <MissionText style="heading" delay={2.8} outerStyle={{paddingBottom: 90}}>
          PLAY TIME IS FINISHED
        </MissionText>
      </>
    ),
  },
  {
    image: scene2,
    duration: 9.27,
    motion: 'pan-right',
    overlay: (
      <>
        <MissionText style="heading" delay={0.3} outerStyle={{paddingBottom: 90}}>
          BOOKS ON ONE TABLE • TOYS ON ANOTHER
        </MissionText>
        <MissionText style="heading" delay={4.3} outerStyle={{paddingTop: 80}}>
          THE SHELVES ARE ACROSS THE ROOM
        </MissionText>
      </>
    ),
  },
  {
    image: scene3,
    duration: 5.96,
    motion: 'zoom-out',
    overlay: (
      <>
        <MissionText style="heading" delay={0.3} outerStyle={{paddingBottom: 90}}>
          THE CHILDREN START CLEANING UP
        </MissionText>
        <MissionText style="heading" delay={2.2} outerStyle={{paddingTop: 80}}>
          ONE CARRIES A BOOK • ANOTHER A TOY
        </MissionText>
      </>
    ),
  },
  {
    image: scene4,
    duration: 5.17,
    motion: 'pan-left',
    overlay: (
      <MissionText style="heading" delay={1.2} outerStyle={{paddingBottom: 90}}>
        THEY DO IT AGAIN AND AGAIN
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 8.57,
    motion: 'zoom-in',
    overlay: (
      <>
        <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
          STILL SO MANY THINGS LEFT
        </MissionText>
        <MissionText style="heading" delay={5.0} outerStyle={{paddingTop: 80}}>
          {'"THIS IS TAKING TOO LONG"'}
        </MissionText>
      </>
    ),
  },
  {
    image: scene6,
    duration: 7.26,
    motion: 'zoom-out',
    overlay: (
      <>
        <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
          THE TEACHER LOOKS AT THE BOOKS AND TOYS
        </MissionText>
        <MissionText style="heading" delay={3.7} outerStyle={{paddingTop: 80}}>
          CAN WE MAKE SOMETHING THAT MOVES THEM?
        </MissionText>
      </>
    ),
  },
  {
    image: scene7,
    duration: 8.37,
    motion: 'pan-right',
    overlay: (
      <>
        <MissionText style="heading" delay={0.5} outerStyle={{paddingBottom: 90}}>
          MOVE THE CLASSROOM THINGS
        </MissionText>
        <MissionText style="heading" delay={5.0} outerStyle={{paddingTop: 80}}>
          WITHOUT CARRYING EVERY ITEM BY HAND
        </MissionText>
      </>
    ),
  },
  {
    image: scene8,
    duration: 6.6,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.5}
        title={
          <>
            CAN YOUR TEAM MAKE
            <br />
            CLEAN-UP FASTER?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const CONVEYOR_SCENE_FRAMES = CONVEYOR_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = CONVEYOR_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const ConveyorMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of CONVEYOR_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = CONVEYOR_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={CONVEYOR_SCENE_FRAMES[index]}
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
        const duration = CONVEYOR_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === CONVEYOR_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={CONVEYOR_SCENES[index].image}
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
