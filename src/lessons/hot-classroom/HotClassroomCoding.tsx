import React, {useEffect, useRef, useState} from 'react';

const TOTAL_STEPS = 15;

export const HotClassroomCoding: React.FC = () => {
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
      className={`hot-classroom-coding-viewer ${expanded ? 'expanded' : ''}`}
      aria-label="Electric fan coding instructions"
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
      <div className="hot-classroom-coding-toolbar">
        <strong>Fan Coding</strong>
        <button onClick={toggleFullscreen}>{fullscreen || expanded ? 'Exit fullscreen' : 'Fullscreen'}</button>
      </div>
      <div className="hot-classroom-coding-image">
        <img
          key={step}
          src={`assets/fan-code/${step}.png`}
          alt={`Electric fan coding instructions, step ${step} of ${TOTAL_STEPS}`}
          draggable={false}
        />
      </div>
      <div className="hot-classroom-coding-navigation">
        <button onClick={previous} disabled={step === 1}>← Previous</button>
        <span role="status" aria-live="polite">{step} / {TOTAL_STEPS}</span>
        <button onClick={next} disabled={step === TOTAL_STEPS}>Next →</button>
      </div>
    </section>
  );
};
