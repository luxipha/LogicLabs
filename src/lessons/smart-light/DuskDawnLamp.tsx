import React, {Component, useEffect, useRef, useState} from 'react';
import {Canvas, useThree, type ThreeEvent} from '@react-three/fiber';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type LampPart = 'housing' | 'photocell' | 'led-lamp';
const CAMERA: [number, number, number] = [2.8, 1.9, 4.8];

const LampCamera: React.FC<{reset: number}> = ({reset}) => {
  const {camera, size, invalidate} = useThree();
  useEffect(() => {
    const fit = Math.max(1, .95 / (size.width / size.height));
    camera.position.set(...CAMERA).multiplyScalar(fit);
    camera.lookAt(0, .25, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, reset, invalidate]);
  return null;
};

// A constructed teaching model of a common wall-mounted dusk-to-dawn lamp.
// The photocell and LED emitter are separate from the protective housing.
const Lamp: React.FC<{lit: boolean; selected: string | null; onSelect?: (part: LampPart) => void}> = ({lit, selected, onSelect}) => {
  const select = (part: LampPart) => (event: ThreeEvent<MouseEvent>) => {
    if (!onSelect || event.delta > 5) return;
    event.stopPropagation();
    onSelect(part);
  };
  const body = selected === 'housing' ? '#278797' : '#344f61';
  const rim = selected === 'housing' ? '#ffd15c' : '#9bafb8';
  return <group position={[0, .1, 0]}>
    <group onClick={select('housing')}>
      <mesh position={[0, .12, -.18]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[.82, .68, .85, 48]}/>
        <meshStandardMaterial color={body} roughness={.46} metalness={.35}/>
      </mesh>
      <mesh position={[0, .12, .26]}><torusGeometry args={[.78, .075, 10, 48]}/><meshStandardMaterial color={rim} metalness={.5} roughness={.4}/></mesh>
      {/* Cooling ribs and the bracket belong to the static housing. */}
      {[-.42, -.28, -.14, 0].map(z => <mesh key={z} position={[0, .12, z]}><torusGeometry args={[.76, .035, 6, 40]}/><meshStandardMaterial color={body} roughness={.55}/></mesh>)}
      <mesh position={[0, -.8, -.45]} rotation={[.3, 0, 0]}><boxGeometry args={[.22, .8, .24]}/><meshStandardMaterial color={body} roughness={.5} metalness={.3}/></mesh>
      <mesh position={[0, -.9, -.95]}><boxGeometry args={[.27, .19, 1]}/><meshStandardMaterial color={body} roughness={.5} metalness={.3}/></mesh>
      <mesh position={[0, -.6, -1.42]}><boxGeometry args={[.7, 1, .15]}/><meshStandardMaterial color={body} roughness={.5} metalness={.3}/></mesh>
      {[-.23, .23].map(x => <mesh key={x} position={[x, -.3, -1.32]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.045, .045, .03, 10]}/><meshStandardMaterial color="#b0bbc2" metalness={.4} roughness={.5}/></mesh>)}
      <mesh position={[0, .81, -.02]} scale={[1.12, 1, 1]}><boxGeometry args={[1.5, .12, .83]}/><meshStandardMaterial color={body} roughness={.5} metalness={.3}/></mesh>
    </group>
    <group onClick={select('led-lamp')}>
      <mesh position={[0, .12, .285]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[.7, .7, .025, 48]}/>
        <meshStandardMaterial color={lit ? '#fff0c7' : '#dce6e9'} emissive={lit ? '#ffcf76' : '#000000'} emissiveIntensity={lit ? .7 : 0} roughness={.35}/>
      </mesh>
      {[-.28, 0, .28].flatMap(x => [-.2, .08, .36].map(y => <mesh key={`${x}-${y}`} position={[x, y, .31]}><boxGeometry args={[.16, .12, .018]}/><meshStandardMaterial color={lit ? '#fff5d9' : '#e9ca82'} emissive={lit ? '#ffda8a' : '#000000'} emissiveIntensity={lit ? 1 : 0} roughness={.5}/></mesh>))}
      {selected === 'led-lamp' ? <mesh position={[0, .12, .32]}><torusGeometry args={[.66, .025, 8, 40]}/><meshBasicMaterial color="#ffd15c"/></mesh> : null}
    </group>
    <group onClick={select('photocell')}>
      <mesh position={[.26, 1.16, -.13]}><sphereGeometry args={[.25, 12, 10]}/><meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false}/></mesh>
      <mesh position={[.26, .98, -.13]}><cylinderGeometry args={[.14, .17, .21, 24]}/><meshStandardMaterial color="#273c4e" roughness={.5}/></mesh>
      <mesh position={[.26, 1.16, -.13]}><cylinderGeometry args={[.17, .17, .19, 24]}/><meshStandardMaterial color={selected === 'photocell' ? '#ffd15c' : '#68cadc'} roughness={.28} emissive={selected === 'photocell' ? '#967315' : '#164f64'} emissiveIntensity={.3}/></mesh>
      <mesh position={[.26, 1.26, -.13]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.12, .025, 8, 24]}/><meshStandardMaterial color={selected === 'photocell' ? '#ffed9e' : '#a7e2e7'} roughness={.45}/></mesh>
    </group>
  </group>;
};

class LampBoundary extends Component<{children: React.ReactNode; onFailure?: () => void}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  componentDidCatch() { this.props.onFailure?.(); }
  render() { return this.state.failed ? <div className="sl-lamp-error" role="alert">The 3D lamp could not load. Enable graphics acceleration, then reload this lesson.</div> : this.props.children; }
}

const LampReady: React.FC<{onReady?: () => void}> = ({onReady}) => {
  useEffect(() => { onReady?.(); }, [onReady]);
  return null;
};

export const DuskLampCanvas: React.FC<{
  night: boolean; lit: boolean; selected?: string | null; onSelect?: (part: LampPart) => void;
  reset?: number; onReady?: () => void; onFailure?: () => void;
}> = ({night, lit, selected = null, onSelect, reset = 0, onReady, onFailure}) => <LampBoundary onFailure={onFailure}><Canvas dpr={1} frameloop="demand" camera={{position: CAMERA, fov: 36}} gl={{antialias: false, powerPreference: 'low-power'}}>
      <color attach="background" args={[night ? '#142942' : '#dcecf1']}/>
      <ambientLight intensity={night ? 1 : 1.5}/><hemisphereLight intensity={1.2} groundColor="#647578"/><directionalLight position={[3, 5, 5]} intensity={2}/>
      {lit ? <pointLight position={[0, .3, 1.2]} color="#ffe0a0" intensity={2} distance={5}/> : null}
      <Lamp lit={lit} selected={selected} onSelect={onSelect}/>
      <LampReady onReady={onReady}/>
      <LampCamera reset={reset}/><ModelOrbitControls key={reset} dampingEnabled={false} zoomEnabled rotateEnabled target={[0, .25, 0]} minDistance={3} maxDistance={13} syncInitialTarget/>
    </Canvas></LampBoundary>;

export const DuskDawnLamp: React.FC<{selected: string | null; onSelect: (part: string) => void}> = ({selected, onSelect}) => {
  const [night, setNight] = useState(true), [reset, setReset] = useState(0), [fullscreen, setFullscreen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const changed = () => setFullscreen(Boolean(ref.current && document.fullscreenElement === ref.current));
    document.addEventListener('fullscreenchange', changed);
    return () => document.removeEventListener('fullscreenchange', changed);
  }, []);
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void ref.current?.requestFullscreen?.().catch(() => {});
  };
  return <div ref={ref} className={`generic-stage sl-lamp-stage ${night ? 'sl-lamp-night' : 'sl-lamp-day'}`}>
    <header className="sl-lamp-toolbar"><div><strong>Dusk-to-dawn lamp</strong><span>Drag to turn · Scroll or pinch to zoom</span></div><div className="sl-lamp-actions"><button type="button" onClick={() => setReset(value => value + 1)}>Reset view</button><button type="button" onClick={toggleFullscreen}>{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button></div></header>
    <div className="sl-lamp-canvas"><DuskLampCanvas night={night} lit={night} selected={selected} onSelect={onSelect} reset={reset}/></div>
    <div className="sl-lamp-environment" aria-label="Time of day"><button type="button" aria-pressed={!night} onClick={() => setNight(false)}>Day</button><button type="button" aria-pressed={night} onClick={() => setNight(true)}>Dusk</button><span role="status">{night ? 'It is getting dark → lamp ON' : 'It is bright → lamp OFF'}</span></div>
  </div>;
};

export const DuskLampPartPreview: React.FC<{part: string}> = ({part}) => <svg viewBox="0 0 100 64" aria-hidden="true">
  {part === 'housing' ? <><path d="M20 13L69 7L86 19V48L65 56L20 48Z" fill="#344f61"/><ellipse cx="66" cy="32" rx="17" ry="22" fill="#bbcbd0"/><ellipse cx="66" cy="32" rx="13" ry="17" fill="#e6e8df"/></> : part === 'photocell' ? <><rect x="37" y="31" width="26" height="24" rx="5" fill="#344f61"/><rect x="32" y="10" width="36" height="31" rx="8" fill="#68cadc"/><ellipse cx="50" cy="12" rx="18" ry="6" fill="#a7e2e7"/></> : <><circle cx="50" cy="32" r="27" fill="#344f61"/><circle cx="50" cy="32" r="22" fill="#fff0c7"/>{[33,46,59].flatMap(x => [18,30,42].map(y => <rect key={`${x}-${y}`} x={x} y={y} width="8" height="7" rx="1" fill="#e8b75c"/>))}</>}
</svg>;
