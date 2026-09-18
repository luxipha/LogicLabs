import React, {useMemo, useRef} from 'react';
import {Canvas, useFrame, useLoader, type ThreeEvent} from '@react-three/fiber';
import {Box3, DoubleSide, Group, MathUtils, Mesh, MeshBasicMaterial, Object3D, SphereGeometry, Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type SoccerPartId = 'goalkeeper' | 'goal' | 'ball';

const TARGET_SIZE = 7;
const PART_COLORS: Record<SoccerPartId, string> = {
  goalkeeper: '#ffca42',
  goal: '#62d7ff',
  ball: '#ffffff',
};

const meshPart = (mesh: Object3D): SoccerPartId | null => {
  const names: string[] = [];
  let current: Object3D | null = mesh;
  while (current) {
    names.push(current.name.toLowerCase());
    current = current.parent;
  }
  const name = names.join(' ');
  if (name.includes('net_lapangan') || name.includes('net lapangan')) return 'goal';
  if (name.includes('bola')) return 'ball';
  if (/body|helm|sarung tangan|sepatu|kaus kaki|baju|mata/.test(name)) return 'goalkeeper';
  return null;
};

const GoalkeeperScene: React.FC<{
  highlightedPart: SoccerPartId | null;
  mode: string;
  blocking: boolean;
  onPartSelect: (part: SoccerPartId) => void;
  onFinish: () => void;
}> = ({highlightedPart, mode, blocking, onPartSelect, onFinish}) => {
  const gltf = useLoader(GLTFLoader, 'models/goalkeeper-optimized.glb');
  const finished = useRef(false);

  const model = useMemo(() => {
    const visual = gltf.scene.clone(true);
    visual.updateMatrixWorld(true);
    const visibleBox = new Box3();
    visual.traverse((child) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      const part = meshPart(mesh);
      mesh.userData.part = part;
      mesh.visible = part !== null;
      if (part) visibleBox.expandByObject(mesh);
    });
    // These are sibling model branches in the supplied asset. Re-parenting
    // them lets Activity move the goalkeeper without dragging the goal/net.
    visual.updateMatrixWorld(true);
    const goalkeeperMover = new Group();
    visual.add(goalkeeperMover);
    for (const name of ['Body', 'Sepatu + Kaus Kaki', 'Helm', 'Sarung Tangan', 'Baju', 'Mata']) {
      const branch = visual.getObjectByName(name);
      if (branch) goalkeeperMover.attach(branch);
    }
    const center = new Vector3();
    const size = new Vector3();
    visibleBox.getCenter(center);
    visibleBox.getSize(size);
    const scale = TARGET_SIZE / Math.max(size.x, size.y, size.z, 1);
    visual.scale.setScalar(scale);
    visual.position.set(-center.x * scale, -center.y * scale - 1.25, -center.z * scale);
    visual.userData.goalkeeperMover = goalkeeperMover;
    return visual;
  }, [gltf.scene]);

  const highlight = useMemo(() => {
    if (!highlightedPart) return null;
    const overlay = new Group();
    model.updateMatrixWorld(true);
    model.traverse((child) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh || mesh.userData.part !== highlightedPart) return;
      const copy = new Mesh(mesh.geometry, new MeshBasicMaterial({
        color: PART_COLORS[highlightedPart], transparent: true, opacity: 0.56,
        depthTest: false, depthWrite: false, side: DoubleSide,
      }));
      copy.matrix.copy(mesh.matrixWorld);
      copy.matrixAutoUpdate = false;
      copy.raycast = () => undefined;
      copy.renderOrder = 2;
      overlay.add(copy);
    });
    return overlay.children.length ? overlay : null;
  }, [highlightedPart, model]);

  useFrame((state, delta) => {
    const goalkeeperMover = model.userData.goalkeeperMover as Group | undefined;
    if (!goalkeeperMover) return;
    const targetX = blocking ? 0.85 : 0;
    goalkeeperMover.position.x = MathUtils.damp(goalkeeperMover.position.x, targetX, 3.1, delta);
    if (blocking) {
      goalkeeperMover.rotation.z = Math.sin(state.clock.elapsedTime * 8) * 0.025;
      if (!finished.current && Math.abs(goalkeeperMover.position.x - targetX) < 0.03) {
        finished.current = true;
        onFinish();
      }
    } else {
      goalkeeperMover.rotation.z = 0;
      finished.current = false;
    }
  });

  const selectPart = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const part = event.object.userData.part as SoccerPartId | null;
    if (part) onPartSelect(part);
  };

  return (
    <group>
      {mode === 'activity' ? (
        <>
          <mesh position={[0, -1.34, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[15, 10]} />
            <meshStandardMaterial color="#5cb64c" roughness={1} />
          </mesh>
          <mesh position={[-3.6, -1.3, 2.2]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.03, 0.09, 24]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-3.55, -1.06, 2.2]}>
            <sphereGeometry args={[0.24, 16, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
        </>
      ) : null}
      <group onClick={mode === 'identify' ? selectPart : undefined}>
        <primitive object={model} />
      </group>
      {highlight ? <primitive object={highlight} /> : null}
    </group>
  );
};

export const SoccerGoalkeeperCanvas: React.FC<{
  highlightedPart: SoccerPartId | null;
  mode: string;
  blocking: boolean;
  onPartSelect: (part: SoccerPartId) => void;
  onFinish: () => void;
}> = (props) => (
  <Canvas
    camera={{position: [8.5, 4.7, 10], fov: 32, near: 0.1, far: 100}}
    dpr={1}
    frameloop={props.mode === 'activity' && props.blocking ? 'always' : 'demand'}
    gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}
  >
    <color attach="background" args={['#91d8f2']} />
    <ambientLight intensity={1.15} />
    <hemisphereLight intensity={0.9} groundColor="#4d9a40" />
    <directionalLight position={[6, 8, 5]} intensity={1.6} />
    <GoalkeeperScene {...props} />
    <ModelOrbitControls dampingEnabled={false} zoomEnabled={props.mode !== 'activity'} rotateEnabled={props.mode !== 'activity'} target={[0, 0, 0]} minDistance={5} maxDistance={14} />
  </Canvas>
);
