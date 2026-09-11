import React, {useMemo, useRef} from 'react';
import {Canvas, useFrame, useLoader, type ThreeEvent} from '@react-three/fiber';
import {
  Box3,
  BufferGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Vector3,
} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type MonsterTruckPartId = 'body' | 'engine' | 'tires' | 'roll-cage' | 'shocks';

const TARGET_LENGTH = 6;
const HIGHLIGHT_COLOR = '#ffdf46';

// The GLB names each mesh with its component path, e.g.
// "Truck:Chassis:Rims:Tire_1_1_Truck:Suspension:_Charcoa_0". Match the most
// specific parts first; anything unmatched counts as part of the body.
const PART_PATTERNS: {part: MonsterTruckPartId; pattern: RegExp}[] = [
  {part: 'tires', pattern: /tire_1/i},
  {part: 'engine', pattern: /engine1|tranny/i},
  {part: 'shocks', pattern: /suspension/i},
  {part: 'roll-cage', pattern: /trunkbed/i},
];

const partFromMeshName = (name: string): MonsterTruckPartId =>
  PART_PATTERNS.find(({pattern}) => pattern.test(name))?.part ?? 'body';

const createBakedMesh = (source: Mesh, geometry: BufferGeometry, part: MonsterTruckPartId) => {
  const mesh = new Mesh(geometry, source.material);
  mesh.name = source.name;
  mesh.userData.part = part;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  return mesh;
};

const ROAD_LENGTH = 30;
const ROAD_WIDTH = 5;
const BUMP_SPACING = 1.4;
const BUMP_COUNT = 22;
const DRIVE_SPEED = 4;
const DRIVE_DISTANCE = 24;

// The rough road scrolls past a stationary truck: bumps slide from the front of
// the truck to the back while the truck bounces and tilts over them.
const RoughRoad: React.FC<{
  truckRef: React.RefObject<Group>;
  bottomY: number;
  running: boolean;
  finished: boolean;
  onFinish: () => void;
}> = ({truckRef, bottomY, running, finished, onFinish}) => {
  const roadRef = useRef<Group>(null);
  const distance = useRef(0);
  const fired = useRef(false);

  useFrame((_, delta) => {
    const driving = running && !finished;
    if (driving) {
      distance.current = Math.min(DRIVE_DISTANCE, distance.current + delta * DRIVE_SPEED);
    }

    if (roadRef.current) {
      roadRef.current.position.x = -(distance.current % BUMP_SPACING);
    }

    if (truckRef.current) {
      const bounce = driving ? Math.abs(Math.sin(distance.current * 1.5)) * 0.16 : 0;
      truckRef.current.position.y = bounce;
      truckRef.current.rotation.z = -bounce * 0.35;
    }

    if (driving && !fired.current && distance.current >= DRIVE_DISTANCE) {
      fired.current = true;
      onFinish();
    }
  });

  return (
    <group>
      <mesh position={[0, bottomY - 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROAD_LENGTH + 8, ROAD_WIDTH]} />
        <meshStandardMaterial color="#8a6b4a" roughness={1} />
      </mesh>
      <group ref={roadRef}>
        {Array.from({length: BUMP_COUNT}).map((_, index) => (
          <mesh
            key={index}
            position={[-ROAD_LENGTH / 2 + index * BUMP_SPACING, bottomY - 0.02, ((index % 3) - 1) * 1.1]}
            scale={[1, 0.55, 1]}
          >
            <sphereGeometry args={[0.26, 14, 10]} />
            <meshStandardMaterial color="#6f5236" roughness={1} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export const MonsterTruckModel: React.FC<{
  highlightedPart: MonsterTruckPartId | null;
  mode: string;
  activityRunning: boolean;
  activityFinished: boolean;
  onPartSelect: (part: MonsterTruckPartId) => void;
  onFinish: () => void;
}> = ({highlightedPart, mode, activityRunning, activityFinished, onPartSelect, onFinish}) => {
  const gltf = useLoader(GLTFLoader, 'models/monster-truck.glb');
  const truckRef = useRef<Group>(null);

  const model = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.updateMatrixWorld(true);
    const baked = new Group();
    const visibleBox = new Box3();

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

      baked.add(createBakedMesh(mesh, geometry, partFromMeshName(mesh.name)));
      if (geometry.boundingBox) {
        visibleBox.union(geometry.boundingBox);
      }
    });

    const box = visibleBox.isEmpty() ? new Box3().setFromObject(baked) : visibleBox;
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);

    // Longest horizontal axis should face the camera, so the truck is seen in
    // profile from the default camera and the road runs along its length.
    if (size.z > size.x) {
      baked.rotation.y = Math.PI / 2;
      baked.updateMatrixWorld(true);
      const rotatedBox = new Box3().setFromObject(baked);
      rotatedBox.getCenter(center);
      rotatedBox.getSize(size);
    }

    const scale = TARGET_LENGTH / Math.max(size.x, size.y, size.z);
    baked.scale.setScalar(scale);
    baked.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

    return {object: baked, scale, center, size, bottomY: -(size.y * scale) / 2};
  }, [gltf.scene]);

  const highlight = useMemo(() => {
    if (!highlightedPart) {
      return null;
    }

    const overlay = new Group();
    overlay.scale.copy(model.object.scale);
    overlay.position.copy(model.object.position);
    overlay.rotation.copy(model.object.rotation);

    model.object.children.forEach((child) => {
      if (!(child instanceof Mesh) || child.userData.part !== highlightedPart) {
        return;
      }
      const mesh = new Mesh(
        child.geometry,
        new MeshBasicMaterial({
          color: HIGHLIGHT_COLOR,
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

    return overlay.children.length ? overlay : null;
  }, [highlightedPart, model]);

  const selectPart = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const part = (event.object.userData as {part?: MonsterTruckPartId}).part;
    if (part) {
      onPartSelect(part);
    }
  };

  return (
    <group>
      <group ref={truckRef} onClick={mode === 'identify' ? selectPart : undefined}>
        <primitive object={model.object} />
      </group>
      {highlight ? <primitive object={highlight} /> : null}
      {mode === 'activity' ? (
        <RoughRoad
          truckRef={truckRef}
          bottomY={model.bottomY}
          running={activityRunning}
          finished={activityFinished}
          onFinish={onFinish}
        />
      ) : null}
    </group>
  );
};

export const MonsterTruckCanvas: React.FC<{
  highlightedPart: MonsterTruckPartId | null;
  mode: string;
  activityRunning: boolean;
  activityFinished: boolean;
  onPartSelect: (part: MonsterTruckPartId) => void;
  onFinish: () => void;
}> = ({highlightedPart, mode, activityRunning, activityFinished, onPartSelect, onFinish}) => (
  <Canvas
    camera={{position: [0, 1.4, 9], fov: 32, near: 0.1, far: 100}}
    dpr={[1, 1.5]}
    gl={{antialias: false}}
  >
    <ambientLight intensity={0.7} />
    <hemisphereLight intensity={0.75} groundColor="#5b7a99" />
    <directionalLight position={[4, 6, 5]} intensity={1.4} />
    <directionalLight position={[-3, 2, -3]} intensity={0.35} color="#a4c2ff" />
    <MonsterTruckModel
      highlightedPart={highlightedPart}
      mode={mode}
      activityRunning={activityRunning}
      activityFinished={activityFinished}
      onPartSelect={onPartSelect}
      onFinish={onFinish}
    />
    <ModelOrbitControls
      zoomEnabled={mode === 'identify'}
      rotateEnabled={mode === 'identify' || mode === 'explore'}
      target={[0, 0, 0]}
      minDistance={5}
      maxDistance={18}
    />
  </Canvas>
);
