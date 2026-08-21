import React, {Suspense} from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {ThreePlane} from '../components/ThreePlane';

const LESSON_PARTS = [
  'Body',
  'Cockpit',
  'Jet Engine',
  'Left Wing',
  'Right Wing',
  'Tires',
] as const;

export const PlaneAssemblyLesson: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const explode = interpolate(frame, [0, 2 * fps, 6 * fps, 8 * fps], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const planeScale = spring({
    frame,
    fps,
    config: {damping: 16, stiffness: 100, mass: 0.7},
  });

  const partStep = Math.min(LESSON_PARTS.length - 1, Math.max(0, Math.floor((frame - fps) / 28)));

  const cardOpacity = interpolate(frame, [0, fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#071421'}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 20% 10%, rgba(86,182,255,0.18), transparent 32%), linear-gradient(180deg, #0b2a45 0%, #143f67 46%, #8fbbe0 100%)',
        }}
      />

      <ThreeCanvas
        width={width}
        height={height}
        camera={{position: [0, 2.4, 12], fov: 35, near: 0.1, far: 100}}
      >
        <ambientLight intensity={0.5} />
        <hemisphereLight intensity={0.6} groundColor="#6e88a3" />
        <directionalLight position={[10, 10, 8]} intensity={1.35} />
        <directionalLight position={[-5, 3, -5]} intensity={0.42} color="#a4c2ff" />

        <Suspense fallback={null}>
          <group
            position={[0, 1.4, 1.8]}
            rotation={[0.18, -0.6 + explode * 0.08, 0]}
            scale={[0.9 + planeScale * 0.1, 0.9 + planeScale * 0.1, 0.9 + planeScale * 0.1]}
          >
            <ThreePlane progress={0.25} explode={explode} />
          </group>
        </Suspense>
      </ThreeCanvas>

      <AbsoluteFill
        style={{
          padding: '68px 84px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontSize: 68,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '0.02em',
            textShadow: '0 10px 28px rgba(0,0,0,0.28)',
            opacity: cardOpacity,
          }}
        >
          AIRPLANE PARTS
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 28,
            color: '#d9ecff',
            maxWidth: 760,
            lineHeight: 1.4,
            opacity: cardOpacity,
          }}
        >
          Pull the main parts apart, learn their names, then snap them back together.
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          padding: '0 84px 72px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: 360,
            borderRadius: 28,
            padding: '26px 28px',
            background: 'rgba(6,20,32,0.72)',
            border: '1px solid rgba(174,223,255,0.25)',
            backdropFilter: 'blur(14px)',
            opacity: cardOpacity,
          }}
        >
          {LESSON_PARTS.map((part, index) => {
            const active = index === partStep;
            return (
              <div
                key={part}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 0',
                  color: active ? '#ffffff' : '#9ec0de',
                  fontSize: active ? 29 : 24,
                  fontWeight: active ? 800 : 600,
                  letterSpacing: active ? '0.01em' : '0',
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    background: active ? '#ffb347' : 'rgba(158,192,222,0.36)',
                    boxShadow: active ? '0 0 14px rgba(255,179,71,0.65)' : 'none',
                  }}
                />
                <div>{part}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
