import React, {useMemo} from 'react';
import {Canvas, useLoader, type ThreeEvent} from '@react-three/fiber';
import {Box3, Group, Mesh, MeshStandardMaterial, Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type ClockPartId = 'display' | 'buttons' | 'stand' | 'body';

const MODEL_URL = 'models/modern_digital_table_clock___alarm_clock.glb';

const partForName = (name: string): ClockPartId => {
  const value = name.toLowerCase();
  if (value.includes('dispaly') || value.includes('text')) return 'display';
  if (value.includes('button') || value.includes('cylinder') || value.includes('sphere')) return 'buttons';
  if (value.includes('stand')) return 'stand';
  return 'body';
};

const preparedScene = (source: Group) => {
  const scene = source.clone(true);
  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.userData.clockPart = partForName(`${object.name} ${object.parent?.name ?? ''}`);
    object.material = (object.material as MeshStandardMaterial).clone();
  });
  scene.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(scene);
  const center = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  const scale = 4.8 / Math.max(size.x, size.y, size.z, 1);
  scene.scale.setScalar(scale);
  scene.position.set(-center.x * scale, -center.y * scale - 0.35, -center.z * scale);
  return scene;
};

export const ClockModel: React.FC<{
  mode: string;
  highlightedPart: ClockPartId | null;
  onPartSelect: (part: ClockPartId) => void;
}> = ({mode, highlightedPart, onPartSelect}) => {
  const gltf = useLoader(GLTFLoader, MODEL_URL);
  const scene = useMemo(() => preparedScene(gltf.scene), [gltf.scene]);
  const selectable = mode === 'identify' || mode === 'explore';

  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const material = object.material as MeshStandardMaterial;
    const part = object.userData.clockPart as ClockPartId;
    material.emissive?.set(part === highlightedPart ? '#ffbd45' : '#000000');
    material.emissiveIntensity = part === highlightedPart ? 0.42 : 0;
  });

  return (
    <>
      <primitive
        object={scene}
        onClick={selectable ? (event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          const part = event.object.userData.clockPart as ClockPartId | undefined;
          if (part) onPartSelect(part);
        } : undefined}
      />
      <ModelOrbitControls
        dampingEnabled={false}
        zoomEnabled={mode !== 'activity'}
        rotateEnabled={mode !== 'activity'}
        target={[0, 0, 0]}
        minDistance={5}
        maxDistance={14}
      />
    </>
  );
};

export const ClockCanvas: React.FC<{
  mode: string;
  highlightedPart: ClockPartId | null;
  onPartSelect: (part: ClockPartId) => void;
}> = (props) => (
  <Canvas camera={{position: [6.4, 4.4, 7.8], fov: 32, near: 0.1, far: 100}} dpr={1} frameloop="demand" gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}>
    <color attach="background" args={['#eaf8ff']} />
    <ambientLight intensity={1.05} />
    <hemisphereLight intensity={0.95} groundColor="#7b9aa8" />
    <directionalLight position={[5, 8, 6]} intensity={1.45} />
    <ClockModel {...props} />
  </Canvas>
);
