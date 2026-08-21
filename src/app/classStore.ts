export type ClassInfo = {
  name: string;
  grade: string;
  createdAt: string;
};

const STORAGE_KEY = 'classroom.currentClass';
const ALL_KEY = 'classroom.classes';

export const getCurrentClass = (): ClassInfo | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ClassInfo) : null;
  } catch {
    return null;
  }
};

export const setCurrentClass = (cls: ClassInfo): void => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cls));
};

export const clearCurrentClass = (): void => {
  window.localStorage.removeItem(STORAGE_KEY);
};

export const getKnownClasses = (): ClassInfo[] => {
  try {
    const raw = window.localStorage.getItem(ALL_KEY);
    return raw ? (JSON.parse(raw) as ClassInfo[]) : [];
  } catch {
    return [];
  }
};

export const rememberClass = (cls: ClassInfo): void => {
  const existing = getKnownClasses().filter((item) => item.name !== cls.name);
  existing.unshift(cls);
  window.localStorage.setItem(ALL_KEY, JSON.stringify(existing.slice(0, 6)));
};

export const useCurrentClass = (): ClassInfo | null => getCurrentClass();

export type ClassArtwork = 'blocks' | 'moto' | 'gear' | 'robot' | 'brick';

export type PresetClass = ClassInfo & {
  tagline: string;
  color: string;
  art: ClassArtwork;
};

export const PRESET_CLASSES: PresetClass[] = [
  {
    name: 'Preschool',
    grade: 'Preschool',
    tagline: 'Colors, shapes, and first builds.',
    color: '#ff8d1f',
    art: 'blocks',
    createdAt: '',
  },
  {
    name: 'Brickmoto',
    grade: 'Brickmoto',
    tagline: 'Vehicles and machines that move.',
    color: '#20a7f1',
    art: 'moto',
    createdAt: '',
  },
  {
    name: 'Power Function',
    grade: 'Power Function',
    tagline: 'Motors, gears, and power.',
    color: '#3fbf3f',
    art: 'gear',
    createdAt: '',
  },
  {
    name: 'Junior Robotic',
    grade: 'Junior Robotic',
    tagline: 'Robots and simple coding.',
    color: '#8f42f3',
    art: 'robot',
    createdAt: '',
  },
  {
    name: 'BrickX',
    grade: 'BrickX',
    tagline: 'Advanced builds and challenges.',
    color: '#d62839',
    art: 'brick',
    createdAt: '',
  },
];
