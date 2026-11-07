import React, {useState} from 'react';
import manifest from './coding-stages.json';
import './elephant-coding.css';

type View = 'blocks' | 'card' | 'full';
export function ElephantCoding() {
  const [step, setStep] = useState(0);
  const [view, setView] = useState<View>('blocks');
  const stage = manifest.stages[step];
  const excerpt = 'focusCode' in stage;
  const imageUrl = `assets/elephant-code/${view === 'full' ? 'full-' : view === 'blocks' ? 'blocks-' : ''}${step + 1}.png`;
  const previous = () => setStep(current => Math.max(0, current - 1));
  const next = () => setStep(current => Math.min(manifest.stages.length - 1, current + 1));
  return <section className="elephant-coding" aria-label="Elephant coding stages" tabIndex={0} onKeyDown={event => {
    if (event.key === 'ArrowLeft') {event.preventDefault(); previous();}
    if (event.key === 'ArrowRight') {event.preventDefault(); next();}
  }}>
    <header className="elephant-coding__header"><strong>Elephant Coding</strong><div>
      <button aria-pressed={view === 'blocks'} onClick={() => setView('blocks')}>Step close-up</button>
      <button aria-pressed={view === 'card'} onClick={() => setView('card')}>Teaching card</button>
      <button aria-pressed={view === 'full'} onClick={() => setView('full')}>Full program</button>
      <a href={imageUrl} target="_blank" rel="noreferrer">Open full-size image ↗</a>
    </div></header>
    <h2>{step + 1}. {stage.title}</h2>
    <div className={`elephant-coding__body ${view === 'blocks' ? '' : 'elephant-coding__body--image'}`}>
      <div className="elephant-coding__image"><img key={imageUrl} src={imageUrl} alt={`${stage.title}. Authentic MakeCode Nezha blocks. ${view === 'full' ? 'Complete runnable program.' : excerpt ? `Excerpt: ${stage.focusNote}` : 'Complete runnable program.'}`} draggable={false} /></div>
      {view === 'blocks' ? <div className="elephant-coding__guide">
        <p><strong>Learn</strong>{stage.concept}</p>
        <p><strong>Predict</strong>{stage.predict}</p>
        <p><strong>Build</strong>{stage.adds}</p>
        {excerpt ? <p className="elephant-coding__excerpt"><strong>Excerpt</strong>{stage.focusNote} Use Full program for all blocks.</p> : null}
        <p><strong>Run</strong>Download to micro:bit V2, then touch its logo. Test the servo on the physical build.</p>
        <div><strong>Observe</strong><ul>{stage.observe.map(item => <li key={item}>{item}</li>)}</ul></div>
        <p><strong>Explain</strong>{stage.question}</p>
      </div> : null}
    </div>
    <nav className="elephant-coding__navigation" aria-label="Coding stages">
      <button onClick={previous} disabled={step === 0}>← Previous</button>
      <span role="status" aria-live="polite">{step + 1} / {manifest.stages.length}</span>
      <button onClick={next} disabled={step === manifest.stages.length - 1}>Next →</button>
    </nav>
  </section>;
}
