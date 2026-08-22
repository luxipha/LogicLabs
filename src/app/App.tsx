import React, {Suspense, useEffect, useState} from 'react';
import {usePath, navigate, matchLessonPath} from './router';
import {clearCurrentClass, getCurrentClass, type ClassInfo} from './classStore';
import {getLesson} from './lessons';
import {HomePage} from './pages/HomePage';
import {LessonsPage} from './pages/LessonsPage';
import {LessonPage} from './pages/LessonPage';
import {NotFoundPage} from './pages/NotFoundPage';

const App: React.FC = () => {
  const path = usePath();
  const [cls, setCls] = useState<ClassInfo | null>(getCurrentClass);

  useEffect(() => {
    if (path !== '/' && !cls) {
      navigate('/');
    }
  }, [path, cls]);

  const lessonSlug = matchLessonPath(path);
  const lesson = lessonSlug ? getLesson(lessonSlug) : undefined;
  let page: React.ReactNode;
  if (path === '/') {
    page = <HomePage onClassSelected={setCls} />;
  } else if (path === '/lessons') {
    page = cls ? <LessonsPage /> : <HomePage onClassSelected={setCls} />;
  } else if (lessonSlug) {
    page = cls ? <LessonPage id={lessonSlug} /> : <HomePage onClassSelected={setCls} />;
  } else {
    page = <NotFoundPage />;
  }

  return (
    <div className="classroom-shell">
      <nav className="top-nav">
        <button className="brand" onClick={() => navigate(cls ? '/lessons' : '/')}>
          HOME
        </button>
        {lesson ? (
          <div className="top-lesson-title">
            <strong>{lesson.content.title}</strong>
            <span>{lesson.content.subtitle}</span>
          </div>
        ) : (
          <div />
        )}
        <div className="nav-class">
          {cls ? (
            <>
              <span className="nav-class-name">{cls.name}</span>
              <button
                className="nav-class-switch"
                onClick={() => {
                  clearCurrentClass();
                  setCls(null);
                  navigate('/');
                }}
              >
                Switch
              </button>
            </>
          ) : (
            <span className="nav-class-name muted">No class</span>
          )}
        </div>
      </nav>

      <Suspense fallback={<div className="route-loading">Loading lesson…</div>}>{page}</Suspense>
    </div>
  );
};

export default App;
