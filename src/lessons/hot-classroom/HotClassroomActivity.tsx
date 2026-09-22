import React, {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

type AssemblyPart = 'blade' | 'motor' | 'guard' | 'base';

const PARTS: Array<{id: AssemblyPart; label: string; fact: string}> = [
  {id: 'base', label: 'Base', fact: 'The base holds the fan steady.'},
  {id: 'motor', label: 'Motor', fact: 'The motor turns the blades.'},
  {id: 'blade', label: 'Blade', fact: 'The blades spin to move the air.'},
  {id: 'guard', label: 'Guard', fact: 'The guard helps keep fingers away from the blades.'},
];

const AssemblyFan: React.FC<{placed: Set<AssemblyPart>}> = ({placed}) => (
  <group position={[0, -0.1, 0]}>
    {placed.has('base') ? (
      <>
        <mesh position={[0, -1.7, 0]}>
          <cylinderGeometry args={[1.02, 1.2, 0.32, 32]} />
          <meshStandardMaterial color="#8d9aae" roughness={0.52} />
        </mesh>
        <mesh position={[0, -0.9, 0]}>
          <cylinderGeometry args={[0.14, 0.22, 1.35, 24]} />
          <meshStandardMaterial color="#b3becd" roughness={0.52} />
        </mesh>
      </>
    ) : null}
    {placed.has('blade') ? (
      <group position={[0, 0.25, 0]}>
        {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((rotation) => (
          <mesh key={rotation} position={[Math.sin(rotation) * 0.58, Math.cos(rotation) * 0.58, 0]} rotation={[0, 0, -rotation]} scale={[0.34, 0.8, 0.1]}>
            <sphereGeometry args={[1, 20, 14]} />
            <meshStandardMaterial color="#f17b34" roughness={0.5} />
          </mesh>
        ))}
      </group>
    ) : null}
    {placed.has('motor') ? (
      <mesh position={[0, 0.25, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.34, 32]} />
        <meshStandardMaterial color="#5f7894" roughness={0.42} metalness={0.2} />
      </mesh>
    ) : null}
    {placed.has('guard') ? (
      <group position={[0, 0.25, 0.4]}>
        <mesh>
          <torusGeometry args={[1.38, 0.06, 10, 48]} />
          <meshStandardMaterial color="#c7d1df" roughness={0.45} metalness={0.18} />
        </mesh>
        {Array.from({length: 12}).map((_, index) => {
          const angle = (index / 12) * Math.PI * 2;
          return (
            <mesh key={angle} position={[Math.sin(angle) * 0.7, Math.cos(angle) * 0.7, 0]} rotation={[0, 0, -angle]}>
              <boxGeometry args={[0.045, 1.36, 0.045]} />
              <meshStandardMaterial color="#c7d1df" roughness={0.45} metalness={0.18} />
            </mesh>
          );
        })}
      </group>
    ) : null}
  </group>
);

const AssemblyCanvas: React.FC<{placed: Set<AssemblyPart>}> = ({placed}) => (
  <Canvas
    className="hot-classroom-assembly-canvas"
    camera={{position: [0, 0.4, 7], fov: 30, near: 0.1, far: 100}}
    dpr={1}
    frameloop="demand"
    gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}
  >
    <color attach="background" args={['#a8d9f3']} />
    <ambientLight intensity={1.15} />
    <hemisphereLight intensity={0.8} groundColor="#527f3d" />
    <directionalLight position={[4, 6, 5]} intensity={1.45} />
    <AssemblyFan placed={placed} />
    <ModelOrbitControls zoomEnabled dampingEnabled={false} rotateEnabled target={[0, -0.1, 0]} minDistance={4.8} maxDistance={11} />
  </Canvas>
);

export const HotClassroomActivity: React.FC<{
  activityDone: boolean;
  completeActivity: () => void;
  resetActivity: () => void;
}> = ({activityDone, completeActivity, resetActivity}) => {
  const [placed, setPlaced] = useState<Set<AssemblyPart>>(() => new Set());
  const [lastPlaced, setLastPlaced] = useState<AssemblyPart | null>(null);
  const [dragging, setDragging] = useState<AssemblyPart | null>(null);

  const snapPart = (part: AssemblyPart) => {
    if (activityDone || placed.has(part)) return;
    const next = new Set(placed);
    next.add(part);
    setPlaced(next);
    setLastPlaced(part);
    if (next.size === PARTS.length) completeActivity();
  };

  const tryAgain = () => {
    setPlaced(new Set());
    setLastPlaced(null);
    setDragging(null);
    resetActivity();
  };

  return (
    <div className="hot-classroom-activity">
      <div
        className="hot-classroom-assembly-zone"
        data-fan-drop-zone
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const part = event.dataTransfer.getData('application/x-hot-fan-part') as AssemblyPart;
          if (PARTS.some(({id}) => id === part)) snapPart(part);
          setDragging(null);
        }}
      >
        <AssemblyCanvas placed={placed} />
        {placed.size === 0 ? <div className="hot-classroom-assembly-empty">Drop fan parts here</div> : null}
        {activityDone ? <div className="hot-classroom-assembly-complete">The fan is ready to make a breeze!</div> : null}
      </div>

      <div className="hot-classroom-parts-tray" aria-label="Fan parts to assemble">
        {PARTS.map(({id, label}) => (
          <button
            key={id}
            type="button"
            className={`hot-classroom-assembly-part${placed.has(id) ? ' is-placed' : ''}${dragging === id ? ' is-dragging' : ''}`}
            draggable={!placed.has(id) && !activityDone}
            disabled={placed.has(id) || activityDone}
            onClick={() => snapPart(id)}
            onDragStart={(event) => {
              event.dataTransfer.setData('application/x-hot-fan-part', id);
              event.dataTransfer.effectAllowed = 'move';
              setDragging(id);
            }}
            onDragEnd={() => setDragging(null)}
          >
            <span className={`hot-classroom-part-preview hot-classroom-part-preview--${id}`} aria-hidden="true" />
            <strong>{placed.has(id) ? `${label} added` : label}</strong>
          </button>
        ))}
      </div>

      <div className="hot-classroom-assembly-status" role="status">
        {lastPlaced ? PARTS.find(({id}) => id === lastPlaced)?.fact : 'Drag a part into the fan, or tap a part to snap it in.'}
      </div>
      {activityDone ? <button type="button" className="primary-action hot-classroom-try-again" onClick={tryAgain}>↻ Try again</button> : null}
    </div>
  );
};
