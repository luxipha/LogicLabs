import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (from the narration — the artwork could not be vision-verified
// in this session, so each picture is matched to the narration beat it illustrates):
//  1.png  the island and its tall, quiet mountain          -> the mountain that woke up
//  2.png  the ground shakes, the children look around      -> rumble, rumble!
//  3.png  white steam, then a blast                        -> steam, then boom
//  4.png  a huge cloud of ash rising into the sky          -> ash shoots into the sky
//  5.png  the teacher leads the children away              -> a safe place
//  6.png  the children asking questions                    -> why did it do that?
//  7.png  the mission: show gentle and strong eruptions    -> the mission
import scene1 from '../assets/volcanoe/1.png';
import scene2 from '../assets/volcanoe/2.png';
import scene3 from '../assets/volcanoe/3.png';
import scene4 from '../assets/volcanoe/4.png';
import scene5 from '../assets/volcanoe/5.png';
import scene6 from '../assets/volcanoe/6.png';
import scene7 from '../assets/volcanoe/7.png';
import narration from '../assets/volcanoe/ElevenLabs_2026-11-10T08_25_08_Roger - Laid-Back, Casual, Resonant_pre_s50_v3.mp3';

const FPS = 30;
const XFADE = 14;

export type VolcanoEruptionSceneDef = {
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
// (50.83s of narration), so no crossfade lands in the middle of a word.
// Each cut sits at the end of a pause long enough to hold the 14-frame fade:
//   0.00–10.44  "the mountain that woke up ... one sunny morning, the teacher
//                and her students explore a beautiful island. they see a tall,
//                quiet mountain"                        (pause 9.93–10.59)  -> 1.png
//  10.44–21.02  "suddenly, rumble, rumble, the ground begins to shake.
//                what's that sound?"                    (pause 20.48–21.17) -> 2.png
//  21.02–25.78  "white steam rises from the mountain, then ... boom ... a huge
//                cloud of ash shoots into the sky"       (pause 25.06–25.93) -> 3.png
//  25.78–29.20  "the teacher quickly leads everyone to a safe place"
//                                                       (pause 28.52–29.35) -> 4.png
//  29.20–34.15  "why did the mountain do that? ... can it happen gently or
//                very strongly?"                        (pause 33.66–34.30) -> 5.png
//  34.15–37.60  "how can we study this safely?"         (pause 36.80–37.75) -> 6.png
//  37.60–50.83  "your mission ... find a way to show gentle and strong
//                eruptions. build a model that you can control. think."   -> 7.png
export const VOLCANO_ERUPTION_SCENES: VolcanoEruptionSceneDef[] = [
  {
    image: scene1,
    duration: 10.44,
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
          THE VOLCANO
        </MissionText>
        <MissionText style="heading" delay={0.9} outerStyle={{paddingBottom: 90}}>
          THE MOUNTAIN THAT WOKE UP
        </MissionText>
        <MissionText style="heading" delay={6.4} outerStyle={{paddingTop: 80}}>
          A TALL, QUIET MOUNTAIN
        </MissionText>
      </>
    ),
  },
  {
    image: scene2,
    duration: 10.58,
    motion: 'pan-right',
    overlay: (
      <>
        <MissionText style="heading" delay={1.2} outerStyle={{paddingBottom: 90}}>
          RUMBLE! RUMBLE!
        </MissionText>
        <MissionText style="heading" delay={8.6} outerStyle={{paddingTop: 80}}>
          WHAT&apos;S THAT SOUND?
        </MissionText>
      </>
    ),
  },
  {
    image: scene3,
    duration: 4.76,
    motion: 'zoom-out',
    overlay: (
      <>
        <MissionText style="heading" delay={0.3} outerStyle={{paddingBottom: 90}}>
          WHITE STEAM RISES
        </MissionText>
        <MissionText style="heading" delay={2.8} outerStyle={{paddingTop: 80}}>
          BOOM! ASH SHOOTS UP
        </MissionText>
      </>
    ),
  },
  {
    image: scene4,
    duration: 3.42,
    motion: 'pan-left',
    overlay: (
      <MissionText style="heading" delay={0.7} outerStyle={{paddingBottom: 90}}>
        EVERYONE LEAVES TO A SAFE PLACE
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 4.95,
    motion: 'pan-up',
    overlay: (
      <>
        <MissionText style="heading" delay={0.8} outerStyle={{paddingBottom: 90}}>
          WHY DID THE MOUNTAIN DO THAT?
        </MissionText>
        <MissionText style="heading" delay={3.0} outerStyle={{paddingTop: 80}}>
          CAN IT HAPPEN GENTLY OR STRONGLY?
        </MissionText>
      </>
    ),
  },
  {
    image: scene6,
    duration: 3.45,
    motion: 'pan-down',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingBottom: 90}}>
        HOW CAN WE STUDY THIS SAFELY?
      </MissionText>
    ),
  },
  {
    image: scene7,
    duration: 13.23,
    motion: 'route',
    overlay: (
      <FinalCard
        showAt={0.5}
        title={
          <>
            CAN YOU SHOW GENTLE AND
            <br />
            STRONG ERUPTIONS?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const VOLCANO_ERUPTION_SCENE_FRAMES = VOLCANO_ERUPTION_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = VOLCANO_ERUPTION_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const VolcanoEruptionMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of VOLCANO_ERUPTION_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = VOLCANO_ERUPTION_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={VOLCANO_ERUPTION_SCENE_FRAMES[index]}
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
        const duration = VOLCANO_ERUPTION_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === VOLCANO_ERUPTION_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={VOLCANO_ERUPTION_SCENES[index].image}
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
