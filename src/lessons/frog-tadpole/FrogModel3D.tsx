import React, {useMemo, useRef} from 'react';
import {Canvas, useFrame, useLoader} from '@react-three/fiber';
import type {Group, Mesh, MeshBasicMaterial} from 'three';
import {DoubleSide, PlaneGeometry, TextureLoader} from 'three';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type FrogPartId = 'eggs' | 'tadpole' | 'legs' | 'froglet' | 'adult';

export const FROG_PART_ORDER: FrogPartId[] = ['eggs', 'tadpole', 'legs', 'froglet', 'adult'];

// The frog life-cycle stage photos (the model's stage textures), served as
// static assets from the app's frog-activities folder.
const STAGE_IMAGE: Record<FrogPartId, string> = {
  eggs: 'frog-activities/img/eggs.png',
  tadpole: 'frog-activities/img/tadpole.png',
  legs: 'frog-activities/img/legs.png',
  froglet: 'frog-activities/img/froglet.png',
  adult: 'frog-activities/img/adult.png',
};

// Cards are square stage photos.
const IMAGE_ASPECT = 1;
// Explore shows one large image; identify lays the smaller cards out in a ring.
const EXPLORE_CARD = 2.6;
const IDENTIFY_CARD = 1.15;

// Radius of the ring in identify mode.
const IDENTIFY_RADIUS = 2.7;

// Speed of the per-card crossfade (higher = snappier).
const FADE_SPEED = 0.09;
// Gentle settle range for the crossfade: the incoming image eases up slightly
// from 0.98x while fading in, the outgoing eases down to 0.98x while fading
// out — a smooth "wiping into" feel rather than a hard cut.
const SCALE_POP = 0.02;

// Ring motion tuning (identify only).
const LERP_FACTOR = 0.12;
const AUTO_SPIN_SPEED = 0.0025;
const FRONT_ANGLE = Math.PI / 2;

const ageToPosition = (index: number, count: number) => {
  const angle = (index / count) * Math.PI * 2;
  return {
    position: [Math.cos(angle) * IDENTIFY_RADIUS, 0, Math.sin(angle) * IDENTIFY_RADIUS] as [
      number,
      number,
      number,
    ],
    // Rotate each plane so its face points radially outward from the ring.
    rotation: angle - Math.PI / 2,
  };
};

const StageCard: React.FC<{
  stage: FrogPartId;
  mode: 'explore' | 'identify';
  active: boolean;
  index: number;
  count: number;
  onSelect: (stage: FrogPartId) => void;
}> = ({stage, mode, active, index, count, onSelect}) => {
  const texture = useLoader(TextureLoader, STAGE_IMAGE[stage]);
  const cardW = mode === 'explore' ? EXPLORE_CARD : IDENTIFY_CARD;
  const geometry = useMemo(() => new PlaneGeometry(cardW, cardW / IMAGE_ASPECT), [cardW]);
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshBasicMaterial>(null);

  // In identify mode every card sits on the ring at full opacity, facing
  // outward. In explore mode the cards are stacked facing the camera and
  // crossfade: the active one fades in and eases up in scale while the others
  // fade out, so one stage visibly "becomes" the next.
  const isRing = mode === 'identify';
  const layout = useMemo(() => ageToPosition(index, count), [index, count]);

  // Smoothed animation state for this card.
  const anim = useRef({opacity: 0, scale: 1}).current;

  useFrame(() => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) {
      return;
    }
    if (isRing) {
      // Ring cards stay fully visible.
      material.opacity = 1;
      mesh.scale.setScalar(1);
      return;
    }
    // Explore crossfade: the incoming stage fades in and eases up to full size
    // while the previous stage fades out and eases down — one stage smoothly
    // "becomes" the next.
    const targetOpacity = active ? 1 : 0;
    const targetScale = active ? 1 : Math.max(1 - SCALE_POP, 0.4);
    anim.opacity += (targetOpacity - anim.opacity) * FADE_SPEED;
    anim.scale += (targetScale - anim.scale) * FADE_SPEED;
    material.opacity = anim.opacity;
    mesh.scale.setScalar(anim.scale);
  });

  return (
    <group
      position={isRing ? layout.position : ([0, 0, 0] as [number, number, number])}
      rotation={isRing ? ([0, layout.rotation, 0] as [number, number, number]) : ([0, 0, 0] as [number, number, number])}
    >
      <mesh
        ref={meshRef}
        geometry={geometry}
        onClick={(event) => {
          if (mode !== 'identify') {
            return;
          }
          event.stopPropagation();
          onSelect(stage);
        }}
      >
        <meshBasicMaterial
          ref={materialRef}
          map={texture}
          transparent
          opacity={isRing ? 1 : 0}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

const FrogStages: React.FC<{
  mode: 'explore' | 'identify';
  visibleStage: FrogPartId | null;
  activeStage: FrogPartId | null;
  onStageSelect: (stage: FrogPartId) => void;
}> = ({mode, visibleStage, activeStage, onStageSelect}) => {
  const ringRef = useRef<Group>(null);
  const count = FROG_PART_ORDER.length;

  // In identify mode the selected stage is brought to the front of the ring.
  const targetStage = mode === 'identify' ? activeStage : null;
  const targetAngle = useMemo(() => {
    if (!targetStage) {
      return null;
    }
    const idx = FROG_PART_ORDER.indexOf(targetStage);
    return (idx / count) * Math.PI * 2;
  }, [targetStage, count]);

  useFrame(() => {
    // Only identify mode spins the ring; explore crossfades in place.
    if (mode !== 'identify') {
      return;
    }
    const ring = ringRef.current;
    if (!ring) {
      return;
    }
    if (targetAngle !== null) {
      // Spin the ring so the desired stage arrives at the front (facing the
      // camera), gliding toward the target angle along the shortest path.
      const target = FRONT_ANGLE - targetAngle;
      const current = ((ring.rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      let delta = ((target - current + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      ring.rotation.y += delta * LERP_FACTOR;
    } else {
      // Idle circular movement: keep the ring slowly turning.
      ring.rotation.y += AUTO_SPIN_SPEED;
    }
  });

  return (
    <group ref={ringRef}>
      {FROG_PART_ORDER.map((stage, index) => (
        <StageCard
          key={stage}
          stage={stage}
          mode={mode}
          active={mode === 'explore' ? stage === visibleStage : stage === activeStage}
          index={index}
          count={count}
          onSelect={onStageSelect}
        />
      ))}
    </group>
  );
};

export const FrogLifeCycleStage: React.FC<{
  mode: 'explore' | 'identify';
  visibleStage: FrogPartId | null;
  activeStage: FrogPartId | null;
  onStageSelect: (stage: FrogPartId) => void;
}> = ({mode, visibleStage, activeStage, onStageSelect}) => {
  const explore = mode === 'explore';
  return (
    <Canvas
      camera={{position: [0, 0.2, explore ? 3.8 : 7.6], fov: 42, near: 0.1, far: 40}}
      dpr={[1, 1.5]}
      gl={{alpha: true, antialias: true}}
    >
      <ambientLight intensity={1} />
      <FrogStages mode={mode} visibleStage={visibleStage} activeStage={activeStage} onStageSelect={onStageSelect} />
      <ModelOrbitControls
        zoomEnabled
        rotateEnabled
        target={[0, 0, 0]}
        minDistance={explore ? 2.4 : 4}
        maxDistance={explore ? 10 : 14}
      />
    </Canvas>
  );
};