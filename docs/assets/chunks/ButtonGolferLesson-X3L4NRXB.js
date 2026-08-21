import {
  content_default
} from "./chunk-HWIG5UP4.js";
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

// src/lessons/button-golfer/GolfStage.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
var GolfStage = ({ activePart, identified, onSelect, mode, activityDone, completeActivity }) => {
  const [swinging, setSwinging] = (0, import_react.useState)(false);
  const [ballX, setBallX] = (0, import_react.useState)(0);
  if (mode === "warmup") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarmupScreen, { videoUrl: content_default.warmupVideoUrl }) });
  }
  if (mode === "story") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoryVideoCard, { title: content_default.title, youtubeEmbedUrl: content_default.storyVideoUrl }) });
  }
  const swing = () => {
    if (activityDone) {
      return;
    }
    setSwinging(true);
    setBallX(1);
    window.setTimeout(() => {
      setSwinging(false);
      setBallX(2);
      completeActivity();
    }, 900);
  };
  if (mode === "activity") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "golf-activity", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "golf-green" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `golf-golfer ${swinging ? "swinging" : ""}`, children: "\u26F3" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `golf-ball ${ballX === 1 ? "hit" : ""} ${ballX === 2 ? "rolled" : ""}`, children: "\u26AA" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "golf-hole", children: "\u26F3" }),
      activityDone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bee-activity-done", children: "Nice shot! The ball rolled to the hole." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "primary-action", onClick: swing, children: swinging ? "Swinging..." : "Press the button" })
    ] }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 680 460", className: "generic-art", "aria-label": "Button golfer", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "340", cy: "230", r: "200", fill: "rgba(255,255,255,0.1)" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "rect",
      {
        className: `generic-part ${activePart === "body" ? "active" : ""} ${identified.has("body") ? "done" : ""}`,
        x: "292",
        y: "220",
        width: "96",
        height: "120",
        rx: "20",
        fill: "#e84a5f",
        stroke: "#b22a3d",
        strokeWidth: "4",
        onClick: () => onSelect("body")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "circle",
      {
        className: `generic-part ${activePart === "head" ? "active" : ""} ${identified.has("head") ? "done" : ""}`,
        cx: "340",
        cy: "170",
        r: "44",
        fill: "#ffd0a1",
        stroke: "#d9a06a",
        strokeWidth: "4",
        onClick: () => onSelect("head")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "324", cy: "162", r: "7", fill: "#1c1c1c" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "356", cy: "162", r: "7", fill: "#1c1c1c" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M330 182 q10 8 20 0", stroke: "#8a4a20", strokeWidth: "4", fill: "none" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "g",
      {
        className: `generic-part ${activePart === "hat" ? "active" : ""} ${identified.has("hat") ? "done" : ""}`,
        onClick: () => onSelect("hat"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", { cx: "340", cy: "128", rx: "60", ry: "14", fill: "#1c8a5a", stroke: "#10633e", strokeWidth: "3" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M300 128 q0 -34 40 -36 q40 2 40 36", fill: "#1c8a5a", stroke: "#10633e", strokeWidth: "3" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "g",
      {
        className: `generic-part ${activePart === "arms" ? "active" : ""} ${identified.has("arms") ? "done" : ""}`,
        onClick: () => onSelect("arms"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "244", y: "240", width: "50", height: "22", rx: "11", fill: "#e84a5f", stroke: "#b22a3d", strokeWidth: "3" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "386", y: "240", width: "50", height: "22", rx: "11", fill: "#e84a5f", stroke: "#b22a3d", strokeWidth: "3" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "g",
      {
        className: `generic-part ${activePart === "club" ? "active" : ""} ${identified.has("club") ? "done" : ""}`,
        onClick: () => onSelect("club"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "412", y: "170", width: "10", height: "170", rx: "5", fill: "#8a5a20", transform: "rotate(18 417 255)" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "438", y: "312", width: "60", height: "16", rx: "8", fill: "#c0c8d0", transform: "rotate(18 468 320)" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "306", y: "330", width: "22", height: "60", rx: "8", fill: "#35506b" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "352", y: "330", width: "22", height: "60", rx: "8", fill: "#35506b" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "340", cy: "270", r: "16", fill: "#ffcf4a", stroke: "#e8a800", strokeWidth: "4" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: "340", y: "276", textAnchor: "middle", fontSize: "16", fontWeight: "900", fill: "#114a9a", children: "GO" })
  ] }) });
};
var GolfPartPreview = ({ part }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "generic-part-preview", "aria-hidden": "true", children: [
  part === "hat" ? "\u{1F9E2}" : null,
  part === "head" ? "\u{1F600}" : null,
  part === "body" ? "\u{1F455}" : null,
  part === "arms" ? "\u{1F4AA}" : null,
  part === "club" ? "\u{1F3CC}\uFE0F" : null
] });

// src/lessons/button-golfer/ButtonGolferLesson.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var ButtonGolferLesson = ({
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
    stage: (props) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(GolfStage, { ...props, mode: props.mode }),
    partPreview: (part) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(GolfPartPreview, { part })
  }
);
var ButtonGolferLesson_default = ButtonGolferLesson;
export {
  ButtonGolferLesson,
  ButtonGolferLesson_default as default
};
