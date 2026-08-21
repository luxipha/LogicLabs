import React, {useMemo} from 'react';
import {useLoader, type ThreeEvent} from '@react-three/fiber';
import {useCurrentFrame, staticFile} from 'remotion';
import {Color, Mesh, MeshStandardMaterial, Object3D, type Group} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

const AIRPLANE_MODEL_URL = staticFile('models/airplane.glb');

export const LESSON_PARTS = [
  'body',
  'cockpit',
  'engine',
  'leftWing',
  'rightWing',
  'tires',
] as const;

export type LessonPartId =
  (typeof LESSON_PARTS)[number];

export const PART_LABELS: Record<LessonPartId, string> = {
  body: 'Body',
  cockpit: 'Cockpit',
  engine: 'Jet Engine',
  leftWing: 'Left Wing',
  rightWing: 'Right Wing',
  tires: 'Tires',
};

export const getExplodedOffset = (part: LessonPartId): [number, number, number] => {
  switch (part) {
    case 'cockpit':
      return [0, 9, 0];
    case 'engine':
      return [0, -10, -4];
    case 'leftWing':
      return [-14, 1.5, 0];
    case 'rightWing':
      return [14, 1.5, 0];
    case 'tires':
      return [0, -12, 10];
    case 'body':
    default:
      return [0, 0, 0];
  }
};

const tintImportedMeshes = (root: Object3D, active: boolean) => {
  root.traverse((child: Object3D) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) {
      return;
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((material) => {
        const cloned = material.clone() as MeshStandardMaterial;
        if ('emissive' in cloned) {
          cloned.emissive = new Color(active ? '#76d5ff' : '#000000');
          cloned.emissiveIntensity = active ? 0.45 : 0;
        }
        return cloned;
      });
      return;
    }

    if (mesh.material) {
      mesh.material = mesh.material.clone();
      const typed = mesh.material as MeshStandardMaterial;
      if ('metalness' in typed) {
        typed.metalness = 0.35;
      }
      if ('roughness' in typed) {
        typed.roughness = 0.55;
      }
      if ('emissive' in typed) {
        typed.emissive = new Color(active ? '#76d5ff' : '#000000');
        typed.emissiveIntensity = active ? 0.45 : 0;
      }
    }
  });
};

const cloneNamedMesh = (scene: Object3D, name: string, active: boolean) => {
  const found = scene.getObjectByName(name);
  if (!found) {
    throw new Error(`Could not find airplane mesh: ${name}`);
  }

  const cloned = found.clone(true);
  tintImportedMeshes(cloned, active);
  return cloned;
};

const PartGroup: React.FC<{
  id: LessonPartId;
  position: [number, number, number];
  active: boolean;
  onClick?: (id: LessonPartId) => void;
  onPointerDown?: (id: LessonPartId, event: ThreeEvent<PointerEvent>) => void;
  onPointerMove?: (id: LessonPartId, event: ThreeEvent<PointerEvent>) => void;
  onPointerUp?: (id: LessonPartId, event: ThreeEvent<PointerEvent>) => void;
  children: React.ReactNode;
}> = ({id, position, active, onClick, onPointerDown, onPointerMove, onPointerUp, children}) => {
  return (
    <group
      position={position}
      scale={active ? [1.05, 1.05, 1.05] : [1, 1, 1]}
      onClick={onClick ? () => onClick(id) : undefined}
      onPointerDown={onPointerDown ? (event) => onPointerDown(id, event) : undefined}
      onPointerMove={onPointerMove ? (event) => onPointerMove(id, event) : undefined}
      onPointerUp={onPointerUp ? (event) => onPointerUp(id, event) : undefined}
    >
      {children}
    </group>
  );
};

/**
 * Educational airplane model broken into the main lesson parts so it can
 * later drive an exploded-view video or touch assembly simulation.
 */
export const ThreePlane: React.FC<{
  progress: number;
  explode?: number;
  activePart?: LessonPartId | null;
  assembledParts?: Partial<Record<LessonPartId, boolean>>;
  onPartSelect?: (part: LessonPartId) => void;
  partPositions?: Partial<Record<LessonPartId, [number, number, number]>>;
  onPartPointerDown?: (part: LessonPartId, event: ThreeEvent<PointerEvent>) => void;
  onPartPointerMove?: (part: LessonPartId, event: ThreeEvent<PointerEvent>) => void;
  onPartPointerUp?: (part: LessonPartId, event: ThreeEvent<PointerEvent>) => void;
  modelGroupRef?: React.Ref<Group>;
}> = ({
  progress,
  explode = 0,
  activePart = null,
  assembledParts,
  onPartSelect,
  partPositions,
  onPartPointerDown,
  onPartPointerMove,
  onPartPointerUp,
  modelGroupRef,
}) => {
  const frame = useCurrentFrame();
  const gltf = useLoader(GLTFLoader, AIRPLANE_MODEL_URL);

  const parts = useMemo(() => {
    return {
      body: cloneNamedMesh(gltf.scene, 'body', activePart === 'body'),
      leftWing: cloneNamedMesh(gltf.scene, 'leftwing', activePart === 'leftWing'),
      rightWing: cloneNamedMesh(gltf.scene, 'rightwing', activePart === 'rightWing'),
      leftTail: cloneNamedMesh(gltf.scene, 'leftback', activePart === 'body'),
      rightTail: cloneNamedMesh(gltf.scene, 'rightback', activePart === 'body'),
      topTail: cloneNamedMesh(gltf.scene, 'top', activePart === 'body'),
    };
  }, [activePart, gltf.scene]);

  const pitch = Math.sin(progress * Math.PI * 2) * 0.04 - 0.03;
  const vibration = Math.sin(frame * 0.18) * 0.008;
  const getPosition = (part: LessonPartId): [number, number, number] => {
    if (partPositions?.[part]) {
      return partPositions[part] as [number, number, number];
    }

    const [x, y, z] = getExplodedOffset(part);
    const openness = assembledParts ? (assembledParts[part] ? 0 : 1) : explode;
    return [x * openness, y * openness, z * openness];
  };
  const isActive = (part: LessonPartId) => activePart === part;

  return (
    <group rotation={[pitch + vibration, 0, 0]}>
      <group
        ref={modelGroupRef}
        position={[0, -0.24, -0.56]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[0.045, 0.045, 0.045]}
      >
        <PartGroup
          id="body"
          position={getPosition('body')}
          active={isActive('body')}
          onClick={onPartSelect}
          onPointerDown={onPartPointerDown}
          onPointerMove={onPartPointerMove}
          onPointerUp={onPartPointerUp}
        >
          <primitive object={parts.body} />
          <primitive object={parts.leftTail} />
          <primitive object={parts.rightTail} />
          <primitive object={parts.topTail} />
        </PartGroup>

        <PartGroup
          id="leftWing"
          position={getPosition('leftWing')}
          active={isActive('leftWing')}
          onClick={onPartSelect}
          onPointerDown={onPartPointerDown}
          onPointerMove={onPartPointerMove}
          onPointerUp={onPartPointerUp}
        >
          <primitive object={parts.leftWing} />
        </PartGroup>

        <PartGroup
          id="rightWing"
          position={getPosition('rightWing')}
          active={isActive('rightWing')}
          onClick={onPartSelect}
          onPointerDown={onPartPointerDown}
          onPointerMove={onPartPointerMove}
          onPointerUp={onPartPointerUp}
        >
          <primitive object={parts.rightWing} />
        </PartGroup>

        <PartGroup
          id="cockpit"
          position={getPosition('cockpit')}
          active={isActive('cockpit')}
          onClick={onPartSelect}
          onPointerDown={onPartPointerDown}
          onPointerMove={onPartPointerMove}
          onPointerUp={onPartPointerUp}
        >
          <mesh position={[0, 5.2, 14]} scale={[1.45, 0.85, 1.55]}>
            <sphereGeometry args={[3.2, 24, 24]} />
            <meshStandardMaterial
              color={isActive('cockpit') ? '#a6ebff' : '#87d8ff'}
              transparent
              opacity={0.82}
              metalness={0.5}
              roughness={0.14}
              emissive={isActive('cockpit') ? '#76d5ff' : '#000000'}
              emissiveIntensity={isActive('cockpit') ? 0.45 : 0}
            />
          </mesh>
        </PartGroup>

        <PartGroup
          id="engine"
          position={getPosition('engine')}
          active={isActive('engine')}
          onClick={onPartSelect}
          onPointerDown={onPartPointerDown}
          onPointerMove={onPartPointerMove}
          onPointerUp={onPartPointerUp}
        >
          <group>
            <mesh position={[-14, -3.2, 16]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[2.4, 2.8, 8, 20]} />
              <meshStandardMaterial
                color={isActive('engine') ? '#f4fbff' : '#dfe5eb'}
                metalness={0.45}
                roughness={0.38}
                emissive={isActive('engine') ? '#76d5ff' : '#000000'}
                emissiveIntensity={isActive('engine') ? 0.35 : 0}
              />
            </mesh>
            <mesh position={[14, -3.2, 16]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[2.4, 2.8, 8, 20]} />
              <meshStandardMaterial
                color={isActive('engine') ? '#f4fbff' : '#dfe5eb'}
                metalness={0.45}
                roughness={0.38}
                emissive={isActive('engine') ? '#76d5ff' : '#000000'}
                emissiveIntensity={isActive('engine') ? 0.35 : 0}
              />
            </mesh>
            <mesh position={[-14, -3.2, 20.4]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[1.6, 2.2, 1.1, 20]} />
              <meshStandardMaterial
                color="#2f3944"
                metalness={0.55}
                roughness={0.45}
                emissive={isActive('engine') ? '#76d5ff' : '#000000'}
                emissiveIntensity={isActive('engine') ? 0.2 : 0}
              />
            </mesh>
            <mesh position={[14, -3.2, 20.4]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[1.6, 2.2, 1.1, 20]} />
              <meshStandardMaterial
                color="#2f3944"
                metalness={0.55}
                roughness={0.45}
                emissive={isActive('engine') ? '#76d5ff' : '#000000'}
                emissiveIntensity={isActive('engine') ? 0.2 : 0}
              />
            </mesh>
          </group>
        </PartGroup>

        <PartGroup
          id="tires"
          position={getPosition('tires')}
          active={isActive('tires')}
          onClick={onPartSelect}
          onPointerDown={onPartPointerDown}
          onPointerMove={onPartPointerMove}
          onPointerUp={onPartPointerUp}
        >
          <group>
            <mesh position={[-10.5, -6.5, 9]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[2.25, 0.75, 12, 24]} />
              <meshStandardMaterial
                color="#24262b"
                metalness={0.18}
                roughness={0.88}
                emissive={isActive('tires') ? '#76d5ff' : '#000000'}
                emissiveIntensity={isActive('tires') ? 0.2 : 0}
              />
            </mesh>
            <mesh position={[10.5, -6.5, 9]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[2.25, 0.75, 12, 24]} />
              <meshStandardMaterial
                color="#24262b"
                metalness={0.18}
                roughness={0.88}
                emissive={isActive('tires') ? '#76d5ff' : '#000000'}
                emissiveIntensity={isActive('tires') ? 0.2 : 0}
              />
            </mesh>
            <mesh position={[0, -5.8, -6]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[1.8, 0.6, 12, 24]} />
              <meshStandardMaterial
                color="#24262b"
                metalness={0.18}
                roughness={0.88}
                emissive={isActive('tires') ? '#76d5ff' : '#000000'}
                emissiveIntensity={isActive('tires') ? 0.2 : 0}
              />
            </mesh>
            <mesh position={[-10.5, -4.2, 9]} rotation={[0, 0, 0.15]}>
              <cylinderGeometry args={[0.22, 0.22, 4.6, 10]} />
              <meshStandardMaterial
                color="#aeb6c1"
                metalness={0.5}
                roughness={0.4}
                emissive={isActive('tires') ? '#76d5ff' : '#000000'}
                emissiveIntensity={isActive('tires') ? 0.2 : 0}
              />
            </mesh>
            <mesh position={[10.5, -4.2, 9]} rotation={[0, 0, -0.15]}>
              <cylinderGeometry args={[0.22, 0.22, 4.6, 10]} />
              <meshStandardMaterial
                color="#aeb6c1"
                metalness={0.5}
                roughness={0.4}
                emissive={isActive('tires') ? '#76d5ff' : '#000000'}
                emissiveIntensity={isActive('tires') ? 0.2 : 0}
              />
            </mesh>
            <mesh position={[0, -3.9, -6]} rotation={[0.2, 0, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 3.5, 10]} />
              <meshStandardMaterial
                color="#aeb6c1"
                metalness={0.5}
                roughness={0.4}
                emissive={isActive('tires') ? '#76d5ff' : '#000000'}
                emissiveIntensity={isActive('tires') ? 0.2 : 0}
              />
            </mesh>
          </group>
        </PartGroup>
      </group>
    </group>
  );
};
