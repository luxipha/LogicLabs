import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {Canvas, useFrame, type ThreeEvent} from '@react-three/fiber';
import {DoubleSide, Group, InstancedMesh, MathUtils, Object3D} from 'three';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type GarageDoorPartId = 'motor' | 'pulleys' | 'rails';

const HIGHLIGHT: Record<GarageDoorPartId, string> = {
  motor: '#ff8c5a',
  pulleys: '#ffe38a',
  rails: '#78c6ff',
};

const CHAIN_LINKS = Array.from({length: 13}, (_, index) => -0.42 + index * 0.14);
const CAR_START_Z = 2.9;
const CAR_PARKED_Z = -1.85;

const BRICKS = Array.from({length: 7}).flatMap((_, row) =>
  Array.from({length: 10}).map((__, column) => ({
    accent: (row + column) % 3 === 0,
    position: [-2.25 + column * 0.5 + (row % 2 ? 0.25 : 0), -1.25 + row * 0.52, -0.205] as const,
  })),
);

const BrickBatch: React.FC<{accent: boolean; color: string}> = ({accent, color}) => {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const bricks = useMemo(() => BRICKS.filter((brick) => brick.accent === accent), [accent]);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    bricks.forEach((brick, index) => {
      dummy.position.set(...brick.position);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(index, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [bricks, dummy]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, bricks.length]}>
      <boxGeometry args={[0.47, 0.49, 0.035]} />
      <meshStandardMaterial color={color} roughness={0.92} />
    </instancedMesh>
  );
};

const BrickFacade: React.FC = () => (
  <group>
    <BrickBatch accent={false} color="#c96d57" />
    <BrickBatch accent color="#b75e4d" />
  </group>
);

const DoorHardware: React.FC<{panelIndex: number}> = ({panelIndex}) => (
  <>
    {[-1.78, 0, 1.78].map((x) => (
      <group key={x} position={[x, -0.04, 0.1]}>
        <mesh><boxGeometry args={[0.17, 0.18, 0.06]} /><meshStandardMaterial color="#4e5963" metalness={0.9} roughness={0.2} /></mesh>
        <mesh position={[0, 0, 0.045]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.035, 0.035, 0.22, 10]} /><meshStandardMaterial color="#929da5" metalness={0.9} roughness={0.16} /></mesh>
      </group>
    ))}
    {panelIndex === 0 ? (
      <group position={[0, -0.02, 0.12]}>
        <mesh><boxGeometry args={[0.46, 0.06, 0.07]} /><meshStandardMaterial color="#2d3d48" metalness={0.75} roughness={0.25} /></mesh>
        <mesh position={[0, -0.08, 0]}><boxGeometry args={[0.22, 0.12, 0.07]} /><meshStandardMaterial color="#2d3d48" metalness={0.75} roughness={0.25} /></mesh>
      </group>
    ) : null}
  </>
);

const GarageCar: React.FC<{position: number}> = ({position}) => {
  const car = useRef<Group>(null);
  const current = useRef(position);

  useFrame((state, delta) => {
    const moving = Math.abs(current.current - position) > 0.001;
    current.current = moving ? MathUtils.damp(current.current, position, 2.1, delta) : position;
    if (car.current) car.current.position.z = MathUtils.lerp(CAR_START_Z, CAR_PARKED_Z, current.current);
    if (moving) state.invalidate();
  });

  return (
    <group ref={car} position={[0, -0.93, CAR_START_Z]}>
      <mesh castShadow receiveShadow><boxGeometry args={[1.65, 0.38, 3.05]} /><meshStandardMaterial color="#c6342e" metalness={0.68} roughness={0.2} /></mesh>
      <mesh position={[0, 0.33, -0.1]} castShadow><boxGeometry args={[1.46, 0.38, 1.65]} /><meshStandardMaterial color="#b32825" metalness={0.66} roughness={0.18} /></mesh>
      <mesh position={[0, 0.35, 0.25]}><boxGeometry args={[1.38, 0.25, 0.68]} /><meshStandardMaterial color="#4d7084" metalness={0.65} roughness={0.08} transparent opacity={0.78} /></mesh>
      {[-0.86, 0.86].flatMap((x) => [-0.92, 0.92].map((z) => (
        <group key={`${x}-${z}`} position={[x, -0.18, z]} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow><cylinderGeometry args={[0.31, 0.31, 0.2, 18]} /><meshStandardMaterial color="#171b20" roughness={0.68} /></mesh>
          <mesh position={[0, 0, 0.11]}><cylinderGeometry args={[0.15, 0.15, 0.025, 16]} /><meshStandardMaterial color="#b9c4cb" metalness={0.9} roughness={0.2} /></mesh>
        </group>
      )))}
      <mesh position={[0, 0.03, 1.54]}><boxGeometry args={[1.15, 0.1, 0.025]} /><meshStandardMaterial color="#ffddd0" emissive="#ff563c" emissiveIntensity={0.75} /></mesh>
      <mesh position={[0, 0.02, -1.54]}><boxGeometry args={[1.18, 0.1, 0.025]} /><meshStandardMaterial color="#f7f2cd" emissive="#ffe879" emissiveIntensity={0.55} /></mesh>
    </group>
  );
};

const PartGroup: React.FC<{
  id: GarageDoorPartId;
  highlighted: GarageDoorPartId | null;
  selectable: boolean;
  onSelect: (part: GarageDoorPartId) => void;
  children: React.ReactNode;
}> = ({id, highlighted, selectable, onSelect, children}) => (
  <group
    onClick={selectable ? (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onSelect(id); } : undefined}
  >
    {children}
  </group>
);

const DoorPanels: React.FC<{open: boolean}> = ({open}) => {
  const group = useRef<Group>(null);
  const progress = useRef(open ? 1 : 0);

  useFrame((state, delta) => {
    const target = open ? 1 : 0;
    const moving = Math.abs(progress.current - target) > 0.001;
    progress.current = moving ? MathUtils.damp(progress.current, target, 3.4, delta) : target;
    if (!group.current) return;
    group.current.children.forEach((panel, index) => {
      const closedY = -0.95 + index * 0.55;
      const lift = (1.65 + index * 0.16) * progress.current;
      panel.position.y = closedY + lift;
      panel.position.z = Math.sin(progress.current * Math.PI * 0.5) * (0.52 + index * 0.08);
      panel.rotation.x = -progress.current * Math.PI * 0.48;
    });
    if (moving) state.invalidate();
  });

  return (
    <group ref={group}>
        {Array.from({length: 5}).map((_, index) => (
          <group key={index}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[4.15, 0.5, 0.13]} />
              <meshStandardMaterial color="#dce4ea" metalness={0.65} roughness={0.22} />
            </mesh>
            <mesh position={[0, 0, 0.078]}>
              <boxGeometry args={[3.82, 0.34, 0.022]} />
              <meshStandardMaterial color="#c4d0d9" metalness={0.35} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.2, 0.09]}><boxGeometry args={[4.03, 0.028, 0.03]} /><meshStandardMaterial color="#8394a2" metalness={0.9} roughness={0.18} /></mesh>
            <DoorHardware panelIndex={index} />
            {index === 3 ? [-1.18, 1.18].map((x) => (
              <mesh key={x} position={[x, 0, 0.08]}>
                <boxGeometry args={[0.74, 0.22, 0.025]} />
                <meshStandardMaterial color="#31485d" metalness={0.5} roughness={0.18} />
              </mesh>
            )) : null}
          </group>
        ))}
    </group>
  );
};

export const GarageDoorModel: React.FC<{
  highlightedPart: GarageDoorPartId | null;
  mode: string;
  open: boolean;
  carPosition: number;
  onPartSelect: (part: GarageDoorPartId) => void;
}> = ({highlightedPart, mode, open, carPosition, onPartSelect}) => {
  const selectable = mode === 'identify';
  const materialColor = (part: GarageDoorPartId, base: string) => highlightedPart === part ? HIGHLIGHT[part] : base;

  return (
    <group position={[0, -0.25, 0]}>
      <mesh position={[0, 0.2, -0.42]} receiveShadow>
        <boxGeometry args={[5.5, 4.5, 0.35]} />
        <meshStandardMaterial color="#d7d0c5" roughness={0.92} />
      </mesh>
      <BrickFacade />
      {[-2.45, 2.45].map((x) => <mesh key={x} position={[x, 0.1, -0.02]}><boxGeometry args={[0.22, 3.9, 0.22]} /><meshStandardMaterial color="#f1eee8" roughness={0.62} /></mesh>)}
      <mesh position={[0, 2.08, -0.02]}><boxGeometry args={[5.1, 0.2, 0.22]} /><meshStandardMaterial color="#f1eee8" roughness={0.62} /></mesh>
      <mesh position={[0, -1.55, 0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9, 7]} />
        <meshStandardMaterial color="#606a70" roughness={0.96} side={DoubleSide} />
      </mesh>
      <mesh position={[0, -1.52, -0.7]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[4.8, 2.2]} /><meshStandardMaterial color="#7b8387" roughness={1} /></mesh>
      <mesh position={[0, 0.05, -0.2]}>
        <boxGeometry args={[4.65, 3.35, 0.18]} />
        <meshStandardMaterial color="#243643" roughness={0.7} />
      </mesh>

      <DoorPanels open={open} />
      <GarageCar position={carPosition} />

      <PartGroup id="rails" highlighted={highlightedPart} selectable={selectable} onSelect={onPartSelect}>
        {[-2.28, 2.28].map((x) => (
          <group key={x}>
            <mesh position={[x, 0.15, 0.05]}>
              <boxGeometry args={[0.12, 3.45, 0.14]} />
              <meshStandardMaterial color={materialColor('rails', '#697a87')} metalness={0.8} roughness={0.22} />
            </mesh>
            <mesh position={[x, 1.8, 0.8]} rotation={[0.65, 0, 0]}>
              <boxGeometry args={[0.12, 1.6, 0.14]} />
              <meshStandardMaterial color={materialColor('rails', '#697a87')} metalness={0.8} roughness={0.22} />
            </mesh>
            {[-0.95, -0.37, 0.21, 0.79].map((y) => <mesh key={y} position={[x, y, 0.12]} rotation={[0, Math.PI / 2, 0]}><cylinderGeometry args={[0.075, 0.075, 0.12, 14]} /><meshStandardMaterial color="#252e35" roughness={0.4} /></mesh>)}
          </group>
        ))}
      </PartGroup>

      <PartGroup id="motor" highlighted={highlightedPart} selectable={selectable} onSelect={onPartSelect}>
        <mesh position={[0, 1.95, 0.95]} castShadow>
          <boxGeometry args={[0.9, 0.46, 0.6]} />
          <meshStandardMaterial color={materialColor('motor', '#d94e39')} metalness={0.35} roughness={0.32} />
        </mesh>
        <mesh position={[0, 1.95, 1.28]}>
          <boxGeometry args={[0.34, 0.12, 0.03]} />
          <meshStandardMaterial color="#fcdd6b" emissive="#a15d00" emissiveIntensity={0.3} />
        </mesh>
      </PartGroup>

      <PartGroup id="pulleys" highlighted={highlightedPart} selectable={selectable} onSelect={onPartSelect}>
        {[-1.78, 1.78].map((x) => (
          <group key={x} position={[x, 1.48, 0.14]}>
            <mesh castShadow>
              <torusGeometry args={[0.22, 0.055, 12, 28]} />
              <meshStandardMaterial color={materialColor('pulleys', '#586670')} metalness={0.88} roughness={0.2} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.075, 0.075, 0.18, 16]} />
              <meshStandardMaterial color="#303a42" metalness={0.92} roughness={0.18} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 1.8, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 1.85, 10]} />
          <meshStandardMaterial color={materialColor('pulleys', '#39454e')} metalness={0.9} roughness={0.2} />
        </mesh>
        {CHAIN_LINKS.map((z) => (
          <mesh key={z} position={[0, 1.8, z]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.075, 0.018, 6, 10]} />
            <meshStandardMaterial color={materialColor('pulleys', '#687985')} metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
      </PartGroup>

      <group>
        {[-2.02, 2.02].map((x) => (
          <group key={x} position={[x, -1.23, 0.18]}>
            <mesh><boxGeometry args={[0.22, 0.34, 0.16]} /><meshStandardMaterial color="#252d36" roughness={0.35} /></mesh>
            <mesh position={[x < 0 ? 0.12 : -0.12, 0, 0]} rotation={[0, Math.PI / 2, 0]}><cylinderGeometry args={[0.055, 0.055, 0.02, 16]} /><meshStandardMaterial color="#ff6a5f" emissive="#ff2d1d" emissiveIntensity={0.9} /></mesh>
          </group>
        ))}
        <mesh position={[0, -1.23, 0.2]}><boxGeometry args={[3.85, 0.012, 0.012]} /><meshBasicMaterial color="#ff5147" transparent opacity={0.6} /></mesh>
      </group>
      {[-2.85, 2.85].map((x) => <group key={x} position={[x, 1.55, 0.55]}><mesh><cylinderGeometry args={[0.13, 0.16, 0.28, 18]} /><meshStandardMaterial color="#29343a" metalness={0.6} roughness={0.28} /></mesh></group>)}
    </group>
  );
};

export const GarageDoorCanvas: React.FC<{
  highlightedPart: GarageDoorPartId | null;
  mode: string;
  open: boolean;
  carPosition: number;
  onPartSelect: (part: GarageDoorPartId) => void;
}> = (props) => (
  <Canvas
    camera={{position: [5.9, 2.8, 8.7], fov: 34, near: 0.1, far: 100}}
    dpr={1}
    frameloop={props.mode === 'activity' ? 'always' : 'demand'}
    gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}
  >
    <ambientLight intensity={0.75} />
    <hemisphereLight intensity={0.85} groundColor="#506773" />
    <directionalLight position={[4, 6, 5]} intensity={1.7} />
    <directionalLight position={[-4, 2, 3]} intensity={0.55} color="#b8d8ff" />
    <GarageDoorModel {...props} />
    <ModelOrbitControls dampingEnabled={false} zoomEnabled={props.mode === 'identify'} rotateEnabled={props.mode === 'identify' || props.mode === 'explore'} target={[0, 0.2, 0]} minDistance={5} maxDistance={13} />
  </Canvas>
);
