import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  1.png  salmon underwater over the riverbed, mouth open, light rays      -> born in a river
//  2.png  young spotted salmon gliding through a shallow clear stream      -> it grows and swims away
//  3.png  aerial coastline, salmon heading through turquoise shallows      -> out into the big ocean
//  4.png  deep ocean, salmon ringed by a school of fish and three sharks   -> it swims far from home
//  5.png  open water, the salmon with many other salmon behind it          -> days pass, then years
//  6.png  salmon breaking the surface, forested shore and mountains beyond -> time to go back
//  7.png  aerial river delta, salmon threading forested tidal channels     -> many rivers, which is home?
//  8.png  salmon powering through mountain-river rapids                    -> the mission
import scene1 from '../assets/salmon/1.png';
import scene2 from '../assets/salmon/2.png';
import scene3 from '../assets/salmon/3.png';
import scene4 from '../assets/salmon/4.png';
import scene5 from '../assets/salmon/5.png';
import scene6 from '../assets/salmon/6.png';
import scene7 from '../assets/salmon/7.png';
import scene8 from '../assets/salmon/8.png';
import narration from '../assets/salmon/salmon.mp3';

const FPS = 30;
const XFADE = 14;

export type SalmonSceneDef = {
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

// Scene cuts follow the measured silent pauses in the voiceover (60.84s of
// narration) so no crossfade lands in the middle of a word. Each cut sits at
// the end of a pause long enough to hold the 14-frame fade:
//   0.00– 5.66  "The fish that lost its way. A young salmon is born in a
//               river."                     (pause 4.67–5.81)        -> 1.png
//   5.66–11.99  "When it grows bigger, it swims away from the river and out
//               into the big ocean."        (pause 10.85–12.14)      -> 2.png
//  11.99–14.74  "The ocean is huge."         (pause 14.05–14.89)      -> 3.png
//  14.74–19.33  "The salmon swims far, very far from home."
//                                             (pause 18.37–19.48)      -> 4.png
//  19.33–24.80  "Days pass. Then months. Then years."
//                                             (pause 23.77–24.95)      -> 5.png
//  24.80–32.11  "One day, it is time to go back. The salmon turns toward the
//               land, but there is a problem." (pause 31.33–32.26)    -> 6.png
//  32.11–49.38  "There are many rivers. Which one is home? The salmon cannot
//               read a map. It cannot ask for directions. It looks at one
//               river, then another, then another. How can I find my way
//               home?"                        (pause 48.45–49.53)     -> 7.png
//  49.38–61.38  "Your mission is to discover how a salmon can find the correct
//               river again. Look, think, discover. Can your team solve the
//               salmon mystery?"                                       -> 8.png
export const SALMON_SCENES: SalmonSceneDef[] = [
  {
    image: scene1,
    duration: 5.66,
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
          THE SALMON
        </MissionText>
        <MissionText style="heading" delay={2.9} outerStyle={{paddingBottom: 90}}>
          A YOUNG SALMON IS BORN IN A RIVER
        </MissionText>
      </>
    ),
  },
  {
    image: scene2,
    duration: 6.33,
    motion: 'pan-right',
    overlay: (
      <>
        <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
          IT SWIMS AWAY FROM THE RIVER
        </MissionText>
        <MissionText style="heading" delay={3.4} outerStyle={{paddingTop: 80}}>
          AND OUT INTO THE BIG OCEAN
        </MissionText>
      </>
    ),
  },
  {
    image: scene3,
    duration: 2.75,
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.3} outerStyle={{paddingTop: 80}}>
        THE OCEAN IS HUGE
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 4.59,
    motion: 'pan-left',
    overlay: (
      <>
        <MissionText style="heading" delay={0.3} outerStyle={{paddingBottom: 90}}>
          IT SWIMS FAR
        </MissionText>
        <MissionText style="heading" delay={2.1} outerStyle={{paddingTop: 80}}>
          VERY FAR FROM HOME
        </MissionText>
      </>
    ),
  },
  {
    image: scene5,
    duration: 5.47,
    motion: 'zoom-in',
    overlay: (
      <>
        <MissionText style="heading" delay={0.2} outerStyle={{paddingBottom: 90}}>
          DAYS PASS
        </MissionText>
        <MissionText style="heading" delay={2.0} outerStyle={{paddingTop: 80}}>
          THEN MONTHS… THEN YEARS
        </MissionText>
      </>
    ),
  },
  {
    image: scene6,
    duration: 7.31,
    motion: 'zoom-out',
    overlay: (
      <>
        <MissionText style="heading" delay={0.2} outerStyle={{paddingBottom: 90}}>
          ONE DAY, IT IS TIME TO GO BACK
        </MissionText>
        <MissionText style="heading" delay={3.1} outerStyle={{paddingTop: 80}}>
          IT TURNS TOWARD THE LAND
        </MissionText>
      </>
    ),
  },
  {
    image: scene7,
    duration: 17.27,
    motion: 'pan-right',
    overlay: (
      <>
        {/* The aerial delta is bright and busy behind the text, so lay a soft
            centred scrim under the three centred lines to keep them legible. */}
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(ellipse 68% 42% at 50% 50%, rgba(4,16,28,0.55) 0%, rgba(4,16,28,0.2) 62%, rgba(4,16,28,0) 100%)',
          }}
        />
        <MissionText style="heading" delay={0.2} outerStyle={{paddingBottom: 90}}>
          THERE ARE MANY RIVERS
        </MissionText>
        <MissionText style="alert" delay={4.6}>
          IT CANNOT READ A MAP
        </MissionText>
        <MissionText style="heading" delay={14.4} outerStyle={{paddingTop: 80}}>
          HOW CAN I FIND MY WAY HOME?
        </MissionText>
      </>
    ),
  },
  {
    image: scene8,
    duration: 12.0,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.8}
        title={
          <>
            CAN YOU HELP THE SALMON
            <br />
            FIND ITS WAY HOME?
          </>
        }
        tagline="Look • Think • Discover"
      />
    ),
  },
];

export const SALMON_SCENE_FRAMES = SALMON_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = SALMON_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const SalmonMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of SALMON_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = SALMON_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={SALMON_SCENE_FRAMES[index]}
      >
        <KenBurnsImage src={scene.image} />
        {scene.overlay}
      </Camera>
    );
  };

  return (
    <AbsoluteFill style={{backgroundColor: '#06192b'}}>
      <Audio src={narration} volume={1} />

      {starts.map((start, index) => {
        const duration = SALMON_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === SALMON_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={SALMON_SCENES[index].image}
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
