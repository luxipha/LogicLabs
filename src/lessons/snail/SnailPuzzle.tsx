import React, {useEffect, useRef, useState} from 'react';
import snailPicture from '../../assets/snail/5.png';

const puzzleImage = new URL(snailPicture, import.meta.url).href;

export const SNAIL_PUZZLE_START = [2, 7, 0, 8, 4, 1, 6, 3, 5];
export const isSnailPuzzleSolved = (tiles: number[]) => tiles.every((tile, index) => tile === index);

export const SnailPuzzle: React.FC<{
  tiles: number[];
  onChange: (tiles: number[]) => void;
  onRestart: () => void;
  crawlDone: boolean;
}> = ({tiles, onChange, onRestart, crawlDone}) => {
  const ref = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const solved = isSnailPuzzleSolved(tiles);
  useEffect(() => {
    const changed = () => setFullscreen(document.fullscreenElement === ref.current);
    document.addEventListener('fullscreenchange', changed);
    return () => document.removeEventListener('fullscreenchange', changed);
  }, []);
  const swap = (index: number) => {
    if (solved) return;
    if (selected === null) { setSelected(index); return; }
    if (selected !== index) {
      const next = [...tiles];
      [next[selected], next[index]] = [next[index], next[selected]];
      onChange(next);
    }
    setSelected(null);
  };
  const shuffle = () => {
    const next = Array.from({length: 9}, (_, index) => index);
    for (let index = next.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [next[index], next[other]] = [next[other], next[index]];
    }
    if (isSnailPuzzleSolved(next)) [next[0], next[1]] = [next[1], next[0]];
    setSelected(null);
    onChange(next);
  };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void ref.current?.requestFullscreen?.().catch(() => {});
  };
  return <section ref={ref} className="snail-picture-puzzle" aria-label="Snail picture puzzle">
    <div className="snail-puzzle-controls" role="group" aria-label="Puzzle controls"><button type="button" onClick={shuffle}>Shuffle</button><button type="button" onClick={() => {setSelected(null); onRestart();}}>↻ Try again</button><button type="button" onClick={toggleFullscreen}>{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button></div>
    <header><strong>Activity 2: Build the snail picture</strong><span>{tiles.filter((tile, index) => tile === index).length} / 9 in place</span></header>
    <p role="status">{solved ? (crawlDone ? 'Both activities complete! Well done.' : 'Picture complete! Try Activity 1: Crawl to the leaf.') : selected === null ? 'Tap two tiles to swap them and rebuild the snail picture.' : 'Now tap another tile to swap their places.'}</p>
    <div className="snail-puzzle-space"><div className="snail-puzzle-board" aria-label="Nine picture tiles">
      {tiles.map((tile, index) => <button type="button" key={tile} disabled={solved} aria-label={`Puzzle tile ${index + 1}`} aria-pressed={selected === index} className={`snail-puzzle-tile${selected === index ? ' selected' : ''}`} style={{backgroundImage: `url(${puzzleImage})`, backgroundPosition: `${tile % 3 * 50}% ${Math.floor(tile / 3) * 50}%`}} onClick={() => swap(index)}/>)}
    </div></div>
  </section>;
};
