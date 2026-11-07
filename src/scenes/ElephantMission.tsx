import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (from the narration — the artwork could not be vision-verified
// in this session, so each picture is matched to the narration beat it illustrates):
//  1.png  the campsite on a sunny morning                               -> the mystery at the campsite
//  2.png  the class sets up camp in the forest                          -> a camping trip in the forest
//  3.png  Boom! the ground shakes                                       -> the ground shakes
//  4.png  huge footprints found near the tent                           -> huge footprints
//  5.png  something moves behind the trees                              -> something in the trees
//  6.png  two giant ears appear, like fans                              -> ears like giant fans
//  7.png  a long trunk reaches out, then water sprays into the air      -> the trunk and the splash
//  8.png  the mission: discover the mystery animal, build a model       -> the mission
import scene1 from '../assets/elephant/1.png';
import scene2 from '../assets/elephant/2.png';
import scene3 from '../assets/elephant/3.png';
import scene4 from '../assets/elephant/4.png';
import scene5 from '../assets/elephant/5.png';
import scene6 from '../assets/elephant/6.png';
import scene7 from '../assets/elephant/7.png';
import scene8 from '../assets/elephant/8.png';
import narration from '../assets/elephant/ElevenLabs_2026-11-07T05_20_13_Hope - Professional, Clear and Natural_pvc_s50_v3.mp3';

const FPS = 30;
const XFADE = 14;

export type ElephantSceneDef = {
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
// (50.60s of narration), so no crossfade lands in the middle of a word.
// Each cut sits at the end of a pause long enough to hold the 14-frame fade:
//   0.00– 2.55  "the mystery at the campsite"             (pause 1.68–2.70)  -> 1.png
//   2.55–10.98  "one sunny morning, the teacher and her students go camping
//                in the forest ... they set up their tent and listened to the
//                birds"                                 (pause 10.24–11.13) -> 2.png
//  10.98–17.12  "suddenly ... boom! boom! boom! the ground shakes! what was
//                that?"                                (pause 16.44–17.27) -> 3.png
//  17.12–20.68  "the children discover huge footprints near their tent"
//                                                      (pause 20.16–20.83) -> 4.png
//  20.68–23.82  "then, something moves behind the trees"
//                                                      (pause 23.43–23.97) -> 5.png
//  23.82–28.42  "two giant ears appear. they look like fans!"
//                                                      (pause 27.76–28.57) -> 6.png
//  28.42–41.07  "something long reaches out and picks up a branch. then,
//                splash! water sprays into the air! the teacher smiles. can
//                you guess what animal is hiding?"     (pause 40.24–41.22) -> 7.png
//  41.07–50.60  "your mission ... discover the mystery animal. build your own
//                model and make it move when you touch it. think. build." -> 8.png
export const ELEPHANT_SCENES: ElephantSceneDef[] = [
  {
    image: scene1,
    duration: 2.55,
    motion: 'zoom-in',
    overlay: (
      <>
        <MissionText
          style="label"
          delay={0.2}
          align="left"
          outerStyle={{
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            paddingLeft: 110,
            paddingTop: 70,
          }}
        >
          THE ELEPHANT
        </MissionText>
        <MissionText style="heading" delay={0.7} outerStyle={{paddingBottom: 90}}>
          THE MYSTERY AT THE CAMPSITE
        </MissionText>
      </>
    ),
  },
  {
    image: scene2,
    duration: 8.43,
    motion: 'pan-right',
    overlay: (
      <>
        <MissionText style="heading" delay={0.8} outerStyle={{paddingBottom: 90}}>
          A CAMPING TRIP IN THE FOREST
        </MissionText>
        <MissionText style="heading" delay={5.2} outerStyle={{paddingTop: 80}}>
          THEY SET UP THEIR TENT
        </MissionText>
      </>
    ),
  },
  {
    image: scene3,
    duration: 6.14,
    motion: 'zoom-out',
    overlay: (
      <>
        <MissionText style="heading" delay={2.0} outerStyle={{paddingBottom: 90}}>
          BOOM! THE GROUND SHAKES
        </MissionText>
        <MissionText style="heading" delay={5.0} outerStyle={{paddingTop: 80}}>
          WHAT WAS THAT?
        </MissionText>
      </>
    ),
  },
  {
    image: scene4,
    duration: 3.56,
    motion: 'pan-left',
    overlay: (
      <MissionText style="heading" delay={0.7} outerStyle={{paddingBottom: 90}}>
        HUGE FOOTPRINTS!
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 3.14,
    motion: 'pan-up',
    overlay: (
      <MissionText style="heading" delay={0.6} outerStyle={{paddingBottom: 90}}>
        SOMETHING IN THE TREES
      </MissionText>
    ),
  },
  {
    image: scene6,
    duration: 4.6,
    motion: 'pan-down',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingBottom: 90}}>
        EARS LIKE GIANT FANS
      </MissionText>
    ),
  },
  {
    image: scene7,
    duration: 12.65,
    motion: 'route',
    overlay: (
      <>
        <MissionText style="heading" delay={0.8} outerStyle={{paddingBottom: 90}}>
          A LONG TRUNK REACHES OUT
        </MissionText>
        <MissionText style="heading" delay={5.4} outerStyle={{paddingTop: 80}}>
          SPLASH! WATER SPRAYS UP
        </MissionText>
      </>
    ),
  },
  {
    image: scene8,
    duration: 9.53,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.5}
        title={
          <>
            CAN YOU DISCOVER THE MYSTERY
            <br />
            ANIMAL AND BUILD IT?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const ELEPHANT_SCENE_FRAMES = ELEPHANT_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = ELEPHANT_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const ElephantMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of ELEPHANT_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = ELEPHANT_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={ELEPHANT_SCENE_FRAMES[index]}
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
        const duration = ELEPHANT_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === ELEPHANT_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={ELEPHANT_SCENES[index].image}
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
