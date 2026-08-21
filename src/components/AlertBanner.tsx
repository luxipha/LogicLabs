import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * Clean mission-alert banner for urgency moments.
 */
export const AlertBanner: React.FC<{
  text: string;
  top?: number;
  delay?: number; // seconds
}> = ({text, top = 90, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = (frame - delay * fps) / fps;
  const opacity = Math.min(1, Math.max(0, t / 0.4));
  const y = t < 0.4 ? (0.4 - t) * 60 : 0;

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        pointerEvents: 'none',
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          marginTop: top,
          background: '#d62839',
          color: '#fff',
          fontSize: 48,
          fontWeight: 800,
          letterSpacing: '0.14em',
          padding: '14px 44px',
          borderRadius: 14,
          boxShadow: '0 8px 30px rgba(214,40,57,0.35)',
          textTransform: 'uppercase',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
