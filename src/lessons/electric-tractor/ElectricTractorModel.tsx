import React, {useMemo, useRef} from 'react';
import {Canvas, useFrame, useLoader, type ThreeEvent} from '@react-three/fiber';
import {Box3, BufferGeometry, DoubleSide, Group, MathUtils, Mesh, MeshBasicMaterial, Object3D, Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type ElectricTractorPartId = 'cab' | 'wheels' | 'hitch' | 'trailer';

const TARGET_LENGTH = 7.1;
const HIGHLIGHT_COLOR = '#ffdf46';

const partFromBounds = (geometry: BufferGeometry): ElectricTractorPartId => {
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  if (!bounds) return 'wheels';
  const center = new Vector3();
  bounds.getCenter(center);

  // The original model uses X for its length and Z for height. The trailer is
  // at the positive end; the narrow connector between the two is the hitch.
  if (center.x > 5.4) return 'trailer';
  if (center.x > 3.4) return 'hitch';
  if (bounds.max.z > 4.25) return 'cab';
  return 'wheels';
};

const makeBakedMesh = (source: Mesh, geometry: BufferGeometry, part: ElectricTractorPartId) => {
  const mesh = new Mesh(geometry, source.material);
  mesh.name = source.name;
  mesh.userData.part = part;
  mesh.frustumCulled = false;
  return mesh;
};

const Field: React.FC = () => (
  <group>
    <mesh position={[0, -1.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[26, 16]} />
      <meshStandardMaterial color="#6ea843" roughness={1} />
    </mesh>
    {[-4, -2, 0, 2, 4].map((z) => (
      <mesh key={z} position={[0, -1.67, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[26, 0.16]} />
        <meshBasicMaterial color="#8b623d" />
      </mesh>
    ))}
  </group>
);

export const ElectricTractorModel: React.FC<{
  highlightedPart: ElectricTractorPartId | null;
  mode: string;
  driving: boolean;
  onPartSelect: (part: ElectricTractorPartId) => void;
  onFinish: () => void;
}> = ({highlightedPart, mode, driving, onPartSelect, onFinish}) => {
  const gltf = useLoader(GLTFLoader, 'models/electric-tractor.glb');
  const vehicleRef = useRef<Group>(null);
  const finished = useRef(false);

  const model = useMemo(() => {
    const source = gltf.scene.clone(true);
    source.updateMatrixWorld(true);
    const baked = new Group();
    const visibleBox = new Box3();

    source.traverse((child: Object3D) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      const geometry = mesh.geometry.clone();
      const rawPart = partFromBounds(mesh.geometry);
      geometry.applyMatrix4(mesh.matrixWorld);
      geometry.computeVertexNormals();
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      baked.add(makeBakedMesh(mesh, geometry, rawPart));
      if (geometry.boundingBox) visibleBox.union(geometry.boundingBox);
    });

    const box = visibleBox.isEmpty() ? new Box3().setFromObject(baked) : visibleBox;
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);
    const scale = TARGET_LENGTH / Math.max(size.x, size.y, size.z);
    baked.scale.setScalar(scale);
    baked.position.set(-center.x * scale, -center.y * scale - 0.2, -center.z * scale);
    return baked;
  }, [gltf.scene]);

  const highlight = useMemo(() => {
    if (!highlightedPart) return null;
    const overlay = new Group();
    overlay.scale.copy(model.scale);
    overlay.position.copy(model.position);
    overlay.rotation.copy(model.rotation);
    model.children.forEach((child) => {
      if (!(child instanceof Mesh) || child.userData.part !== highlightedPart) return;
      const mesh = new Mesh(child.geometry, new MeshBasicMaterial({
        color: HIGHLIGHT_COLOR,
        transparent: true,
        opacity: 0.6,
        depthTest: false,
        depthWrite: false,
        side: DoubleSide,
      }));
      mesh.renderOrder = 2;
      mesh.raycast = () => undefined;
      overlay.add(mesh);
    });
    return overlay.children.length ? overlay : null;
  }, [highlightedPart, model]);

  useFrame((state, delta) => {
    if (!vehicleRef.current) return;
    const target = driving ? 3.7 : 0;
    vehicleRef.current.position.x = MathUtils.damp(vehicleRef.current.position.x, target, 1.8, delta);
    if (driving) {
      vehicleRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.018;
      state.invalidate();
      if (!finished.current && Math.abs(vehicleRef.current.position.x - target) < 0.035) {
        finished.current = true;
        onFinish();
      }
    } else {
      vehicleRef.current.rotation.z = 0;
      finished.current = false;
    }
  });

  const selectPart = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const part = (event.object.userData as {part?: ElectricTractorPartId}).part;
    if (part) onPartSelect(part);
  };

  return (
    <group>
      {mode === 'activity' ? <Field /> : null}
      <group ref={vehicleRef} onClick={mode === 'identify' ? selectPart : undefined}>
        <primitive object={model} />
      </group>
      {highlight ? <primitive object={highlight} /> : null}
    </group>
  );
};

export const ElectricTractorCanvas: React.FC<{
  highlightedPart: ElectricTractorPartId | null;
  mode: string;
  driving: boolean;
  onPartSelect: (part: ElectricTractorPartId) => void;
  onFinish: () => void;
}> = (props) => (
  <Canvas
    camera={{position: [7.8, 4.6, 9.2], fov: 32, near: 0.1, far: 100}}
    dpr={1}
    frameloop={props.mode === 'activity' && props.driving ? 'always' : 'demand'}
    gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}
  >
    <color attach="background" args={['#a8d9f3']} />
    <ambientLight intensity={1.05} />
    <hemisphereLight intensity={1.1} groundColor="#507b31" />
    <directionalLight position={[6, 8, 5]} intensity={1.55} />
    <ElectricTractorModel {...props} />
    <ModelOrbitControls dampingEnabled={false} zoomEnabled={props.mode !== 'activity'} rotateEnabled={props.mode !== 'activity'} target={[0, 0, 0]} minDistance={5} maxDistance={14} />
  </Canvas>
);
