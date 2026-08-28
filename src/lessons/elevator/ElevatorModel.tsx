import React, {useEffect, useMemo} from 'react';
import {Canvas, useLoader} from '@react-three/fiber';
import {Color, Group, Mesh, MeshStandardMaterial, Object3D} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type ElevatorPartId = 'cab' | 'doors' | 'cable' | 'pulley' | 'motor' | 'counterweight';

const PART_HIGHLIGHT: Record<ElevatorPartId, string> = {
  cab: '#ffb347',
  doors: '#7fd4ff',
  cable: '#ffe155',
  pulley: '#b8c5d6',
  motor: '#f0a52a',
  counterweight: '#aebac8',
};

const partFromObject = (object: Object3D): ElevatorPartId | null => {
  let current: Object3D | null = object;
  while (current) {
    const id = current.name.toLowerCase() as ElevatorPartId;
    if (id in PART_HIGHLIGHT) return id;
    current = current.parent;
  }
  return null;
};

const useElevatorScene = (gltf: {scene: Object3D}) =>
  useMemo(() => {
    const model = gltf.scene.clone(true);
    model.traverse((child) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.baseMaterial = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    });

    const group = new Group();
    group.scale.setScalar(0.78);
    group.position.set(0, -0.2, 0);
    group.add(model);
    return group;
  }, [gltf.scene]);

export const ElevatorModel: React.FC<{
  highlightedPart: ElevatorPartId | null;
  onPartSelect: (part: ElevatorPartId) => void;
}> = ({highlightedPart, onPartSelect}) => {
  const gltf = useLoader(GLTFLoader, 'models/elevator.glb');
  const group = useElevatorScene(gltf);

  useEffect(() => {
    group.traverse((child) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      const base = mesh.userData.baseMaterial as MeshStandardMaterial | undefined;
      if (!base) return;
      const material = base.clone();
      const part = partFromObject(mesh);
      material.emissive = new Color(part && part === highlightedPart ? PART_HIGHLIGHT[part] : '#000000');
      material.emissiveIntensity = part === highlightedPart ? 0.55 : 0;
      mesh.material = material;
    });
  }, [group, highlightedPart]);

  return (
    <primitive
      object={group}
      onClick={(event: {stopPropagation: () => void; object: Object3D}) => {
        event.stopPropagation();
        const part = partFromObject(event.object);
        if (part) onPartSelect(part);
      }}
    />
  );
};

export const ElevatorCanvas: React.FC<{
  highlightedPart: ElevatorPartId | null;
  mode: string;
  onPartSelect: (part: ElevatorPartId) => void;
}> = ({highlightedPart, mode, onPartSelect}) => (
  <Canvas camera={{position: [5.2, 3.2, 8.8], fov: 32, near: 0.1, far: 100}} dpr={[1, 1.5]} shadows gl={{alpha: true, antialias: true}}>
    <ambientLight intensity={0.8} />
    <hemisphereLight intensity={0.8} groundColor="#55718b" />
    <directionalLight position={[5, 8, 6]} intensity={1.4} castShadow />
    <directionalLight position={[-4, 3, -4]} intensity={0.4} color="#a5ccff" />
    <ModelOrbitControls
      zoomEnabled
      rotateEnabled={mode === 'explore'}
      target={[0, 0.55, 0]}
      minDistance={4.5}
      maxDistance={14}
    />
    <ElevatorModel highlightedPart={highlightedPart} onPartSelect={onPartSelect} />
  </Canvas>
);
