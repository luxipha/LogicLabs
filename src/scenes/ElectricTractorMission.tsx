import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  1.png   a farmhand points down the lane, cart stacked with produce  -> a farm full of vegetables
//  2.png   the farmer leans into the loaded trailer, straining         -> he tries to pull it
//  3.png   he hauls on the rope with both hands, face set              -> he pulls and pulls
//  4.png   hand on chin, studying the trailer                          -> it is too heavy to move
//  5.png   the farmer sizes up the load                                -> mission challenge
import scene1 from '../assets/electric_tractor/1.png';
import scene2 from '../assets/electric_tractor/2.png';
import scene3 from '../assets/electric_tractor/3.png';
import scene4 from '../assets/electric_tractor/4.png';
import scene5 from '../assets/electric_tractor/5.png';
import narration from '../assets/electric_tractor/ElevenLabs_2026-09-17T08_50_24_Jane - Professional Audiobook Reader_eleven_v3.mp3';

const FPS = 30;
const XFADE = 14;

export type ElectricTractorSceneDef = {
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

// Scene timings follow the voiceover pauses (47.23s total):
//   0.0–10.6   "a farmer is working his farm ... a big trailer full of vegetables" -> 1.png
//  10.6–15.1   "he needs to move the trailer ... so he tries to pull it"           -> 2.png
//  15.1–21.9   "he pulls and pulls, but the trailer is too heavy"                  -> 3.png
//  21.9–30.4   "it does not move ... what can help me pull this heavy trailer?"    -> 4.png
//  30.4–47.23  "your mission is to find a machine ... think, build, test."         -> 5.png
export const ELECTRIC_TRACTOR_SCENES: ElectricTractorSceneDef[] = [
  {
    image: scene1,
    duration: 10.6,
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
        A FARM FULL OF VEGETABLES
      </MissionText>
    ),
  },
  {
    image: scene2,
    duration: 4.5,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        HE TRIES TO PULL IT
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 6.8,
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.6} outerStyle={{paddingBottom: 90}}>
        HE PULLS AND PULLS
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 8.5,
    motion: 'pan-left',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        IT IS TOO HEAVY TO MOVE
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 16.83,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.4}
        title={
          <>
            CAN YOU BUILD
            <br />
            THE ELECTRIC TRACTOR?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const ELECTRIC_TRACTOR_SCENE_FRAMES = ELECTRIC_TRACTOR_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = ELECTRIC_TRACTOR_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const ElectricTractorMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of ELECTRIC_TRACTOR_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = ELECTRIC_TRACTOR_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={ELECTRIC_TRACTOR_SCENE_FRAMES[index]}
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
        const duration = ELECTRIC_TRACTOR_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === ELECTRIC_TRACTOR_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={ELECTRIC_TRACTOR_SCENES[index].image}
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
