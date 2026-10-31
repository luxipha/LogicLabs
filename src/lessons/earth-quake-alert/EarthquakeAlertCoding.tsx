import React, {useState} from 'react';
import manifest from './coding-stages.json';
import '../earth-quake/earthquake-coding.css';

export function EarthquakeAlertCoding() {
  const [step, setStep] = useState(0);
  const [fullProgram, setFullProgram] = useState(false);
  const stage = manifest.stages[step];
  const imageUrl = `assets/earthquake-alert-code/${fullProgram ? 'full-' : ''}${step + 1}.png`;
  const previous = () => setStep(current => Math.max(0, current - 1));
  const next = () => setStep(current => Math.min(manifest.stages.length - 1, current + 1));
  return <section className="eq-coding" aria-label="Earth Quake Alert coding stages" tabIndex={0} onKeyDown={event => {
    if (event.key === 'ArrowLeft') {event.preventDefault(); previous();}
    if (event.key === 'ArrowRight') {event.preventDefault(); next();}
  }}>
    <header className="eq-coding__header"><strong>Earth Quake Alert Coding</strong><div>
      <button aria-pressed={!fullProgram} onClick={() => setFullProgram(false)}>Step close-up</button>
      <button aria-pressed={fullProgram} onClick={() => setFullProgram(true)}>Full program</button>
      <a href={imageUrl} target="_blank" rel="noreferrer">Open full-size image ↗</a>
    </div></header>
    <div className="eq-coding__image"><img src={imageUrl} alt={`Stage ${step + 1}: ${stage.title}. ${fullProgram ? 'Complete runnable program' : 'Teaching card with authentic MakeCode blocks'}. ${stage.adds} Predict: ${stage.predict} Observe: ${stage.observe.join(' ')} Explain: ${stage.question}`} draggable={false} /></div>
    <nav className="eq-coding__navigation" aria-label="Coding stages">
      <button onClick={previous} disabled={step === 0}>← Previous</button>
      <span role="status" aria-live="polite">{step + 1} / {manifest.stages.length}</span>
      <button onClick={next} disabled={step === manifest.stages.length - 1}>Next →</button>
    </nav>
  </section>;
}
