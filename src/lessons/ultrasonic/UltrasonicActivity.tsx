import React, {Component, Suspense, useCallback, useEffect, useRef, useState} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {Group} from 'three';
import {UltrasonicRobot} from './UltrasonicModel';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

const START = 100;
const WALL_X = -2.7;
const CM = .04;
const ROBOT_SCALE = .55;
const SENSOR_OFFSET = 1.8 * ROBOT_SCALE;
type Status = 'ready' | 'driving' | 'paused' | 'alarm' | 'backing';

class ActivityBoundary extends Component<{children: React.ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() {return {failed: true};}
  render() {return this.state.failed ? <div className="ultra-loading" role="alert">The 3D robot could not load. Enable graphics acceleration and reload to try again.</div> : this.props.children;}
}

const DriveScene: React.FC<{
  status: Status; threshold: number; resetToken: number; viewToken: number;
  onRead: (distance: number) => void; onStop: (distance: number) => void; onBack: () => void; onReady: () => void;
}> = ({status, threshold, resetToken, viewToken, onRead, onStop, onBack, onReady}) => {
  const robot = useRef<Group>(null), beam = useRef<Group>(null);
  const distance = useRef(START), elapsed = useRef(0);
  const {camera, size, invalidate} = useThree();
  useEffect(() => {camera.position.set(-1.2, 4.3, 7.5).multiplyScalar(Math.max(1, 1.25 / (size.width / size.height))); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix(); invalidate();}, [camera, size.width, size.height, viewToken, invalidate]);
  useEffect(() => {distance.current = START; onRead(START); invalidate();}, [resetToken, onRead, invalidate]);
  useEffect(() => {onReady();}, [onReady]);
  useEffect(() => {invalidate();}, [status, threshold, invalidate]);
  useFrame((state, delta) => {
    if (status === 'driving' || status === 'backing') {
      const step = Math.min(delta, .05) * 24;
      distance.current = status === 'driving' ? Math.max(threshold, distance.current - step) : Math.min(START, distance.current + step * 1.5);
      elapsed.current += delta;
      if (elapsed.current >= .1) {onRead(Math.round(distance.current)); elapsed.current = 0;}
      if (status === 'driving' && distance.current <= threshold) {onRead(threshold); onStop(threshold);}
      else if (status === 'backing' && distance.current >= START) {onRead(START); onBack();}
      state.invalidate();
    }
    if (robot.current) robot.current.position.x = WALL_X + distance.current * CM + SENSOR_OFFSET;
    if (beam.current) {beam.current.position.x = WALL_X + distance.current * CM / 2; beam.current.scale.x = distance.current * CM;}
  });
  const alarm = status === 'alarm';
  return <>
    <ambientLight intensity={1.7}/><hemisphereLight intensity={1.2} groundColor="#69828b"/><directionalLight position={[-4, 6, 4]} intensity={2.5}/>
    <mesh position={[0, -.76, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[7.5, 4]}/><meshStandardMaterial color="#c7dcdd"/></mesh>
    <gridHelper args={[7.5, 15, '#7d9b9d', '#acc5c7']} position={[0, -.75, 0]}/>
    <mesh position={[WALL_X - .12, .05, 0]}><boxGeometry args={[.24, 1.6, 2.3]}/><meshStandardMaterial color="#bd8058"/></mesh>
    <mesh position={[WALL_X + threshold * CM / 2, -.737, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[threshold * CM, 2.3]}/><meshBasicMaterial color={alarm ? '#fba99b' : '#f5da92'} transparent opacity={.7}/></mesh>
    <group ref={beam} position={[WALL_X + START * CM / 2, .28, 0]} scale={[START * CM, 1, 1]}><mesh><boxGeometry args={[1, .025, .025]}/><meshBasicMaterial color={alarm ? '#e2513c' : '#1bafaa'} transparent opacity={.85}/></mesh></group>
    <group ref={robot} position={[WALL_X + START * CM + SENSOR_OFFSET, -.75 + 1.469 * ROBOT_SCALE, 0]}>
      <group scale={ROBOT_SCALE}><UltrasonicRobot identify={false} selected={null} onSelect={() => {}}/></group>
      <mesh position={[0, 1.05, 0]}><sphereGeometry args={[.13, 12, 8]}/><meshStandardMaterial color={alarm ? '#ff523e' : '#5ca78a'} emissive={alarm ? '#ff2510' : '#123d2e'} emissiveIntensity={alarm ? 2 : .3}/></mesh>
    </group>
    <ModelOrbitControls dampingEnabled={false} zoomEnabled rotateEnabled target={[0, 0, 0]} minDistance={4} maxDistance={14}/>
  </>;
};

export const UltrasonicActivity: React.FC<{
  active: boolean; activityDone: boolean; completeActivity: () => void; resetActivity: () => void; viewToken: number;
}> = ({active, activityDone, completeActivity, resetActivity, viewToken}) => {
  const [threshold, setThreshold] = useState(30), [distance, setDistance] = useState(START);
  const [status, setStatus] = useState<Status>('ready'), [ready, setReady] = useState(false), [resetToken, setResetToken] = useState(0);
  const [tests, setTests] = useState<number[]>([]), [sound, setSound] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const completeRef = useRef(completeActivity); completeRef.current = completeActivity;
  const testsRef = useRef(tests); testsRef.current = tests;
  const soundRef = useRef(sound); soundRef.current = sound;
  useEffect(() => {if (!active) {setStatus(s => s === 'driving' || s === 'backing' ? 'paused' : s); setReady(false);} else {setDistance(START); setStatus('ready');}}, [active]);
  useEffect(() => () => {void audio.current?.close().catch(() => {});}, []);
  const onReady = useCallback(() => setReady(true), []);
  const onBack = useCallback(() => setStatus('ready'), []);
  const onRead = useCallback((value: number) => setDistance(value), []);
  const onStop = useCallback((value: number) => {
    setStatus('alarm');
    const next = testsRef.current.includes(value) ? testsRef.current : [...testsRef.current, value];
    testsRef.current = next; setTests(next);
    if (next.length >= 2) completeRef.current();
    const context = audio.current;
    if (soundRef.current && context?.state === 'running') {
      const oscillator = context.createOscillator(), gain = context.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = 660;
      gain.gain.setValueAtTime(.08, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .35);
      oscillator.connect(gain); gain.connect(context.destination); oscillator.onended = () => {oscillator.disconnect(); gain.disconnect();};
      oscillator.start(); oscillator.stop(context.currentTime + .35);
    }
  }, []);
  const restart = () => {setStatus('ready'); setDistance(START); setResetToken(v => v + 1);};
  const retry = () => {restart(); setThreshold(30); setTests([]); testsRef.current = []; resetActivity();};
  if (!active) return null;
  const moving = status === 'driving' || status === 'backing';
  return <div className="ultra-drive">
    <div className="ultra-drive-scene"><ActivityBoundary><Suspense fallback={<div className="ultra-loading" role="status">Loading the ultrasonic robot…</div>}>
      <Canvas dpr={1} frameloop="demand" camera={{position: [-.3, 4.3, 7.5], fov: 40}} gl={{antialias: false, powerPreference: 'low-power'}}>
        <DriveScene status={status} threshold={threshold} resetToken={resetToken} viewToken={viewToken} onRead={onRead} onStop={onStop} onBack={onBack} onReady={onReady}/>
      </Canvas>
    </Suspense></ActivityBoundary></div>
    <div className={`ultra-drive-reading ${status === 'alarm' ? 'ultra-drive-reading--alarm' : ''}`}>
      <strong>{distance} cm</strong><span role="status" aria-live="polite">{status === 'alarm' ? 'ALARM · Robot stopped' : status === 'driving' ? 'Moving toward obstacle' : status === 'backing' ? 'Reversing away' : status === 'paused' ? 'Paused' : 'Ready to drive'}</span>
    </div>
    <div className="ultra-drive-panel">
      <label className="ultra-slider" htmlFor="ultra-alarm-distance">Alarm at <strong>{threshold} cm or less</strong><input id="ultra-alarm-distance" type="range" min="10" max="70" step="10" value={threshold} disabled={moving || distance < START} onChange={e => setThreshold(Number(e.target.value))}/></label>
      <div className="ultra-actions">
        <button disabled={!ready || moving || status === 'alarm'} onClick={() => setStatus('driving')}>▶ Drive</button>
        <button disabled={!moving} onClick={() => setStatus('paused')}>Pause</button>
        <button disabled={!ready || status === 'backing' || distance >= START} onClick={() => setStatus('backing')}>↶ Reverse</button>
        <button disabled={!ready} onClick={restart}>Back to start</button>
        <button onClick={retry}>↻ Try again</button>
        <label className="ultra-sound"><input type="checkbox" checked={sound} onChange={e => {const enabled = e.target.checked; setSound(enabled); if (enabled) {audio.current ??= new AudioContext(); void audio.current.resume().catch(() => {});}}}/>Alarm sound</label>
      </div>
      <p role="status">{activityDone ? `Well done! You tested ${tests.join(' cm and ')} cm. A larger threshold stops the robot earlier.` : tests.length ? `Stopped at ${tests[0]} cm! Return to start, set a different alarm distance, and drive again.` : 'Set a distance, then drive. The robot stops and lights its alarm at your chosen distance. Test two different settings.'}</p>
      <small>Robot vacuums can use distance sensors to avoid furniture. This robot uses a simulated ultrasonic reading; the coloured line shows the sound path.</small>
    </div>
  </div>;
};
