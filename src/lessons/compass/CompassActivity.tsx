import React, {useEffect, useRef, useState} from 'react';

const DIRECTIONS = ['North', 'East', 'South', 'West'] as const;
const ALL_DIRECTIONS = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'] as const;
type Direction = typeof ALL_DIRECTIONS[number];
const TARGETS: Direction[] = ['North', 'East', 'South', 'West'];

const directionFor = (x: number, y: number): Direction => {
  const angle = Math.atan2(x - 50, 50 - y) * 180 / Math.PI;
  const normalized = (angle + 360) % 360;
  if (normalized < 22.5 || normalized >= 337.5) return 'North';
  if (normalized < 67.5) return 'North-East';
  if (normalized < 112.5) return 'East';
  if (normalized < 157.5) return 'South-East';
  if (normalized < 202.5) return 'South';
  if (normalized < 247.5) return 'South-West';
  if (normalized < 292.5) return 'West';
  return 'North-West';
};

const directionAngle: Record<Direction, number> = {North: 0, 'North-East': 45, East: 90, 'South-East': 135, South: 180, 'South-West': 225, West: 270, 'North-West': 315};
const directionLabel: Record<Direction, string> = {North: 'N', 'North-East': 'NE', East: 'E', 'South-East': 'SE', South: 'S', 'South-West': 'SW', West: 'W', 'North-West': 'NW'};

const DirectionLab: React.FC<{completeActivity: () => void; resetActivity: () => void}> = ({completeActivity, resetActivity}) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [person, setPerson] = useState({x: 50, y: 18});
  const [dragging, setDragging] = useState(false);
  const [visited, setVisited] = useState<Set<Direction>>(new Set(['North']));
  const direction = directionFor(person.x, person.y);
  const done = visited.size === ALL_DIRECTIONS.length;

  useEffect(() => {
    if (done) completeActivity();
  }, [completeActivity, done]);

  const movePerson = (clientX: number, clientY: number) => {
    const field = fieldRef.current;
    if (!field) return;
    const bounds = field.getBoundingClientRect();
    const x = Math.max(12, Math.min(88, ((clientX - bounds.left) / bounds.width) * 100));
    const y = Math.max(12, Math.min(88, ((clientY - bounds.top) / bounds.height) * 100));
    setPerson({x, y});
    setVisited((current) => new Set(current).add(directionFor(x, y)));
  };

  const tryAgain = () => {
    setPerson({x: 50, y: 18}); setDragging(false); setVisited(new Set(['North'])); resetActivity();
  };

  return <section className="compass-activity compass-direction-lab" aria-label="Move a person and read the compass">
    <div className="compass-activity-heading"><strong>2. Move the person</strong><span>{visited.size} / 8 directions</span></div>
    <p className="compass-activity-feedback">Drag the person around the map. Watch the compass move and read the direction.</p>
    <div className="compass-activity-board">
      <div className="compass-person-side">
        <strong className="compass-side-title">Move the person</strong>
        <div className="compass-person-field" ref={fieldRef} onPointerMove={(event) => { if (dragging) movePerson(event.clientX, event.clientY); }}>
          <span className="compass-map-label compass-map-label--north">N</span><span className="compass-map-label compass-map-label--north-east">NE</span><span className="compass-map-label compass-map-label--east">E</span><span className="compass-map-label compass-map-label--south-east">SE</span><span className="compass-map-label compass-map-label--south">S</span><span className="compass-map-label compass-map-label--south-west">SW</span><span className="compass-map-label compass-map-label--west">W</span><span className="compass-map-label compass-map-label--north-west">NW</span>
          <span className="compass-map-crosshair" />
          <button type="button" className="compass-map-person" style={{left: `${person.x}%`, top: `${person.y}%`}} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); movePerson(event.clientX, event.clientY); }} onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)} aria-label="Draggable person">🚶</button>
        </div>
      </div>
      <div className="compass-instrument-side">
        <strong className="compass-side-title">Compass</strong>
        <div className="compass-instrument" aria-label={`Compass points ${direction}`}>
          <span className="compass-instrument-label compass-instrument-label--north">N</span><span className="compass-instrument-label compass-instrument-label--north-east">NE</span><span className="compass-instrument-label compass-instrument-label--east">E</span><span className="compass-instrument-label compass-instrument-label--south-east">SE</span><span className="compass-instrument-label compass-instrument-label--south">S</span><span className="compass-instrument-label compass-instrument-label--south-west">SW</span><span className="compass-instrument-label compass-instrument-label--west">W</span><span className="compass-instrument-label compass-instrument-label--north-west">NW</span>
          <span className="compass-instrument-needle" style={{transform: `translate(-50%, -100%) rotate(${directionAngle[direction]}deg)`}} />
          <span className="compass-instrument-center" />
        </div>
        <div className="compass-reading" role="status"><span>The compass reads</span><strong>{directionLabel[direction]}</strong></div>
      </div>
    </div>
    {done ? <p className="compass-activity-feedback compass-success" role="status">Great work! You found all four directions.</p> : null}
    {done ? <button type="button" className="primary-action compass-try-again" onClick={tryAgain}>↻ Try again</button> : null}
  </section>;
};

export const CompassActivity: React.FC<{activityDone: boolean; completeActivity: () => void; resetActivity: () => void; activityStep: string}> = ({activityDone, completeActivity, resetActivity, activityStep}) => {
  const [step, setStep] = useState(activityDone ? TARGETS.length : 0);
  const [feedback, setFeedback] = useState('Use the compass rose to find the direction.');
  const target = TARGETS[step];
  const choose = (direction: Direction) => {
    if (activityDone) return;
    if (direction !== target) { setFeedback(`Try again. Find ${target}.`); return; }
    if (step === TARGETS.length - 1) { setStep(TARGETS.length); setFeedback('You can use a compass to find every main direction!'); completeActivity(); return; }
    setStep((value) => value + 1); setFeedback(`Great! Now find ${TARGETS[step + 1]}.`);
  };
  const tryAgain = () => { setStep(0); setFeedback('Use the compass rose to find the direction.'); resetActivity(); };
  if (activityStep === 'person') return <DirectionLab completeActivity={completeActivity} resetActivity={resetActivity} />;
  return <section className="compass-activity" aria-label="Find directions with a compass">
    <div className="compass-activity-heading"><strong>{activityDone ? 'Direction finder complete!' : `1. Find ${target}`}</strong><span>{Math.min(step + 1, TARGETS.length)} / {TARGETS.length}</span></div>
    <div className="compass-rose" aria-label="Compass rose">{DIRECTIONS.map((direction) => <button type="button" key={direction} className={`compass-direction compass-direction--${direction.toLowerCase()}`} onClick={() => choose(direction)}>{direction.charAt(0)}</button>)}<span className="compass-rose-center">✦</span></div>
    <p role="status" className="compass-activity-feedback">{feedback}</p>
    {activityDone ? <button type="button" className="primary-action compass-try-again" onClick={tryAgain}>↻ Try again</button> : null}
  </section>;
};
