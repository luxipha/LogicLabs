import {
  content_default
} from "./chunk-AKAAXFBT.js";
import {
  AnimationMixer,
  Box3,
  Canvas,
  Color,
  GLTFLoader,
  Group,
  LoopRepeat,
  ModelOrbitControls,
  Vector3,
  useFrame,
  useLoader
} from "./chunk-ZCM7JGQ4.js";
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

// src/lessons/button-golfer/GolfStage.tsx
var import_react2 = __toESM(require_react());

// src/lessons/button-golfer/GolfModel.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
var PART_HIGHLIGHT = {
  hat: "#ffb347",
  head: "#ffe155",
  body: "#8fd47f",
  arms: "#7fd4ff",
  club: "#c9d4dc"
};
var PART_TO_MESH = {
  hat: "head",
  head: "head",
  body: "body",
  arms: "arms",
  club: "club"
};
var getSkinnedBounds = (mesh) => {
  const geometry = mesh.geometry;
  const position = geometry.getAttribute("position");
  mesh.updateMatrixWorld(true);
  mesh.skeleton?.update();
  const box = new Box3();
  const vertex = new Vector3();
  for (let index = 0; index < position.count; index += 1) {
    vertex.fromBufferAttribute(position, index);
    mesh.applyBoneTransform?.(index, vertex);
    box.expandByPoint(vertex);
  }
  return box;
};
var useGolferScene = (gltf) => {
  return (0, import_react.useMemo)(() => {
    const live = gltf.scene;
    live.updateMatrixWorld(true);
    const visibleBox = new Box3();
    live.traverse((child) => {
      const mesh = child;
      if (!mesh.isMesh) {
        return;
      }
      if (mesh.isSkinnedMesh) {
        visibleBox.union(getSkinnedBounds(mesh));
        return;
      }
      visibleBox.union(new Box3().setFromObject(mesh));
    });
    const box = visibleBox.isEmpty() ? new Box3() : visibleBox;
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);
    const scale = 5 / Math.max(size.x, size.y, size.z);
    const sceneGroup = new Group();
    sceneGroup.scale.setScalar(scale);
    sceneGroup.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    sceneGroup.add(live);
    const charMeshes = [];
    const clubMeshes = [];
    sceneGroup.traverse((child) => {
      const mesh = child;
      if (!mesh.isMesh) {
        return;
      }
      if (mesh.isSkinnedMesh) {
        charMeshes.push(mesh);
        return;
      }
      const matName = (Array.isArray(mesh.material) ? mesh.material[0]?.name : mesh.material?.name) ?? "";
      if (matName === "1A1A1A" || matName === "78909C" || matName === "455A64") {
        clubMeshes.push(mesh);
      }
    });
    return { sceneGroup, charMeshes, clubMeshes, center, scale };
  }, [gltf.scene]);
};
var useSwingAnimation = (gltf, charGroup) => {
  const mixerRef = (0, import_react.useRef)(null);
  const actionRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    if (!charGroup) {
      return;
    }
    const mixer = new AnimationMixer(charGroup);
    mixerRef.current = mixer;
    const clip = gltf.animations[0];
    if (clip) {
      const action = mixer.clipAction(clip);
      action.reset();
      action.setLoop(LoopRepeat, Infinity);
      action.play();
      actionRef.current = action;
    }
    return () => {
      actionRef.current = null;
      mixer.stopAllAction();
      mixerRef.current = null;
    };
  }, [charGroup, gltf.animations]);
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });
};
var makeHighlightedMaterial = (base, part, active) => {
  if (!base) {
    return null;
  }
  const source = Array.isArray(base) ? base[0] : base;
  const material = source.clone();
  if ("emissive" in material) {
    material.emissive = new Color(active ? PART_HIGHLIGHT[part] : "#000000");
    material.emissiveIntensity = active ? 0.5 : 0;
  }
  return material;
};
var GolfModel = ({ highlightedPart, onPartSelect }) => {
  const gltf = useLoader(GLTFLoader, "models/golfer.glb");
  const { sceneGroup, charMeshes, clubMeshes } = useGolferScene(gltf);
  useSwingAnimation(gltf, sceneGroup);
  (0, import_react.useEffect)(() => {
    const isActive = highlightedPart !== null && PART_TO_MESH[highlightedPart] !== "club";
    for (const mesh of charMeshes) {
      const material = makeHighlightedMaterial(mesh.material, "body", isActive);
      if (material) {
        mesh.material = material;
      }
    }
  }, [charMeshes, highlightedPart]);
  (0, import_react.useEffect)(() => {
    const isActive = highlightedPart === "club";
    for (const mesh of clubMeshes) {
      const material = makeHighlightedMaterial(mesh.material, "club", isActive);
      if (material) {
        mesh.material = material;
      }
    }
  }, [clubMeshes, highlightedPart]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", { object: sceneGroup }) });
};
var GolfCanvas = ({ highlightedPart, onPartSelect }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
  Canvas,
  {
    camera: { position: [1.2, 0.7, 4.2], fov: 32, near: 0.1, far: 100 },
    dpr: [1, 1.5],
    gl: { antialias: false },
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: 0.75 }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { intensity: 0.8, groundColor: "#5b7a4f" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", { position: [5, 7, 5], intensity: 1.4 }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", { position: [-4, 3, -3], intensity: 0.35, color: "#a4c2ff" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        ModelOrbitControls,
        {
          zoomEnabled: true,
          rotateEnabled: true,
          target: [0, 0.25, 0],
          minDistance: 3,
          maxDistance: 12
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GolfModel, { highlightedPart, onPartSelect })
    ]
  }
);

// src/lessons/button-golfer/GolfStage.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var hasWebGLSupport = () => {
  if (typeof document === "undefined") {
    return false;
  }
  const canvas = document.createElement("canvas");
  return Boolean(
    canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
  );
};
var GolfErrorBoundary = class extends import_react2.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
};
var GolfStage = ({ activePart, identified, onSelect, mode, warmupVideoUrl, activityDone, completeActivity }) => {
  const [webGLAvailable] = (0, import_react2.useState)(hasWebGLSupport);
  if (mode === "warmup") {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(WarmupScreen, { videoUrl: warmupVideoUrl }) });
  }
  if (mode === "story") {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(StoryVideoCard, { title: content_default.title, youtubeEmbedUrl: content_default.storyVideoUrl }) });
  }
  if (mode === "explore") {
    if (!webGLAvailable) {
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "golf-no-webgl", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: "The golfer needs WebGL." }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Enable graphics acceleration in Chrome, or use Firefox." })
      ] }) });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "generic-stage golf-model-stage", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      GolfErrorBoundary,
      {
        fallback: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "golf-no-webgl", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: "The golfer model failed to load." }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Check the browser console for details." })
        ] }),
        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react2.Suspense, { fallback: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "golf-loading", children: "Loading golfer\u2026" }), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          GolfCanvas,
          {
            highlightedPart: activePart,
            onPartSelect: onSelect
          }
        ) })
      }
    ) });
  }
  if (mode === "activity") {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "golf-game-embed", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "iframe",
        {
          title: "Golf Bit",
          src: "https://cloud.onlinegames.io/games/2026/construct/328/golf-bit/index.html",
          allow: "fullscreen; autoplay; gamepad",
          allowFullScreen: true
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "golf-game-bar", children: activityDone ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "bee-activity-done", children: "Nice round! You played the course." }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { className: "primary-action", onClick: completeActivity, children: "Done playing" }) })
    ] }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 680 460", className: "generic-art", "aria-label": "Button golfer", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "340", cy: "230", r: "200", fill: "rgba(255,255,255,0.1)" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "324", cy: "162", r: "7", fill: "#1c1c1c" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "356", cy: "162", r: "7", fill: "#1c1c1c" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M330 182 q10 8 20 0", stroke: "#8a4a20", strokeWidth: "4", fill: "none" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "g",
      {
        className: `generic-part ${activePart === "hat" ? "active" : ""} ${identified.has("hat") ? "done" : ""}`,
        onClick: () => onSelect("hat"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: "340", cy: "128", rx: "60", ry: "14", fill: "#1c8a5a", stroke: "#10633e", strokeWidth: "3" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M300 128 q0 -34 40 -36 q40 2 40 36", fill: "#1c8a5a", stroke: "#10633e", strokeWidth: "3" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "g",
      {
        className: `generic-part ${activePart === "arms" ? "active" : ""} ${identified.has("arms") ? "done" : ""}`,
        onClick: () => onSelect("arms"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: "244", y: "240", width: "50", height: "22", rx: "11", fill: "#e84a5f", stroke: "#b22a3d", strokeWidth: "3" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: "386", y: "240", width: "50", height: "22", rx: "11", fill: "#e84a5f", stroke: "#b22a3d", strokeWidth: "3" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "g",
      {
        className: `generic-part ${activePart === "club" ? "active" : ""} ${identified.has("club") ? "done" : ""}`,
        onClick: () => onSelect("club"),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: "412", y: "170", width: "10", height: "170", rx: "5", fill: "#8a5a20", transform: "rotate(18 417 255)" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: "438", y: "312", width: "60", height: "16", rx: "8", fill: "#c0c8d0", transform: "rotate(18 468 320)" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: "306", y: "330", width: "22", height: "60", rx: "8", fill: "#35506b" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: "352", y: "330", width: "22", height: "60", rx: "8", fill: "#35506b" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "340", cy: "270", r: "16", fill: "#ffcf4a", stroke: "#e8a800", strokeWidth: "4" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", { x: "340", y: "276", textAnchor: "middle", fontSize: "16", fontWeight: "900", fill: "#114a9a", children: "GO" })
  ] }) });
};
var GolfPartPreview = ({ part }) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "generic-part-preview", "aria-hidden": "true", children: [
  part === "hat" ? "\u{1F9E2}" : null,
  part === "head" ? "\u{1F600}" : null,
  part === "body" ? "\u{1F455}" : null,
  part === "arms" ? "\u{1F4AA}" : null,
  part === "club" ? "\u{1F3CC}\uFE0F" : null
] });

// src/lessons/button-golfer/ButtonGolferLesson.tsx
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
var ButtonGolferLesson = ({ onHome, onComplete, warmupVideoUrl, onDraw, onBoard }) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
    stage: (props) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(GolfStage, { ...props, mode: props.mode }),
    partPreview: (part) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(GolfPartPreview, { part })
  }
);
var ButtonGolferLesson_default = ButtonGolferLesson;
export {
  ButtonGolferLesson,
  ButtonGolferLesson_default as default
};
