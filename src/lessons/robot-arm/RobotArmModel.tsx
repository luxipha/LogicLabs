import React, {Component, Suspense, useEffect, useMemo} from 'react';
import {Canvas, useLoader, useThree, type ThreeEvent} from '@react-three/fiber';
import {AnimationMixer, Mesh, MeshStandardMaterial} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';
export const ARM_DURATION = 8.333333;
// Verified against isolated mesh renders of this supplied model. The original
// export uses generic Object_N names and flat animated parents, not a joint rig.
const BASE = new Set([62,64,124]);
const JOINTS = new Set([88,90,92,94,96,98,100,102,104,106,108,110,112,114,116,118,120,122,128,130]);
export function armPart(name: string) {
 const id = Number(name.replace('Object_',''));
 return BASE.has(id) ? 'base' : id >= 4 && id <= 60 ? 'gripper' : JOINTS.has(id) ? 'joints' : 'arm';
}
const TARGET: [number,number,number] = [0, .78, .05];
// Bounds sampled across the complete clip reach 2.06 units high. Keep its
// full range in view during playback, while Identify uses a closer view.
const MOTION_TARGET: [number,number,number] = [.016,1.03,.429];
const Camera: React.FC<{motion:boolean}> = ({motion}) => {
 const {camera,size,invalidate}=useThree();
 useEffect(()=>{camera.position.set(...(motion?[3.2,2.9,4.5]:[1.8,1.8,2.4]) as [number,number,number]).multiplyScalar(Math.max(1,.85/(size.width/size.height)));camera.lookAt(...(motion?MOTION_TARGET:TARGET));camera.updateProjectionMatrix();invalidate();},[camera,size.width,size.height,invalidate,motion]);
 return null;
};
class Boundary extends Component<{children: React.ReactNode; onFailure:()=>void},{failed:boolean}> {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(){this.props.onFailure();}
 render(){return this.state.failed?<p role="alert">The 3D arm could not load. Reload the lesson to try again.</p>:this.props.children;}
}
type ModelProps={time:number;selected:string|null;onSelect?:(part:string)=>void;onReady:()=>void};
const Arm:React.FC<ModelProps>=({time,selected,onSelect,onReady})=>{
 const gltf=useLoader(GLTFLoader,'models/robotic-arm-classroom.glb');
 const {scene,mixer,materials}=useMemo(()=>{
  const scene=gltf.scene.clone(true),materials:MeshStandardMaterial[]=[];
  scene.traverse(o=>{if(o instanceof Mesh){const source=o.material as MeshStandardMaterial;const material=source.clone();o.material=material;materials.push(material);o.userData.part=armPart(o.name);}});
  const mixer=new AnimationMixer(scene);return{scene,mixer,materials};
 },[gltf]);
 const {invalidate}=useThree();
 // Each rendered pose follows the lesson's playback clock, including scrubbing.
 useEffect(()=>{mixer.setTime(time);invalidate();},[time,mixer,invalidate]);
 useEffect(()=>{scene.traverse(o=>{if(o instanceof Mesh){const material=o.material as MeshStandardMaterial;material.emissive.set(o.userData.part===selected?'#bf801d':'#000000');material.emissiveIntensity=o.userData.part===selected?.7:0;}});invalidate();},[scene,selected,invalidate]);
 // React StrictMode runs setup -> cleanup -> setup on mount. Bind and start
 // the clip here so cleanup cannot leave a cached mixer with no active action.
 useEffect(()=>{
  mixer.clipAction(gltf.animations[0]).reset().play();
  mixer.setTime(time);
  invalidate();
  onReady();
  return()=>{mixer.stopAllAction();mixer.uncacheRoot(scene);materials.forEach(m=>m.dispose());};
 },[gltf,onReady,mixer,scene,materials,invalidate]);
 const select=(event:ThreeEvent<MouseEvent>)=>{if(!onSelect||event.delta>5)return;const part=event.object.userData.part;if(part){event.stopPropagation();onSelect(part);}};
 return <primitive object={scene} onClick={select} dispose={null}/>;
};
export const RobotArmModel:React.FC<ModelProps&{view:number;onFailure:()=>void}>=({view,onFailure,...props})=><Boundary onFailure={onFailure}><Canvas key={view} dpr={1} frameloop="demand" camera={{fov:38}} gl={{antialias:false,powerPreference:'low-power'}}>
 <color attach="background" args={['#dcebf0']}/><ambientLight intensity={1.5}/><hemisphereLight intensity={2} groundColor="#879aa4"/><directionalLight position={[4,7,5]} intensity={3}/><directionalLight position={[-4,2,-3]} intensity={2}/>
 <Suspense fallback={null}><Arm {...props}/></Suspense><Camera motion={!props.onSelect}/><ModelOrbitControls dampingEnabled={false} zoomEnabled rotateEnabled target={props.onSelect?TARGET:MOTION_TARGET} minDistance={1.8} maxDistance={10} syncInitialTarget/>
</Canvas></Boundary>;
export const RobotArmPreview:React.FC<{part:string}>=({part})=><svg viewBox="0 0 100 64" aria-hidden="true">{part==='base'?<><ellipse cx="50" cy="49" rx="31" ry="10" fill="#25292d"/><path d="M32 45V18H68V45" fill="#3d444a"/></>:part==='gripper'?<><rect x="37" y="8" width="26" height="20" rx="4" fill="#444c54"/><path d="M37 25L22 42L27 55H36L33 43L45 33M63 25L78 42L73 55H64L67 43L55 33" fill="#78858c"/></>:part==='joints'?<><circle cx="50" cy="32" r="25" fill="#343a40"/><circle cx="50" cy="32" r="17" fill="#172028"/><circle cx="50" cy="32" r="15" fill="none" stroke="#72d1d1" strokeWidth="2"/></>:<><path d="M18 47L43 13L57 23L32 57" fill="#30383e"/><path d="M44 14L85 29L79 43L38 28" fill="#a44724"/><circle cx="46" cy="23" r="11" fill="#343a40"/></>}</svg>;
