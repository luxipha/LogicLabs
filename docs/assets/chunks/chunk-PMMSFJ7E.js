import {
  __toESM,
  require_jsx_runtime
} from "./chunk-QP3GZB4W.js";

// src/lessons/shared/lesson-ui.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime());
var MissionHeader = ({ score }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { className: "mission-header", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "score-pill", children: [
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "score-star", children: "STAR" }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: score })
] }) });
var ModeTabs = ({
  tabs,
  activeMode,
  onSelect
}) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { className: "mode-tabs", "aria-label": "Lesson modes", children: tabs.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
  "button",
  {
    className: activeMode === tab.id ? `mode-tab ${tab.tone} active` : `mode-tab ${tab.tone}`,
    onClick: () => onSelect(tab.id),
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mode-icon", children: tab.icon }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tab.label })
    ]
  },
  tab.id
)) });
var TaskCard = ({ badge, title, text, preview, feedback = null, children, onPreviewClick }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "task-card", children: [
  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "task-header", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pilot-badge", children: badge }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Your Task" })
  ] }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "task-body", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: title }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: text }),
    preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: feedback === "wrong" ? "ghost-part wrong" : "ghost-part", onClick: onPreviewClick, children: preview }) : null,
    children
  ] })
] });
var QuizCard = ({ prompt, answers, indexLabel, feedback, success, onAnswer }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
  "section",
  {
    className: feedback === "correct" ? "quiz-card correct-pop" : feedback === "wrong" ? "quiz-card wrong-shake" : "quiz-card",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "quiz-header", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Check Question" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: indexLabel })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "quiz-body", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: prompt }),
        answers.map((answer, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "answer", onClick: () => onAnswer(index), children: [
          String.fromCharCode(65 + index),
          " ",
          answer
        ] }, answer)),
        feedback === "correct" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "correct-burst", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Correct!" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: success ?? "Keep going." })
        ] }) : null,
        feedback === "wrong" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "try-again", children: "Try again. Look for the clue." }) : null
      ] })
    ]
  }
);
var StoryVideoCard = ({ title, youtubeEmbedUrl }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { className: "story-video-card video-only", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "story-video-frame", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
  "iframe",
  {
    title,
    src: youtubeEmbedUrl,
    allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
    allowFullScreen: true
  }
) }) });
var TipCard = ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "tip-card", children });
var LessonStage = ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { className: "lesson-stage", children });
var ProgressCard = ({ done, total, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "progress-card", children: [
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eyebrow", children: "Your Progress" }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "progress-count", children: [
    done,
    "/",
    total,
    " ",
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })
  ] }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "progress-bar", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "progress-fill", style: { width: `${done / total * 100}%` } }) })
] });
var PartsList = ({
  parts,
  onSelect,
  interactive = true
}) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "parts-list-card", children: [
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eyebrow", children: "Parts List" }),
  parts.map((part) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "button",
    {
      className: part.active ? "side-part active" : "side-part",
      "aria-disabled": !interactive,
      onClick: () => {
        if (interactive) {
          onSelect(part.id);
        }
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "side-part-icon", children: part.preview }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: part.label }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: part.done ? "side-state done" : part.locked ? "side-state locked" : "side-state", children: part.status })
      ]
    },
    part.id
  ))
] });
var PartsTray = ({
  parts,
  onSelect,
  interactive = true
}) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { className: "parts-tray", children: parts.map((part) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
  "button",
  {
    className: part.active ? "tray-part active" : "tray-part",
    disabled: part.disabled,
    "aria-disabled": !interactive,
    onClick: () => {
      if (interactive) {
        onSelect(part.id);
      }
    },
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "tray-thumb", children: part.preview }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: part.label })
    ]
  },
  part.id
)) });
var FeedbackBanner = ({ message, state = null }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: state ? `encouragement ${state}` : "encouragement", children: [
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "STAR" }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: message })
] });

// src/lessons/shared/WarmupScreen.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var WarmupScreen = ({ videoUrl }) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("section", { className: "story-video-card video-only warmup-screen", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "story-video-frame", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
  "iframe",
  {
    title: "Warmup video",
    src: videoUrl,
    allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
    allowFullScreen: true
  }
) }) });

export {
  MissionHeader,
  ModeTabs,
  TaskCard,
  QuizCard,
  StoryVideoCard,
  TipCard,
  LessonStage,
  ProgressCard,
  PartsList,
  PartsTray,
  FeedbackBanner,
  WarmupScreen
};
