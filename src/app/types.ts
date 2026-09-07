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
  /** Optional SVG geometry used by the shared PartsStage to draw this part. */
  shape?: PartShape;
};

export type PartShape =
  | {
      kind: 'circle';
      cx: number;
      cy: number;
      r: number;
      fill?: string;
      stroke?: string;
    }
  | {
      kind: 'ellipse';
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      fill?: string;
      stroke?: string;
    }
  | {
      kind: 'rect';
      x: number;
      y: number;
      width: number;
      height: number;
      rx?: number;
      fill?: string;
      stroke?: string;
    }
  | {
      kind: 'path';
      d: string;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
    };

export type ActivityGame = {
  id: string;
  label: string;
  title: string;
  src: string;
};

export type LifeCycleStage = {
  id: 'eggs' | 'tadpole' | 'legs' | 'froglet' | 'adult';
  label: string;
  shortLabel: string;
  description: string;
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
  exploreTitle?: string;
  exploreInstruction?: string;
  difficulty: number;
  topics: string[];
  classIds: string[];
  storyVideoUrl: string;
  sketchfabEmbedUrl?: string;
  sketchfabModelName?: string;
  sketchfabModelPageUrl?: string;
  sketchfabAuthorName?: string;
  sketchfabAuthorPageUrl?: string;
  lifeCycleStages?: LifeCycleStage[];
  storyQuestions: QuizItem[];
  quiz: QuizItem[];
  warmupVideoUrl: string;
  gameEmbedUrl?: string;
  activityGames?: ActivityGame[];
  /** Optional gradient stops for the identify/explore stage backdrop. */
  stageBackground?: string[];
  parts?: GenericPart[];
};
