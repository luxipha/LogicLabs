import React, {Component, useCallback, useEffect, useRef, useState} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {Group, MeshBasicMaterial} from 'three';
import {ModelOrbitControls} from '../shared/ModelViewportControls';
import {VacuumModel} from './VacuumModel';
import {CM, ROOM_X, ROOM_Z, VACUUM_RADIUS, createVacuumState, stepVacuum, type VacuumState, type Wall, type WallEvent} from './vacuumSimulation';

class ActivityBoundary extends Component<{children: React.ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() {return {failed: true};}
  render() {return this.state.failed ? <div className="ultra-loading" role="alert">The 3D room could not load. Enable graphics acceleration and reload to try again.</div> : this.props.children;}
}

const RoomScene: React.FC<{
  simulation: React.MutableRefObject<VacuumState>; running: boolean; speed: number; threshold: number;
  resetToken: number; viewToken: number; onRead: (reading: VacuumState) => void;
  onWall: (event: WallEvent) => void; onReady: () => void;
}> = ({simulation, running, speed, threshold, resetToken, viewToken, onRead, onWall, onReady}) => {
  const vacuum = useRef<Group>(null), beam = useRef<Group>(null), lamp = useRef<MeshBasicMaterial>(null);
  const elapsed = useRef(0);
  const {camera, size, invalidate} = useThree();
  useEffect(() => {camera.position.set(3.9, 5.85, 6.24).multiplyScalar(Math.max(1, 1.25 / (size.width / size.height))); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix(); invalidate();}, [camera, size.width, size.height, viewToken, invalidate]);
  useEffect(() => {onReady();}, [onReady]);
  useEffect(() => {invalidate();}, [running, speed, threshold, resetToken, invalidate]);
  useFrame((state, delta) => {
    const current = simulation.current;
    if (running) {
      const event = stepVacuum(current, delta, speed, threshold);
      if (event) onWall(event);
      elapsed.current += Math.min(delta, .05);
      if (event || elapsed.current >= .1) {onRead({...current}); elapsed.current = 0;}
      state.invalidate();
    }
    if (vacuum.current) {vacuum.current.position.set(current.x, 0, current.z); vacuum.current.rotation.y = current.angle;}
    if (beam.current) {const length = current.distance * CM; beam.current.position.z = VACUUM_RADIUS + length / 2; beam.current.scale.z = Math.max(.001, length);}
    lamp.current?.color.set(current.phase === 'alarm' ? '#ff4a32' : current.phase === 'turning' ? '#edb62b' : '#199c83');
  });
  return <>
    <ambientLight intensity={1.5}/><hemisphereLight intensity={1.2} groundColor="#718681"/><directionalLight position={[2, 8, 5]} intensity={2}/>
    <mesh position={[0, -.045, 0]}><boxGeometry args={[ROOM_X * 2 + .2, .08, ROOM_Z * 2 + .2]}/><meshStandardMaterial color="#c8ddd0"/></mesh>
    <gridHelper args={[ROOM_X * 2, 16, '#8da699', '#abc4b4']} position={[0, .002, 0]} scale={[1, 1, ROOM_Z / ROOM_X]}/>
    {[-1, 1].map(sign => <React.Fragment key={sign}>
      <mesh position={[sign * (ROOM_X + .07), .18, 0]}><boxGeometry args={[.14, .36, ROOM_Z * 2 + .28]}/><meshStandardMaterial color="#aac4c7" roughness={.8}/></mesh>
      <mesh position={[0, .18, sign * (ROOM_Z + .07)]}><boxGeometry args={[ROOM_X * 2, .36, .14]}/><meshStandardMaterial color="#abc2c7" roughness={.8}/></mesh>
    </React.Fragment>)}
    <group ref={vacuum}>
      <VacuumModel/>
      <mesh position={[0, .31, -.10]}><sphereGeometry args={[.045, 12, 8]}/><meshBasicMaterial ref={lamp} color="#199c83"/></mesh>
      <group ref={beam}><mesh position={[0, .155, 0]}><boxGeometry args={[.018, .018, 1]}/><meshBasicMaterial color="#169ea7"/></mesh></group>
      <mesh position={[0, .008, VACUUM_RADIUS + threshold * CM / 2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.55, threshold * CM]}/><meshBasicMaterial color="#eabe37" transparent opacity={.3}/></mesh>
    </group>
    <ModelOrbitControls dampingEnabled={false} zoomEnabled rotateEnabled target={[0, 0, 0]} minDistance={5} maxDistance={17}/>
  </>;
};

export const VacuumRoomActivity: React.FC<{
  active: boolean; activityDone: boolean; completeActivity: () => void; resetActivity: () => void; viewToken: number;
}> = ({active, activityDone, completeActivity, resetActivity, viewToken}) => {
  const simulation = useRef(createVacuumState());
  const [reading, setReading] = useState(createVacuumState);
  const [threshold, setThreshold] = useState(20), [speed, setSpeed] = useState(30);
  const [running, setRunning] = useState(false), [ready, setReady] = useState(false), [resetToken, setResetToken] = useState(0);
  const [walls, setWalls] = useState<Wall[]>([]), [bumps, setBumps] = useState(0), [lastEvent, setLastEvent] = useState<WallEvent | null>(null);
  const [sound, setSound] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const completeRef = useRef(completeActivity); completeRef.current = completeActivity;
  const wallsRef = useRef(walls); wallsRef.current = walls;
  const soundRef = useRef(sound); soundRef.current = sound;
  useEffect(() => {if (!active) {setRunning(false); setReady(false);}}, [active]);
  useEffect(() => () => {void audio.current?.close().catch(() => {});}, []);
  const onReady = useCallback(() => setReady(true), []);
  const onRead = useCallback((value: VacuumState) => setReading(value), []);
  const onWall = useCallback((event: WallEvent) => {
    setLastEvent(event);
    if (event.contact) setBumps(value => value + 1);
    else {
      const next = wallsRef.current.includes(event.wall) ? wallsRef.current : [...wallsRef.current, event.wall];
      wallsRef.current = next; setWalls(next);
      if (next.length === 4) completeRef.current();
    }
    const context = audio.current;
    if (soundRef.current && context?.state === 'running') {
      const oscillator = context.createOscillator(), gain = context.createGain();
      oscillator.frequency.value = event.contact ? 220 : 660;
      gain.gain.setValueAtTime(.08, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .25);
      oscillator.connect(gain); gain.connect(context.destination); oscillator.onended = () => {oscillator.disconnect(); gain.disconnect();};
      oscillator.start(); oscillator.stop(context.currentTime + .25);
    }
  }, []);
  const resetRoom = () => {setRunning(false); simulation.current = createVacuumState(); setReading({...simulation.current}); setLastEvent(null); setResetToken(v => v + 1);};
  const retry = () => {resetRoom(); setThreshold(20); setSpeed(30); setWalls([]); wallsRef.current = []; setBumps(0); resetActivity();};
  if (!active) return null;
  const alarm = reading.phase === 'alarm';
  const status = !running ? 'Paused · ready to start' : alarm ? lastEvent?.contact ? 'BUMP · touching wall' : 'ALARM · wall detected' : reading.phase === 'turning' ? 'Turning away from wall' : 'Cleaning · moving forward';
  return <div className="ultra-drive ultra-vacuum">
    <div className="ultra-drive-scene"><ActivityBoundary>
      <Canvas dpr={1} frameloop="demand" camera={{position: [5, 7.5, 8], fov: 42}} gl={{antialias: false, powerPreference: 'low-power'}}>
        <RoomScene simulation={simulation} running={running} speed={speed} threshold={threshold} resetToken={resetToken} viewToken={viewToken} onRead={onRead} onWall={onWall} onReady={onReady}/>
      </Canvas>
    </ActivityBoundary></div>
    <div className={`ultra-drive-reading ${alarm ? 'ultra-drive-reading--alarm' : ''}`}>
      <strong>{Math.round(reading.distance)} cm</strong><span role="status" aria-live="polite">{status}</span><small>{reading.wall} wall ahead</small>
    </div>
    <div className="ultra-drive-panel">
      <div className="ultra-vacuum-settings">
        <label className="ultra-slider" htmlFor="ultra-speed">Speed <strong>{speed} cm/s</strong><input id="ultra-speed" type="range" min="10" max="60" step="10" value={speed} onChange={e => setSpeed(Number(e.target.value))}/></label>
        <label className="ultra-slider" htmlFor="ultra-alarm-distance">Trigger <strong>{threshold} cm</strong><input id="ultra-alarm-distance" type="range" min="0" max="40" step="5" value={threshold} onChange={e => setThreshold(Number(e.target.value))}/></label>
      </div>
      <div className="ultra-actions">
        <button disabled={!ready || running} onClick={() => setRunning(true)}>▶ Start cleaning</button>
        <button disabled={!running} onClick={() => setRunning(false)}>Pause</button>
        <button disabled={!ready} onClick={resetRoom}>Reset room</button>
        <button onClick={retry}>↻ Try again</button>
        <label className="ultra-sound"><input type="checkbox" checked={sound} onChange={e => {const enabled = e.target.checked; setSound(enabled); if (enabled) {audio.current ??= new AudioContext(); void audio.current.resume().catch(() => {});}}}/>Alarm sound</label>
      </div>
      <p role="status">{activityDone ? 'Four walls detected safely! Keep experimenting with speed and distance.' : `Detect all four walls before contact: ${walls.length}/4. ${threshold === 0 ? 'At 0 cm, the bumper touches the wall before turning.' : 'The vacuum signals, pauses, and turns when it reaches your trigger distance.'}`}</p>
      <div className="ultra-wall-checks" aria-label="Walls safely detected">{(['North', 'East', 'South', 'West'] as const).map(wall => <span key={wall} className={walls.includes(wall) ? 'is-detected' : ''}>{walls.includes(wall) ? '✓' : '○'} {wall}</span>)}<span>Bumps: {bumps}</span></div>
      <small>Change either slider while it runs. Blue line = simulated front sensor. Yellow area = trigger range. Drag to rotate · Pinch or scroll to zoom.</small>
    </div>
  </div>;
};
