import React, {useEffect, useState} from 'react';
import {getLesson, getLessonComponent} from '../lessons';
import {navigate} from '../router';
import {getCurrentClass, getPresetClass} from '../classStore';
import {DrawingCanvas} from '../../components/DrawingCanvas';

export const LessonPage: React.FC<{id: string}> = ({id}) => {
  const lesson = getLesson(id);
  const [complete, setComplete] = useState(false);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    setComplete(false);
    setDrawing(false);
  }, [id]);

  if (!lesson) {
    return <NotFound id={id} />;
  }

  const Lesson = getLessonComponent(lesson.id);
  // Warmup is class-specific: the class preset wins, the lesson JSON falls back.
  const cls = getCurrentClass();
  const preset = cls ? getPresetClass(cls.name) : undefined;
  const warmupVideoUrl = preset?.warmupVideoUrl || lesson.content.warmupVideoUrl;
  const drawScope = `${cls?.name ?? 'class'}/${lesson.id}`;

  return (
    <div className="lesson-viewport">
      <Lesson
        warmupVideoUrl={warmupVideoUrl}
        onHome={() => navigate('/lessons')}
        onDraw={() => setDrawing(true)}
        onBoard={() => navigate(`/draw/${lesson.id}`)}
        onComplete={() => {
          setComplete(true);
          if (cls) {
            const key = `classroom.progress.${cls.name}.${lesson.id}`;
            try {
              window.localStorage.setItem(key, 'complete');
            } catch {
              // storage unavailable
            }
          }
        }}
      />

      {/* Drawing overlay on top of the lesson stage */}
      {drawing ? (
        <div className="draw-overlay">
          <button className="draw-close" onClick={() => setDrawing(false)} aria-label="Close drawing">
            ✕
          </button>
          <DrawingCanvas scope={drawScope} overlay />
        </div>
      ) : null}

      {complete ? (
        <div className="lesson-done-toast" role="status">
          <span>Lesson complete!</span>
          <button onClick={() => navigate('/lessons')}>Back to lessons</button>
        </div>
      ) : null}
    </div>
  );
};

const NotFound: React.FC<{id: string}> = ({id}) => (
  <main className="not-found">
    <h1>No lesson named “{id}”.</h1>
    <p>Check the lesson list and try again.</p>
    <button className="primary-action" onClick={() => navigate('/lessons')}>
      See lessons
    </button>
  </main>
);
