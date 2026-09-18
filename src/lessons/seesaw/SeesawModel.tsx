import React, {useEffect, useMemo, useRef} from 'react';
import {Canvas, useFrame, useLoader, type ThreeEvent} from '@react-three/fiber';
import {Box3, Group, MathUtils, Mesh, MeshStandardMaterial, Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type SeesawPartId = 'beam' | 'fulcrum' | 'seat' | 'handle';

const HIGHLIGHT: Record<SeesawPartId, string> = {
  beam: '#4ac7ff',
  fulcrum: '#ffe06a',
  seat: '#ff7b69',
  handle: '#b7f1ff',
};

// The GLB's node names are generic, but its colour groups are consistent:
// Object_8 is the red beam, Object_7 the yellow seats, and Object_4 is the
// blue metalwork. The click position separates the central blue fulcrum from
// the blue handles at either end.
const PART_BY_NODE: Record<string, SeesawPartId> = {
  Object_8: 'beam',
  Object_7: 'seat',
};

const SeesawScene: React.FC<{
  highlightedPart: SeesawPartId | null;
  mode: string;
  tilt: 'level' | 'left';
  animating: boolean;
  onPartSelect: (part: SeesawPartId) => void;
  onSettled: () => void;
}> = ({highlightedPart, mode, tilt, animating, onPartSelect, onSettled}) => {
  const gltf = useLoader(GLTFLoader, 'models/seesaw.glb');
  const seesawRef = useRef<Group>(null);
  const settled = useRef(false);

  const model = useMemo(() => {
    const source = gltf.scene.clone(true);
    source.updateMatrixWorld(true);
    const group = new Group();
    const parts = new Map<SeesawPartId, Mesh[]>();
    const box = new Box3();

    source.traverse((child) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      const part = PART_BY_NODE[mesh.name];
      if (part) parts.set(part, [...(parts.get(part) ?? []), mesh]);
      if (mesh.name === 'Object_4') {
        parts.set('fulcrum', [...(parts.get('fulcrum') ?? []), mesh]);
        parts.set('handle', [...(parts.get('handle') ?? []), mesh]);
      }
      box.expandByObject(mesh);
    });

    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);
    const scale = 6.7 / Math.max(size.x, size.y, size.z, 1);
    source.scale.setScalar(scale);
    source.position.set(-center.x * scale, -center.y * scale - 0.75, -center.z * scale);
    group.add(source);
    group.userData.parts = parts;
    return group;
  }, [gltf.scene]);

  useEffect(() => {
    const parts = model.userData.parts as Map<SeesawPartId, Mesh[]>;
    const selectedMeshes = new Set(parts.get(highlightedPart ?? 'beam') ?? []);
    const allMeshes = new Set([...parts.values()].flat());
    allMeshes.forEach((mesh) => {
      const sourceMaterial = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const material = sourceMaterial.clone() as MeshStandardMaterial;
      if ('emissive' in material) {
        material.emissive.set(selectedMeshes.has(mesh) && highlightedPart ? HIGHLIGHT[highlightedPart] : '#000000');
        material.emissiveIntensity = selectedMeshes.has(mesh) && highlightedPart ? 0.58 : 0;
      }
      mesh.material = material;
    });
  }, [highlightedPart, model]);

  useFrame((state, delta) => {
    if (!seesawRef.current) return;
    const target = tilt === 'left' ? -0.17 : 0;
    const current = seesawRef.current.rotation.z;
    seesawRef.current.rotation.z = MathUtils.damp(current, target, 4.2, delta);
    const moving = Math.abs(seesawRef.current.rotation.z - target) > 0.004;
    if (moving) {
      state.invalidate();
      settled.current = false;
    } else if (animating && !settled.current) {
      settled.current = true;
      onSettled();
    }
  });

  const selectPart = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const mesh = event.object as Mesh;
    if (mesh.name === 'Object_8') onPartSelect('beam');
    else if (mesh.name === 'Object_7') onPartSelect('seat');
    else if (mesh.name === 'Object_4') {
      const localPoint = mesh.worldToLocal(event.point.clone());
      onPartSelect(Math.abs(localPoint.x) < 1.25 ? 'fulcrum' : 'handle');
    }
  };

  return <group ref={seesawRef} onClick={mode === 'identify' ? selectPart : undefined}><primitive object={model} /></group>;
};

export const SeesawCanvas: React.FC<{
  highlightedPart: SeesawPartId | null;
  mode: string;
  tilt: 'level' | 'left';
  animating: boolean;
  onPartSelect: (part: SeesawPartId) => void;
  onSettled: () => void;
}> = (props) => (
  <Canvas
    camera={{position: [7.4, 4.5, 9.1], fov: 32, near: 0.1, far: 100}}
    dpr={1}
    frameloop={props.animating ? 'always' : 'demand'}
    gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}
  >
    <color attach="background" args={['#b6e5fa']} />
    <ambientLight intensity={1.05} />
    <hemisphereLight intensity={0.9} groundColor="#82a963" />
    <directionalLight position={[5, 7, 5]} intensity={1.55} />
    <SeesawScene {...props} />
    <ModelOrbitControls dampingEnabled={false} zoomEnabled={props.mode !== 'activity'} rotateEnabled={props.mode !== 'activity'} target={[0, 0, 0]} minDistance={4.5} maxDistance={13} />
  </Canvas>
);
