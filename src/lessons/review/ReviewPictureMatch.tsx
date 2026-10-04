import React, {useMemo, useState} from 'react';
import rooster from '../../assets/review/letter-challenge/rooster.png';
import snake from '../../assets/review/letter-challenge/snake.png';
import camel from '../../assets/review/letter-challenge/camel.png';
import nail from '../../assets/review/letter-challenge/nail.png';
import kangaroo from '../../assets/review/letter-challenge/kangaroo.png';
import ladybug from '../../assets/review/letter-challenge/ladybug.png';
import alligator from '../../assets/review/letter-challenge/alligator.png';

const imageUrl = (asset: string) => new URL(asset, import.meta.url).href;
const MATCHES = [
  {letter: 'R', word: 'Rooster', image: imageUrl(rooster)},
  {letter: 'S', word: 'Snake', image: imageUrl(snake)},
  {letter: 'C', word: 'Camel', image: imageUrl(camel)},
  {letter: 'N', word: 'Nail', image: imageUrl(nail)},
  {letter: 'K', word: 'Kangaroo', image: imageUrl(kangaroo)},
  {letter: 'L', word: 'Ladybug', image: imageUrl(ladybug)},
  {letter: 'A', word: 'Alligator', image: imageUrl(alligator)},
] as const;

export const ReviewPictureMatch: React.FC<{completeActivity: () => void}> = ({completeActivity}) => {
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const cards = useMemo(() => [...MATCHES].sort(() => Math.random() - .5), []);
  const done = matched.size === MATCHES.length;

  const match = (letter: string, cardLetter = selected) => {
    const selectedCard = MATCHES.find((item) => item.letter === cardLetter);
    if (!selectedCard || done) return;
    if (selectedCard.letter === letter) {
      const next = new Set(matched).add(letter);
      setMatched(next);
      setSelected(null);
      if (next.size === MATCHES.length) completeActivity();
      return;
    }
    setWrong(letter);
    window.setTimeout(() => setWrong(null), 460);
  };

  if (done) return <div className="review-match review-match--finish"><span>★</span><h2>You matched every picture!</h2><p>Great sound and letter work.</p></div>;

  return (
    <section className="review-match" aria-label="Match pictures to letters">
      <header><span>GAME 2 · MATCH PICTURES</span><strong>Drag each picture to its first letter.</strong><p>Or tap a picture, then tap its letter.</p></header>
      <div className="review-match__board">
        <div className="review-match__cards" aria-label="Picture cards">
          {cards.filter((card) => !matched.has(card.letter)).map((card) => (
            <button
              key={card.letter}
              type="button"
              draggable
              className={`${selected === card.letter ? 'is-selected' : ''} ${dragging === card.letter ? 'is-dragging' : ''}`}
              onClick={() => setSelected(card.letter)}
              onDragStart={(event) => { event.dataTransfer.setData('text/plain', card.letter); event.dataTransfer.effectAllowed = 'move'; setSelected(card.letter); setDragging(card.letter); }}
              onDragEnd={() => setDragging(null)}
              aria-label={`${card.word}, starts with ${card.letter}`}
            >
              <img src={card.image} alt={card.word} /><span>{card.word}</span>
            </button>
          ))}
        </div>
        <div className="review-match__targets" aria-label="Letter targets">
          {MATCHES.map((target) => (
            <button
              key={target.letter}
              type="button"
              className={`${matched.has(target.letter) ? 'is-matched' : ''} ${wrong === target.letter ? 'is-wrong' : ''} ${dragging ? 'is-drop-ready' : ''}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => { event.preventDefault(); match(target.letter, event.dataTransfer.getData('text/plain')); setDragging(null); }}
              onClick={() => match(target.letter)}
              disabled={matched.has(target.letter)}
            >
              <b>{target.letter}</b>{matched.has(target.letter) ? <span>{target.word}</span> : <small>Drop here</small>}
            </button>
          ))}
        </div>
      </div>
      <div className="review-match__feedback" aria-live="polite">{wrong ? 'That picture starts with a different letter. Try again!' : selected ? `Now find the letter ${selected}.` : `Matched ${matched.size} of ${MATCHES.length}`}</div>
    </section>
  );
};
