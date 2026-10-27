import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (numbered deck played in narrative order; narration verified
// from the voiceover transcript):
//  1.jpg  the Earthquake Research Lab                                  -> the lab takes the challenge
//  2.jpg  a city and its buildings                                     -> a city wants stronger buildings
//  3.jpg  a scientist explains the problem                             -> how do we test the shaking?
//  4.jpg  a big question mark                                          -> what if we made safe shaking?
//  5.jpg  the teacher adds a twist                                     -> not all earthquakes are the same
//  6.jpg  shaking that grows strong, then weak                         -> strong, weaker, until it stops
//  7.jpg  the mission                                                  -> build a shake table to test buildings
import scene1 from '../assets/earth_quake/1.jpg';
import scene2 from '../assets/earth_quake/2.jpg';
import scene3 from '../assets/earth_quake/3.jpg';
import scene4 from '../assets/earth_quake/4.jpg';
import scene5 from '../assets/earth_quake/5.jpg';
import scene6 from '../assets/earth_quake/6.jpg';
import scene7 from '../assets/earth_quake/7.jpg';
import narration from '../assets/earth_quake/earth_quake.mp3';

const FPS = 30;
const XFADE = 14;

export type EarthquakeSceneDef = {
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

// Scene cuts sit on silent pauses measured in the voiceover (51.57s of
// narration), so no crossfade lands on a word. Each cut is the end of a pause
// backed off by 0.15s, and the 14-frame (0.467s) fade fits fully inside it:
//   0.00– 6.61  "the earthquake research lab. a group of young scientists
//                receives an important challenge"    (pause 6.06–6.76)   -> 1.jpg
//   6.61–15.62  "a city wants to build stronger buildings ... cannot wait for
//                a real earthquake to test every building"
//                                                    (pause 14.68–15.77) -> 2.jpg
//  15.62–23.86  "one scientist asks: how can we find out what happens when the
//                ground shakes? another thinks for a moment"
//                                                    (pause 22.74–24.01) -> 3.jpg
//  23.86–28.13  "what if we could create safe shaking ourselves?"
//                                                    (pause 27.01–28.28) -> 4.jpg
//  28.13–32.71  "the teacher adds: and earthquakes are not always the same
//                strength"                            (pause 32.05–32.86) -> 5.jpg
//  32.71–40.17  "can we make the shaking very strong, then weaker, and weaker,
//                until it stops?"                    (pause 38.97–40.32) -> 6.jpg
//  40.17–52.00  "your mission: think of a way to create controlled shaking.
//                build it, test it, and use it to help the scientists study
//                earthquakes safely"                                    -> 7.jpg
export const EARTHQUAKE_SCENES: EarthquakeSceneDef[] = [
  {
    image: scene1,
    duration: 6.61,
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
          THE EARTHQUAKE RESEARCH LAB
        </MissionText>
        <MissionText style="heading" delay={3.9} outerStyle={{paddingBottom: 90}}>
          A GROUP OF SCIENTISTS TAKES THE CHALLENGE
        </MissionText>
      </>
    ),
  },
  {
    image: scene2,
    duration: 9.01,
    motion: 'pan-right',
    overlay: (
      <>
        <MissionText style="heading" delay={1.4} outerStyle={{paddingBottom: 90}}>
          A CITY WANTS STRONGER BUILDINGS
        </MissionText>
        <MissionText style="heading" delay={6.0} outerStyle={{paddingTop: 80}}>
          NO ONE CAN WAIT FOR A REAL EARTHQUAKE
        </MissionText>
      </>
    ),
  },
  {
    image: scene3,
    duration: 8.24,
    motion: 'zoom-out',
    overlay: (
      <>
        <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
          HOW DO WE FIND OUT WHAT THE GROUND DOES?
        </MissionText>
        <MissionText style="heading" delay={5.7} outerStyle={{paddingTop: 80}}>
          ANOTHER THINKS FOR A MOMENT
        </MissionText>
      </>
    ),
  },
  {
    image: scene4,
    duration: 4.27,
    motion: 'pan-up',
    overlay: (
      <MissionText style="heading" delay={3.0} outerStyle={{paddingBottom: 90}}>
        WHAT IF WE COULD CREATE SAFE SHAKING?
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 4.58,
    motion: 'pan-left',
    overlay: (
      <MissionText style="heading" delay={2.0} outerStyle={{paddingBottom: 90}}>
        EARTHQUAKES ARE NOT ALWAYS THE SAME STRENGTH
      </MissionText>
    ),
  },
  {
    image: scene6,
    duration: 7.46,
    motion: 'pan-right-slight',
    overlay: (
      <>
        <MissionText style="heading" delay={1.9} outerStyle={{paddingBottom: 90}}>
          CAN WE MAKE THE SHAKING STRONGER?
        </MissionText>
        <MissionText style="heading" delay={5.4} outerStyle={{paddingTop: 80}}>
          THEN WEAKER, UNTIL IT STOPS
        </MissionText>
      </>
    ),
  },
  {
    image: scene7,
    duration: 11.83,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={1.5}
        title={
          <>
            CAN YOU BUILD A SHAKE TABLE
            <br />
            TO TEST A CITY'S BUILDINGS?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const EARTHQUAKE_SCENE_FRAMES = EARTHQUAKE_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = EARTHQUAKE_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const EarthquakeMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of EARTHQUAKE_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = EARTHQUAKE_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={EARTHQUAKE_SCENE_FRAMES[index]}
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
        const duration = EARTHQUAKE_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === EARTHQUAKE_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={EARTHQUAKE_SCENES[index].image}
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
