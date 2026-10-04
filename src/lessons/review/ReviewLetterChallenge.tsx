import React, {useState} from 'react';
import rooster from '../../assets/review/letter-challenge/rooster.png';
import snail from '../../assets/review/letter-challenge/snail.png';
import snake from '../../assets/review/letter-challenge/snake.png';
import camel from '../../assets/review/letter-challenge/camel.png';
import nail from '../../assets/review/letter-challenge/nail.png';
import kangaroo from '../../assets/review/letter-challenge/kangaroo.png';
import ladybug from '../../assets/review/letter-challenge/ladybug.png';
import alligator from '../../assets/review/letter-challenge/alligator.png';

// Lazy lesson chunks live under assets/chunks. Resolve every emitted card
// against this module, rather than the nested lesson URL, so the pictures
// also work at /LogicLabs/lessons/review.
const imageUrl = (asset: string) => new URL(asset, import.meta.url).href;
const roosterUrl = imageUrl(rooster);
const snailUrl = imageUrl(snail);
const snakeUrl = imageUrl(snake);
const camelUrl = imageUrl(camel);
const nailUrl = imageUrl(nail);
const kangarooUrl = imageUrl(kangaroo);
const ladybugUrl = imageUrl(ladybug);
const alligatorUrl = imageUrl(alligator);

type Choice = {word: string; image: string};
type Question = {letter: string; correct: string; choices: readonly Choice[]};

const QUESTIONS: readonly Question[] = [
  {letter: 'R', correct: 'Rooster', choices: [{word: 'Rooster', image: roosterUrl}, {word: 'Snail', image: snailUrl}]},
  {letter: 'S', correct: 'Snake', choices: [{word: 'Snake', image: snakeUrl}, {word: 'Camel', image: camelUrl}]},
  {letter: 'N', correct: 'Nail', choices: [{word: 'Nail', image: nailUrl}, {word: 'Kangaroo', image: kangarooUrl}]},
  {letter: 'C', correct: 'Camel', choices: [{word: 'Camel', image: camelUrl}, {word: 'Snail', image: snailUrl}]},
  {letter: 'K', correct: 'Kangaroo', choices: [{word: 'Kangaroo', image: kangarooUrl}, {word: 'Ladybug', image: ladybugUrl}]},
  {letter: 'L', correct: 'Ladybug', choices: [{word: 'Ladybug', image: ladybugUrl}, {word: 'Alligator', image: alligatorUrl}]},
];

const shuffle = <T,>(items: readonly T[]): T[] => [...items].sort(() => Math.random() - 0.5);

export const ReviewLetterChallenge: React.FC<{
  activityDone: boolean;
  completeActivity: () => void;
  resetActivity: () => void;
}> = ({activityDone, completeActivity, resetActivity}) => {
  const [questionOrder, setQuestionOrder] = useState<number[]>(() => shuffle(QUESTIONS.map((_, index) => index)));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [choiceOrder, setChoiceOrder] = useState<Choice[]>(() => shuffle(QUESTIONS[questionOrder[0]].choices));
  const [score, setScore] = useState(0);
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const [correctChoice, setCorrectChoice] = useState<string | null>(null);

  const question = QUESTIONS[questionOrder[questionIndex]];
  const complete = questionIndex === QUESTIONS.length;

  const choose = (choice: Choice) => {
    if (wrongChoice || correctChoice || complete) return;
    if (choice.word === question.correct) {
      setCorrectChoice(choice.word);
      setScore((value) => value + 1);
      return;
    }
    setWrongChoice(choice.word);
    window.setTimeout(() => setWrongChoice(null), 420);
  };

  const next = () => {
    if (questionIndex + 1 === QUESTIONS.length) {
      setQuestionIndex(QUESTIONS.length);
      completeActivity();
      return;
    }
    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);
    setChoiceOrder(shuffle(QUESTIONS[questionOrder[nextIndex]].choices));
    setWrongChoice(null);
    setCorrectChoice(null);
  };

  const playAgain = () => {
    const order = shuffle(QUESTIONS.map((_, index) => index));
    setQuestionOrder(order);
    setQuestionIndex(0);
    setChoiceOrder(shuffle(QUESTIONS[order[0]].choices));
    setScore(0);
    setWrongChoice(null);
    setCorrectChoice(null);
    resetActivity();
  };

  if (complete) {
    return (
      <section className="review-letter-game review-letter-game--finish" aria-live="polite">
        <span className="review-letter-game__trophy" aria-hidden="true">★</span>
        <h2>Great job!</h2>
        <p>You found all {QUESTIONS.length} beginning sounds.</p>
        <strong>{score} / {QUESTIONS.length} stars</strong>
        <button type="button" className="review-letter-game__action" onClick={playAgain}>Play again</button>
      </section>
    );
  }

  return (
    <section className="review-letter-game" aria-label="Letter Challenge">
      <header className="review-letter-game__header">
        <div><span>GAME 1 · LETTER CHALLENGE</span><strong>Question {questionIndex + 1} of {QUESTIONS.length}</strong></div>
        <b aria-label={`${score} stars`}>★ {score}</b>
      </header>
      <div className="review-letter-game__card">
        <p>Which picture starts with...</p>
        <div className="review-letter-game__letter">{question.letter}</div>
        <span>Tap the correct picture</span>
        <div className="review-letter-game__choices">
          {choiceOrder.map((choice) => (
            <button
              key={choice.word}
              type="button"
              className={`${wrongChoice === choice.word ? 'is-wrong' : ''} ${correctChoice === choice.word ? 'is-correct' : ''}`}
              onClick={() => choose(choice)}
              disabled={Boolean(correctChoice)}
              aria-label={choice.word}
            >
              <img src={choice.image} alt={choice.word} />
            </button>
          ))}
        </div>
        <div className="review-letter-game__feedback" aria-live="polite">
          {correctChoice ? `✓ ${question.correct} starts with ${question.letter}!` : wrongChoice ? 'Try again!' : ''}
        </div>
        {correctChoice ? <button type="button" className="review-letter-game__action" onClick={next}>Next →</button> : null}
      </div>
    </section>
  );
};
