import React, {Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import {Canvas, useFrame, useLoader} from '@react-three/fiber';
import {
  Box3,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  Material,
  Mesh,
  Object3D,
  SkinnedMesh,
  Vector3,
} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  FeedbackBanner,
  LessonStage,
  MissionHeader,
  ModeTabs,
  PartsList,
  PartsTray,
  ProgressCard,
  QuizCard,
  StoryVideoCard,
  TaskCard,
  TipCard,
  type LessonModeTab,
} from '../shared/lesson-ui';
import lessonContent from './content.json';
import {WarmupScreen} from '../shared/WarmupScreen';
import {ModelOrbitControls} from '../shared/ModelViewportControls';
import './lesson.scoped.css';

type LessonMode = 'warmup' | 'story' | 'identify' | 'explore' | 'pollinate' | 'code';
type PartId = 'wings' | 'body' | 'head' | 'antennae' | 'proboscis';
type FlapSpeed = 'stop' | 'slow' | 'fast';
type ModelDebug = {
  visibleMeshes: string[];
  hiddenMeshes: string[];
  bounds: string;
  scale: string;
};

const PARTS: PartId[] = ['wings', 'body', 'head', 'antennae', 'proboscis'];
const IDENTIFY_ORDER: PartId[] = ['wings', 'body', 'head', 'antennae', 'proboscis'];

const MODE_TABS: LessonModeTab<LessonMode>[] = [
  {id: 'warmup', label: 'Warmup', icon: 'WU', tone: 'fly'},
  {id: 'story', label: 'Story', icon: 'PLAY', tone: 'fly'},
  {id: 'identify', label: 'Identify', icon: 'Q', tone: 'identify'},
  {id: 'explore', label: 'Explore', icon: 'BOOK', tone: 'explore'},
  {id: 'pollinate', label: 'Pollinate', icon: 'POLLEN', tone: 'assemble'},
  {id: 'code', label: 'Code', icon: 'A+B', tone: 'fly'},
];

const STORY_VIDEO_URL = lessonContent.storyVideoUrl;
const QUESTIONS = lessonContent.quiz;
const STORY_QUESTIONS = lessonContent.storyQuestions;

const LABELS: Record<PartId, string> = {
  wings: 'Wings',
  body: 'Body',
  head: 'Head',
  antennae: 'Antennae',
  proboscis: 'Proboscis',
};

const FACTS: Record<PartId, string> = {
  wings: 'Butterflies use wings to fly from flower to flower.',
  body: 'The body holds the head, thorax, abdomen, legs, and wings together.',
  head: 'The head holds the eyes, antennae, and proboscis.',
  antennae: 'Antennae help butterflies smell and sense the world around them.',
  proboscis: 'The proboscis is a straw-like tube. It unrolls to drink nectar and rolls back up.',
};

const hasWebGLSupport = () => {
  if (typeof document === 'undefined') {
    return false;
  }

  const canvas = document.createElement('canvas');
  return Boolean(
    canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl'),
  );
};

class ButterflyStageErrorBoundary extends Component<
  {children: ReactNode; fallback: ReactNode},
  {hasError: boolean}
> {
  state = {hasError: false};

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

const PartPreview: React.FC<{part: PartId}> = ({part}) => (
  <span className={`butterfly-part-preview butterfly-preview-${part}`} aria-hidden="true">
    {part === 'wings' ? (
      <>
        <span className="mini-wing mini-wing-left" />
        <span className="mini-wing mini-wing-right" />
      </>
    ) : null}
    {part === 'body' ? <span className="mini-body" /> : null}
    {part === 'head' ? <span className="mini-body mini-head" /> : null}
    {part === 'antennae' ? (
      <>
        <span className="mini-antenna left" />
        <span className="mini-antenna right" />
      </>
    ) : null}
    {part === 'proboscis' ? <span className="mini-proboscis" /> : null}
  </span>
);

const classifyMesh = (name: string): PartId => {
  const normalized = name.toLowerCase();
  if (normalized.includes('wing') || normalized.includes('wiba') || normalized.includes('wifr')) {
    return 'wings';
  }
  if (normalized.includes('face') || normalized.includes('eyes')) {
    return 'head';
  }
  if (normalized.includes('body')) {
    return 'body';
  }
  return 'body';
};

const getIdentifyOffset = (part: PartId): [number, number, number] => {
  switch (part) {
    case 'wings':
      return [0, 0.18, 0.12];
    case 'body':
      return [0, -0.24, -0.08];
    case 'head':
      return [0, 0.1, 0.32];
    case 'antennae':
      return [0, 0.38, 0.24];
    case 'proboscis':
      return [0, -0.08, 0.34];
    default:
      return [0, 0, 0];
  }
};

const getMaterialNames = (object: Object3D) => {
  const material = (object as {material?: unknown}).material;
  if (Array.isArray(material)) {
    return material
      .map((entry) => (entry && typeof entry === 'object' && 'name' in entry ? String(entry.name) : ''))
      .join(' ');
  }
  if (material && typeof material === 'object' && 'name' in material) {
    return String(material.name);
  }
  return '';
};

const cloneMaterial = (material: Mesh['material']) => {
  if (Array.isArray(material)) {
    return material.map((entry) => entry.clone());
  }
  return material.clone() as Material;
};

const highlightMaterial = (material: Mesh['material'], active: boolean) => {
  const cloned = cloneMaterial(material);
  const applyHighlight = (entry: Material) => {
    const materialWithColor = entry as Material & {
      color?: Color;
      emissive?: Color;
      emissiveIntensity?: number;
      metalness?: number;
      roughness?: number;
    };
    if (materialWithColor.color && active) {
      materialWithColor.color.lerp(new Color('#fff26a'), 0.22);
    }
    if (materialWithColor.emissive) {
      materialWithColor.emissive = new Color(active ? '#ffe155' : '#000000');
      materialWithColor.emissiveIntensity = active ? 0.75 : 0;
    }
    if (typeof materialWithColor.roughness === 'number' && active) {
      materialWithColor.roughness = Math.max(0.25, materialWithColor.roughness - 0.25);
    }
  };

  if (Array.isArray(cloned)) {
    cloned.forEach(applyHighlight);
    return cloned;
  }

  applyHighlight(cloned);
  return cloned;
};

const splitGeometry = (
  geometry: BufferGeometry,
  includeTriangle: (centroid: Vector3) => boolean,
) => {
  const source = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  const position = source.getAttribute('position');
  const normal = source.getAttribute('normal');
  const uv = source.getAttribute('uv');
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  const centroid = new Vector3();

  for (let index = 0; index < position.count; index += 3) {
    a.fromBufferAttribute(position, index);
    b.fromBufferAttribute(position, index + 1);
    c.fromBufferAttribute(position, index + 2);
    centroid.copy(a).add(b).add(c).multiplyScalar(1 / 3);
    if (!includeTriangle(centroid)) {
      continue;
    }

    for (let offset = 0; offset < 3; offset += 1) {
      positions.push(
        position.getX(index + offset),
        position.getY(index + offset),
        position.getZ(index + offset),
      );
      if (normal) {
        normals.push(normal.getX(index + offset), normal.getY(index + offset), normal.getZ(index + offset));
      }
      if (uv) {
        uvs.push(uv.getX(index + offset), uv.getY(index + offset));
      }
    }
  }

  if (positions.length === 0) {
    return null;
  }

  const result = new BufferGeometry();
  result.setAttribute('position', new Float32BufferAttribute(positions, 3));
  if (normals.length > 0) {
    result.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  }
  if (uvs.length > 0) {
    result.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  }
  result.computeVertexNormals();
  result.computeBoundingBox();
  result.computeBoundingSphere();
  return result;
};

const createBakedGeometry = (source: Mesh) => {
  const geometry = source.geometry.clone();
  const position = geometry.getAttribute('position');
  const skinned = source as SkinnedMesh;
  const vertex = new Vector3();

  if (position && skinned.isSkinnedMesh) {
    skinned.skeleton.update();
    for (let index = 0; index < position.count; index += 1) {
      vertex.fromBufferAttribute(position, index);
      skinned.applyBoneTransform(index, vertex);
      vertex.applyMatrix4(source.matrixWorld);
      position.setXYZ(index, vertex.x, vertex.y, vertex.z);
    }
    position.needsUpdate = true;
  } else {
    geometry.applyMatrix4(source.matrixWorld);
  }

  geometry.deleteAttribute('skinIndex');
  geometry.deleteAttribute('skinWeight');
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
};

const createBakedMesh = (source: Mesh, geometry: BufferGeometry, part: PartId, active: boolean) => {
  const mesh = new Mesh(geometry, highlightMaterial(source.material, active));
  mesh.name = source.name;
  mesh.userData.lessonPart = part;
  mesh.userData.originalScale = [source.scale.x, source.scale.y, source.scale.z];
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  return mesh;
};

const ButterflyModel: React.FC<{
  activePart: PartId;
  mode: LessonMode;
  flapSpeed: FlapSpeed;
  pollinationStep: number;
  onDebug?: (debug: ModelDebug) => void;
  onPartSelect: (part: PartId) => void;
}> = ({activePart, mode, flapSpeed, pollinationStep, onDebug, onPartSelect}) => {
  const gltf = useLoader(GLTFLoader, 'models/butterfly.glb');
  const model = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.updateMatrixWorld(true);
    const baked = new Group();
    const visibleBox = new Box3();
    const visibleMeshes: string[] = [];
    const hiddenMeshes: string[] = [];
    cloned.traverse((child: Object3D) => {
      const materialName = getMaterialNames(child).toLowerCase();
      const mesh = child as Mesh;
      if (mesh.isMesh) {
        const bakedGeometry = createBakedGeometry(mesh);
        const meshKey = `${child.name} ${materialName}`;
        const part = classifyMesh(meshKey);
        const bakedMeshes: Mesh[] = [];

        if (materialName.includes('buttpiez')) {
          const antennaeGeometry = splitGeometry(
            bakedGeometry,
            (centroid) => centroid.y > 13.5 && centroid.z > 8 && Math.abs(centroid.x) > 2.5,
          );
          const proboscisGeometry = splitGeometry(
            bakedGeometry,
            (centroid) => centroid.y > 8 && centroid.y <= 16 && centroid.z > 10 && Math.abs(centroid.x) <= 4.5,
          );
          const bodyDetailGeometry = splitGeometry(
            bakedGeometry,
            (centroid) =>
              !(centroid.y > 13.5 && centroid.z > 8 && Math.abs(centroid.x) > 2.5) &&
              !(centroid.y > 8 && centroid.y <= 16 && centroid.z > 10 && Math.abs(centroid.x) <= 4.5),
          );

          if (antennaeGeometry) {
            bakedMeshes.push(createBakedMesh(mesh, antennaeGeometry, 'antennae', activePart === 'antennae'));
          }
          if (proboscisGeometry) {
            bakedMeshes.push(createBakedMesh(mesh, proboscisGeometry, 'proboscis', activePart === 'proboscis'));
          }
          if (bodyDetailGeometry) {
            bakedMeshes.push(createBakedMesh(mesh, bodyDetailGeometry, 'body', activePart === 'body'));
          }
        } else {
          bakedMeshes.push(createBakedMesh(mesh, bakedGeometry, part, part === activePart));
        }

        bakedMeshes.forEach((bakedMesh) => {
          baked.add(bakedMesh);
          visibleBox.union(new Box3().setFromObject(bakedMesh));
        });
        visibleMeshes.push(`${mesh.name || 'unnamed'}:${materialName || 'no-material'}`);
      }
    });
    const box = visibleBox.isEmpty() ? new Box3().setFromObject(baked) : visibleBox;
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);
    const scale = 3.25 / Math.max(size.x, size.y, size.z);
    baked.scale.setScalar(scale);
    baked.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    baked.rotation.set(0, 0, 0);
    onDebug?.({
      visibleMeshes,
      hiddenMeshes,
      bounds: `${size.x.toFixed(1)} x ${size.y.toFixed(1)} x ${size.z.toFixed(1)}`,
      scale: scale.toFixed(4),
    });
    return baked;
  }, [activePart, gltf.scene, onDebug]);
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      const pollinationTarget: [number, number, number] =
        mode === 'pollinate'
          ? pollinationStep === 0
            ? [-2.35, -1.05, 0]
            : pollinationStep === 1
              ? [0, 0.55, 0]
              : [2.35, -0.95, 0]
          : [0, 0.05, 0];
      const moveSpeed = Math.min(1, delta * (mode === 'pollinate' ? 2.8 : 7));
      groupRef.current.position.x += (pollinationTarget[0] - groupRef.current.position.x) * moveSpeed;
      groupRef.current.position.y += (pollinationTarget[1] - groupRef.current.position.y) * moveSpeed;
      groupRef.current.position.z += (pollinationTarget[2] - groupRef.current.position.z) * moveSpeed;

      model.children.forEach((child) => {
        const part = child.userData.lessonPart as PartId | undefined;
        const [targetX, targetY, targetZ] =
          mode === 'identify' && part ? getIdentifyOffset(part) : [0, 0, 0];
        const activeScale = mode === 'identify' && part === activePart ? 1.08 : 1;
        const wingFlap =
          part === 'wings' && flapSpeed !== 'stop'
            ? Math.sin(Date.now() * (flapSpeed === 'fast' ? 0.018 : 0.01)) *
              (flapSpeed === 'fast' ? 0.5 : 0.28)
            : 0;
        const speed = Math.min(1, delta * 7);
        child.position.x += (targetX - child.position.x) * speed;
        child.position.y += (targetY - child.position.y) * speed;
        child.position.z += (targetZ - child.position.z) * speed;
        child.rotation.x += (wingFlap - child.rotation.x) * Math.min(1, delta * 12);
        child.scale.x += (activeScale - child.scale.x) * speed;
        child.scale.y += (activeScale - child.scale.y) * speed;
        child.scale.z += (activeScale - child.scale.z) * speed;
      });

      const bodySway =
        mode !== 'identify' && flapSpeed !== 'stop'
          ? Math.sin(Date.now() * (flapSpeed === 'fast' ? 0.007 : 0.003)) * 0.05
          : 0;
      const travelTilt = mode === 'pollinate' ? (pollinationStep === 1 ? -0.18 : pollinationStep === 2 ? 0.18 : 0) : 0;
      groupRef.current.rotation.y += (bodySway + travelTilt - groupRef.current.rotation.y) * Math.min(1, delta * 8);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0.05, 0]}
      onClick={(event) => {
        event.stopPropagation();
        const part = event.object.userData.lessonPart as PartId | undefined;
        onPartSelect(part ?? activePart);
      }}
    >
      <primitive object={model} />
    </group>
  );
};

const ButterflyStage: React.FC<{
  activePart: PartId;
  mode: LessonMode;
  flapSpeed: FlapSpeed;
  pollinationStep: number;
  onPartSelect: (part: PartId) => void;
}> = ({activePart, mode, flapSpeed, pollinationStep, onPartSelect}) => {
  const [webGLAvailable] = useState(hasWebGLSupport);
  const [debug, setDebug] = useState<ModelDebug | null>(null);
  const debugEnabled =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug');

  if (!webGLAvailable) {
    return (
      <div className="butterfly-stage-error">
        <strong>Butterfly 3D needs WebGL.</strong>
        <span>This browser has WebGL disabled. Try Firefox or enable graphics acceleration.</span>
      </div>
    );
  }

  return (
    <>
      <ButterflyStageErrorBoundary
        fallback={
          <div className="butterfly-stage-error">
            <strong>Butterfly model failed to load.</strong>
            <span>Check DevTools Network for ./models/butterfly.glb and Console for GLTF errors.</span>
          </div>
        }
      >
        <Canvas camera={{position: [0, 0.15, 7.4], fov: 32}} dpr={[1, 1.5]} gl={{antialias: false}}>
          <ambientLight intensity={0.7} />
          <hemisphereLight intensity={0.75} groundColor="#5b7a99" />
          <directionalLight position={[5, 6, 5]} intensity={1.45} />
          <directionalLight position={[-4, 2, -4]} intensity={0.35} color="#a4c2ff" />
          <ModelOrbitControls
            zoomEnabled={mode === 'identify'}
            rotateEnabled={mode === 'explore'}
            target={[0, 0.2, 0]}
            minDistance={3.5}
            maxDistance={13}
          />
          <Suspense fallback={null}>
            <ButterflyModel
              activePart={activePart}
              mode={mode}
              flapSpeed={flapSpeed}
              pollinationStep={pollinationStep}
              onDebug={debugEnabled ? setDebug : undefined}
              onPartSelect={onPartSelect}
            />
          </Suspense>
        </Canvas>
      </ButterflyStageErrorBoundary>
      {debugEnabled ? (
        <div className="butterfly-debug">
          <strong>Butterfly GLB Debug</strong>
          <span>WebGL: yes</span>
          <span>Visible meshes: {debug?.visibleMeshes.length ?? 0}</span>
          <span>Hidden meshes: {debug?.hiddenMeshes.length ?? 0}</span>
          <span>Bounds: {debug?.bounds ?? 'loading'}</span>
          <span>Scale: {debug?.scale ?? 'loading'}</span>
          <small>{debug?.visibleMeshes.join(' | ') ?? 'Loading model...'}</small>
        </div>
      ) : null}
      {mode === 'pollinate' ? (
        <div className={`pollination-demo pollination-step-${pollinationStep}`}>
          <div className="flower-label male-label">Male flower</div>
          <div className="flower-label female-label">Female flower</div>
          <div className="pollen-cluster male-pollen" aria-label="Pollen on male flower">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="pollen-cluster carried-pollen" aria-label="Pollen carried by butterfly">
            <span />
            <span />
            <span />
          </div>
          <div className="pollen-cluster female-pollen" aria-label="Pollen delivered to female flower">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      ) : null}
      <div className="flower-prop left-flower" />
      <div className="flower-prop right-flower" />
    </>
  );
};

export const ButterflyLesson: React.FC<{onHome?: () => void; onComplete?: () => void}> = ({
  onHome,
  onComplete,
}) => {
  const [mode, setMode] = useState<LessonMode>('warmup');
  const [selectedPart, setSelectedPart] = useState<PartId>('wings');
  const [identified, setIdentified] = useState<Partial<Record<PartId, boolean>>>({});
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [flapSpeed, setFlapSpeed] = useState<FlapSpeed>('stop');
  const [pollinationStep, setPollinationStep] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [storyQuestionIndex, setStoryQuestionIndex] = useState(0);
  const [storyCorrectAnswers, setStoryCorrectAnswers] = useState(0);
  const [storyFeedback, setStoryFeedback] = useState<'correct' | 'wrong' | null>(null);

  const identifyTarget = useMemo(
    () => IDENTIFY_ORDER.find((part) => !identified[part]) ?? null,
    [identified],
  );
  const question = QUESTIONS[questionIndex];
  const storyQuestion = STORY_QUESTIONS[storyQuestionIndex];
  useEffect(() => {
    if (mode === 'pollinate' && pollinationStep === 2) {
      onComplete?.();
    }
  }, [mode, pollinationStep, onComplete]);

  const selectMode = (nextMode: LessonMode) => {
    setMode(nextMode);
    if (nextMode === 'code') {
      setSelectedPart('wings');
      setFlapSpeed('slow');
    }
    if (nextMode === 'pollinate') {
      setSelectedPart('body');
      setFlapSpeed('slow');
    }
    if (nextMode === 'identify') {
      setFlapSpeed('stop');
    }
    if (nextMode === 'story') {
      setFlapSpeed('stop');
    }
    if (nextMode === 'warmup') {
      setFlapSpeed('stop');
    }
  };

  const selectPart = (part: PartId) => {
    setSelectedPart(part);

    if (mode !== 'identify' || !identifyTarget) {
      return;
    }

    const correct = part === identifyTarget;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      setIdentified((existing) => ({...existing, [part]: true}));
    }
    window.setTimeout(() => setFeedback(null), correct ? 850 : 600);
  };

  const answerQuestion = (answerIndex: number) => {
    const correct = answerIndex === question.correctIndex;
    setQuizFeedback(correct ? 'correct' : 'wrong');
    window.setTimeout(() => {
      if (correct) {
        setQuestionIndex((existing) => (existing + 1) % QUESTIONS.length);
      }
      setQuizFeedback(null);
    }, correct ? 900 : 650);
  };

  const answerStoryQuestion = (answerIndex: number) => {
    const correct = answerIndex === storyQuestion.correctIndex;
    setStoryFeedback(correct ? 'correct' : 'wrong');
    window.setTimeout(() => {
      if (correct) {
        setStoryCorrectAnswers((existing) => Math.min(STORY_QUESTIONS.length, existing + 1));
        setStoryQuestionIndex((existing) => Math.min(STORY_QUESTIONS.length - 1, existing + 1));
      }
      setStoryFeedback(null);
    }, correct ? 900 : 650);
  };

  const reset = () => {
    setMode('warmup');
    setSelectedPart('wings');
    setIdentified({});
    setFeedback(null);
    setFlapSpeed('stop');
    setPollinationStep(0);
    setQuestionIndex(0);
    setQuizFeedback(null);
    setStoryQuestionIndex(0);
    setStoryCorrectAnswers(0);
    setStoryFeedback(null);
  };

  const taskPart = mode === 'identify' ? identifyTarget ?? selectedPart : selectedPart;
  const taskTitle =
    mode === 'warmup'
      ? 'Get ready to flutter.'
      : mode === 'story'
        ? 'Watch the garden story.'
        : mode === 'identify'
        ? identifyTarget
          ? `Find the ${LABELS[identifyTarget].toLowerCase()}.`
          : 'You found every butterfly part.'
        : mode === 'explore'
          ? `Explore the ${LABELS[selectedPart].toLowerCase()}.`
          : mode === 'pollinate'
            ? 'Move pollen from male to female.'
            : 'Code the butterfly wings.';
  const taskText =
    mode === 'warmup'
      ? 'Watch the warmup video, then press the Story tab to begin.'
      : mode === 'story'
        ? 'Watch the video, then answer the story questions to discover what the garden needs.'
        : mode === 'identify'
        ? identifyTarget
          ? `Tap the ${LABELS[identifyTarget].toLowerCase()} on the butterfly.`
          : 'Switch to Explore, Pollinate, or Code.'
        : mode === 'explore'
          ? FACTS[selectedPart]
          : mode === 'pollinate'
            ? 'Start at the male flower, carry pollen on the butterfly, then deliver it to the female flower.'
            : 'A button means slow flap. B means stop. A+B means fast flap.';
  const foundCount = IDENTIFY_ORDER.filter((part) => identified[part]).length;
  const bannerState = feedback ?? quizFeedback ?? storyFeedback;
  const bannerMessage =
    storyFeedback === 'correct'
      ? 'Great job! Keep watching closely.'
      : storyFeedback === 'wrong'
        ? 'Try again. Use the story clue.'
        : feedback === 'correct'
      ? `Great job! You found the ${LABELS[selectedPart].toLowerCase()}.`
      : feedback === 'wrong'
        ? `Try again. Find the ${identifyTarget ? LABELS[identifyTarget].toLowerCase() : 'part'}.`
        : quizFeedback === 'correct'
          ? 'Great job! Keep learning.'
          : quizFeedback === 'wrong'
            ? 'Try again. Look carefully.'
            : mode === 'code'
              ? `Wing speed: ${flapSpeed}.`
              : mode === 'warmup'
                ? 'Warm up and get ready to flutter!'
                : mode === 'story'
                  ? 'Find out what the garden is missing.'
                : mode === 'pollinate'
                  ? pollinationStep === 0
                    ? 'Start on the male flower. Tap Move Pollen.'
                    : pollinationStep === 1
                      ? 'Pollen sticks to the butterfly as it visits the flower.'
                      : 'Pollen reaches the female flower and helps make seeds.'
                  : FACTS[selectedPart];

  const partRows = PARTS.map((part) => ({
    id: part,
    label: LABELS[part],
    active: selectedPart === part,
    done: Boolean(identified[part]),
    locked: mode === 'identify' && !identified[part] && identifyTarget !== part,
    status:
      mode === 'identify'
        ? identified[part]
          ? 'Complete'
          : identifyTarget === part
            ? 'Find'
            : 'Locked'
        : mode === 'explore'
          ? selectedPart === part
            ? 'Reading'
            : 'Explore'
          : 'Learn',
    preview: <PartPreview part={part} />,
  }));

  const trayParts = PARTS.map((part) => ({
    id: part,
    label: LABELS[part],
    active: selectedPart === part,
    preview: <PartPreview part={part} />,
  }));

  return (
    <div className="app-shell butterfly-app">
      <div className="sky-layer" />
      <MissionHeader
        score={120 + foundCount * 10}
      />
      <ModeTabs tabs={MODE_TABS} activeMode={mode} onSelect={selectMode} />

      <LessonStage>
        {mode === 'warmup' ? (
          <WarmupScreen videoUrl={lessonContent.warmupVideoUrl} />
        ) : mode === 'story' ? (
          <StoryVideoCard
            title="The Garden Needs Help"
            youtubeEmbedUrl={STORY_VIDEO_URL}
          />
        ) : (
          <ButterflyStage
            activePart={selectedPart}
            mode={mode}
            flapSpeed={flapSpeed}
            pollinationStep={pollinationStep}
            onPartSelect={selectPart}
          />
        )}
      </LessonStage>

      <aside className="task-column">
        <TaskCard
          badge="GUIDE"
          title={taskTitle}
          text={taskText}
          preview={mode === 'story' || mode === 'warmup' ? undefined : <PartPreview part={taskPart} />}
          feedback={feedback === 'wrong' ? 'wrong' : null}
          onPreviewClick={() => selectPart(taskPart)}
        >
          {mode === 'story' ? (
            <button className="primary-action" onClick={() => selectMode('identify')}>
              Start Identifying
            </button>
          ) : null}
          {mode === 'code' ? (
            <div className="code-buttons">
              <button onClick={() => setFlapSpeed('slow')}>A Slow</button>
              <button onClick={() => setFlapSpeed('stop')}>B Stop</button>
              <button onClick={() => setFlapSpeed('fast')}>A+B Fast</button>
            </div>
          ) : null}
          {mode === 'pollinate' ? (
            <button
              className="primary-action"
              onClick={() => {
                setPollinationStep((step) => (step + 1) % 3);
                setFlapSpeed('slow');
              }}
            >
              {pollinationStep === 0 ? 'Collect Pollen' : pollinationStep === 1 ? 'Deliver Pollen' : 'Reset Pollination'}
            </button>
          ) : null}
        </TaskCard>
        {mode === 'story' ? (
          <QuizCard
            prompt={storyQuestion.prompt}
            answers={storyQuestion.answers}
            indexLabel={`${storyQuestionIndex + 1}/${STORY_QUESTIONS.length}`}
            feedback={storyFeedback}
            success={storyQuestion.success}
            onAnswer={answerStoryQuestion}
          />
        ) : mode === 'warmup' ? null : (
          <QuizCard
            prompt={question.prompt}
            answers={question.answers}
            indexLabel={`${questionIndex + 1}/${QUESTIONS.length}`}
            feedback={quizFeedback}
            success={question.success}
            onAnswer={answerQuestion}
          />
        )}
        <TipCard>
          {mode === 'warmup'
            ? 'Tip: Warm bodies learn best.'
            : mode === 'story'
              ? 'Tip: Look for what the garden has and what it is missing.'
              : 'Tip: Butterflies and flowers help each other.'}
        </TipCard>
      </aside>

      <aside className="progress-column">
        {mode === 'story' ? (
          <ProgressCard done={storyCorrectAnswers} total={STORY_QUESTIONS.length} label="answered" />
        ) : mode === 'warmup' ? (
          <ProgressCard done={0} total={1} label="warmup" />
        ) : (
          <>
            <ProgressCard done={foundCount} total={IDENTIFY_ORDER.length} label="found" />
            <PartsList parts={partRows} onSelect={selectPart} />
          </>
        )}
        <button
          className="watch-button"
          onClick={() => {
            setMode('code');
            setSelectedPart('wings');
            setFlapSpeed((speed) => (speed === 'fast' ? 'stop' : 'fast'));
          }}
        >
          <span className="watch-play">PLAY</span>
          {flapSpeed === 'fast' ? 'Stop Wings' : 'Flap Wings'}
        </button>
      </aside>

      {mode === 'story' || mode === 'warmup' ? null : <PartsTray parts={trayParts} onSelect={selectPart} />}
      <FeedbackBanner message={bannerMessage} state={bannerState} />
      <div className="screen-actions">
        <button aria-label="Sound">Sound</button>
        <button aria-label="Settings">Settings</button>
      </div>
    </div>
  );
};

export default ButterflyLesson;
