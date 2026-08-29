import {
  content_default
} from "./chunk-CEHWN44Z.js";
import {
  GenericLesson
} from "./chunk-KUM7UDSH.js";
import {
  Canvas,
  Color,
  GLTFLoader,
  Group,
  ModelOrbitControls,
  SketchfabEmbed,
  StoryVideoCard,
  WarmupScreen,
  useLoader
} from "./chunk-YSRYPTBG.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-QP3GZB4W.js";

// src/lessons/elevator/ElevatorStage.tsx
var import_react2 = __toESM(require_react());

// src/lessons/elevator/ElevatorModel.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
var PART_HIGHLIGHT = {
  cab: "#ffb347",
  doors: "#7fd4ff",
  cable: "#ffe155",
  pulley: "#b8c5d6",
  motor: "#f0a52a",
  counterweight: "#aebac8"
};
var partFromObject = (object) => {
  let current = object;
  while (current) {
    const id = current.name.toLowerCase();
    if (id in PART_HIGHLIGHT) return id;
    current = current.parent;
  }
  return null;
};
var useElevatorScene = (gltf) => (0, import_react.useMemo)(() => {
  const model = gltf.scene.clone(true);
  model.traverse((child) => {
    const mesh = child;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.baseMaterial = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  });
  const group = new Group();
  group.scale.setScalar(0.78);
  group.position.set(0, -0.2, 0);
  group.add(model);
  return group;
}, [gltf.scene]);
var ElevatorModel = ({ highlightedPart, onPartSelect }) => {
  const gltf = useLoader(GLTFLoader, "models/elevator.glb");
  const group = useElevatorScene(gltf);
  (0, import_react.useEffect)(() => {
    group.traverse((child) => {
      const mesh = child;
      if (!mesh.isMesh) return;
      const base = mesh.userData.baseMaterial;
      if (!base) return;
      const material = base.clone();
      const part = partFromObject(mesh);
      material.emissive = new Color(part && part === highlightedPart ? PART_HIGHLIGHT[part] : "#000000");
      material.emissiveIntensity = part === highlightedPart ? 0.55 : 0;
      mesh.material = material;
    });
  }, [group, highlightedPart]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "primitive",
    {
      object: group,
      onClick: (event) => {
        event.stopPropagation();
        const part = partFromObject(event.object);
        if (part) onPartSelect(part);
      }
    }
  );
};
var ElevatorCanvas = ({ highlightedPart, mode, onPartSelect }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, { camera: { position: [5.2, 3.2, 8.8], fov: 32, near: 0.1, far: 100 }, dpr: [1, 1.5], shadows: true, gl: { alpha: true, antialias: true }, children: [
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: 0.8 }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { intensity: 0.8, groundColor: "#55718b" }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", { position: [5, 8, 6], intensity: 1.4, castShadow: true }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", { position: [-4, 3, -4], intensity: 0.4, color: "#a5ccff" }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ModelOrbitControls,
    {
      zoomEnabled: true,
      rotateEnabled: mode === "explore",
      target: [0, 0.55, 0],
      minDistance: 4.5,
      maxDistance: 14
    }
  ),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ElevatorModel, { highlightedPart, onPartSelect })
] });

// src/lessons/elevator/ElevatorStage.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var hasWebGLSupport = () => {
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
};
var ElevatorErrorBoundary = class extends import_react2.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
};
var ElevatorStage = ({ activePart, lastSelectedPart, identified, onSelect, mode, warmupVideoUrl, activityDone, completeActivity }) => {
  const [webGLAvailable] = (0, import_react2.useState)(hasWebGLSupport);
  if (mode === "warmup") {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(WarmupScreen, { videoUrl: warmupVideoUrl }) });
  }
  if (mode === "story") {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(StoryVideoCard, { title: content_default.title, youtubeEmbedUrl: content_default.storyVideoUrl }) });
  }
  if (mode === "activity") {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "elevator-stage-placeholder", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "elevator-stage-icon", children: "\u{1F6D7}" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Press the play button to start the game." })
    ] }) });
  }
  if (mode === "explore") {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      SketchfabEmbed,
      {
        embedUrl: content_default.sketchfabEmbedUrl,
        modelName: "Freight Elevator",
        modelPageUrl: "https://sketchfab.com/3d-models/freight-elevator-61ded500c8fa498d8ae7eeb2ba546df9"
      }
    );
  }
  if (!webGLAvailable) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "elevator-no-webgl", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: "The elevator needs WebGL." }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Enable graphics acceleration to explore the model." })
    ] }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "generic-stage elevator-model-stage", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ElevatorErrorBoundary, { fallback: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "elevator-no-webgl", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: "The elevator model failed to load." }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Try refreshing the lesson." })
  ] }), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react2.Suspense, { fallback: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "elevator-loading", children: "Loading elevator\u2026" }), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    ElevatorCanvas,
    {
      highlightedPart: mode === "identify" ? lastSelectedPart : activePart,
      mode,
      onPartSelect: onSelect
    }
  ) }) }) });
};
var ElevatorPartPreview = ({ part }) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "generic-part-preview", "aria-hidden": "true", children: [
  part === "cab" ? "\u{1F6D7}" : null,
  part === "doors" ? "\u{1F6AA}" : null,
  part === "cable" ? "\u3030\uFE0F" : null,
  part === "pulley" ? "\u2699\uFE0F" : null,
  part === "motor" ? "MOTOR" : null,
  part === "counterweight" ? "WEIGHT" : null
] });

// src/lessons/elevator/ElevatorLesson.tsx
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
var ElevatorLesson = ({ onHome, onComplete, warmupVideoUrl, onDraw, onBoard }) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
    stage: (props) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ElevatorStage, { ...props, mode: props.mode }),
    partPreview: (part) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ElevatorPartPreview, { part })
  }
);
var ElevatorLesson_default = ElevatorLesson;
export {
  ElevatorLesson,
  ElevatorLesson_default as default
};
