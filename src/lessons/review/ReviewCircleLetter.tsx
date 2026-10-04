import React, {useMemo, useState} from 'react';
import rooster from '../../assets/review/letter-challenge/rooster.png';
import snake from '../../assets/review/letter-challenge/snake.png';
import camel from '../../assets/review/letter-challenge/camel.png';
import nail from '../../assets/review/letter-challenge/nail.png';
import kangaroo from '../../assets/review/letter-challenge/kangaroo.png';
import ladybug from '../../assets/review/letter-challenge/ladybug.png';
import alligator from '../../assets/review/letter-challenge/alligator.png';

const imageUrl = (asset: string) => new URL(asset, import.meta.url).href;
const CARDS = [
  {letter: 'R', word: 'Rooster', image: imageUrl(rooster), options: ['R', 'S', 'A']},
  {letter: 'S', word: 'Snake', image: imageUrl(snake), options: ['C', 'S', 'L']},
  {letter: 'C', word: 'Camel', image: imageUrl(camel), options: ['K', 'C', 'N']},
  {letter: 'N', word: 'Nail', image: imageUrl(nail), options: ['N', 'R', 'A']},
  {letter: 'K', word: 'Kangaroo', image: imageUrl(kangaroo), options: ['S', 'K', 'C']},
  {letter: 'L', word: 'Ladybug', image: imageUrl(ladybug), options: ['A', 'L', 'N']},
  {letter: 'A', word: 'Alligator', image: imageUrl(alligator), options: ['R', 'A', 'K']},
] as const;

export const ReviewCircleLetter: React.FC<{completeActivity: () => void}> = ({completeActivity}) => {
  const order = useMemo(() => [...CARDS].sort(() => Math.random() - .5), []);
  const [index, setIndex] = useState(0);
  const [circleReady, setCircleReady] = useState(false);
  const [circled, setCircled] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const card = order[index];
  const complete = index === order.length;

  const circle = (letter: string, force = false) => {
    if ((!circleReady && !circled && !force) || complete) return;
    if (letter === card.letter) { setCircled(letter); setCircleReady(false); return; }
    setWrong(letter);
    window.setTimeout(() => setWrong(null), 420);
  };
  const next = () => {
    if (index + 1 === order.length) { setIndex(order.length); completeActivity(); return; }
    setIndex(index + 1); setCircled(null); setCircleReady(false); setWrong(null);
  };
  if (complete) return <div className="review-circle review-circle--finish"><span>★</span><h2>You circled every right letter!</h2><p>Wonderful work.</p></div>;

  return (
    <section className="review-circle" aria-label="Circle the first letter">
      <header><span>GAME 3 · CIRCLE THE LETTER</span><strong>Drag the circle around the letter that starts {card.word}.</strong></header>
      <div className="review-circle__card">
        <img src={card.image} alt={card.word} />
        <div className="review-circle__letters" aria-label="Letter choices">
          <button className={`review-circle__ring ${circleReady ? 'is-ready' : ''}`} type="button" draggable onDragStart={() => setCircleReady(true)} onClick={() => setCircleReady(true)} aria-label="Drag or tap the circle">◯</button>
          {card.options.map((letter) => <button key={letter} type="button" className={`${circled === letter ? 'is-circled' : ''} ${wrong === letter ? 'is-wrong' : ''}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); circle(letter, true); }} onClick={() => circle(letter)}>{letter}</button>)}
        </div>
        <div className="review-circle__feedback" aria-live="polite">{circled ? `✓ ${card.word} starts with ${card.letter}!` : wrong ? 'Try another letter.' : circleReady ? 'Now drop the circle on a letter.' : 'Drag the circle to a letter, or tap the circle first.'}</div>
        {circled ? <button type="button" className="review-letter-game__action" onClick={next}>Next →</button> : null}
      </div>
    </section>
  );
};
