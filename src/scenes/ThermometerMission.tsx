import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  1.png  the team cheering behind a table holding the finished DIY rig — a
//         digital clock, a small fan and two battery packs                -> the hot classroom, morning at school
//  2.png  the children sweltering; one fans himself, one holds a cloth to
//         her forehead, the teacher looks worried                          -> the room feels very warm
//  3.png  all three look up in wonder at the blue digital wall clock       -> one child looks at the clock, it's time to start
//  4.png  hand-on-chin thinking, thought bubble of 30 / 20 / thermometer /
//         0 / -10                                                        -> how hot is it? the clock shows time, not temperature
//  5.png  excited, thought bubble of thermometer + clock + spinning fan    -> can our clock show the temperature and run a fan?
//  6.png  the same finished rig as 1.png                                   -> the mission
import scene1 from '../assets/thermometer/1.png';
import scene2 from '../assets/thermometer/2.png';
import scene3 from '../assets/thermometer/3.png';
import scene4 from '../assets/thermometer/4.png';
import scene5 from '../assets/thermometer/5.png';
import scene6 from '../assets/thermometer/6.png';
import narration from '../assets/thermometer/thermometer.mp3';

const FPS = 30;
const XFADE = 14;

export type ThermometerSceneDef = {
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
// (58.75s of narration), so no crossfade lands in the middle of a word.
// Each cut sits at the end of a pause long enough to hold the 14-frame fade:
//   0.00– 6.33  "the hot classroom. it is morning at school. the children
//                come into the classroom"      (pause 5.78–6.48)       -> 1.png
//   6.33–10.94  "one child looks at the clock. it's time to start"
//                                              (pause 9.65–11.09)      -> 3.png
//  10.94–20.86  "but after a while the room feels very warm. one child fans
//                their face. oh, it's hot!"     (pause 19.83–21.01)     -> 2.png
//  20.86–31.10  "another child asks, how hot is it? the children look at the
//                clock again. it shows the time, but not the temperature"
//                                              (pause 30.03–31.25)     -> 4.png
//  31.10–49.32  "they start to think, can we make a clock that tells us the
//                time and the temperature too? then the room gets even
//                hotter. can our clock help turn on a fan when it gets too
//                hot?"                         (pause 47.98–49.47)     -> 5.png
//  49.32–59.75  "your mission is to build a smart electric clock. show the
//                time, check the temperature, and help keep the classroom
//                cool."                                               -> 6.png
export const THERMOMETER_SCENES: ThermometerSceneDef[] = [
  {
    image: scene1,
    duration: 6.33,
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
          THE HOT CLASSROOM
        </MissionText>
        <MissionText style="heading" delay={2.5} outerStyle={{paddingBottom: 90}}>
          IT IS MORNING AT SCHOOL
        </MissionText>
      </>
    ),
  },
  {
    image: scene3,
    duration: 4.61,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
        ONE CHILD LOOKS AT THE CLOCK
      </MissionText>
    ),
  },
  {
    image: scene2,
    duration: 9.92,
    motion: 'zoom-out',
    overlay: (
      <>
        <MissionText style="heading" delay={0.3} outerStyle={{paddingBottom: 90}}>
          THE ROOM FEELS VERY WARM
        </MissionText>
        <MissionText style="heading" delay={6.0} outerStyle={{paddingTop: 80}}>
          {'"OH, IT\'S HOT!"'}
        </MissionText>
      </>
    ),
  },
  {
    image: scene4,
    duration: 10.24,
    motion: 'pan-left',
    overlay: (
      <>
        <MissionText style="heading" delay={0.8} outerStyle={{paddingBottom: 90}}>
          HOW HOT IS IT?
        </MissionText>
        <MissionText style="heading" delay={4.3} outerStyle={{paddingTop: 80}}>
          IT SHOWS THE TIME • NOT THE TEMPERATURE
        </MissionText>
      </>
    ),
  },
  {
    image: scene5,
    duration: 18.22,
    motion: 'zoom-in',
    overlay: (
      <>
        <MissionText style="heading" delay={0.5} outerStyle={{paddingBottom: 90}}>
          CAN OUR CLOCK TELL THE TIME AND THE TEMPERATURE?
        </MissionText>
        <MissionText style="heading" delay={12.3} outerStyle={{paddingTop: 80}}>
          CAN IT TURN ON A FAN WHEN IT GETS TOO HOT?
        </MissionText>
      </>
    ),
  },
  {
    image: scene6,
    duration: 10.43,
    motion: 'zoom-out',
    overlay: (
      <FinalCard
        showAt={0.5}
        title={
          <>
            CAN YOU BUILD A CLOCK THAT
            <br />
            SHOWS TIME AND TEMPERATURE?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const THERMOMETER_SCENE_FRAMES = THERMOMETER_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = THERMOMETER_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const ThermometerMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of THERMOMETER_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = THERMOMETER_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={THERMOMETER_SCENE_FRAMES[index]}
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
        const duration = THERMOMETER_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === THERMOMETER_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={THERMOMETER_SCENES[index].image}
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
