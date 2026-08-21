import React, {useMemo, useRef} from 'react';
import {Canvas, useFrame, useLoader, useThree} from '@react-three/fiber';
import {
  Box3,
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type RadarPartId = 'antenna' | 'radar-dish' | 'cab' | 'body' | 'wheels';

type RadarHitArea = {
  part: RadarPartId;
  position: [number, number, number];
  size: [number, number, number];
  sourceMeshIndexes?: number[];
};

// The GLB's meshes are material groups, not truck components. These areas use
// the model's rendered axes: X is left-to-right and Y is bottom-to-top.
const RADAR_HIT_AREAS: RadarHitArea[] = [
  {part: 'antenna', position: [78, 535, 0], size: [90, 470, 1100]},
  {part: 'radar-dish', position: [215, 665, 0], size: [270, 380, 1100]},
  // The cab is the front, windowed section at the right of the rendered truck.
  {part: 'cab', position: [300, 300, 0], size: [190, 270, 1100]},
  {part: 'body', position: [135, 210, 0], size: [440, 140, 1100]},
  {part: 'wheels', position: [59, 70, 0], size: [600, 140, 1100], sourceMeshIndexes: [0]},
];

// Activity scene coordinates (truck is centered at the origin, ~6 units tall).
const DISH_POS = new Vector3(0.9, 1.4, 0);
// The airplane sits clearly beside and above the truck, in open sky — not
// hidden behind the truck body.
const AIRPLANE_POS = new Vector3(2.6, 3.0, -3.2);
// The storm cloud from the story sits higher and further back.
const CLOUD_POS = new Vector3(-2.2, 4.8, -5.6);
const WAVE_COUNT = 5;
const WAVE_DURATION = 1.5;
const WAVE_INTERVAL = 0.42;

const DEFAULT_CAM = new Vector3(0, 1.2, 10);
const ACTIVITY_CAM = new Vector3(0, 1.8, 12);
const ACTIVITY_TARGET = new Vector3(0, 1.2, -1);

const createBakedMesh = (source: Mesh, geometry: BufferGeometry, sourceMeshIndex: number) => {
  const mesh = new Mesh(geometry, source.material);
  mesh.name = source.name;
  mesh.userData.sourceMeshIndex = sourceMeshIndex;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  // Selection is handled by the semantic regions below, not material meshes.
  mesh.raycast = () => undefined;
  return mesh;
};

const createPartHighlight = (geometry: BufferGeometry, area: RadarHitArea, sourceMeshIndex: number) => {
  if (area.sourceMeshIndexes) {
    return area.sourceMeshIndexes.includes(sourceMeshIndex) ? geometry.clone() : null;
  }
  const position = geometry.getAttribute('position');
  const index = geometry.getIndex();
  const vertices: number[] = [];
  const [width, height, depth] = area.size;
  const [x, y, z] = area.position;
  const minX = x - width / 2;
  const maxX = x + width / 2;
  const minY = y - height / 2;
  const maxY = y + height / 2;
  const minZ = z - depth / 2;
  const maxZ = z + depth / 2;
  const vertexCount = index ? index.count : position.count;

  for (let offset = 0; offset < vertexCount; offset += 3) {
    const first = index ? index.getX(offset) : offset;
    const second = index ? index.getX(offset + 1) : offset + 1;
    const third = index ? index.getX(offset + 2) : offset + 2;
    const centerX = (position.getX(first) + position.getX(second) + position.getX(third)) / 3;
    const centerY = (position.getY(first) + position.getY(second) + position.getY(third)) / 3;
    const centerZ = (position.getZ(first) + position.getZ(second) + position.getZ(third)) / 3;

    if (centerX < minX || centerX > maxX || centerY < minY || centerY > maxY || centerZ < minZ || centerZ > maxZ) {
      continue;
    }

    [first, second, third].forEach((vertex) => {
      vertices.push(position.getX(vertex), position.getY(vertex), position.getZ(vertex));
    });
  }

  if (!vertices.length) {
    return null;
  }

  const highlight = new BufferGeometry();
  highlight.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  highlight.computeVertexNormals();
  return highlight;
};

// The distant airplane the radar is trying to find. Built from primitives so
// it is always visible and correctly oriented. Hovers, then pulses and glows
// when the signal wave reaches it.
const AirplaneTarget: React.FC<{found: boolean; visible: boolean}> = ({found, visible}) => {
  const groupRef = useRef<Group>(null);
  const glow = useRef(new Color('#ffe155'));

  const pulseMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#eef4fa',
        metalness: 0.25,
        roughness: 0.55,
        emissive: '#000000',
        emissiveIntensity: 0,
      }),
    [],
  );
  const accentMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#e84a5f',
        metalness: 0.15,
        roughness: 0.6,
        emissive: '#000000',
        emissiveIntensity: 0,
      }),
    [],
  );
  const windowMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#9fd8ff',
        metalness: 0.5,
        roughness: 0.2,
        emissive: '#7fc4ff',
        emissiveIntensity: 0.35,
      }),
    [],
  );

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * 0.9) * 0.12;
    const pulse = found ? 1 + Math.sin(t * 7) * 0.12 : 1;
    groupRef.current.scale.setScalar(pulse);
    const intensity = found ? 0.65 + Math.sin(t * 8) * 0.3 : 0;
    pulseMat.emissive.copy(glow.current);
    pulseMat.emissiveIntensity = intensity;
    accentMat.emissive.copy(glow.current);
    accentMat.emissiveIntensity = intensity;
  });

  return (
    <group position={AIRPLANE_POS} rotation={[0, 0.35, 0.05]} visible={visible}>
      <group ref={groupRef}>
        {/* Fuselage */}
        <mesh material={pulseMat} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.26, 1.5, 6, 16]} />
        </mesh>
        {/* Wings */}
        <mesh material={accentMat} position={[0, -0.05, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[2.6, 0.1, 0.72]} />
        </mesh>
        {/* Tail fin */}
        <mesh material={accentMat} position={[-1.0, 0.32, 0]} rotation={[0, 0, -0.35]}>
          <boxGeometry args={[0.5, 0.55, 0.12]} />
        </mesh>
        {/* Tail wing */}
        <mesh material={pulseMat} position={[-1.05, 0.02, 0]}>
          <boxGeometry args={[0.28, 0.08, 0.9]} />
        </mesh>
        {/* Cockpit window */}
        <mesh material={windowMat} position={[0.55, 0.14, 0]}>
          <sphereGeometry args={[0.18, 12, 10]} />
        </mesh>
        {/* Nose */}
        <mesh material={pulseMat} position={[1.0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.26, 0.55, 16]} />
        </mesh>
      </group>
    </group>
  );
};

// The storm cloud from the story — a soft grey puffball high in the sky.
// It flashes with lightning when the radar finds the airplane.
const StormCloud: React.FC<{found: boolean; visible: boolean}> = ({found, visible}) => {
  const flash = useRef(0);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    flash.current = found ? 0.5 + Math.sin(t * 10) * 0.35 : 0.15;
  });

  return (
    <group position={CLOUD_POS} visible={visible}>
      <mesh position={[0, 0, 0]} scale={[2.2, 1.3, 1.6]}>
        <sphereGeometry args={[1, 24, 18]} />
        <meshStandardMaterial color="#8b9bb0" roughness={0.95} />
      </mesh>
      <mesh position={[1.1, 0.25, 0.3]} scale={[1.4, 0.9, 1.1]}>
        <sphereGeometry args={[1, 24, 18]} />
        <meshStandardMaterial color="#9aa9bc" roughness={0.95} />
      </mesh>
      <mesh position={[-1.1, 0.15, -0.2]} scale={[1.3, 0.85, 1.05]}>
        <sphereGeometry args={[1, 24, 18]} />
        <meshStandardMaterial color="#7d8ca1" roughness={0.95} />
      </mesh>
      {/* Lightning flash glow inside the cloud when found */}
      <mesh position={[0, -0.4, 0.4]}>
        <sphereGeometry args={[0.35, 12, 10]} />
        <meshBasicMaterial color="#fff6c8" transparent opacity={flash.current * 0.9} depthWrite={false} />
      </mesh>
    </group>
  );
};

// Sonar-style signal rings traveling from the dish to the airplane.
const SignalWaves: React.FC<{scanning: boolean; onHit: () => void}> = ({scanning, onHit}) => {
  const ringsRef = useRef<(Mesh | null)[]>([]);
  const agesRef = useRef<number[]>(Array.from({length: WAVE_COUNT}, () => -1));
  const spawnTimer = useRef(0);
  const hitFired = useRef(false);
  const burstRef = useRef<Mesh>(null);
  const burstAge = useRef(-1);

  useFrame((_, delta) => {
    if (!scanning) {
      agesRef.current.fill(-1);
      spawnTimer.current = 0;
      hitFired.current = false;
      burstAge.current = -1;
      if (burstRef.current) {
        burstRef.current.visible = false;
      }
      ringsRef.current.forEach((ring) => ring && (ring.visible = false));
      return;
    }

    spawnTimer.current += delta;
    if (spawnTimer.current >= WAVE_INTERVAL) {
      spawnTimer.current = 0;
      const slot = agesRef.current.findIndex((age) => age < 0 || age >= WAVE_DURATION);
      if (slot !== -1) {
        agesRef.current[slot] = 0;
      }
    }

    ringsRef.current.forEach((ring, index) => {
      if (!ring) {
        return;
      }
      const age = agesRef.current[index];
      if (age < 0) {
        ring.visible = false;
        return;
      }
      const nextAge = age + delta;
      if (nextAge >= WAVE_DURATION) {
        agesRef.current[index] = -1;
        ring.visible = false;
        return;
      }
      agesRef.current[index] = nextAge;
      const t = nextAge / WAVE_DURATION;
      ring.visible = true;
      ring.position.lerpVectors(DISH_POS, AIRPLANE_POS, t);
      const scale = 0.5 + t * 5.8;
      ring.scale.set(scale, scale, scale);
      (ring.material as MeshBasicMaterial).opacity = 0.8 * (1 - t);
      if (t >= 0.88 && !hitFired.current) {
        hitFired.current = true;
        burstAge.current = 0;
        onHit();
      }
    });

    // Reveal burst: a bright ring flashes at the airplane when the wave hits.
    if (burstRef.current) {
      if (burstAge.current >= 0) {
        const t = burstAge.current / 0.7;
        if (t >= 1) {
          burstAge.current = -1;
          burstRef.current.visible = false;
        } else {
          burstRef.current.visible = true;
          const s = 0.3 + t * 2.4;
          burstRef.current.scale.set(s, s, s);
          (burstRef.current.material as MeshBasicMaterial).opacity = 0.9 * (1 - t);
        }
      }
      burstAge.current += delta;
    }
  });

  return (
    <group>
      {Array.from({length: WAVE_COUNT}).map((_, index) => (
        <mesh
          key={index}
          ref={(element) => {
            ringsRef.current[index] = element;
          }}
          visible={false}
        >
          <ringGeometry args={[0.92, 1, 48]} />
          <meshBasicMaterial color="#6ee7ff" transparent opacity={0} side={DoubleSide} depthWrite={false} />
        </mesh>
      ))}
      {/* Reveal burst at the airplane */}
      <mesh ref={burstRef} position={AIRPLANE_POS} visible={false}>
        <ringGeometry args={[0.9, 1.1, 48]} />
        <meshBasicMaterial color="#ffe155" transparent opacity={0} side={DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
};

// Rotating radar beam on the dish while scanning.
const SweepBeam: React.FC<{scanning: boolean}> = ({scanning}) => {
  const ref = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current && scanning) {
      ref.current.rotation.y += delta * 2.4;
    }
  });

  return (
    <mesh ref={ref} position={DISH_POS} rotation={[0.45, 0, 0]} visible={scanning}>
      <coneGeometry args={[1.1, 2.4, 24, 1, true]} />
      <meshBasicMaterial color="#6ee7ff" transparent opacity={0.22} side={DoubleSide} depthWrite={false} />
    </mesh>
  );
};

// Pulls the camera back and up for the activity scene, then returns it
// to the default framing for identify/explore.
const CameraRig: React.FC<{mode: string}> = ({mode}) => {
  const {camera} = useThree();
  const inActivity = mode === 'activity';

  useFrame((_, delta) => {
    const goal = inActivity ? ACTIVITY_CAM : DEFAULT_CAM;
    camera.position.lerp(goal, Math.min(1, delta * 2.5));
    if (inActivity) {
      camera.lookAt(ACTIVITY_TARGET);
    }
  });

  return null;
};

export const RadarTruckModel: React.FC<{
  highlightedPart: RadarPartId | null;
  mode: string;
  activityScanning: boolean;
  activityFound: boolean;
  onPartSelect: (part: RadarPartId) => void;
  onWaveHit: () => void;
}> = ({highlightedPart, mode, activityScanning, activityFound, onPartSelect, onWaveHit}) => {
  const gltf = useLoader(GLTFLoader, '/models/radar-truck.glb');

  const model = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.updateMatrixWorld(true);
    const baked = new Group();
    const visibleBox = new Box3();
    let sourceMeshIndex = 0;

    cloned.traverse((child: Object3D) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) {
        return;
      }
      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(mesh.matrixWorld);
      geometry.computeVertexNormals();
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();

      const bakedMesh = createBakedMesh(mesh, geometry, sourceMeshIndex);
      sourceMeshIndex += 1;
      baked.add(bakedMesh);
      visibleBox.union(new Box3().setFromObject(bakedMesh));
    });

    const box = visibleBox.isEmpty() ? new Box3().setFromObject(baked) : visibleBox;
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);
    // Scale so the truck's longest side is ~6 units, matching the butterfly
    // (model ~3.25 units, camera ~7.4 units away).
    const scale = 6 / Math.max(size.x, size.y, size.z);
    baked.scale.setScalar(scale);
    baked.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    return {object: baked, scale, center};
  }, [gltf.scene]);

  const highlight = useMemo(() => {
    if (!highlightedPart) {
      return null;
    }

    const area = RADAR_HIT_AREAS.find((candidate) => candidate.part === highlightedPart);
    if (!area) {
      return null;
    }

    const overlay = new Group();
    overlay.scale.copy(model.object.scale);
    overlay.position.copy(model.object.position);

    model.object.children.forEach((child) => {
      if (!(child instanceof Mesh)) {
        return;
      }
      const geometry = createPartHighlight(child.geometry, area, Number(child.userData.sourceMeshIndex));
      if (!geometry) {
        return;
      }
      const mesh = new Mesh(
        geometry,
        new MeshBasicMaterial({
          color: '#ffdf46',
          transparent: true,
          opacity: 0.72,
          depthTest: false,
          depthWrite: false,
          side: DoubleSide,
        }),
      );
      mesh.renderOrder = 2;
      mesh.raycast = () => undefined;
      overlay.add(mesh);
    });

    return overlay;
  }, [highlightedPart, model]);

  return (
    <group>
      <primitive object={model.object} />
      {highlight ? <primitive object={highlight} /> : null}
      {mode === 'identify' ? (
        <group
          position={[-model.center.x * model.scale, -model.center.y * model.scale, -model.center.z * model.scale]}
          scale={model.scale}
        >
          {RADAR_HIT_AREAS.map((area) => (
            <mesh
              key={area.part}
              position={area.position}
              onClick={(event) => {
                event.stopPropagation();
                onPartSelect(area.part);
              }}
            >
              <boxGeometry args={area.size} />
              <meshBasicMaterial colorWrite={false} depthWrite={false} />
            </mesh>
          ))}
        </group>
      ) : null}
      <SweepBeam scanning={activityScanning} />
      <SignalWaves scanning={activityScanning} onHit={onWaveHit} />
      <StormCloud found={activityFound} visible={mode === 'activity'} />
      <AirplaneTarget found={activityFound} visible={mode === 'activity'} />
    </group>
  );
};

export const RadarCanvas: React.FC<{
  highlightedPart: RadarPartId | null;
  mode: string;
  activityScanning: boolean;
  activityFound: boolean;
  onPartSelect: (part: RadarPartId) => void;
  onWaveHit: () => void;
}> = ({highlightedPart, mode, activityScanning, activityFound, onPartSelect, onWaveHit}) => (
  <Canvas camera={{position: DEFAULT_CAM.toArray() as [number, number, number], fov: 30, near: 0.1, far: 100}} dpr={[1, 1.5]} gl={{antialias: false}}>
    <ambientLight intensity={0.7} />
    <hemisphereLight intensity={0.75} groundColor="#5b7a99" />
    <directionalLight position={[4, 6, 5]} intensity={1.4} />
    <directionalLight position={[-3, 2, -3]} intensity={0.35} color="#a4c2ff" />
    <CameraRig mode={mode} />
    <ModelOrbitControls
      zoomEnabled={mode === 'identify'}
      rotateEnabled={mode === 'identify' || mode === 'explore'}
      target={[0, 0, 0]}
      minDistance={5}
      maxDistance={18}
    />
    <RadarTruckModel
      highlightedPart={highlightedPart}
      mode={mode}
      activityScanning={activityScanning}
      activityFound={activityFound}
      onPartSelect={onPartSelect}
      onWaveHit={onWaveHit}
    />
  </Canvas>
);
