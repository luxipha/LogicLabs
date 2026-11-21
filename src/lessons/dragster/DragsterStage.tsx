import React, {Suspense, useEffect, useMemo, useRef, useState} from 'react';
import {Canvas, useLoader, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';
import './dragster.css';

const modelUrl = new URL('models/dragster-classroom.glb', document.baseURI).href;
const labels: Record<string, string> = {front: 'Front wheels', rear: 'Rear wheels', engine: 'Engine', wing: 'Rear wing'};
// Verified against the source hierarchy AND world bounds: front wheels z=8.38,
// rear wheels z=-4.79, engine z=-3.46, rear wing y=3.18/z=-6.41.
function partId(object: THREE.Object3D): string | undefined {
  let node: THREE.Object3D | null = object;
  while (node) {
    if (['Circle_5', 'Circle008_12', 'Circle007_6', 'Circle014_13'].includes(node.name)) return 'front';
    if (['Circle006_47', 'Circle015_48', 'Circle016_49', 'Circle017_50'].includes(node.name)) return 'rear';
    if (node.name === 'Plane001_20') return 'wing';
    if (node.name === 'Circle024_65' || node.name === 'Cube_64') return 'engine';
    node = node.parent;
  }
}

function Car({selected, onSelect, progress = 0}: {selected?: string | null; onSelect?: (id: string) => void; progress?: number}) {
  const gltf = useLoader(GLTFLoader, modelUrl);
  const invalidate = useThree(state => state.invalidate);
  const {scene, materials} = useMemo(() => {
    const scene = gltf.scene.clone(true);
    const materials: {material: THREE.MeshStandardMaterial; id?: string; emissive: THREE.Color}[] = [];
    scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const id = partId(object);
      object.userData.dragsterPart = id;
      const wasArray = Array.isArray(object.material);
      const copies = (wasArray ? object.material as THREE.Material[] : [object.material as THREE.Material]).map(original => {
        const material = original.clone() as THREE.MeshStandardMaterial;
        material.metalness = Math.min(material.metalness ?? 0, .25);
        material.roughness = Math.max(material.roughness ?? .5, .4);
        materials.push({material, id, emissive: material.emissive?.clone() ?? new THREE.Color()});
        return material;
      });
      object.material = wasArray ? copies : copies[0];
    });
    const bounds = new THREE.Box3().setFromObject(scene);
    const center = bounds.getCenter(new THREE.Vector3());
    const wrapper = new THREE.Group();
    wrapper.add(scene); scene.position.sub(center); wrapper.scale.setScalar(6 / bounds.getSize(new THREE.Vector3()).z);
    return {scene: wrapper, materials};
  }, [gltf]);
  useEffect(() => () => materials.forEach(({material}) => material.dispose()), [materials]);
  useEffect(() => {
    materials.forEach(({material, id, emissive}) => {material.emissive.copy(id && id === selected ? new THREE.Color('#c97108') : emissive);});
    invalidate();
  }, [selected, materials, invalidate]);
  return <group position={[0, 0, progress * 3 - 1.5]}><primitive object={scene} onClick={(event: {stopPropagation: () => void; object: THREE.Object3D}) => {const id = event.object.userData.dragsterPart; if (id) {event.stopPropagation(); onSelect?.(id);}}} /></group>;
}

export function DragsterPreview({id}: {id: string}) {
  return <svg viewBox="0 0 100 65" width="90" height="55" aria-hidden="true">{id === 'front' || id === 'rear' ? <><circle cx="35" cy="34" r={id === 'rear' ? 24 : 18} fill="#263442" /><circle cx="35" cy="34" r="9" fill="#a8b4bc" /><ellipse cx="74" cy="34" rx="10" ry={id === 'rear' ? 24 : 18} fill="#263442" /></> : id === 'wing' ? <><path d="M12 19L78 13 91 25 25 32Z" fill="#e95526" /><path d="M30 30V55M74 28V55" stroke="#445565" strokeWidth="5" /></> : <><rect x="20" y="26" width="62" height="27" rx="5" fill="#71818d" /><rect x="30" y="14" width="42" height="15" rx="3" fill="#333f4c" /><path d="M20 36H10V53M82 36H92V53" stroke="#445565" strokeWidth="6" fill="none" /></>}</svg>;
}

export function DragsterStage({mode, selected, onSelect, activityDone, completeActivity, resetActivity}: {
  mode: 'identify' | 'explore' | 'activity'; selected?: string | null; onSelect?: (id: string) => void;
  activityDone?: boolean; completeActivity?: () => void; resetActivity?: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const [view, setView] = useState(0);
  const [prediction, setPrediction] = useState('');
  const [speed, setSpeed] = useState(1);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [records, setRecords] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (mode !== 'activity') {setRunning(false); return;}
    if (!running) return;
    let frame = 0; const start = performance.now();
    const tick = (now: number) => {
      const fraction = Math.min(1, (now - start) / (speed === 1 ? 4000 : 2000));
      setProgress(fraction);
      if (fraction < 1) frame = requestAnimationFrame(tick);
      else {setRunning(false); setFinished(true); setRecords(previous => ({...previous, [speed]: speed === 1 ? 4 : 2}));}
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, speed, mode]);
  const retry = () => {setRunning(false); setProgress(0); setFinished(false); setPrediction(''); setRecords({}); setSpeed(1); setMessage(''); resetActivity?.();};
  const active = mode === 'identify' ? selected : null;
  return <section className="dragster-stage" ref={ref}>
    <header><strong>{mode === 'identify' ? 'Find the racing parts' : mode === 'activity' ? 'Same track, different speeds' : 'Meet the dragster'}</strong><div><button onClick={() => setView(v => v + 1)}>Reset view</button><button onClick={() => {if (document.fullscreenElement) void document.exitFullscreen().catch(() => {}); else void ref.current?.requestFullscreen?.().catch(() => {});}}>Fullscreen</button></div></header>
    <div className="dragster-model"><Suspense fallback={<div className="dragster-loading">Loading dragster…</div>}><Canvas key={`${mode}-${view}`} dpr={1} frameloop="demand" gl={{antialias: false, powerPreference: 'low-power'}} camera={{position: mode === 'activity' ? [6.5, 3.3, 4.8] : [4.8, 2.5, 3.8], fov: 40}}>
      <color attach="background" args={['#eef3f6']} /><hemisphereLight args={['#ffffff', '#8c9cac', 2.8]} /><directionalLight position={[4, 6, 3]} intensity={3} />
      <Car selected={active} onSelect={mode === 'identify' ? onSelect : undefined} progress={mode === 'activity' ? progress : .5} />
      {mode === 'activity' && <mesh position={[0, -.76, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2, 10]} /><meshStandardMaterial color="#c1cdd5" /></mesh>}
      <ModelOrbitControls dampingEnabled={false} zoomEnabled rotateEnabled target={[0, 0, 0]} minDistance={3} maxDistance={16} syncInitialTarget />
    </Canvas></Suspense></div>
    <small>Drag to rotate · Pinch or scroll to zoom{active ? ` · ${labels[active]}` : ''}</small>
    {mode === 'activity' && <div className="dragster-controls">
      <div className="dragster-buttons"><label>Predict the shorter time: <select value={prediction} disabled={running || Object.keys(records).length > 0} onChange={e => setPrediction(e.target.value)}><option value="">Choose…</option><option value="1">Slow</option><option value="2">Fast</option></select></label><label>Test speed: <select value={speed} disabled={running} onChange={e => {setSpeed(Number(e.target.value)); setProgress(0); setFinished(false);}}><option value={1}>Slow</option><option value={2}>Fast</option></select></label><button disabled={!prediction || running} onClick={() => {setProgress(0); setFinished(false); setRunning(true);}}>Run test</button><button onClick={retry}>Try again</button></div>
      <p aria-live="polite">{running ? 'Testing…' : finished ? 'Finish line reached.' : 'Predict, then test both speeds over the same distance.'} Slow: {records[1] ? `${records[1]} s` : '—'} · Fast: {records[2] ? `${records[2]} s` : '—'}</p>
      {records[1] && records[2] && <div><p>{prediction === '2' ? 'Your prediction matched!' : 'Compare your prediction with the results.'} The faster car takes less time. Keep distance unchanged for a fair test.</p><button disabled={activityDone} onClick={() => {setMessage('Investigation complete!'); completeActivity?.();}}>Finish investigation</button></div>}
      <p className="dragster-note">Illustrative constant-speed simulation: the times are not measurements of a real racing car.</p><span role="status">{message}</span>
    </div>}
  </section>;
}
