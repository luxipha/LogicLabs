import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (numbered deck played in narrative order; narration verified
// from the voiceover transcript):
//  1.png  rain all night, then a family drives a mountain road   -> a wet morning on the mountain road
//  2.png  water running down the hillside, soil soaked           -> water runs down the hill
//  3.png  a crack, small rocks roll onto the road, driver stops  -> crack! rocks on the road
//  4.png  mud starts creeping slowly downhill                    -> mud begins moving downhill
//  5.png  a child looks worried at the hillside                  -> what if more mud comes down?
//  6.png  the road turning dangerous                             -> how can we warn people?
//  7.png  the mission                                            -> build a way to warn people
import scene1 from '../assets/mudslide/1.png';
import scene2 from '../assets/mudslide/2.png';
import scene3 from '../assets/mudslide/3.png';
import scene4 from '../assets/mudslide/4.png';
import scene5 from '../assets/mudslide/5.png';
import scene6 from '../assets/mudslide/6.png';
import scene7 from '../assets/mudslide/7.png';
import narration from '../assets/mudslide/mudslide.mp3';

const FPS = 30;
const XFADE = 14;

export type MudslideSceneDef = {
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

// Scene cuts sit on silent pauses measured in the voiceover (50.99s of
// narration), so no crossfade lands on a word. Each cut is the end of a pause
// backed off by 0.15s, and the 14-frame (0.467s) fade fits fully inside it:
//   0.00– 6.98  "it has been raining all night. in the morning, a family drives
//                along a mountain road"           (pause 6.49–7.13)   -> 1.png
//   6.98–12.25  "water is running down the hill. the soil looks very wet"
//                                                 (pause 11.56–12.40) -> 2.png
//  12.25–19.84  "then crack! a few small rocks roll onto the road. the driver
//                stops"                             (pause 19.14–19.99) -> 3.png
//  19.84–26.27  "what is happening to the hill? more mud begins moving slowly
//                downhill"                          (pause 25.62–26.42) -> 4.png
//  26.27–32.22  "a child looks worried. what if more mud and rocks come down?"
//                                                 (pause 31.36–32.37) -> 5.png
//  32.22–37.05  "and how can we warn people before the road becomes dangerous?"
//                                                 (pause 36.09–37.20) -> 6.png
//  37.05–52.00  "your mission. study what happens on a wet hillside. find out
//                when danger begins. then build a way to warn people. think,
//                build, test"                                          -> 7.png
export const MUDSLIDE_SCENES: MudslideSceneDef[] = [
  {
    image: scene1,
    duration: 6.98,
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
          THE MUDSLIDE
        </MissionText>
        <MissionText style="heading" delay={3.2} outerStyle={{paddingBottom: 90}}>
          A FAMILY DRIVES A MOUNTAIN ROAD
        </MissionText>
      </>
    ),
  },
  {
    image: scene2,
    duration: 5.27,
    motion: 'pan-right',
    overlay: (
      <>
        <MissionText style="heading" delay={0.3} outerStyle={{paddingBottom: 90}}>
          WATER RUNS DOWN THE HILL
        </MissionText>
        <MissionText style="heading" delay={2.0} outerStyle={{paddingTop: 80}}>
          THE SOIL LOOKS VERY WET
        </MissionText>
      </>
    ),
  },
  {
    image: scene3,
    duration: 7.59,
    motion: 'zoom-out',
    overlay: (
      <>
        <MissionText style="heading" delay={0.3} outerStyle={{paddingBottom: 90}}>
          CRACK! ROCKS ROLL ONTO THE ROAD
        </MissionText>
        <MissionText style="heading" delay={5.7} outerStyle={{paddingTop: 80}}>
          THE DRIVER STOPS
        </MissionText>
      </>
    ),
  },
  {
    image: scene4,
    duration: 6.43,
    motion: 'pan-up',
    overlay: (
      <>
        <MissionText style="heading" delay={0.3} outerStyle={{paddingBottom: 90}}>
          WHAT IS HAPPENING TO THE HILL?
        </MissionText>
        <MissionText style="heading" delay={2.8} outerStyle={{paddingTop: 80}}>
          MUD BEGINS MOVING DOWNHILL
        </MissionText>
      </>
    ),
  },
  {
    image: scene5,
    duration: 5.95,
    motion: 'pan-left',
    overlay: (
      <MissionText style="heading" delay={0.6} outerStyle={{paddingBottom: 90}}>
        WHAT IF MORE MUD AND ROCKS COME DOWN?
      </MissionText>
    ),
  },
  {
    image: scene6,
    duration: 4.83,
    motion: 'pan-right-slight',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingBottom: 90}}>
        HOW CAN WE WARN PEOPLE?
      </MissionText>
    ),
  },
  {
    image: scene7,
    duration: 14.95,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={1.5}
        title={
          <>
            CAN YOU BUILD A WARNING
            <br />
            BEFORE THE MUDSLIDE?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const MUDSLIDE_SCENE_FRAMES = MUDSLIDE_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = MUDSLIDE_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const MudslideMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of MUDSLIDE_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = MUDSLIDE_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={MUDSLIDE_SCENE_FRAMES[index]}
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
        const duration = MUDSLIDE_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === MUDSLIDE_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={MUDSLIDE_SCENES[index].image}
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
