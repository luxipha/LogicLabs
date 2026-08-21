import React, {useMemo} from 'react';
import {Canvas, useLoader} from '@react-three/fiber';
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

export const RadarTruckModel: React.FC<{
  highlightedPart: RadarPartId | null;
  mode: string;
  onPartSelect: (part: RadarPartId) => void;
}> = ({highlightedPart, mode, onPartSelect}) => {
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
    </group>
  );
};

export const RadarCanvas: React.FC<{
  highlightedPart: RadarPartId | null;
  mode: string;
  onPartSelect: (part: RadarPartId) => void;
}> = ({highlightedPart, mode, onPartSelect}) => (
  <Canvas camera={{position: [0, 1.2, 10], fov: 30, near: 0.1, far: 100}} dpr={[1, 1.5]} gl={{antialias: false}}>
    <ambientLight intensity={0.7} />
    <hemisphereLight intensity={0.75} groundColor="#5b7a99" />
    <directionalLight position={[4, 6, 5]} intensity={1.4} />
    <directionalLight position={[-3, 2, -3]} intensity={0.35} color="#a4c2ff" />
    <ModelOrbitControls
      zoomEnabled={mode === 'identify'}
      rotateEnabled={mode === 'identify' || mode === 'explore'}
      target={[0, 0, 0]}
      minDistance={5}
      maxDistance={18}
    />
    <RadarTruckModel highlightedPart={highlightedPart} mode={mode} onPartSelect={onPartSelect} />
  </Canvas>
);
