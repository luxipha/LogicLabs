import React, {useEffect, useRef, useState} from 'react';
import activityImage from '../../assets/alligator/Activity.png';
import {AlligatorCanvas, type AlligatorAnimation} from './AlligatorModel';

// File-loader URLs are relative to this lazy lesson chunk. Convert the emitted
// path to an absolute URL before using it in an inline background style.
const activityImageUrl = new URL(activityImage, import.meta.url).href;

type ScratchPart = {
  id: 'head' | 'teeth' | 'legs' | 'body' | 'tail';
  label: string;
  fact: string;
  position: string;
};

const MOVES: ReadonlyArray<{id: AlligatorAnimation; label: string; icon: string; message: string}> = [
  {id: 'idle', label: 'Rest', icon: '◌', message: 'The alligator rests low and still.'},
  {id: 'walk', label: 'Walk', icon: '➜', message: 'Short, strong legs carry the alligator over land.'},
  {id: 'attack', label: 'Snap', icon: 'SNAP', message: 'The powerful jaws open and snap shut.'},
  {id: 'hit', label: 'React', icon: '!', message: 'The alligator reacts quickly to danger.'},
];

const SCRATCH_PARTS: ScratchPart[] = [
  {id: 'head', label: 'Broad head', fact: 'High eyes and nostrils help an alligator watch and breathe.', position: '0% 32%'},
  {id: 'teeth', label: 'Sharp teeth', fact: 'Sharp teeth grip food when the jaws snap shut.', position: '0% 58%'},
  {id: 'legs', label: 'Strong legs', fact: 'Four short legs carry the alligator across land.', position: '42% 100%'},
  {id: 'body', label: 'Scaled body', fact: 'Tough scales protect the alligator like armor.', position: '48% 40%'},
  {id: 'tail', label: 'Long tail', fact: 'The strong tail pushes the alligator through water.', position: '100% 63%'},
];

const PUZZLE_ORDER = [4, 0, 5, 2, 1, 3];
const SOLVED_PUZZLE = [0, 1, 2, 3, 4, 5];

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
    context.fillStyle = '#76a95f';
    context.fillRect(0, 0, 240, 132);
    for (let index = 0; index < 260; index += 1) {
      context.fillStyle = index % 2 ? '#5f8f4f' : '#9ac276';
      context.fillRect((index * 43) % 240, (index * 67) % 132, 4, 4);
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
    <article className={`alligator-scratch-card ${found ? 'is-found' : ''}`}>
      <div className="alligator-scratch-window" style={{backgroundImage: `url(${activityImageUrl})`, backgroundPosition: part.position}}>
        {!found ? (
          <canvas
            key={`${part.id}-${round}`}
            ref={canvas}
            width={240}
            height={132}
            aria-label={`Scratch to reveal the ${part.label.toLowerCase()}`}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              previous.current = null;
              brush(event);
            }}
            onPointerMove={brush}
            onPointerUp={() => { previous.current = null; }}
            onPointerCancel={() => { previous.current = null; }}
          />
        ) : null}
      </div>
      <strong>{found ? `✓ ${part.label}` : 'Scratch here'}</strong>
      {!found ? (
        <>
          <progress value={coverage} max={100} aria-label={`${part.label} reveal progress`} />
          <button type="button" onClick={onFound}>Reveal</button>
        </>
      ) : <span>{part.fact}</span>}
    </article>
  );
};

export const AlligatorActivity: React.FC<{
  activityDone: boolean;
  completeActivity: () => void;
  resetActivity: () => void;
  activityStep: string;
  setActivityStep: (step: string) => void;
}> = ({activityDone, completeActivity, resetActivity, activityStep, setActivityStep}) => {
  const step = activityStep === 'scratch' ? 'scratch' : activityStep === 'rearrange' ? 'rearrange' : 'moves';
  const [animation, setAnimation] = useState<AlligatorAnimation | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [visited, setVisited] = useState<Set<AlligatorAnimation>>(
    () => new Set(activityDone ? MOVES.map((move) => move.id) : []),
  );
  const [found, setFound] = useState<Set<ScratchPart['id']>>(
    () => new Set(activityDone ? SCRATCH_PARTS.map((part) => part.id) : []),
  );
  const [tiles, setTiles] = useState(activityDone ? SOLVED_PUZZLE : PUZZLE_ORDER);
  const [selected, setSelected] = useState<number | null>(null);
  const [puzzleSolved, setPuzzleSolved] = useState(activityDone);
  const [round, setRound] = useState(0);
  const [message, setMessage] = useState('Choose a move and watch carefully.');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const stageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    if (step !== 'moves') setAnimation(null);
    if (step === 'moves') setMessage(visited.size ? 'Choose another move to watch.' : 'Choose a move and watch carefully.');
    if (step === 'scratch') setMessage(found.size === SCRATCH_PARTS.length ? 'All five body parts revealed!' : 'Rub away the green covers to reveal five body parts.');
    if (step === 'rearrange') setMessage(puzzleSolved ? 'The alligator picture is complete!' : 'Tap two pieces to swap them and rebuild the picture.');
    // Refresh the instruction only when the learner changes activity tabs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const finishIfComplete = (moveCount: number, foundCount: number, solved: boolean) => {
    if (moveCount === MOVES.length && foundCount === SCRATCH_PARTS.length && solved && !activityDone) completeActivity();
  };

  const play = (move: (typeof MOVES)[number]) => {
    setAnimation(move.id);
    setAnimationKey((value) => value + 1);
    setMessage(move.message);
    const next = new Set(visited);
    next.add(move.id);
    setVisited(next);
    finishIfComplete(next.size, found.size, puzzleSolved);
  };

  const finish = (finished: AlligatorAnimation) => {
    setMessage(MOVES.find((move) => move.id === finished)?.message ?? 'Move complete!');
  };

  const revealPart = (id: ScratchPart['id']) => {
    if (found.has(id)) return;
    const next = new Set(found);
    next.add(id);
    setFound(next);
    setMessage(next.size === SCRATCH_PARTS.length ? 'All five body parts revealed!' : 'Great discovery! Reveal another body part.');
    finishIfComplete(visited.size, next.size, puzzleSolved);
  };

  const selectTile = (index: number) => {
    if (puzzleSolved) return;
    if (selected === null) {
      setSelected(index);
      setMessage('Now tap the piece you want to swap with it.');
      return;
    }
    if (selected === index) {
      setSelected(null);
      setMessage('Choose a different piece to swap.');
      return;
    }
    const next = [...tiles];
    [next[selected], next[index]] = [next[index], next[selected]];
    setTiles(next);
    setSelected(null);
    const solved = next.every((tile, tileIndex) => tile === tileIndex);
    setPuzzleSolved(solved);
    setMessage(solved ? 'The alligator picture is complete!' : 'Good swap. Keep matching the picture pieces.');
    finishIfComplete(visited.size, found.size, solved);
  };

  const tryAgain = () => {
    setAnimation(null);
    setAnimationKey((value) => value + 1);
    setVisited(new Set());
    setFound(new Set());
    setTiles(PUZZLE_ORDER);
    setSelected(null);
    setPuzzleSolved(false);
    setRound((value) => value + 1);
    setMessage('Choose a move and watch carefully.');
    setActivityStep('puzzle');
    resetActivity();
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else stageRef.current?.requestFullscreen?.().catch(() => {});
  };

  const badge = step === 'moves'
    ? `MOVES ${visited.size}/${MOVES.length}`
    : step === 'scratch'
      ? `REVEALED ${found.size}/${SCRATCH_PARTS.length}`
      : puzzleSolved ? 'PUZZLE COMPLETE' : '6-PIECE PUZZLE';
  const title = activityDone
    ? 'Alligator mission complete!'
    : step === 'moves' ? 'Try every alligator move' : step === 'scratch' ? 'Scratch to reveal' : 'Rearrange the picture';

  return (
    <section className="alligator-activity" ref={stageRef} aria-label="Alligator learning activities">
      {step === 'moves' ? (
        <AlligatorCanvas
          mode="activity"
          animation={animation}
          animationKey={animationKey}
          onAnimationFinished={finish}
        />
      ) : step === 'scratch' ? (
        <div className="alligator-scratch-grid">
          {SCRATCH_PARTS.map((part) => (
            <ScratchCard
              key={`${part.id}-${round}`}
              part={part}
              found={found.has(part.id)}
              round={round}
              onFound={() => revealPart(part.id)}
            />
          ))}
        </div>
      ) : (
        <div className={`alligator-puzzle-board ${puzzleSolved ? 'is-solved' : ''}`} aria-label="Rearrange the alligator picture">
          {tiles.map((tile, index) => (
            <button
              type="button"
              key={tile}
              className={`alligator-puzzle-tile ${selected === index ? 'is-selected' : ''}`}
              style={{
                backgroundImage: `url(${activityImageUrl})`,
                backgroundPosition: `${tile % 3 * 50}% ${Math.floor(tile / 3) * 100}%`,
              }}
              aria-label={`Puzzle piece ${index + 1}`}
              onClick={() => selectTile(index)}
            />
          ))}
        </div>
      )}

      <div className="alligator-activity__top">
        <span className="alligator-activity__badge">{badge}</span>
        <strong>{title}</strong>
      </div>
      <div className="alligator-activity__panel">
        <p role="status">{message}</p>
        <div className="alligator-activity__controls">
          {step === 'moves' ? MOVES.map((move) => (
            <button
              key={move.id}
              type="button"
              className={visited.has(move.id) ? 'is-complete' : ''}
              onClick={() => play(move)}
            >
              <span aria-hidden="true">{visited.has(move.id) ? '✓' : move.icon}</span>
              {move.label}
            </button>
          )) : null}
          {activityDone ? <button type="button" className="primary-action" onClick={tryAgain}>↻ Try again</button> : null}
          <button type="button" className="game-frame-fullscreen" onClick={toggleFullscreen}>
            {isFullscreen ? '⛶ Exit' : '⛶ Fullscreen'}
          </button>
        </div>
      </div>
    </section>
  );
};
