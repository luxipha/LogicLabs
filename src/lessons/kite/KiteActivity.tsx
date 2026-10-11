import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {DoubleSide, Shape} from 'three';

type KitePiece = 'frame' | 'sail' | 'tail' | 'string';
type ActivityStep = 'build' | 'wind' | 'fly';

const PIECES: ReadonlyArray<{id: KitePiece; label: string; icon: string}> = [
  {id: 'frame', label: 'Frame', icon: '✚'},
  {id: 'sail', label: 'Sail', icon: '◆'},
  {id: 'tail', label: 'Tail', icon: '◆'},
  {id: 'string', label: 'String', icon: '〰'},
];
const POINTS_ON_SCREEN = 3;
type FlightPoint = {id: number; x: number; y: number};
const sailShape = new Shape().moveTo(0, 1.2).lineTo(-1, 0).lineTo(0, -1.2).lineTo(1, 0).lineTo(0, 1.2);

const KiteModel: React.FC<{
  pieces: ReadonlySet<KitePiece>;
  wind: 0 | 1 | 2;
  x?: number;
  y?: number;
  flying?: boolean;
}> = ({pieces, wind, x = 0, y = 0, flying = false}) => {
  const ref = useRef<import('three').Group>(null);
  const {invalidate} = useThree();

  useFrame(({clock}, delta) => {
    if (!ref.current || (!wind && !flying)) return;
    const targetX = flying ? x : wind === 2 ? -2.1 : wind === 1 ? -1.45 : x;
    const targetY = flying ? y : wind === 2 ? 0.72 : wind === 1 ? 0.18 : -0.48;
    ref.current.position.x += (targetX - ref.current.position.x) * Math.min(1, delta * (flying ? 9 : 1.35));
    ref.current.position.y += (targetY - ref.current.position.y) * Math.min(1, delta * (flying ? 9 : 4));
    ref.current.rotation.z = Math.sin(clock.elapsedTime * (wind === 2 ? 3.4 : 1.8)) * (wind ? 0.11 : 0);
    invalidate();
  });

  return (
    <group ref={ref} position={[x, flying ? y : wind ? 0 : -0.48, 0]}>
      <group scale={0.78}>
        {pieces.has('sail') ? <mesh><shapeGeometry args={[sailShape]} /><meshStandardMaterial color="#f15f9a" side={DoubleSide} roughness={0.58} /></mesh> : null}
        {pieces.has('frame') ? <group position={[0, 0, 0.06]}>
          <mesh><boxGeometry args={[0.07, 2.36, 0.08]} /><meshStandardMaterial color="#774b2f" roughness={0.72} /></mesh>
          <mesh position={[0, 0.02, 0]}><boxGeometry args={[1.88, 0.07, 0.08]} /><meshStandardMaterial color="#774b2f" roughness={0.72} /></mesh>
        </group> : null}
        {pieces.has('tail') ? <group position={[0, -1.25, 0.04]}>{[0, 0.34, 0.68].map((offset, index) => <mesh key={offset} position={[Math.sin(index + wind) * wind * 0.08, -offset, 0]} rotation={[0, 0, Math.PI / 4 + Math.sin(index + wind) * wind * 0.15]}><boxGeometry args={[0.23, 0.23, 0.05]} /><meshStandardMaterial color={index % 2 ? '#ffad46' : '#ffdc45'} roughness={0.6} /></mesh>)}</group> : null}
        {pieces.has('string') ? <mesh position={[-0.64, -1.58, 0]} rotation={[0, 0, -0.52]}><boxGeometry args={[0.025, 1.75, 0.025]} /><meshStandardMaterial color="#f7ead0" roughness={0.9} /></mesh> : null}
      </group>
    </group>
  );
};

const ActivityScene: React.FC<{
  pieces: ReadonlySet<KitePiece>;
  wind: 0 | 1 | 2;
  step: ActivityStep;
  flightPosition: [number, number];
  points: ReadonlyArray<FlightPoint>;
  onSteer: (x: number, y: number) => void;
}> = ({pieces, wind, step, flightPosition, points, onSteer}) => <>
  <color attach="background" args={[step === 'fly' ? '#7ecdf1' : '#d9f0fb']} />
  <ambientLight intensity={1.35} /><directionalLight position={[3, 5, 5]} intensity={1.2} />
  {step === 'fly' ? <mesh position={[0, -2.05, -0.2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[12, 8]} /><meshStandardMaterial color="#9bd37c" roughness={0.94} /></mesh> : null}
  {step === 'fly' ? points.map((point) => <group key={point.id} position={[point.x, point.y, 0]}><mesh rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.28, 0.28, 0.08]} /><meshStandardMaterial color="#ffdf4b" emissive="#d79a00" emissiveIntensity={0.45} /></mesh></group>) : null}
  {step === 'fly' ? <mesh position={[0, 0.15, 0.45]} onPointerDown={(event) => { event.stopPropagation(); onSteer(event.point.x, event.point.y); }} onPointerMove={(event) => { event.stopPropagation(); onSteer(event.point.x, event.point.y); }}><planeGeometry args={[9, 5.8]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh> : null}
  <KiteModel pieces={pieces} wind={wind} x={step === 'wind' ? 0 : flightPosition[0]} y={flightPosition[1]} flying={step === 'fly'} />
</>;

const ActivityCanvas: React.FC<{
  pieces: ReadonlySet<KitePiece>;
  wind: 0 | 1 | 2;
  step: ActivityStep;
  flightPosition: [number, number];
  points: ReadonlyArray<FlightPoint>;
  onSteer: (x: number, y: number) => void;
}> = ({pieces, wind, step, flightPosition, points, onSteer}) => (
  <Canvas className="kite-canvas" camera={{position: [0, 0.4, 7.4], fov: 34}} dpr={1} frameloop={wind || step === 'fly' ? 'always' : 'demand'} gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}>
    <ActivityScene pieces={pieces} wind={wind} step={step} flightPosition={flightPosition} points={points} onSteer={onSteer} />
  </Canvas>
);

export const KiteActivity: React.FC<{
  activityDone: boolean;
  completeActivity: () => void;
  resetActivity: () => void;
  activityStep: string;
  setActivityStep: (step: string) => void;
}> = ({activityDone, completeActivity, resetActivity, activityStep, setActivityStep}) => {
  const [pieces, setPieces] = useState<KitePiece[]>([]);
  const [wind, setWind] = useState<0 | 1 | 2>(0);
  const [windTested, setWindTested] = useState(false);
  const [flightPosition, setFlightPosition] = useState<[number, number]>([0, 0]);
  const [points, setPoints] = useState<FlightPoint[]>([]);
  const [pointsCollected, setPointsCollected] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [roundRunning, setRoundRunning] = useState(false);
  const pointId = useRef(0);
  const [fullscreen, setFullscreen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const built = pieces.length === PIECES.length;
  const requestedStep: ActivityStep = activityStep === 'wind' || activityStep === 'game' ? activityStep === 'game' ? 'fly' : 'wind' : 'build';
  const step = requestedStep === 'wind' && !built ? 'build' : requestedStep === 'fly' && (!built || !windTested) ? (built ? 'wind' : 'build') : requestedStep;
  const pieceSet = useMemo(() => new Set(pieces), [pieces]);

  useEffect(() => {
    if (step !== requestedStep) setActivityStep(step === 'fly' ? 'game' : step === 'wind' ? 'wind' : 'puzzle');
  }, [requestedStep, setActivityStep, step]);
  useEffect(() => {
    const onFullscreenChange = () => setFullscreen(document.fullscreenElement === ref.current);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const addPiece = (piece: KitePiece) => setPieces((current) => current.includes(piece) ? current : [...current, piece]);
  const makePoint = (): FlightPoint => ({
    id: pointId.current++,
    x: -3 + Math.random() * 6,
    y: -0.55 + Math.random() * 2.2,
  });
  const chooseWind = (next: 0 | 1 | 2) => {
    setWind(next);
    if (next === 2) setWindTested(true);
  };
  const steerFlight = (x: number, y: number) => {
    const next: [number, number] = [Math.max(-3.35, Math.min(3.35, x)), Math.max(-1.55, Math.min(1.75, y))];
    setFlightPosition(next);
    const hit = points.find((point) => Math.hypot(point.x - next[0], point.y - next[1]) < 0.52);
    if (!hit || !roundRunning) return;
    setPointsCollected((current) => {
      setPoints((visible) => [...visible.filter((point) => point.id !== hit.id), makePoint()]);
      return current + 1;
    });
  };
  useEffect(() => {
    if (step !== 'fly') return;
    setSecondsLeft(10);
    setPointsCollected(0);
    setPoints(Array.from({length: POINTS_ON_SCREEN}, makePoint));
    setRoundRunning(true);
    // Start a fresh timed round whenever the student enters Fly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  useEffect(() => {
    if (step !== 'fly' || !roundRunning) return;
    if (secondsLeft === 0) {
      setRoundRunning(false);
      completeActivity();
      return;
    }
    const timer = window.setTimeout(() => setSecondsLeft((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [completeActivity, roundRunning, secondsLeft, step]);
  useEffect(() => {
    if (step === 'fly' && roundRunning && points.length === 0) setPoints(Array.from({length: POINTS_ON_SCREEN}, makePoint));
  }, [points.length, roundRunning, step]);
  const retry = () => {
    setPieces([]); setWind(0); setWindTested(false); setFlightPosition([0, 0]); setPoints([]); setPointsCollected(0); setSecondsLeft(10); setRoundRunning(false); setActivityStep('puzzle'); resetActivity();
  };
  const toggleFullscreen = () => document.fullscreenElement ? document.exitFullscreen().catch(() => {}) : ref.current?.requestFullscreen?.().catch(() => {});

  const heading = step === 'build'
    ? built ? 'Your kite is built!' : 'Build a kite, one part at a time.'
    : step === 'wind'
      ? wind === 2 ? 'Strong wind lifts the kite!' : 'What happens when the wind gets stronger?'
      : roundRunning ? 'Catch as many stars as you can!' : `Time! You caught ${pointsCollected} stars.`;
  const detail = step === 'build'
    ? `${pieces.length} of ${PIECES.length} parts added`
    : step === 'wind'
      ? 'Try Calm, then Breeze. Watch the same kite drift left as the wind carries it.'
      : roundRunning ? 'Touch and drag the kite to a yellow star. A new star appears whenever you catch one.' : 'Your score is ready. Try again for a new round.';

  return (
    <div className="kite-activity" ref={ref}>
      <ActivityCanvas pieces={pieceSet} wind={wind} step={step} flightPosition={flightPosition} points={points} onSteer={steerFlight} />
      <div className="kite-activity__overlay">
        {step === 'fly' ? <div className="kite-game-hud" aria-live="polite"><span>⏱ {secondsLeft}s</span><span>✦ {pointsCollected}</span></div> : null}
        <div className="kite-activity-panel">
          <strong>{heading}</strong><span>{detail}</span>
          {step === 'build' ? <div className="kite-build-tray">{PIECES.map((piece) => <button key={piece.id} type="button" disabled={pieces.includes(piece.id)} onClick={() => addPiece(piece.id)}><b>{pieces.includes(piece.id) ? '✓' : piece.icon}</b>{piece.label}</button>)}</div> : null}
          {step === 'build' && built ? <button className="primary-action" type="button" onClick={() => setActivityStep('wind')}>Next: test wind →</button> : null}
          {step === 'wind' ? <div className="kite-controls"><button className="secondary-action" type="button" onClick={() => chooseWind(0)} disabled={wind === 0}>Calm</button><button className="secondary-action" type="button" onClick={() => chooseWind(1)} disabled={wind === 1}>Breeze</button><button className="primary-action" type="button" onClick={() => chooseWind(2)} disabled={wind === 2}>Strong wind</button>{windTested ? <button className="primary-action" type="button" onClick={() => setActivityStep('game')}>Next: fly →</button> : null}</div> : null}
          {step === 'fly' ? <div className="kite-controls"><button className="secondary-action" type="button" onClick={() => steerFlight(flightPosition[0] - 0.5, flightPosition[1])}>←</button><button className="secondary-action" type="button" onClick={() => steerFlight(flightPosition[0], flightPosition[1] + 0.5)}>↑</button><button className="secondary-action" type="button" onClick={() => steerFlight(flightPosition[0], flightPosition[1] - 0.5)}>↓</button><button className="primary-action" type="button" onClick={() => steerFlight(flightPosition[0] + 0.5, flightPosition[1])}>→</button>{activityDone ? <button className="primary-action" type="button" onClick={retry}>↻ Try again</button> : null}</div> : null}
        </div>
        <button className="kite-fullscreen" type="button" onClick={toggleFullscreen}>{fullscreen ? '⛶ Exit' : '⛶ Fullscreen'}</button>
      </div>
    </div>
  );
};
