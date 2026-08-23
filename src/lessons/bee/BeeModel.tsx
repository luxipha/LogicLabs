import React, {useEffect, useMemo} from 'react';
import {Canvas, useLoader} from '@react-three/fiber';
import {
  Box3,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {registerSpecularGlossiness} from './gltfSpecularGlossiness';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type BeePartId = 'head' | 'antennae' | 'wings' | 'body' | 'legs';

export const BEE_PART_ORDER: BeePartId[] = ['head', 'antennae', 'wings', 'body', 'legs'];

const PART_HIGHLIGHT: Record<BeePartId, string> = {
  head: '#ffe155',
  antennae: '#ffb347',
  wings: '#7fd4ff',
  body: '#ffcf4a',
  legs: '#ff9c31',
};

// Maps a bone name to a lesson part. The bee's skeleton groups vertices by
// these bones, so this is how we slice the model into parts (vertex groups).
const classifyBone = (name: string): BeePartId | null => {
  const n = (name || '').toLowerCase();
  if (n.includes('antenna')) return 'antennae';
  if (n.includes('wing')) return 'wings';
  if (n.includes('leg')) return 'legs';
  if (n.includes('head') || n.includes('mandib') || n.includes('labrum')) return 'head';
  if (n.includes('thorax') || n.includes('body') || n.includes('abdomen')) return 'body';
  return null;
};

// Bakes the skinned geometry into world space (bind pose) so the part meshes
// can be static. Keeps skinIndex/skinWeight so triangles can be classified.
const bakeGeometry = (source: Mesh) => {
  const geometry = source.geometry.clone();
  const position = geometry.getAttribute('position');
  const skinned = source as Mesh & {
    isSkinnedMesh?: boolean;
    skeleton?: {update: () => void};
    applyBoneTransform?: (i: number, v: Vector3) => void;
  };
  const vertex = new Vector3();

  if (position && skinned.isSkinnedMesh) {
    skinned.skeleton?.update();
    for (let index = 0; index < position.count; index += 1) {
      vertex.fromBufferAttribute(position, index);
      skinned.applyBoneTransform?.(index, vertex);
      vertex.applyMatrix4(source.matrixWorld);
      position.setXYZ(index, vertex.x, vertex.y, vertex.z);
    }
    position.needsUpdate = true;
  } else {
    geometry.applyMatrix4(source.matrixWorld);
  }

  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
};

type SkinAttrs = {
  index: {array: ArrayLike<number>};
  weight: {array: ArrayLike<number>};
};

// Accumulates the part weights for one vertex from its 4 bone influences.
const partWeightsForVertex = (
  skin: SkinAttrs,
  boneNames: string[],
  vertexIndex: number,
): Map<BeePartId, number> => {
  const acc = new Map<BeePartId, number>();
  for (let k = 0; k < 4; k += 1) {
    const boneIndex = skin.index.array[vertexIndex * 4 + k];
    const weight = skin.weight.array[vertexIndex * 4 + k];
    if (weight <= 0 || boneIndex >= boneNames.length) {
      continue;
    }
    const part = classifyBone(boneNames[boneIndex]);
    if (part) {
      acc.set(part, (acc.get(part) ?? 0) + weight);
    }
  }
  return acc;
};

// Splits the baked geometry into one BufferGeometry per lesson part by
// assigning each triangle to the part with the most total vertex weight.
const splitByPart = (
  geometry: BufferGeometry,
  skin: SkinAttrs,
  boneNames: string[],
): Partial<Record<BeePartId, BufferGeometry>> => {
  const index = geometry.getIndex();
  const position = geometry.getAttribute('position');
  const normal = geometry.getAttribute('normal');
  const uv = geometry.getAttribute('uv');
  const triangleCount = index ? index.count / 3 : position.count / 3;
  const buckets: Record<BeePartId, {pos: number[]; nor: number[]; uv: number[]}> = {
    head: {pos: [], nor: [], uv: []},
    antennae: {pos: [], nor: [], uv: []},
    wings: {pos: [], nor: [], uv: []},
    body: {pos: [], nor: [], uv: []},
    legs: {pos: [], nor: [], uv: []},
  };

  for (let t = 0; t < triangleCount; t += 1) {
    const ia = index ? index.getX(t * 3) : t * 3;
    const ib = index ? index.getX(t * 3 + 1) : t * 3 + 1;
    const ic = index ? index.getX(t * 3 + 2) : t * 3 + 2;

    const totals = new Map<BeePartId, number>();
    for (const vi of [ia, ib, ic]) {
      for (const [part, w] of partWeightsForVertex(skin, boneNames, vi)) {
        totals.set(part, (totals.get(part) ?? 0) + w);
      }
    }
    let best: BeePartId | null = null;
    let bestWeight = 0;
    for (const [part, w] of totals) {
      if (w > bestWeight) {
        best = part;
        bestWeight = w;
      }
    }
    if (!best) {
      continue;
    }

    const bucket = buckets[best];
    for (const vi of [ia, ib, ic]) {
      bucket.pos.push(position.getX(vi), position.getY(vi), position.getZ(vi));
      if (normal) {
        bucket.nor.push(normal.getX(vi), normal.getY(vi), normal.getZ(vi));
      }
      if (uv) {
        bucket.uv.push(uv.getX(vi), uv.getY(vi));
      }
    }
  }

  const result: Partial<Record<BeePartId, BufferGeometry>> = {};
  for (const part of BEE_PART_ORDER) {
    const bucket = buckets[part];
    if (bucket.pos.length === 0) {
      continue;
    }
    const partGeometry = new BufferGeometry();
    partGeometry.setAttribute('position', new Float32BufferAttribute(bucket.pos, 3));
    if (bucket.nor.length > 0) {
      partGeometry.setAttribute('normal', new Float32BufferAttribute(bucket.nor, 3));
    }
    if (bucket.uv.length > 0) {
      partGeometry.setAttribute('uv', new Float32BufferAttribute(bucket.uv, 2));
    }
    partGeometry.computeVertexNormals();
    partGeometry.computeBoundingBox();
    partGeometry.computeBoundingSphere();
    result[part] = partGeometry;
  }
  return result;
};

// Loads the bee, bakes it, and slices it into per-part meshes.
const useBeeParts = (gltf: {scene: Object3D}) => {
  return useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.updateMatrixWorld(true);
    const meshes: Partial<Record<BeePartId, Mesh>> = {};
    const visibleBox = new Box3();
    let baseMaterial: Mesh['material'] | null = null;

    cloned.traverse((child: Object3D) => {
      const mesh = child as Mesh & {
        isSkinnedMesh?: boolean;
        skeleton?: {bones: Object3D[]};
        applyBoneTransform?: (i: number, v: Vector3) => void;
      };
      if (!mesh.isMesh) {
        return;
      }
      const geometry = bakeGeometry(mesh);
      const skinIndex = geometry.getAttribute('skinIndex');
      const skinWeight = geometry.getAttribute('skinWeight');

      if (skinIndex && skinWeight && mesh.skeleton?.bones.length) {
        const boneNames = mesh.skeleton.bones.map((b) => b.name || '');
        const parts = splitByPart(geometry, {index: skinIndex, weight: skinWeight}, boneNames);
        for (const part of BEE_PART_ORDER) {
          const partGeometry = parts[part];
          if (!partGeometry) {
            continue;
          }
          const partMesh = new Mesh(partGeometry, mesh.material);
          partMesh.name = part;
          partMesh.castShadow = true;
          partMesh.receiveShadow = true;
          partMesh.frustumCulled = false;
          meshes[part] = partMesh;
          visibleBox.union(new Box3().setFromObject(partMesh));
        }
        baseMaterial = mesh.material;
      } else {
        // No skinning info — keep the whole mesh as a fallback part.
        const partMesh = new Mesh(geometry, mesh.material);
        partMesh.name = 'body';
        partMesh.castShadow = true;
        partMesh.receiveShadow = true;
        partMesh.frustumCulled = false;
        meshes.body = partMesh;
        visibleBox.union(new Box3().setFromObject(partMesh));
        baseMaterial = mesh.material;
      }
    });

    const box = visibleBox.isEmpty() ? new Box3() : visibleBox;
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);
    const scale = 3.2 / Math.max(size.x, size.y, size.z);

    const group = new Group();
    group.scale.setScalar(scale);
    group.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    for (const part of BEE_PART_ORDER) {
      const m = meshes[part];
      if (m) {
        group.add(m);
      }
    }

    return {group, meshes: meshes as Record<BeePartId, Mesh>, baseMaterial, center, scale};
  }, [gltf.scene]);
};

const makeHighlightedMaterial = (
  base: Mesh['material'] | null,
  part: BeePartId,
  active: boolean,
) => {
  if (!base) {
    return null;
  }
  const source = Array.isArray(base) ? base[0] : base;
  const material = source.clone() as MeshStandardMaterial;
  if ('emissive' in material) {
    material.emissive = new Color(active ? PART_HIGHLIGHT[part] : '#000000');
    material.emissiveIntensity = active ? 0.6 : 0;
  }
  return material;
};

export const BeeModel: React.FC<{
  highlightedPart: BeePartId | null;
  mode: string;
  activityStep: number;
  activityDone: boolean;
  onPartSelect: (part: BeePartId) => void;
}> = ({highlightedPart, mode, activityStep, activityDone, onPartSelect}) => {
  const gltf = useLoader(GLTFLoader, 'models/bee.glb', (loader) => {
    registerSpecularGlossiness(loader);
  });
  const {group, meshes, baseMaterial} = useBeeParts(gltf);

  // Re-tint the active part when the selection changes.
  useEffect(() => {
    for (const part of BEE_PART_ORDER) {
      const mesh = meshes[part];
      if (!mesh) {
        continue;
      }
      const material = makeHighlightedMaterial(baseMaterial, part, part === highlightedPart);
      if (material) {
        mesh.material = material;
      }
    }
  }, [baseMaterial, highlightedPart, meshes]);

  return (
    <group>
      <primitive
        object={group}
        onClick={(event: {stopPropagation: () => void; object: Object3D}) => {
          event.stopPropagation();
          const part = (event.object as Mesh).name as BeePartId;
          if (BEE_PART_ORDER.includes(part)) {
            onPartSelect(part);
          }
        }}
      />
    </group>
  );
};

export const BeeCanvas: React.FC<{
  highlightedPart: BeePartId | null;
  mode: string;
  activityStep: number;
  activityDone: boolean;
  onPartSelect: (part: BeePartId) => void;
}> = ({highlightedPart, mode, activityStep, activityDone, onPartSelect}) => (
  <Canvas
    camera={{position: [0, 0.4, 5.6], fov: 30, near: 0.1, far: 100}}
    dpr={[1, 1.5]}
    gl={{antialias: false}}
  >
    <ambientLight intensity={0.7} />
    <hemisphereLight intensity={0.75} groundColor="#5b7a99" />
    <directionalLight position={[5, 6, 5]} intensity={1.45} />
    <directionalLight position={[-4, 2, -4]} intensity={0.35} color="#a4c2ff" />
    <ModelOrbitControls
      zoomEnabled={mode === 'identify'}
      rotateEnabled={mode === 'explore'}
      target={[0, 0.35, 0]}
      minDistance={3.5}
      maxDistance={14}
    />
    <BeeModel
      highlightedPart={highlightedPart}
      mode={mode}
      activityStep={activityStep}
      activityDone={activityDone}
      onPartSelect={onPartSelect}
    />
  </Canvas>
);
