import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  1.png  teacher and three children at a classroom table, smiling as she
//         points at a picture book                              -> a normal day at school
//  2.png  the same class alarmed, pointing right; smoke drifts into the
//         hallway through the open doorway                      -> suddenly, smoke in the hallway
//  3.png  a boy reaches up and presses the red fire alarm         -> press the fire alarm
//  4.png  the teacher leads the children out of the classroom      -> everyone leaves quickly and safely
//  5.png  the group stands outside, looking back at the school
//         with flames and smoke rising from the roof            -> smoke is coming from the building
//  6.png  the four think, a thought bubble shows a phone with
//         a big question mark                                   -> who can help us? what number?
//  7.png  the four think again, a bubble shows a truck silhouette
//         with a question mark                                  -> what kind of truck can help?
import scene1 from '../assets/firetruck/1.png';
import scene2 from '../assets/firetruck/2.png';
import scene3 from '../assets/firetruck/3.png';
import scene4 from '../assets/firetruck/4.png';
import scene5 from '../assets/firetruck/5.png';
import scene6 from '../assets/firetruck/6.png';
import scene7 from '../assets/firetruck/7.jpg';
import narration from '../assets/firetruck/firetruck.mp3';

const FPS = 30;
const XFADE = 14;

export type FiretruckSceneDef = {
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

// Scene cuts sit on silent pauses measured in the voiceover (71.16s of
// narration), so no crossfade lands on a word. Each cut is the end of a pause
// backed off by 0.15s, and the 14-frame (0.467s) fade fits fully inside it:
//   0.00– 8.57  "fire at school ... it is a normal day at school ... the
//                children are learning in class"        (pause 7.84–8.72)   -> 1.png
//   8.57–15.82  "one student smells smoke ... another student looks toward
//                the hallway ... smoke"                 (pause 14.83–15.97) -> 2.png
//  15.82–25.74  "the teacher says press the fire alarm ... a student presses
//                the alarm ... ring, ring, ring"        (pause 24.84–25.89) -> 3.png
//  25.74–30.31  "everyone leaves the classroom quickly and safely"
//                                                      (pause 28.93–30.46) -> 4.png
//  30.31–38.43  "the children and teachers gather outside ... they look back
//                at the school ... smoke is coming from the building"
//                                                      (pause 37.22–38.58) -> 5.png
//  38.43–51.23  "one child asks who can help us ... another asks who should
//                we call ... what number should we call for help"
//                                                      (pause 49.75–51.38) -> 6.png
//  51.23–71.50  "and there is another problem ... what kind of truck could
//                come quickly and help put out the fire. your mission ...
//                build a truck ... think, build, test"                    -> 7.png
export const FIRETRUCK_SCENES: FiretruckSceneDef[] = [
  {
    image: scene1,
    duration: 8.57,
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
          THE FIRETRUCK
        </MissionText>
        <MissionText style="heading" delay={2.5} outerStyle={{paddingBottom: 90}}>
          A NORMAL DAY AT SCHOOL
        </MissionText>
      </>
    ),
  },
  {
    image: scene2,
    duration: 7.25,
    motion: 'pan-right',
    overlay: (
      <>
        <MissionText style="heading" delay={0.3} outerStyle={{paddingBottom: 90}}>
          SUDDENLY — A SMELL OF SMOKE
        </MissionText>
        <MissionText style="heading" delay={4.4} outerStyle={{paddingTop: 80}}>
          SMOKE IN THE HALLWAY
        </MissionText>
      </>
    ),
  },
  {
    image: scene3,
    duration: 9.92,
    motion: 'zoom-out',
    overlay: (
      <>
        <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
          PRESS THE FIRE ALARM
        </MissionText>
        <MissionText style="heading" delay={6.2} outerStyle={{paddingTop: 80}}>
          RING • RING • RING
        </MissionText>
      </>
    ),
  },
  {
    image: scene4,
    duration: 4.57,
    motion: 'pan-left',
    overlay: (
      <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
        EVERYONE LEAVES QUICKLY AND SAFELY
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 8.12,
    motion: 'zoom-in',
    overlay: (
      <>
        <MissionText style="heading" delay={0.3} outerStyle={{paddingBottom: 90}}>
          EVERYONE GATHERS OUTSIDE
        </MissionText>
        <MissionText style="heading" delay={3.9} outerStyle={{paddingTop: 80}}>
          SMOKE IS COMING FROM THE BUILDING
        </MissionText>
      </>
    ),
  },
  {
    image: scene6,
    duration: 12.8,
    motion: 'zoom-out',
    overlay: (
      <>
        <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
          WHO CAN HELP US?
        </MissionText>
        <MissionText style="heading" delay={7.8} outerStyle={{paddingTop: 80}}>
          WHAT NUMBER SHOULD WE CALL?
        </MissionText>
      </>
    ),
  },
  {
    image: scene7,
    duration: 20.27,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.5}
        title={
          <>
            WHAT NUMBER DO WE CALL?
            <br />
            AND WHAT TRUCK CAN HELP?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const FIRETRUCK_SCENE_FRAMES = FIRETRUCK_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = FIRETRUCK_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const FiretruckMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of FIRETRUCK_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = FIRETRUCK_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={FIRETRUCK_SCENE_FRAMES[index]}
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
        const duration = FIRETRUCK_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === FIRETRUCK_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={FIRETRUCK_SCENES[index].image}
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
