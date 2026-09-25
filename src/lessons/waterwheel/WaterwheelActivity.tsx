import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import type {Group} from 'three';
import {ModelOrbitControls} from '../shared/ModelViewportControls';
import {
  WaterwheelLights,
  WaterwheelModel,
  type WaterwheelBuildPartId,
} from './WaterwheelModel';

const MAX_SPEED = 2.1;
const RAMP = 2.4;
const TURN_TARGET = 2.7;

const BUILD_PARTS: ReadonlyArray<{
  id: WaterwheelBuildPartId;
  label: string;
  icon: string;
}> = [
  {id: 'supports', label: 'Supports', icon: '▮▮'},
  {id: 'wheel', label: 'Wheel', icon: '◯'},
  {id: 'paddles', label: 'Paddles', icon: '✦'},
  {id: 'axle', label: 'Axle', icon: '━'},
  {id: 'sluice', label: 'Sluice', icon: '▱'},
  {id: 'generator', label: 'Generator', icon: '⚙'},
  {id: 'cable', label: 'Power line', icon: '⌁'},
  {id: 'house', label: 'House', icon: '⌂'},
];

const SpinningWheel: React.FC<{
  gateOpen: boolean;
  wheelRef: React.RefObject<Group>;
  onTurnedEnough: () => void;
}> = ({gateOpen, wheelRef, onTurnedEnough}) => {
  const {invalidate} = useThree();
  const speedRef = useRef(0);
  const rotationRef = useRef(0);
  const turnedRef = useRef(false);

  useFrame((_, delta) => {
    const wheel = wheelRef.current;
    if (!wheel) return;
    speedRef.current = gateOpen
      ? Math.min(MAX_SPEED, speedRef.current + delta * RAMP)
      : Math.max(0, speedRef.current - delta * 1.6);
    if (speedRef.current <= 0) return;

    rotationRef.current += speedRef.current * delta;
    wheel.rotation.x = rotationRef.current;
    if (!turnedRef.current && rotationRef.current >= TURN_TARGET) {
      turnedRef.current = true;
      onTurnedEnough();
    }
    invalidate();
  });

  return null;
};

const ActivityCanvas: React.FC<{
  gateOpen: boolean;
  powered: boolean;
  visibleParts: ReadonlySet<WaterwheelBuildPartId>;
  wheelRef: React.RefObject<Group>;
  onTurnedEnough: () => void;
  canRun: boolean;
}> = ({gateOpen, powered, visibleParts, wheelRef, onTurnedEnough, canRun}) => (
  <Canvas
    className="waterwheel-canvas"
    camera={{position: [8, 4.6, 5.8], fov: 32, near: 0.1, far: 100}}
    dpr={1}
    frameloop="demand"
    gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}
  >
    <color attach="background" args={['#bfe3f7']} />
    <WaterwheelLights />
    <WaterwheelModel
      wheelRef={wheelRef}
      gateOpen={gateOpen}
      waterOn={gateOpen}
      showPowerDemo
      powered={powered}
      visibleParts={visibleParts}
    />
    <ModelOrbitControls
      zoomEnabled
      dampingEnabled={false}
      rotateEnabled
      target={[0, 2.2, 0]}
      minDistance={7.5}
      maxDistance={16}
    />
    {canRun ? (
      <SpinningWheel gateOpen={gateOpen} wheelRef={wheelRef} onTurnedEnough={onTurnedEnough} />
    ) : null}
  </Canvas>
);

const ActivitySteps: React.FC<{step: 'build' | 'power'}> = ({step}) => (
  <div className="waterwheel-activity-steps" aria-label="Activity progress">
    <span className={step === 'build' ? 'is-active' : 'is-complete'}>1 · Drag to build</span>
    <span className={step === 'power' ? 'is-active' : ''}>2 · Turn it on</span>
  </div>
);

const BuildOverlay: React.FC<{
  installed: ReadonlyArray<WaterwheelBuildPartId>;
  onInstall: (part: WaterwheelBuildPartId) => void;
  onContinue: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
}> = ({installed, onInstall, onContinue, onFullscreen, isFullscreen}) => {
  const [dragOver, setDragOver] = useState(false);
  const complete = installed.length === BUILD_PARTS.length;

  const dropPart = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const part = event.dataTransfer.getData('text/plain') as WaterwheelBuildPartId;
    if (BUILD_PARTS.some((candidate) => candidate.id === part)) onInstall(part);
  };

  return (
    <div className="waterwheel-build-overlay">
      <ActivitySteps step="build" />
      <div
        className={`waterwheel-build-target${dragOver ? ' is-over' : ''}${complete ? ' is-complete' : ''}`}
        onDragEnter={() => setDragOver(true)}
        onDragLeave={() => setDragOver(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={dropPart}
      >
        <strong>{complete ? 'Waterwheel system built!' : 'Drop parts here'}</strong>
        <span>{complete ? 'The system is ready for water.' : `${installed.length} of ${BUILD_PARTS.length} parts added`}</span>
        {complete ? (
          <button type="button" className="primary-action" onClick={onContinue}>
            Next: Turn it on →
          </button>
        ) : null}
      </div>

      <div className="waterwheel-build-bottom">
        <p role="status">Drag or tap every part to assemble the waterwheel and connect the house.</p>
        <div className="waterwheel-build-tray">
          {BUILD_PARTS.map((part) => {
            const added = installed.includes(part.id);
            return (
              <button
                key={part.id}
                type="button"
                className={`waterwheel-build-part${added ? ' is-added' : ''}`}
                draggable={!added}
                disabled={added}
                onClick={() => onInstall(part.id)}
                onDragStart={(event) => {
                  event.dataTransfer.setData('text/plain', part.id);
                  event.dataTransfer.effectAllowed = 'move';
                }}
                title={added ? `${part.label} added` : `Drag or tap to add ${part.label}`}
              >
                <span aria-hidden="true">{added ? '✓' : part.icon}</span>
                <strong>{part.label}</strong>
              </button>
            );
          })}
          <button
            type="button"
            className="game-frame-fullscreen waterwheel-build-fullscreen"
            onClick={onFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? '⛶ Exit' : '⛶ Fullscreen'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const WaterwheelActivity: React.FC<{
  activityDone: boolean;
  completeActivity: () => void;
  resetActivity: () => void;
}> = ({activityDone, completeActivity, resetActivity}) => {
  const [step, setStep] = useState<'build' | 'power'>(activityDone ? 'power' : 'build');
  const [installed, setInstalled] = useState<WaterwheelBuildPartId[]>(
    activityDone ? BUILD_PARTS.map((part) => part.id) : [],
  );
  const [gateOpen, setGateOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wheelRef = useRef<Group>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const visibleParts = useMemo(() => new Set(installed), [installed]);
  const powered = activityDone && gateOpen;

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      stageRef.current?.requestFullscreen?.().catch(() => {});
    }
  };

  const installPart = (part: WaterwheelBuildPartId) => {
    setInstalled((current) => (current.includes(part) ? current : [...current, part]));
  };

  const tryAgain = () => {
    setStep('build');
    setInstalled([]);
    setGateOpen(false);
    setAttempt((current) => current + 1);
    resetActivity();
  };

  const status = powered
    ? 'The turning wheel drives the generator. Electricity lights the house!'
    : activityDone
      ? 'The gate is closed, so the generator stops and the house lights turn off.'
      : gateOpen
        ? 'Water is turning the wheel. The generator is building electricity…'
        : 'The system is built. Open the sluice to send water to the wheel.';

  return (
    <div className="waterwheel-activity" ref={stageRef}>
      <ActivityCanvas
        key={attempt}
        gateOpen={step === 'power' && gateOpen}
        powered={powered}
        visibleParts={visibleParts}
        wheelRef={wheelRef}
        onTurnedEnough={completeActivity}
        canRun={step === 'power'}
      />

      {step === 'build' ? (
        <BuildOverlay
          installed={installed}
          onInstall={installPart}
          onContinue={() => setStep('power')}
          onFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
      ) : (
        <div className="waterwheel-activity-overlay">
          <div className="waterwheel-power-top">
            <ActivitySteps step="power" />
            <div className="waterwheel-activity-badges">
              <span className="waterwheel-activity-badge">Water: {gateOpen ? 'ON' : 'OFF'}</span>
              <span className={`waterwheel-activity-badge waterwheel-power-badge${powered ? ' is-on' : ''}`}>
                House power: {powered ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>

          <div className="waterwheel-activity-panel">
            <p className="waterwheel-activity-status" role="status">
              {status}
            </p>
            <div className="waterwheel-activity-controls">
              <button type="button" className="secondary-action" onClick={() => setGateOpen(true)} disabled={gateOpen}>
                Open gate
              </button>
              <button type="button" className="secondary-action" onClick={() => setGateOpen(false)} disabled={!gateOpen}>
                Close gate
              </button>
              {activityDone ? (
                <button type="button" className="primary-action" onClick={tryAgain}>
                  ↻ Try again
                </button>
              ) : null}
              <button
                type="button"
                className="game-frame-fullscreen"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? '⛶ Exit' : '⛶ Fullscreen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
