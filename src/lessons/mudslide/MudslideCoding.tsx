import React, {useState} from 'react';
import './mudslide-coding.css';

const stages = [
  'Write the warning text',
  'Join the warning text',
  'Release the mudslide',
  'Store the safe location',
  'Return to a safe state',
  'Test the full safety system',
  'Upgrade the warning sound',
  'Explore the gears',
];

export const MudslideCoding: React.FC = () => {
  const [step, setStep] = useState(0);
  const previous = () => setStep((current) => Math.max(0, current - 1));
  const next = () => setStep((current) => Math.min(stages.length - 1, current + 1));
  return <section className="mudslide-coding" aria-label="Mudslide coding stages" tabIndex={0} onKeyDown={(event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); previous(); }
    if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
  }}>
    <header><strong>Mudslide Coding</strong><span>Stage {step + 1}: {stages[step]}</span></header>
    <div className="mudslide-coding__image"><img src={`assets/mudslide-code/${step + 1}.png`} alt={`Mudslide coding stage ${step + 1}: ${stages[step]}. Authentic Nezha V2 MakeCode blocks with prediction, observation, and explanation prompts.`} draggable={false} /></div>
    <nav aria-label="Mudslide coding stages"><button type="button" onClick={previous} disabled={step === 0}>← Previous</button><span role="status" aria-live="polite">{step + 1} / {stages.length}</span><button type="button" onClick={next} disabled={step === stages.length - 1}>Next →</button></nav>
  </section>;
};
