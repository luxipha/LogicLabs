export type QuizItem = {
  prompt: string;
  answers: string[];
  correctIndex: number;
  success: string;
};

export type GenericPart = {
  id: string;
  label: string;
  fact: string;
  help: string;
};

export type LessonContent = {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  badge: string;
  color: string;
  activity: string;
  activityLabel: string;
  activityInstruction: string;
  difficulty: number;
  topics: string[];
  classIds: string[];
  storyVideoUrl: string;
  storyQuestions: QuizItem[];
  quiz: QuizItem[];
  warmupVideoUrl: string;
  parts?: GenericPart[];
};
