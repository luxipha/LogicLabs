import React, {useState} from 'react';
import manifest from './coding-stages.json';
import './dragster-coding.css';

type View = 'blocks' | 'card' | 'full';
const guided = manifest.stages.filter(stage => stage.kind === 'guided');
const ideas = manifest.stages.filter(stage => stage.kind === 'idea');

export function DragsterCoding() {
  const [section, setSection] = useState<'guided' | 'ideas'>('guided');
  const [step, setStep] = useState(0);
  const [view, setView] = useState<View>('blocks');
  const stages = section === 'guided' ? guided : ideas;
  const stage = stages[step];
  const asset = manifest.stages.indexOf(stage) + 1;
  const imageUrl = `assets/dragster-code/${view === 'card' ? '' : view === 'full' ? 'full-blocks-' : 'blocks-'}${asset}.png`;
  const previous = () => setStep(current => Math.max(0, current - 1));
  const next = () => setStep(current => Math.min(stages.length - 1, current + 1));
  const chooseSection = (nextSection: 'guided' | 'ideas') => {setSection(nextSection); setStep(0); setView('blocks');};
  const full = view === 'full';
  return <section className="dragster-coding" aria-label="Dragster coding stages" tabIndex={0} onKeyDown={event => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowLeft') {event.preventDefault(); previous();}
    if (event.key === 'ArrowRight') {event.preventDefault(); next();}
  }}>
    <header className="dragster-coding__header">
      <div role="group" aria-label="Coding path">
        <button aria-pressed={section === 'guided'} onClick={() => chooseSection('guided')}>Build your dragster</button>
        <button aria-pressed={section === 'ideas'} onClick={() => chooseSection('ideas')}>Try an idea</button>
      </div>
      <div role="group" aria-label="Code view">
        <button aria-pressed={view === 'blocks'} onClick={() => setView('blocks')}>Step close-up</button>
        <button aria-pressed={view === 'card'} onClick={() => setView('card')}>Teaching card</button>
        <button aria-pressed={full} onClick={() => setView('full')}>Full program</button>
      </div>
    </header>
    <div className="dragster-coding__title"><h2>{step + 1}. {stage.title.replace('Try an idea: ', '')}</h2><a href={imageUrl} target="_blank" rel="noreferrer">Open image ↗</a></div>
    <p className="dragster-coding__context">{section === 'ideas' ? 'Try one change, predict what will happen, then test your idea.' : step === guided.length - 1 ? 'Bring driving and automatic headlights together.' : 'Build one step at a time. Keep your earlier blocks as you add each new part.'}</p>
    <div className={`dragster-coding__body${view === 'blocks' ? '' : ' dragster-coding__body--image'}`}>
      <div className="dragster-coding__image"><img key={imageUrl} src={imageUrl} alt={`${stage.title}. Authentic MakeCode Bricks4Kidz and NeoPixel blocks. ${full || !('focusCode' in stage) ? 'Complete runnable program.' : view === 'card' ? 'Teaching card with a labelled excerpt.' : 'Excerpt; retain the earlier blocks as described in Build.'}`} draggable={false} /></div>
      {view === 'blocks' && <div className="dragster-coding__guide" tabIndex={0} role="region" aria-label="Coding instructions">
        <p><strong>Learn</strong>{stage.concept}</p>
        <p><strong>Predict</strong>{stage.predict}</p>
        <p><strong>Build</strong>{stage.adds}</p>
        {'focusNote' in stage && <p className="dragster-coding__excerpt">{stage.focusNote}</p>}
        <p><strong>Run</strong>{stage.run}</p>
        <div><strong>Observe</strong><ul>{stage.observe.map(item => <li key={item}>{item}</li>)}</ul></div>
        <p><strong>Explain</strong>{stage.question}</p>
      </div>}
    </div>
    <nav className="dragster-coding__navigation" aria-label="Coding stages">
      <button onClick={previous} disabled={step === 0}>← Previous</button>
      <span role="status" aria-live="polite">{step + 1} / {stages.length}</span>
      <button onClick={next} disabled={step === stages.length - 1}>Next →</button>
    </nav>
  </section>;
}
