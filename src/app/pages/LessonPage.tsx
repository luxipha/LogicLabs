import React, {useEffect, useState} from 'react';
import {getLesson, getLessonComponent} from '../lessons';
import {navigate} from '../router';
import {getCurrentClass} from '../classStore';
import {DrawingCanvas} from '../../components/DrawingCanvas';
import {ClassPointsCard} from '../components/ClassPointsCard';
import {StudentSetupModal} from '../components/StudentSetupModal';
import {
  clearStudentPoints,
  getStudents,
  incrementStudentPoints,
  type StudentRecord,
  upsertStudentsFromNames,
} from '../studentStore';

export const LessonPage: React.FC<{id: string}> = ({id}) => {
  const lesson = getLesson(id);
  const cls = getCurrentClass();
  const [complete, setComplete] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [showStudentEditor, setShowStudentEditor] = useState(false);

  useEffect(() => {
    setComplete(false);
    setDrawing(false);
  }, [id]);

  useEffect(() => {
    setStudents(cls ? getStudents(cls.name) : []);
  }, [cls?.name]);

  if (!lesson) {
    return <NotFound id={id} />;
  }

  const Lesson = getLessonComponent(lesson.id);
  // Warmup comes from the lesson's own content JSON.
  const warmupVideoUrl = lesson.content.warmupVideoUrl;
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

      {cls ? (
        <div className="lesson-points-panel">
          <ClassPointsCard
            className={cls.name}
            students={students}
            onAddPoint={(studentId) => setStudents(incrementStudentPoints(cls.name, studentId))}
            onClearPoints={() => setStudents(clearStudentPoints(cls.name))}
            onManageStudents={() => setShowStudentEditor(true)}
          />
        </div>
      ) : null}

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

      {cls && showStudentEditor ? (
        <StudentSetupModal
          className={cls.name}
          initialNames={students.map((student) => student.name)}
          onCancel={() => setShowStudentEditor(false)}
          onContinue={(names) => {
            setStudents(upsertStudentsFromNames(cls.name, names));
            setShowStudentEditor(false);
          }}
        />
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
