import {
  content_default
} from "./chunk-JOJRIEWH.js";
import {
  GenericLesson
} from "./chunk-FKNKSDAA.js";
import {
  StoryVideoCard,
  WarmupScreen
} from "./chunk-PMMSFJ7E.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-QP3GZB4W.js";

// src/lessons/honey-bee/HoneyBeeStage.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
var HoneyBeeStage = ({ activePart, identified, onSelect, mode, activityDone, completeActivity }) => {
  const [step, setStep] = (0, import_react.useState)(0);
  if (mode === "warmup") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarmupScreen, { videoUrl: content_default.warmupVideoUrl }) });
  }
  if (mode === "story") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryVideoCard, { title: content_default.title, youtubeEmbedUrl: content_default.storyVideoUrl }) });
  }
  if (mode === "activity") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bee-activity", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bee-activity-flower", children: "\u{1F338}" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bee-activity-hive", children: "\u{1F3E0}" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `bee-activity-bee ${step === 1 ? "collecting" : ""} ${step === 2 ? "returning" : ""}`, children: "\u{1F41D}" }),
      activityDone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bee-activity-done", children: "Pollen delivered! The hive is stocked." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          className: "primary-action",
          onClick: () => {
            setStep((s) => s + 1);
            if (step >= 1) {
              completeActivity();
            }
          },
          children: step === 0 ? "Fly to the flower" : step === 1 ? "Collect pollen" : "Fly home"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 680 460", className: "generic-art", "aria-label": "Honey bee", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "340", cy: "230", r: "200", fill: "rgba(255,255,255,0.1)" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "ellipse",
      {
        className: `generic-part ${activePart === "wings" ? "active" : ""} ${identified.has("wings") ? "done" : ""}`,
        cx: "330",
        cy: "150",
        rx: "95",
        ry: "60",
        fill: "rgba(200,230,255,0.55)",
        stroke: "#bcd9f2",
        strokeWidth: "3",
        onClick: () => onSelect("wings")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "ellipse",
      {
        className: `generic-part ${activePart === "wings" ? "active" : ""} ${identified.has("wings") ? "done" : ""}`,
        cx: "350",
        cy: "140",
        rx: "60",
        ry: "38",
        fill: "rgba(255,255,255,0.6)",
        stroke: "#cfe4f5",
        strokeWidth: "2",
        onClick: () => onSelect("wings")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "ellipse",
      {
        className: `generic-part ${activePart === "body" ? "active" : ""} ${identified.has("body") ? "done" : ""}`,
        cx: "340",
        cy: "270",
        rx: "90",
        ry: "120",
        fill: "#ffd75e",
        stroke: "#e8a800",
        strokeWidth: "4",
        onClick: () => onSelect("body")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M300 210 q40 12 80 0 M300 250 q40 12 80 0 M300 290 q40 12 80 0 M300 330 q40 12 80 0", stroke: "#3a2a10", strokeWidth: "10", fill: "none" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "340", cy: "140", r: "52", fill: "#ffcf4a", stroke: "#e8a800", strokeWidth: "4" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "322", cy: "128", r: "10", fill: "#1c1c1c" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "358", cy: "128", r: "10", fill: "#1c1c1c" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M330 150 q10 8 20 0", stroke: "#3a2a10", strokeWidth: "4", fill: "none" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "g",
      {
        className: `generic-part ${activePart === "antennae" ? "active" : ""} ${identified.has("antennae") ? "done" : ""}`,
        onClick: () => onSelect("antennae"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M318 96 q-14 -34 -4 -58", stroke: "#3a2a10", strokeWidth: "5", fill: "none" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M362 96 q14 -34 4 -58", stroke: "#3a2a10", strokeWidth: "5", fill: "none" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "314", cy: "36", r: "7", fill: "#3a2a10" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "366", cy: "36", r: "7", fill: "#3a2a10" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "g",
      {
        className: `generic-part ${activePart === "proboscis" ? "active" : ""} ${identified.has("proboscis") ? "done" : ""}`,
        onClick: () => onSelect("proboscis"),
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M340 188 q6 34 -6 52", stroke: "#8a5a20", strokeWidth: "8", fill: "none", strokeLinecap: "round" })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "g",
      {
        className: `generic-part ${activePart === "pollen-basket" ? "active" : ""} ${identified.has("pollen-basket") ? "done" : ""}`,
        onClick: () => onSelect("pollen-basket"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "272", cy: "372", r: "26", fill: "#ffcf4a", stroke: "#e8a800", strokeWidth: "4" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "408", cy: "372", r: "26", fill: "#ffcf4a", stroke: "#e8a800", strokeWidth: "4" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "272", cy: "372", r: "13", fill: "#ffe765" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "408", cy: "372", r: "13", fill: "#ffe765" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M340 388 l0 18", stroke: "#3a2a10", strokeWidth: "5", strokeLinecap: "round" })
  ] }) });
};
var HoneyBeePartPreview = ({ part }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "generic-part-preview", "aria-hidden": "true", children: [
  part === "antennae" ? "^^" : null,
  part === "wings" ? "\u{1FABD}" : null,
  part === "body" ? "\u{1F41D}" : null,
  part === "proboscis" ? "\u2186" : null,
  part === "pollen-basket" ? "\u25CF" : null
] });

// src/lessons/honey-bee/HoneyBeeLesson.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var HoneyBeeLesson = ({
  onHome,
  onComplete
}) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
  GenericLesson,
  {
    content: content_default,
    onHome: onHome ?? (() => {
    }),
    onComplete: onComplete ?? (() => {
    }),
    stage: (props) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(HoneyBeeStage, { ...props, mode: props.mode }),
    partPreview: (part) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(HoneyBeePartPreview, { part })
  }
);
var HoneyBeeLesson_default = HoneyBeeLesson;
export {
  HoneyBeeLesson,
  HoneyBeeLesson_default as default
};
