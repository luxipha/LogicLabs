import React, {Component, Suspense, useMemo, useRef, useState} from 'react';
import {Canvas, useLoader} from '@react-three/fiber';
import {Box3, Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';
import './tricycle.css';

const labels: Record<string, string> = {wheels: 'Wheels', pedals: 'Pedals', handlebars: 'Handlebars', seat: 'Seat'};
export function TricyclePreview({part}: {part: string}) {
  return <svg viewBox="0 0 100 64" width="76" height="48" aria-label={labels[part]}>
    {part === 'wheels' ? <g fill="none" stroke="#34465c" strokeWidth="6"><circle cx="25" cy="35" r="16"/><circle cx="72" cy="35" r="21"/></g> : part === 'seat' ? <path d="M15 23 Q50 8 85 23 L75 38 H25Z" fill="#e45b4b"/> : part === 'handlebars' ? <path d="M12 18 H35 L50 36 L65 18 H88 M50 36 V57" fill="none" stroke="#158488" strokeWidth="8" strokeLinecap="round"/> : <g fill="none" stroke="#d18a19" strokeWidth="7"><path d="M20 45 H40 L60 20 H80"/><circle cx="50" cy="32" r="6"/></g>}
  </svg>;
}

/** Side-view teaching diagram: rear wheels are offset so all three remain countable. */
function Diagram({onSelect, selected, turns = 0}: {onSelect?: (part: string) => void; selected?: string | null; turns?: number}) {
  const part = (id: string, children: React.ReactNode) => <g role={onSelect ? 'button' : undefined} tabIndex={onSelect ? 0 : undefined} aria-label={labels[id]} onClick={() => onSelect?.(id)} onKeyDown={e => {if (e.key === 'Enter' || e.key === ' ') {e.preventDefault(); onSelect?.(id);}}} className={onSelect ? 'tricycle-target' : ''} style={{filter: selected === id ? 'drop-shadow(0 0 7px #f5a623)' : undefined}}>{children}</g>;
  return <svg className="tricycle-diagram" viewBox="0 0 700 430" aria-label="Tricycle parts diagram, showing one front wheel and two rear wheels">
    <path d="M70 345 H630" stroke="#c2d9d8" strokeWidth="4"/>
    <g fill="none" stroke="#24a1a0" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round"><path d="M210 285 L295 220 L420 285 L490 155 M295 220 L280 175 M420 285 L510 285"/></g>
    {part('wheels', <g fill="#eff8f7" stroke="#34465c" strokeWidth="13">{[[178,267,53],[230,290,53],[510,285,70]].map(([x,y,r],i) => <g key={i}><circle cx={x} cy={y} r={r}/><g transform={`rotate(${turns * 60},${x},${y})`} strokeWidth="4"><path d={`M${x-r+10} ${y}H${x+r-10} M${x} ${y-r+10}V${y+r-10}`}/></g><circle cx={x} cy={y} r="7" fill="#f5bc42" strokeWidth="2"/></g>)}</g>)}
    {part('seat', <path d="M237 158 Q275 137 320 157 L310 179 H249Z" fill="#e45b4b" stroke="#aa3c36" strokeWidth="4"/>)}
    {part('handlebars', <g fill="none" stroke="#158488" strokeWidth="13" strokeLinecap="round"><path d="M490 155 L472 105 H434 M472 105 L506 84 H541"/><path d="M424 105 H447 M532 84 H554" stroke="#34465c" strokeWidth="17"/></g>)}
    {part('pedals', <g transform={`rotate(${turns * 60},510,285)`} stroke="#d18a19" strokeWidth="9" strokeLinecap="round"><path d="M482 314 L510 285 L538 256"/><path d="M468 314 H494 M526 256 H552" stroke="#a36111" strokeWidth="13"/></g>)}
    <text x="350" y="395" textAnchor="middle" fill="#526b7a" fontSize="18">Parts diagram · two rear wheels + one front wheel</text>
  </svg>;
}
function Model() {
  const gltf = useLoader(GLTFLoader, 'models/low_poly_kids_tricycle.glb');
  const {scene, scale, center} = useMemo(() => {
    const scene = gltf.scene.clone(true);
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    return {scene, scale: 3.8 / Math.max(size.x, size.y, size.z), center: box.getCenter(new Vector3())};
  }, [gltf]);
  return <group scale={scale}><primitive object={scene} position={[-center.x, -center.y, -center.z]} /></group>;
}
class ModelBoundary extends Component<{children: React.ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() {return {failed: true};}
  render() {return this.state.failed ? <p className="tricycle-loading">The 3D model could not load. Please refresh and check that graphics acceleration is enabled.</p> : this.props.children;}
}
export function TricycleStage({mode, onSelect, selected, activityDone = false, completeActivity, resetActivity}: {
  mode: 'identify' | 'explore' | 'activity'; onSelect?: (part: string) => void; selected?: string | null;
  activityDone?: boolean; completeActivity?: () => void; resetActivity?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [view, setView] = useState(0);
  const [ready, setReady] = useState(false);
  const [turns, setTurns] = useState(0);
  const [message, setMessage] = useState('');
  const fullscreen = () => {if (document.fullscreenElement) void document.exitFullscreen().catch(() => {}); else void ref.current?.requestFullscreen?.().catch(() => {});};
  const reset = () => {setReady(false); setTurns(0); setMessage(''); resetActivity?.();};
  return <div className="generic-stage tricycle-stage" ref={ref}>
    <button className="secondary-action tricycle-fullscreen" onClick={fullscreen} aria-label="Toggle fullscreen" title="Toggle fullscreen"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /></svg></button>
    <div className="tricycle-caption">{mode === 'explore' ? 'Meet the tricycle in 3D' : mode === 'identify' ? 'Tap a part on the diagram' : 'Pedal to the finish!'}</div>
    {mode === 'explore' ? <ModelBoundary><Suspense fallback={<p className="tricycle-loading">Loading tricycle…</p>}><Canvas key={view} dpr={1} frameloop="demand" camera={{position: [4, 2.5, 5], fov: 42}} gl={{antialias: false, powerPreference: 'low-power'}}><ambientLight intensity={1.8}/><directionalLight position={[4, 6, 3]} intensity={2.5}/><Model/><ModelOrbitControls dampingEnabled={false} zoomEnabled rotateEnabled target={[0, 0, 0]} minDistance={3} maxDistance={10} syncInitialTarget/></Canvas></Suspense></ModelBoundary> : <Diagram onSelect={mode === 'identify' ? onSelect : undefined} selected={selected} turns={turns}/>}
    {mode === 'activity' && <div className="tricycle-challenge" aria-live="polite">
      <strong>{activityDone ? 'You did it! Pedals help turn the front wheel.' : !ready ? 'First, how many wheels does a tricycle have?' : turns < 6 ? `Push the pedals 6 times: ${turns}/6` : 'At the finish! Stop pedalling.'}</strong>
      {!ready ? <div className="tricycle-actions">{[2, 3, 4].map(n => <button key={n} className="secondary-action" onClick={() => {if(n === 3) {setReady(true); setMessage('Three wheels help support the rider.');} else setMessage('Count one front wheel and two rear wheels. Try again.');}}>{n} wheels</button>)}</div> : <><progress max={6} value={turns} aria-label="Pedal pushes"/><div className="tricycle-actions"><button className="primary-action" disabled={turns >= 6 || activityDone} onClick={() => setTurns(n => n + 1)}>Push pedals</button><button className="secondary-action" disabled={turns < 6 || activityDone} onClick={completeActivity}>Stop at finish</button></div></>}
      {message && !activityDone && <span>{message}</span>}
      <button className="secondary-action" onClick={reset}>{activityDone ? '↻ Try again' : 'Start again'}</button>
    </div>}
    {mode === 'explore' && <div className="tricycle-toolbar"><span>Drag to look around · Scroll to zoom</span><button className="secondary-action" onClick={() => setView(n => n + 1)}>Reset view</button></div>}
  </div>;
}
