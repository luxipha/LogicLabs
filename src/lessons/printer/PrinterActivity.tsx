import React, {useEffect, useRef, useState} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {MathUtils} from 'three';
import type {Group} from 'three';
import {ModelOrbitControls} from '../shared/ModelViewportControls';
import {PrinterLights, PrinterModel} from './PrinterModel';

type PrintPhase = 'empty' | 'loaded' | 'printing' | 'done';

const PrintingPaper: React.FC<{phase: PrintPhase; onPrinted: () => void}> = ({phase, onPrinted}) => {
  const paperRef = useRef<Group>(null);
  const progress = useRef(phase === 'done' ? 1 : 0);
  const completed = useRef(phase === 'done');
  const {invalidate} = useThree();

  useEffect(() => {
    if (phase === 'loaded') {
      progress.current = 0;
      completed.current = false;
      invalidate();
    }
  }, [invalidate, phase]);

  useFrame((_, delta) => {
    if (phase === 'printing') progress.current = Math.min(1, progress.current + delta * 0.42);
    const group = paperRef.current;
    if (!group || phase === 'empty') return;
    const eased = MathUtils.smoothstep(progress.current, 0, 1);
    group.position.set(0, MathUtils.lerp(0.72, -0.42, eased), MathUtils.lerp(-1.48, 1.92, eased));
    group.rotation.x = MathUtils.lerp(-0.35, -Math.PI / 2, eased);
    if (phase === 'printing' && progress.current < 1) invalidate();
    if (phase === 'printing' && progress.current >= 1 && !completed.current) {
      completed.current = true;
      onPrinted();
    }
  });

  return (
    <group ref={paperRef} visible={phase !== 'empty'}>
      <mesh>
        <planeGeometry args={[1.45, 1.9]} />
        <meshStandardMaterial color="#fffef8" roughness={0.82} />
      </mesh>
      {phase === 'done' || phase === 'printing' ? (
        <group position={[0, 0, 0.012]}>
          <mesh position={[0, 0.28, 0]}><planeGeometry args={[0.86, 0.5]} /><meshBasicMaterial color="#8f42f3" /></mesh>
          <mesh position={[-0.28, -0.3, 0]}><planeGeometry args={[0.26, 0.26]} /><meshBasicMaterial color="#45c99a" /></mesh>
          <mesh position={[0.08, -0.3, 0]}><planeGeometry args={[0.26, 0.26]} /><meshBasicMaterial color="#f9c74f" /></mesh>
          <mesh position={[0.38, -0.3, 0]}><planeGeometry args={[0.18, 0.26]} /><meshBasicMaterial color="#ef476f" /></mesh>
        </group>
      ) : null}
    </group>
  );
};

const ActivityCanvas: React.FC<{phase: PrintPhase; onPrinted: () => void}> = ({phase, onPrinted}) => (
  <Canvas
    className="printer-canvas"
    camera={{position: [4.5, 2.8, 5.4], fov: 33, near: 0.1, far: 100}}
    dpr={1}
    frameloop="demand"
    gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}
  >
    <color attach="background" args={['#e9e4f8']} />
    <PrinterLights />
    <mesh position={[0, -0.78, 0]}>
      <cylinderGeometry args={[2.65, 2.65, 0.16, 48]} />
      <meshStandardMaterial color="#c9c1dc" roughness={0.88} />
    </mesh>
    <PrinterModel />
    <PrintingPaper phase={phase} onPrinted={onPrinted} />
    <ModelOrbitControls dampingEnabled={false} zoomEnabled={false} rotateEnabled={false} target={[0, -0.05, 0]} minDistance={4.5} maxDistance={9} />
  </Canvas>
);

export const PrinterActivity: React.FC<{
  activityDone: boolean;
  completeActivity: () => void;
  resetActivity: () => void;
}> = ({activityDone, completeActivity, resetActivity}) => {
  const [phase, setPhase] = useState<PrintPhase>(activityDone ? 'done' : 'empty');
  const [attempt, setAttempt] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const printed = () => {
    setPhase('done');
    completeActivity();
  };
  const tryAgain = () => {
    setPhase('empty');
    setAttempt((value) => value + 1);
    resetActivity();
  };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else stageRef.current?.requestFullscreen?.().catch(() => {});
  };

  const status = phase === 'empty'
    ? 'The printer needs paper. Load one blank sheet.'
    : phase === 'loaded'
      ? 'Paper loaded. Start the printer.'
      : phase === 'printing'
        ? 'The rollers are moving the paper while the printer adds the picture…'
        : 'Print complete! The output tray caught the finished page.';

  return (
    <div className="printer-activity" ref={stageRef}>
      <ActivityCanvas key={attempt} phase={phase} onPrinted={printed} />
      <div className="printer-activity-overlay">
        <span className={`printer-status-badge printer-status-badge--${phase}`}>
          {phase === 'done' ? 'PRINTED' : phase.toUpperCase()}
        </span>
        <div className="printer-activity-panel">
          <p role="status">{status}</p>
          <div className="printer-activity-controls">
            {phase === 'empty' ? <button type="button" className="primary-action" onClick={() => setPhase('loaded')}>Load paper</button> : null}
            {phase === 'loaded' ? <button type="button" className="primary-action" onClick={() => setPhase('printing')}>Start printer</button> : null}
            {phase === 'printing' ? <button type="button" className="secondary-action" disabled>Printing…</button> : null}
            {phase === 'done' ? <button type="button" className="primary-action" onClick={tryAgain}>↻ Try again</button> : null}
            <button type="button" className="game-frame-fullscreen" onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              {isFullscreen ? '⛶ Exit' : '⛶ Fullscreen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
