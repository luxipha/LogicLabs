import React, {useEffect, useRef, useState} from 'react';

const TOTAL_STEPS = 5;

export const UltrasonicCoding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const viewer = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => setFullscreen(document.fullscreenElement === viewer.current);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement === viewer.current) {
      await document.exitFullscreen();
    } else if (expanded) {
      setExpanded(false);
    } else {
      try {
        if (!viewer.current?.requestFullscreen) {
          setExpanded(true);
          return;
        }
        await viewer.current.requestFullscreen();
      } catch {
        setExpanded(true);
      }
    }
  };

  const previous = () => setStep((current) => Math.max(1, current - 1));
  const next = () => setStep((current) => Math.min(TOTAL_STEPS, current + 1));

  return (
    <section
      ref={viewer}
      className={`ultrasonic-coding-viewer ${expanded ? 'expanded' : ''}`}
      aria-label="Ultrasonic coding instructions"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          next();
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          previous();
        }
        if (event.key === 'Escape') setExpanded(false);
      }}
    >
      <div className="ultrasonic-coding-toolbar">
        <strong>Ultrasonic Coding</strong>
        <button onClick={toggleFullscreen}>{fullscreen || expanded ? 'Exit fullscreen' : 'Fullscreen'}</button>
      </div>
      <div className="ultrasonic-coding-image">
        <img
          key={step}
          src={`assets/ultrasonic-code/${step}.png`}
          alt={`Ultrasonic coding instructions, step ${step} of ${TOTAL_STEPS}`}
          draggable={false}
        />
      </div>
      <div className="ultrasonic-coding-navigation">
        <button onClick={previous} disabled={step === 1}>← Previous</button>
        <span role="status" aria-live="polite">{step} / {TOTAL_STEPS}</span>
        <button onClick={next} disabled={step === TOTAL_STEPS}>Next →</button>
      </div>
    </section>
  );
};
