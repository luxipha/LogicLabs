import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  1.png  the teacher holding up a triangle and a rectangle, the children
//         seated with shapes in front of them                         -> which shape makes a kite?
//  2.png  the shapes laid out on the table — triangle, square, circle,
//         rectangle, diamond                                            -> a triangle, a square, a diamond
//  3.png  building the kite: a diamond frame of sticks with tissue and
//         glue, sticks and string on the table                          -> they choose a shape and make the body
//  4.png  the finished diamond kite with a star, string and pennant
//         garlands in the children's hands                              -> then a string and a tail, now it's ready
//  5.png  outdoors on the school field, the four of them holding the
//         finished kite up                                              -> they take it outside
//  6.png  the kite high in the sky, the girl holding the string, leaves
//         blowing across the frame                                      -> the wind blows, the kite moves
//  7.png  the kite flying with its bow tail, the teacher pointing up     -> does the shape change how it moves?
import scene1 from '../assets/kite/1.png';
import scene2 from '../assets/kite/2.png';
import scene3 from '../assets/kite/3.png';
import scene4 from '../assets/kite/4.png';
import scene5 from '../assets/kite/5.png';
import scene6 from '../assets/kite/6.png';
import scene7 from '../assets/kite/7.png';
import narration from '../assets/kite/ElevenLabs_2026-10-11T05_37_21_Jane - Professional Audiobook Reader_pvc_sp100_s40_sb40_v3.mp3';

const FPS = 30;
const XFADE = 14;

export type KiteSceneDef = {
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
// (48.04s of narration), so no crossfade lands in the middle of a word.
// Each cut sits at the end of a pause long enough to hold the 14-frame fade:
//   0.00– 7.03  "which shape makes a kite. the teacher shows the children
//                three shapes"                 (pause 6.53–7.03)       -> 1.png
//   7.03–13.77  "a triangle, a square, and a diamond. can we turn one of
//                these shapes into a kite?"     (pause 12.69–13.92)     -> 2.png
//  13.77–17.97  "the children choose a shape, they make the kite body"
//                                              (pause 17.27–18.11)     -> 3.png
//  17.97–23.57  "then they add a string and a tail. now the kite is ready"
//                                              (pause 22.97–23.60)     -> 4.png
//  23.57–29.47  "they take it outside, the wind begins to blow, whoosh"
//                                              (pause 28.62–29.61)     -> 5.png
//  29.47–37.67  "the kite moves through the air, the children watch
//                carefully. some shapes move better than others"
//                                              (pause 36.47–37.82)     -> 6.png
//  37.67–49.00  "does the shape change how the kite moves? your mission is,
//                choose a shape, build a kite, and test how it moves in the
//                wind."                                              -> 7.png
export const KITE_SCENES: KiteSceneDef[] = [
  {
    image: scene1,
    duration: 7.03,
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
          THE KITE
        </MissionText>
        <MissionText style="heading" delay={0.7} outerStyle={{paddingBottom: 90}}>
          WHICH SHAPE MAKES A KITE?
        </MissionText>
      </>
    ),
  },
  {
    image: scene2,
    duration: 6.73,
    motion: 'pan-right',
    overlay: (
      <>
        <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
          A TRIANGLE • A SQUARE • A DIAMOND
        </MissionText>
        <MissionText style="heading" delay={3.0} outerStyle={{paddingTop: 80}}>
          CAN WE TURN ONE INTO A KITE?
        </MissionText>
      </>
    ),
  },
  {
    image: scene3,
    duration: 4.2,
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.5} outerStyle={{paddingBottom: 90}}>
        THEY MAKE THE KITE BODY
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 5.6,
    motion: 'pan-left',
    overlay: (
      <>
        <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
          A STRING AND A TAIL
        </MissionText>
        <MissionText style="heading" delay={3.3} outerStyle={{paddingTop: 80}}>
          NOW THE KITE IS READY
        </MissionText>
      </>
    ),
  },
  {
    image: scene5,
    duration: 5.9,
    motion: 'zoom-in',
    overlay: (
      <>
        <MissionText style="heading" delay={0.3} outerStyle={{paddingBottom: 90}}>
          THEY TAKE IT OUTSIDE
        </MissionText>
        <MissionText style="heading" delay={2.2} outerStyle={{paddingTop: 80}}>
          THE WIND BEGINS TO BLOW
        </MissionText>
      </>
    ),
  },
  {
    image: scene6,
    duration: 8.2,
    motion: 'zoom-out',
    overlay: (
      <>
        <MissionText style="heading" delay={0.3} outerStyle={{paddingBottom: 90}}>
          THE KITE MOVES THROUGH THE AIR
        </MissionText>
        <MissionText style="heading" delay={4.9} outerStyle={{paddingTop: 80}}>
          SOME SHAPES MOVE BETTER THAN OTHERS
        </MissionText>
      </>
    ),
  },
  {
    image: scene7,
    duration: 11.33,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={1.0}
        title={
          <>
            CAN THE SHAPE CHANGE
            <br />
            HOW YOUR KITE FLIES?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const KITE_SCENE_FRAMES = KITE_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = KITE_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const KiteMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of KITE_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = KITE_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={KITE_SCENE_FRAMES[index]}
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
        const duration = KITE_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === KITE_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={KITE_SCENES[index].image}
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
