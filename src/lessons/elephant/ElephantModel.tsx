import React, {useEffect, useMemo} from 'react';
import {Canvas, useFrame, useLoader, useThree, type ThreeEvent} from '@react-three/fiber';
import {AnimationMixer, Box3, LoopOnce, LoopRepeat, SkinnedMesh, Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type ElephantMotion = 'idle' | 'walk' | 'eating' | 'rest';
type Props = {
  motion: ElephantMotion;
  playing: boolean;
  once: boolean;
  token: number;
  identify: boolean;
  onSelect: (part: string) => void;
  onReady: () => void;
  onFinished: () => void;
};

// The supplied elephant is ONE skinned mesh. Classify the clicked triangle by
// its skin weights and inspected rig names, never by arbitrary mesh-name ranges.
const bonePart = (name: string) => /proboscis/i.test(name) ? 'trunk'
  : /ear/i.test(name) ? 'ears' : /leg|foot|toe/i.test(name) ? 'legs'
    : /tail/i.test(name) ? 'tail' : /spine|root/i.test(name) ? 'body' : 'unknown';
const Elephant: React.FC<Props> = ({motion, playing, once, token, identify, onSelect, onReady, onFinished}) => {
  const gltf = useLoader(GLTFLoader, 'models/elephant-classroom.glb');
  const {invalidate} = useThree();
  const model = useMemo(() => {
    const scene = clone(gltf.scene);
    scene.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(scene), size = bounds.getSize(new Vector3());
    return {scene, center: bounds.getCenter(new Vector3()), scale: 3.4 / Math.max(size.x, size.y, size.z), mixer: new AnimationMixer(scene)};
  }, [gltf]);
  useEffect(() => {onReady(); return () => {model.mixer.stopAllAction(); model.mixer.uncacheRoot(model.scene);};}, [model, onReady]);
  useEffect(() => {
    const clip = gltf.animations.find(item => item.name === `TRS|${motion}`);
    if (!clip) throw new Error(`Missing elephant motion: ${motion}`);
    model.mixer.stopAllAction();
    const action = model.mixer.clipAction(clip).reset().setLoop(once ? LoopOnce : LoopRepeat, once ? 1 : Infinity);
    action.clampWhenFinished = true;
    action.play();
    model.mixer.update(0);
    invalidate();
    return () => {action.stop();};
  }, [gltf, model, motion, once, token, invalidate]);
  useEffect(() => {invalidate();}, [playing, invalidate]);
  useEffect(() => {
    const finished = () => onFinished();
    model.mixer.addEventListener('finished', finished);
    return () => model.mixer.removeEventListener('finished', finished);
  }, [model, onFinished]);
  useFrame((state, delta) => {
    if (!playing) return;
    model.mixer.update(Math.min(delta, .05));
    state.invalidate();
  });
  const select = (event: ThreeEvent<MouseEvent>) => {
    if (!identify || event.delta > 5 || !(event.object instanceof SkinnedMesh) || !event.face) return;
    event.stopPropagation();
    const mesh = event.object, joints = mesh.geometry.getAttribute('skinIndex'), weights = mesh.geometry.getAttribute('skinWeight');
    const scores: Record<string, number> = {};
    for (const index of [event.face.a, event.face.b, event.face.c]) {
      for (let channel = 0; channel < 4; channel++) {
        const bone = mesh.skeleton.bones[joints.getComponent(index, channel)];
        if (!bone) continue;
        const part = bonePart(bone.name);
        scores[part] = (scores[part] ?? 0) + weights.getComponent(index, channel);
      }
    }
    const part = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0];
    if (part) onSelect(part);
  };
  return <group scale={model.scale}><primitive object={model.scene} position={model.center.clone().negate()} onClick={select} dispose={null} /></group>;
};
const View: React.FC<{token: number}> = ({token}) => {
  const {camera, size, invalidate} = useThree();
  useEffect(() => {
    const fit = Math.max(1, 1.25 / (size.width / size.height));
    camera.position.set(5, 2.4, 6).multiplyScalar(fit * .72);
    camera.lookAt(0, 0, 0); camera.updateProjectionMatrix(); invalidate();
  }, [camera, size.width, size.height, token, invalidate]);
  return null;
};
export const ElephantCanvas: React.FC<Props & {viewToken: number}> = ({viewToken, ...props}) => <Canvas dpr={1} frameloop="demand" camera={{position: [5, 2.4, 6], fov: 36}} gl={{antialias: false, powerPreference: 'low-power'}}>
  <ambientLight intensity={1.6} /><hemisphereLight intensity={1} groundColor="#b59a6a" />
  <directionalLight position={[3, 5, 4]} intensity={2} />
  <View token={viewToken} /><Elephant {...props} />
  <ModelOrbitControls key={viewToken} dampingEnabled={false} zoomEnabled rotateEnabled target={[0, 0, 0]} minDistance={2.5} maxDistance={14} />
</Canvas>;
