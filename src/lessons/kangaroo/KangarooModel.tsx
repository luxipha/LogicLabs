import React, {useMemo} from 'react';
import {Canvas, useLoader, type ThreeEvent} from '@react-three/fiber';
import {Box3, Color, Group, Mesh, MeshStandardMaterial, Object3D, Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {registerSpecularGlossiness} from '../bee/gltfSpecularGlossiness';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type KangarooPartId = 'legs' | 'arms' | 'tail' | 'pouch';
const HIGHLIGHT = '#ffcf48';
const PARTS: KangarooPartId[] = ['legs', 'arms', 'tail', 'pouch'];

const partFromMaterial = (mesh: Mesh): KangarooPartId | null => {
  const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  const name = `${mesh.name} ${material?.name ?? ''}`.toLowerCase();
  if (name.includes('bttm') || name.includes('bottom')) return 'legs';
  if (name.includes('back')) return 'tail';
  if (name.includes('intr') || name.includes('inner')) return 'pouch';
  if (name.includes('frt') || name.includes('front')) return 'arms';
  return null;
};

const KangarooModel: React.FC<{
  highlightedPart: KangarooPartId | null;
  identified: Set<string>;
  onPartSelect: (part: KangarooPartId) => void;
}> = ({highlightedPart, identified, onPartSelect}) => {
  const gltf = useLoader(GLTFLoader, 'models/kangaroo.glb', (loader) => {
    registerSpecularGlossiness(loader);
  });
  const model = useMemo(() => {
    const source = gltf.scene.clone(true);
    source.updateMatrixWorld(true);
    const visible = new Group();
    const bounds = new Box3();
    source.traverse((child: Object3D) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(mesh.matrixWorld);
      geometry.computeVertexNormals();
      const part = partFromMaterial(mesh);
      const cloned = new Mesh(geometry, mesh.material);
      cloned.name = mesh.name;
      cloned.userData.part = part;
      cloned.castShadow = true;
      cloned.receiveShadow = true;
      visible.add(cloned);
      bounds.expandByObject(cloned);
    });
    const center = new Vector3();
    const size = new Vector3();
    bounds.getCenter(center);
    bounds.getSize(size);
    const scale = 5.5 / Math.max(size.x, size.y, size.z, 1);
    visible.scale.setScalar(scale);
    visible.position.set(-center.x * scale, -center.y * scale - 0.75, -center.z * scale);
    visible.rotation.y = -0.35;
    return visible;
  }, [gltf.scene]);

  useMemo(() => {
    model.traverse((child) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      const part = mesh.userData.part as KangarooPartId | null;
      const source = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      if (!(source instanceof MeshStandardMaterial)) return;
      const material = source.clone();
      if (part && highlightedPart === part) {
        material.emissive = new Color(HIGHLIGHT);
        material.emissiveIntensity = 0.7;
      } else if (part && identified.has(part)) {
        material.emissive = new Color('#79dfa0');
        material.emissiveIntensity = 0.25;
      } else {
        material.emissive = new Color('#000000');
        material.emissiveIntensity = 0;
      }
      mesh.material = material;
    });
  }, [identified, highlightedPart, model]);

  const select = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const part = (event.object as Mesh).userData.part as KangarooPartId | null;
    if (part && PARTS.includes(part)) onPartSelect(part);
  };

  return <primitive object={model} onClick={select} />;
};

export const KangarooCanvas: React.FC<{
  highlightedPart: string | null;
  identified: Set<string>;
  onPartSelect: (part: string) => void;
}> = ({highlightedPart, identified, onPartSelect}) => (
  <Canvas
    camera={{position: [6.6, 3.5, 8.2], fov: 32, near: 0.1, far: 100}}
    dpr={1}
    frameloop="demand"
    gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}
  >
    <color attach="background" args={['#fff7df']} />
    <ambientLight intensity={1.05} />
    <hemisphereLight intensity={0.9} groundColor="#96b75e" />
    <directionalLight position={[5, 8, 5]} intensity={1.4} />
    <KangarooModel highlightedPart={highlightedPart as KangarooPartId | null} identified={identified} onPartSelect={onPartSelect as (part: KangarooPartId) => void} />
    <ModelOrbitControls dampingEnabled={false} zoomEnabled rotateEnabled target={[0, 0.2, 0]} minDistance={4.5} maxDistance={13} />
  </Canvas>
);
