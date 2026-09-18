import React, {useRef} from 'react';
import {Canvas, useFrame, type ThreeEvent} from '@react-three/fiber';
import {Group, MathUtils} from 'three';
import {ModelOrbitControls} from '../shared/ModelViewportControls';
import type {SeesawPartId} from './SeesawModel';

export type SeesawBlockWeight = 5 | 10 | 20;

const BLOCK_COLOR: Record<SeesawBlockWeight, string> = {
  5: '#62c9ff',
  10: '#ffcc45',
  20: '#ff765b',
};

const blockHeight = (weight: SeesawBlockWeight) => 0.35 + weight * 0.015;

const PART_COLOR: Record<SeesawPartId, string> = {
  beam: '#1476b2',
  fulcrum: '#ef9d24',
  seat: '#d94c42',
  handle: '#2c3e50',
};
const SELECTED_COLOR = '#ffdb4c';

const Part: React.FC<{
  id: SeesawPartId;
  selected: SeesawPartId | null;
  onSelect: (part: SeesawPartId) => void;
  children: React.ReactNode;
}> = ({id, selected, onSelect, children}) => (
  <group
    onClick={(event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      onSelect(id);
    }}
  >
    {children}
  </group>
);

const BalanceSeesaw: React.FC<{
  selected: SeesawPartId | null;
  mode: string;
  leftBlocks: SeesawBlockWeight[];
  rightBlocks: SeesawBlockWeight[];
  animating: boolean;
  onPartSelect: (part: SeesawPartId) => void;
  onSettled: () => void;
}> = ({selected, mode, leftBlocks, rightBlocks, animating, onPartSelect, onSettled}) => {
  const beamRef = useRef<Group>(null);
  const settled = useRef(false);
  const leftWeight = leftBlocks.reduce((total, weight) => total + weight, 0);
  const rightWeight = rightBlocks.reduce((total, weight) => total + weight, 0);
  const targetTilt = Math.max(-0.27, Math.min(0.27, (leftWeight - rightWeight) * 0.014));
  const select = mode === 'identify' || mode === 'explore';
  const color = (part: SeesawPartId) => selected === part ? SELECTED_COLOR : PART_COLOR[part];

  useFrame((state, delta) => {
    if (!beamRef.current) return;
    beamRef.current.rotation.z = MathUtils.damp(beamRef.current.rotation.z, targetTilt, 4.4, delta);
    const moving = Math.abs(beamRef.current.rotation.z - targetTilt) > 0.004;
    if (moving) {
      state.invalidate();
      settled.current = false;
    } else if (animating && !settled.current) {
      settled.current = true;
      onSettled();
    }
  });

  return (
    <group position={[0, -0.3, 0]}>
      <mesh position={[0, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[13, 8]} />
        <meshStandardMaterial color="#83bf61" roughness={1} />
      </mesh>
      <Part id="fulcrum" selected={selected} onSelect={select ? onPartSelect : () => {}}>
        <mesh position={[0, -0.27, 0]} rotation={[0, Math.PI / 2, 0]}>
          <coneGeometry args={[0.78, 1.45, 3]} />
          <meshStandardMaterial color={color('fulcrum')} roughness={0.72} />
        </mesh>
        <mesh position={[0, 0.36, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.86, 18]} />
          <meshStandardMaterial color="#4d5b67" metalness={0.55} roughness={0.28} />
        </mesh>
      </Part>
      <group ref={beamRef}>
        <Part id="beam" selected={selected} onSelect={select ? onPartSelect : () => {}}>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[8.1, 0.28, 0.64]} />
            <meshStandardMaterial color={color('beam')} metalness={0.16} roughness={0.45} />
          </mesh>
        </Part>
        <Part id="seat" selected={selected} onSelect={select ? onPartSelect : () => {}}>
          {[-3.35, 3.35].map((x) => (
            <group key={x} position={[x, 0.68, 0]}>
              <mesh><boxGeometry args={[1.12, 0.22, 0.9]} /><meshStandardMaterial color={color('seat')} roughness={0.5} /></mesh>
              <mesh position={[0, 0.18, -0.22]}><boxGeometry args={[0.9, 0.13, 0.26]} /><meshStandardMaterial color="#f4845f" roughness={0.56} /></mesh>
            </group>
          ))}
        </Part>
        <Part id="handle" selected={selected} onSelect={select ? onPartSelect : () => {}}>
          {[-3.35, 3.35].map((x) => (
            <group key={x} position={[x, 1.18, 0]}>
              <mesh position={[-0.28, 0, 0]}><cylinderGeometry args={[0.055, 0.055, 0.85, 12]} /><meshStandardMaterial color={color('handle')} metalness={0.48} roughness={0.35} /></mesh>
              <mesh position={[0.28, 0, 0]}><cylinderGeometry args={[0.055, 0.055, 0.85, 12]} /><meshStandardMaterial color={color('handle')} metalness={0.48} roughness={0.35} /></mesh>
              <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.055, 0.055, 0.62, 12]} /><meshStandardMaterial color={color('handle')} metalness={0.48} roughness={0.35} /></mesh>
            </group>
          ))}
        </Part>
        {leftBlocks.map((weight, index) => {
          const height = blockHeight(weight);
          const below = leftBlocks.slice(0, index).reduce((total, item) => total + blockHeight(item), 0);
          return <mesh key={`left-${index}-${weight}`} position={[-3.35, 0.9 + below + height / 2, 0]} castShadow>
            <boxGeometry args={[0.72, height, 0.62]} />
            <meshStandardMaterial color={BLOCK_COLOR[weight]} roughness={0.52} />
          </mesh>
        })}
        {rightBlocks.map((weight, index) => {
          const height = blockHeight(weight);
          const below = rightBlocks.slice(0, index).reduce((total, item) => total + blockHeight(item), 0);
          return <mesh key={`right-${index}-${weight}`} position={[3.35, 0.9 + below + height / 2, 0]} castShadow>
            <boxGeometry args={[0.72, height, 0.62]} />
            <meshStandardMaterial color={BLOCK_COLOR[weight]} roughness={0.52} />
          </mesh>
        })}
      </group>
    </group>
  );
};

export const SeesawBalanceCanvas: React.FC<{
  highlightedPart: SeesawPartId | null;
  mode: string;
  leftBlocks: SeesawBlockWeight[];
  rightBlocks: SeesawBlockWeight[];
  animating: boolean;
  onPartSelect: (part: SeesawPartId) => void;
  onSettled: () => void;
}> = (props) => (
  <Canvas
    camera={{position: [7.4, 4.3, 9.1], fov: 32, near: 0.1, far: 100}}
    dpr={1}
    frameloop={props.animating ? 'always' : 'demand'}
    gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}
  >
    <color attach="background" args={['#b6e5fa']} />
    <ambientLight intensity={1.08} />
    <hemisphereLight intensity={0.92} groundColor="#6c9952" />
    <directionalLight position={[5, 7, 5]} intensity={1.45} />
    <BalanceSeesaw selected={props.highlightedPart} mode={props.mode} leftBlocks={props.leftBlocks} rightBlocks={props.rightBlocks} animating={props.animating} onPartSelect={props.onPartSelect} onSettled={props.onSettled} />
    <ModelOrbitControls dampingEnabled={false} zoomEnabled={props.mode !== 'activity'} rotateEnabled={props.mode !== 'activity'} target={[0, 0, 0]} minDistance={4.5} maxDistance={13} />
  </Canvas>
);
