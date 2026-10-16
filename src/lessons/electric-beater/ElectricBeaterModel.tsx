import React, {useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import {Canvas, useFrame, useLoader, useThree, type ThreeEvent} from '@react-three/fiber';
import {Box3, Color, DoubleSide, Group, InstancedMesh, Mesh, MeshStandardMaterial, Object3D, PMREMGenerator, Vector3, type Material} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';
import {beaterHitPart, beaterMeshPart, type BeaterPart, type BeaterSpeed} from './beaterParts';

type MixerProps = {speed: BeaterSpeed; highlightedPart?: string | null; onSelect?: (part: string) => void; resetToken: number; onReady: () => void};

const MixerLighting: React.FC = () => {
  const {gl, scene, invalidate} = useThree();
  useEffect(() => {
    const room = new RoomEnvironment(), pmrem = new PMREMGenerator(gl);
    const environment = pmrem.fromScene(room, .04, .1, 100, {size: 128});
    const previous = scene.environment, intensity = scene.environmentIntensity;
    scene.environment = environment.texture; scene.environmentIntensity = .65;
    room.dispose(); pmrem.dispose(); invalidate();
    return () => { scene.environment = previous; scene.environmentIntensity = intensity; environment.dispose(); };
  }, [gl, scene, invalidate]);
  return <><ambientLight intensity={.6} /><hemisphereLight intensity={.5} groundColor="#647f91" /><directionalLight position={[4, 6, 5]} intensity={1.1} /></>;
};

const SuppliedMixer: React.FC<MixerProps> = ({speed, highlightedPart, onSelect, resetToken, onReady}) => {
  const gltf = useLoader(GLTFLoader, 'models/hand-mixer-classroom.glb');
  const {invalidate} = useThree();
  const model = useMemo(() => {
    const scene = gltf.scene.clone(true), materials: {material: MeshStandardMaterial; part: BeaterPart | null}[] = [];
    scene.traverse(object => {
      if (!(object instanceof Mesh)) return;
      const clone = (source: Material) => {
        const material = source.clone();
        if (material instanceof MeshStandardMaterial) {
          material.roughness = Math.max(material.roughness, .28);
          materials.push({material, part: beaterMeshPart(object.name)});
        }
        return material;
      };
      object.material = Array.isArray(object.material) ? object.material.map(clone) : clone(object.material);
    });
    scene.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(scene), size = bounds.getSize(new Vector3());
    const scale = 3.4 / Math.max(size.x, size.y, size.z);
    return {scene, materials, scale, offset: bounds.getCenter(new Vector3()).multiplyScalar(-scale), left: scene.getObjectByName('Beater_Left')!, right: scene.getObjectByName('Beater_Right')!};
  }, [gltf.scene]);
  useEffect(() => { onReady(); }, [model, onReady]);
  useEffect(() => () => model.materials.forEach(({material}) => material.dispose()), [model]);
  useEffect(() => {
    model.left.rotation.y = 0; model.right.rotation.y = 0; invalidate();
  }, [model, resetToken, invalidate]);
  useEffect(() => {
    model.materials.forEach(({material, part}) => {
      material.emissive.set(part && part === highlightedPart ? '#008eb5' : '#000000');
      material.emissiveIntensity = part && part === highlightedPart ? .7 : 0;
    }); invalidate();
  }, [model, highlightedPart, invalidate]);
  useFrame((state, delta) => {
    if (!speed) return;
    const angle = Math.min(delta, .05) * (speed === 1 ? 3 : 9);
    model.left.rotation.y += angle; model.right.rotation.y -= angle;
    state.invalidate();
  });
  const select = (event: ThreeEvent<MouseEvent>) => {
    if (event.delta > 5) return;
    event.stopPropagation();
    onSelect?.(beaterHitPart(event.object.name, model.scene.worldToLocal(event.point.clone()).y) ?? 'unknown');
  };
  return <group position={model.offset} scale={model.scale} dispose={null}><primitive object={model.scene} onClick={onSelect ? select : undefined} /></group>;
};

const RAW = new Color('#e9bd72'), SMOOTH = new Color('#f6dfac');
const MixingBowl: React.FC<{speed: BeaterSpeed; progress: number}> = ({speed, progress}) => {
  const surface = useRef<Group>(null), batter = useRef<MeshStandardMaterial>(null), pieces = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  useLayoutEffect(() => {
    if (!pieces.current) return;
    for (let i = 0; i < 8; i++) {
      const theta = i * Math.PI / 4, radius = i % 2 ? .67 : .4;
      dummy.position.set(Math.cos(theta) * radius, -.49, Math.sin(theta) * radius);
      dummy.updateMatrix(); pieces.current.setMatrixAt(i, dummy.matrix);
    }
    pieces.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);
  useEffect(() => { batter.current?.color.lerpColors(RAW, SMOOTH, progress); }, [progress]);
  useFrame((_, delta) => { if (speed && surface.current) surface.current.rotation.y += Math.min(delta, .05) * speed * .7; });
  return <group position={[0, -.78, .67]}>
    <mesh><sphereGeometry args={[1.18, 32, 16, 0, Math.PI*2, Math.PI/2, Math.PI/2]} /><meshStandardMaterial color="#d1e3ec" roughness={.65} transparent opacity={.55} side={DoubleSide} depthWrite={false} /></mesh>
    <mesh rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[1.18, .035, 8, 48]} /><meshStandardMaterial color="#7298ac" roughness={.5} /></mesh>
    <group ref={surface}>
      <mesh position={[0, -.52, 0]} rotation={[-Math.PI/2, 0, 0]}><circleGeometry args={[1.04, 48]} /><meshStandardMaterial ref={batter} color="#e9bd72" roughness={1} side={DoubleSide} /></mesh>
      <instancedMesh ref={pieces} args={[undefined, undefined, 8]}><sphereGeometry args={[.07, 8, 6]} /><meshStandardMaterial color="#9e6e3e" transparent opacity={1-progress} depthWrite={false} /></instancedMesh>
    </group>
  </group>;
};

const MixerCamera: React.FC<{resetToken: number; bowl: boolean}> = ({resetToken, bowl}) => {
  const {camera, size, invalidate} = useThree();
  useEffect(() => {
    if (!size.width || !size.height) return;
    const fit = Math.max(1, .95 / (size.width / size.height));
    camera.position.set(4.7*fit, 2.3*fit, 6.2*fit); camera.lookAt(0, bowl ? -.2 : 0, 0);
    camera.updateMatrixWorld(true); invalidate();
  }, [camera, size.width, size.height, resetToken, bowl, invalidate]);
  return null;
};

export const ElectricBeaterCanvas: React.FC<MixerProps & {bowl?: boolean; progress?: number; viewToken: number}> = ({bowl = false, progress = 0, viewToken, ...props}) => <Canvas
  camera={{position: [4.7, 2.3, 6.2], fov: 34, near: .05, far: 60}}
  dpr={1} frameloop="demand" gl={{antialias: false, powerPreference: 'low-power'}}
>
  <color attach="background" args={['#cbdfea']} />
  <MixerLighting /><MixerCamera resetToken={viewToken} bowl={bowl} />
  <SuppliedMixer {...props} />
  {bowl ? <MixingBowl speed={props.speed} progress={progress} /> : null}
  <ModelOrbitControls dampingEnabled={false} zoomEnabled rotateEnabled target={[0, bowl ? -.2 : 0, 0]} minDistance={3.8} maxDistance={18} syncInitialTarget />
</Canvas>;
