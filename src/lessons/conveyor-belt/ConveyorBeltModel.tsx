import React, {useRef, useState} from 'react';
import {Canvas, useFrame, useThree, type ThreeEvent} from '@react-three/fiber';
import type {Group} from 'three';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type ConveyorPartId = 'motor' | 'button' | 'belt' | 'box' | 'roller';

const HOT = '#ffdb4d';

const Metal: React.FC<{hot?: boolean; color?: string}> = ({hot, color = '#a9b4c0'}) => (
  <meshStandardMaterial color={hot ? HOT : color} emissive={hot ? HOT : '#000'} emissiveIntensity={hot ? 0.42 : 0} metalness={0.62} roughness={0.3} />
);

const BeltMaterial: React.FC<{hot?: boolean; running?: boolean}> = ({hot, running}) => (
  <meshStandardMaterial color={hot ? HOT : '#303943'} emissive={running ? '#154c52' : hot ? HOT : '#000'} emissiveIntensity={running ? 0.34 : hot ? 0.42 : 0} roughness={0.7} />
);

export const ConveyorMachine: React.FC<{
  highlightedPart?: ConveyorPartId | null;
  onPartSelect?: (part: ConveyorPartId) => void;
  running?: boolean;
  boxProgress?: number;
}> = ({highlightedPart = null, onPartSelect, running = false, boxProgress = 0}) => {
  const select = (part: ConveyorPartId) => onPartSelect ? (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onPartSelect(part); } : undefined;
  const hot = (part: ConveyorPartId) => highlightedPart === part;
  const boxX = -1.35 + Math.min(1, boxProgress) * 2.7;

  return (
    <group rotation={[0, -0.34, 0]}>
      <mesh position={[0, -0.15, 0]}><boxGeometry args={[7.9, 0.22, 3.7]} /><meshStandardMaterial color="#e9edf1" roughness={0.9} /></mesh>
      <group>{[-2.7, 2.7].map((x) => [-0.78, 0.78].map((z) => <group key={`${x}-${z}`}><mesh position={[x, 0.55, z]}><boxGeometry args={[0.18, 1.35, 0.18]} /><Metal color="#758391" /></mesh><mesh position={[x, -0.03, z]}><cylinderGeometry args={[0.2, 0.2, 0.12, 16]} /><Metal color="#596572" /></mesh></group>))}</group>
      <mesh position={[0, 1.04, -0.92]}><boxGeometry args={[5.95, 0.23, 0.15]} /><Metal /></mesh>
      <mesh position={[0, 1.04, 0.92]}><boxGeometry args={[5.95, 0.23, 0.15]} /><Metal /></mesh>
      <group onClick={select('roller')}>
        {[-2.7, 2.7].map((x) => <group key={x}><mesh position={[x, 1.14, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.46, 0.46, 1.72, 28]} /><Metal hot={hot('roller')} color="#c3ccd4" /></mesh><mesh position={[x, 1.14, -0.94]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.16, 0.16, 0.12, 18]} /><Metal hot={hot('roller')} color="#6d7a88" /></mesh></group>)}
      </group>
      <group onClick={select('belt')}>
        <mesh position={[0, 1.47, 0]}><boxGeometry args={[5.42, 0.16, 1.6]} /><BeltMaterial hot={hot('belt')} running={running} /></mesh>
        {[-0.72, -0.24, 0.24, 0.72].map((z) => <mesh key={z} position={[0, 1.56, z]}><boxGeometry args={[5.15, 0.015, 0.018]} /><meshStandardMaterial color="#61707b" roughness={0.7} /></mesh>)}
      </group>
      <group onClick={select('motor')} position={[-3.45, 0.84, 0.32]}>
        <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.48, 0.48, 1.18, 28]} /><Metal hot={hot('motor')} color="#607281" /></mesh>
        <mesh position={[0, 0, -0.64]}><cylinderGeometry args={[0.32, 0.32, 0.14, 24]} /><Metal hot={hot('motor')} color="#384654" /></mesh>
        <mesh position={[0.05, -0.57, 0]}><boxGeometry args={[1.28, 0.16, 0.76]} /><Metal hot={hot('motor')} color="#738494" /></mesh>
        {[-0.18, 0, 0.18].map((y) => <mesh key={y} position={[-0.03, y, -0.64]}><boxGeometry args={[0.9, 0.045, 0.025]} /><Metal hot={hot('motor')} color="#283641" /></mesh>)}
      </group>
      <group onClick={select('button')} position={[-2.34, 1.65, -0.86]}>
        <mesh><boxGeometry args={[0.7, 0.38, 0.48]} /><Metal hot={hot('button')} color="#8e9ba7" /></mesh>
        <mesh position={[0, 0.27, 0]}><cylinderGeometry args={[0.16, 0.16, 0.12, 24]} /><meshStandardMaterial color={hot('button') || running ? HOT : '#e9b920'} emissive={running ? '#f2bd18' : '#000'} emissiveIntensity={running ? 0.8 : 0} roughness={0.35} /></mesh>
      </group>
      <group onClick={select('box')} position={[boxX, 1.82, 0]}>
        <mesh><boxGeometry args={[0.86, 0.62, 0.72]} /><meshStandardMaterial color={hot('box') ? HOT : '#c88137'} roughness={0.78} /></mesh>
        <mesh position={[0, 0.32, 0]}><boxGeometry args={[0.88, 0.03, 0.74]} /><meshStandardMaterial color={hot('box') ? HOT : '#e5a95d'} roughness={0.8} /></mesh>
      </group>
    </group>
  );
};

export const ConveyorLights: React.FC = () => <><ambientLight intensity={1.05} /><hemisphereLight intensity={0.8} groundColor="#aebecb" /><directionalLight position={[5, 8, 6]} intensity={1.45} /></>;

export const ConveyorCanvas: React.FC<{highlightedPart?: ConveyorPartId | null; onPartSelect?: (part: ConveyorPartId) => void; running?: boolean; boxProgress?: number; animate?: boolean}> = ({highlightedPart, onPartSelect, running, boxProgress, animate = false}) => (
  <Canvas className="conveyor-canvas" camera={{position: [7.4, 4.4, 7.2], fov: 34}} dpr={1} frameloop={animate ? 'always' : 'demand'} gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}>
    <color attach="background" args={['#d9edf7']} /><ConveyorLights /><ConveyorMachine highlightedPart={highlightedPart} onPartSelect={onPartSelect} running={running} boxProgress={boxProgress} /><ModelOrbitControls zoomEnabled rotateEnabled dampingEnabled={false} target={[0, 1.05, 0]} minDistance={6.6} maxDistance={13} />
  </Canvas>
);

export const MovingConveyorCanvas: React.FC<{running: boolean; onDelivered: () => void}> = ({running, onDelivered}) => {
  const progress = useRef(0);
  const [boxProgress, setBoxProgress] = useState(0);
  const delivered = useRef(false);
  const {invalidate} = useThree();
  useFrame((_, delta) => { if (!running || delivered.current) return; progress.current = Math.min(1, progress.current + delta * 0.23); setBoxProgress(progress.current); if (progress.current >= 1) { delivered.current = true; onDelivered(); } invalidate(); });
  return <ConveyorMachine running={running} boxProgress={boxProgress} />;
};
