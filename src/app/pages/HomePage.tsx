import React from 'react';
import {PRESET_CLASSES, rememberClass, setCurrentClass, type ClassInfo} from '../classStore';
import {navigate} from '../router';
import {ClassArtwork} from './ClassArtwork';

export const HomePage: React.FC<{onClassSelected: (cls: ClassInfo) => void}> = ({onClassSelected}) => {
  const joinClass = (cls: ClassInfo) => {
    setCurrentClass(cls);
    rememberClass(cls);
    onClassSelected(cls);
    navigate('/lessons');
  };

  return (
    <main className="home-page">
      <section className="home-hero">
        <span className="home-kicker">The Logic Classroom</span>
        <h1>Choose your class.</h1>
        <p>Teachers pick a class, then open the lesson catalogue.</p>
      </section>

      <section className="class-picker">
        {PRESET_CLASSES.map((cls) => (
          <button
            key={cls.name}
            className="class-card"
            style={{'--class-color': cls.color} as React.CSSProperties}
            onClick={() => joinClass(cls)}
          >
            <span className="class-art-frame">
              <ClassArtwork art={cls.art} />
            </span>
            <span className="class-card-name">{cls.name}</span>
            <span className="class-card-tagline">{cls.tagline}</span>
            <span className="class-card-open">Open lessons</span>
          </button>
        ))}
      </section>
    </main>
  );
};
