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
import {AlertBanner} from '../components/AlertBanner';
import {MissionText} from '../components/MissionText';
import {FinalCard} from '../components/MissionTagline';

// Scene images (1672x941 source, displayed 16:9 cover)
// Definitive story mapping (verified from artwork):
//  1.png clinic delivery (outdoor, medical staff unloading)
//  2.png clinic urgency (outdoor, red warning sign)
//  3.png Hanoi warehouse packing supplies
//  4.png map route Hanoi -> Lý Sơn Island (SCENE 4 OF 8)
//  5.png classroom MISSION 5 OF 8 transport comparison
//  6.png classroom URGENT ENGINEERING REQUEST
//  7.png classroom MISSION: Design/Build/Test Hanoi -> Lý Sơn
//  8.png delivery success (kids cheer, plane overhead)
import scene1 from '../assets/1.png';
import scene2 from '../assets/2.png';
import scene3 from '../assets/3.png';
import scene4 from '../assets/4.png';
import scene5 from '../assets/5.png';
import scene6 from '../assets/6.png';
import scene7 from '../assets/7.png';
import scene8 from '../assets/8.png';

const FPS = 30;
const XFADE = 14; // frames — soft crossfade per project taste

export type SceneDef = {
  image: string;
  duration: number; // seconds
  motion: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'route';
  overlay?: React.ReactNode;
};

// Scene timings locked to the new voiceover (54s) — cuts land on narration pauses.
// Narration beats (from whisper word timestamps) -> image:
//   0.0–10.3  "Lý Sơn Island needs medical supplies... hospital running low"      -> 1.png clinic
//  10.3–17.3  "The hospital cannot wait... Good news! Hanoi has supplies"         -> 2.png clinic urgency
//  17.3–23.56 "But there is a problem... island is far away, must get there fast" -> 3.png Hanoi warehouse
//  23.56–29.07 "Some ways may take too long. We need a faster way."                -> 4.png route map
//  29.07–35.8  "An urgent message has come to LogicLab. The Hanoi government is asking engineers for help." -> 5.png mission 5 of 8
//  35.8–40.7   "Your mission is to design, build, and test an airplane..."         -> 6.png urgent request
//  40.7–45.68  "The supplies are ready. The people on the island are waiting. Now it is your turn." -> 7.png design/build/test
//  45.68–53.97 "Design. Build. Test. Improve. Can your team build the airplane and complete the mission?" -> 8.png delivery success
export const SCENES: SceneDef[] = [
  {
    image: scene1,
    duration: 10.3,
    motion: 'zoom-in',
    overlay: (
      <MissionText style="label" delay={0.6} align="left" outerStyle={{paddingLeft: 110, paddingTop: 70, alignItems: 'flex-start'}}>
        LÝ SƠN ISLAND NEEDS MEDICAL SUPPLIES
      </MissionText>
    ),
  },
  {
    image: scene2,
    duration: 7.0, // 10.3 -> 17.3
    motion: 'pan-right',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        THE HOSPITAL CANNOT WAIT
      </MissionText>
    ),
  },
  {
    image: scene3,
    duration: 6.26, // 17.3 -> 23.56
    motion: 'zoom-out',
    overlay: (
      <MissionText style="heading" delay={0.6} outerStyle={{paddingBottom: 90}}>
        GOOD NEWS — HANOI HAS THE SUPPLIES
      </MissionText>
    ),
  },
  {
    image: scene4,
    duration: 5.51, // 23.56 -> 29.07
    motion: 'route',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        WE NEED A FASTER WAY
      </MissionText>
    ),
  },
  {
    image: scene5,
    duration: 6.73, // 29.07 -> 35.8
    motion: 'zoom-in',
    overlay: (
      <MissionText style="heading" delay={0.8} outerStyle={{paddingTop: 80}}>
        ENGINEERS NEED A FASTER SOLUTION
      </MissionText>
    ),
  },
  {
    image: scene6,
    duration: 4.9, // 35.8 -> 40.7
    motion: 'pan-left',
    overlay: (
      <AlertBanner text="URGENT ENGINEERING REQUEST" top={80} delay={0.6} />
    ),
  },
  {
    image: scene7,
    duration: 4.98, // 40.7 -> 45.68
    motion: 'zoom-out',
    overlay: (
      <MissionText style="mission" delay={0.6}>
        DESIGN. BUILD. TEST.
      </MissionText>
    ),
  },
  {
    image: scene8,
    duration: 8.29, // 45.68 -> 53.97 (recap + final question)
    motion: 'zoom-in',
    overlay: (
      <FinalCard showAt={2.5} />
    ),
  },
];

// Integer frame durations and cumulative starts (single source of truth).
export const SCENE_FRAMES = SCENES.map((s) => Math.round(s.duration * FPS));
export const TOTAL_FRAMES = SCENE_FRAMES.reduce((a, b) => a + b, 0);

export const LysSonMission: React.FC = () => {
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
      <Audio src={staticFile('narration.mp3')} volume={1} />
      {/* background music, low under narration */}
      <Audio src={staticFile('music.wav')} volume={0.14} />

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
