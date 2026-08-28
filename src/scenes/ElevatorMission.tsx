import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Camera, KenBurnsImage} from '../components/KenBurnsImage';
import {Whoosh} from '../components/SceneTransition';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Scene images (1672x941 source, displayed 16:9 cover)
// Story mapping (verified from artwork + narration):
//  1.png    hallway — delivery arrives, robot-parts box on the floor
//  2.png    stairs — teacher points up, box needs to go upstairs
//  3.png    teacher struggles to lift the heavy box up the stairs
//  4.png    the team thinks — hand on chin, "what do we do?"
//  5.png    HEAVY BOX TEAM CHALLENGE — build bin of gears, mission intro
import scene1 from '../assets/elevator/1.png';
import scene2 from '../assets/elevator/2.png';
import scene3 from '../assets/elevator/3.png';
import scene4 from '../assets/elevator/4.png';
import scene5 from '../assets/elevator/5.png';

const FPS = 30;
const XFADE = 14; // frames — soft crossfade per project taste

export type SceneDef = {
  image: string;
  duration: number; // seconds
  motion: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'route';
  overlay?: React.ReactNode;
};

// Scene timings locked to the voiceover (46.68s) — cuts land on narration pauses.
// Narration story beats -> image:
//   0.0–7.0    "What is in the box? Robot parts."                      -> 1.png hallway delivery
//   7.0–14.0   "Is the box light or heavy? Heavy. ... Upstairs."       -> 2.png teacher points up
//  14.0–22.0   "Can the teacher carry it easily? No. ... lift."        -> 3.png struggling to lift
//  22.0–30.0   "What do we need to do? ... a machine."                 -> 4.png team thinking
//  30.0–46.68  "Should our machine move up or down? ... build!"        -> 5.png team challenge
export const SCENES: SceneDef[] = [
  {
    image: scene1,
    duration: 7.0,
    motion: 'zoom-in',
    overlay: (
      <MissionText style="label" delay={0.6} align="left" outerStyle={{paddingLeft: 110, paddingTop: 70, alignItems: 'flex-start'}}>
        A DELIVERY ARRIVES
      </MissionText>
    ),
  },
  {
    image: scene2,
    duration: 7.0, // 7.0 -> 14.0
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        THE BOX NEEDS TO GO UPSTAIRS
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 8.0, // 14.0 -> 22.0
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingBottom: 90}}>
        IT'S TOO HEAVY TO CARRY
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 8.0, // 22.0 -> 30.0
    motion: 'route',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        WHAT DO WE NEED TO DO?
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 16.68, // 30.0 -> 46.68 (hold past narration end)
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.4}
        title={
          <>
            CAN YOU BUILD
            <br />
            THE ELEVATOR?
          </>
        }
        tagline="Think • Build • Lift"
      />
    ),
  },
];

// Integer frame durations and cumulative starts (single source of truth).
export const SCENE_FRAMES = SCENES.map((s) => Math.round(s.duration * FPS));
export const TOTAL_FRAMES = SCENE_FRAMES.reduce((a, b) => a + b, 0);

export const ElevatorMission: React.FC = () => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();

  const starts: number[] = [];
  let acc = 0;
  for (const n of SCENE_FRAMES) {
    starts.push(acc);
    acc += n;
  }

  const renderScene = (index: number, local: number) => {
    const s = SCENES[index];
    const dur = SCENE_FRAMES[index];
    return (
      <Camera type={s.motion} frame={Math.max(0, local)} duration={dur}>
        <KenBurnsImage src={s.image} />
        {s.overlay}
      </Camera>
    );
  };

  return (
    <AbsoluteFill style={{backgroundColor: '#0b1b2b'}}>
      {/* narration is the master audio track */}
      <Audio src={staticFile('elevator-narration.mp3')} volume={1} />

      {starts.map((start, i) => {
        const dur = SCENE_FRAMES[i];
        // Sequence starts XFADE frames early so the incoming scene crossfades
        // over the tail of the previous one; the last scene needs no tail.
        const seqFrom = i === 0 ? 0 : start - XFADE;
        const seqDur = i === SCENES.length - 1 ? dur : dur + XFADE;
        const local = frame - seqFrom;

        if (frame < seqFrom || frame >= seqFrom + seqDur) {
          return null;
        }

        // fade in over the first XFADE frames (scene 0 appears immediately)
        const fadeIn = i === 0 ? 1 : Math.min(1, Math.max(0, local / XFADE));

        return (
          <Sequence key={i} from={seqFrom} durationInFrames={seqDur}>
            <AbsoluteFill style={{opacity: fadeIn}}>
              {renderScene(i, local)}
              {i > 0 ? <Whoosh at={0} volume={0.1} /> : null}
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
