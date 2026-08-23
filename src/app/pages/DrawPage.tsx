import React from 'react';
import {DrawingCanvas} from '../../components/DrawingCanvas';
import {getLesson} from '../lessons';
import {navigate} from '../router';
import {getCurrentClass} from '../classStore';

export const DrawPage: React.FC<{lessonId: string}> = ({lessonId}) => {
  const lesson = getLesson(lessonId);
  const cls = getCurrentClass();
  const scope = `${cls?.name ?? 'class'}/${lessonId}`;

  return (
    <main className="draw-page">
      <header className="draw-page-head">
        <button className="draw-back" onClick={() => navigate(`/lessons/${lessonId}`)}>
          ← Back to {lesson?.content.title ?? 'lesson'}
        </button>
        <h1>Drawing Board</h1>
        <span className="draw-page-sub">
          {cls?.name ?? 'Class'} · {lesson?.content.title ?? lessonId}
        </span>
      </header>
      <DrawingCanvas scope={scope} />
    </main>
  );
};
