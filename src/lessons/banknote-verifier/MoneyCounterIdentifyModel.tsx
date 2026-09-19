import React from 'react';
import {Canvas, type ThreeEvent} from '@react-three/fiber';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type MoneyCounterPartId = 'slot' | 'roller' | 'sensor' | 'display' | 'casing';

const PART_COLOR: Record<MoneyCounterPartId, string> = {
  slot: '#13202b',
  roller: '#aeb8c2',
  sensor: '#4ecbe2',
  display: '#092a35',
  casing: '#d7e3eb',
};
const HIGHLIGHT = '#ffdc4c';

const Part: React.FC<{
  id: MoneyCounterPartId;
  highlightedPart: MoneyCounterPartId | null;
  identified: Set<string>;
  onSelect: (part: MoneyCounterPartId) => void;
  children: React.ReactNode;
}> = ({id, highlightedPart, identified, onSelect, children}) => (
  <group
    onClick={(event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      onSelect(id);
    }}
    userData={{part: id}}
  >
    {children}
  </group>
);

const materialColor = (id: MoneyCounterPartId, highlightedPart: MoneyCounterPartId | null, identified: Set<string>) =>
  highlightedPart === id ? HIGHLIGHT : identified.has(id) ? '#8fe2ad' : PART_COLOR[id];

const MoneyCounter: React.FC<{
  highlightedPart: MoneyCounterPartId | null;
  identified: Set<string>;
  onPartSelect: (part: MoneyCounterPartId) => void;
}> = ({highlightedPart, identified, onPartSelect}) => {
  const color = (id: MoneyCounterPartId) => materialColor(id, highlightedPart, identified);
  const shared = {highlightedPart, identified, onSelect: onPartSelect};

  return (
    <group position={[0, -0.35, 0]} rotation={[0.02, -0.26, 0]}>
      <mesh position={[0, -1.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[13, 9]} />
        <meshStandardMaterial color="#d9edf4" roughness={1} />
      </mesh>

      <Part id="casing" {...shared}>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[5.8, 3.45, 2.45]} />
          <meshStandardMaterial color={color('casing')} roughness={0.34} metalness={0.12} />
        </mesh>
        <mesh position={[0, 1.95, -0.05]}>
          <boxGeometry args={[5.2, 0.22, 2.05]} />
          <meshStandardMaterial color="#afc2cf" roughness={0.38} metalness={0.12} />
        </mesh>
      </Part>

      <Part id="slot" {...shared}>
        <mesh position={[0, 1.2, 1.34]}>
          <boxGeometry args={[3.45, 0.32, 0.22]} />
          <meshStandardMaterial color={color('slot')} roughness={0.24} metalness={0.42} />
        </mesh>
        <mesh position={[0, 1.47, 1.18]} rotation={[Math.PI / 2.6, 0, 0]}>
          <boxGeometry args={[2.9, 0.5, 0.14]} />
          <meshStandardMaterial color="#617582" roughness={0.4} />
        </mesh>
      </Part>

      <Part id="roller" {...shared}>
        {[-0.68, 0.68].map((x) => (
          <mesh key={x} position={[x, 1.18, 1.52]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.95, 18]} />
            <meshStandardMaterial color={color('roller')} roughness={0.26} metalness={0.7} />
          </mesh>
        ))}
      </Part>

      <Part id="sensor" {...shared}>
        <mesh position={[0, 0.5, 1.34]}>
          <boxGeometry args={[1.8, 0.65, 0.22]} />
          <meshStandardMaterial color={color('sensor')} roughness={0.28} metalness={0.15} emissive={color('sensor')} emissiveIntensity={0.18} />
        </mesh>
        {[-0.55, 0, 0.55].map((x) => <mesh key={x} position={[x, 0.5, 1.48]}><sphereGeometry args={[0.07, 12, 12]} /><meshStandardMaterial color="#d4fbff" emissive="#a6f4ff" emissiveIntensity={0.6} /></mesh>)}
      </Part>

      <Part id="display" {...shared}>
        <mesh position={[0, -0.48, 1.34]}>
          <boxGeometry args={[2.3, 0.98, 0.16]} />
          <meshStandardMaterial color={color('display')} roughness={0.18} metalness={0.18} emissive={color('display')} emissiveIntensity={0.16} />
        </mesh>
        <mesh position={[0, -0.48, 1.44]}>
          <boxGeometry args={[1.75, 0.5, 0.035]} />
          <meshStandardMaterial color="#42e08a" emissive="#42e08a" emissiveIntensity={0.55} />
        </mesh>
      </Part>

      {[-2.2, 2.2].map((x) => <mesh key={x} position={[x, -1.58, 0.64]}><cylinderGeometry args={[0.22, 0.22, 0.24, 16]} /><meshStandardMaterial color="#425560" roughness={0.65} /></mesh>)}
    </group>
  );
};

export const MoneyCounterIdentifyCanvas: React.FC<{
  highlightedPart: string | null;
  identified: Set<string>;
  onPartSelect: (part: string) => void;
}> = ({highlightedPart, identified, onPartSelect}) => (
  <div className="generic-stage money-counter-identify-stage">
    <Canvas
      camera={{position: [6.9, 4.35, 8.8], fov: 32, near: 0.1, far: 100}}
      dpr={1}
      frameloop="demand"
      gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}
    >
      <color attach="background" args={['#effaff']} />
      <ambientLight intensity={1.15} />
      <hemisphereLight intensity={0.72} groundColor="#bad7c4" />
      <directionalLight position={[5, 7, 5]} intensity={1.45} />
      <MoneyCounter
        highlightedPart={highlightedPart as MoneyCounterPartId | null}
        identified={identified}
        onPartSelect={onPartSelect as (part: MoneyCounterPartId) => void}
      />
      <ModelOrbitControls dampingEnabled={false} zoomEnabled rotateEnabled target={[0, 0.15, 0]} minDistance={5.5} maxDistance={12} />
    </Canvas>
  </div>
);
