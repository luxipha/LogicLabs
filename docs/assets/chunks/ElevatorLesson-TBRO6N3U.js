import {
  content_default
} from "./chunk-BVHPWJQA.js";
import {
  GenericLesson
} from "./chunk-XAZTOAQT.js";
import {
  StoryVideoCard,
  WarmupScreen
} from "./chunk-LSECZ6XO.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-QP3GZB4W.js";

// src/lessons/elevator/ElevatorStage.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
var ElevatorStage = ({ activePart, identified, onSelect, mode, warmupVideoUrl, activityDone, completeActivity }) => {
  const [floor, setFloor] = (0, import_react.useState)(0);
  if (mode === "warmup") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarmupScreen, { videoUrl: warmupVideoUrl }) });
  }
  if (mode === "story") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryVideoCard, { title: content_default.title, youtubeEmbedUrl: content_default.storyVideoUrl }) });
  }
  if (mode === "activity") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "elevator-activity", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "elevator-shaft", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "elevator-floors", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Floor 2" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Floor 1" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ground" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `elevator-cab-move floor-${floor}`, children: "\u{1F6D7}" })
      ] }),
      activityDone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bee-activity-done", children: "Nice ride! The elevator reached the top floor." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          className: "primary-action",
          onClick: () => {
            if (floor < 2) {
              setFloor(floor + 1);
            } else {
              setFloor(0);
              completeActivity();
            }
          },
          children: floor === 0 ? "Go up" : floor === 1 ? "Go up again" : "Back to ground"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 680 460", className: "generic-art", "aria-label": "Elevator", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "340", cy: "230", r: "200", fill: "rgba(255,255,255,0.1)" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "180", y: "40", width: "320", height: "380", rx: "12", fill: "#dbe7f2", stroke: "#7fa8c9", strokeWidth: "4" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "g",
      {
        className: `generic-part ${activePart === "pulley" ? "active" : ""} ${identified.has("pulley") ? "done" : ""}`,
        onClick: () => onSelect("pulley"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "340", cy: "70", r: "26", fill: "#8a93a0", stroke: "#5c6570", strokeWidth: "4" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "340", cy: "70", r: "8", fill: "#5c6570" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "326", y: "44", width: "28", height: "10", rx: "4", fill: "#5c6570" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "g",
      {
        className: `generic-part ${activePart === "cable" ? "active" : ""} ${identified.has("cable") ? "done" : ""}`,
        onClick: () => onSelect("cable"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M340 96 v180", stroke: "#3a4a5c", strokeWidth: "6" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M340 96 v180", stroke: "#ffffff", strokeWidth: "2" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "120", y: "120", width: "44", height: "90", rx: "8", fill: "#9aa7b3", stroke: "#6b7885", strokeWidth: "3" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "g",
      {
        className: `generic-part ${activePart === "cab" ? "active" : ""} ${identified.has("cab") ? "done" : ""}`,
        onClick: () => onSelect("cab"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "260", y: "210", width: "160", height: "170", rx: "10", fill: "#e84a5f", stroke: "#b22a3d", strokeWidth: "4" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "260", y: "210", width: "160", height: "36", rx: "10", fill: "#c23a4e" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "g",
      {
        className: `generic-part ${activePart === "doors" ? "active" : ""} ${identified.has("doors") ? "done" : ""}`,
        onClick: () => onSelect("doors"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "280", y: "246", width: "56", height: "134", rx: "6", fill: "#ffd9a0", stroke: "#d9a06a", strokeWidth: "3" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "344", y: "246", width: "56", height: "134", rx: "6", fill: "#ffd9a0", stroke: "#d9a06a", strokeWidth: "3" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "336", y: "246", width: "8", height: "134", fill: "#c23a4e" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "g",
      {
        className: `generic-part ${activePart === "button" ? "active" : ""} ${identified.has("button") ? "done" : ""}`,
        onClick: () => onSelect("button"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "368", cy: "232", r: "14", fill: "#ffcf4a", stroke: "#e8a800", strokeWidth: "4" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M364 232 l8 0 M368 228 v8", stroke: "#114a9a", strokeWidth: "3", strokeLinecap: "round" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", { x1: "180", y1: "260", x2: "500", y2: "260", stroke: "#7fa8c9", strokeWidth: "2", strokeDasharray: "8 6" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", { x1: "180", y1: "370", x2: "500", y2: "370", stroke: "#7fa8c9", strokeWidth: "2", strokeDasharray: "8 6" })
  ] }) });
};
var ElevatorPartPreview = ({ part }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "generic-part-preview", "aria-hidden": "true", children: [
  part === "cab" ? "\u{1F6D7}" : null,
  part === "doors" ? "\u{1F6AA}" : null,
  part === "cable" ? "\u3030\uFE0F" : null,
  part === "pulley" ? "\u2699\uFE0F" : null,
  part === "button" ? "\u{1F518}" : null
] });

// src/lessons/elevator/ElevatorLesson.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var ElevatorLesson = ({ onHome, onComplete, warmupVideoUrl, onDraw, onBoard }) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
  GenericLesson,
  {
    content: content_default,
    onHome: onHome ?? (() => {
    }),
    onComplete: onComplete ?? (() => {
    }),
    warmupVideoUrl,
    onDraw,
    onBoard,
    stage: (props) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ElevatorStage, { ...props, mode: props.mode }),
    partPreview: (part) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ElevatorPartPreview, { part })
  }
);
var ElevatorLesson_default = ElevatorLesson;
export {
  ElevatorLesson,
  ElevatorLesson_default as default
};
