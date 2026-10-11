import React, {useEffect, useMemo, useRef} from 'react';
import {Canvas, useFrame, useLoader, useThree, type ThreeEvent} from '@react-three/fiber';
import type {Group} from 'three';
import {AnimationMixer, Box3, DoubleSide, Shape, Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type KitePartId = 'body' | 'tail' | 'string';
export type KiteBuildPart = 'triangle' | 'two-triangles' | 'tail' | 'string';
const HOT = '#ffdd4b';

const Material: React.FC<{color: string; hot?: boolean}> = ({color, hot}) => <meshStandardMaterial color={hot ? HOT : color} emissive={hot ? HOT : '#000'} emissiveIntensity={hot ? .45 : 0} roughness={.58} metalness={.05} side={DoubleSide} />;

// The classroom camera looks straight down the Z axis. These shapes live in
// the XY plane, keeping the kite front-facing instead of edge-on.
const bigTriangle = new Shape().moveTo(0, 1.22).lineTo(-1.12, -0.12).lineTo(0, -1.02).lineTo(1.12, -0.12).lineTo(0, 1.22);
const leftTriangle = new Shape().moveTo(0, 1.1).lineTo(-1.02, -0.08).lineTo(0, -0.06).lineTo(0, 1.1);
const rightTriangle = new Shape().moveTo(0, 1.1).lineTo(1.02, -0.08).lineTo(0, -0.06).lineTo(0, 1.1);

const KiteTail: React.FC<{hot?: boolean}> = ({hot}) => <group>{[0, .34, .68, 1.02].map((y, index) => <group key={y} position={[0, -.93 - y, 0]}><mesh rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[.24, .24, .05]} /><Material hot={hot} color={index % 2 ? '#ff9e3d' : '#f5567b'} /></mesh></group>)}</group>;
const KiteString: React.FC<{hot?: boolean}> = ({hot}) => <group>{Array.from({length: 11}, (_, index) => <mesh key={index} position={[-.05 - index * .1, -.9 - index * .09, 0]} rotation={[0, 0, -.84]}><boxGeometry args={[.018, .16, .018]} /><Material hot={hot} color="#f6f0d8" /></mesh>)}</group>;

const CodeKiteBuild: React.FC<{highlightedPart?: KitePartId | null; onPartSelect?: (part: KitePartId) => void; built: ReadonlySet<KiteBuildPart>; flying?: boolean; position?: [number, number, number]}> = ({highlightedPart = null, onPartSelect, built, flying = false, position = [0, 0, 0]}) => {
  const ref = useRef<Group>(null); const {invalidate} = useThree();
  useFrame(({clock}) => { if (!flying || !ref.current) return; ref.current.rotation.z = Math.sin(clock.elapsedTime * 2.4) * .13; ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 3) * .11; invalidate(); });
  const select = (part: KitePartId) => onPartSelect ? (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onPartSelect(part); } : undefined;
  const show = (part: KiteBuildPart) => !built || built.has(part);
  return <group ref={ref} position={position}>
    {show('triangle') ? <group onClick={select('body')}><mesh position={[0, .24, 0]}><shapeGeometry args={[bigTriangle]} /><Material hot={highlightedPart === 'body'} color="#5b6ee1" /></mesh>{show('two-triangles') ? <><mesh position={[0, .24, .025]}><shapeGeometry args={[leftTriangle]} /><Material hot={highlightedPart === 'body'} color="#fa6b8e" /></mesh><mesh position={[0, .24, .05]}><shapeGeometry args={[rightTriangle]} /><Material hot={highlightedPart === 'body'} color="#56c5b4" /></mesh></> : null}</group> : null}
    {show('tail') ? <group onClick={select('tail')}><KiteTail hot={highlightedPart === 'tail'} /></group> : null}
    {show('string') ? <group onClick={select('string')}><KiteString hot={highlightedPart === 'string'} /></group> : null}
  </group>;
};

const KITE_MODEL_URL = 'models/kite_animation.glb';
const KITE_FLIGHT_PATH_SCALE = .024;
const PART_FOR_MESH: Record<string, KitePartId> = {
  // These generic source names were classified from the inspected hierarchy
  // and bounds: Object_6 belongs to BezierCurve_0 (the string), while the
  // three mirrored lower surfaces form the tail. The rest is the body.
  Object_6: 'string', Object_8: 'tail', Object_10: 'tail', Object_12: 'tail',
};

const SuppliedKite: React.FC<{highlightedPart?: KitePartId | null; onPartSelect?: (part: KitePartId) => void; flying?: boolean; position?: [number, number, number]; identify?: boolean}> = ({highlightedPart = null, onPartSelect, flying = false, position = [0, 0, 0], identify = false}) => {
  const gltf = useLoader(GLTFLoader, KITE_MODEL_URL);
  const animation = useMemo(() => {
    const clip = gltf.animations[0]?.clone();
    const path = clip?.tracks.find((track) => track.name === 'Cube_8.position');
    if (path && path.values.length >= 3) {
      const [originX, originY, originZ] = path.values;
      for (let index = 0; index < path.values.length; index += 3) {
        path.values[index] = originX + (path.values[index] - originX) * KITE_FLIGHT_PATH_SCALE;
        path.values[index + 1] = originY + (path.values[index + 1] - originY) * KITE_FLIGHT_PATH_SCALE;
        path.values[index + 2] = originZ + (path.values[index + 2] - originZ) * KITE_FLIGHT_PATH_SCALE;
      }
    }
    return clip;
  }, [gltf.animations]);
  const model = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(clone);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    clone.position.sub(center);
    clone.scale.setScalar(3.35 / Math.max(size.x, size.y, size.z));
    clone.traverse((object) => {
      if (!('isMesh' in object) || !(object as {isMesh?: boolean}).isMesh) return;
      const mesh = object as typeof object & {material: import('three').MeshStandardMaterial};
      if (!Array.isArray(mesh.material)) mesh.material = mesh.material.clone();
    });
    return clone;
  }, [gltf.scene]);
  const mixer = useMemo(() => new AnimationMixer(model), [model]);
  const {invalidate} = useThree();
  useEffect(() => { const action = animation ? mixer.clipAction(animation) : null; if (flying) action?.reset().play(); return () => { action?.stop(); mixer.stopAllAction(); }; }, [animation, flying, mixer]);
  useEffect(() => { model.traverse((object) => { if (!('isMesh' in object) || !(object as {isMesh?: boolean}).isMesh) return; const mesh = object as typeof object & {material: import('three').MeshStandardMaterial}; const part = PART_FOR_MESH[mesh.name] ?? 'body'; if (!Array.isArray(mesh.material)) { mesh.material.emissive.set(part === highlightedPart ? HOT : '#000000'); mesh.material.emissiveIntensity = part === highlightedPart ? .42 : 0; } }); }, [highlightedPart, model]);
  useFrame((_, delta) => { if (!flying) return; mixer.update(delta); invalidate(); });
  const select = (event: ThreeEvent<MouseEvent>) => { const part = PART_FOR_MESH[event.object.name] ?? 'body'; event.stopPropagation(); onPartSelect?.(part); };
  return <group position={position}><primitive object={model} onClick={onPartSelect ? select : undefined} /></group>;
};

export const KiteModel: React.FC<{highlightedPart?: KitePartId | null; onPartSelect?: (part: KitePartId) => void; built?: ReadonlySet<KiteBuildPart>; flying?: boolean; position?: [number, number, number]; identify?: boolean}> = (props) => props.built ? <CodeKiteBuild {...props} built={props.built} /> : <SuppliedKite {...props} />;

export const KiteScene: React.FC<{highlightedPart?: KitePartId | null; onPartSelect?: (part: KitePartId) => void; built?: ReadonlySet<KiteBuildPart>; flying?: boolean; position?: [number, number, number]; game?: boolean; identify?: boolean}> = (props) => <>
  <color attach="background" args={[props.game ? '#7cccf2' : '#d9f0fb']} /><ambientLight intensity={1.2} /><hemisphereLight intensity={.9} groundColor="#82bc77" /><directionalLight position={[4, 7, 5]} intensity={1.3} />
  {props.game ? <mesh position={[0, -2.15, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[16, 12]} /><meshStandardMaterial color="#9bd27e" roughness={.94} /></mesh> : null}
  {props.game ? <>{[-2.8, 0, 2.8].map((x) => <mesh key={x} position={[x, .95, -.2]}><sphereGeometry args={[.18, 14, 12]} /><meshStandardMaterial color="#ffdb4b" emissive="#c89413" emissiveIntensity={.4} /></mesh>)}</> : null}
  <KiteModel {...props} />
</>;

export const KiteCanvas: React.FC<React.ComponentProps<typeof KiteScene> & {animated?: boolean}> = ({animated = false, ...props}) => {
  const identify = Boolean(props.identify);
  return <Canvas className="kite-canvas" camera={{position: identify ? [0, -.45, 7.7] : [0, 1.1, 7.7], fov: 34}} dpr={1} frameloop={animated ? 'always' : 'demand'} gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}><KiteScene {...props} position={identify ? [2.6, 0, 0] : props.position} flying={animated || props.flying} /><ModelOrbitControls zoomEnabled rotateEnabled={!identify} dampingEnabled={false} target={identify ? [0, -1.65, 0] : [0, -.1, 0]} minDistance={5.5} maxDistance={11} syncInitialTarget={identify} /></Canvas>;
};
