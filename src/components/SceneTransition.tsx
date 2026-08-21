import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';

export type TransitionType = 'crossfade' | 'blur' | 'push';

/**
 * A crossfade transition between two scenes.
 * Render inside a Sequence with enough frames for the transition.
 */
export const Crossfade: React.FC<{
  from: React.ReactNode;
  to: React.ReactNode;
  duration?: number; // frames
  type?: TransitionType;
}> = ({from, to, duration = 14, type = 'crossfade'}) => {
  const frame = useCurrentFrame();
  const p = Math.min(1, frame / duration);
  const e = Easing.inOut(Easing.cubic)(p);

  const fromOpacity = interpolate(e, [0, 1], [1, 0]);
  const toOpacity = interpolate(e, [0, 1], [0, 1]);

  const pushFrom = type === 'push' ? interpolate(e, [0, 1], [0, -60]) : 0;
  const pushTo = type === 'push' ? interpolate(e, [0, 1], [60, 0]) : 0;

  const blurFrom = type === 'blur' ? interpolate(e, [0, 1], [0, 6]) : 0;
  const blurTo = type === 'blur' ? interpolate(e, [0, 1], [6, 0]) : 0;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: fromOpacity,
          transform: `translateY(${pushFrom}px)`,
          filter: blurFrom ? `blur(${blurFrom}px)` : undefined,
        }}
      >
        {from}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: toOpacity,
          transform: `translateY(${pushTo}px)`,
          filter: blurTo ? `blur(${blurTo}px)` : undefined,
        }}
      >
        {to}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Very subtle whoosh at scene transitions (kept quiet and tasteful).
 */
export const Whoosh: React.FC<{at: number; volume?: number}> = ({at, volume = 0.18}) => {
  return <Audio src={staticFile('sfx_whoosh.wav')} volume={volume} startFrom={at} />;
};
