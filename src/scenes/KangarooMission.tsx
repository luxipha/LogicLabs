import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  1.png   three children hiking a trail through tall golden grass          -> a walk in the tall grass
//  2.png   the children stop, alarmed, pointing at the swaying grass        -> something is moving!
//  3.png   low shot through the golden stalks, nobody in sight              -> the grass begins to shake
//  4.png   a young kangaroo bursts out of the grass mid-leap                -> something jumps out!
//  5.png   the kangaroo springs across the meadow                           -> it jumps very high!
//  6.png   the kangaroo stands tall in the outback, full body               -> big legs, small arms, a long tail
//  7.png   the children puzzle it out, hands on chins                       -> what animal could it be?
//  8.png   the children gather as the kangaroo opens its pouch              -> a little pocket on its tummy
//  9.png   close-up of the pouch, motion lines showing movement inside      -> bump, bump
// 10.png   the children wonder, a big question mark above them              -> what's inside the pocket?
// 11.png   the trio with backpacks and binoculars beneath Uluru             -> the mission
import scene1 from '../assets/Kangaroo/1.png';
import scene2 from '../assets/Kangaroo/2.png';
import scene3 from '../assets/Kangaroo/3.png';
import scene4 from '../assets/Kangaroo/4.png';
import scene5 from '../assets/Kangaroo/5.png';
import scene6 from '../assets/Kangaroo/6.png';
import scene7 from '../assets/Kangaroo/7.png';
import scene8 from '../assets/Kangaroo/8.png';
import scene9 from '../assets/Kangaroo/9.png';
import scene10 from '../assets/Kangaroo/10.png';
import scene11 from '../assets/Kangaroo/11.png';
import narration from '../assets/Kangaroo/ElevenLabs_2026-09-20T11_55_50_Jane - Professional Audiobook Reader_eleven_v3.mp3';

const FPS = 30;
const XFADE = 14;

export type KangarooSceneDef = {
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

// Scene timings follow the voiceover pauses (64.44s total):
//   0.0–8.56   "something is moving in the grass ... some children are walking
//               near a field of tall golden grass"                                -> 1.png
//   8.56–13.28  "suddenly, look, something is moving!"                              -> 2.png
//  13.28–18.20  "the grass starts to shake, rustle, rustle"                        -> 3.png
//  18.20–21.88  "then something jumps out, boing, boing!"                          -> 4.png
//  21.88–24.24  "it jumps very high"                                              -> 5.png
//  24.24–33.48  "the children look closely ... big legs, small arms and a long tail" -> 6.png
//  33.48–35.92  "what animal could it be?"                                         -> 7.png
//  35.92–47.72  "the children follow it carefully ... a little pocket, and
//               something tiny is moving inside"                                  -> 8.png
//  47.72–50.08  "bump, bump"                                                      -> 9.png
//  50.08–53.32  "what could be inside the pocket?"                                -> 10.png
//  53.32–64.44  "your mission is to discover the mystery animal ... look carefully,
//               think, discover"                                                  -> 11.png
export const KANGAROO_SCENES: KangarooSceneDef[] = [
  {
    image: scene1,
    duration: 8.56,
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
        A WALK IN THE TALL GRASS
      </MissionText>
    ),
  },
  {
    image: scene2,
    duration: 4.72,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={0.6} outerStyle={{paddingTop: 80}}>
        SOMETHING IS MOVING!
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 4.92,
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.5} outerStyle={{paddingBottom: 90}}>
        THE GRASS BEGINS TO SHAKE
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 3.68,
    motion: 'zoom-in',
    overlay: (
      <MissionText style="heading" delay={0.4} outerStyle={{paddingTop: 80}}>
        SOMETHING JUMPS OUT!
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 2.36,
    motion: 'pan-left',
    overlay: (
      <MissionText style="heading" delay={0.3} outerStyle={{paddingTop: 80}}>
        IT JUMPS VERY HIGH!
      </MissionText>
    ),
  },
  {
    image: scene6,
    duration: 9.24,
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        BIG LEGS • SMALL ARMS • A LONG TAIL
      </MissionText>
    ),
  },
  {
    image: scene7,
    duration: 2.44,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={0.3} outerStyle={{paddingTop: 80}}>
        WHAT ANIMAL COULD IT BE?
      </MissionText>
    ),
  },
  {
    image: scene8,
    duration: 11.8,
    motion: 'zoom-in',
    overlay: (
      <MissionText style="heading" delay={1.2} outerStyle={{paddingBottom: 90}}>
        A LITTLE POCKET ON ITS TUMMY
      </MissionText>
    ),
  },
  {
    image: scene9,
    duration: 2.36,
    motion: 'zoom-in',
    overlay: (
      <MissionText style="heading" delay={0.2} outerStyle={{paddingBottom: 90}}>
        BUMP • BUMP
      </MissionText>
    ),
  },
  {
    image: scene10,
    duration: 3.24,
    motion: 'pan-left',
    overlay: (
      <MissionText style="heading" delay={0.3} outerStyle={{paddingTop: 80}}>
        WHAT&apos;S INSIDE THE POCKET?
      </MissionText>
    ),
  },
  {
    image: scene11,
    duration: 11.12,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.6}
        title={
          <>
            CAN YOU DISCOVER
            <br />
            THE MYSTERY ANIMAL?
          </>
        }
        tagline="Look • Think • Discover"
      />
    ),
  },
];

export const KANGAROO_SCENE_FRAMES = KANGAROO_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = KANGAROO_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const KangarooMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of KANGAROO_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = KANGAROO_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={KANGAROO_SCENE_FRAMES[index]}
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
        const duration = KANGAROO_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === KANGAROO_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={KANGAROO_SCENES[index].image}
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
