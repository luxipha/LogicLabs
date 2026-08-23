import React, {useEffect, useMemo, useRef} from 'react';
import {Canvas, useFrame, useLoader} from '@react-three/fiber';
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Box3,
  Color,
  Group,
  LoopRepeat,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type GolfPartId = 'head' | 'body' | 'arms' | 'club' | 'hat';

export const GOLF_PART_ORDER: GolfPartId[] = ['hat', 'head', 'body', 'arms', 'club'];

const PART_HIGHLIGHT: Record<GolfPartId, string> = {
  hat: '#ffb347',
  head: '#ffe155',
  body: '#8fd47f',
  arms: '#7fd4ff',
  club: '#c9d4dc',
};

// The model has no separate hat mesh — hat highlights the whole character.
const PART_TO_MESH: Record<GolfPartId, GolfPartId> = {
  hat: 'head',
  head: 'head',
  body: 'body',
  arms: 'arms',
  club: 'club',
};

// Bakes the skinned geometry at the current pose to compute a real bounding
// box (setFromObject returns zero for skinned meshes). applyBoneTransform
// already includes the mesh world transform, so matrixWorld must NOT be
// applied again (the GLB root has a small scale that would collapse it).
const getSkinnedBounds = (mesh: Mesh & {isSkinnedMesh?: boolean; skeleton?: {update: () => void}; applyBoneTransform?: (i: number, v: Vector3) => void}) => {
  const geometry = mesh.geometry;
  const position = geometry.getAttribute('position');
  mesh.updateMatrixWorld(true);
  mesh.skeleton?.update();
  const box = new Box3();
  const vertex = new Vector3();
  for (let index = 0; index < position.count; index += 1) {
    vertex.fromBufferAttribute(position, index);
    mesh.applyBoneTransform?.(index, vertex);
    box.expandByPoint(vertex);
  }
  return box;
};

// Keeps the animated character rig live inside a centered/scaled wrapper.
// IMPORTANT: the GLB scene is used directly (not cloned) — SkinnedMesh.copy
// shares the skeleton object, so cloning breaks the bone->mesh link and the
// character collapses to the origin.
const useGolferScene = (gltf: {scene: Object3D; animations: unknown[]}) => {
  return useMemo(() => {
    const live = gltf.scene;
    live.updateMatrixWorld(true);

    const visibleBox = new Box3();

    live.traverse((child: Object3D) => {
      const mesh = child as Mesh & {isSkinnedMesh?: boolean};
      if (!mesh.isMesh) {
        return;
      }
      if (mesh.isSkinnedMesh) {
        // Live skinned character — compute its real bind-pose bounds.
        visibleBox.union(getSkinnedBounds(mesh));
        return;
      }
      visibleBox.union(new Box3().setFromObject(mesh));
    });

    const box = visibleBox.isEmpty() ? new Box3() : visibleBox;
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);
    // Scale so the course's longest side is ~5 units (character is ~2 tall).
    const scale = 5 / Math.max(size.x, size.y, size.z);

    // Wrap the ENTIRE live scene in one centered group so the skeleton stays
    // intact (bones must keep their positions relative to the character mesh).
    const sceneGroup = new Group();
    sceneGroup.scale.setScalar(scale);
    sceneGroup.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    sceneGroup.add(live);

    // Collect live character/club meshes (inside the wrapped scene) for
    // highlight material handling.
    const charMeshes: Mesh[] = [];
    const clubMeshes: Mesh[] = [];
    sceneGroup.traverse((child: Object3D) => {
      const mesh = child as Mesh & {isSkinnedMesh?: boolean};
      if (!mesh.isMesh) {
        return;
      }
      if (mesh.isSkinnedMesh) {
        charMeshes.push(mesh);
        return;
      }
      const matName = (Array.isArray(mesh.material) ? mesh.material[0]?.name : mesh.material?.name) ?? '';
      if (matName === '1A1A1A' || matName === '78909C' || matName === '455A64') {
        clubMeshes.push(mesh);
      }
    });

    return {sceneGroup, charMeshes, clubMeshes, center, scale};
  }, [gltf.scene]);
};

// Plays the swing animation on the character skeleton in a loop.
const useSwingAnimation = (
  gltf: {animations: AnimationClip[]},
  charGroup: Group | null,
) => {
  const mixerRef = useRef<AnimationMixer | null>(null);
  const actionRef = useRef<AnimationAction | null>(null);

  useEffect(() => {
    if (!charGroup) {
      return;
    }
    const mixer = new AnimationMixer(charGroup);
    mixerRef.current = mixer;
    const clip = gltf.animations[0];
    if (clip) {
      const action = mixer.clipAction(clip);
      action.reset();
      action.setLoop(LoopRepeat, Infinity);
      action.play();
      actionRef.current = action;
    }
    return () => {
      actionRef.current = null;
      mixer.stopAllAction();
      mixerRef.current = null;
    };
  }, [charGroup, gltf.animations]);

  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });
};

const makeHighlightedMaterial = (
  base: Mesh['material'] | null,
  part: GolfPartId,
  active: boolean,
) => {
  if (!base) {
    return null;
  }
  const source = Array.isArray(base) ? base[0] : base;
  const material = source.clone() as MeshStandardMaterial;
  if ('emissive' in material) {
    material.emissive = new Color(active ? PART_HIGHLIGHT[part] : '#000000');
    material.emissiveIntensity = active ? 0.5 : 0;
  }
  return material;
};

export const GolfModel: React.FC<{
  highlightedPart: GolfPartId | null;
  onPartSelect: (part: GolfPartId) => void;
}> = ({highlightedPart, onPartSelect}) => {
  const gltf = useLoader(GLTFLoader, 'models/golfer.glb');
  const {sceneGroup, charMeshes, clubMeshes} = useGolferScene(gltf);
  useSwingAnimation(gltf, sceneGroup);

  // Highlight the character when hat/head/body/arms is selected.
  useEffect(() => {
    const isActive =
      highlightedPart !== null && PART_TO_MESH[highlightedPart] !== 'club';
    for (const mesh of charMeshes) {
      const material = makeHighlightedMaterial(mesh.material, 'body', isActive);
      if (material) {
        mesh.material = material;
      }
    }
  }, [charMeshes, highlightedPart]);

  // Highlight the club when selected.
  useEffect(() => {
    const isActive = highlightedPart === 'club';
    for (const mesh of clubMeshes) {
      const material = makeHighlightedMaterial(mesh.material, 'club', isActive);
      if (material) {
        mesh.material = material;
      }
    }
  }, [clubMeshes, highlightedPart]);

  return (
    <group>
      <primitive object={sceneGroup} />
    </group>
  );
};

export const GolfCanvas: React.FC<{
  highlightedPart: GolfPartId | null;
  onPartSelect: (part: GolfPartId) => void;
}> = ({highlightedPart, onPartSelect}) => (
  <Canvas
    camera={{position: [1.2, 0.7, 4.2], fov: 32, near: 0.1, far: 100}}
    dpr={[1, 1.5]}
    gl={{antialias: false}}
  >
    <ambientLight intensity={0.75} />
    <hemisphereLight intensity={0.8} groundColor="#5b7a4f" />
    <directionalLight position={[5, 7, 5]} intensity={1.4} />
    <directionalLight position={[-4, 3, -3]} intensity={0.35} color="#a4c2ff" />
    <ModelOrbitControls
      zoomEnabled
      rotateEnabled
      target={[0, 0.25, 0]}
      minDistance={3}
      maxDistance={12}
    />
    <GolfModel highlightedPart={highlightedPart} onPartSelect={onPartSelect} />
  </Canvas>
);
