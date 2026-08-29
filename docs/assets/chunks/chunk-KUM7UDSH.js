import {
  FeedbackBanner,
  GameEmbed,
  LessonStage,
  MissionHeader,
  ModeTabs,
  PartsTray,
  ProgressCard,
  QuizCard,
  TaskCard,
  TipCard
} from "./chunk-YSRYPTBG.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-QP3GZB4W.js";

// src/lessons/generic/GenericLesson.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
var MODE_TABS = [
  { id: "warmup", label: "Warmup", icon: "WU", tone: "fly" },
  { id: "story", label: "Story", icon: "PLAY", tone: "fly" },
  { id: "identify", label: "Identify", icon: "Q", tone: "identify" },
  { id: "explore", label: "Explore", icon: "BOOK", tone: "explore" },
  { id: "activity", label: "Activity", icon: "DO", tone: "assemble" },
  { id: "quiz", label: "Quiz", icon: "TICK", tone: "fly" }
];
var GenericLesson = ({ content, onHome, onComplete, warmupVideoUrl, onDraw, onBoard, stage, partPreview }) => {
  const [mode, setMode] = (0, import_react.useState)(() => {
    if (typeof window !== "undefined") {
      const param = new URLSearchParams(window.location.search).get("mode");
      if (param === "story" || param === "identify" || param === "explore" || param === "activity" || param === "quiz") {
        return param;
      }
    }
    return "warmup";
  });
  const [warmupDone, setWarmupDone] = (0, import_react.useState)(false);
  const [activePart, setActivePart] = (0, import_react.useState)(content.parts?.[0]?.id ?? "part");
  const [lastSelectedPart, setLastSelectedPart] = (0, import_react.useState)(null);
  const [identified, setIdentified] = (0, import_react.useState)(/* @__PURE__ */ new Set());
  const [feedback, setFeedback] = (0, import_react.useState)(null);
  const [storyIndex, setStoryIndex] = (0, import_react.useState)(0);
  const [storyCorrect, setStoryCorrect] = (0, import_react.useState)(0);
  const [storyFeedback, setStoryFeedback] = (0, import_react.useState)(null);
  const [quizIndex, setQuizIndex] = (0, import_react.useState)(0);
  const [quizCorrect, setQuizCorrect] = (0, import_react.useState)(0);
  const [quizFeedback, setQuizFeedback] = (0, import_react.useState)(null);
  const [activityDone, setActivityDone] = (0, import_react.useState)(false);
  const [openGameId, setOpenGameId] = (0, import_react.useState)(null);
  const parts = content.parts ?? [];
  const activityGames = content.activityGames ?? (content.gameEmbedUrl ? [{
    id: "game",
    label: content.activityLabel,
    title: content.activityLabel,
    src: content.gameEmbedUrl
  }] : []);
  const openGame = activityGames.find((game) => game.id === openGameId) ?? null;
  const storyQuestion = content.storyQuestions[storyIndex];
  const quizQuestion = content.quiz[quizIndex];
  const identifyTarget = parts.find((part) => !identified.has(part.id)) ?? null;
  const quizComplete = quizCorrect === content.quiz.length;
  (0, import_react.useEffect)(() => {
    if (mode === "identify") {
      setActivePart(identifyTarget?.id ?? parts[0]?.id ?? "part");
    }
    if (mode === "explore") {
      setActivePart(parts[0]?.id ?? "part");
    }
  }, [mode]);
  (0, import_react.useEffect)(() => {
    if (activityDone && mode === "activity") {
      onComplete();
    }
  }, [activityDone, mode]);
  const selectMode = (next) => {
    setMode(next);
    setFeedback(null);
    setLastSelectedPart(null);
    setOpenGameId(null);
    if (next === "identify") {
      setActivePart(identifyTarget?.id ?? parts[0]?.id ?? "part");
    }
  };
  const selectPart = (partId) => {
    setActivePart(partId);
    setLastSelectedPart(partId);
    if (mode !== "identify" || !identifyTarget) {
      return;
    }
    const correct = partId === identifyTarget.id;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) {
      const next = new Set(identified);
      next.add(partId);
      setIdentified(next);
      setActivePart(parts.find((p) => !next.has(p.id))?.id ?? partId);
    }
    window.setTimeout(() => setFeedback(null), correct ? 850 : 600);
  };
  const answerStory = (index) => {
    if (storyFeedback || storyCorrect === content.storyQuestions.length) {
      return;
    }
    const correct = index === storyQuestion.correctIndex;
    setStoryFeedback(correct ? "correct" : "wrong");
    window.setTimeout(() => {
      if (correct) {
        setStoryCorrect((n) => Math.min(content.storyQuestions.length, n + 1));
        setStoryIndex((n) => Math.min(content.storyQuestions.length - 1, n + 1));
      }
      setStoryFeedback(null);
    }, correct ? 850 : 600);
  };
  const answerQuiz = (index) => {
    if (quizFeedback || quizComplete) {
      return;
    }
    const correct = index === quizQuestion.correctIndex;
    setQuizFeedback(correct ? "correct" : "wrong");
    window.setTimeout(() => {
      if (correct) {
        setQuizCorrect((n) => Math.min(content.quiz.length, n + 1));
        setQuizIndex((n) => Math.min(content.quiz.length - 1, n + 1));
      }
      setQuizFeedback(null);
    }, correct ? 850 : 600);
  };
  const reset = () => {
    setMode("warmup");
    setWarmupDone(false);
    setActivePart(parts[0]?.id ?? "part");
    setLastSelectedPart(null);
    setIdentified(/* @__PURE__ */ new Set());
    setFeedback(null);
    setStoryIndex(0);
    setStoryCorrect(0);
    setStoryFeedback(null);
    setQuizIndex(0);
    setQuizCorrect(0);
    setQuizFeedback(null);
    setActivityDone(false);
    setOpenGameId(null);
  };
  const progressDone = mode === "story" ? storyCorrect : mode === "identify" ? identified.size : mode === "quiz" ? quizCorrect : activityDone ? 1 : 0;
  const progressTotal = mode === "story" ? content.storyQuestions.length : mode === "identify" ? parts.length : mode === "quiz" ? content.quiz.length : 1;
  const taskTitle = mode === "warmup" ? "Watch the warmup video." : mode === "story" ? "Watch the mission story." : mode === "identify" ? identifyTarget ? `Find the ${identifyTarget.label.toLowerCase()}.` : "You found every part." : mode === "explore" ? `Explore the ${parts.find((p) => p.id === activePart)?.label ?? activePart}.` : mode === "activity" ? content.activityLabel : "Answer the check questions.";
  const taskText = mode === "warmup" ? "Watch the video, then press the Story tab to begin." : mode === "story" ? "Watch the video, then answer the story questions." : mode === "identify" ? identifyTarget ? `Tap the ${identifyTarget.label.toLowerCase()} on the picture.` : "Switch to Explore or Activity." : mode === "explore" ? parts.find((p) => p.id === activePart)?.fact ?? "" : mode === "activity" ? content.activityInstruction : "You finished the questions.";
  const bannerMessage = storyFeedback === "correct" ? "Great job! Keep watching." : storyFeedback === "wrong" ? "Try again. Use the story clue." : feedback === "correct" ? `Great job! You found the ${activePart}.` : feedback === "wrong" ? `Try again. Find the ${identifyTarget?.label.toLowerCase() ?? "part"}.` : quizFeedback === "correct" ? "Great job! Keep learning." : quizFeedback === "wrong" ? "Try again. Look carefully." : mode === "activity" ? activityDone ? "Activity complete!" : content.activityInstruction : mode === "story" ? "Watch the story and look for clues." : mode === "warmup" ? "Watch the warmup video to get ready." : parts.find((p) => p.id === activePart)?.fact ?? "";
  const bannerState = storyFeedback ?? feedback ?? quizFeedback;
  const partRows = parts.map((part) => ({
    id: part.id,
    label: part.label,
    active: activePart === part.id,
    done: identified.has(part.id),
    locked: mode === "identify" && !identified.has(part.id) && identifyTarget?.id !== part.id,
    status: mode === "identify" ? identified.has(part.id) ? "Complete" : identifyTarget?.id === part.id ? "Find" : "Locked" : mode === "explore" ? activePart === part.id ? "Reading" : "Explore" : "Learn",
    preview: partPreview(part.id)
  }));
  const trayParts = partRows;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "app-shell generic-app", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "sky-layer" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MissionHeader, { score: 120 + identified.size * 10, onDraw, onBoard }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeTabs, { tabs: MODE_TABS, activeMode: mode, onSelect: selectMode }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LessonStage, { children: mode === "activity" && openGame ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      GameEmbed,
      {
        title: openGame.title,
        src: openGame.src,
        open: true,
        onClose: () => setOpenGameId(null),
        onComplete: () => setActivityDone(true)
      }
    ) : stage({
      mode,
      activePart,
      lastSelectedPart,
      warmupVideoUrl: warmupVideoUrl ?? content.warmupVideoUrl,
      onSelect: selectPart,
      identified,
      activityDone,
      completeActivity: () => setActivityDone(true)
    }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { className: "task-column", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TaskCard, { badge: content.badge, title: taskTitle, text: taskText, feedback: feedback === "wrong" ? "wrong" : null, children: [
        mode === "story" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "primary-action", onClick: () => selectMode("identify"), children: "Start Identifying" }) : null,
        mode === "activity" && !activityDone && activityGames.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            className: "primary-action",
            onClick: () => {
              setActivityDone(true);
            },
            children: "Complete Activity"
          }
        ) : null,
        mode === "activity" && activityDone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "quiz-finished", children: "Activity complete!" }) : null
      ] }),
      mode === "story" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        QuizCard,
        {
          prompt: storyQuestion.prompt,
          answers: storyQuestion.answers,
          indexLabel: `${storyIndex + 1}/${content.storyQuestions.length}`,
          feedback: storyFeedback,
          success: storyQuestion.success,
          onAnswer: answerStory
        }
      ) : mode === "warmup" || mode === "activity" ? mode === "activity" && activityGames.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "activity-game-launchers", children: activityGames.map((game, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        GameEmbed,
        {
          title: game.title,
          src: game.src,
          buttonLabel: game.id === "draw-the-bridge" ? game.label : `Activity ${index}: ${game.label}`,
          onOpen: () => setOpenGameId(game.id)
        },
        game.id
      )) }) : null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        QuizCard,
        {
          prompt: quizComplete ? "You finished all the questions." : quizQuestion.prompt,
          answers: quizComplete ? [] : quizQuestion.answers,
          indexLabel: `${Math.min(quizCorrect + 1, content.quiz.length)}/${content.quiz.length}`,
          feedback: quizFeedback,
          success: quizQuestion?.success,
          onAnswer: answerQuiz
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TipCard, { children: mode === "warmup" ? "Tip: Warm bodies learn best." : mode === "story" ? "Tip: Look for clues in the story." : "Tip: Look closely at the picture." })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", { className: "progress-column", children: mode === "story" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressCard, { done: storyCorrect, total: content.storyQuestions.length, label: "answered" }) : mode === "warmup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressCard, { done: warmupDone ? 1 : 0, total: 1, label: "warmup" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressCard, { done: progressDone, total: progressTotal, label: mode === "identify" ? "found" : "done" }) }),
    mode === "identify" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartsTray, { parts: trayParts, onSelect: selectPart }) : null,
    mode !== "identify" || feedback ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedbackBanner, { message: bannerMessage, state: bannerState }) : null
  ] });
};

export {
  GenericLesson
};
