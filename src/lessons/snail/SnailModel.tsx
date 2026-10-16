import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from '@react-three/fiber';
import { AnimationMixer, Box3, Group, Mesh, MeshStandardMaterial, Shape, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ModelOrbitControls } from '../shared/ModelViewportControls';
import { SNAIL_MARKERS, snailHitPart } from './snailParts';
type Props = {
    playing: boolean;
    mode: string;
    step: number;
    moveToken: number;
    resetToken: number;
    selected: string | null;
    onSelect: (part: string) => void;
    onReady: () => void;
    onSettled: () => void;
};
const Snail: React.FC<Props> = ({ playing, mode, step, moveToken, resetToken, selected, onSelect, onReady, onSettled }) => {
    const gltf = useLoader(GLTFLoader, 'models/snail-classroom.glb'), { invalidate } = useThree();
    const model = useMemo(() => { const scene = gltf.scene.clone(true), materials: MeshStandardMaterial[] = []; scene.traverse(o => { if (o instanceof Mesh) {
        o.material = (o.material as MeshStandardMaterial).clone();
        (o.material as MeshStandardMaterial).roughness = .7;
        materials.push(o.material as MeshStandardMaterial);
    } }); scene.updateMatrixWorld(true); const bounds = new Box3().setFromObject(scene), size = bounds.getSize(new Vector3()); return { scene, materials, center: bounds.getCenter(new Vector3()), height: size.y, scale: 3.2 / Math.max(size.x, size.y, size.z), mixer: new AnimationMixer(scene) }; }, [gltf]);
    const moving = useRef(0), position = useRef(0), root = useRef<Group>(null), target = mode === 'activity' ? -1.35 + step * .54 : 0;
    const targetRef = useRef(target);
    targetRef.current = target;
    useEffect(() => { const clip = gltf.animations[0]; if (clip)
        model.mixer.clipAction(clip).play(); onReady(); return () => { model.mixer.stopAllAction(); model.mixer.uncacheRoot(model.scene); model.materials.forEach(m => m.dispose()); }; }, [model, gltf, onReady]);
    useEffect(() => { model.mixer.setTime(0); moving.current = 0; position.current = targetRef.current; invalidate(); }, [model, resetToken, mode, invalidate]);
    useEffect(() => { if (mode === 'activity' && moveToken) {
        moving.current = .8;
        invalidate();
    } }, [moveToken, mode, invalidate]);
    useEffect(() => { invalidate(); }, [playing, target, selected, invalidate]);
    useFrame((state, delta) => { const dt = Math.min(delta, .05); if (playing || moving.current > 0) {
        model.mixer.update(dt);
        if (moving.current > 0) {
            moving.current = Math.max(0, moving.current - dt);
            position.current += (target - position.current) * Math.min(1, dt * 9);
            if (!moving.current) {
                position.current = target;
                onSettled();
            }
        }
        state.invalidate();
    } if (root.current)
        root.current.position.x = mode === 'activity' ? position.current : 0; });
    const select = (e: ThreeEvent<MouseEvent>) => { if (e.delta > 5 || mode !== 'identify')
        return; e.stopPropagation(); const point = model.scene.worldToLocal(e.point.clone()); onSelect(snailHitPart(point.y, point.z) ?? 'unknown'); };
    const scale = mode === 'activity' ? model.scale * .5 : model.scale;
    return <group ref={root} position={[0, mode === 'activity' ? model.height * scale / 2 - .79 : 0, 0]} rotation={[0, mode === 'activity' ? Math.PI / 2 : 0, 0]}><group scale={scale} position={model.center.clone().multiplyScalar(-scale)} dispose={null}>
  <primitive object={model.scene} onClick={select}/>
  {mode === 'identify' ? SNAIL_MARKERS.map(({ part, position }) => <mesh key={part} position={position} onClick={e => { if (e.delta > 5)
        return; e.stopPropagation(); onSelect(part); }}><sphereGeometry args={[.035, 16, 12]}/><meshStandardMaterial color={selected === part ? '#ffcf3e' : '#379a58'} emissive={selected === part ? '#aa7900' : '#155529'} emissiveIntensity={.4} depthTest={false}/></mesh>) : null}
 </group></group>;
};
const Camera: React.FC<{
    token: number;
    activity: boolean;
}> = ({ token, activity }) => { const { camera, size, invalidate } = useThree(); useEffect(() => { const fit = Math.max(1, 1.15 / (size.width / size.height)); camera.position.set(5, 3.1, 6).multiplyScalar(fit * (activity ? 1.05 : .85)); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix(); invalidate(); }, [camera, size.width, size.height, token, activity, invalidate]); return null; };
const leaf = new Shape();
leaf.moveTo(0, -.55); leaf.quadraticCurveTo(.5, -.2, 0, .55); leaf.quadraticCurveTo(-.5, .2, 0, -.55);
const Garden: React.FC = () => <group position={[0, -.79, 0]}>
 <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[5, 2.7]}/><meshStandardMaterial color="#abc580" roughness={1}/></mesh>
 {[0, 1, 2, 3, 4].map(i => <mesh key={i} position={[-1.08 + i * .54, .012, .18]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.17, 20]}/><meshStandardMaterial color="#6c9274" roughness={1}/></mesh>)}
 <mesh position={[1.75, .025, 0]} rotation={[-Math.PI / 2, 0, -.4]} scale={[.6, 1, 1]}><shapeGeometry args={[leaf]}/><meshStandardMaterial color="#3f862f" roughness={1}/></mesh>
</group>;
export const SnailCanvas: React.FC<Props & {
    viewToken: number;
}> = ({ viewToken, ...props }) => <Canvas dpr={1} frameloop="demand" camera={{ position: [5, 3.1, 6], fov: 35 }} gl={{ antialias: false, powerPreference: 'low-power' }}>
 <ambientLight intensity={1.4}/><hemisphereLight intensity={1} groundColor="#6d8154"/><directionalLight position={[4, 7, 5]} intensity={1.5}/>
 <Camera token={viewToken} activity={props.mode === 'activity'}/><Snail {...props}/>{props.mode === 'activity' ? <Garden /> : null}
 <ModelOrbitControls dampingEnabled={false} zoomEnabled rotateEnabled target={[0, 0, 0]} minDistance={3} maxDistance={18}/>
</Canvas>;
