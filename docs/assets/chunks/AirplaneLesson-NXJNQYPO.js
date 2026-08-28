import {
  content_default
} from "./chunk-CU6JIX7X.js";
import {
  Canvas,
  Color,
  GLTFLoader,
  ModelOrbitControls,
  Vector3,
  useLoader
} from "./chunk-ZCM7JGQ4.js";
import {
  StoryVideoCard,
  WarmupScreen
} from "./chunk-I2HZKRWI.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-QP3GZB4W.js";

// src/lessons/airplane/AirplaneLesson.tsx
var import_react2 = __toESM(require_react());

// src/lessons/airplane/AirplaneLessonModel.tsx
var import_react = __toESM(require_react());

// src/lessons/airplane/content.ts
var LESSON_PARTS = [
  "body",
  "cockpit",
  "engine",
  "leftWing",
  "rightWing",
  "tail",
  "tires"
];
var PART_LABELS = {
  body: "Body",
  cockpit: "Cockpit",
  engine: "Jet Engine",
  leftWing: "Left Wing",
  rightWing: "Right Wing",
  tail: "Tail",
  tires: "Tires"
};
var PART_HELP = {
  body: "The body holds the airplane together.",
  cockpit: "The cockpit is where the pilot sits and controls the airplane.",
  engine: "The jet engine gives the airplane power to move forward.",
  leftWing: "The left wing helps lift the airplane into the sky.",
  rightWing: "The right wing balances the airplane in flight.",
  tail: "The tail helps keep the airplane stable.",
  tires: "The tires help the airplane roll during takeoff and landing."
};
var PART_FACTS = {
  body: "The body is called the fuselage. It carries people, cargo, and connects all the airplane parts.",
  cockpit: "The cockpit has the pilot seats, windows, controls, and screens used to guide the airplane.",
  engine: "A jet engine pulls in air, speeds it up, and pushes it backward to make thrust.",
  leftWing: "The left wing works with the right wing to make lift and keep the airplane balanced.",
  rightWing: "The right wing matches the left wing so the airplane can lift evenly.",
  tail: "The tail has stabilizers that help the airplane point straight and stay steady.",
  tires: "The tires and landing gear carry the airplane on the runway before takeoff and after landing."
};
var SNAP_RADIUS = {
  body: 0,
  cockpit: 5.2,
  engine: 6,
  leftWing: 6.5,
  rightWing: 6.5,
  tail: 6,
  tires: 7
};
var getExplodedOffset = (part) => {
  switch (part) {
    case "cockpit":
      return [0, 9, 0];
    case "engine":
      return [0, -10, -4];
    case "leftWing":
      return [-14, 1.5, 0];
    case "rightWing":
      return [14, 1.5, 0];
    case "tail":
      return [0, 8, 14];
    case "tires":
      return [0, -12, 10];
    case "body":
    default:
      return [0, 0, 0];
  }
};

// src/lessons/airplane/AirplaneLessonModel.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime());
var tintImportedMeshes = (root, active) => {
  root.traverse((child) => {
    const mesh = child;
    if (!mesh.isMesh) {
      return;
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((material) => {
        const cloned = material.clone();
        if ("emissive" in cloned) {
          cloned.emissive = new Color(active ? "#76d5ff" : "#000000");
          cloned.emissiveIntensity = active ? 0.45 : 0;
        }
        return cloned;
      });
      return;
    }
    if (mesh.material) {
      mesh.material = mesh.material.clone();
      const typed = mesh.material;
      if ("metalness" in typed) {
        typed.metalness = 0.35;
      }
      if ("roughness" in typed) {
        typed.roughness = 0.55;
      }
      if ("emissive" in typed) {
        typed.emissive = new Color(active ? "#76d5ff" : "#000000");
        typed.emissiveIntensity = active ? 0.45 : 0;
      }
    }
  });
};
var cloneNamedMesh = (scene, name, active) => {
  const found = scene.getObjectByName(name);
  if (!found) {
    throw new Error(`Could not find airplane mesh: ${name}`);
  }
  const cloned = found.clone(true);
  tintImportedMeshes(cloned, active);
  return cloned;
};
var PartGroup = ({ id, position, active, onClick, onPointerDown, onPointerMove, onPointerUp, children }) => {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "group",
    {
      position,
      scale: active ? [1.05, 1.05, 1.05] : [1, 1, 1],
      onClick: onClick ? () => onClick(id) : void 0,
      onPointerDown: onPointerDown ? (event) => onPointerDown(id, event) : void 0,
      onPointerMove: onPointerMove ? (event) => onPointerMove(id, event) : void 0,
      onPointerUp: onPointerUp ? (event) => onPointerUp(id, event) : void 0,
      children
    }
  );
};
var AirplaneLessonModel = ({
  modelUrl,
  activePart = null,
  partPositions,
  assembledParts,
  onPartSelect,
  onPartPointerDown,
  onPartPointerMove,
  onPartPointerUp,
  modelGroupRef
}) => {
  const gltf = useLoader(GLTFLoader, modelUrl);
  const parts = (0, import_react.useMemo)(() => {
    return {
      body: cloneNamedMesh(gltf.scene, "body", activePart === "body"),
      leftWing: cloneNamedMesh(gltf.scene, "leftwing", activePart === "leftWing"),
      rightWing: cloneNamedMesh(gltf.scene, "rightwing", activePart === "rightWing"),
      leftTail: cloneNamedMesh(gltf.scene, "leftback", activePart === "tail"),
      rightTail: cloneNamedMesh(gltf.scene, "rightback", activePart === "tail"),
      topTail: cloneNamedMesh(gltf.scene, "top", activePart === "tail")
    };
  }, [activePart, gltf.scene]);
  const getPosition = (part) => {
    if (partPositions?.[part]) {
      return partPositions[part];
    }
    const [x, y, z] = getExplodedOffset(part);
    const openness = assembledParts ? assembledParts[part] ? 0 : 1 : 1;
    return [x * openness, y * openness, z * openness];
  };
  const isActive = (part) => activePart === part;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { rotation: [-0.03, 0, 0], children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "group",
    {
      ref: modelGroupRef,
      position: [0, -0.24, -0.56],
      rotation: [0, -Math.PI / 2, 0],
      scale: [0.045, 0.045, 0.045],
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          PartGroup,
          {
            id: "body",
            position: getPosition("body"),
            active: isActive("body"),
            onClick: onPartSelect,
            onPointerDown: onPartPointerDown,
            onPointerMove: onPartPointerMove,
            onPointerUp: onPartPointerUp,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", { object: parts.body }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { position: [0, -2.7, -23.15], children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [-2.25, 0, 0.16], rotation: [0.08, -0.22, 0.08], scale: [1.55, 0.72, 0.14], children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [2.2, 1.7, 1] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#bfc3c4", metalness: 0.18, roughness: 0.68 })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [0, 0.08, -0.08], rotation: [0.08, 0, 0], scale: [1.85, 0.78, 0.14], children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [2.2, 1.7, 1] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#c7cacb", metalness: 0.18, roughness: 0.68 })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [2.25, 0, 0.16], rotation: [0.08, 0.22, -0.08], scale: [1.55, 0.72, 0.14], children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [2.2, 1.7, 1] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#bfc3c4", metalness: 0.18, roughness: 0.68 })
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          PartGroup,
          {
            id: "leftWing",
            position: getPosition("leftWing"),
            active: isActive("leftWing"),
            onClick: onPartSelect,
            onPointerDown: onPartPointerDown,
            onPointerMove: onPartPointerMove,
            onPointerUp: onPartPointerUp,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", { object: parts.leftWing })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          PartGroup,
          {
            id: "rightWing",
            position: getPosition("rightWing"),
            active: isActive("rightWing"),
            onClick: onPartSelect,
            onPointerDown: onPartPointerDown,
            onPointerMove: onPartPointerMove,
            onPointerUp: onPartPointerUp,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", { object: parts.rightWing })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          PartGroup,
          {
            id: "tail",
            position: getPosition("tail"),
            active: isActive("tail"),
            onClick: onPartSelect,
            onPointerDown: onPartPointerDown,
            onPointerMove: onPartPointerMove,
            onPointerUp: onPartPointerUp,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", { object: parts.leftTail }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", { object: parts.rightTail }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", { object: parts.topTail })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          PartGroup,
          {
            id: "cockpit",
            position: getPosition("cockpit"),
            active: isActive("cockpit"),
            onClick: onPartSelect,
            onPointerDown: onPartPointerDown,
            onPointerMove: onPartPointerMove,
            onPointerUp: onPartPointerUp,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { position: [0, -2.68, -23.05], children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [-2.25, 0, 0.22], rotation: [0.08, -0.22, 0.08], scale: [1.28, 0.48, 0.08], children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [2.2, 1.7, 1] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "meshStandardMaterial",
                  {
                    color: isActive("cockpit") ? "#8be7ff" : "#1d3145",
                    metalness: 0.25,
                    roughness: 0.18,
                    emissive: isActive("cockpit") ? "#76d5ff" : "#020b14",
                    emissiveIntensity: isActive("cockpit") ? 0.8 : 0.12
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [0, 0.08, -0.02], rotation: [0.08, 0, 0], scale: [1.48, 0.5, 0.08], children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [2.2, 1.7, 1] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "meshStandardMaterial",
                  {
                    color: isActive("cockpit") ? "#8be7ff" : "#1d3145",
                    metalness: 0.25,
                    roughness: 0.18,
                    emissive: isActive("cockpit") ? "#76d5ff" : "#020b14",
                    emissiveIntensity: isActive("cockpit") ? 0.8 : 0.12
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [2.25, 0, 0.22], rotation: [0.08, 0.22, -0.08], scale: [1.28, 0.48, 0.08], children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [2.2, 1.7, 1] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "meshStandardMaterial",
                  {
                    color: isActive("cockpit") ? "#8be7ff" : "#1d3145",
                    metalness: 0.25,
                    roughness: 0.18,
                    emissive: isActive("cockpit") ? "#76d5ff" : "#020b14",
                    emissiveIntensity: isActive("cockpit") ? 0.8 : 0.12
                  }
                )
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          PartGroup,
          {
            id: "engine",
            position: getPosition("engine"),
            active: isActive("engine"),
            onClick: onPartSelect,
            onPointerDown: onPartPointerDown,
            onPointerMove: onPartPointerMove,
            onPointerUp: onPartPointerUp,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [-14, -3.2, 16], rotation: [Math.PI / 2, 0, 0], children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [2.4, 2.8, 8, 20] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "meshStandardMaterial",
                  {
                    color: isActive("engine") ? "#f4fbff" : "#dfe5eb",
                    metalness: 0.45,
                    roughness: 0.38,
                    emissive: isActive("engine") ? "#76d5ff" : "#000000",
                    emissiveIntensity: isActive("engine") ? 0.35 : 0
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [14, -3.2, 16], rotation: [Math.PI / 2, 0, 0], children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [2.4, 2.8, 8, 20] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "meshStandardMaterial",
                  {
                    color: isActive("engine") ? "#f4fbff" : "#dfe5eb",
                    metalness: 0.45,
                    roughness: 0.38,
                    emissive: isActive("engine") ? "#76d5ff" : "#000000",
                    emissiveIntensity: isActive("engine") ? 0.35 : 0
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [-14, -3.2, 20.4], rotation: [Math.PI / 2, 0, 0], children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [1.6, 2.2, 1.1, 20] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "meshStandardMaterial",
                  {
                    color: "#2f3944",
                    metalness: 0.55,
                    roughness: 0.45,
                    emissive: isActive("engine") ? "#76d5ff" : "#000000",
                    emissiveIntensity: isActive("engine") ? 0.2 : 0
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [14, -3.2, 20.4], rotation: [Math.PI / 2, 0, 0], children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [1.6, 2.2, 1.1, 20] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "meshStandardMaterial",
                  {
                    color: "#2f3944",
                    metalness: 0.55,
                    roughness: 0.45,
                    emissive: isActive("engine") ? "#76d5ff" : "#000000",
                    emissiveIntensity: isActive("engine") ? 0.2 : 0
                  }
                )
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          PartGroup,
          {
            id: "tires",
            position: getPosition("tires"),
            active: isActive("tires"),
            onClick: onPartSelect,
            onPointerDown: onPartPointerDown,
            onPointerMove: onPartPointerMove,
            onPointerUp: onPartPointerUp,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [-10.5, -6.5, 9], rotation: [0, 0, Math.PI / 2], children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [2.25, 0.75, 12, 24] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "meshStandardMaterial",
                  {
                    color: "#24262b",
                    metalness: 0.18,
                    roughness: 0.88,
                    emissive: isActive("tires") ? "#76d5ff" : "#000000",
                    emissiveIntensity: isActive("tires") ? 0.2 : 0
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [10.5, -6.5, 9], rotation: [0, 0, Math.PI / 2], children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [2.25, 0.75, 12, 24] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "meshStandardMaterial",
                  {
                    color: "#24262b",
                    metalness: 0.18,
                    roughness: 0.88,
                    emissive: isActive("tires") ? "#76d5ff" : "#000000",
                    emissiveIntensity: isActive("tires") ? 0.2 : 0
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [0, -5.8, -6], rotation: [0, 0, Math.PI / 2], children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [1.8, 0.6, 12, 24] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "meshStandardMaterial",
                  {
                    color: "#24262b",
                    metalness: 0.18,
                    roughness: 0.88,
                    emissive: isActive("tires") ? "#76d5ff" : "#000000",
                    emissiveIntensity: isActive("tires") ? 0.2 : 0
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [-10.5, -4.2, 9], rotation: [0, 0, 0.15], children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [0.22, 0.22, 4.6, 10] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "meshStandardMaterial",
                  {
                    color: "#aeb6c1",
                    metalness: 0.5,
                    roughness: 0.4,
                    emissive: isActive("tires") ? "#76d5ff" : "#000000",
                    emissiveIntensity: isActive("tires") ? 0.2 : 0
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [10.5, -4.2, 9], rotation: [0, 0, -0.15], children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [0.22, 0.22, 4.6, 10] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "meshStandardMaterial",
                  {
                    color: "#aeb6c1",
                    metalness: 0.5,
                    roughness: 0.4,
                    emissive: isActive("tires") ? "#76d5ff" : "#000000",
                    emissiveIntensity: isActive("tires") ? 0.2 : 0
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [0, -3.9, -6], rotation: [0.2, 0, 0], children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [0.18, 0.18, 3.5, 10] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "meshStandardMaterial",
                  {
                    color: "#aeb6c1",
                    metalness: 0.5,
                    roughness: 0.4,
                    emissive: isActive("tires") ? "#76d5ff" : "#000000",
                    emissiveIntensity: isActive("tires") ? 0.2 : 0
                  }
                )
              ] })
            ] })
          }
        )
      ]
    }
  ) });
};

// src/lessons/airplane/AirplaneLesson.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var STORY_VIDEO_URL = content_default.storyVideoUrl;
var STORY_QUESTIONS = content_default.storyQuestions;
var QUIZ_QUESTIONS = content_default.quiz;
var ASSEMBLY_SEQUENCE = LESSON_PARTS.filter((part) => part !== "body");
var IDENTIFY_SEQUENCE = LESSON_PARTS;
var hasWebGLSupport = () => {
  if (typeof document === "undefined") {
    return false;
  }
  const canvas = document.createElement("canvas");
  return Boolean(
    canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
  );
};
var WebGLErrorBoundary = class extends import_react2.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
};
var createInitialState = () => ({
  body: true,
  cockpit: false,
  engine: false,
  leftWing: false,
  rightWing: false,
  tail: false,
  tires: false
});
var createInitialPositions = () => ({
  body: [0, 0, 0],
  cockpit: getExplodedOffset("cockpit"),
  engine: getExplodedOffset("engine"),
  leftWing: getExplodedOffset("leftWing"),
  rightWing: getExplodedOffset("rightWing"),
  tail: getExplodedOffset("tail"),
  tires: getExplodedOffset("tires")
});
var PartPreview = ({ part }) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: `part-preview part-preview-${part}`, "aria-hidden": "true", children: [
  part === "body" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "body-shape" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "body-window body-window-one" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "body-window body-window-two" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "body-window body-window-three" })
  ] }) : null,
  part === "cockpit" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "cockpit-shape" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "cockpit-window cockpit-window-one" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "cockpit-window cockpit-window-two" })
  ] }) : null,
  part === "engine" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "engine-shell" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "engine-fan" })
  ] }) : null,
  part === "leftWing" || part === "rightWing" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "wing-shape" }) : null,
  part === "tail" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "tail-fin" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "tail-base" })
  ] }) : null,
  part === "tires" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "tire tire-left" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "tire tire-right" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "tire-axle" })
  ] }) : null
] });
var clamp = (value, min, max) => Math.min(max, Math.max(min, value));
var WebGLFallback = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "webgl-fallback", role: "status", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: "3D airplane needs WebGL." }),
  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "This browser has WebGL disabled. Enable graphics acceleration in Chrome, or use Firefox." })
] }) });
var AirplaneLesson = ({ onHome, onComplete, warmupVideoUrl, onDraw, onBoard }) => {
  const [webGLAvailable] = (0, import_react2.useState)(hasWebGLSupport);
  const [mode, setMode] = (0, import_react2.useState)("warmup");
  const [assembledParts, setAssembledParts] = (0, import_react2.useState)(
    createInitialState
  );
  const [partPositions, setPartPositions] = (0, import_react2.useState)(
    createInitialPositions
  );
  const [selectedPart, setSelectedPart] = (0, import_react2.useState)("cockpit");
  const [explorePart, setExplorePart] = (0, import_react2.useState)("engine");
  const [identifiedParts, setIdentifiedParts] = (0, import_react2.useState)(
    {}
  );
  const [identifyFeedback, setIdentifyFeedback] = (0, import_react2.useState)(null);
  const [lastCompletedPart, setLastCompletedPart] = (0, import_react2.useState)(null);
  const [quizIndex, setQuizIndex] = (0, import_react2.useState)(0);
  const [selectedAnswer, setSelectedAnswer] = (0, import_react2.useState)(null);
  const [quizFeedback, setQuizFeedback] = (0, import_react2.useState)(null);
  const [correctAnswers, setCorrectAnswers] = (0, import_react2.useState)(0);
  const [storyQuestionIndex, setStoryQuestionIndex] = (0, import_react2.useState)(0);
  const [storyCorrectAnswers, setStoryCorrectAnswers] = (0, import_react2.useState)(0);
  const [storyFeedback, setStoryFeedback] = (0, import_react2.useState)(null);
  const modelGroupRef = (0, import_react2.useRef)(null);
  const dragState = (0, import_react2.useRef)(null);
  const quizTimer = (0, import_react2.useRef)(null);
  const identifyTimer = (0, import_react2.useRef)(null);
  const fullyAssembledParts = (0, import_react2.useMemo)(() => {
    return LESSON_PARTS.reduce(
      (parts, part) => ({
        ...parts,
        [part]: true
      }),
      {}
    );
  }, []);
  const fullyAssembledPositions = (0, import_react2.useMemo)(() => {
    return LESSON_PARTS.reduce(
      (positions, part) => ({
        ...positions,
        [part]: [0, 0, 0]
      }),
      {}
    );
  }, []);
  const assembledCount = (0, import_react2.useMemo)(() => {
    return ASSEMBLY_SEQUENCE.filter((part) => assembledParts[part]).length;
  }, [assembledParts]);
  const isComplete = assembledCount === ASSEMBLY_SEQUENCE.length;
  const identifiedCount = (0, import_react2.useMemo)(() => {
    return IDENTIFY_SEQUENCE.filter((part) => identifiedParts[part]).length;
  }, [identifiedParts]);
  const nextPart = (0, import_react2.useMemo)(() => {
    return ASSEMBLY_SEQUENCE.find((part) => !assembledParts[part]) ?? null;
  }, [assembledParts]);
  const identifyTarget = (0, import_react2.useMemo)(() => {
    return IDENTIFY_SEQUENCE.find((part) => !identifiedParts[part]) ?? null;
  }, [identifiedParts]);
  const quizQuestion = QUIZ_QUESTIONS[quizIndex];
  const storyQuestion = STORY_QUESTIONS[storyQuestionIndex];
  const quizComplete = correctAnswers === QUIZ_QUESTIONS.length;
  const displayAssembledParts = mode === "assemble" ? assembledParts : fullyAssembledParts;
  const displayPartPositions = mode === "assemble" ? partPositions : fullyAssembledPositions;
  const selectPart = (part) => {
    setSelectedPart(part);
  };
  const selectIdentifyPart = (part) => {
    setSelectedPart(part);
    if (!identifyTarget) {
      return;
    }
    const correct = identifyTarget === part;
    const partIndex = IDENTIFY_SEQUENCE.indexOf(part);
    const nextIdentifyPart = IDENTIFY_SEQUENCE.slice(partIndex + 1).find((candidate) => !identifiedParts[candidate]) ?? null;
    setIdentifyFeedback(correct ? "correct" : "wrong");
    if (identifyTimer.current !== null) {
      window.clearTimeout(identifyTimer.current);
    }
    if (correct) {
      setIdentifiedParts((existing) => ({
        ...existing,
        [part]: true
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
  const selectExplorePart = (part) => {
    setSelectedPart(part);
    setExplorePart(part);
    setLastCompletedPart(null);
  };
  const selectMode = (nextMode) => {
    setMode(nextMode);
    dragState.current = null;
    if (nextMode === "identify") {
      setSelectedPart(identifyTarget ?? "body");
    }
    if (nextMode === "explore") {
      setSelectedPart(explorePart);
    }
  };
  const resetParts = () => {
    setMode("warmup");
    setAssembledParts(createInitialState());
    setPartPositions(createInitialPositions());
    setSelectedPart("cockpit");
    setExplorePart("engine");
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
  (0, import_react2.useEffect)(() => {
    return () => {
      if (quizTimer.current !== null) {
        window.clearTimeout(quizTimer.current);
      }
      if (identifyTimer.current !== null) {
        window.clearTimeout(identifyTimer.current);
      }
    };
  }, []);
  const answerQuestion = (answerIndex) => {
    if (quizFeedback !== null || quizComplete) {
      return;
    }
    const correct = answerIndex === quizQuestion.correctIndex;
    setSelectedAnswer(answerIndex);
    setQuizFeedback(correct ? "correct" : "wrong");
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
  const answerStoryQuestion = (answerIndex) => {
    if (storyFeedback !== null || storyCorrectAnswers === STORY_QUESTIONS.length) {
      return;
    }
    const correct = answerIndex === storyQuestion.correctIndex;
    setStoryFeedback(correct ? "correct" : "wrong");
    window.setTimeout(() => {
      if (correct) {
        setStoryCorrectAnswers((existing) => Math.min(STORY_QUESTIONS.length, existing + 1));
        setStoryQuestionIndex((existing) => Math.min(STORY_QUESTIONS.length - 1, existing + 1));
      }
      setStoryFeedback(null);
    }, correct ? 900 : 650);
  };
  const toModelLocal = (event) => {
    if (!modelGroupRef.current) {
      return new Vector3();
    }
    return modelGroupRef.current.worldToLocal(event.point.clone());
  };
  const onPartPointerDown = (part, event) => {
    if (part === "body" || assembledParts[part]) {
      return;
    }
    event.stopPropagation();
    setSelectedPart(part);
    const localPoint = toModelLocal(event);
    const [x, y, z] = partPositions[part];
    dragState.current = {
      part,
      offset: [x - localPoint.x, y - localPoint.y, z - localPoint.z]
    };
    event.target?.setPointerCapture?.(event.pointerId);
  };
  const onPartPointerMove = (part, event) => {
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
    const constrainedPosition = (() => {
      switch (part) {
        case "cockpit":
          return [clamp(nextX, -4, 4), clamp(nextY, 0, 12), clamp(current[2], -1, 1)];
        case "engine":
          return [clamp(nextX, -4, 4), clamp(nextY, -12, 2), clamp(nextZ, -8, 4)];
        case "leftWing":
          return [clamp(nextX, -18, -2), clamp(nextY, -2, 5), clamp(current[2], -2, 2)];
        case "rightWing":
          return [clamp(nextX, 2, 18), clamp(nextY, -2, 5), clamp(current[2], -2, 2)];
        case "tail":
          return [clamp(nextX, -5, 5), clamp(nextY, 0, 12), clamp(nextZ, 4, 18)];
        case "tires":
          return [clamp(nextX, -6, 6), clamp(nextY, -14, 0), clamp(nextZ, 2, 14)];
        case "body":
        default:
          return [0, 0, 0];
      }
    })();
    setPartPositions((existing) => ({
      ...existing,
      [part]: constrainedPosition
    }));
  };
  const onPartPointerUp = (part, event) => {
    if (dragState.current?.part !== part) {
      return;
    }
    event.stopPropagation();
    event.target?.releasePointerCapture?.(event.pointerId);
    const [x, y, z] = dragState.current ? partPositions[dragState.current.part] : partPositions[part];
    const distance = Math.sqrt(x * x + y * y + z * z);
    if (distance < SNAP_RADIUS[part]) {
      setAssembledParts((existing) => {
        const updated = {
          ...existing,
          [part]: true
        };
        const nextUnassembled = ASSEMBLY_SEQUENCE.find(
          (candidate) => candidate !== part && !updated[candidate]
        );
        setSelectedPart(nextUnassembled ?? "body");
        return updated;
      });
      setPartPositions((existing) => ({
        ...existing,
        [part]: [0, 0, 0]
      }));
      setLastCompletedPart(part);
    }
    dragState.current = null;
  };
  const modelPartSelect = mode === "identify" ? selectIdentifyPart : mode === "explore" ? selectExplorePart : selectPart;
  const progressDone = mode === "warmup" ? 0 : mode === "story" ? storyCorrectAnswers : mode === "assemble" ? assembledCount : mode === "identify" ? identifiedCount : IDENTIFY_SEQUENCE.length;
  const progressTotal = mode === "warmup" ? 1 : mode === "story" ? STORY_QUESTIONS.length : mode === "assemble" ? ASSEMBLY_SEQUENCE.length : IDENTIFY_SEQUENCE.length;
  const completionRatio = progressDone / progressTotal;
  const taskPart = mode === "story" ? "body" : mode === "identify" ? identifyTarget ?? selectedPart : mode === "explore" ? explorePart : nextPart ?? selectedPart;
  const taskTitle = mode === "warmup" ? "Get ready to fly." : mode === "story" ? "Watch the mission story." : mode === "identify" ? identifyTarget ? `Find the ${PART_LABELS[identifyTarget].toLowerCase()}.` : "You identified every part." : mode === "explore" ? `Explore the ${PART_LABELS[explorePart].toLowerCase()}.` : mode === "watch" ? "Watch the airplane fly." : `Find the ${PART_LABELS[taskPart].toLowerCase()}.`;
  const instruction = mode === "warmup" ? "Watch the warmup video, then press the Story tab to begin." : mode === "story" ? "Watch the video and answer the questions to understand why Lyson Island needs the airplane." : mode === "identify" ? identifyTarget ? `Tap the ${PART_LABELS[identifyTarget].toLowerCase()} on the airplane.` : "Switch to Assemble to build it, or Explore to learn more." : mode === "explore" ? PART_FACTS[explorePart] : mode === "watch" ? "This screen is ready for the YouTube lesson link. The airplane stays assembled for the video step." : nextPart === null ? "All the main parts are attached. Reset to build the airplane again." : `Drag the ${PART_LABELS[nextPart].toLowerCase()} onto the airplane body.`;
  const bannerMessage = storyFeedback === "correct" ? "Great job! Keep following the mission." : storyFeedback === "wrong" ? "Try again. Use the story clue." : identifyFeedback === "correct" ? `Great job! You found the ${PART_LABELS[selectedPart].toLowerCase()}.` : identifyFeedback === "wrong" ? `Try again. Find the ${identifyTarget ? PART_LABELS[identifyTarget].toLowerCase() : "part"} on the airplane.` : quizFeedback === "correct" ? "Great job! Keep building!" : quizFeedback === "wrong" ? "Try again. Look carefully." : lastCompletedPart ? "Great job! Keep building!" : mode === "story" ? "Lyson Island needs supplies. Learn the mission first." : mode === "explore" ? PART_FACTS[explorePart] : mode === "watch" ? "Video step ready. Add the YouTube link when the lesson video is final." : mode === "warmup" ? "Warm up and get ready to fly!" : PART_HELP[selectedPart];
  const bannerClass = identifyFeedback === "correct" || quizFeedback === "correct" || storyFeedback === "correct" ? "encouragement correct" : identifyFeedback === "wrong" || quizFeedback === "wrong" || storyFeedback === "wrong" ? "encouragement wrong" : "encouragement";
  const planeComplete = mode === "assemble" && isComplete;
  (0, import_react2.useEffect)(() => {
    if (planeComplete) {
      onComplete?.();
    }
  }, [planeComplete, onComplete]);
  const showAssemblyCallouts = mode === "assemble";
  const looseAssembly = mode === "assemble" && !isComplete;
  const planeScale = looseAssembly ? [1.38, 1.38, 1.38] : [1.9, 1.9, 1.9];
  const planePosition = looseAssembly ? [0, 1.16, 2.05] : [0, 0.86, 1.95];
  const planeRotation = looseAssembly ? [0.18, -0.52, 0] : [0.08, -0.34, 0];
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "app-shell plane-app", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "sky-layer" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("header", { className: "mission-header", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "screen-actions", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { className: "icon-btn icon-btn-draw", "aria-label": "Draw", onClick: onDraw, title: "Draw", children: "\u270F\uFE0F" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { className: "icon-btn icon-btn-board", "aria-label": "Board", onClick: onBoard, title: "Board", children: "\u{1F5BC}\uFE0F" })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("nav", { className: "mode-tabs", "aria-label": "Lesson modes", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        "button",
        {
          className: mode === "warmup" ? "mode-tab fly active" : "mode-tab fly",
          onClick: () => selectMode("warmup"),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "mode-icon", children: "WU" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Warmup" })
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        "button",
        {
          className: mode === "story" ? "mode-tab fly active" : "mode-tab fly",
          onClick: () => selectMode("story"),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "mode-icon", children: "PLAY" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Story" })
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        "button",
        {
          className: mode === "identify" ? "mode-tab identify active" : "mode-tab identify",
          onClick: () => selectMode("identify"),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "mode-icon", children: "Q" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Identify" })
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        "button",
        {
          className: mode === "assemble" ? "mode-tab assemble active" : "mode-tab assemble",
          onClick: () => selectMode("assemble"),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "mode-icon", children: "FIX" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Assemble" })
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        "button",
        {
          className: mode === "explore" ? "mode-tab explore active" : "mode-tab explore",
          onClick: () => selectMode("explore"),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "mode-icon", children: "BOOK" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Explore" })
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        "button",
        {
          className: mode === "watch" ? "mode-tab fly active" : "mode-tab fly",
          onClick: () => selectMode("watch"),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "mode-icon", children: "PLAY" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Watch It Fly" })
          ]
        }
      )
    ] }),
    mode === "warmup" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("section", { className: "story-stage", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(WarmupScreen, { videoUrl: warmupVideoUrl ?? content_default.warmupVideoUrl }) }) : mode === "story" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("section", { className: "story-stage", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      StoryVideoCard,
      {
        title: "Lyson Island Needs Supplies",
        youtubeEmbedUrl: STORY_VIDEO_URL
      }
    ) }) : webGLAvailable ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(WebGLErrorBoundary, { fallback: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(WebGLFallback, {}), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      Canvas,
      {
        camera: { position: [0, 2.5, 12], fov: 30, near: 0.1, far: 100 },
        dpr: [1, 1.5],
        gl: { antialias: false, failIfMajorPerformanceCaveat: false, powerPreference: "default" },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ambientLight", { intensity: 0.55 }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("hemisphereLight", { intensity: 0.65, groundColor: "#667f99" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("directionalLight", { position: [10, 10, 7], intensity: 1.4 }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("directionalLight", { position: [-5, 3, -5], intensity: 0.45, color: "#a4c2ff" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            ModelOrbitControls,
            {
              zoomEnabled: mode === "identify",
              rotateEnabled: mode === "explore",
              target: [0, 1.05, 0],
              minDistance: 5.5,
              maxDistance: 20
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react2.Suspense, { fallback: null, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("group", { position: planePosition, rotation: planeRotation, scale: planeScale, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            AirplaneLessonModel,
            {
              modelUrl: "models/airplane.glb",
              activePart: selectedPart,
              assembledParts: displayAssembledParts,
              partPositions: displayPartPositions,
              onPartSelect: modelPartSelect,
              onPartPointerDown: mode === "assemble" ? onPartPointerDown : void 0,
              onPartPointerMove: mode === "assemble" ? onPartPointerMove : void 0,
              onPartPointerUp: mode === "assemble" ? onPartPointerUp : void 0,
              modelGroupRef
            }
          ) }) })
        ]
      }
    ) }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(WebGLFallback, {}),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("aside", { className: "task-column", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: "task-card", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "task-header", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "pilot-badge", children: "PILOT" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Your Task" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "task-body", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { children: taskTitle }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: instruction }),
          mode === "story" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { className: "primary-action", onClick: () => selectMode("identify"), children: "Start Identifying" }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "button",
            {
              className: identifyFeedback === "wrong" ? "ghost-part wrong" : "ghost-part",
              onClick: () => {
                if (mode === "identify") {
                  selectIdentifyPart(taskPart);
                  return;
                }
                if (mode === "explore") {
                  selectExplorePart(taskPart);
                  return;
                }
                selectPart(taskPart);
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(PartPreview, { part: taskPart })
            }
          )
        ] })
      ] }),
      mode === "warmup" ? null : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        "section",
        {
          className: (mode === "story" ? storyFeedback : quizFeedback) === "correct" ? "quiz-card correct-pop" : (mode === "story" ? storyFeedback : quizFeedback) === "wrong" ? "quiz-card wrong-shake" : "quiz-card",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "quiz-header", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Check Question" }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: mode === "story" ? `${storyQuestionIndex + 1}/${STORY_QUESTIONS.length}` : `${Math.min(correctAnswers + 1, QUIZ_QUESTIONS.length)}/${QUIZ_QUESTIONS.length}` })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "quiz-body", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { children: mode === "story" ? storyQuestion.prompt : quizComplete ? "You finished all ten questions." : quizQuestion.prompt }),
              mode === "story" ? storyQuestion.answers.map((answer, index) => {
                const isCorrect = storyFeedback !== null && index === storyQuestion.correctIndex;
                const isWrong = storyFeedback === "wrong" && index !== storyQuestion.correctIndex;
                return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
                  "button",
                  {
                    className: isCorrect ? "answer correct" : isWrong ? "answer wrong" : "answer",
                    onClick: () => answerStoryQuestion(index),
                    children: [
                      String.fromCharCode(65 + index),
                      " ",
                      answer
                    ]
                  },
                  answer
                );
              }) : quizComplete ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "quiz-finished", children: [
                "Score: ",
                correctAnswers,
                "/",
                QUIZ_QUESTIONS.length
              ] }) : quizQuestion.answers.map((answer, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = quizFeedback !== null && index === quizQuestion.correctIndex;
                const isWrong = quizFeedback === "wrong" && isSelected;
                return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
                  "button",
                  {
                    className: isCorrect ? "answer correct" : isWrong ? "answer wrong" : "answer",
                    onClick: () => answerQuestion(index),
                    children: [
                      String.fromCharCode(65 + index),
                      " ",
                      answer
                    ]
                  },
                  answer
                );
              }),
              (mode === "story" ? storyFeedback : quizFeedback) === "correct" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "correct-burst", children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Correct!" }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("small", { children: mode === "story" ? storyQuestion.success : quizQuestion.success })
              ] }) : null,
              (mode === "story" ? storyFeedback : quizFeedback) === "wrong" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "try-again", children: mode === "story" ? "Try again. Use the story clue." : "Try again. Look for the part clue." }) : null
            ] })
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "tip-card", children: mode === "warmup" ? "Tip: Warm bodies learn best." : mode === "story" ? "Tip: Listen for the mission problem." : "Tip: Look at the shape." })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("aside", { className: "progress-column", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: "progress-card", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "eyebrow", children: "Your Progress" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "progress-count", children: [
          progressDone,
          "/",
          progressTotal,
          " ",
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: mode === "story" ? "answered" : mode === "identify" ? "found" : "parts" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "progress-bar", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "progress-fill", style: { width: `${completionRatio * 100}%` } }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { className: "watch-button", onClick: () => selectMode("watch"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "watch-play", children: "PLAY" }),
        "Watch It Fly"
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "lesson-callouts", children: [
      showAssemblyCallouts && !assembledParts.tail ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "callout tail-callout", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Stable" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("small", { children: "Tail" })
      ] }) : null,
      showAssemblyCallouts && !assembledParts.engine ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "callout engine-callout", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Thrust" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("small", { children: "Engine" })
      ] }) : null,
      showAssemblyCallouts && (!assembledParts.leftWing || !assembledParts.rightWing) ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "callout wing-callout", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Lift" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("small", { children: "Wing" })
      ] }) : null
    ] }),
    mode === "story" || mode === "warmup" ? null : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("section", { className: "parts-tray", children: ASSEMBLY_SEQUENCE.map((part) => {
      const assembled = assembledParts[part];
      const active = selectedPart === part;
      const identified = Boolean(identifiedParts[part]);
      const nextIndex = nextPart ? ASSEMBLY_SEQUENCE.indexOf(nextPart) : -1;
      const partIndex = ASSEMBLY_SEQUENCE.indexOf(part);
      const assemblyLocked = !assembled && nextIndex !== -1 && partIndex > nextIndex;
      const identifyIndex = identifyTarget ? IDENTIFY_SEQUENCE.indexOf(identifyTarget) : -1;
      const partIdentifyIndex = IDENTIFY_SEQUENCE.indexOf(part);
      const identifyLocked = mode === "identify" && !identified && identifyIndex !== -1 && partIdentifyIndex > identifyIndex;
      const locked = mode === "assemble" ? assemblyLocked : identifyLocked;
      const status = mode === "watch" ? "Ready" : mode === "explore" ? active ? "Reading" : "Explore" : mode === "identify" ? identified ? "Complete" : locked ? "Locked" : "Find" : assembled ? "Complete" : locked ? "Locked" : "Drag";
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        "button",
        {
          className: active ? "tray-part active" : status === "Complete" ? "tray-part done" : locked ? "tray-part locked" : "tray-part",
          onClick: () => {
            if (mode === "identify") {
              selectIdentifyPart(part);
              return;
            }
            if (mode === "explore") {
              selectExplorePart(part);
              return;
            }
            selectPart(part);
          },
          disabled: mode === "assemble" && assembled,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "tray-thumb", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(PartPreview, { part }) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: PART_LABELS[part] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "tray-part-status", children: status })
          ]
        },
        part
      );
    }) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: bannerClass, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "STAR" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: bannerMessage })
    ] }),
    lastCompletedPart ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "success-badge", children: [
      "Attached: ",
      PART_LABELS[lastCompletedPart]
    ] }) : null,
    planeComplete ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "finish-glow" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "finish-card", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "finish-label", children: "Ready To Fly" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "finish-title", children: "You built the airplane." }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "finish-text", children: "The cockpit, engines, wings, tail, and tires are all attached." })
      ] })
    ] }) : null
  ] });
};
var AirplaneLesson_default = AirplaneLesson;
export {
  AirplaneLesson,
  AirplaneLesson_default as default
};
