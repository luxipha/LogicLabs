import React from 'react';

// The page owns the points card (it needs class + student state), but the card
// must live inside the lesson's own right-hand rail so it stacks with the
// progress card instead of floating over it. A context slot lets the page pass
// the node down without threading a prop through every lesson wrapper.
const LessonRailContext = React.createContext<React.ReactNode>(null);

export const LessonRailProvider: React.FC<{
  slot: React.ReactNode;
  children: React.ReactNode;
}> = ({slot, children}) => (
  <LessonRailContext.Provider value={slot}>{children}</LessonRailContext.Provider>
);

/** Renders the page-provided rail content, or nothing when there is none. */
export const LessonRailSlot: React.FC = () => {
  const slot = React.useContext(LessonRailContext);
  return slot ? <div className="lesson-rail-slot">{slot}</div> : null;
};
