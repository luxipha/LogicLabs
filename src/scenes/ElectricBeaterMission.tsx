import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  01.png  teacher pours flour into the big glass bowl; eggs, butter, sugar
//          and milk lined up; the three children watch              -> making a birthday cake
//  03.png  the teacher stirs the bowl with a wooden spoon, the class
//          cheering her on                                          -> a child takes a spoon and mixes
//  04.png  a girl holds the wooden spoon and mixes the batter         -> mix and mix and mix
//  02.png  the class stares, shocked, into the bowl of lumpy batter   -> the mixture is still lumpy
//  05.png  a boy grips the spoon and stirs hard, teeth gritted        -> my arm is tired
//  06.png  hands on chins, a swirl of arrows glowing over the bowl    -> how can we mix this faster?
//  07.png  the class cheers; three bubbles show mixing mechanisms
//          (hand crank, motor with belt, propeller)                 -> find a machine: the mission
//
// Note the deck order: 02.png is the "still lumpy" reaction and belongs one
// beat later than 03/04.png, which show the mixing itself. The scene order
// below follows the narration (01, 03, 04, 02, 05, 06, 07) so each still lands
// on the line it illustrates. All seven supplied images are used exactly once.
import scene1 from '../assets/electric_beater/01.png';
import scene2 from '../assets/electric_beater/03.png';
import scene3 from '../assets/electric_beater/04.png';
import scene4 from '../assets/electric_beater/02.png';
import scene5 from '../assets/electric_beater/05.png';
import scene6 from '../assets/electric_beater/06.png';
import scene7 from '../assets/electric_beater/07.png';
import narration from '../assets/electric_beater/electricbeater.mp3';

const FPS = 30;
const XFADE = 14;

export type ElectricBeaterSceneDef = {
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

// Scene cuts sit on silent pauses measured in the voiceover (46.21s of
// narration), so no crossfade lands on a word. Each cut is the end of a pause
// backed off by 0.15s, and the 14-frame (0.467s) fade fits fully inside it:
//   0.00– 9.26  "the birthday cake mix. Today the class is making a birthday
//                cake. The teacher puts the cake mixture into a big bowl"
//                                                      (pause 8.57–9.41)   -> 01.png
//   9.26–12.72  "one child takes a spoon and starts to mix"
//                                                      (pause 11.69–12.87) -> 03.png
//  12.72–17.41  "mix and mix and mix"                  (pause 16.44–17.56) -> 04.png
//  17.41–23.84  "but the mixture is still lumpy. Another child tries, they
//                stir faster"                          (pause 22.90–23.99) -> 02.png
//  23.84–28.44  "my arm is tired. The children look at the bowl"
//                                                      (pause 27.58–28.59) -> 05.png
//  28.44–33.84  "how can we mix this faster? How can we make it smooth?"
//                                                      (pause 32.67–33.99) -> 06.png
//  33.84–46.84  "your mission is find a machine that can mix the ingredients
//                quickly and make the cake mixture smooth. Think. Build. Test."
//                                                                           -> 07.png
export const ELECTRIC_BEATER_SCENES: ElectricBeaterSceneDef[] = [
  {
    image: scene1,
    duration: 9.26,
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
          THE ELECTRIC BEATER
        </MissionText>
        <MissionText style="heading" delay={2.4} outerStyle={{paddingBottom: 90}}>
          TODAY THE CLASS MAKES A BIRTHDAY CAKE
        </MissionText>
      </>
    ),
  },
  {
    image: scene2,
    duration: 3.46,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={0.3} outerStyle={{paddingBottom: 90}}>
        A CHILD TAKES A SPOON AND MIXES
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 4.69,
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
        MIX AND MIX AND MIX
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 6.43,
    motion: 'pan-left',
    overlay: (
      <>
        <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
          THE MIXTURE IS STILL LUMPY
        </MissionText>
        <MissionText style="heading" delay={3.4} outerStyle={{paddingTop: 80}}>
          ANOTHER CHILD STIRS FASTER
        </MissionText>
      </>
    ),
  },
  {
    image: scene5,
    duration: 4.6,
    motion: 'zoom-in',
    overlay: (
      <>
        <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
          MY ARM IS TIRED
        </MissionText>
        <MissionText style="heading" delay={2.6} outerStyle={{paddingTop: 80}}>
          THE CHILDREN LOOK AT THE BOWL
        </MissionText>
      </>
    ),
  },
  {
    image: scene6,
    duration: 5.4,
    motion: 'pan-right',
    overlay: (
      <>
        <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
          HOW CAN WE MIX THIS FASTER?
        </MissionText>
        <MissionText style="heading" delay={2.9} outerStyle={{paddingTop: 80}}>
          HOW CAN WE MAKE IT SMOOTH?
        </MissionText>
      </>
    ),
  },
  {
    image: scene7,
    duration: 13,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.5}
        title={
          <>
            CAN YOU FIND A MACHINE
            <br />
            THAT MAKES THE MIXTURE SMOOTH?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const ELECTRIC_BEATER_SCENE_FRAMES = ELECTRIC_BEATER_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = ELECTRIC_BEATER_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const ElectricBeaterMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of ELECTRIC_BEATER_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = ELECTRIC_BEATER_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={ELECTRIC_BEATER_SCENE_FRAMES[index]}
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
        const duration = ELECTRIC_BEATER_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === ELECTRIC_BEATER_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={ELECTRIC_BEATER_SCENES[index].image}
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
