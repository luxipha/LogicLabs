import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  1.png  the class claps and cheers, maker kit on the table      -> our classroom is getting smarter
//  2.png  one room split in two: lamp glowing under a night sky,
//         lamp dark beside a bright sun                          -> the light knows dark from bright
//  3.png  the four peer down, puzzled, into a box of beams and gears
//                                                                 -> a heavy box on the floor
//  4.png  the teacher strains to lift the box, children shocked    -> too heavy by hand
//  5.png  a child grabs the box too, both gritting their teeth     -> still too heavy
//  7.png  the teacher crouches, arm raised, explaining eagerly     -> can we build a helper?
//  6.png  hands on chins, a thought bubble showing a robot arm
//         with a gripper claw                                    -> reach, bend, grab, lift
//  8.png  arms wide, the class delighted around the parts box      -> the mission
//
// Note the deck order: 2.png (the light that works by itself) is narrated
// before 1.png (the cheer), and 7.png (the teacher asking) is narrated before
// 6.png (the children thinking it over). The scene order below follows the
// narration (2, 1, 3, 4, 5, 7, 6, 8) so each still lands on the line it
// illustrates. All eight supplied images are used exactly once.
import scene1 from '../assets/robot-arm/1.png';
import scene2 from '../assets/robot-arm/2.png';
import scene3 from '../assets/robot-arm/3.png';
import scene4 from '../assets/robot-arm/4.png';
import scene5 from '../assets/robot-arm/5.png';
import scene6 from '../assets/robot-arm/6.png';
import scene7 from '../assets/robot-arm/7.png';
import scene8 from '../assets/robot-arm/8.png';
import narration from '../assets/robot-arm/ElevenLabs_2026-10-17T10_58_16_Jane - Professional Audiobook Reader_pvc_sp100_s40_sb40_v3.mp3';

const FPS = 30;
const XFADE = 14;

export type RobotArmSceneDef = {
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

// Scene cuts sit on silent pauses measured in the voiceover (64.84s of
// narration), so no crossfade lands on a word. Each cut is the end of a pause
// backed off by 0.15s, and the 14-frame (0.467s) fade fits fully inside it:
//   0.00–11.85  "the smart classroom needs a helping hand. The children have
//                just finished their automatic light..."  (pause 11.00–12.00) -> 2.png
//  11.85–20.53  "the children cheer, our classroom is getting smarter"
//                                                        (pause 20.02–20.68) -> 1.png
//  20.53–25.20  "the teacher sees a heavy box of building materials on the
//                floor"                                  (pause 24.49–25.35) -> 3.png
//  25.20–30.29  "she needs to move it onto the table. She tries to lift it.
//                Oh, it's too heavy"                     (pause 29.82–30.44) -> 4.png
//  30.29–34.79  "one child comes to help. They try together. Still too heavy"
//                                                        (pause 33.45–34.94) -> 5.png
//  34.79–40.87  "the teacher looks around the smart classroom. Our light can
//                work by itself"                         (pause 40.06–41.02) -> 7.png
//  40.87–52.20  "can we build something else that can help us? The children
//                think. What could reach, bend, grab and lift?"
//                                                        (pause 51.35–52.35) -> 6.png
//  52.20–65.40  "your mission. Build a machine that can reach, grab and move
//                the heavy box. Think, build, test."                        -> 8.png
export const ROBOT_ARM_SCENES: RobotArmSceneDef[] = [
  {
    image: scene2,
    duration: 11.85,
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
          THE ROBOT ARM
        </MissionText>
        <MissionText style="heading" delay={4.2} outerStyle={{paddingBottom: 90}}>
          A CLASSROOM THAT WORKS BY ITSELF
        </MissionText>
      </>
    ),
  },
  {
    image: scene1,
    duration: 8.68,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={2} outerStyle={{paddingBottom: 90}}>
        GETTING SMARTER!
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 4.67,
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.5} outerStyle={{paddingBottom: 90}}>
        A HEAVY BOX ON THE FLOOR
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 5.09,
    motion: 'pan-left',
    overlay: (
      <MissionText style="heading" delay={0.6} outerStyle={{paddingBottom: 90}}>
        TOO HEAVY BY HAND
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 4.5,
    motion: 'pan-up',
    overlay: (
      <MissionText style="heading" delay={0.5} outerStyle={{paddingBottom: 90}}>
        STILL TOO HEAVY
      </MissionText>
    ),
  },
  {
    image: scene7,
    duration: 6.08,
    motion: 'pan-down',
    overlay: (
      <MissionText style="heading" delay={2.5} outerStyle={{paddingBottom: 90}}>
        CAN WE BUILD A HELPER?
      </MissionText>
    ),
  },
  {
    image: scene6,
    duration: 11.33,
    motion: 'pan-left-slight',
    overlay: (
      <MissionText style="heading" delay={1} outerStyle={{paddingBottom: 90}}>
        REACH • BEND • GRAB • LIFT
      </MissionText>
    ),
  },
  {
    image: scene8,
    duration: 13.2,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.5}
        title={
          <>
            CAN YOU BUILD A ROBOT ARM
            <br />
            TO LIFT THE HEAVY BOX?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const ROBOT_ARM_SCENE_FRAMES = ROBOT_ARM_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = ROBOT_ARM_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const RobotArmMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of ROBOT_ARM_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = ROBOT_ARM_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={ROBOT_ARM_SCENE_FRAMES[index]}
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
        const duration = ROBOT_ARM_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === ROBOT_ARM_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={ROBOT_ARM_SCENES[index].image}
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
