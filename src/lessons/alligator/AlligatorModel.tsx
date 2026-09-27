import React, {useEffect, useMemo, useRef} from 'react';
import {Canvas, useFrame, useLoader, useThree, type ThreeEvent} from '@react-three/fiber';
import {
  AnimationClip,
  AnimationMixer,
  Box3,
  Color,
  Group,
  LoopOnce,
  LoopRepeat,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  SphereGeometry,
  Vector3,
} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as cloneSkeleton} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type AlligatorPartId = 'body' | 'head' | 'teeth' | 'legs' | 'tail';
export type AlligatorAnimation = 'idle' | 'walk' | 'attack' | 'hit';

const MODEL_URL = 'models/alligator.glb';
const MODEL_SIZE = 5.8;
const MODEL_FLOOR_Y = -0.92;
const ANIMATION_FLOOR_LIFT: Partial<Record<AlligatorAnimation, number>> = {
  attack: 0.21,
  walk: 0.04,
};
const EMPTY_IDENTIFIED: ReadonlySet<string> = new Set();
const HIGHLIGHT: Record<AlligatorPartId, string> = {
  body: '#8ce36b',
  head: '#ffd84d',
  teeth: '#ffffff',
  legs: '#ff9d4d',
  tail: '#63d4d1',
};

type SkinnedLike = Mesh & {
  isSkinnedMesh?: boolean;
  skeleton?: {update: () => void};
  applyBoneTransform?: (index: number, target: Vector3) => Vector3;
};

const getVisibleBounds = (root: Object3D) => {
  root.updateMatrixWorld(true);
  const bounds = new Box3();
  const vertex = new Vector3();
  root.traverse((child) => {
    const mesh = child as SkinnedLike;
    if (!mesh.isMesh) return;
    if (!mesh.isSkinnedMesh || !mesh.applyBoneTransform) {
      bounds.union(new Box3().setFromObject(mesh, true));
      return;
    }
    const position = mesh.geometry.getAttribute('position');
    mesh.skeleton?.update();
    for (let index = 0; index < position.count; index += 1) {
      vertex.fromBufferAttribute(position, index);
      mesh.applyBoneTransform(index, vertex);
      vertex.applyMatrix4(mesh.matrixWorld);
      bounds.expandByPoint(vertex);
    }
  });
  return bounds;
};

const addHitZone = (
  model: Object3D,
  boneName: string,
  part: AlligatorPartId,
  scale: [number, number, number],
  position: [number, number, number] = [0, 0, 0],
) => {
  const bone = model.getObjectByName(boneName);
  if (!bone) return;
  const zone = new Mesh(
    new SphereGeometry(1, 14, 10),
    new MeshBasicMaterial({
      color: HIGHLIGHT[part],
      transparent: true,
      opacity: 0.001,
      depthWrite: false,
      depthTest: false,
    }),
  );
  zone.name = `AlligatorHitZone_${part}`;
  zone.userData.part = part;
  zone.userData.hitZone = true;
  zone.position.set(...position);
  zone.scale.set(...scale);
  zone.renderOrder = 10;
  bone.add(zone);
};

const addHitZones = (model: Object3D) => {
  addHitZone(model, 'Bip01_Spine2_012', 'body', [42, 28, 25], [-8, 0, 0]);
  addHitZone(model, 'Bip01_Head_020', 'head', [28, 23, 22], [9, 0, 0]);
  addHitZone(model, 'BN_Jaw_03', 'teeth', [24, 10, 18], [16, 0, 0]);
  addHitZone(model, 'Bip01_L_Thigh_00', 'legs', [22, 18, 18]);
  addHitZone(model, 'Bip01_R_Thigh_07', 'legs', [22, 18, 18]);
  addHitZone(model, 'Bip01_L_UpperArm_014', 'legs', [22, 18, 18]);
  addHitZone(model, 'Bip01_R_UpperArm_024', 'legs', [22, 18, 18]);
  addHitZone(model, 'BN_Tail_01_027', 'tail', [30, 22, 20], [10, 0, 0]);
  addHitZone(model, 'BN_Tail_03_029', 'tail', [29, 19, 17], [16, 0, 0]);
  addHitZone(model, 'BN_Tail_05_032', 'tail', [26, 15, 14], [18, 0, 0]);

  model.traverse((child) => {
    if (/tooth/i.test(child.name)) child.userData.part = 'teeth' satisfies AlligatorPartId;
  });
};

const useAlligatorScene = (source: Object3D, selectable: boolean) => useMemo(() => {
  const model = cloneSkeleton(source);
  model.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.frustumCulled = false;
  });
  model.updateMatrixWorld(true);
  const head = model.getObjectByName('MonsterHeadPos')?.getWorldPosition(new Vector3());
  const tail = model.getObjectByName('BN_Tail_05_032')?.getWorldPosition(new Vector3());
  const groundPoints = [
    'Bip01_L_Toe0_06',
    'Bip01_R_Toe0_010',
    'Bip01_L_Finger0_019',
    'Bip01_R_Finger0_028',
  ].map((name) => model.getObjectByName(name)?.getWorldPosition(new Vector3())).filter(Boolean) as Vector3[];
  const bounds = getVisibleBounds(model);
  const fallbackCenter = bounds.getCenter(new Vector3());
  const fallbackSize = bounds.getSize(new Vector3());
  const center = head && tail ? head.clone().add(tail).multiplyScalar(0.5) : fallbackCenter;
  const modelLength = head && tail ? head.distanceTo(tail) : Math.max(fallbackSize.x, fallbackSize.z, 1);
  const groundY = groundPoints.length > 0
    ? Math.min(...groundPoints.map((point) => point.y))
    : bounds.min.y;
  if (selectable) addHitZones(model);
  const scale = MODEL_SIZE / Math.max(modelLength, 1);
  const normalized = new Group();
  normalized.scale.setScalar(scale);
  normalized.position.set(
    -center.x * scale,
    MODEL_FLOOR_Y - groundY * scale,
    -center.z * scale,
  );
  normalized.add(model);
  normalized.name = 'AlligatorNormalizedRoot';

  const presentation = new Group();
  presentation.rotation.y = -0.5;
  presentation.add(normalized);
  presentation.name = 'AlligatorPresentationRoot';
  return presentation;
}, [selectable, source]);

const useAlligatorAnimation = (
  root: Group,
  clips: AnimationClip[],
  animation: AlligatorAnimation | null,
  loop: boolean,
  animationKey: number,
  onFinished?: (animation: AlligatorAnimation) => void,
) => {
  const {invalidate} = useThree();
  const mixer = useMemo(() => new AnimationMixer(root), [root]);
  const running = useRef(false);
  const callback = useRef(onFinished);
  callback.current = onFinished;

  useEffect(() => {
    mixer.stopAllAction();
    running.current = false;
    if (!animation) {
      invalidate();
      return;
    }
    const clip = clips.find((candidate) => candidate.name.toLowerCase() === animation);
    if (!clip) return;
    const action = mixer.clipAction(clip);
    action.reset();
    action.clampWhenFinished = !loop;
    action.setLoop(loop ? LoopRepeat : LoopOnce, loop ? Infinity : 1);
    action.play();
    running.current = true;
    invalidate();

    const finish = () => {
      running.current = false;
      callback.current?.(animation);
      invalidate();
    };
    if (!loop) mixer.addEventListener('finished', finish);
    return () => {
      if (!loop) mixer.removeEventListener('finished', finish);
      action.stop();
    };
  }, [animation, animationKey, clips, invalidate, loop, mixer]);

  useEffect(() => () => {
    mixer.stopAllAction();
  }, [mixer]);

  useFrame((_, delta) => {
    if (!running.current) return;
    mixer.update(Math.min(delta, 0.05));
    invalidate();
  });
};

const AlligatorModel: React.FC<{
  animation: AlligatorAnimation | null;
  animationKey?: number;
  loop?: boolean;
  selectable?: boolean;
  highlightedPart?: AlligatorPartId | null;
  identified?: ReadonlySet<string>;
  onPartSelect?: (part: AlligatorPartId) => void;
  onAnimationFinished?: (animation: AlligatorAnimation) => void;
}> = ({
  animation,
  animationKey = 0,
  loop,
  selectable = false,
  highlightedPart = null,
  identified = EMPTY_IDENTIFIED,
  onPartSelect,
  onAnimationFinished,
}) => {
  const gltf = useLoader(GLTFLoader, MODEL_URL);
  const model = useAlligatorScene(gltf.scene, selectable);
  const shouldLoop = loop ?? (animation === 'idle' || animation === 'walk');
  const floorLift = animation ? ANIMATION_FLOOR_LIFT[animation] ?? 0 : 0;
  useAlligatorAnimation(model, gltf.animations, animation, shouldLoop, animationKey, onAnimationFinished);

  useEffect(() => () => {
    model.traverse((child) => {
      if (!child.userData.hitZone) return;
      const mesh = child as Mesh;
      mesh.geometry.dispose();
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => material.dispose());
    });
  }, [model]);

  useEffect(() => {
    model.traverse((child) => {
      if (!child.userData.hitZone) return;
      const part = child.userData.part as AlligatorPartId;
      const material = (child as Mesh).material as MeshBasicMaterial;
      const active = highlightedPart === part;
      const done = identified.has(part);
      material.color = new Color(done && !active ? '#5de18b' : HIGHLIGHT[part]);
      material.opacity = active ? 0.42 : done ? 0.16 : 0.001;
      material.needsUpdate = true;
    });
  }, [highlightedPart, identified, model]);

  const select = (event: ThreeEvent<MouseEvent>) => {
    if (!selectable) return;
    const part = event.intersections
      .map(({object}) => object.userData.part as AlligatorPartId | undefined)
      .find((candidate): candidate is AlligatorPartId => Boolean(candidate));
    if (!part) return;
    event.stopPropagation();
    onPartSelect?.(part);
  };

  return (
    <group position={[0, floorLift, 0]}>
      <primitive object={model} onClick={selectable ? select : undefined} dispose={null} />
    </group>
  );
};

export const AlligatorCanvas: React.FC<{
  mode: 'explore' | 'identify' | 'activity';
  animation: AlligatorAnimation | null;
  animationKey?: number;
  loop?: boolean;
  highlightedPart?: AlligatorPartId | null;
  identified?: ReadonlySet<string>;
  onPartSelect?: (part: AlligatorPartId) => void;
  onAnimationFinished?: (animation: AlligatorAnimation) => void;
}> = ({mode, animation, animationKey, loop, highlightedPart, identified, onPartSelect, onAnimationFinished}) => (
  <Canvas
    className="alligator-canvas"
    camera={{position: [7.2, 3.8, 8.4], fov: 34, near: 0.1, far: 100}}
    dpr={1}
    frameloop="demand"
    gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}
  >
    <color attach="background" args={['#cde8c2']} />
    <ambientLight intensity={1.1} />
    <hemisphereLight intensity={0.85} groundColor="#4f7643" />
    <directionalLight position={[6, 8, 6]} intensity={1.45} />
    <directionalLight position={[-4, 3, -3]} intensity={0.3} color="#b8d8ff" />
    <mesh position={[0, MODEL_FLOOR_Y - 0.08, 0]}>
      <cylinderGeometry args={[3.8, 3.8, 0.16, 48]} />
      <meshStandardMaterial color="#729f5d" roughness={0.92} />
    </mesh>
    <AlligatorModel
      animation={animation}
      animationKey={animationKey}
      loop={loop}
      selectable={mode === 'identify'}
      highlightedPart={highlightedPart}
      identified={identified}
      onPartSelect={onPartSelect}
      onAnimationFinished={onAnimationFinished}
    />
    <ModelOrbitControls
      dampingEnabled={false}
      zoomEnabled
      rotateEnabled={mode !== 'activity'}
      target={[0, -0.1, 0]}
      minDistance={5}
      maxDistance={14}
    />
  </Canvas>
);
