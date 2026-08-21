import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export type TextStyle = 'label' | 'heading' | 'title' | 'mission' | 'alert';

const getStyles = (style: TextStyle): React.CSSProperties => {
  switch (style) {
    case 'label':
      return {
        fontSize: 44,
        fontWeight: 700,
        letterSpacing: '0.05em',
        color: '#fff',
        textShadow: '0 2px 14px rgba(0,0,0,0.45)',
      };
    case 'heading':
      return {
        fontSize: 64,
        fontWeight: 800,
        letterSpacing: '0.02em',
        color: '#fff',
        textShadow: '0 3px 18px rgba(0,0,0,0.5)',
      };
    case 'title':
      return {
        fontSize: 72,
        fontWeight: 800,
        letterSpacing: '0.02em',
        color: '#fff',
        textShadow: '0 3px 18px rgba(0,0,0,0.5)',
      };
    case 'mission':
      return {
        fontSize: 84,
        fontWeight: 800,
        letterSpacing: '0.02em',
        color: '#fff',
        textShadow: '0 4px 24px rgba(0,0,0,0.55)',
      };
    case 'alert':
      return {
        fontSize: 48,
        fontWeight: 800,
        letterSpacing: '0.12em',
        color: '#fff',
        textShadow: '0 2px 10px rgba(0,0,0,0.5)',
      };
    default:
      return {};
  }
};

/**
 * Reusable mission text with a soft fade+scale entrance.
 */
export const MissionText: React.FC<{
  children: React.ReactNode;
  style?: TextStyle;
  delay?: number; // seconds
  align?: 'left' | 'center' | 'right';
  className?: string;
  outerStyle?: React.CSSProperties;
}> = ({children, style = 'heading', delay = 0, align = 'center', className, outerStyle}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = (frame - delay * fps) / fps;

  const opacity = interpolate(t, [0, 0.5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = spring({
    frame: t * fps,
    fps,
    config: {damping: 14, stiffness: 120, mass: 0.7},
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
        ...outerStyle,
      }}
    >
      <div
        className={className}
        style={{
          opacity,
          transform: `scale(${0.96 + 0.04 * scale})`,
          textAlign: align,
          ...getStyles(style),
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
