export type StudentRecord = {
  id: string;
  name: string;
  points: number;
};

const getStudentsKey = (className: string): string => `classroom.students.${className}`;

const makeStudentId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `student-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const sanitizeStudents = (students: StudentRecord[]): StudentRecord[] =>
  students
    .map((student) => ({
      id: student.id || makeStudentId(),
      name: student.name.trim(),
      points: Number.isFinite(student.points) ? Math.max(0, Math.floor(student.points)) : 0,
    }))
    .filter((student) => student.name.length > 0);

export const getStudents = (className: string): StudentRecord[] => {
  try {
    const raw = window.localStorage.getItem(getStudentsKey(className));
    if (!raw) return [];
    return sanitizeStudents(JSON.parse(raw) as StudentRecord[]);
  } catch {
    return [];
  }
};

export const saveStudents = (className: string, students: StudentRecord[]): StudentRecord[] => {
  const clean = sanitizeStudents(students);
  window.localStorage.setItem(getStudentsKey(className), JSON.stringify(clean));
  return clean;
};

export const createStudentsFromNames = (names: string[]): StudentRecord[] =>
  sanitizeStudents(names.map((name) => ({id: makeStudentId(), name, points: 0})));

export const upsertStudentsFromNames = (className: string, names: string[]): StudentRecord[] => {
  const existing = getStudents(className);
  const existingByName = new Map(existing.map((student) => [student.name.toLowerCase(), student]));
  const next = names
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .map((name) => {
      const match = existingByName.get(name.toLowerCase());
      return match ?? {id: makeStudentId(), name, points: 0};
    });
  return saveStudents(className, next);
};

export const incrementStudentPoints = (className: string, studentId: string, amount = 1): StudentRecord[] => {
  const next = getStudents(className).map((student) =>
    student.id === studentId ? {...student, points: student.points + amount} : student,
  );
  return saveStudents(className, next);
};

export const clearStudentPoints = (className: string): StudentRecord[] =>
  saveStudents(
    className,
    getStudents(className).map((student) => ({...student, points: 0})),
  );
