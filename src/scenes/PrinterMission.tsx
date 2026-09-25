import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Story mapping (verified from artwork + narration):
//  1.png  teacher and three children behind the seated boy at the classroom
//         computer, a finished drawing of a house, tree and sun on screen   -> a picture on the computer
//  2.png  the same group at the desk, the drawing app's colour palette and
//         toolbar showing on the monitor                                    -> bright colours, shapes, details
//  3.png  the seated boy thinking, a thought bubble holding a tablet with
//         the drawing beside his backpack                                   -> I want to take it home
//  4.png  all four leaning in around the desk, the teacher thoughtful as the
//         picture sits on the screen                                        -> still stuck inside the screen
//  5.png  the teacher pointing at the screen, question marks floating over
//         the children's heads                                              -> is there a machine that can help?
import scene1 from '../assets/printer/1.png';
import scene2 from '../assets/printer/2.png';
import scene3 from '../assets/printer/3.png';
import scene4 from '../assets/printer/4.png';
import scene5 from '../assets/printer/5.png';
import narration from '../assets/printer/printer.mp3';

const FPS = 30;
const XFADE = 14;

export type PrinterSceneDef = {
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
// (60.53s of narration), so no crossfade lands in the middle of a word.
// Each cut sits at the end of a pause long enough to hold the 14-frame fade:
//   0.00– 6.83  "the picture is trapped in the computer ... the children are
//                making a beautiful picture on the computer"
//                                              (pause 6.04–6.98)        -> 1.png
//   6.83–13.20  "they choose bright colours, draw shapes, and add lots of
//                details"                      (pause 12.02–13.35)      -> 2.png
//  13.20–25.70  "finally the picture is finished ... 'wow, it looks amazing'
//                ... 'i want to take it home' ... but then they notice a
//                problem"                      (pause 24.90–25.85)      -> 3.png
//  25.70–38.70  "the picture is still inside the computer screen ... they
//                cannot pull it out, cannot hold it, cannot take the whole
//                computer home ... the children look at the screen"
//                                              (pause 38.02–38.84)      -> 4.png
//  38.70–61.20  "how can we put our picture onto paper? is there a machine
//                that can help us? ... your mission ... think, discover,
//                build. can your team solve the picture problem?"        -> 5.png
export const PRINTER_SCENES: PrinterSceneDef[] = [
  {
    image: scene1,
    duration: 6.83,
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
          THE PRINTER
        </MissionText>
        <MissionText style="heading" delay={3.4} outerStyle={{paddingBottom: 90}}>
          A BEAUTIFUL PICTURE ON THE COMPUTER
        </MissionText>
      </>
    ),
  },
  {
    image: scene2,
    duration: 6.37,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={0.6} outerStyle={{paddingTop: 80}}>
        BRIGHT COLOURS, SHAPES AND DETAILS
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 12.5,
    motion: 'zoom-out',
    overlay: (
      <>
        <MissionText style="heading" delay={0.4} outerStyle={{paddingBottom: 90}}>
          THE PICTURE IS FINISHED
        </MissionText>
        <MissionText style="heading" delay={7.9} outerStyle={{paddingTop: 80}}>
          I WANT TO TAKE IT HOME
        </MissionText>
      </>
    ),
  },
  {
    image: scene4,
    duration: 12.99,
    motion: 'pan-left',
    overlay: (
      <>
        <MissionText style="heading" delay={0.5} outerStyle={{paddingBottom: 90}}>
          THE PICTURE IS STILL IN THE SCREEN
        </MissionText>
        <MissionText style="heading" delay={9.4} outerStyle={{paddingTop: 80}}>
          THEY CANNOT TAKE IT HOME
        </MissionText>
      </>
    ),
  },
  {
    image: scene5,
    duration: 22.5,
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.5}
        title={
          <>
            CAN YOU MOVE THE PICTURE
            <br />
            FROM THE SCREEN ONTO PAPER?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

export const PRINTER_SCENE_FRAMES = PRINTER_SCENES.map((scene) =>
  Math.round(scene.duration * FPS),
);
export const TOTAL_FRAMES = PRINTER_SCENE_FRAMES.reduce(
  (total, frames) => total + frames,
  0,
);

export const PrinterMission: React.FC = () => {
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let elapsedFrames = 0;
  for (const sceneFrames of PRINTER_SCENE_FRAMES) {
    starts.push(elapsedFrames);
    elapsedFrames += sceneFrames;
  }

  const renderScene = (index: number, localFrame: number) => {
    const scene = PRINTER_SCENES[index];
    return (
      <Camera
        type={scene.motion}
        frame={Math.max(0, localFrame)}
        duration={PRINTER_SCENE_FRAMES[index]}
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
        const duration = PRINTER_SCENE_FRAMES[index];
        const sequenceFrom = index === 0 ? 0 : start - XFADE;
        const sequenceDuration =
          index === PRINTER_SCENES.length - 1 ? duration : duration + XFADE;
        const localFrame = frame - sequenceFrom;

        if (frame < sequenceFrom || frame >= sequenceFrom + sequenceDuration) {
          return null;
        }

        const opacity =
          index === 0 ? 1 : Math.min(1, Math.max(0, localFrame / XFADE));

        return (
          <Sequence
            key={PRINTER_SCENES[index].image}
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
