import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {InstancedMesh, Object3D, Shape} from 'three';
import type {ThreeEvent} from '@react-three/fiber';

export type MachinePart = 'controller' | 'microbit' | 'motor' | 'gears' | 'platform' | 'seats';
export const machineLabels: Record<MachinePart, string> = {
  controller: 'Controller hub', microbit: 'micro:bit', motor: 'Motor', gears: 'Gears', platform: 'Shaking platform', seats: 'Seats',
};
type Point = [number, number, number];
const Brick = ({at, size, color}: {at: Point; size: Point; color: string}) => <mesh position={at}><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.65} /></mesh>;

/** Repeated studs use one draw call, including the 16 × 16 platform surface. */
function Studs({points, color}: {points: Point[]; color: string}) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const transform = new Object3D();
    points.forEach((point, index) => {transform.position.set(...point); transform.updateMatrix(); ref.current!.setMatrixAt(index, transform.matrix);});
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [points]);
  return <instancedMesh ref={ref} args={[undefined, undefined, points.length]}><cylinderGeometry args={[0.055, 0.055, 0.045, 8]} /><meshStandardMaterial color={color} /></instancedMesh>;
}
function Beam({at, length = 2.6, color = '#272c33', alongZ = false}: {at: Point; length?: number; color?: string; alongZ?: boolean}) {
  const count = Math.round(length / 0.22);
  return <group position={at} rotation={[0, alongZ ? Math.PI / 2 : 0, 0]}>
    <Brick at={[0, 0, 0]} size={[length, 0.2, 0.2]} color={color} />
    {Array.from({length: count}, (_, i) => <group key={i} position={[(i - (count - 1) / 2) * 0.22, 0, 0.106]}>
      <mesh><torusGeometry args={[0.062, 0.012, 5, 10]} /><meshStandardMaterial color="#a5acac" /></mesh>
      <mesh position={[0, 0, -0.003]}><circleGeometry args={[0.05, 10]} /><meshBasicMaterial color="#10171c" /></mesh>
    </group>)}
  </group>;
}
function Gear({radius, phase, at, color}: {radius: number; phase: number; at: Point; color: string}) {
  const shape = useMemo(() => {
    const outline = new Shape();
    const teeth = radius > 0.4 ? 28 : 16;
    for (let i = 0; i <= teeth * 4; i++) {
      const angle = i * Math.PI * 2 / (teeth * 4);
      const r = radius * (i % 4 === 1 || i % 4 === 2 ? 1 : 0.89);
      if (i === 0) outline.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
      else outline.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    return outline;
  }, [radius]);
  return <group position={at} rotation={[0, Math.PI / 2, 0]}><group rotation={[0, 0, phase]}>
    <mesh position={[0, 0, -0.06]}><extrudeGeometry args={[shape, {depth: 0.12, bevelEnabled: false}]} /><meshStandardMaterial color={color} /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[radius * 0.18, radius * 0.18, 0.19, 12]} /><meshStandardMaterial color="#727b84" /></mesh>
    {Array.from({length: 6}, (_, i) => {
      const angle = i * Math.PI / 3;
      return <mesh key={i} position={[Math.cos(angle) * radius * 0.57, Math.sin(angle) * radius * 0.57, 0.065]}><circleGeometry args={[radius * 0.17, 12]} /><meshStandardMaterial color="#59636c" /></mesh>;
    })}
  </group></group>;
}

/** PDF-based teaching reconstruction; dimensions and hidden connections are approximate. */
export function EarthquakeMachine({lookInside = false, selected = null, onSelect, tick = 0, shaking = 0}: {
  lookInside?: boolean; selected?: MachinePart | null; onSelect?: (id: MachinePart) => void; tick?: number; shaking?: number;
}) {
  const platformStuds = useMemo<Point[]>(() => Array.from({length: 256}, (_, i) => [(i % 16 - 7.5) * 0.205, 0.1, (Math.floor(i / 16) - 7.5) * 0.205]), []);
  const boardLeds = useMemo<Point[]>(() => Array.from({length: 25}, (_, i) => [(i % 5 - 2) * 0.09, 0.063, (Math.floor(i / 5) - 2) * 0.09]), []);
  const color = (id: MachinePart, normal: string) => selected === id ? '#00c8f0' : normal;
  const pick = (id: MachinePart) => (event: ThreeEvent<MouseEvent>) => {event.stopPropagation(); onSelect?.(id);};
  const motion = Math.sin(tick * 1.8) * shaking * 0.018;
  return <group position={[0, -0.5, 0]}>
    <Brick at={[0, -1.1, 0]} size={[2.6, 0.18, 2.3]} color="#252b32" />
    {[-1, 1].map(x => <group key={x}>
      {[-0.87, 0.87].map(z => <group key={z}>
        {['#aeb5b4', '#d14839', '#4e8b63', '#d14839'].map((c, i) => <Brick key={i} at={[x * 1.13, -0.86 + i * 0.3, z]} size={[0.25, 0.3, 0.3]} color={c} />)}
      </group>)}
      <Beam at={[x * 1.13, -0.45, 0]} length={2.15} color="#adb3b2" alongZ />
      <Beam at={[x * 1.13, 0.25, 0]} length={2.5} alongZ />
    </group>)}
    {[-0.9, 0.9].map(z => <group key={z}><Beam at={[0, -0.93, z]} color="#aeb5b4" /><Beam at={[0, 0.25, z]} /><Brick at={[0.7, 0.4, z]} size={[0.65, 0.12, 0.23]} color="#e6bc44" /></group>)}
    <group onClick={pick('controller')}>
      <Brick at={[0, -0.55, 0]} size={[1.75, 0.85, 1.5]} color={color('controller', '#edf0e9')} />
      <Brick at={[0, -0.98, 0]} size={[1.78, 0.18, 1.53]} color={color('controller', '#202d3c')} />
      {[-0.56, 0, 0.56].map(x => <group key={x}>
        <Brick at={[x, -0.65, 0.76]} size={[0.37, 0.35, 0.025]} color="#48525b" />
        <Brick at={[x, -0.66, 0.78]} size={[0.22, 0.23, 0.02]} color="#18232b" />
      </group>)}
    </group>
    <group position={[-0.12, lookInside ? 0.72 : -0.08, 0]} onClick={pick('microbit')}>
      <Brick at={[0, 0, 0]} size={[0.9, 0.08, 0.7]} color={color('microbit', '#18292e')} />
      <Studs points={boardLeds} color={color('microbit', '#c44347')} />
      {[-0.34, 0.34].map(x => <Brick key={x} at={[x, 0.07, -0.22]} size={[0.12, 0.09, 0.12]} color="#b8b7ad" />)}
      <Brick at={[0, 0.035, 0.31]} size={[0.87, 0.03, 0.09]} color="#d7b348" />
    </group>
    <group position={[0, 0.6, 0.66]} onClick={pick('motor')}>
      <Brick at={[0, 0, 0]} size={[1.7, 0.52, 0.58]} color={color('motor', '#e7e9e5')} />
      <mesh position={[0.89, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.26, 0.26, 0.12, 16]} /><meshStandardMaterial color={color('motor', '#c5363e')} /></mesh>
      <Brick at={[-0.85, 0, 0.12]} size={[0.03, 0.2, 0.22]} color="#3d4d58" />
    </group>
    <group onClick={pick('gears')}>
      <Gear at={[1.4, 0.6, 0.66]} radius={0.3} phase={-tick * shaking * 0.03} color={color('gears', '#a8aeb2')} />
      <Gear at={[1.4, 0.67, -0.3]} radius={0.66} phase={tick * shaking * 0.014} color={color('gears', '#b6bcbf')} />
      <mesh position={[1.5, 1.02, -0.3]} rotation={[0, 0, motion]}><boxGeometry args={[0.12, 0.65, 0.16]} /><meshStandardMaterial color={color('gears', '#85939e')} /></mesh>
      <mesh position={[1.59, 1.25, -0.3]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.065, 0.065, 0.24, 8]} /><meshStandardMaterial color="#407bc0" /></mesh>
    </group>
    <group position={[motion, lookInside ? 2.3 : 1.35, 0]}>
      <group onClick={pick('platform')}>
        <Brick at={[0, 0, 0]} size={[3.4, 0.15, 3.4]} color={color('platform', '#499156')} />
        <Studs points={platformStuds} color={color('platform', '#529b5e')} />
        {[-1, 1].map(z => <Beam key={z} at={[0, -0.16, z]} length={3.3} />)}
      </group>
      <group onClick={pick('seats')}>
        {[-0.66, 0.66].map(x => <group key={x}>
          <mesh position={[x, 0.23, 0]}><cylinderGeometry args={[0.17, 0.17, 0.3, 12]} /><meshStandardMaterial color={color('seats', '#e9992c')} /></mesh>
          <mesh position={[x, 0.59, 0]}><cylinderGeometry args={[0.075, 0.075, 0.48, 10]} /><meshStandardMaterial color={color('seats', '#e4c64c')} /></mesh>
          <Brick at={[x, 0.98, 0]} size={[0.29, 0.2, 0.3]} color={color('seats', '#ed922c')} />
          <Brick at={[x, 1.13, 0]} size={[0.32, 0.1, 0.37]} color={color('seats', '#2469b1')} />
          <Brick at={[x, 1.33, -0.15]} size={[0.32, 0.43, 0.08]} color={color('seats', '#2469b1')} />
        </group>)}
        <Beam at={[0, 0.87, 0]} length={2} />
      </group>
    </group>
  </group>;
}
