import React, {useMemo, useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ModelOrbitControls} from '../shared/ModelViewportControls';
import './mudslide-stages.css';

type Part = 'ramp' | 'gears' | 'motor' | 'controller' | 'material';
export const mudslideLabels: Record<Part, string> = {ramp: 'Mudslide ramp', gears: 'Gear train', motor: 'Motor', controller: 'micro:bit controller', material: 'Mudslide pieces'};
const Box = ({args, children, ...props}: any) => <mesh {...props}><boxGeometry args={args}/>{children}</mesh>;
const Cylinder = ({args, children, ...props}: any) => <mesh {...props}><cylinderGeometry args={args}/>{children}</mesh>;
const material = (color: string, selected: boolean) => <meshStandardMaterial color={color} emissive={selected ? '#ffd34f' : '#000000'} />;
function Machine({selected, onSelect, release = 0, slope = 34}: {selected?: Part | null; onSelect?: (part: Part) => void; release?: number; slope?: number}) {
  const rocks = useMemo(() => Array.from({length: 9}, (_, i) => [-.9+(i%3)*.42,.12+Math.floor(i/3)*.16,-.35+Math.floor(i/3)*.34]), []);
  const select=(part:Part)=>(event: {stopPropagation():void})=>{event.stopPropagation();onSelect?.(part);};
  return <group rotation={[0,-.55,0]}>
    <Box args={[5.4,.16,3.8]} position={[0,-.15,0]}>{material('#3e9b4c',false)}</Box>
    <Box args={[.3,1.7,2.3]} position={[-1.75,.75,.25]} onClick={select('gears')}>{material('#202b32',selected==='gears')}</Box>
    {[[-1.92,.5],[-1.56,.32],[-1.3,.18]].map(([x,r],i)=><Cylinder key={i} args={[r,r,.16,16]} rotation={[Math.PI/2,0,0]} position={[x,.62,-.95]} onClick={select('gears')}>{material('#b8bdc0',selected==='gears')}</Cylinder>)}
    <group rotation={[0,0,-slope*Math.PI/180]} position={[.48,.55,.1]}>
      <Box args={[2.6,.18,2]} position={[0,.05,0]} onClick={select('ramp')}>{material('#1e2932',selected==='ramp')}</Box><Box args={[2.6,.26,.12]} position={[0,.22,-.98]}>{material('#a8afb3',false)}</Box><Box args={[2.6,.26,.12]} position={[0,.22,.98]}>{material('#a8afb3',false)}</Box>
      {rocks.map(([x,y,z],i)=><Box key={i} args={[.28,.2,.26]} position={[x+release*2.3,y,z]} onClick={select('material')}>{material(i%2?'#e9782d':'#efb13d',selected==='material')}</Box>)}
    </group>
    <Box args={[.68,1.7,.9]} position={[-1.65,1.2,.82]} onClick={select('motor')}>{material('#f0f1eb',selected==='motor')}</Box>
    <Box args={[1.38,.5,1.05]} position={[2.2,.35,.35]} onClick={select('controller')}>{material('#f5f4ee',selected==='controller')}</Box><Box args={[.78,.06,.62]} position={[1.82,.64,.35]} rotation={[-.12,0,0]}>{material('#18262d',false)}</Box>
  </group>;
}
function View(props: {selected?: Part | null; onSelect?: (part: Part) => void; release?: number; slope?: number}) {return <Canvas dpr={1} camera={{position:[6,4.5,7],fov:42}}><color attach="background" args={['#e7f5fb']}/><ambientLight intensity={1.7}/><directionalLight position={[5,7,6]} intensity={2}/><Machine {...props}/><ModelOrbitControls dampingEnabled={false} zoomEnabled rotateEnabled target={[0,.5,0]} syncInitialTarget minDistance={5} maxDistance={13}/></Canvas>;}
export function MudslideIdentify({lastSelectedPart, identified, onSelect}: {lastSelectedPart:string|null;identified:Set<string>;onSelect:(id:string)=>void}) {const selected=lastSelectedPart&&lastSelectedPart in mudslideLabels?lastSelectedPart as Part:null;return <section className="mudslide-stage"><header><strong>Find the mudslide machine parts</strong><span>Tap a part, then name it.</span></header><div className="mudslide-canvas"><View selected={selected} onSelect={onSelect}/>{selected&&<b className="mudslide-selected">{mudslideLabels[selected]} {identified.has(selected)?'✓':''}</b>}<small>Drag to rotate · Scroll or pinch to zoom · PDF-based reconstruction</small></div></section>;}
export function MudslideExplore(){return <section className="mudslide-stage"><header><strong>Explore the mudslide model</strong><span>Look for the ramp, gear train and controller.</span></header><div className="mudslide-canvas"><View/><small>Drag to rotate · Scroll or pinch to zoom</small></div></section>;}
export function MudslideActivity({completeActivity,resetActivity}:{completeActivity:()=>void;resetActivity:()=>void}){const[slope,setSlope]=useState(34),[release,setRelease]=useState(0);return <section className="mudslide-stage"><header><strong>Make a mudslide</strong><span>Change the slope, then release the material.</span></header><div className="mudslide-canvas"><View slope={slope} release={release}/><small>{release?'The pieces slide down the ramp.':'Choose a slope, then release the pieces.'}</small></div><div className="mudslide-controls"><label>Ramp slope: <output>{slope}°</output><input type="range" min="15" max="55" value={slope} onChange={e=>{setSlope(Number(e.target.value));setRelease(0);}}/></label><button onClick={()=>{setRelease(1);completeActivity();}} disabled={Boolean(release)}>Release mudslide</button><button onClick={()=>{setRelease(0);resetActivity();}}>Reset</button></div></section>;}
