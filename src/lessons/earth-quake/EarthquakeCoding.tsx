import React, {useState} from 'react';
import './earthquake-coding.css';

const stages = ['Start with Button A', 'Give three warnings', 'Move, then stop', 'Store a shaking level', 'Decrease the stored value', 'Repeat while the level is above 4', 'Complete the earthquake machine'];

export function EarthquakeCoding() {
  const [step, setStep] = useState(0);
  const [fullProgram, setFullProgram] = useState(false);
  const previous = () => setStep(current => Math.max(0, current - 1));
  const next = () => setStep(current => Math.min(stages.length - 1, current + 1));
  return <section className="eq-coding" aria-label="Earthquake coding stages" tabIndex={0} onKeyDown={event => {
    if (event.key === 'ArrowLeft') {event.preventDefault(); previous();}
    if (event.key === 'ArrowRight') {event.preventDefault(); next();}
  }}>
    <header className="eq-coding__header"><strong>Earthquake Coding</strong><div><button aria-pressed={!fullProgram} onClick={() => setFullProgram(false)}>Step close-up</button><button aria-pressed={fullProgram} onClick={() => setFullProgram(true)}>Full program</button></div></header>
    <div className="eq-coding__image"><img src={`assets/earthquake-code/${fullProgram ? 'full-' : ''}${step + 1}.png`} alt={`Stage ${step + 1}: ${stages[step]}. ${fullProgram ? 'Complete program' : 'Close-up excerpt'} rendered with authentic Nezha V2 MakeCode blocks, observations, and a discussion question.`} draggable={false} /></div>
    <nav className="eq-coding__navigation" aria-label="Coding stages">
      <button onClick={previous} disabled={step === 0}>← Previous</button>
      <span role="status" aria-live="polite">{step + 1} / {stages.length}</span>
      <button onClick={next} disabled={step === stages.length - 1}>Next →</button>
    </nav>
  </section>;
}
