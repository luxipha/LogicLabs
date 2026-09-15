import React, {useEffect, useRef, useState} from 'react';

const TOTAL = 14;
export const TrexCoding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const viewer = useRef<HTMLElement>(null);
  useEffect(() => {
    const changed = () => setFullscreen(document.fullscreenElement === viewer.current);
    document.addEventListener('fullscreenchange', changed);
    return () => document.removeEventListener('fullscreenchange', changed);
  }, []);
  const toggleFullscreen = async () => {
    if (document.fullscreenElement === viewer.current) {
      await document.exitFullscreen();
    } else if (expanded) {
      setExpanded(false);
    } else {
      try {
        if (!viewer.current?.requestFullscreen) {setExpanded(true); return;}
        await viewer.current.requestFullscreen();
      } catch {setExpanded(true);}
    }
  };
  const previous = () => setStep(current => Math.max(1, current - 1));
  const next = () => setStep(current => Math.min(TOTAL, current + 1));
  return <section ref={viewer} className={`trex-coding-viewer ${expanded ? 'expanded' : ''}`} aria-label="T-Rex coding instructions" tabIndex={0}
    onKeyDown={event => {
      if (event.key === 'ArrowRight') {event.preventDefault(); next();}
      if (event.key === 'ArrowLeft') {event.preventDefault(); previous();}
      if (event.key === 'Escape') setExpanded(false);
    }}>
    <div className="trex-coding-toolbar"><strong>T-Rex Coding</strong><button onClick={toggleFullscreen}>{fullscreen || expanded ? 'Exit fullscreen' : 'Fullscreen'}</button></div>
    <div className="trex-coding-image"><img key={step} src={`assets/trex-code/${step}.png`} alt={`T-Rex coding instructions, step ${step} of ${TOTAL}`} draggable={false}/></div>
    <div className="trex-coding-navigation"><button onClick={previous} disabled={step === 1}>← Previous</button><span role="status" aria-live="polite">{step} / {TOTAL}</span><button onClick={next} disabled={step === TOTAL}>Next →</button></div>
  </section>;
};
