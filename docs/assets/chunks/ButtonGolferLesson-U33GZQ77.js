import {
  content_default
} from "./chunk-XB7SOL3B.js";
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
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "generic-stage golf-identify-stage", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "sketchfab-embed-wrapper", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "iframe",
      {
        title: "Golf club Iron",
        frameBorder: "0",
        allowFullScreen: true,
        allow: "autoplay; fullscreen; xr-spatial-tracking; web-share",
        src: "https://sketchfab.com/models/dc748ddd268c4acab25c54c4048b3912/embed"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "a",
        {
          href: "https://sketchfab.com/3d-models/golf-club-iron-dc748ddd268c4acab25c54c4048b3912",
          target: "_blank",
          rel: "nofollow",
          children: "Golf club Iron"
        }
      ),
      " ",
      "by",
      " ",
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("a", { href: "https://sketchfab.com/real_slimshady", target: "_blank", rel: "nofollow", children: "\u211C\u{1D522}\u{1D51E}\u{1D529} \u{1D516}\u{1D529}\u{1D526}\u{1D52A} \u{1D516}\u{1D525}\u{1D51E}\u{1D521}\u{1D536}" }),
      " ",
      "on",
      " ",
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("a", { href: "https://sketchfab.com", target: "_blank", rel: "nofollow", children: "Sketchfab" })
    ] })
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
