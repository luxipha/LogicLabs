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
//  rader1.png LogicLab picnic day — mission intro
//  radar2.png Teacher spots dark clouds — weather focus
//  radar3.png Storm approaching the school — far away
//  radar4.png "Can you help us?" — team called to action
//  radar5.png STEM QUEST: How can we search far away?
//  radar6.png FINAL: Think • Look • Discover
import scene1 from '../assets/BricksMoto/radar/rader1.png';
import scene2 from '../assets/BricksMoto/radar/radar2.png';
import scene3 from '../assets/BricksMoto/radar/radar3.png';
import scene4 from '../assets/BricksMoto/radar/radar4.png';
import scene5 from '../assets/BricksMoto/radar/radar5.png';
import scene6 from '../assets/BricksMoto/radar/radar6.png';

const FPS = 30;
const XFADE = 14; // frames — soft crossfade per project taste

export type SceneDef = {
  image: string;
  duration: number; // seconds
  motion: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'route';
  overlay?: React.ReactNode;
};

// Scene timings locked to the new voiceover (43.6s) — cuts land on narration pauses.
// Narration story beats -> image:
//   0.0–6.88   "Today is picnic day at LogicLab School..."              -> rader1.png picnic
//   6.88–14.72 "But then the teacher looks at the sky... dark clouds"   -> radar2.png weather
//  14.72–25.36 "Hmm, is a storm coming?... too far away to see clearly" -> radar3.png storm
//  25.36–32.96 "Can you help us? find the storm before it reaches us"   -> radar4.png ask team
//  32.96–38.96 "build something that can search far away"               -> radar5.png STEM quest
//  38.96–43.6  "Think. Look. Discover."                                  -> radar6.png banner
export const SCENES: SceneDef[] = [
  {
    image: scene1,
    duration: 6.88,
    motion: 'zoom-in',
    // establishing shot — chalkboard already reads "TODAY'S PLAN"
  },
  {
    image: scene2,
    duration: 7.84, // 6.88 -> 14.72
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        THE TEACHER SPOTS DARK CLOUDS
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 10.64, // 14.72 -> 25.36
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.6} outerStyle={{paddingBottom: 90}}>
        IS A STORM COMING?
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 7.6, // 25.36 -> 32.96
    motion: 'route',
    // artwork already carries the "Can you help us?" speech bubble
  },
  {
    image: scene5,
    duration: 6.0, // 32.96 -> 38.96
    motion: 'zoom-in',
    // artwork already carries the "STEM QUEST / How can we search far away?" sign
  },
  {
    image: scene6,
    duration: 6.0, // 38.96 -> ~44.96 (hold past narration end)
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.4}
        title={
          <>
            CAN YOU FIND
            <br />
            THE STORM?
          </>
        }
        tagline="Think • Look • Discover"
      />
    ),
  },
];

// Integer frame durations and cumulative starts (single source of truth).
export const SCENE_FRAMES = SCENES.map((s) => Math.round(s.duration * FPS));
export const TOTAL_FRAMES = SCENE_FRAMES.reduce((a, b) => a + b, 0);

export const RadarMission: React.FC = () => {
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
      <Audio src={staticFile('radar-narration.mp3')} volume={1} />

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
