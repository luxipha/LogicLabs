import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, Easing, interpolate} from 'remotion';

const WORDS = ['Design.', 'Build.', 'Test.', 'Improve.'];

/**
 * Mission tagline — each word fades/scales in sequentially.
 */
export const MissionTagline: React.FC<{
  style?: React.CSSProperties;
  wordStyle?: React.CSSProperties;
  delay?: number; // seconds before first word
  gap?: number; // seconds between words
}> = ({style, wordStyle, delay = 0, gap = 0.5}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
        ...style,
      }}
    >
      <div style={{display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center'}}>
        {WORDS.map((w, i) => {
          const t = (frame - (delay + i * gap) * fps) / fps;
          const opacity = interpolate(t, [0, 0.4], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const scale = spring({
            frame: t * fps,
            fps,
            config: {damping: 14, stiffness: 120, mass: 0.7},
          });
          return (
            <span
              key={i}
              style={{
                fontSize: 64,
                fontWeight: 800,
                color: '#ffb347',
                textShadow: '0 3px 18px rgba(0,0,0,0.55)',
                opacity,
                transform: `scale(${0.94 + 0.06 * scale})`,
                ...wordStyle,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Final title card: big question + tagline, held to the end.
 */
export const FinalCard: React.FC<{
  showAt?: number;
  title?: React.ReactNode;
  tagline?: string;
}> = ({showAt = 0, title, tagline}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = (frame - showAt * fps) / fps;
  const opacity = interpolate(t, [0, 0.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = spring({
    frame: t * fps,
    fps,
    config: {damping: 13, stiffness: 100, mass: 0.8},
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(8,16,28,0.72) 0%, rgba(8,16,28,0.35) 100%)',
        opacity,
        transform: `scale(${0.97 + 0.03 * scale})`,
        translate: "0px 203.7px"
      }}
    >
      <div style={{textAlign: 'center', padding: '0 120px'}}>
        <div
          style={{
            fontSize: 84,
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.15,
            textShadow: '0 4px 26px rgba(0,0,0,0.6)',
          }}
        >
          {title ?? (
            <>
              CAN YOU COMPLETE
              <br />
              THE MISSION?
            </>
          )}
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 52,
            fontWeight: 700,
            color: '#ffb347',
            letterSpacing: '0.05em',
            textShadow: '0 3px 18px rgba(0,0,0,0.55)',
          }}
        >
          {tagline ?? 'Design • Build • Test • Improve'}
        </div>
      </div>
    </AbsoluteFill>
  );
};
