import React, {useEffect, useMemo} from 'react';
import {Canvas, useLoader, useThree, type ThreeEvent} from '@react-three/fiber';
import {Box3, Mesh, MeshStandardMaterial, Vector3, type Color, type Material} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';
import {firetruckHitPart, firetruckMeshPart} from './firetruckParts';
import type {FiretruckPart} from './FiretruckDiagram';

type ModelProps = {highlightedPart?: string | null; onPartSelect?: (part: string) => void};

const IdentifyFraming: React.FC<{enabled: boolean}> = ({enabled}) => {
  const {camera, size, invalidate} = useThree();
  useEffect(() => {
    if (!enabled) return;
    const fit = Math.max(1, 1.35 / (size.width / size.height));
    camera.position.set(-6 * fit, 3 * fit, 7 * fit);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld(true);
    invalidate();
  }, [camera, enabled, invalidate, size.width, size.height]);
  return null;
};

const SuppliedFiretruck: React.FC<ModelProps> = ({highlightedPart, onPartSelect}) => {
  const gltf = useLoader(GLTFLoader, 'models/firetruck-with-hose.glb');
  const {invalidate} = useThree();
  const model = useMemo(() => {
    const scene = gltf.scene.clone(true);
    const materials: {material: MeshStandardMaterial; part: FiretruckPart | null; baseColor: Color}[] = [];
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const clone = (source: Material) => {
        const material = source.clone();
        if (material instanceof MeshStandardMaterial) materials.push({material, part: firetruckMeshPart(object.name), baseColor: material.color.clone()});
        return material;
      };
      object.material = Array.isArray(object.material) ? object.material.map(clone) : clone(object.material);
    });
    scene.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(scene);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const scale = 5.8 / Math.max(size.x, size.y, size.z);
    return {scene, materials, scale, offset: center.multiplyScalar(-scale)};
  }, [gltf.scene]);
  useEffect(() => {
    for (const {material, part, baseColor} of model.materials) {
      if (!part) continue;
      material.color.copy(baseColor);
      if (part === 'hose' && part === highlightedPart) material.color.set('#1bbaf2');
      material.emissive.set(part === highlightedPart ? part === 'hose' ? '#076e9c' : '#ffbf36' : '#000000');
      material.emissiveIntensity = part === highlightedPart ? .8 : 0;
    }
    invalidate();
  }, [highlightedPart, invalidate, model]);
  useEffect(() => () => model.materials.forEach(({material}) => material.dispose()), [model]);
  const select = (event: ThreeEvent<MouseEvent>) => {
    if (event.delta > 5) return; // Orbit gestures must not answer a question.
    event.stopPropagation();
    const point = model.scene.worldToLocal(event.point.clone());
    onPartSelect?.(firetruckHitPart(event.object.name, point) ?? 'unknown');
  };
  return <group position={model.offset} scale={model.scale} dispose={null}>
    <primitive object={model.scene} onClick={onPartSelect ? select : undefined} />
    {highlightedPart === 'cab' ? <mesh position={[0, 3.2, -4.5]} raycast={() => {}}>
      <boxGeometry args={[6.6, 5.4, 8]} />
      <meshBasicMaterial color="#ffbf36" wireframe transparent opacity={.8} depthTest={false} />
    </mesh> : null}
  </group>;
};

export const FiretruckCanvas: React.FC<ModelProps> = (props) => <Canvas
  camera={{position: [-6, 3, 7], fov: 38, near: .1, far: 60}}
  frameloop="demand" dpr={1}
  gl={{antialias: false, powerPreference: 'low-power'}}
>
  <color attach="background" args={['#e8f4f8']} />
  <ambientLight intensity={1.7} />
  <hemisphereLight intensity={1} groundColor="#8b969d" />
  <directionalLight position={[4, 7, 5]} intensity={1.5} />
  <IdentifyFraming enabled={Boolean(props.onPartSelect)} />
  <SuppliedFiretruck {...props} />
  <ModelOrbitControls target={[0, 0, 0]} minDistance={4} maxDistance={props.onPartSelect ? 22 : 14} zoomEnabled rotateEnabled dampingEnabled={false} />
</Canvas>;
