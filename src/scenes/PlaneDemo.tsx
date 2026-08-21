import React, {Suspense} from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {ThreePlane} from '../components/ThreePlane';

/**
 * 3D demo: a low-poly airplane flies a banking path across the sky.
 * The camera is explicitly framed so the plane stays visible and centered
 * for the whole flight.
 */
export const PlaneDemo: React.FC = () => {
  const {width, height, fps, durationInFrames} = useVideoConfig();
  const frame = useCurrentFrame();

  // flight progress 0→1 across the whole composition
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  // gentle path that stays within the camera's view
  const x = interpolate(progress, [0, 0.5, 1], [-2.6, 0, 2.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const y = interpolate(progress, [0, 0.5, 1], [1.2, 2.4, 1.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const z = 1.5;

  // heading follows the path direction (facing the way it travels)
  const heading = interpolate(progress, [0, 0.5, 1], [-0.5, 0, 0.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleOpacity = interpolate(frame, [1 * fps, 2 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#0b1b2b'}}>
      {/* sky gradient */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(to bottom, #1a4a7a 0%, #2e6aa8 45%, #7fb2d9 100%)',
        }}
      />

      {/* sun glow */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '12%',
            right: '18%',
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,220,150,0.9), rgba(255,200,120,0) 70%)',
          }}
        />
      </AbsoluteFill>

      {/* 3D scene — camera framed on the flight path */}
      <ThreeCanvas
        width={width}
        height={height}
        camera={{position: [0, 2.2, 10.5], fov: 42, near: 0.1, far: 100}}
      >
        <ambientLight intensity={0.55} />
        <hemisphereLight intensity={0.55} groundColor="#58708d" />
        <directionalLight position={[8, 10, 7]} intensity={1.45} />
        <directionalLight position={[-6, 2, -6]} intensity={0.4} color="#9db8ff" />

        {/* the flying airplane — path stays within the camera frustum */}
        <Suspense fallback={null}>
          <group
            position={[x, y, z]}
            rotation={[0, heading, Math.sin(progress * Math.PI * 2) * 0.08]}
          >
            <ThreePlane progress={progress} />
          </group>
        </Suspense>
      </ThreeCanvas>

      {/* title */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingTop: 70,
          opacity: titleOpacity,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '0.04em',
            textShadow: '0 4px 24px rgba(0,0,0,0.45)',
          }}
        >
          3D AIRPLANE
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 30,
            fontWeight: 600,
            color: '#ffb347',
            letterSpacing: '0.28em',
          }}
        >
          REMOTION × THREE.JS
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
