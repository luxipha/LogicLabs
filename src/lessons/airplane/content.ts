export const LESSON_PARTS = [
  'body',
  'cockpit',
  'engine',
  'leftWing',
  'rightWing',
  'tail',
  'tires',
] as const;

export type LessonPartId = (typeof LESSON_PARTS)[number];

export const PART_LABELS: Record<LessonPartId, string> = {
  body: 'Body',
  cockpit: 'Cockpit',
  engine: 'Jet Engine',
  leftWing: 'Left Wing',
  rightWing: 'Right Wing',
  tail: 'Tail',
  tires: 'Tires',
};

export const PART_HELP: Record<LessonPartId, string> = {
  body: 'The body holds the airplane together.',
  cockpit: 'The cockpit is where the pilot sits and controls the airplane.',
  engine: 'The jet engine gives the airplane power to move forward.',
  leftWing: 'The left wing helps lift the airplane into the sky.',
  rightWing: 'The right wing balances the airplane in flight.',
  tail: 'The tail helps keep the airplane stable.',
  tires: 'The tires help the airplane roll during takeoff and landing.',
};

export const PART_FACTS: Record<LessonPartId, string> = {
  body: 'The body is called the fuselage. It carries people, cargo, and connects all the airplane parts.',
  cockpit: 'The cockpit has the pilot seats, windows, controls, and screens used to guide the airplane.',
  engine: 'A jet engine pulls in air, speeds it up, and pushes it backward to make thrust.',
  leftWing: 'The left wing works with the right wing to make lift and keep the airplane balanced.',
  rightWing: 'The right wing matches the left wing so the airplane can lift evenly.',
  tail: 'The tail has stabilizers that help the airplane point straight and stay steady.',
  tires: 'The tires and landing gear carry the airplane on the runway before takeoff and after landing.',
};

export const SNAP_RADIUS: Record<LessonPartId, number> = {
  body: 0,
  cockpit: 5.2,
  engine: 6,
  leftWing: 6.5,
  rightWing: 6.5,
  tail: 6,
  tires: 7,
};

export const PART_TAG_STYLE: Record<
  LessonPartId,
  {top?: string; bottom?: string; left?: string; right?: string}
> = {
  body: {top: '38%', left: '44%'},
  cockpit: {top: '29%', left: '47%'},
  engine: {top: '52%', left: '45%'},
  leftWing: {top: '46%', left: '30%'},
  rightWing: {top: '46%', right: '30%'},
  tail: {top: '34%', left: '38%'},
  tires: {bottom: '26%', left: '44%'},
};

export const getExplodedOffset = (part: LessonPartId): [number, number, number] => {
  switch (part) {
    case 'cockpit':
      return [0, 9, 0];
    case 'engine':
      return [0, -10, -4];
    case 'leftWing':
      return [-14, 1.5, 0];
    case 'rightWing':
      return [14, 1.5, 0];
    case 'tail':
      return [0, 8, 14];
    case 'tires':
      return [0, -12, 10];
    case 'body':
    default:
      return [0, 0, 0];
  }
};
