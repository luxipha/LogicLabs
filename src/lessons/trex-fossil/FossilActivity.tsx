import React, {useEffect, useRef, useState} from 'react';
import content from './content.json';
import layout from '../../assets/trex/activity-layout.json';

type Part = keyof typeof layout;
const PARTS = content.parts as (typeof content.parts[number] & {id: Part})[];
const ORDER: Part[] = ['tail', 'skull', 'leg', 'neck', 'ribs'];
const asset = (part: Part, aligned = false) => `assets/trex-parts/${part}${aligned ? '-aligned' : ''}.svg`;

// Coverage is measured across the brush surface, not by pointer event count.
const DigPiece: React.FC<{part: Part; found: boolean; onFound: () => void}> = ({part, found, onFound}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const cells = useRef(new Set<number>());
  const previous = useRef<{x: number; y: number} | null>(null);
  const finished = useRef(found);
  const [coverage, setCoverage] = useState(found ? 100 : 0);
  const label = PARTS.find((item) => item.id === part)!.label;
  useEffect(() => {
    if (found) return;
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#b88c5e';
    ctx.fillRect(0, 0, 240, 130);
    // Deterministic small flecks give the dirt a textured surface.
    for (let i = 0; i < 480; i++) {
      ctx.fillStyle = i % 2 ? '#d4ac78' : '#987049';
      ctx.fillRect((i * 73) % 240, (i * 47) % 130, 2, 2);
    }
    ctx.globalCompositeOperation = 'destination-out';
  }, [found]);
  const brush = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (finished.current || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const point = {x: (event.clientX - rect.left) / rect.width * 240, y: (event.clientY - rect.top) / rect.height * 130};
    const start = previous.current ?? point;
    const steps = Math.max(1, Math.ceil(Math.hypot(point.x - start.x, point.y - start.y) / 5));
    const ctx = event.currentTarget.getContext('2d');
    for (let step = 0; step <= steps; step++) {
      const x = start.x + (point.x - start.x) * step / steps;
      const y = start.y + (point.y - start.y) * step / steps;
      ctx?.beginPath(); ctx?.arc(x, y, 18, 0, Math.PI * 2); ctx?.fill();
      for (let row = 0; row < 13; row++) for (let col = 0; col < 24; col++) {
        if (Math.hypot(col * 10 + 5 - x, row * 10 + 5 - y) <= 18) cells.current.add(row * 24 + col);
      }
    }
    previous.current = point;
    const percent = Math.round(cells.current.size / 312 * 100);
    setCoverage(percent);
    if (percent >= 65) { finished.current = true; onFound(); }
  };
  return <div className={`trex-dig-piece ${found ? 'found' : ''}`}>
    <div className="trex-dig-surface">
      <img src={asset(part)} alt={found ? label : 'A partly buried fossil'} draggable={false}/>
      {!found && <canvas ref={canvas} width={240} height={130} aria-label={`Brush dirt away to uncover fossil ${PARTS.findIndex(p => p.id === part) + 1}`}
        onPointerDown={(event) => {event.currentTarget.setPointerCapture(event.pointerId); previous.current = null; brush(event);}}
        onPointerMove={brush} onPointerUp={() => {previous.current = null;}} onPointerCancel={() => {previous.current = null;}} />}
    </div>
    <strong>{found ? `✓ ${label}` : 'Brush the dirt'}</strong>
    <progress value={found ? 100 : coverage} max={100} aria-label={`${label} cleaning progress`}/>
    {!found && <button className="trex-brush-alternative" onClick={onFound}>Uncover without rubbing</button>}
  </div>;
};

export const FossilActivity: React.FC<{activityDone: boolean; completeActivity: () => void; resetActivity: () => void}> = ({activityDone, completeActivity, resetActivity}) => {
  const [phase, setPhase] = useState<'dig' | 'assemble'>(activityDone ? 'assemble' : 'dig');
  const [found, setFound] = useState<Set<Part>>(() => new Set(activityDone ? ORDER : []));
  const [placed, setPlaced] = useState<Set<Part>>(() => new Set(activityDone ? ORDER : []));
  const [selected, setSelected] = useState<Part | null>(null);
  const [message, setMessage] = useState('Rub across the dirt to uncover each fossil.');
  const [round, setRound] = useState(0);
  const [drag, setDrag] = useState<{part: Part; x: number; y: number} | null>(null);
  const board = useRef<SVGSVGElement>(null);
  const origin = useRef<{x: number; y: number} | null>(null);
  const moved = useRef(false);
  const collect = (part: Part) => {
    setFound(current => new Set([...current, part]));
    setMessage(`You found the ${PARTS.find(item => item.id === part)!.label.toLowerCase()}! Fossils are clues to animals that lived long ago.`);
  };
  const place = (target: Part, piece = selected) => {
    if (!piece) {setMessage('Choose a fossil from your collection first.'); return;}
    if (target !== piece) {setMessage('Try another spot. Look at the shape of your fossil.'); return;}
    if (placed.has(piece)) return;
    const next = new Set([...placed, piece]); setPlaced(next); setSelected(null);
    if (next.size === PARTS.length) {
      setMessage('You uncovered and rebuilt a T-Rex fossil!'); completeActivity();
    } else setMessage(PARTS.find(item => item.id === piece)!.fact);
  };
  const drop = (part: Part, clientX: number, clientY: number) => {
    const svg = board.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return;
    const point = svg.createSVGPoint(); point.x = clientX; point.y = clientY;
    const local = point.matrixTransform(matrix.inverse());
    const spot = layout[part];
    if (local.x >= spot.x - 18 && local.x <= spot.x + spot.width + 18 && local.y >= spot.y - 18 && local.y <= spot.y + spot.height + 18) place(part, part);
    else setMessage('Move the fossil closer to its matching outline, or tap a spot.');
  };
  const replay = () => {setFound(new Set()); setPlaced(new Set()); setSelected(null); setPhase('dig'); setRound(value => value + 1); setMessage('Rub across the dirt to uncover each fossil.'); resetActivity();};
  return <section className="trex-fossil-activity" aria-label="Uncover and assemble a T-Rex fossil">
    <div className="trex-activity-heading"><strong>{activityDone ? 'T-Rex fossil complete!' : phase === 'dig' ? '1. Uncover the fossils' : '2. Build the T-Rex'}</strong><span>{phase === 'dig' ? `${found.size}/5 uncovered` : `${placed.size}/5 placed`}</span></div>
    <p className="trex-activity-message" role="status">{message}</p>
    {phase === 'dig' ? <>
      <div className="trex-dig-grid">{ORDER.map(part => <DigPiece key={`${round}-${part}`} part={part} found={found.has(part)} onFound={() => collect(part)}/>)}</div>
      <div className="trex-activity-footer"><span>Gently brush away the dirt. Keep the fossils safe.</span><button disabled={found.size !== 5} onClick={() => {setPhase('assemble'); setMessage('Drag a fossil onto its outline, or choose it and tap its spot.');}}>Build the T-Rex →</button></div>
    </> : <>
      <div className={`trex-assembly-board ${activityDone ? 'complete' : ''}`}>
        <svg ref={board} viewBox="0 0 760 260" role="group" aria-label="T-Rex skeleton assembly board">
          {PARTS.map(({id, label}) => <image key={`outline-${id}`} href={asset(id, true)} width="760" height="260" opacity={placed.has(id) ? 0 : 0.16}/>)}
          {PARTS.filter(({id}) => placed.has(id)).map(({id}) => <image key={`placed-${id}`} href={asset(id, true)} width="760" height="260"/>)}
          {PARTS.filter(({id}) => !placed.has(id)).map(({id, label}) => <rect key={id} {...layout[id]} rx="12" className={`trex-assembly-target ${selected === id ? 'selected' : ''}`} role="button" tabIndex={0} aria-label={`Place ${label}`} onClick={() => place(id)} onKeyDown={event => {if (event.key === 'Enter' || event.key === ' ') {event.preventDefault(); place(id);}}}/>)}
        </svg>
      </div>
      <div className="trex-fossil-collection" aria-label="Collected fossils">{ORDER.map(part => <button key={part} disabled={placed.has(part)} className={selected === part ? 'selected' : ''}
        onClick={() => {if (moved.current) {moved.current = false; return;} setSelected(part); setMessage('Tap the matching outline to place this fossil.');}}
        onPointerDown={event => {if (event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId); origin.current = {x: event.clientX, y: event.clientY}; moved.current = false; setSelected(part);}}
        onPointerMove={event => {if (!event.currentTarget.hasPointerCapture(event.pointerId) || !origin.current) return; if (Math.hypot(event.clientX - origin.current.x, event.clientY - origin.current.y) > 6) moved.current = true; if (moved.current) setDrag({part, x: event.clientX, y: event.clientY});}}
        onPointerUp={event => {if (moved.current) drop(part, event.clientX, event.clientY); setDrag(null); origin.current = null;}}
        onPointerCancel={() => {setDrag(null); origin.current = null; moved.current = false;}}>
        <img src={asset(part)} alt="" draggable={false}/><span>{placed.has(part) ? '✓ ' : ''}{PARTS.find(item => item.id === part)!.label}</span>
      </button>)}</div>
      <div className="trex-activity-footer"><span>{activityDone ? 'All five fossil groups fit together.' : 'Match the shapes. Each fossil snaps into place.'}</span><button onClick={replay}>Start again</button></div>
    </>}
    {drag && <img className="trex-drag-fossil" src={asset(drag.part)} style={{left: drag.x, top: drag.y}} alt=""/>}
  </section>;
};
