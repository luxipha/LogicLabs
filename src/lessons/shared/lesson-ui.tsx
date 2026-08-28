import React, {type ReactNode} from 'react';

export type LessonModeTab<TMode extends string> = {
  id: TMode;
  label: string;
  icon: string;
  tone: 'identify' | 'assemble' | 'explore' | 'fly';
};

export type LessonPartRow<TPart extends string> = {
  id: TPart;
  label: string;
  status: string;
  active: boolean;
  done?: boolean;
  locked?: boolean;
  preview: ReactNode;
};

export type LessonTrayPart<TPart extends string> = {
  id: TPart;
  label: string;
  active: boolean;
  disabled?: boolean;
  done?: boolean;
  locked?: boolean;
  status?: string;
  preview: ReactNode;
};

export const MissionHeader: React.FC<{
  score: number;
  onDraw?: () => void;
  onBoard?: () => void;
}> = ({onDraw, onBoard}) => (
  <header className="mission-header">
    <div className="screen-actions">
      {onDraw ? (
        <button className="icon-btn icon-btn-draw" aria-label="Draw" onClick={onDraw} title="Draw">
          ✏️
        </button>
      ) : null}
      {onBoard ? (
        <button className="icon-btn icon-btn-board" aria-label="Board" onClick={onBoard} title="Board">
          🖼️
        </button>
      ) : null}
    </div>
  </header>
);

export const ModeTabs = <TMode extends string>({
  tabs,
  activeMode,
  onSelect,
}: {
  tabs: LessonModeTab<TMode>[];
  activeMode: TMode;
  onSelect: (mode: TMode) => void;
}) => (
  <nav className="mode-tabs" aria-label="Lesson modes">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        className={activeMode === tab.id ? `mode-tab ${tab.tone} active` : `mode-tab ${tab.tone}`}
        onClick={() => onSelect(tab.id)}
      >
        <span className="mode-icon">{tab.icon}</span>
        <span>{tab.label}</span>
      </button>
    ))}
  </nav>
);

export const TaskCard: React.FC<{
  badge: string;
  title: string;
  text: string;
  preview?: ReactNode;
  feedback?: 'wrong' | null;
  children?: ReactNode;
  onPreviewClick?: () => void;
}> = ({badge, title, text, preview, feedback = null, children, onPreviewClick}) => (
  <section className="task-card">
    <div className="task-header">
      <div className="pilot-badge">{badge}</div>
      <span>Your Task</span>
    </div>
    <div className="task-body">
      <h2>{title}</h2>
      <p>{text}</p>
      {preview ? (
        <button className={feedback === 'wrong' ? 'ghost-part wrong' : 'ghost-part'} onClick={onPreviewClick}>
          {preview}
        </button>
      ) : null}
      {children}
    </div>
  </section>
);

export const QuizCard: React.FC<{
  prompt: string;
  answers: string[];
  indexLabel: string;
  feedback: 'correct' | 'wrong' | null;
  success?: string;
  onAnswer: (index: number) => void;
}> = ({prompt, answers, indexLabel, feedback, success, onAnswer}) => (
  <section
    className={
      feedback === 'correct'
        ? 'quiz-card correct-pop'
        : feedback === 'wrong'
          ? 'quiz-card wrong-shake'
          : 'quiz-card'
    }
  >
    <div className="quiz-header">
      <span>Check Question</span>
      <span>{indexLabel}</span>
    </div>
    <div className="quiz-body">
      <h3>{prompt}</h3>
      {answers.map((answer, index) => (
        <button key={answer} className="answer" onClick={() => onAnswer(index)}>
          {String.fromCharCode(65 + index)} {answer}
        </button>
      ))}
      {feedback === 'correct' ? (
        <div className="correct-burst">
          <span>Correct!</span>
          <small>{success ?? 'Keep going.'}</small>
        </div>
      ) : null}
      {feedback === 'wrong' ? <div className="try-again">Try again. Look for the clue.</div> : null}
    </div>
  </section>
);

export const StoryVideoCard: React.FC<{
  title: string;
  youtubeEmbedUrl: string;
}> = ({title, youtubeEmbedUrl}) => (
  <section className="story-video-card video-only">
    <div className="story-video-frame">
      <iframe
        title={title}
        src={youtubeEmbedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  </section>
);

export const SketchfabEmbed: React.FC<{
  embedUrl: string;
  modelName: string;
  modelPageUrl: string;
  stageClass?: string;
}> = ({embedUrl, modelName, modelPageUrl, stageClass = 'golf-identify-stage'}) => (
  <div className={`generic-stage ${stageClass}`}>
    <div className="sketchfab-embed-wrapper">
      <iframe
        title={modelName}
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; xr-spatial-tracking; web-share"
        src={embedUrl}
      />
      <p>
        <a href={modelPageUrl} target="_blank" rel="nofollow">
          {modelName}
        </a>{' '}
        on{' '}
        <a href="https://sketchfab.com" target="_blank" rel="nofollow">
          Sketchfab
        </a>
      </p>
    </div>
  </div>
);

export const TipCard: React.FC<{children: ReactNode}> = ({children}) => <div className="tip-card">{children}</div>;

export const LessonStage: React.FC<{children: ReactNode}> = ({children}) => (
  <section className="lesson-stage">{children}</section>
);

export const ProgressCard: React.FC<{
  done: number;
  total: number;
  label: string;
}> = ({done, total, label}) => (
  <section className="progress-card">
    <div className="eyebrow">Your Progress</div>
    <div className="progress-count">
      {done}/{total} <span>{label}</span>
    </div>
    <div className="progress-bar">
      <div className="progress-fill" style={{width: `${(done / total) * 100}%`}} />
    </div>
  </section>
);

export const PartsList = <TPart extends string>({
  parts,
  onSelect,
  interactive = true,
}: {
  parts: LessonPartRow<TPart>[];
  onSelect: (part: TPart) => void;
  interactive?: boolean;
}) => (
  <section className="parts-list-card">
    <div className="eyebrow">Parts List</div>
    {parts.map((part) => (
      <button
        key={part.id}
        className={part.active ? 'side-part active' : 'side-part'}
        aria-disabled={!interactive}
        onClick={() => {
          if (interactive) {
            onSelect(part.id);
          }
        }}
      >
        <span className="side-part-icon">{part.preview}</span>
        <span>{part.label}</span>
        <span className={part.done ? 'side-state done' : part.locked ? 'side-state locked' : 'side-state'}>
          {part.status}
        </span>
      </button>
    ))}
  </section>
);

export const PartsTray = <TPart extends string>({
  parts,
  onSelect,
  interactive = true,
}: {
  parts: LessonTrayPart<TPart>[];
  onSelect: (part: TPart) => void;
  interactive?: boolean;
}) => (
  <section className="parts-tray">
    {parts.map((part) => (
      <button
        key={part.id}
        className={part.active ? 'tray-part active' : part.done ? 'tray-part done' : part.locked ? 'tray-part locked' : 'tray-part'}
        disabled={part.disabled}
        aria-disabled={!interactive}
        onClick={() => {
          if (interactive) {
            onSelect(part.id);
          }
        }}
      >
        <span className="tray-thumb">{part.preview}</span>
        <span>{part.label}</span>
        {part.status ? <span className="tray-part-status">{part.status}</span> : null}
      </button>
    ))}
  </section>
);

export const FeedbackBanner: React.FC<{
  message: string;
  state?: 'correct' | 'wrong' | null;
}> = ({message, state = null}) => (
  <div className={state ? `encouragement ${state}` : 'encouragement'}>
    <span>STAR</span>
    <strong>{message}</strong>
  </div>
);
