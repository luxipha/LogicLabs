import React, {useEffect, useRef, useState} from 'react';

const TOTAL = 11;

export const SalmonCoding: React.FC = () => {
  const [step, setStep] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const viewer = useRef<HTMLElement>(null);
  useEffect(() => {
    const changed = () => setFullscreen(document.fullscreenElement === viewer.current);
    document.addEventListener('fullscreenchange', changed);
    return () => document.removeEventListener('fullscreenchange', changed);
  }, []);
  const toggleFullscreen = async () => {
    if (document.fullscreenElement === viewer.current) await document.exitFullscreen();
    else await viewer.current?.requestFullscreen?.();
  };
  return (
    <section ref={viewer} className="salmon-coding-viewer" aria-label="Salmon coding instructions" tabIndex={0}>
      <div className="salmon-coding-toolbar"><strong>Salmon Coding</strong><button type="button" onClick={toggleFullscreen}>{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button></div>
      <div className="salmon-coding-image"><img key={step} src={`assets/salmon-code/${step + 1}.png`} alt={`Salmon coding step ${step + 1} of ${TOTAL}`} draggable={false} /></div>
      <div className="salmon-coding-navigation"><button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>← Previous</button><span role="status" aria-live="polite">{step + 1} / {TOTAL}</span><button type="button" onClick={() => setStep((value) => Math.min(TOTAL - 1, value + 1))} disabled={step === TOTAL - 1}>Next →</button></div>
    </section>
  );
};
