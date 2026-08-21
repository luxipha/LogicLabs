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
// Story mapping (verified from artwork):
//  1.png LogicLab school — mission intro
//  2.png Our Apple Tree Project — puzzled gardener
//  3.png Apple Tree Needs Help! — message sent to LogicLab STEM team
//  4.png Why do animals come to the flowers? — nectar & pollen
//  5.png FINAL CHALLENGE: How do flowers become apples?
import scene1 from '../assets/apple_assets/apple-1.png';
import scene2 from '../assets/apple_assets/apple-2.png';
import scene3 from '../assets/apple_assets/apple-3.png';
import scene4 from '../assets/apple_assets/apple-4.png';
import scene5 from '../assets/apple_assets/apple-5.png';

const FPS = 30;
const XFADE = 14; // frames — soft crossfade per project taste

export type SceneDef = {
  image: string;
  duration: number; // seconds
  motion: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'route';
  overlay?: React.ReactNode;
};

// Scene timings locked to the new voiceover (43s) — cuts land on narration pauses.
// Narration story beats -> image:
//   0.0–8.0    "Welcome to LogicLab..."                                   -> 1.png school
//   8.0–16.0   "Our Apple Tree Project... the tree needs our help"        -> 2.png gardener
//  16.0–24.0   "Help! Apple tree problem... the STEM team gets the call"  -> 3.png message
//  24.0–33.0   "Animals come to the flowers for nectar and pollen..."     -> 4.png pollination
//  33.0–43.0   "Final challenge: How do flowers become apples?"            -> 5.png challenge
export const SCENES: SceneDef[] = [
  {
    image: scene1,
    duration: 8.0,
    motion: 'zoom-in',
    overlay: (
      <MissionText style="label" delay={0.6} align="left" outerStyle={{paddingLeft: 110, paddingTop: 70, alignItems: 'flex-start'}}>
        WELCOME TO LOGICLAB
      </MissionText>
    ),
  },
  {
    image: scene2,
    duration: 8.0,
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        OUR APPLE TREE NEEDS HELP
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 8.0,
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.6} outerStyle={{paddingBottom: 90}}>
        APPLE TREE NEEDS HELP!
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 9.0,
    motion: 'route',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        ANIMALS COME FOR NECTAR & POLLEN
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 10.0,
    motion: 'zoom-in',
    overlay: (
      <FinalCard showAt={2.5} />
    ),
  },
];

// Integer frame durations and cumulative starts (single source of truth).
export const SCENE_FRAMES = SCENES.map((s) => Math.round(s.duration * FPS));
export const TOTAL_FRAMES = SCENE_FRAMES.reduce((a, b) => a + b, 0);

export const AppleMission: React.FC = () => {
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
      <Audio src={staticFile('apple-narration.mp3')} volume={1} />

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
