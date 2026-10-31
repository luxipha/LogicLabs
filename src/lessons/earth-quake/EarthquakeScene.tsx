import React from 'react';
import {EarthquakeMachine} from './EarthquakeMachine';
import {Canvas} from '@react-three/fiber';
import {DoubleSide, Vector3} from 'three';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type Stress = 'tension' | 'compression' | 'shear';
const Box = ({position, size, color, rotation = 0}: {position: [number, number, number]; size: [number, number, number]; color: string; rotation?: number}) => <mesh position={position} rotation={[0, 0, rotation]}><boxGeometry args={size} /><meshStandardMaterial color={color} /></mesh>;

export function EarthquakeScene({view, cutaway, stress, amount, released, tick, shaking, layer, onLayer}: {
  view: number; cutaway: boolean; stress: Stress; amount: number; released: boolean; tick: number; shaking: number; layer: string; onLayer: (name: string) => void;
}) {
  const displacement = amount / 100;
  const jitter = Math.sin(tick * 1.8) * shaking * 0.018;
  return <Canvas aria-label={view === 0 ? 'Rotatable Earth layer diagram' : view >= 3 ? 'PDF-based earthquake machine' : 'Interactive rock and fault diagram'} frameloop="demand" dpr={1} gl={{antialias: false, powerPreference: 'low-power'}} camera={{position: [5, 3.8, 6], fov: 40}}>
    <color attach="background" args={['#eaf5fa']} /><ambientLight intensity={1.5} /><directionalLight position={[4, 7, 6]} intensity={2} />
    {view === 0 ? <group rotation={[0, -0.45, 0]}>
      {[
        {name: 'Crust', radius: 1.8, inner: 1.72, color: '#47916c'},
        {name: 'Mantle', radius: 1.72, inner: 0.93, color: '#e89144'},
        {name: 'Core', radius: 0.93, inner: 0, color: '#ffd269'},
      ].map(({name, radius, inner, color}) => <group key={name}>
        <mesh onClick={e => {e.stopPropagation(); onLayer(name);}}>
          <sphereGeometry args={[radius, 48, 32, cutaway ? Math.PI / 2 : 0, cutaway ? Math.PI * 1.5 : Math.PI * 2]} />
          {layer === name
            ? <meshBasicMaterial color="#00c8f0" side={DoubleSide} />
            : <meshStandardMaterial color={color} side={DoubleSide} />}
        </mesh>
        {cutaway && [0, Math.PI / 2].map(angle => <mesh key={angle} rotation={[0, angle, 0]} onClick={e => {e.stopPropagation(); onLayer(name);}}>
          <ringGeometry args={[inner, radius, 48, 1, Math.PI / 2, Math.PI]} />
          {layer === name
            ? <meshBasicMaterial color="#00c8f0" side={DoubleSide} polygonOffset polygonOffsetFactor={-1} />
            : <meshStandardMaterial color={color} side={DoubleSide} polygonOffset polygonOffsetFactor={-1} />}
        </mesh>)}
      </group>)}
    </group> : view >= 3 ? <EarthquakeMachine tick={tick} shaking={shaking} /> : <group>
      {[-1, 1].map(side => {
        const faultView = view === 2;
        const x = side * (1.08 + (!faultView && stress === 'tension' ? displacement * 0.8 : !faultView && stress === 'compression' ? -displacement * 0.28 : 0));
        const z = (faultView ? released ? side * 0.65 : side * displacement * 0.10 : stress === 'shear' ? side * displacement : 0);
        return <group key={side} position={[x + jitter, 0, z]} scale={[1, !faultView && stress === 'compression' ? 1 + displacement * 0.25 : 1, 1]}>
          <Box position={[0, -0.65, 0]} size={[2, 0.8, 2.8]} color="#cf8052" />
          <Box position={[0, -0.13, 0]} size={[2, 0.24, 2.8]} color="#dfb975" />
          <Box position={[0, 0.04, 0]} size={[2, 0.12, 2.8]} color="#6eaa79" />
          {faultView && <Box position={[side * 0.3, 0.55, 0]} size={[0.55, 0.95, 0.65]} color="#6985bf" rotation={jitter * 0.8} />}
          {!faultView && <arrowHelper args={[
            stress === 'shear' ? new Vector3(0, 0, side) : new Vector3(stress === 'tension' ? side : -side, 0, 0),
            new Vector3(0, 0.65, 0), 0.85, '#ae3347', 0.25, 0.16,
          ]} />}
        </group>;
      })}
      {view === 2 && released && [0, 1, 2].map(i => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.13, 0]}><ringGeometry args={[0.5 + ((tick / 8 + i) % 3), 0.56 + ((tick / 8 + i) % 3), 48]} /><meshBasicMaterial color="#c34859" transparent opacity={0.55} side={DoubleSide} /></mesh>)}
    </group>}
    <ModelOrbitControls dampingEnabled={false} zoomEnabled rotateEnabled target={[0, 0, 0]} minDistance={5} maxDistance={12} />
  </Canvas>;
}
