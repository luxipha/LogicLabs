import React, {useState} from 'react';
import {LESSONS} from '../lessons';
import {getCurrentClass} from '../classStore';
import {navigate} from '../router';
import {StudentSetupModal} from '../components/StudentSetupModal';
import {getStudents, upsertStudentsFromNames} from '../studentStore';

const DIFFICULTY_STARS = ['★', '★★', '★★★'];

export const LessonsPage: React.FC = () => {
  const [cls] = useState(getCurrentClass);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const classLessons = LESSONS.filter((lesson) =>
    lesson.content.classIds.includes(cls?.name ?? ''),
  );
  const selectedLesson = classLessons.find((lesson) => lesson.id === selectedLessonId);

  return (
    <main className="lessons-page">
      <header className="page-head">
        <span className="page-kicker">Lesson Catalogue</span>
        <h1>
          {cls ? `${cls.name} lessons` : 'Choose a lesson.'}
        </h1>
        <p>Each lesson is a short mission: watch the story, learn the parts, and do the activity.</p>
      </header>

      {classLessons.length === 0 ? (
        <section className="no-lessons">
          <h2>No lessons for {cls?.name} yet.</h2>
          <p>New missions are being added. Try another class.</p>
          <button className="primary-action" onClick={() => navigate('/')}>
            Switch class
          </button>
        </section>
      ) : (
        <section className="lesson-grid">
          {classLessons.map((lesson) => (
            <button
              key={lesson.id}
              className="lesson-card"
              style={{'--lesson-color': lesson.content.color} as React.CSSProperties}
              onClick={() => setSelectedLessonId(lesson.id)}
            >
              <span className="lesson-card-top">
                <span className="lesson-badge">{lesson.content.badge}</span>
                <span className="lesson-difficulty">
                  {DIFFICULTY_STARS[lesson.content.difficulty - 1]}
                </span>
              </span>
              <span className="lesson-card-body">
                <h2>{lesson.content.title}</h2>
                <p>{lesson.content.summary}</p>
                <span className="lesson-topics">
                  {lesson.content.topics.map((topic) => (
                    <span key={topic} className="lesson-topic">
                      {topic}
                    </span>
                  ))}
                </span>
              </span>
              <span className="lesson-card-cta">Start lesson</span>
            </button>
          ))}
        </section>
      )}

      {cls && selectedLesson ? (
        <StudentSetupModal
          className={cls.name}
          initialNames={getStudents(cls.name).map((student) => student.name)}
          onCancel={() => setSelectedLessonId(null)}
          onContinue={(names) => {
            upsertStudentsFromNames(cls.name, names);
            navigate(`/lessons/${selectedLesson.id}`);
          }}
        />
      ) : null}
    </main>
  );
};
