import React, {useMemo} from 'react';
import {Canvas, useLoader, type ThreeEvent} from '@react-three/fiber';
import {
  Box3,
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Vector3,
} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type TrexPartId = 'skull' | 'neck' | 'ribs' | 'tail' | 'leg';

const TARGET_LENGTH = 7.2;
const HIGHLIGHT_COLOR = '#ffdf46';
const PARTS: TrexPartId[] = ['skull', 'neck', 'ribs', 'tail', 'leg'];

// This scan has no named anatomical meshes or skeleton bones. Its long axis is
// X and its vertical axis is Y after the GLB root transform, so classify each
// triangle by its centroid, matching the Butterfly geometry-splitting pattern.
const classifyTriangle = (x: number, y: number): TrexPartId => {
  if (x > 13) return 'skull';
  if (x > 7) return 'neck';
  if (x < -9) return 'tail';
  if (y < 9.5) return 'leg';
  return 'ribs';
};

type GeometryBucket = {
  position: number[];
  normal: number[];
  uv: number[];
  tangent: number[];
};

const newBucket = (): GeometryBucket => ({position: [], normal: [], uv: [], tangent: []});

const splitGeometry = (source: Mesh) => {
  const transformed = source.geometry.clone();
  transformed.applyMatrix4(source.matrixWorld);
  const geometry = transformed.index ? transformed.toNonIndexed() : transformed;
  const position = geometry.getAttribute('position');
  const normal = geometry.getAttribute('normal');
  const uv = geometry.getAttribute('uv');
  const tangent = geometry.getAttribute('tangent');
  const buckets = Object.fromEntries(PARTS.map((part) => [part, newBucket()])) as Record<TrexPartId, GeometryBucket>;

  for (let index = 0; index < position.count; index += 3) {
    const centerX = (position.getX(index) + position.getX(index + 1) + position.getX(index + 2)) / 3;
    const centerY = (position.getY(index) + position.getY(index + 1) + position.getY(index + 2)) / 3;
    const bucket = buckets[classifyTriangle(centerX, centerY)];

    for (let vertex = index; vertex < index + 3; vertex += 1) {
      bucket.position.push(position.getX(vertex), position.getY(vertex), position.getZ(vertex));
      if (normal) bucket.normal.push(normal.getX(vertex), normal.getY(vertex), normal.getZ(vertex));
      if (uv) bucket.uv.push(uv.getX(vertex), uv.getY(vertex));
      if (tangent) bucket.tangent.push(tangent.getX(vertex), tangent.getY(vertex), tangent.getZ(vertex), tangent.getW(vertex));
    }
  }

  return PARTS.flatMap((part) => {
    const bucket = buckets[part];
    if (bucket.position.length === 0) return [];
    const partGeometry = new BufferGeometry();
    partGeometry.setAttribute('position', new Float32BufferAttribute(bucket.position, 3));
    if (bucket.normal.length) partGeometry.setAttribute('normal', new Float32BufferAttribute(bucket.normal, 3));
    if (bucket.uv.length) partGeometry.setAttribute('uv', new Float32BufferAttribute(bucket.uv, 2));
    if (bucket.tangent.length) partGeometry.setAttribute('tangent', new Float32BufferAttribute(bucket.tangent, 4));
    partGeometry.computeBoundingBox();
    partGeometry.computeBoundingSphere();
    const mesh = new Mesh(partGeometry, source.material);
    mesh.name = part;
    mesh.userData.lessonPart = part;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    return [mesh];
  });
};

const partFromObject = (object: Object3D): TrexPartId | null => {
  let current: Object3D | null = object;
  while (current) {
    const part = current.userData.lessonPart as TrexPartId | undefined;
    if (part && PARTS.includes(part)) return part;
    current = current.parent;
  }
  return null;
};

const TrexModel: React.FC<{
  highlightedPart: TrexPartId | null;
  onPartSelect: (part: TrexPartId) => void;
}> = ({highlightedPart, onPartSelect}) => {
  const gltf = useLoader(GLTFLoader, 'models/trex.glb');
  const model = useMemo(() => {
    const source = gltf.scene.clone(true);
    source.updateMatrixWorld(true);
    const object = new Group();
    const selectable: Record<TrexPartId, Mesh[]> = {skull: [], neck: [], ribs: [], tail: [], leg: []};

    source.traverse((child: Object3D) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      const materialName = Array.isArray(mesh.material) ? '' : mesh.material.name;
      if (materialName.includes('_NONE')) {
        const floorGeometry = mesh.geometry.clone();
        floorGeometry.applyMatrix4(mesh.matrixWorld);
        const floor = new Mesh(floorGeometry, mesh.material);
        floor.raycast = () => undefined;
        object.add(floor);
        return;
      }
      for (const partMesh of splitGeometry(mesh)) {
        const part = partMesh.userData.lessonPart as TrexPartId;
        selectable[part].push(partMesh);
        object.add(partMesh);
      }
    });

    const box = new Box3().setFromObject(object);
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);
    const scale = TARGET_LENGTH / Math.max(size.x, size.y, size.z);
    return {object, selectable, center, scale};
  }, [gltf.scene]);

  const highlight = useMemo(() => {
    if (!highlightedPart) return null;
    const group = new Group();
    for (const source of model.selectable[highlightedPart]) {
      const overlay = new Mesh(
        source.geometry,
        new MeshBasicMaterial({
          color: HIGHLIGHT_COLOR,
          transparent: true,
          opacity: 0.62,
          depthTest: false,
          depthWrite: false,
          side: DoubleSide,
        }),
      );
      overlay.renderOrder = 2;
      overlay.raycast = () => undefined;
      group.add(overlay);
    }
    return group;
  }, [highlightedPart, model.selectable]);

  const selectPart = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const part = partFromObject(event.object);
    if (part) onPartSelect(part);
  };

  return (
    <group
      scale={model.scale}
      position={[-model.center.x * model.scale, -model.center.y * model.scale, -model.center.z * model.scale]}
      onClick={selectPart}
    >
      <primitive object={model.object} />
      {highlight ? <primitive object={highlight} /> : null}
    </group>
  );
};

export const TrexCanvas: React.FC<{
  mode: 'identify' | 'explore';
  highlightedPart: TrexPartId | null;
  onPartSelect: (part: TrexPartId) => void;
}> = ({mode, highlightedPart, onPartSelect}) => (
  <Canvas
    camera={{position: [0, 0.35, 7.8], fov: 32, near: 0.1, far: 100}}
    dpr={[1, 1.5]}
    gl={{alpha: true, antialias: false}}
  >
    <ambientLight intensity={0.72} />
    <hemisphereLight intensity={0.78} groundColor="#5b4638" />
    <directionalLight position={[5, 7, 6]} intensity={1.45} />
    <directionalLight position={[-4, 2, -4]} intensity={0.4} color="#b9d5ff" />
    <TrexModel highlightedPart={highlightedPart} onPartSelect={onPartSelect} />
    <ModelOrbitControls
      zoomEnabled
      rotateEnabled={mode === 'explore'}
      target={[0, 0, 0]}
      minDistance={4.5}
      maxDistance={16}
    />
  </Canvas>
);
