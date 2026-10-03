import React, {useEffect, useMemo, useRef} from 'react';
import {Canvas, useFrame, useLoader, type ThreeEvent} from '@react-three/fiber';
import {AnimationMixer, Box3, Color, Mesh, MeshBasicMaterial, Object3D, Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type CompassPartId = 'housing' | 'ring' | 'dial' | 'needle';

const PART_BY_NODE: Record<string, CompassPartId> = {'compass housing_1': 'housing', ring_2: 'ring', 'rotating cylinder_3': 'dial', needle_4: 'needle'};

const findPart = (object: Object3D): CompassPartId | null => {
  let current: Object3D | null = object;
  while (current) {
    const part = (current.userData.part as CompassPartId | undefined) ?? PART_BY_NODE[current.name];
    if (part) return part;
    current = current.parent;
  }
  return null;
};

const tagPart = (node: Object3D, part: CompassPartId) => {
  node.traverse((child) => { child.userData.part = part; });
};

const CompassObject: React.FC<{highlightedPart: CompassPartId | null; onPartSelect?: (part: CompassPartId) => void; autoplay?: boolean}> = ({highlightedPart, onPartSelect, autoplay = false}) => {
  const gltf = useLoader(GLTFLoader, 'models/compass.glb');
  const mixerRef = useRef<AnimationMixer | null>(null);
  const {model, overlay} = useMemo(() => {
    const source = gltf.scene.clone(true);
    source.traverse((node) => { const part = PART_BY_NODE[node.name]; if (part) tagPart(node, part); });
    source.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(source);
    const center = new Vector3();
    const size = new Vector3();
    bounds.getCenter(center); bounds.getSize(size);
    const scale = 5.8 / Math.max(size.x, size.y, size.z);
    source.scale.setScalar(scale);
    source.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    if (!highlightedPart) return {model: source, overlay: null};
    const highlighted = source.clone(true);
    highlighted.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      const active = findPart(node) === highlightedPart;
      node.visible = active;
      if (active) {
        node.material = new MeshBasicMaterial({color: new Color('#ffdf46'), transparent: true, opacity: 0.66, depthTest: false, depthWrite: false});
        node.renderOrder = 2;
        node.raycast = () => undefined;
      }
    });
    return {model: source, overlay: highlighted};
  }, [gltf.scene, highlightedPart]);
  useEffect(() => {
    if (!autoplay || gltf.animations.length === 0) return undefined;
    const mixer = new AnimationMixer(model);
    gltf.animations.forEach((clip) => mixer.clipAction(clip, model).reset().play());
    mixerRef.current = mixer;
    return () => { mixer.stopAllAction(); mixerRef.current = null; };
  }, [autoplay, gltf.animations, model]);
  useFrame((_, delta) => { if (autoplay) mixerRef.current?.update(delta); });
  const select = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); const part = findPart(event.object); if (part) onPartSelect?.(part); };
  return <group onClick={onPartSelect ? select : undefined}><primitive object={model} />{overlay ? <primitive object={overlay} /> : null}</group>;
};

export const CompassCanvas: React.FC<{highlightedPart: CompassPartId | null; identify?: boolean; autoplay?: boolean; onPartSelect?: (part: CompassPartId) => void}> = ({highlightedPart, identify = false, autoplay = false, onPartSelect}) => (
  <Canvas className="compass-canvas" camera={{position: [6.8, 5.8, 8], fov: 32, near: 0.1, far: 100}} dpr={1} frameloop={autoplay ? 'always' : 'demand'} gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}>
    <color attach="background" args={['#bfe8f5']} /><ambientLight intensity={1.15} /><hemisphereLight intensity={1.1} groundColor="#26516d" /><directionalLight position={[6, 8, 5]} intensity={1.4} />
    <CompassObject highlightedPart={highlightedPart} autoplay={autoplay} onPartSelect={identify ? onPartSelect : undefined} />
    <ModelOrbitControls zoomEnabled rotateEnabled dampingEnabled={false} target={[0, 0, 0]} minDistance={5} maxDistance={13} />
  </Canvas>
);
