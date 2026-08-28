import React, {useEffect, useState} from 'react';
import type {LessonContent} from '../../app/types';
import {
  FeedbackBanner,
  LessonStage,
  MissionHeader,
  ModeTabs,
  PartsTray,
  ProgressCard,
  QuizCard,
  TaskCard,
  TipCard,
  type LessonModeTab,
} from '../shared/lesson-ui';
import './lesson.scoped.css';

type GenericMode = 'warmup' | 'story' | 'identify' | 'explore' | 'activity' | 'quiz';

const MODE_TABS: LessonModeTab<GenericMode>[] = [
  {id: 'warmup', label: 'Warmup', icon: 'WU', tone: 'fly'},
  {id: 'story', label: 'Story', icon: 'PLAY', tone: 'fly'},
  {id: 'identify', label: 'Identify', icon: 'Q', tone: 'identify'},
  {id: 'explore', label: 'Explore', icon: 'BOOK', tone: 'explore'},
  {id: 'activity', label: 'Activity', icon: 'DO', tone: 'assemble'},
  {id: 'quiz', label: 'Quiz', icon: 'TICK', tone: 'fly'},
];

export const GenericLesson: React.FC<{
  content: LessonContent;
  onHome: () => void;
  onComplete: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
  stage: (props: {
    mode: GenericMode;
    activePart: string;
    lastSelectedPart: string | null;
    warmupVideoUrl: string;
    onSelect: (part: string) => void;
    identified: Set<string>;
    activityDone: boolean;
    completeActivity: () => void;
  }) => React.ReactNode;
  partPreview: (part: string) => React.ReactNode;
}> = ({content, onHome, onComplete, warmupVideoUrl, onDraw, onBoard, stage, partPreview}) => {
  const [mode, setMode] = useState<GenericMode>(() => {
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('mode');
      if (param === 'story' || param === 'identify' || param === 'explore' || param === 'activity' || param === 'quiz') {
        return param;
      }
    }
    return 'warmup';
  });
  const [warmupDone, setWarmupDone] = useState(false);
  const [activePart, setActivePart] = useState(content.parts?.[0]?.id ?? 'part');
  const [lastSelectedPart, setLastSelectedPart] = useState<string | null>(null);
  const [identified, setIdentified] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyCorrect, setStoryCorrect] = useState(0);
  const [storyFeedback, setStoryFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [activityDone, setActivityDone] = useState(false);
  const parts = content.parts ?? [];

  const storyQuestion = content.storyQuestions[storyIndex];
  const quizQuestion = content.quiz[quizIndex];
  const identifyTarget = parts.find((part) => !identified.has(part.id)) ?? null;
  const quizComplete = quizCorrect === content.quiz.length;

  useEffect(() => {
    if (mode === 'identify') {
      setActivePart(identifyTarget?.id ?? parts[0]?.id ?? 'part');
    }
    if (mode === 'explore') {
      setActivePart(parts[0]?.id ?? 'part');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (activityDone && mode === 'activity') {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityDone, mode]);

  const selectMode = (next: GenericMode) => {
    setMode(next);
    setFeedback(null);
    setLastSelectedPart(null);
    if (next === 'identify') {
      setActivePart(identifyTarget?.id ?? parts[0]?.id ?? 'part');
    }
  };

  const selectPart = (partId: string) => {
    setActivePart(partId);
    setLastSelectedPart(partId);
    if (mode !== 'identify' || !identifyTarget) {
      return;
    }
    const correct = partId === identifyTarget.id;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      const next = new Set(identified);
      next.add(partId);
      setIdentified(next);
      setActivePart(parts.find((p) => !next.has(p.id))?.id ?? partId);
    }
    window.setTimeout(() => setFeedback(null), correct ? 850 : 600);
  };

  const answerStory = (index: number) => {
    if (storyFeedback || storyCorrect === content.storyQuestions.length) {
      return;
    }
    const correct = index === storyQuestion.correctIndex;
    setStoryFeedback(correct ? 'correct' : 'wrong');
    window.setTimeout(() => {
      if (correct) {
        setStoryCorrect((n) => Math.min(content.storyQuestions.length, n + 1));
        setStoryIndex((n) => Math.min(content.storyQuestions.length - 1, n + 1));
      }
      setStoryFeedback(null);
    }, correct ? 850 : 600);
  };

  const answerQuiz = (index: number) => {
    if (quizFeedback || quizComplete) {
      return;
    }
    const correct = index === quizQuestion.correctIndex;
    setQuizFeedback(correct ? 'correct' : 'wrong');
    window.setTimeout(() => {
      if (correct) {
        setQuizCorrect((n) => Math.min(content.quiz.length, n + 1));
        setQuizIndex((n) => Math.min(content.quiz.length - 1, n + 1));
      }
      setQuizFeedback(null);
    }, correct ? 850 : 600);
  };

  const reset = () => {
    setMode('warmup');
    setWarmupDone(false);
    setActivePart(parts[0]?.id ?? 'part');
    setLastSelectedPart(null);
    setIdentified(new Set());
    setFeedback(null);
    setStoryIndex(0);
    setStoryCorrect(0);
    setStoryFeedback(null);
    setQuizIndex(0);
    setQuizCorrect(0);
    setQuizFeedback(null);
    setActivityDone(false);
  };

  const progressDone =
    mode === 'story'
      ? storyCorrect
      : mode === 'identify'
        ? identified.size
        : mode === 'quiz'
          ? quizCorrect
          : activityDone
            ? 1
            : 0;
  const progressTotal =
    mode === 'story'
      ? content.storyQuestions.length
      : mode === 'identify'
        ? parts.length
        : mode === 'quiz'
          ? content.quiz.length
          : 1;

  const taskTitle =
    mode === 'warmup'
      ? 'Watch the warmup video.'
      : mode === 'story'
        ? 'Watch the mission story.'
        : mode === 'identify'
          ? identifyTarget
            ? `Find the ${identifyTarget.label.toLowerCase()}.`
            : 'You found every part.'
          : mode === 'explore'
            ? `Explore the ${parts.find((p) => p.id === activePart)?.label ?? activePart}.`
            : mode === 'activity'
              ? content.activityLabel
              : 'Answer the check questions.';
  const taskText =
    mode === 'warmup'
      ? 'Watch the video, then press the Story tab to begin.'
      : mode === 'story'
        ? 'Watch the video, then answer the story questions.'
        : mode === 'identify'
        ? identifyTarget
          ? `Tap the ${identifyTarget.label.toLowerCase()} on the picture.`
          : 'Switch to Explore or Activity.'
        : mode === 'explore'
          ? parts.find((p) => p.id === activePart)?.fact ?? ''
          : mode === 'activity'
            ? content.activityInstruction
            : 'You finished the questions.';

  const bannerMessage =
    storyFeedback === 'correct'
      ? 'Great job! Keep watching.'
      : storyFeedback === 'wrong'
        ? 'Try again. Use the story clue.'
        : feedback === 'correct'
          ? `Great job! You found the ${activePart}.`
          : feedback === 'wrong'
            ? `Try again. Find the ${identifyTarget?.label.toLowerCase() ?? 'part'}.`
            : quizFeedback === 'correct'
              ? 'Great job! Keep learning.'
              : quizFeedback === 'wrong'
                ? 'Try again. Look carefully.'
                : mode === 'activity'
                  ? activityDone
                    ? 'Activity complete!'
                    : content.activityInstruction
                  : mode === 'story'
                    ? 'Watch the story and look for clues.'
                    : mode === 'warmup'
                      ? 'Watch the warmup video to get ready.'
                      : parts.find((p) => p.id === activePart)?.fact ?? '';
  const bannerState = storyFeedback ?? feedback ?? quizFeedback;

  const partRows = parts.map((part) => ({
    id: part.id,
    label: part.label,
    active: activePart === part.id,
    done: identified.has(part.id),
    locked: mode === 'identify' && !identified.has(part.id) && identifyTarget?.id !== part.id,
    status:
      mode === 'identify'
        ? identified.has(part.id)
          ? 'Complete'
          : identifyTarget?.id === part.id
            ? 'Find'
            : 'Locked'
        : mode === 'explore'
          ? activePart === part.id
            ? 'Reading'
            : 'Explore'
          : 'Learn',
    preview: partPreview(part.id),
  }));

  const trayParts = partRows;

  return (
    <div className="app-shell generic-app">
      <div className="sky-layer" />
      <MissionHeader score={120 + identified.size * 10} onDraw={onDraw} onBoard={onBoard} />
      <ModeTabs tabs={MODE_TABS} activeMode={mode} onSelect={selectMode} />

      <LessonStage>
        {stage({
          mode,
          activePart,
          lastSelectedPart,
          warmupVideoUrl: warmupVideoUrl ?? content.warmupVideoUrl,
          onSelect: selectPart,
          identified,
          activityDone,
          completeActivity: () => setActivityDone(true),
        })}
      </LessonStage>

      <aside className="task-column">
        <TaskCard badge={content.badge} title={taskTitle} text={taskText} feedback={feedback === 'wrong' ? 'wrong' : null}>
          {mode === 'story' ? (
            <button className="primary-action" onClick={() => selectMode('identify')}>
              Start Identifying
            </button>
          ) : null}
          {mode === 'activity' && !activityDone ? (
            <button
              className="primary-action"
              onClick={() => {
                setActivityDone(true);
              }}
            >
              Complete Activity
            </button>
          ) : null}
          {mode === 'activity' && activityDone ? (
            <div className="quiz-finished">Activity complete!</div>
          ) : null}
        </TaskCard>

        {mode === 'story' ? (
          <QuizCard
            prompt={storyQuestion.prompt}
            answers={storyQuestion.answers}
            indexLabel={`${storyIndex + 1}/${content.storyQuestions.length}`}
            feedback={storyFeedback}
            success={storyQuestion.success}
            onAnswer={answerStory}
          />
        ) : mode === 'warmup' ? null : (
          <QuizCard
            prompt={quizComplete ? 'You finished all the questions.' : quizQuestion.prompt}
            answers={quizComplete ? [] : quizQuestion.answers}
            indexLabel={`${Math.min(quizCorrect + 1, content.quiz.length)}/${content.quiz.length}`}
            feedback={quizFeedback}
            success={quizQuestion?.success}
            onAnswer={answerQuiz}
          />
        )}
        <TipCard>{mode === 'warmup' ? 'Tip: Warm bodies learn best.' : mode === 'story' ? 'Tip: Look for clues in the story.' : 'Tip: Look closely at the picture.'}</TipCard>
      </aside>

      <aside className="progress-column">
        {mode === 'story' ? (
          <ProgressCard done={storyCorrect} total={content.storyQuestions.length} label="answered" />
        ) : mode === 'warmup' ? (
          <ProgressCard done={warmupDone ? 1 : 0} total={1} label="warmup" />
        ) : (
          <ProgressCard done={progressDone} total={progressTotal} label={mode === 'identify' ? 'found' : 'done'} />
        )}
      </aside>

      {mode === 'identify' ? <PartsTray parts={trayParts} onSelect={selectPart} /> : null}
      {mode !== 'identify' || feedback ? <FeedbackBanner message={bannerMessage} state={bannerState} /> : null}
    </div>
  );
};
