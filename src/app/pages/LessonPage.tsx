import React, {useEffect, useState} from 'react';
import {getLesson, getLessonComponent} from '../lessons';
import {navigate} from '../router';
import {getCurrentClass} from '../classStore';

export const LessonPage: React.FC<{id: string}> = ({id}) => {
  const lesson = getLesson(id);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    setComplete(false);
  }, [id]);

  if (!lesson) {
    return <NotFound id={id} />;
  }

  const Lesson = getLessonComponent(lesson.id);

  return (
    <div className="lesson-viewport">
      <Lesson
        onHome={() => navigate('/lessons')}
        onComplete={() => {
          setComplete(true);
          const cls = getCurrentClass();
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
