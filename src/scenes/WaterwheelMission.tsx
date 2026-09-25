import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  1.png  teacher and three children on a path, pointing at the village
//         and its stone bridge over the river                              -> the village beside a river
//  2.png  the group walking the village lane beside the canal at sunset     -> every day the river flows past
//  3.png  the four on the stone bridge at dusk, worried                     -> one evening it goes dark
//  4.png  at night they look up; the houses across the water are unlit      -> the lights go out, no power
//  5.png  on the moonlit bank, one child turns toward the rushing river     -> the water is still moving
//  6.png  crouched on the rocks, the teacher points into the fast water     -> it keeps moving with no power
//  7.png  a waterwheel diagram drawn in the sand, arrows for the flow       -> so much moving water to use
//  8.png  the team with sticks, a ship's wheel, rope and a blueprint        -> the mission
import scene1 from '../assets/waterwheel/1.png';
import scene2 from '../assets/waterwheel/2.png';
import scene3 from '../assets/waterwheel/3.png';
import scene4 from '../assets/waterwheel/4.png';
import scene5 from '../assets/waterwheel/5.png';
import scene6 from '../assets/waterwheel/6.png';
import scene7 from '../assets/waterwheel/7.png';
import scene8 from '../assets/waterwheel/8.png';
import narration from '../assets/waterwheel/waterwheel (1).mp3';

const FPS = 30;
const XFADE = 14;

export type WaterwheelSceneDef = {
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
// (67.79s of narration), so no crossfade lands in the middle of a word.
// Each cut sits at the end of a pause long enough to hold the 14-frame fade:
//   0.00– 6.67  "the village without power ... a small village beside a
//                fast moving river"           (pause 5.60–6.80)         -> 1.png
//   6.67–12.33  "every day the river flows past the houses"
//                                              (pause 11.70–12.30)      -> 2.png
//  12.33–17.20  "one evening, the village suddenly becomes dark"
//                                              (pause 16.40–17.30)      -> 3.png
//  17.20–28.60  "the lights go out, the houses have no power ... everything
//                is quiet and dark"            (pause 27.80–28.70)      -> 4.png
//  28.60–34.40  "then one child looks toward the river. the water is still
//                moving, fast and strong"       (pause 33.00–34.50)      -> 5.png
//  34.40–45.40  "the river keeps moving even when the lights are off ...
//                can we use the moving water to make power?"
//                                              (pause 43.80–45.50)      -> 6.png
//  45.40–50.80  "the children look at the river again. there is so much
//                moving water"                 (pause 49.80–50.90)      -> 7.png
//  50.80–68.37  "your mission is to find a way to use the river's movement
//                to make something turn ... think, build, test"
//                can your team bring power back to the village?         -> 8.png
export const WATERWHEEL_SCENES: WaterwheelSceneDef[] = [
  {
    image: scene1,
    duration: 6.65,
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
          THE WATERWHEEL
        </MissionText>
        <MissionText style="heading" delay={3.9} outerStyle={{paddingBottom: 90}}>
          A SMALL VILLAGE BESIDE A RIVER
        </MissionText>
      </>
    ),
  },
  {
    image: scene2,
    duration: 5.65,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={1.3} outerStyle={{paddingTop: 80}}>
        EVERY DAY THE RIVER FLOWS PAST
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 4.85,
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.3} outerStyle={{paddingBottom: 90}}>
        ONE EVENING • THE VILLAGE GOES DARK
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 11.4,
    motion: 'pan-left',
    overlay: (
      <>
        <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
          THE LIGHTS GO OUT
        </MissionText>
        <MissionText style="heading" delay={6.5} outerStyle={{paddingTop: 80}}>
          EVERYTHING IS QUIET AND DARK
        </MissionText>
      </>
    ),
  },
  {
    image: scene5,
    duration: 5.8,
    motion: 'zoom-in',
    overlay: (
      <MissionText style="heading" delay={1.5} outerStyle={{paddingBottom: 90}}>
        THE WATER IS STILL MOVING
      </MissionText>
    ),
  },
  {
    image: scene6,
    duration: 11,
    motion: 'zoom-out',
    overlay: (
      <>
        <MissionText style="heading" delay={1.3} outerStyle={{paddingBottom: 90}}>
          IT KEEPS MOVING WHEN THE LIGHTS ARE OFF
        </MissionText>
        <MissionText style="heading" delay={8.4} outerStyle={{paddingTop: 80}}>
          CAN THE WATER MAKE POWER?
        </MissionText>
      </>
    ),
  },
  {
    image: scene7,
    duration: 5.4,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={1.4} outerStyle={{paddingBottom: 90}}>
        SO MUCH MOVING WATER
      </MissionText>
    ),
  },
  {
    image: scene8,
    duration: 17.55,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.5}
        title={
          <>
            CAN YOU USE THE RIVER TO BRING
            <br />
            POWER BACK TO THE VILLAGE?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const WATERWHEEL_SCENE_FRAMES = WATERWHEEL_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = WATERWHEEL_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const WaterwheelMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of WATERWHEEL_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = WATERWHEEL_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={WATERWHEEL_SCENE_FRAMES[index]}
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
        const duration = WATERWHEEL_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === WATERWHEEL_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={WATERWHEEL_SCENES[index].image}
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
