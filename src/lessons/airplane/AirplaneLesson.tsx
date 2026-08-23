import React, {Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import {Canvas, type ThreeEvent, useFrame} from '@react-three/fiber';
import {Group, Vector3} from 'three';
import {AirplaneLessonModel} from './AirplaneLessonModel';
import {ModelOrbitControls} from '../shared/ModelViewportControls';
import {
  getExplodedOffset,
  LESSON_PARTS,
  PART_FACTS,
  PART_HELP,
  PART_LABELS,
  SNAP_RADIUS,
  type LessonPartId,
} from './content';
import lessonContent from './content.json';
import {StoryVideoCard} from '../shared/lesson-ui';
import {WarmupScreen} from '../shared/WarmupScreen';
import './lesson.scoped.css';

const STORY_VIDEO_URL = lessonContent.storyVideoUrl;
const STORY_QUESTIONS = lessonContent.storyQuestions;
const QUIZ_QUESTIONS = lessonContent.quiz;

const ASSEMBLY_SEQUENCE = LESSON_PARTS.filter((part) => part !== 'body');
const IDENTIFY_SEQUENCE = LESSON_PARTS;

type LessonMode = 'warmup' | 'story' | 'identify' | 'assemble' | 'explore' | 'watch';

const hasWebGLSupport = () => {
  if (typeof document === 'undefined') {
    return false;
  }

  const canvas = document.createElement('canvas');
  return Boolean(
    canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl'),
  );
};

class WebGLErrorBoundary extends Component<
  {children: ReactNode; fallback: ReactNode},
  {hasError: boolean}
> {
  state = {hasError: false};

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

const createInitialState = (): Record<LessonPartId, boolean> => ({
  body: true,
  cockpit: false,
  engine: false,
  leftWing: false,
  rightWing: false,
  tail: false,
  tires: false,
});

const createInitialPositions = (): Record<LessonPartId, [number, number, number]> => ({
  body: [0, 0, 0],
  cockpit: getExplodedOffset('cockpit'),
  engine: getExplodedOffset('engine'),
  leftWing: getExplodedOffset('leftWing'),
  rightWing: getExplodedOffset('rightWing'),
  tail: getExplodedOffset('tail'),
  tires: getExplodedOffset('tires'),
});

const PART_ICONS: Record<LessonPartId, string> = {
  body: 'BODY',
  cockpit: 'COCKPIT',
  engine: 'ENGINE',
  leftWing: 'WING',
  rightWing: 'WING',
  tail: 'TAIL',
  tires: 'WHEELS',
};

const PartPreview: React.FC<{part: LessonPartId}> = ({part}) => (
  <span className={`part-preview part-preview-${part}`} aria-hidden="true">
    {part === 'body' ? (
      <>
        <span className="body-shape" />
        <span className="body-window body-window-one" />
        <span className="body-window body-window-two" />
        <span className="body-window body-window-three" />
      </>
    ) : null}
    {part === 'cockpit' ? (
      <>
        <span className="cockpit-shape" />
        <span className="cockpit-window cockpit-window-one" />
        <span className="cockpit-window cockpit-window-two" />
      </>
    ) : null}
    {part === 'engine' ? (
      <>
        <span className="engine-shell" />
        <span className="engine-fan" />
      </>
    ) : null}
    {part === 'leftWing' || part === 'rightWing' ? <span className="wing-shape" /> : null}
    {part === 'tail' ? (
      <>
        <span className="tail-fin" />
        <span className="tail-base" />
      </>
    ) : null}
    {part === 'tires' ? (
      <>
        <span className="tire tire-left" />
        <span className="tire tire-right" />
        <span className="tire-axle" />
      </>
    ) : null}
  </span>
);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const WebGLFallback: React.FC = () => (
  <div className="webgl-fallback" role="status">
    <div>
      <strong>3D airplane needs WebGL.</strong>
      <span>
        This browser has WebGL disabled. Enable graphics acceleration in Chrome, or use Firefox.
      </span>
    </div>
  </div>
);

export const AirplaneLesson: React.FC<{
  onHome?: () => void;
  onComplete?: () => void;
  warmupVideoUrl?: string;
  onDraw?: () => void;
  onBoard?: () => void;
}> = ({onHome, onComplete, warmupVideoUrl, onDraw, onBoard}) => {
  const [webGLAvailable] = useState(hasWebGLSupport);
  const [mode, setMode] = useState<LessonMode>('warmup');
  const [assembledParts, setAssembledParts] = useState<Record<LessonPartId, boolean>>(
    createInitialState,
  );
  const [partPositions, setPartPositions] = useState<Record<LessonPartId, [number, number, number]>>(
    createInitialPositions,
  );
  const [selectedPart, setSelectedPart] = useState<LessonPartId>('cockpit');
  const [explorePart, setExplorePart] = useState<LessonPartId>('engine');
  const [identifiedParts, setIdentifiedParts] = useState<Partial<Record<LessonPartId, boolean>>>(
    {},
  );
  const [identifyFeedback, setIdentifyFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [lastCompletedPart, setLastCompletedPart] = useState<LessonPartId | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [storyQuestionIndex, setStoryQuestionIndex] = useState(0);
  const [storyCorrectAnswers, setStoryCorrectAnswers] = useState(0);
  const [storyFeedback, setStoryFeedback] = useState<'correct' | 'wrong' | null>(null);
  const modelGroupRef = useRef<Group>(null);
  const dragState = useRef<{
    part: LessonPartId;
    offset: [number, number, number];
  } | null>(null);
  const quizTimer = useRef<number | null>(null);
  const identifyTimer = useRef<number | null>(null);

  const fullyAssembledParts = useMemo(() => {
    return LESSON_PARTS.reduce(
      (parts, part) => ({
        ...parts,
        [part]: true,
      }),
      {} as Record<LessonPartId, boolean>,
    );
  }, []);

  const fullyAssembledPositions = useMemo(() => {
    return LESSON_PARTS.reduce(
      (positions, part) => ({
        ...positions,
        [part]: [0, 0, 0] as [number, number, number],
      }),
      {} as Record<LessonPartId, [number, number, number]>,
    );
  }, []);

  const assembledCount = useMemo(() => {
    return ASSEMBLY_SEQUENCE.filter((part) => assembledParts[part]).length;
  }, [assembledParts]);
  const isComplete = assembledCount === ASSEMBLY_SEQUENCE.length;
  const identifiedCount = useMemo(() => {
    return IDENTIFY_SEQUENCE.filter((part) => identifiedParts[part]).length;
  }, [identifiedParts]);

  const nextPart = useMemo(() => {
    return ASSEMBLY_SEQUENCE.find((part) => !assembledParts[part]) ?? null;
  }, [assembledParts]);
  const identifyTarget = useMemo(() => {
    return IDENTIFY_SEQUENCE.find((part) => !identifiedParts[part]) ?? null;
  }, [identifiedParts]);
  const quizQuestion = QUIZ_QUESTIONS[quizIndex];
  const storyQuestion = STORY_QUESTIONS[storyQuestionIndex];
  const quizComplete = correctAnswers === QUIZ_QUESTIONS.length;
  const displayAssembledParts = mode === 'assemble' ? assembledParts : fullyAssembledParts;
  const displayPartPositions = mode === 'assemble' ? partPositions : fullyAssembledPositions;

  const selectPart = (part: LessonPartId) => {
    setSelectedPart(part);
  };

  const selectIdentifyPart = (part: LessonPartId) => {
    setSelectedPart(part);
    if (!identifyTarget) {
      return;
    }

    const correct = identifyTarget === part;
    const partIndex = IDENTIFY_SEQUENCE.indexOf(part);
    const nextIdentifyPart =
      IDENTIFY_SEQUENCE.slice(partIndex + 1).find((candidate) => !identifiedParts[candidate]) ??
      null;
    setIdentifyFeedback(correct ? 'correct' : 'wrong');

    if (identifyTimer.current !== null) {
      window.clearTimeout(identifyTimer.current);
    }

    if (correct) {
      setIdentifiedParts((existing) => ({
        ...existing,
        [part]: true,
      }));
      setLastCompletedPart(part);
    }

    identifyTimer.current = window.setTimeout(() => {
      setIdentifyFeedback(null);
      if (correct && nextIdentifyPart) {
        setSelectedPart(nextIdentifyPart);
      }
    }, correct ? 900 : 650);
  };

  const selectExplorePart = (part: LessonPartId) => {
    setSelectedPart(part);
    setExplorePart(part);
    setLastCompletedPart(null);
  };

  const selectMode = (nextMode: LessonMode) => {
    setMode(nextMode);
    dragState.current = null;

    if (nextMode === 'identify') {
      setSelectedPart(identifyTarget ?? 'body');
    }

    if (nextMode === 'explore') {
      setSelectedPart(explorePart);
    }
  };

  const resetParts = () => {
    setMode('warmup');
    setAssembledParts(createInitialState());
    setPartPositions(createInitialPositions());
    setSelectedPart('cockpit');
    setExplorePart('engine');
    setIdentifiedParts({});
    setIdentifyFeedback(null);
    setLastCompletedPart(null);
    setQuizIndex(0);
    setSelectedAnswer(null);
    setQuizFeedback(null);
    setCorrectAnswers(0);
    setStoryQuestionIndex(0);
    setStoryCorrectAnswers(0);
    setStoryFeedback(null);
    dragState.current = null;
  };

  useEffect(() => {
    return () => {
      if (quizTimer.current !== null) {
        window.clearTimeout(quizTimer.current);
      }
      if (identifyTimer.current !== null) {
        window.clearTimeout(identifyTimer.current);
      }
    };
  }, []);

  const answerQuestion = (answerIndex: number) => {
    if (quizFeedback !== null || quizComplete) {
      return;
    }

    const correct = answerIndex === quizQuestion.correctIndex;
    setSelectedAnswer(answerIndex);
    setQuizFeedback(correct ? 'correct' : 'wrong');

    if (quizTimer.current !== null) {
      window.clearTimeout(quizTimer.current);
    }

    quizTimer.current = window.setTimeout(() => {
      if (correct) {
        setCorrectAnswers((existing) => Math.min(QUIZ_QUESTIONS.length, existing + 1));
        setQuizIndex((existing) => Math.min(QUIZ_QUESTIONS.length - 1, existing + 1));
      }

      setSelectedAnswer(null);
      setQuizFeedback(null);
    }, correct ? 950 : 650);
  };

  const answerStoryQuestion = (answerIndex: number) => {
    if (storyFeedback !== null || storyCorrectAnswers === STORY_QUESTIONS.length) {
      return;
    }

    const correct = answerIndex === storyQuestion.correctIndex;
    setStoryFeedback(correct ? 'correct' : 'wrong');

    window.setTimeout(() => {
      if (correct) {
        setStoryCorrectAnswers((existing) => Math.min(STORY_QUESTIONS.length, existing + 1));
        setStoryQuestionIndex((existing) => Math.min(STORY_QUESTIONS.length - 1, existing + 1));
      }

      setStoryFeedback(null);
    }, correct ? 900 : 650);
  };

  const toModelLocal = (event: ThreeEvent<PointerEvent>) => {
    if (!modelGroupRef.current) {
      return new Vector3();
    }

    return modelGroupRef.current.worldToLocal(event.point.clone());
  };

  const onPartPointerDown = (part: LessonPartId, event: ThreeEvent<PointerEvent>) => {
    if (part === 'body' || assembledParts[part]) {
      return;
    }

    event.stopPropagation();
    setSelectedPart(part);

    const localPoint = toModelLocal(event);
    const [x, y, z] = partPositions[part];

    dragState.current = {
      part,
      offset: [x - localPoint.x, y - localPoint.y, z - localPoint.z],
    };

    (event.target as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
  };

  const onPartPointerMove = (part: LessonPartId, event: ThreeEvent<PointerEvent>) => {
    if (dragState.current?.part !== part) {
      return;
    }

    event.stopPropagation();
    const localPoint = toModelLocal(event);
    const [offsetX, offsetY, offsetZ] = dragState.current.offset;
    const nextX = localPoint.x + offsetX;
    const nextY = localPoint.y + offsetY;
    const nextZ = localPoint.z + offsetZ;
    const current = partPositions[part];

    const constrainedPosition: [number, number, number] = (() => {
      switch (part) {
        case 'cockpit':
          return [clamp(nextX, -4, 4), clamp(nextY, 0, 12), clamp(current[2], -1, 1)];
        case 'engine':
          return [clamp(nextX, -4, 4), clamp(nextY, -12, 2), clamp(nextZ, -8, 4)];
        case 'leftWing':
          return [clamp(nextX, -18, -2), clamp(nextY, -2, 5), clamp(current[2], -2, 2)];
        case 'rightWing':
          return [clamp(nextX, 2, 18), clamp(nextY, -2, 5), clamp(current[2], -2, 2)];
        case 'tail':
          return [clamp(nextX, -5, 5), clamp(nextY, 0, 12), clamp(nextZ, 4, 18)];
        case 'tires':
          return [clamp(nextX, -6, 6), clamp(nextY, -14, 0), clamp(nextZ, 2, 14)];
        case 'body':
        default:
          return [0, 0, 0];
      }
    })();

    setPartPositions((existing) => ({
      ...existing,
      [part]: constrainedPosition,
    }));
  };

  const onPartPointerUp = (part: LessonPartId, event: ThreeEvent<PointerEvent>) => {
    if (dragState.current?.part !== part) {
      return;
    }

    event.stopPropagation();
    (event.target as HTMLElement | null)?.releasePointerCapture?.(event.pointerId);
    const [x, y, z] = dragState.current ? partPositions[dragState.current.part] : partPositions[part];
    const distance = Math.sqrt(x * x + y * y + z * z);

    if (distance < SNAP_RADIUS[part]) {
      setAssembledParts((existing) => {
        const updated = {
          ...existing,
          [part]: true,
        };
        const nextUnassembled = ASSEMBLY_SEQUENCE.find(
          (candidate) => candidate !== part && !updated[candidate],
        );
        setSelectedPart(nextUnassembled ?? 'body');
        return updated;
      });
      setPartPositions((existing) => ({
        ...existing,
        [part]: [0, 0, 0],
      }));
      setLastCompletedPart(part);
    }

    dragState.current = null;
  };

  const modelPartSelect =
    mode === 'identify' ? selectIdentifyPart : mode === 'explore' ? selectExplorePart : selectPart;
  const progressDone =
    mode === 'warmup'
      ? 0
      : mode === 'story'
        ? storyCorrectAnswers
        : mode === 'assemble'
          ? assembledCount
          : mode === 'identify'
            ? identifiedCount
            : IDENTIFY_SEQUENCE.length;
  const progressTotal =
    mode === 'warmup'
      ? 1
      : mode === 'story'
        ? STORY_QUESTIONS.length
        : mode === 'assemble'
          ? ASSEMBLY_SEQUENCE.length
          : IDENTIFY_SEQUENCE.length;
  const completionRatio = progressDone / progressTotal;
  const taskPart =
    mode === 'story'
      ? 'body'
      : mode === 'identify'
      ? identifyTarget ?? selectedPart
      : mode === 'explore'
        ? explorePart
        : nextPart ?? selectedPart;
  const taskTitle =
    mode === 'warmup'
      ? 'Get ready to fly.'
      : mode === 'story'
        ? 'Watch the mission story.'
        : mode === 'identify'
        ? identifyTarget
          ? `Find the ${PART_LABELS[identifyTarget].toLowerCase()}.`
          : 'You identified every part.'
        : mode === 'explore'
          ? `Explore the ${PART_LABELS[explorePart].toLowerCase()}.`
          : mode === 'watch'
            ? 'Watch the airplane fly.'
            : `Find the ${PART_LABELS[taskPart].toLowerCase()}.`;
  const instruction =
    mode === 'warmup'
      ? 'Watch the warmup video, then press the Story tab to begin.'
      : mode === 'story'
        ? 'Watch the video and answer the questions to understand why Lyson Island needs the airplane.'
        : mode === 'identify'
        ? identifyTarget
          ? `Tap the ${PART_LABELS[identifyTarget].toLowerCase()} on the airplane.`
          : 'Switch to Assemble to build it, or Explore to learn more.'
        : mode === 'explore'
          ? PART_FACTS[explorePart]
          : mode === 'watch'
            ? 'This screen is ready for the YouTube lesson link. The airplane stays assembled for the video step.'
            : nextPart === null
              ? 'All the main parts are attached. Reset to build the airplane again.'
              : `Drag the ${PART_LABELS[nextPart].toLowerCase()} onto the airplane body.`;
  const bannerMessage =
    storyFeedback === 'correct'
      ? 'Great job! Keep following the mission.'
      : storyFeedback === 'wrong'
        ? 'Try again. Use the story clue.'
        : identifyFeedback === 'correct'
      ? `Great job! You found the ${PART_LABELS[selectedPart].toLowerCase()}.`
      : identifyFeedback === 'wrong'
        ? `Try again. Find the ${identifyTarget ? PART_LABELS[identifyTarget].toLowerCase() : 'part'} on the airplane.`
        : quizFeedback === 'correct'
          ? 'Great job! Keep building!'
          : quizFeedback === 'wrong'
            ? 'Try again. Look carefully.'
            : lastCompletedPart
              ? 'Great job! Keep building!'
              : mode === 'story'
                ? 'Lyson Island needs supplies. Learn the mission first.'
                : mode === 'explore'
                ? PART_FACTS[explorePart]
                : mode === 'watch'
                  ? 'Video step ready. Add the YouTube link when the lesson video is final.'
                  : mode === 'warmup'
                    ? 'Warm up and get ready to fly!'
                    : PART_HELP[selectedPart];
  const bannerClass =
    identifyFeedback === 'correct' || quizFeedback === 'correct' || storyFeedback === 'correct'
      ? 'encouragement correct'
      : identifyFeedback === 'wrong' || quizFeedback === 'wrong' || storyFeedback === 'wrong'
        ? 'encouragement wrong'
        : 'encouragement';
  const planeComplete = mode === 'assemble' && isComplete;
  useEffect(() => {
    if (planeComplete) {
      onComplete?.();
    }
  }, [planeComplete, onComplete]);
  const showAssemblyCallouts = mode === 'assemble';
  const looseAssembly = mode === 'assemble' && !isComplete;
  const planeScale: [number, number, number] = looseAssembly ? [1.38, 1.38, 1.38] : [1.9, 1.9, 1.9];
  const planePosition: [number, number, number] = looseAssembly ? [0, 1.16, 2.05] : [0, 0.86, 1.95];
  const planeRotation: [number, number, number] = looseAssembly ? [0.18, -0.52, 0] : [0.08, -0.34, 0];

  return (
    <div className="app-shell plane-app">
      <div className="sky-layer" />
      <header className="mission-header">
        <div className="screen-actions">
          <button className="icon-btn icon-btn-draw" aria-label="Draw" onClick={onDraw} title="Draw">
            ✏️
          </button>
          <button className="icon-btn icon-btn-board" aria-label="Board" onClick={onBoard} title="Board">
            🖼️
          </button>
        </div>
      </header>

      <nav className="mode-tabs" aria-label="Lesson modes">
        <button
          className={mode === 'warmup' ? 'mode-tab fly active' : 'mode-tab fly'}
          onClick={() => selectMode('warmup')}
        >
          <span className="mode-icon">WU</span>
          <span>Warmup</span>
        </button>
        <button
          className={mode === 'story' ? 'mode-tab fly active' : 'mode-tab fly'}
          onClick={() => selectMode('story')}
        >
          <span className="mode-icon">PLAY</span>
          <span>Story</span>
        </button>
        <button
          className={mode === 'identify' ? 'mode-tab identify active' : 'mode-tab identify'}
          onClick={() => selectMode('identify')}
        >
          <span className="mode-icon">Q</span>
          <span>Identify</span>
        </button>
        <button
          className={mode === 'assemble' ? 'mode-tab assemble active' : 'mode-tab assemble'}
          onClick={() => selectMode('assemble')}
        >
          <span className="mode-icon">FIX</span>
          <span>Assemble</span>
        </button>
        <button
          className={mode === 'explore' ? 'mode-tab explore active' : 'mode-tab explore'}
          onClick={() => selectMode('explore')}
        >
          <span className="mode-icon">BOOK</span>
          <span>Explore</span>
        </button>
        <button
          className={mode === 'watch' ? 'mode-tab fly active' : 'mode-tab fly'}
          onClick={() => selectMode('watch')}
        >
          <span className="mode-icon">PLAY</span>
          <span>Watch It Fly</span>
        </button>
      </nav>

      {mode === 'warmup' ? (
        <section className="story-stage">
          <WarmupScreen videoUrl={warmupVideoUrl ?? lessonContent.warmupVideoUrl} />
        </section>
      ) : mode === 'story' ? (
        <section className="story-stage">
          <StoryVideoCard
            title="Lyson Island Needs Supplies"
            youtubeEmbedUrl={STORY_VIDEO_URL}
          />
        </section>
      ) : webGLAvailable ? (
        <WebGLErrorBoundary fallback={<WebGLFallback />}>
          <Canvas
            camera={{position: [0, 2.5, 12], fov: 30, near: 0.1, far: 100}}
            dpr={[1, 1.5]}
            gl={{antialias: false, failIfMajorPerformanceCaveat: false, powerPreference: 'default'}}
          >
            <ambientLight intensity={0.55} />
            <hemisphereLight intensity={0.65} groundColor="#667f99" />
            <directionalLight position={[10, 10, 7]} intensity={1.4} />
            <directionalLight position={[-5, 3, -5]} intensity={0.45} color="#a4c2ff" />
            <ModelOrbitControls
              zoomEnabled={mode === 'identify'}
              rotateEnabled={mode === 'explore'}
              target={[0, 1.05, 0]}
              minDistance={5.5}
              maxDistance={20}
            />

            <Suspense fallback={null}>
              <group position={planePosition} rotation={planeRotation} scale={planeScale}>
                <AirplaneLessonModel
                  modelUrl="models/airplane.glb"
                  activePart={selectedPart}
                  assembledParts={displayAssembledParts}
                  partPositions={displayPartPositions}
                  onPartSelect={modelPartSelect}
                  onPartPointerDown={mode === 'assemble' ? onPartPointerDown : undefined}
                  onPartPointerMove={mode === 'assemble' ? onPartPointerMove : undefined}
                  onPartPointerUp={mode === 'assemble' ? onPartPointerUp : undefined}
                  modelGroupRef={modelGroupRef}
                />
              </group>
            </Suspense>
          </Canvas>
        </WebGLErrorBoundary>
      ) : (
        <WebGLFallback />
      )}

      <aside className="task-column">
        <section className="task-card">
          <div className="task-header">
            <div className="pilot-badge">PILOT</div>
            <span>Your Task</span>
          </div>
          <div className="task-body">
            <h2>{taskTitle}</h2>
            <p>{instruction}</p>
            {mode === 'story' ? (
              <button className="primary-action" onClick={() => selectMode('identify')}>
                Start Identifying
              </button>
            ) : (
              <button
                className={identifyFeedback === 'wrong' ? 'ghost-part wrong' : 'ghost-part'}
                onClick={() => {
                  if (mode === 'identify') {
                    selectIdentifyPart(taskPart);
                    return;
                  }
                  if (mode === 'explore') {
                    selectExplorePart(taskPart);
                    return;
                  }
                  selectPart(taskPart);
                }}
              >
                <PartPreview part={taskPart} />
              </button>
            )}
          </div>
        </section>

        {mode === 'warmup' ? null : (
        <section
          className={
            (mode === 'story' ? storyFeedback : quizFeedback) === 'correct'
              ? 'quiz-card correct-pop'
              : (mode === 'story' ? storyFeedback : quizFeedback) === 'wrong'
                ? 'quiz-card wrong-shake'
                : 'quiz-card'
          }
        >
          <div className="quiz-header">
            <span>Check Question</span>
            <span>
              {mode === 'story'
                ? `${storyQuestionIndex + 1}/${STORY_QUESTIONS.length}`
                : `${Math.min(correctAnswers + 1, QUIZ_QUESTIONS.length)}/${QUIZ_QUESTIONS.length}`}
            </span>
          </div>
          <div className="quiz-body">
            <h3>{mode === 'story' ? storyQuestion.prompt : quizComplete ? 'You finished all ten questions.' : quizQuestion.prompt}</h3>
            {mode === 'story' ? (
              storyQuestion.answers.map((answer, index) => {
                const isCorrect = storyFeedback !== null && index === storyQuestion.correctIndex;
                const isWrong = storyFeedback === 'wrong' && index !== storyQuestion.correctIndex;

                return (
                  <button
                    key={answer}
                    className={isCorrect ? 'answer correct' : isWrong ? 'answer wrong' : 'answer'}
                    onClick={() => answerStoryQuestion(index)}
                  >
                    {String.fromCharCode(65 + index)} {answer}
                  </button>
                );
              })
            ) : quizComplete ? (
              <div className="quiz-finished">Score: {correctAnswers}/{QUIZ_QUESTIONS.length}</div>
            ) : (
              quizQuestion.answers.map((answer, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = quizFeedback !== null && index === quizQuestion.correctIndex;
                const isWrong = quizFeedback === 'wrong' && isSelected;

                return (
                  <button
                    key={answer}
                    className={isCorrect ? 'answer correct' : isWrong ? 'answer wrong' : 'answer'}
                    onClick={() => answerQuestion(index)}
                  >
                    {String.fromCharCode(65 + index)} {answer}
                  </button>
                );
              })
            )}
            {(mode === 'story' ? storyFeedback : quizFeedback) === 'correct' ? (
              <div className="correct-burst">
                <span>Correct!</span>
                <small>{mode === 'story' ? storyQuestion.success : quizQuestion.success}</small>
              </div>
            ) : null}
            {(mode === 'story' ? storyFeedback : quizFeedback) === 'wrong' ? (
              <div className="try-again">
                {mode === 'story' ? 'Try again. Use the story clue.' : 'Try again. Look for the part clue.'}
              </div>
            ) : null}
          </div>
        </section>
        )}

        <div className="tip-card">
          {mode === 'warmup'
            ? 'Tip: Warm bodies learn best.'
            : mode === 'story'
              ? 'Tip: Listen for the mission problem.'
              : 'Tip: Look at the shape.'}
        </div>
      </aside>

      <aside className="progress-column">
        <section className="progress-card">
          <div className="eyebrow">Your Progress</div>
          <div className="progress-count">
            {progressDone}/{progressTotal}{' '}
            <span>{mode === 'story' ? 'answered' : mode === 'identify' ? 'found' : 'parts'}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{width: `${completionRatio * 100}%`}} />
          </div>
        </section>

        {mode === 'story' || mode === 'warmup' ? null : <section className="parts-list-card">
          <div className="eyebrow">Parts List</div>
          {LESSON_PARTS.map((part) => {
            const assembled = assembledParts[part];
            const identified = Boolean(identifiedParts[part]);
            const active = selectedPart === part;
            const nextIndex = nextPart ? ASSEMBLY_SEQUENCE.indexOf(nextPart) : -1;
            const partIndex = ASSEMBLY_SEQUENCE.indexOf(part as (typeof ASSEMBLY_SEQUENCE)[number]);
            const assemblyLocked =
              part !== 'body' && !assembled && nextIndex !== -1 && partIndex > nextIndex;
            const identifyIndex = identifyTarget ? IDENTIFY_SEQUENCE.indexOf(identifyTarget) : -1;
            const partIdentifyIndex = IDENTIFY_SEQUENCE.indexOf(part);
            const identifyLocked =
              mode === 'identify' &&
              !identified &&
              identifyIndex !== -1 &&
              partIdentifyIndex > identifyIndex;
            const locked = mode === 'assemble' ? assemblyLocked : identifyLocked;
            const status =
              mode === 'watch'
                ? 'Ready'
                : mode === 'explore'
                ? active
                  ? 'Reading'
                  : 'Explore'
                : mode === 'identify'
                  ? identified
                    ? 'Complete'
                    : locked
                      ? 'Locked'
                      : 'Find'
                  : part === 'body' || assembled
                    ? 'Complete'
                    : locked
                      ? 'Locked'
                      : 'Drag';
            const done = status === 'Complete';

            return (
              <button
                key={part}
                className={active ? 'side-part active' : 'side-part'}
                onClick={() => {
                  if (mode === 'identify') {
                    selectIdentifyPart(part);
                    return;
                  }
                  if (mode === 'explore') {
                    selectExplorePart(part);
                    return;
                  }
                  selectPart(part);
                }}
              >
                <span className="side-part-icon">
                  <PartPreview part={part} />
                </span>
                <span>{PART_LABELS[part]}</span>
                <span className={done ? 'side-state done' : locked ? 'side-state locked' : 'side-state'}>
                  {status}
                </span>
              </button>
            );
          })}
        </section>}

        <button className="watch-button" onClick={() => selectMode('watch')}>
          <span className="watch-play">PLAY</span>
          Watch It Fly
        </button>
      </aside>

      <div className="lesson-callouts">
        {showAssemblyCallouts && !assembledParts.tail ? (
          <div className="callout tail-callout">
            <span>Stable</span>
            <small>Tail</small>
          </div>
        ) : null}
        {showAssemblyCallouts && !assembledParts.engine ? (
          <div className="callout engine-callout">
            <span>Thrust</span>
            <small>Engine</small>
          </div>
        ) : null}
        {showAssemblyCallouts && (!assembledParts.leftWing || !assembledParts.rightWing) ? (
          <div className="callout wing-callout">
            <span>Lift</span>
            <small>Wing</small>
          </div>
        ) : null}
      </div>

      {mode === 'story' || mode === 'warmup' ? null : <section className="parts-tray">
        {ASSEMBLY_SEQUENCE.map((part) => {
          const assembled = assembledParts[part];
          const active = selectedPart === part;

          return (
            <button
              key={part}
              className={active ? 'tray-part active' : 'tray-part'}
              onClick={() => {
                if (mode === 'identify') {
                  selectIdentifyPart(part);
                  return;
                }
                if (mode === 'explore') {
                  selectExplorePart(part);
                  return;
                }
                selectPart(part);
              }}
              disabled={mode === 'assemble' && assembled}
            >
              <span className="tray-thumb">
                <PartPreview part={part} />
              </span>
              <span>{PART_LABELS[part]}</span>
            </button>
          );
        })}
      </section>}

      <div className={bannerClass}>
        <span>STAR</span>
        <strong>{bannerMessage}</strong>
      </div>

      {lastCompletedPart ? (
        <div className="success-badge">Attached: {PART_LABELS[lastCompletedPart]}</div>
      ) : null}

      {planeComplete ? (
        <>
          <div className="finish-glow" />
          <div className="finish-card">
            <div className="finish-label">Ready To Fly</div>
            <div className="finish-title">You built the airplane.</div>
            <div className="finish-text">
              The cockpit, engines, wings, tail, and tires are all attached.
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AirplaneLesson;
