import React, {useMemo} from 'react';
import {type ThreeEvent, useLoader} from '@react-three/fiber';
import {Color, Mesh, MeshStandardMaterial, Object3D, type Group} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {getExplodedOffset, type LessonPartId} from './content';

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

export const AirplaneLessonModel: React.FC<{
  modelUrl: string;
  activePart?: LessonPartId | null;
  partPositions?: Partial<Record<LessonPartId, [number, number, number]>>;
  assembledParts?: Partial<Record<LessonPartId, boolean>>;
  onPartSelect?: (part: LessonPartId) => void;
  onPartPointerDown?: (part: LessonPartId, event: ThreeEvent<PointerEvent>) => void;
  onPartPointerMove?: (part: LessonPartId, event: ThreeEvent<PointerEvent>) => void;
  onPartPointerUp?: (part: LessonPartId, event: ThreeEvent<PointerEvent>) => void;
  modelGroupRef?: React.Ref<Group>;
}> = ({
  modelUrl,
  activePart = null,
  partPositions,
  assembledParts,
  onPartSelect,
  onPartPointerDown,
  onPartPointerMove,
  onPartPointerUp,
  modelGroupRef,
}) => {
  const gltf = useLoader(GLTFLoader, modelUrl);

  const parts = useMemo(() => {
    return {
      body: cloneNamedMesh(gltf.scene, 'body', activePart === 'body'),
      leftWing: cloneNamedMesh(gltf.scene, 'leftwing', activePart === 'leftWing'),
      rightWing: cloneNamedMesh(gltf.scene, 'rightwing', activePart === 'rightWing'),
      leftTail: cloneNamedMesh(gltf.scene, 'leftback', activePart === 'tail'),
      rightTail: cloneNamedMesh(gltf.scene, 'rightback', activePart === 'tail'),
      topTail: cloneNamedMesh(gltf.scene, 'top', activePart === 'tail'),
    };
  }, [activePart, gltf.scene]);

  const getPosition = (part: LessonPartId): [number, number, number] => {
    if (partPositions?.[part]) {
      return partPositions[part] as [number, number, number];
    }

    const [x, y, z] = getExplodedOffset(part);
    const openness = assembledParts ? (assembledParts[part] ? 0 : 1) : 1;
    return [x * openness, y * openness, z * openness];
  };

  const isActive = (part: LessonPartId) => activePart === part;

  return (
    <group rotation={[-0.03, 0, 0]}>
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
          <group position={[0, -2.7, -23.15]}>
            <mesh position={[-2.25, 0, 0.16]} rotation={[0.08, -0.22, 0.08]} scale={[1.55, 0.72, 0.14]}>
              <boxGeometry args={[2.2, 1.7, 1]} />
              <meshStandardMaterial color="#bfc3c4" metalness={0.18} roughness={0.68} />
            </mesh>
            <mesh position={[0, 0.08, -0.08]} rotation={[0.08, 0, 0]} scale={[1.85, 0.78, 0.14]}>
              <boxGeometry args={[2.2, 1.7, 1]} />
              <meshStandardMaterial color="#c7cacb" metalness={0.18} roughness={0.68} />
            </mesh>
            <mesh position={[2.25, 0, 0.16]} rotation={[0.08, 0.22, -0.08]} scale={[1.55, 0.72, 0.14]}>
              <boxGeometry args={[2.2, 1.7, 1]} />
              <meshStandardMaterial color="#bfc3c4" metalness={0.18} roughness={0.68} />
            </mesh>
          </group>
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
          id="tail"
          position={getPosition('tail')}
          active={isActive('tail')}
          onClick={onPartSelect}
          onPointerDown={onPartPointerDown}
          onPointerMove={onPartPointerMove}
          onPointerUp={onPartPointerUp}
        >
          <primitive object={parts.leftTail} />
          <primitive object={parts.rightTail} />
          <primitive object={parts.topTail} />
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
          <group position={[0, -2.68, -23.05]}>
            <mesh position={[-2.25, 0, 0.22]} rotation={[0.08, -0.22, 0.08]} scale={[1.28, 0.48, 0.08]}>
              <boxGeometry args={[2.2, 1.7, 1]} />
              <meshStandardMaterial
                color={isActive('cockpit') ? '#8be7ff' : '#1d3145'}
                metalness={0.25}
                roughness={0.18}
                emissive={isActive('cockpit') ? '#76d5ff' : '#020b14'}
                emissiveIntensity={isActive('cockpit') ? 0.8 : 0.12}
              />
            </mesh>
            <mesh position={[0, 0.08, -0.02]} rotation={[0.08, 0, 0]} scale={[1.48, 0.5, 0.08]}>
              <boxGeometry args={[2.2, 1.7, 1]} />
              <meshStandardMaterial
                color={isActive('cockpit') ? '#8be7ff' : '#1d3145'}
                metalness={0.25}
                roughness={0.18}
                emissive={isActive('cockpit') ? '#76d5ff' : '#020b14'}
                emissiveIntensity={isActive('cockpit') ? 0.8 : 0.12}
              />
            </mesh>
            <mesh position={[2.25, 0, 0.22]} rotation={[0.08, 0.22, -0.08]} scale={[1.28, 0.48, 0.08]}>
              <boxGeometry args={[2.2, 1.7, 1]} />
              <meshStandardMaterial
                color={isActive('cockpit') ? '#8be7ff' : '#1d3145'}
                metalness={0.25}
                roughness={0.18}
                emissive={isActive('cockpit') ? '#76d5ff' : '#020b14'}
                emissiveIntensity={isActive('cockpit') ? 0.8 : 0.12}
              />
            </mesh>
          </group>
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
