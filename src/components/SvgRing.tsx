import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

/**
 * Self-drawing SVG ring with a traveling dot and easing.
 * Pure SVG — no images, no external assets.
 * Reusable: change `size`, `strokeWidth`, `color`, duration via props.
 */
export const SvgRing: React.FC<{
  size?: number;
  strokeWidth?: number;
  color?: string;
  drawDuration?: number; // seconds for the ring to draw itself
  dotColor?: string;
}> = ({
  size = 560,
  strokeWidth = 14,
  color = '#4ec9ff',
  drawDuration = 2.2,
  dotColor = '#ffb347',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // eased draw progress (0→1)
  const drawP = interpolate(frame, [0, drawDuration * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // dot travels the ring once drawing finishes
  const dotP = interpolate(frame, [drawDuration * fps, (drawDuration + 1.2) * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const dotAngle = dotP * Math.PI * 2 - Math.PI / 2; // start at top
  const cx = size / 2;
  const cy = size / 2;
  const dotX = cx + radius * Math.cos(dotAngle);
  const dotY = cy + radius * Math.sin(dotAngle);

  // soft pulse on the dot
  const pulse = interpolate(frame % fps, [0, fps / 2, fps], [1, 1.35, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0b1b2b',
      }}
    >
      {/* faint full ring */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeOpacity={0.15}
          strokeWidth={strokeWidth}
        />
        {/* self-drawing ring via strokeDasharray */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - drawP)}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{filter: `drop-shadow(0 0 8px ${color})`}}
        />
        {/* traveling dot */}
        {dotP > 0.01 ? (
          <circle
            cx={dotX}
            cy={dotY}
            r={strokeWidth * 0.85}
            fill={dotColor}
            style={{filter: `drop-shadow(0 0 10px ${dotColor})`}}
            transform={`scale(${pulse})`}
            transform-origin={`${dotX}px ${dotY}px`}
          />
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
