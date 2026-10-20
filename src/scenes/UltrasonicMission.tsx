import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork):
//  1.png  the pirate crew runs along a beach path, the leader pointing out
//         to the islands; a treasure map shows a red X         -> a treasure map
//  2.png  the crew gathers round the map on the shore, the dark cave
//         mouth in the cliff behind them                       -> the map leads to a cave
//  3.png  the leader lifts her lantern and leads the five children
//         into the cave                                        -> into the dark cave
//  4.png  deep inside, one child reaches for the rock face, alarmed,
//         the lantern barely lighting the way                  -> something blocks the way
//  5.png  the whole crew stands thinking, chins in hands          -> how do we find the way?
//  6.png  the leader gestures at the pitch-dark tunnel ahead      -> ahead, it is pitch dark
//  7.png  the leader kneels and points to where the light comes
//         from, the crew smiling                               -> the mission
import scene1 from '../assets/sonar/1.png';
import scene2 from '../assets/sonar/2.png';
import scene3 from '../assets/sonar/3.png';
import scene4 from '../assets/sonar/4.png';
import scene5 from '../assets/sonar/5.png';
import scene6 from '../assets/sonar/6.png';
import scene7 from '../assets/sonar/7.png';
import narration from '../assets/sonar/ElevenLabs_2026-10-20T05_40_49_Jane - Professional Audiobook Reader_pvc_sp100_s40_sb40_v3.mp3';

const FPS = 30;
const XFADE = 14;

export type UltrasonicSceneDef = {
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

// Scene cuts sit on silent pauses measured in the voiceover (53.71s of
// narration), so no crossfade lands on a word. Each cut is the end of a pause
// backed off by 0.15s, and the 14-frame (0.467s) fade fits fully inside it:
//   0.00– 7.06  the crew sets out with the map        (pause 6.54–7.21)
//   7.06–14.36  the map leads them to the cave        (pause 13.99–14.51)
//  14.36–21.98  into the dark cave with the lantern   (pause 21.43–22.13)
//  21.98–27.98  something blocks the way              (pause 27.23–28.13)
//  27.98–32.48  how do we find the way?               (pause 31.77–32.63)
//  32.48–43.00  ahead, it is pitch dark               (pause 42.13–43.15)
//  43.00–54.63  the mission                                          -> 7.png
export const ULTRASONIC_SCENES: UltrasonicSceneDef[] = [
  {
    image: scene1,
    duration: 7.06,
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
          THE ULTRASONIC
        </MissionText>
        <MissionText style="heading" delay={2.4} outerStyle={{paddingBottom: 90}}>
          A TREASURE MAP
        </MissionText>
      </>
    ),
  },
  {
    image: scene2,
    duration: 7.3,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={1.2} outerStyle={{paddingBottom: 90}}>
        THE MAP LEADS TO A CAVE
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 7.62,
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingBottom: 90}}>
        INTO THE DARK CAVE
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 6,
    motion: 'pan-left',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingBottom: 90}}>
        SOMETHING BLOCKS THE WAY
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 4.5,
    motion: 'pan-up',
    overlay: (
      <MissionText style="heading" delay={0.5} outerStyle={{paddingBottom: 90}}>
        HOW DO WE FIND THE WAY?
      </MissionText>
    ),
  },
  {
    image: scene6,
    duration: 10.52,
    motion: 'pan-down',
    overlay: (
      <MissionText style="heading" delay={1} outerStyle={{paddingBottom: 90}}>
        AHEAD, IT IS PITCH DARK
      </MissionText>
    ),
  },
  {
    image: scene7,
    duration: 11.6,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.5}
        title={
          <>
            CAN YOU BUILD A DEVICE
            <br />
            THAT SEES WITH SOUND?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const ULTRASONIC_SCENE_FRAMES = ULTRASONIC_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = ULTRASONIC_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const UltrasonicMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of ULTRASONIC_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = ULTRASONIC_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={ULTRASONIC_SCENE_FRAMES[index]}
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
        const duration = ULTRASONIC_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === ULTRASONIC_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={ULTRASONIC_SCENES[index].image}
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
