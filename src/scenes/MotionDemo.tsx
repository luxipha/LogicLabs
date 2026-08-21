import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {SvgRing} from '../components/SvgRing';
import {KineticTitle} from '../components/KineticTitle';

/**
 * Demo composition: self-drawing SVG ring + kinetic typography.
 * Proves Remotion can build real motion graphics — pure code, no images.
 */
export const MotionDemo: React.FC = () => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();

  // subtitle fades in after the ring finishes drawing
  const subtitleOpacity = interpolate(frame, [4 * fps, 5 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#0b1b2b'}}>
      <SvgRing drawDuration={2.5} />

      <Sequence from={1 * fps}>
        <KineticTitle text="LY SON" fontSize={110} color="#ffffff" stagger={4} />
      </Sequence>

      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 140,
          opacity: subtitleOpacity,
        }}
      >
        <div
          style={{
            fontSize: 40,
            color: '#ffb347',
            letterSpacing: '0.3em',
            fontWeight: 700,
          }}
        >
          ENGINEERING MISSION
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
