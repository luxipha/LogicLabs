import React, {useRef, useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {EarthquakeMachine, machineLabels, type MachinePart} from './EarthquakeMachine';
import {ModelOrbitControls} from '../shared/ModelViewportControls';
import './earthquake.css';

export function EarthquakeIdentify({lastSelectedPart, identified, onSelect}: {
  lastSelectedPart: string | null; identified: Set<string>; onSelect: (id: string) => void;
}) {
  const [lookInside, setLookInside] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const selected = lastSelectedPart && lastSelectedPart in machineLabels ? lastSelectedPart as MachinePart : null;
  return <div className="eq-experience eq-explore" ref={root}>
    <div className="eq-toolbar">
      <strong>Meet the earthquake machine</strong>
      <button aria-pressed={!lookInside} onClick={() => setLookInside(false)}>Assembled</button>
      <button aria-pressed={lookInside} onClick={() => setLookInside(true)}>Look inside</button>
      <button onClick={() => setCameraKey(key => key + 1)}>Reset view</button>
      <button onClick={() => {if (document.fullscreenElement) void document.exitFullscreen(); else void root.current?.requestFullscreen();}}>Fullscreen</button>
    </div>
    <div className="eq-visual">
      <Canvas key={cameraKey} aria-label="Selectable 3D earthquake machine reconstructed from the build guide" frameloop="demand" dpr={1} gl={{antialias: false, powerPreference: 'low-power'}} camera={{position: [6, 4.5, 7], fov: 42}}>
        <color attach="background" args={['#eaf5fa']} /><ambientLight intensity={1.5} /><directionalLight position={[4, 7, 6]} intensity={2} />
        <EarthquakeMachine lookInside={lookInside} selected={selected} onSelect={onSelect} />
        <ModelOrbitControls dampingEnabled={false} zoomEnabled rotateEnabled target={[0, 0.7, 0]} syncInitialTarget minDistance={5} maxDistance={15} />
      </Canvas>
      {selected && <strong className="eq-layer-selection">Selected: {machineLabels[selected]}{identified.has(selected) ? ' ✓' : ''}</strong>}
      <span className="eq-caption">Drag to rotate · Scroll or pinch to zoom · Look inside lifts the platform and micro:bit for visibility · PDF-based reconstruction; dimensions approximate</span>
    </div>
  </div>;
}

/** Small illustrations avoid mounting six extra WebGL renderers in the tray. */
export function EarthquakePartPreview({part}: {part: string}) {
  return <svg viewBox="0 0 100 80" width="76" height="60" role="img" aria-label={machineLabels[part as MachinePart] ?? part}>
    {part === 'controller' && <><path d="M15 25 70 16 87 29 31 39Z" fill="#f4f5eb" stroke="#667783" /><path d="M15 25 31 39 87 29 87 58 31 70 15 56Z" fill="#cfd6d7" stroke="#667783" /><path d="M31 58 87 47 87 61 31 73Z" fill="#26384a" />{[39, 55, 71].map(x => <rect key={x} x={x} y={43 - (x-39)/5} width="11" height="15" fill="#435565" />)}</>}
    {part === 'microbit' && <><rect x="15" y="14" width="70" height="50" rx="4" fill="#1b3039" /><path d="M15 60H85V70H15Z" fill="#d4b34c" />{Array.from({length:25}, (_, i) => <rect key={i} x={36+i%5*6} y={25+Math.floor(i/5)*6} width="3" height="3" fill="#ef6570" />)}<circle cx="25" cy="30" r="5" fill="#aeb6b9" /><circle cx="75" cy="30" r="5" fill="#aeb6b9" /></>}
    {part === 'motor' && <><path d="M12 30 68 18 83 30 27 43Z" fill="#f3f4ed" stroke="#75858d" /><path d="M12 30 27 43 83 30 83 51 27 63 12 51Z" fill="#dce1dd" stroke="#75858d" /><ellipse cx="82" cy="40" rx="10" ry="14" fill="#c73642" /><rect x="8" y="37" width="12" height="12" fill="#3b4f5a" /></>}
    {part === 'gears' && <>{[{x:39,y:38,r:24},{x:72,y:55,r:15}].map(({x,y,r}) => <g key={x}>{Array.from({length:12},(_,i) => <rect key={i} x={x-3} y={y-r-3} width="6" height="10" fill="#8a969e" transform={`rotate(${i*30} ${x} ${y})`} />)}<circle cx={x} cy={y} r={r} fill="#b4bec2" stroke="#657682" strokeWidth="3" /><circle cx={x} cy={y} r={r/3} fill="#4e6574" /></g>)}</>}
    {part === 'platform' && <><path d="M10 35 65 15 92 40 37 65Z" fill="#509962" stroke="#2c6d40" strokeWidth="3" />{Array.from({length:25},(_,i) => <ellipse key={i} cx={25+i%5*10+Math.floor(i/5)*4} cy={35+Math.floor(i/5)*4-i%5*2} rx="3" ry="2" fill="#84bf82" />)}</>}
    {part === 'seats' && <>{[22,60].map(x=><g key={x}><rect x={x+6} y="46" width="8" height="24" fill="#e0bd43" /><rect x={x} y="34" width="25" height="8" fill="#286bb5" /><rect x={x} y="13" width="8" height="25" rx="2" fill="#3984cb" /><rect x={x+3} y="41" width="20" height="10" fill="#ed9b35" /></g>)}</>}
  </svg>;
}
