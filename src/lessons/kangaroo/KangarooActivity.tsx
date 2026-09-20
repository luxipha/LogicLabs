import React, {useEffect, useRef, useState} from 'react';

type ScratchPart = {
  id: 'legs' | 'arms' | 'tail' | 'pouch';
  label: string;
  fact: string;
  position: string;
};

const PUZZLE_IMAGE = 'assets/Kangaroo/Puzzle.png';
const PUZZLE_ORDER = [2, 7, 0, 8, 4, 1, 6, 3, 5];
const SCRATCH_PARTS: ScratchPart[] = [
  {id: 'legs', label: 'Big legs', fact: 'Big, strong legs help a kangaroo jump high.', position: '82% 86%'},
  {id: 'arms', label: 'Small arms', fact: 'The kangaroo has small arms near its chest.', position: '66% 42%'},
  {id: 'tail', label: 'Long tail', fact: 'The long tail helps the kangaroo balance.', position: '92% 76%'},
  {id: 'pouch', label: 'Pouch', fact: 'A pouch is a safe pocket for a joey.', position: '73% 62%'},
];

const ScratchCard: React.FC<{
  part: ScratchPart;
  found: boolean;
  round: number;
  onFound: () => void;
}> = ({part, found, round, onFound}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const cells = useRef(new Set<number>());
  const previous = useRef<{x: number; y: number} | null>(null);
  const finished = useRef(found);
  const [coverage, setCoverage] = useState(found ? 100 : 0);

  useEffect(() => {
    finished.current = found;
    cells.current = new Set();
    setCoverage(found ? 100 : 0);
    if (found) return;
    const context = canvas.current?.getContext('2d');
    if (!context) return;
    context.globalCompositeOperation = 'source-over';
    context.fillStyle = '#f0c56d';
    context.fillRect(0, 0, 240, 132);
    for (let index = 0; index < 260; index += 1) {
      context.fillStyle = index % 2 ? '#e1aa4c' : '#f8d98e';
      context.fillRect((index * 43) % 240, (index * 67) % 132, 3, 3);
    }
    context.globalCompositeOperation = 'destination-out';
  }, [found, round]);

  const brush = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (finished.current || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const point = {
      x: (event.clientX - rect.left) / rect.width * 240,
      y: (event.clientY - rect.top) / rect.height * 132,
    };
    const start = previous.current ?? point;
    const steps = Math.max(1, Math.ceil(Math.hypot(point.x - start.x, point.y - start.y) / 5));
    const context = event.currentTarget.getContext('2d');
    for (let step = 0; step <= steps; step += 1) {
      const x = start.x + (point.x - start.x) * step / steps;
      const y = start.y + (point.y - start.y) * step / steps;
      context?.beginPath();
      context?.arc(x, y, 17, 0, Math.PI * 2);
      context?.fill();
      for (let row = 0; row < 13; row += 1) {
        for (let column = 0; column < 24; column += 1) {
          if (Math.hypot(column * 10 + 5 - x, row * 10 + 5 - y) <= 17) cells.current.add(row * 24 + column);
        }
      }
    }
    previous.current = point;
    const percent = Math.round(cells.current.size / 312 * 100);
    setCoverage(percent);
    if (percent >= 58) {
      finished.current = true;
      onFound();
    }
  };

  return (
    <article className={`kangaroo-scratch-card ${found ? 'found' : ''}`}>
      <div className="kangaroo-scratch-window" style={{backgroundImage: `url(${PUZZLE_IMAGE})`, backgroundPosition: part.position}}>
        {!found && (
          <canvas
            key={`${part.id}-${round}`}
            ref={canvas}
            width={240}
            height={132}
            aria-label={`Scratch to reveal the ${part.label.toLowerCase()}`}
            onPointerDown={(event) => {event.currentTarget.setPointerCapture(event.pointerId); previous.current = null; brush(event);}}
            onPointerMove={brush}
            onPointerUp={() => {previous.current = null;}}
            onPointerCancel={() => {previous.current = null;}}
          />
        )}
      </div>
      <strong>{found ? `✓ ${part.label}` : 'Scratch here'}</strong>
      {!found ? <progress value={coverage} max={100} aria-label={`${part.label} reveal progress`} /> : <span>{part.fact}</span>}
      {!found && <button type="button" className="kangaroo-reveal-button" onClick={onFound}>Reveal</button>}
    </article>
  );
};

export const KangarooActivity: React.FC<{
  activityDone: boolean;
  completeActivity: () => void;
  resetActivity: () => void;
  activityStep: string;
  setActivityStep: (step: string) => void;
}> = ({activityDone, completeActivity, resetActivity, activityStep, setActivityStep}) => {
  const step = activityStep === 'scratch' ? 'scratch' : 'puzzle';
  const stageRef = useRef<HTMLElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tiles, setTiles] = useState(PUZZLE_ORDER);
  const [selected, setSelected] = useState<number | null>(null);
  const [puzzleSolved, setPuzzleSolved] = useState(activityDone);
  const [found, setFound] = useState<Set<ScratchPart['id']>>(() => new Set(activityDone ? SCRATCH_PARTS.map(part => part.id) : []));
  const [round, setRound] = useState(0);
  const [message, setMessage] = useState('Tap two tiles to swap them and rebuild the kangaroo picture.');

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else stageRef.current?.requestFullscreen?.().catch(() => {});
  };

  const selectTile = (index: number) => {
    if (puzzleSolved) return;
    if (selected === null) {
      setSelected(index);
      setMessage('Now tap the tile that should go in that spot.');
      return;
    }
    if (selected === index) {
      setSelected(null);
      return;
    }
    const next = [...tiles];
    [next[selected], next[index]] = [next[index], next[selected]];
    setTiles(next);
    setSelected(null);
    if (next.every((tile, tileIndex) => tile === tileIndex)) {
      setPuzzleSolved(true);
      setActivityStep('scratch');
      setMessage(found.size === SCRATCH_PARTS.length ? 'Both activities complete! Great kangaroo detective work.' : 'Picture complete! Now choose Activity 2 and scratch to find body parts.');
      if (found.size === SCRATCH_PARTS.length) completeActivity();
    } else {
      setMessage('Keep going. Look at the sky, grass, and kangaroo shapes.');
    }
  };

  const revealPart = (id: ScratchPart['id']) => {
    if (found.has(id)) return;
    const next = new Set(found);
    next.add(id);
    setFound(next);
    if (next.size === SCRATCH_PARTS.length) {
      setMessage(puzzleSolved ? 'Both activities complete! Great kangaroo detective work.' : 'Activity 2 complete! Finish Activity 1 to complete the mission.');
      if (puzzleSolved) completeActivity();
    } else {
      setMessage('Nice find! Scratch another window to reveal a body part.');
    }
  };

  const tryAgain = () => {
    setActivityStep('puzzle');
    setTiles(PUZZLE_ORDER);
    setSelected(null);
    setPuzzleSolved(false);
    setFound(new Set());
    setRound(value => value + 1);
    setMessage('Tap two tiles to swap them and rebuild the kangaroo picture.');
    resetActivity();
  };

  return (
    <section className="kangaroo-activity" ref={stageRef} aria-label="Kangaroo puzzle and scratch activity">
      <header className="kangaroo-activity-heading">
        <div><strong>{activityDone ? 'Kangaroo mission complete!' : step === 'puzzle' ? '1. Build the kangaroo picture' : '2. Scratch to discover'}</strong><span>{step === 'puzzle' ? (puzzleSolved ? 'Ready' : 'Tile puzzle') : `${found.size}/${SCRATCH_PARTS.length} body parts`}</span></div>
        {activityDone && <button type="button" className="kangaroo-try-again" onClick={tryAgain}>↻ Try again</button>}
      </header>
      <p className="kangaroo-activity-message" role="status">{message}</p>
      {step === 'puzzle' ? (
        <>
          <div className="kangaroo-puzzle-board" aria-label="Kangaroo picture puzzle">
            {tiles.map((tile, index) => <button
              type="button"
              key={tile}
              className={`kangaroo-puzzle-tile ${selected === index ? 'selected' : ''}`}
              style={{backgroundImage: `url(${PUZZLE_IMAGE})`, backgroundPosition: `${tile % 3 * 50}% ${Math.floor(tile / 3) * 50}%`}}
              aria-label={`Puzzle tile ${index + 1}`}
              onClick={() => selectTile(index)}
            />)}
          </div>
          <div className="kangaroo-activity-footer"><span>Each tile belongs in a matching part of the picture.</span><div className="kangaroo-activity-actions"><button type="button" onClick={() => {setTiles([...PUZZLE_ORDER].sort(() => Math.random() - 0.5)); setSelected(null);}}>Shuffle</button><button type="button" className="game-frame-fullscreen kangaroo-fullscreen" onClick={toggleFullscreen}>{isFullscreen ? '⛶ Exit' : '⛶ Fullscreen'}</button></div></div>
        </>
      ) : (
        <>
          <div className="kangaroo-scratch-grid">{SCRATCH_PARTS.map(part => <ScratchCard key={`${part.id}-${round}`} part={part} found={found.has(part.id)} round={round} onFound={() => revealPart(part.id)} />)}</div>
          <div className="kangaroo-activity-footer"><span>Use a finger, mouse, or classroom pointer to rub away the golden cover.</span><div className="kangaroo-activity-actions">{activityDone && <button type="button" onClick={tryAgain}>Start again</button>}<button type="button" className="game-frame-fullscreen kangaroo-fullscreen" onClick={toggleFullscreen}>{isFullscreen ? '⛶ Exit' : '⛶ Fullscreen'}</button></div></div>
        </>
      )}
    </section>
  );
};
