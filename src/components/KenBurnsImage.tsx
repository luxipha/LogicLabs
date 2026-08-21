import React from 'react';
import {AbsoluteFill, Img, Easing} from 'remotion';

export type KenBurnsType =
  | 'zoom-in'
  | 'zoom-out'
  | 'pan-left'
  | 'pan-right'
  | 'pan-up'
  | 'pan-down'
  | 'pan-right-slight'
  | 'pan-left-slight'
  | 'route'
  | 'static';

export type MotionParams = {
  zoom: number;
  x: number;
  y: number;
};

/**
 * Config-driven Ken Burns motion.
 * Returns a transform for progress p in [0,1] through a scene.
 */
export const getKenBurns = (type: KenBurnsType, p: number): MotionParams => {
  const e = Easing.inOut(Easing.cubic)(Math.max(0, Math.min(1, p)));

  switch (type) {
    case 'zoom-in':
      return {zoom: 1 + 0.07 * e, x: 0, y: 0};
    case 'zoom-out':
      return {zoom: 1.07 - 0.07 * e, x: 0, y: 0};
    case 'pan-left':
      return {zoom: 1.08, x: -0.035 * e, y: 0};
    case 'pan-right':
      return {zoom: 1.08, x: 0.035 * e, y: 0};
    case 'pan-up':
      return {zoom: 1.08, x: 0, y: -0.035 * e};
    case 'pan-down':
      return {zoom: 1.08, x: 0, y: 0.035 * e};
    case 'pan-right-slight':
      return {zoom: 1.05, x: 0.02 * e, y: 0};
    case 'pan-left-slight':
      return {zoom: 1.05, x: -0.02 * e, y: 0};
    case 'route':
      return {zoom: 1.05, x: -0.022 * e, y: 0.022 * e};
    case 'static':
    default:
      return {zoom: 1.04, x: 0, y: 0};
  }
};

/**
 * Static display image that fills the frame with cover-fit.
 */
export const KenBurnsImage: React.FC<{
  src: string;
  style?: React.CSSProperties;
}> = ({src, style}) => {
  return (
    <AbsoluteFill style={{overflow: 'hidden', ...style}}>
      <Img
        src={src}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Camera driver — owns the eased transform for a full scene.
 * frame/duration are scene-local so motion scales with config duration.
 */
export const Camera: React.FC<{
  type: KenBurnsType;
  frame: number;
  duration: number;
  children: React.ReactNode;
}> = ({type, frame, duration, children}) => {
  const p = duration > 0 ? frame / duration : 0;
  const {zoom, x, y} = getKenBurns(type, p);
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${zoom}) translate(${x * 100}%, ${y * 100}%)`,
        willChange: 'transform',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
