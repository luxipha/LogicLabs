import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  1.png  Captain Jenny crouching on the beach with an open treasure map and a chest -> title + she finds an old map
//  2.png  Jenny leads her ten little pirates running across the sunny beach           -> the pirates run over
//  3.png  close-up of the map in hand, north and east arrows marked                   -> read the map: go north, then east
//  4.png  the pirate crew cheering, map held high, ship in the bay                    -> treasure! the pirates cheer
//  5.png  children with backpacks on the jungle path at a blank signpost              -> they walk, the path looks different
//  6.png  the puzzled crew, question marks overhead, blank signpost                   -> where is north? which way is east?
//  7.png  Jenny teaching, speech bubble with a compass rose N/S/E/W                   -> we need a tool for the directions
//  8.png  the crew around a barrel table with a compass and the map                   -> mission: build a device
import scene1 from '../assets/compass/1.png';
import scene2 from '../assets/compass/2.png';
import scene3 from '../assets/compass/3.png';
import scene4 from '../assets/compass/4.png';
import scene5 from '../assets/compass/5.png';
import scene6 from '../assets/compass/6.png';
import scene7 from '../assets/compass/7.png';
import scene8 from '../assets/compass/8.png';
import narration from '../assets/compass/compass.mp3';

const FPS = 30;
const XFADE = 14;

export type CompassSceneDef = {
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
// (60.08s of narration), so no crossfade lands in the middle of a word.
// Each cut sits at the end of a pause long enough to hold the 14-frame fade:
//   0.00– 7.21  "Captain Jenny and the treasure hunt. Sunny morning, Captain
//                Jenny found an old treasure map."     (pause 6.69–7.36)  -> 1.png
//   7.21–12.87  "Pirates, come and look. Her ten little pirates ran over
//                quickly."                              (pause 12.35–13.02) -> 2.png
//  12.87–21.99  "Captain Jenny opened the map and read, 'Go north, ten steps,
//                then go east past the big rock, then find the treasure chest.'"
//                                                      (pause 20.99–22.14) -> 3.png
//  21.99–25.22  "Treasure. The pirates cheered."          (pause 24.57–25.37) -> 4.png
//  25.22–31.87  "They started walking, but after a while, they stopped. The
//                path looked different."                 (pause 31.11–32.02) -> 5.png
//  31.87–42.87  "Where is north? Which way is east? Everyone looked around.
//                They did not know which way to go."     (pause 41.91–43.02) -> 6.png
//  42.87–51.28  "Captain Jenny smiled. We need a special tool, a tool that can
//                help us find north, south, east and west." (pause 50.15–51.43) -> 7.png
//  51.28–61.28  "Your mission is? Create a device. Find the right direction.
//                Follow the treasure map and discover the treasure."        -> 8.png
export const COMPASS_SCENES: CompassSceneDef[] = [
  {
    image: scene1,
    duration: 7.21,
    motion: 'zoom-in',
    overlay: (
      <>
        <MissionText
          style="label"
          delay={0.3}
          align="left"
          outerStyle={{
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            paddingLeft: 110,
            paddingTop: 70,
          }}
        >
          THE COMPASS
        </MissionText>
        <MissionText style="heading" delay={3.0} outerStyle={{paddingBottom: 90}}>
          THE TREASURE HUNT
        </MissionText>
      </>
    ),
  },
  {
    image: scene2,
    duration: 5.66,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={1.1} outerStyle={{paddingBottom: 90}}>
        TEN LITTLE PIRATES
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 9.12,
    motion: 'zoom-out',
    // The map artwork already shows the north/east arrows — keep the text minimal.
    overlay: (
      <MissionText style="heading" delay={0.5} outerStyle={{paddingBottom: 90}}>
        FOLLOW THE MAP
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 3.23,
    motion: 'zoom-in',
    overlay: (
      <MissionText style="heading" delay={0.3} outerStyle={{paddingBottom: 90}}>
        TREASURE!
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 6.65,
    motion: 'pan-left',
    overlay: (
      <MissionText style="heading" delay={3.6} outerStyle={{paddingBottom: 90}}>
        THE PATH LOOKED DIFFERENT
      </MissionText>
    ),
  },
  {
    image: scene6,
    duration: 11.0,
    motion: 'zoom-out',
    // The floating question marks already carry the confusion — one short line only.
    overlay: (
      <MissionText style="heading" delay={1.0} outerStyle={{paddingBottom: 90}}>
        WHICH WAY?
      </MissionText>
    ),
  },
  {
    image: scene7,
    duration: 8.41,
    motion: 'pan-right',
    // The speech bubble already shows the compass rose (N/S/E/W) — no overlay text.
  },
  {
    image: scene8,
    duration: 10.0,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.5}
        title={
          <>
            CAN YOU BUILD A DEVICE TO
            <br />
            FIND THE RIGHT DIRECTION?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const COMPASS_SCENE_FRAMES = COMPASS_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = COMPASS_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const CompassMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of COMPASS_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = COMPASS_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={COMPASS_SCENE_FRAMES[index]}
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
        const duration = COMPASS_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === COMPASS_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={COMPASS_SCENES[index].image}
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
