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
//  golf1.png   classroom — golf challenge intro (ball/hole ready, the rule)
//  golf2.png   split-screen "Too Soft / Too Hard" — the force problem
//  golf3.png   building the gear machine — the build mission
import scene1 from '../assets/golf/golf1.png';
import scene2 from '../assets/golf/golf2.png';
import scene3 from '../assets/golf/golf3.png';

const FPS = 30;
const XFADE = 14; // frames — soft crossfade per project taste

export type SceneDef = {
  image: string;
  duration: number; // seconds
  motion: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'route';
  overlay?: React.ReactNode;
};

// Scene timings locked to the voiceover (48.72s) — cuts land on narration pauses.
// Narration story beats -> image:
//   0.0–14.40  "Today is the golf challenge... you cannot touch the ball."      -> golf1.png classroom
//  14.40–30.00 "We need something to hit it... too softly/too hard"             -> golf2.png force split
//  30.00–50.00 "Can you help us? build something... Think. Build. Test."        -> golf3.png build machine
export const SCENES: SceneDef[] = [
  {
    image: scene1,
    duration: 14.4,
    motion: 'zoom-in',
    overlay: (
      <MissionText style="label" delay={0.6} align="left" outerStyle={{paddingLeft: 110, paddingTop: 70, alignItems: 'flex-start'}}>
        THE GOLF CHALLENGE
      </MissionText>
    ),
  },
  {
    image: scene2,
    duration: 15.6, // 14.4 -> 30.0
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        TOO SOFT, OR TOO HARD?
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 20.0, // 30.0 -> 50.0 (hold past narration end)
    motion: 'zoom-in',
    overlay: (
      <FinalCard
        showAt={0.4}
        title={
          <>
            CAN YOUR TEAM COMPLETE
            <br />
            THE GOLF CHALLENGE?
          </>
        }
        tagline="Think • Build • Test"
      />
    ),
  },
];

// Integer frame durations and cumulative starts (single source of truth).
export const SCENE_FRAMES = SCENES.map((s) => Math.round(s.duration * FPS));
export const TOTAL_FRAMES = SCENE_FRAMES.reduce((a, b) => a + b, 0);

export const GolfMission: React.FC = () => {
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
      <Audio src={staticFile('golf-narration.mp3')} volume={1} />

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