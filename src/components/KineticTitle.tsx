import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/**
 * Kinetic typography — each character springs in sequentially.
 * Reusable: `text`, `fontSize`, `color`, `stagger` (frames between chars).
 */
export const KineticTitle: React.FC<{
  text: string;
  fontSize?: number;
  color?: string;
  stagger?: number; // frames between each char
}> = ({text, fontSize = 96, color = '#ffffff', stagger = 3}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
      }}
    >
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
        {text.split('').map((char, i) => {
          if (char === ' ') {
            return <span key={i} style={{width: fontSize * 0.35}} />;
          }
          const charFrame = frame - i * stagger;
          const opacity = interpolate(charFrame, [0, 12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const scale = spring({
            frame: charFrame,
            fps,
            config: {damping: 12, stiffness: 180, mass: 0.5},
          });
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                fontSize,
                fontWeight: 800,
                color,
                opacity,
                scale: 0.6 + 0.4 * scale,
                translate: `0 ${(1 - scale) * -18}px`,
                textShadow: '0 4px 24px rgba(0,0,0,0.5)',
              }}
            >
              {char}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
