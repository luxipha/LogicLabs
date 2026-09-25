import React, {useMemo, useRef, type RefObject} from 'react';
import {Canvas, useFrame, useLoader, useThree, type ThreeEvent} from '@react-three/fiber';
import {DoubleSide, Group} from 'three';
import type {Mesh, Object3D} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type WaterwheelPartId = 'wheel' | 'paddles' | 'axle' | 'sluice';
export type WaterwheelBuildPartId =
  | 'supports'
  | 'wheel'
  | 'paddles'
  | 'axle'
  | 'sluice'
  | 'generator'
  | 'cable'
  | 'house';

const HIGHLIGHT = '#ffdf46';
const WHEEL_RADIUS = 1.55;
const WHEEL_WIDTH = 1.5;
const WHEEL_CENTER_Y = 1.85;
const PIER_X = 1.25;
const SLUICE_TILT = 0.17;
const SPOUT_Z = 0.42;
const DROP_TOP = 3.9;
const DROP_BOTTOM = 3.15;

// The wheel is a ring around the X axis, so every spoke and paddle sits on a
// circle in the Y/Z plane and is rotated about X to point outwards.
const SPOKE_ANGLES = Array.from({length: 10}, (_, index) => (index / 10) * Math.PI * 2);

const RIM_X = [-WHEEL_WIDTH / 2, WHEEL_WIDTH / 2];
const PIER_POSITIONS = [-PIER_X, PIER_X];

const WoodMaterial: React.FC<{active?: boolean; color?: string; roughness?: number}> = ({
  active = false,
  color = '#c98f4c',
  roughness = 0.74,
}) => (
  <meshStandardMaterial
    color={active ? HIGHLIGHT : color}
    emissive={active ? HIGHLIGHT : '#000000'}
    emissiveIntensity={active ? 0.55 : 0}
    roughness={roughness}
    metalness={0.04}
  />
);

const MetalMaterial: React.FC<{active?: boolean; color?: string}> = ({active = false, color = '#9aa7b8'}) => (
  <meshStandardMaterial
    color={active ? HIGHLIGHT : color}
    emissive={active ? HIGHLIGHT : '#000000'}
    emissiveIntensity={active ? 0.55 : 0}
    roughness={0.42}
    metalness={0.34}
  />
);

const StoneMaterial: React.FC<{color?: string}> = ({color = '#aeaaa0'}) => (
  <meshStandardMaterial color={color} roughness={0.92} metalness={0.02} />
);

const PowerDemo: React.FC<{
  powered: boolean;
  visibleParts?: ReadonlySet<WaterwheelBuildPartId>;
}> = ({powered, visibleParts}) => {
  const electricityColor = powered ? '#ffe66d' : '#2f3b45';
  const windowColor = powered ? '#fff27a' : '#7ba3b8';
  const shown = (part: WaterwheelBuildPartId) => !visibleParts || visibleParts.has(part);

  return (
    <group>
      <group position={[2.35, 1.7, -0.15]} visible={shown('generator')}>
        <mesh position={[-0.72, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 1.05, 18]} />
          <meshStandardMaterial color="#8d9aaa" metalness={0.65} roughness={0.3} />
        </mesh>
        <mesh>
          <boxGeometry args={[1.05, 0.82, 0.86]} />
          <meshStandardMaterial
            color={powered ? '#2f9fd0' : '#35718f'}
            emissive={powered ? '#155a77' : '#000000'}
            emissiveIntensity={powered ? 0.3 : 0}
            roughness={0.42}
            metalness={0.28}
          />
        </mesh>
        <mesh position={[0, -1.05, 0]}>
          <boxGeometry args={[0.78, 1.28, 0.72]} />
          <StoneMaterial color="#8b9296" />
        </mesh>
      </group>

      <group visible={shown('cable')}>
        <mesh position={[2.55, 0.82, -0.55]}>
          <boxGeometry args={[0.075, 1.7, 0.075]} />
          <meshStandardMaterial color={electricityColor} emissive={electricityColor} emissiveIntensity={powered ? 0.75 : 0} />
        </mesh>
        <mesh position={[2.55, 0.24, -1.25]}>
          <boxGeometry args={[0.075, 0.075, 1.48]} />
          <meshStandardMaterial color={electricityColor} emissive={electricityColor} emissiveIntensity={powered ? 0.75 : 0} />
        </mesh>
        <mesh position={[2.92, 0.24, -1.97]}>
          <boxGeometry args={[0.8, 0.075, 0.075]} />
          <meshStandardMaterial color={electricityColor} emissive={electricityColor} emissiveIntensity={powered ? 0.75 : 0} />
        </mesh>
      </group>

      <group position={[3.35, 0.02, -1.95]} scale={0.72} visible={shown('house')}>
        <mesh position={[0, 0.65, 0]}>
          <boxGeometry args={[1.5, 1.3, 1.35]} />
          <meshStandardMaterial color="#f4dfb8" roughness={0.86} />
        </mesh>
        <mesh position={[0, 1.58, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[1.15, 0.78, 4]} />
          <meshStandardMaterial color="#a84f38" roughness={0.8} />
        </mesh>
        {[-0.42, 0.42].map((x) => (
          <mesh key={x} position={[x, 0.76, 0.686]}>
            <boxGeometry args={[0.38, 0.42, 0.035]} />
            <meshStandardMaterial
              color={windowColor}
              emissive={powered ? '#ffd84c' : '#000000'}
              emissiveIntensity={powered ? 1.15 : 0}
              roughness={0.25}
            />
          </mesh>
        ))}
        <mesh position={[0, 0.36, 0.704]}>
          <boxGeometry args={[0.38, 0.72, 0.06]} />
          <WoodMaterial color="#7a4b2a" />
        </mesh>
      </group>
      {powered && shown('house') ? <pointLight position={[3.35, 1.1, -1.25]} color="#ffd95a" intensity={1.1} distance={4.2} /> : null}
    </group>
  );
};

const WaterDrops: React.FC<{active: boolean}> = ({active}) => {
  const groupRef = useRef<Group>(null);
  const {invalidate} = useThree();

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!active || !group) return;
    group.children.forEach((drop, index) => {
      drop.position.y -= (2.3 + index * 0.06) * delta;
      if (drop.position.y < DROP_BOTTOM) drop.position.y = DROP_TOP;
    });
    invalidate();
  });

  return (
    <group ref={groupRef} visible={active}>
      {Array.from({length: 9}).map((_, index) => (
        <mesh
          key={index}
          position={[-0.26 + (index % 3) * 0.26, DROP_BOTTOM + (index / 9) * (DROP_TOP - DROP_BOTTOM), SPOUT_Z + (index % 2 ? 0.09 : -0.09)]}
        >
          <sphereGeometry args={[0.075, 10, 8]} />
          <meshStandardMaterial color="#7cc9f0" roughness={0.2} metalness={0.05} transparent opacity={0.92} />
        </mesh>
      ))}
    </group>
  );
};

const SluiceGate: React.FC<{open: boolean; active: boolean}> = ({open, active}) => {
  const groupRef = useRef<Group>(null);
  const {invalidate} = useThree();
  const target = open ? 0.74 : 0.28;

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const diff = target - group.position.y;
    if (Math.abs(diff) < 0.003) {
      group.position.y = target;
      return;
    }
    group.position.y += diff * Math.min(1, delta * 7);
    invalidate();
  });

  return (
    <group ref={groupRef} position={[0, open ? 0.74 : 0.28, 1.44]}>
      <mesh>
        <boxGeometry args={[1.02, 0.48, 0.1]} />
        <WoodMaterial active={active} color="#8f5f2c" />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[1.02, 0.14, 0.14]} />
        <WoodMaterial active={active} color="#8f5f2c" />
      </mesh>
    </group>
  );
};

export const WaterwheelModel: React.FC<{
  wheelRef?: RefObject<Group>;
  wheelRotation?: number;
  gateOpen?: boolean;
  waterOn?: boolean;
  showPowerDemo?: boolean;
  powered?: boolean;
  visibleParts?: ReadonlySet<WaterwheelBuildPartId>;
  highlightedPart?: WaterwheelPartId | null;
  onPartSelect?: (part: WaterwheelPartId) => void;
}> = ({
  wheelRef,
  wheelRotation,
  gateOpen = false,
  waterOn = false,
  showPowerDemo = false,
  powered = false,
  visibleParts,
  highlightedPart = null,
  onPartSelect,
}) => {
  const select = (part: WaterwheelPartId) =>
    onPartSelect
      ? (event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          onPartSelect(part);
        }
      : undefined;
  const hot = (part: WaterwheelPartId) => highlightedPart === part;
  const shown = (part: WaterwheelBuildPartId) => !visibleParts || visibleParts.has(part);
  const wheelPose: {rotation?: [number, number, number]} =
    wheelRotation === undefined ? {} : {rotation: [wheelRotation, 0, 0]};

  return (
    <group>
      <mesh position={[0, -0.16, 0]}>
        <boxGeometry args={[8.8, 0.32, 5.4]} />
        <StoneMaterial color="#7fa86a" />
      </mesh>

      <mesh position={[0, 0.02, 1.6]}>
        <boxGeometry args={[8.8, 0.1, 2.2]} />
        <meshStandardMaterial color="#4aa8dd" roughness={0.24} metalness={0.06} transparent opacity={0.82} />
      </mesh>

      {shown('supports')
        ? PIER_POSITIONS.map((x) => (
            <group key={x}>
              <mesh position={[x, WHEEL_CENTER_Y / 2, 0]}>
                <boxGeometry args={[0.44, WHEEL_CENTER_Y, 0.68]} />
                <StoneMaterial />
              </mesh>
              <mesh position={[x, WHEEL_CENTER_Y, 0]}>
                <boxGeometry args={[0.5, 0.3, 0.76]} />
                <StoneMaterial color="#8f8b82" />
              </mesh>
            </group>
          ))
        : null}

      <group position={[0, WHEEL_CENTER_Y, 0]} {...wheelPose} ref={wheelRef}>
        <group onClick={select('paddles')} visible={shown('paddles')}>
          {SPOKE_ANGLES.map((angle) => (
            <mesh
              key={`paddle-${angle}`}
              position={[0, Math.cos(angle) * 1.25, Math.sin(angle) * 1.25]}
              rotation={[angle, 0, 0]}
            >
              <boxGeometry args={[WHEEL_WIDTH * 0.98, 0.62, 0.09]} />
              <WoodMaterial active={hot('paddles')} color="#d9a15b" />
            </mesh>
          ))}
        </group>

        <group onClick={select('wheel')} visible={shown('wheel')}>
          {RIM_X.map((x) => (
            <mesh key={`rim-${x}`} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[WHEEL_RADIUS, 0.085, 8, 44]} />
              <WoodMaterial active={hot('wheel')} color="#a9702f" />
            </mesh>
          ))}
          {SPOKE_ANGLES.map((angle) => (
            <mesh
              key={`spoke-${angle}`}
              position={[0, Math.cos(angle) * 0.72, Math.sin(angle) * 0.72]}
              rotation={[angle, 0, 0]}
            >
              <boxGeometry args={[0.11, 1.08, 0.11]} />
              <WoodMaterial active={hot('wheel')} color="#a9702f" />
            </mesh>
          ))}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.36, 0.36, WHEEL_WIDTH * 1.02, 24]} />
            <WoodMaterial active={hot('wheel')} color="#b87b36" />
          </mesh>
        </group>
      </group>

      <group onClick={select('axle')} visible={shown('axle')}>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0, WHEEL_CENTER_Y, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 3.7, 20]} />
          <MetalMaterial active={hot('axle')} />
        </mesh>
      </group>

      <group onClick={select('sluice')} visible={shown('sluice')}>
        <group position={[0, 4.2, -1.05]} rotation={[SLUICE_TILT, 0, 0]}>
          <mesh>
            <boxGeometry args={[1.06, 0.14, 3.15]} />
            <WoodMaterial active={hot('sluice')} color="#b47f3d" />
          </mesh>
          {[-0.5, 0.5].map((x) => (
            <mesh key={x} position={[x, 0.22, 0]}>
              <boxGeometry args={[0.1, 0.36, 3.15]} />
              <WoodMaterial active={hot('sluice')} color="#b47f3d" />
            </mesh>
          ))}
          <SluiceGate open={gateOpen} active={hot('sluice')} />
        </group>
      </group>

      <mesh position={[0, 3.52, SPOUT_Z]} visible={waterOn}>
        <boxGeometry args={[0.74, 0.66, 0.36]} />
        <meshStandardMaterial color="#7cc9f0" roughness={0.18} metalness={0.05} transparent opacity={0.74} />
      </mesh>
      <WaterDrops active={waterOn} />
      {showPowerDemo ? <PowerDemo powered={powered} visibleParts={visibleParts} /> : null}
    </group>
  );
};

export const WaterwheelLights: React.FC = () => (
  <>
    <ambientLight intensity={1.1} />
    <hemisphereLight intensity={0.75} groundColor="#4f7c3d" />
    <directionalLight position={[6, 9, 7]} intensity={1.35} />
  </>
);

const SUPPLIED_WATERWHEEL_URL = 'models/waterwheel.glb';
const SUPPLIED_WHEEL_CENTER: [number, number, number] = [0.365, 0.687, 0];

const isSuppliedWheelMesh = (object: Object3D) => {
  const match = /^Object_(\d+)$/.exec(object.name);
  if (!match) return false;
  const nodeIndex = Number(match[1]);

  // Three.js retains the GLB node names here, not the mesh-definition names.
  // The inspected wheel geometry lives on even-numbered nodes 4-46, except
  // Object_14, which is the first fixed wooden base beam. Later nodes contain
  // the floor, second base beam, and upright supports.
  return nodeIndex >= 4 && nodeIndex <= 46 && nodeIndex % 2 === 0 && nodeIndex !== 14;
};

const SuppliedWaterFlow: React.FC = () => {
  const dropsRef = useRef<Group>(null);
  const {invalidate} = useThree();

  useFrame((_, delta) => {
    const drops = dropsRef.current;
    if (!drops) return;
    drops.children.forEach((drop, index) => {
      drop.position.y -= delta * (0.62 + index * 0.035);
      if (drop.position.y < 1.08) drop.position.y = 2.18;
    });
    invalidate();
  });

  return (
    <group>
      <mesh position={[0.365, 1.66, -0.8]}>
        <planeGeometry args={[0.3, 1.08, 1, 8]} />
        <meshStandardMaterial
          color="#55c7f3"
          emissive="#1b86bd"
          emissiveIntensity={0.18}
          roughness={0.12}
          metalness={0.02}
          transparent
          opacity={0.68}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      <group ref={dropsRef}>
        {Array.from({length: 8}).map((_, index) => (
          <mesh
            key={index}
            position={[
              0.29 + (index % 3) * 0.075,
              1.1 + (index / 8) * 1.08,
              -0.77 + (index % 2) * 0.055,
            ]}
          >
            <sphereGeometry args={[0.045, 8, 6]} />
            <meshStandardMaterial color="#8cddfb" transparent opacity={0.82} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const SuppliedWaterwheelModel: React.FC = () => {
  const gltf = useLoader(GLTFLoader, SUPPLIED_WATERWHEEL_URL);
  const {model, wheel} = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child: Object3D) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.frustumCulled = false;
    });

    // The Sketchfab export has generic node names and no animation. Group every
    // measured wheel mesh so both rims, spokes, paddles, hub, and axle move as
    // one assembly while the supports, beams, and floor stay fixed.
    const wheelPivot = new Group();
    wheelPivot.name = 'ExploreWaterwheelPivot';
    wheelPivot.position.set(...SUPPLIED_WHEEL_CENTER);
    clone.add(wheelPivot);
    clone.updateMatrixWorld(true);
    const rotatingMeshes: Object3D[] = [];
    clone.traverse((child) => {
      if ((child as Mesh).isMesh && isSuppliedWheelMesh(child)) rotatingMeshes.push(child);
    });
    rotatingMeshes.forEach((mesh) => wheelPivot.attach(mesh));

    return {model: clone, wheel: wheelPivot};
  }, [gltf.scene]);

  const {invalidate} = useThree();
  useFrame((_, delta) => {
    wheel.rotation.x -= delta * 0.58;
    invalidate();
  });

  // The supplied scene includes a 22-unit ground plane around a roughly
  // 2-unit wheel. Frame the wheel itself instead of fitting the whole scene.
  return (
    <group scale={2.55} position={[-0.9, 0.3, 0]} rotation={[0, -0.38, 0]}>
      <primitive object={model} />
      <SuppliedWaterFlow />
    </group>
  );
};

export const WaterwheelExploreCanvas: React.FC = () => (
  <Canvas
    className="waterwheel-canvas"
    camera={{position: [7.2, 4.7, 7.6], fov: 31, near: 0.1, far: 120}}
    dpr={1}
    frameloop="demand"
    gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}
  >
    <color attach="background" args={['#bfe3f7']} />
    <WaterwheelLights />
    <SuppliedWaterwheelModel />
    <ModelOrbitControls zoomEnabled rotateEnabled target={[0, 2.1, 0]} minDistance={5.5} maxDistance={16} />
  </Canvas>
);

export const WaterwheelIdentifyCanvas: React.FC<{
  highlightedPart: WaterwheelPartId | null;
  onPartSelect: (part: WaterwheelPartId) => void;
}> = ({highlightedPart, onPartSelect}) => (
  <Canvas
    className="waterwheel-canvas"
    camera={{position: [8, 4.6, 5.8], fov: 32, near: 0.1, far: 100}}
    dpr={1}
    frameloop="demand"
    gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}
  >
    <color attach="background" args={['#bfe3f7']} />
    <WaterwheelLights />
    <WaterwheelModel wheelRotation={0.42} highlightedPart={highlightedPart} onPartSelect={onPartSelect} />
    <ModelOrbitControls
      zoomEnabled
      dampingEnabled={false}
      rotateEnabled
      target={[0, 2.2, 0]}
      minDistance={7.5}
      maxDistance={16}
    />
  </Canvas>
);
