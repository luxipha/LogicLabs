import React, {Component, Suspense, useEffect, useRef, useState} from 'react';
import {Canvas, useThree} from '@react-three/fiber';
import {UltrasonicRobot} from './UltrasonicModel';
import {UltrasonicActivity} from './UltrasonicActivity';
import {VacuumRoomActivity} from './VacuumRoomActivity';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

class ModelBoundary extends Component<{children: React.ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() {return {failed: true};}
  render() {return this.state.failed ? <div className="ultra-loading" role="alert">The robot could not load. Enable graphics acceleration and reload to try again.</div> : this.props.children;}
}

const Camera: React.FC<{token: number}> = ({token}) => {
  const {camera, size, invalidate} = useThree();
  useEffect(() => {camera.position.set(-5, 3, 5).multiplyScalar(Math.max(1, 1.1 / (size.width / size.height))); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix(); invalidate();}, [camera, size.width, size.height, token, invalidate]);
  return null;
};

export const UltrasonicPartPreview: React.FC<{part: string}> = ({part}) => <svg viewBox="0 0 80 60" width="70" height="52" aria-hidden="true">
  {part === 'sensor' ? <><rect x="5" y="10" width="70" height="40" rx="6" fill="#237ea6"/>{[25, 55].map(x => <g key={x}><circle cx={x} cy="30" r="14" fill="#becad0"/><circle cx={x} cy="30" r="10" fill="#263c49"/></g>)}</> : part === 'controller' ? <><rect x="12" y="6" width="56" height="48" rx="5" fill="#284b55"/><rect x="30" y="20" width="20" height="20" fill="#111e28"/>{[18, 30, 42, 54].map(x => <circle key={x} cx={x} cy="49" r="3" fill="#edbe50"/>)}</> : part === 'wires' ? <>{['#de584a', '#e6b63f', '#316cba'].map((color, i) => <path key={color} d={`M${12 + i * 12} 50 C0 0, 78 0, ${48 + i * 10} 50`} stroke={color} strokeWidth="6" fill="none"/>)}</> : <><circle cx="40" cy="30" r="25" fill="#25323c"/><circle cx="40" cy="30" r="16" fill="#e8bb45"/><circle cx="40" cy="30" r="5" fill="#25323c"/></>}
</svg>;

export const UltrasonicStage: React.FC<{
  mode: string; activityStep: string; lastSelectedPart: string | null; onSelect: (id: string) => void;
  activityDone: boolean; completeActivity: () => void; resetActivity: () => void;
}> = ({mode, activityStep, lastSelectedPart, onSelect, activityDone, completeActivity, resetActivity}) => {
  const [robotDone, setRobotDone] = useState(false), [vacuumDone, setVacuumDone] = useState(false);
  useEffect(() => {if (robotDone && vacuumDone && !activityDone) completeActivity();}, [robotDone, vacuumDone, activityDone, completeActivity]);
  const ref = useRef<HTMLDivElement>(null);
  const [view, setView] = useState(0), [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {const change = () => setFullscreen(document.fullscreenElement === ref.current); document.addEventListener('fullscreenchange', change); return () => document.removeEventListener('fullscreenchange', change);}, []);
  return <div className={`generic-stage ultra-stage ultra-stage--${mode}`} ref={ref}>
    <div className="ultra-toolbar"><button onClick={() => setView(v => v + 1)}>Reset view</button><button onClick={() => {if (document.fullscreenElement) void document.exitFullscreen().catch(() => {}); else void ref.current?.requestFullscreen?.().catch(() => {});}}>{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button></div>
    {mode !== 'activity' ? <>
      <div className="ultra-caption"><strong>{mode === 'identify' ? 'Find the robot’s parts' : 'A robot that senses distance'}</strong><span>{mode === 'identify' ? 'Tap the model, a green marker, or a part below.' : 'Drag to turn · Scroll or pinch to zoom'}</span></div>
      <ModelBoundary><Suspense fallback={<div className="ultra-loading" role="status">Loading the ultrasonic robot…</div>}><Canvas dpr={1} frameloop="demand" camera={{position: [-5, 3, 5], fov: 38}} gl={{antialias: false, powerPreference: 'low-power'}}>
        <ambientLight intensity={1.7}/><hemisphereLight intensity={1.2} groundColor="#69828b"/><directionalLight position={[-4, 6, 4]} intensity={2.5}/>
        <Camera token={view}/><UltrasonicRobot identify={mode === 'identify'} selected={lastSelectedPart} onSelect={onSelect}/>
        <ModelOrbitControls dampingEnabled={false} zoomEnabled rotateEnabled target={[0, 0, 0]} minDistance={3} maxDistance={12}/>
      </Canvas></Suspense></ModelBoundary>
      {mode === 'explore' ? <div className="ultra-explore-note"><strong>Send → Bounce → Listen</strong><span>The sensor uses sound we cannot hear. The coloured line in Activities is a teaching guide.</span></div> : null}
    </> : null}
    <UltrasonicActivity active={mode === 'activity' && activityStep !== 'vacuum-room'} activityDone={robotDone} completeActivity={() => setRobotDone(true)} resetActivity={() => {setRobotDone(false); resetActivity();}} viewToken={view}/>
    <VacuumRoomActivity active={mode === 'activity' && activityStep === 'vacuum-room'} activityDone={vacuumDone} completeActivity={() => setVacuumDone(true)} resetActivity={() => {setVacuumDone(false); resetActivity();}} viewToken={view}/>
  </div>;
};
