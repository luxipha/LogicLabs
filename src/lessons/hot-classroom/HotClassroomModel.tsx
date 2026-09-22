import React, {useMemo} from 'react';
import {Canvas, useLoader, type ThreeEvent} from '@react-three/fiber';
import {Box3, Group, Mesh, Object3D, Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type FanPartId = 'base' | 'stand' | 'blade' | 'motor';

const HIGHLIGHT = '#ffdf46';

const usePreparedExploreFan = (gltf: {scene: Object3D}) =>
  useMemo(() => {
    const source = gltf.scene.clone(true);
    source.updateMatrixWorld(true);
    const fan = new Group();
    const visibleBounds = new Box3();

    source.traverse((child: Object3D) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(mesh.matrixWorld);
      geometry.computeBoundingBox();
      const bakedMesh = new Mesh(geometry, mesh.material);
      bakedMesh.frustumCulled = false;
      fan.add(bakedMesh);
      if (geometry.boundingBox) visibleBounds.union(geometry.boundingBox);
    });

    const bounds = visibleBounds.isEmpty() ? new Box3().setFromObject(fan) : visibleBounds;
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const scale = 4.4 / Math.max(size.x, size.y, size.z);
    fan.scale.setScalar(scale);
    fan.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    return fan;
  }, [gltf.scene]);

const ExploreFanModel: React.FC = () => {
  const gltf = useLoader(GLTFLoader, 'models/electric_fan.glb');
  return <primitive object={usePreparedExploreFan(gltf)} />;
};

export const HotClassroomFanCanvas: React.FC = () => (
  <Canvas
    camera={{position: [5.8, 3.2, 7.2], fov: 32, near: 0.1, far: 100}}
    dpr={1}
    frameloop="demand"
    gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}
  >
    <color attach="background" args={['#a8d9f3']} />
    <ambientLight intensity={1.1} />
    <hemisphereLight intensity={0.8} groundColor="#527f3d" />
    <directionalLight position={[5, 7, 6]} intensity={1.5} />
    <ModelOrbitControls zoomEnabled rotateEnabled target={[0, 0, 0]} minDistance={4.5} maxDistance={12} />
    <ExploreFanModel />
  </Canvas>
);

const PartMaterial: React.FC<{active: boolean; color: string}> = ({active, color}) => (
  <meshStandardMaterial
    color={active ? HIGHLIGHT : color}
    emissive={active ? HIGHLIGHT : '#000000'}
    emissiveIntensity={active ? 0.55 : 0}
    roughness={0.52}
    metalness={0.12}
  />
);

const IdentifyFan: React.FC<{
  highlightedPart: FanPartId | null;
  onPartSelect: (part: FanPartId) => void;
}> = ({highlightedPart, onPartSelect}) => {
  const select = (part: FanPartId) => (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onPartSelect(part);
  };
  const material = (part: FanPartId, color: string) => (
    <PartMaterial active={highlightedPart === part} color={color} />
  );

  return (
    <group position={[0, -0.1, 0]}>
      <group onClick={select('base')}>
        <mesh position={[0, -1.7, 0]}>
          <cylinderGeometry args={[1.02, 1.2, 0.32, 32]} />
          {material('base', '#8d9aae')}
        </mesh>
      </group>
      <group onClick={select('stand')}>
        <mesh position={[0, -0.9, 0]}>
          <cylinderGeometry args={[0.14, 0.22, 1.35, 24]} />
          {material('stand', '#b3becd')}
        </mesh>
        <mesh position={[0, -0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.28, 24]} />
          {material('stand', '#b3becd')}
        </mesh>
      </group>
      <group position={[0, 0.25, 0]} onClick={select('blade')}>
        {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((rotation) => (
          <mesh
            key={rotation}
            position={[Math.sin(rotation) * 0.58, Math.cos(rotation) * 0.58, 0]}
            rotation={[0, 0, -rotation]}
            scale={[0.34, 0.8, 0.1]}
          >
            <sphereGeometry args={[1, 20, 14]} />
            {material('blade', '#f17b34')}
          </mesh>
        ))}
      </group>
      <group onClick={select('motor')}>
        <mesh position={[0, 0.25, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.34, 32]} />
          {material('motor', '#5f7894')}
        </mesh>
      </group>
    </group>
  );
};

export const HotClassroomIdentifyCanvas: React.FC<{
  highlightedPart: FanPartId | null;
  onPartSelect: (part: FanPartId) => void;
}> = ({highlightedPart, onPartSelect}) => (
  <Canvas
    camera={{position: [0, 0.4, 7], fov: 30, near: 0.1, far: 100}}
    dpr={1}
    frameloop="demand"
    gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}
  >
    <color attach="background" args={['#a8d9f3']} />
    <ambientLight intensity={1.15} />
    <hemisphereLight intensity={0.8} groundColor="#527f3d" />
    <directionalLight position={[4, 6, 5]} intensity={1.45} />
    <IdentifyFan highlightedPart={highlightedPart} onPartSelect={onPartSelect} />
    <ModelOrbitControls
      zoomEnabled
      dampingEnabled={false}
      rotateEnabled
      target={[0, -0.1, 0]}
      minDistance={4.8}
      maxDistance={11}
    />
  </Canvas>
);
