import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  1.png  the class sits bored at their table, grey clouds in the window
//         and the ceiling lamp dark                            -> a cloudy morning at school
//  2.png  the teacher points up, the pendant lamp glowing       -> the teacher turns on the light
//  3.png  the window shows a bright sun, the room lit up        -> bright sunlight fills the classroom
//  4.png  the sun is out and the pendant lamp is still glowing  -> but the light is still on
//  5.png  the four look up, startled, at the lamp still burning -> we forgot to turn it off
//  6.png  everyone thinking, chins on hands, lamp still on      -> do we have to remember every time?
//  7.png  a thought bubble splits night from day: the lamp lit
//         by the moon, dark beside the sun                      -> build a light that knows: the mission
import scene1 from '../assets/automatic_light/1.png';
import scene2 from '../assets/automatic_light/2.png';
import scene3 from '../assets/automatic_light/3.png';
import scene4 from '../assets/automatic_light/4.png';
import scene5 from '../assets/automatic_light/5.png';
import scene6 from '../assets/automatic_light/6.png';
import scene7 from '../assets/automatic_light/7.png';
import narration from '../assets/automatic_light/light.mp3';

const FPS = 30;
const XFADE = 14;

export type SmartLightSceneDef = {
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

// Scene cuts sit on silent pauses measured in the voiceover (51.49s of
// narration), so no crossfade lands on a word. Each cut is the end of a pause
// backed off by 0.15s, and the 14-frame (0.467s) fade fits fully inside it:
//   0.00– 7.16  "the forgetful light. It is a cloudy morning at school. The
//                classroom is a little dark"            (pause 6.57–7.31)   -> 1.png
//   7.16–12.37  "the teacher turns on the light. Later the sun comes out"
//                                                      (pause 11.81–12.52) -> 2.png
//  12.37–15.43  "bright sunlight fills the classroom"  (pause 14.68–15.58) -> 3.png
//  15.43–19.75  "but the light is still on. The children look up"
//                                                      (pause 18.80–19.90) -> 4.png
//  19.75–25.77  "hmm. We forgot to turn it off. The next day it happens
//                again"                                (pause 25.14–25.92) -> 5.png
//  25.77–40.50  "the room becomes bright but the light is still on. The
//                teacher asks: do we have to remember every time? Can the
//                light know when it is dark and when it is bright?"
//                                                      (pause 39.45–40.65) -> 6.png
//  40.50–51.80  "your mission: build a smart light that turns on when it is
//                dark and turns off when it is bright. Think. Build."
//                                                                         -> 7.png
export const SMART_LIGHT_SCENES: SmartLightSceneDef[] = [
  {
    image: scene1,
    duration: 7.16,
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
          THE SMART LIGHT
        </MissionText>
        <MissionText style="heading" delay={2.6} outerStyle={{paddingBottom: 90}}>
          A CLOUDY MORNING AT SCHOOL
        </MissionText>
      </>
    ),
  },
  {
    image: scene2,
    duration: 5.21,
    motion: 'pan-right',
    overlay: (
      <>
        <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
          THE TEACHER TURNS ON THE LIGHT
        </MissionText>
        <MissionText style="heading" delay={3.2} outerStyle={{paddingTop: 80}}>
          LATER, THE SUN COMES OUT
        </MissionText>
      </>
    ),
  },
  {
    image: scene3,
    duration: 3.06,
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.3} outerStyle={{paddingBottom: 90}}>
        BRIGHT SUNLIGHT FILLS THE CLASSROOM
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 4.32,
    motion: 'pan-left',
    overlay: (
      <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
        BUT THE LIGHT IS STILL ON
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 6.02,
    motion: 'pan-up',
    overlay: (
      <>
        <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
          WE FORGOT TO TURN IT OFF
        </MissionText>
        <MissionText style="heading" delay={3.4} outerStyle={{paddingTop: 80}}>
          THE NEXT DAY, IT HAPPENS AGAIN
        </MissionText>
      </>
    ),
  },
  {
    image: scene6,
    duration: 14.73,
    motion: 'pan-left-slight',
    overlay: (
      <>
        <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
          THE ROOM IS BRIGHT, THE LIGHT IS STILL ON
        </MissionText>
        <MissionText style="heading" delay={4.6} outerStyle={{paddingTop: 80}}>
          DO WE HAVE TO REMEMBER EVERY TIME?
        </MissionText>
      </>
    ),
  },
  {
    image: scene7,
    duration: 11.3,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.5}
        title={
          <>
            CAN YOU BUILD A LIGHT
            <br />
            THAT KNOWS WHEN IT IS DARK?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const SMART_LIGHT_SCENE_FRAMES = SMART_LIGHT_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = SMART_LIGHT_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const SmartLightMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of SMART_LIGHT_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = SMART_LIGHT_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={SMART_LIGHT_SCENE_FRAMES[index]}
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
        const duration = SMART_LIGHT_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === SMART_LIGHT_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={SMART_LIGHT_SCENES[index].image}
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
