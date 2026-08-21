import {
  content_default
} from "./chunk-GM2NIAG2.js";
import {
  Box3,
  BufferGeometry,
  Canvas,
  DoubleSide,
  Float32BufferAttribute,
  GLTFLoader,
  Group,
  Mesh,
  MeshBasicMaterial,
  ModelOrbitControls,
  Vector3,
  useLoader
} from "./chunk-3NJM4L7S.js";
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

// src/lessons/mobile-radar/RadarStage.tsx
var import_react2 = __toESM(require_react());

// src/lessons/mobile-radar/RadarTruckModel.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
var RADAR_HIT_AREAS = [
  { part: "antenna", position: [78, 535, 0], size: [90, 470, 1100] },
  { part: "radar-dish", position: [215, 665, 0], size: [270, 380, 1100] },
  // The cab is the front, windowed section at the right of the rendered truck.
  { part: "cab", position: [215, 300, 0], size: [190, 270, 1100] },
  { part: "body", position: [135, 210, 0], size: [440, 140, 1100] },
  { part: "wheels", position: [59, 70, 0], size: [600, 140, 1100], sourceMeshIndexes: [0] }
];
var createBakedMesh = (source, geometry, sourceMeshIndex) => {
  const mesh = new Mesh(geometry, source.material);
  mesh.name = source.name;
  mesh.userData.sourceMeshIndex = sourceMeshIndex;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  mesh.raycast = () => void 0;
  return mesh;
};
var createPartHighlight = (geometry, area, sourceMeshIndex) => {
  if (area.sourceMeshIndexes) {
    return area.sourceMeshIndexes.includes(sourceMeshIndex) ? geometry.clone() : null;
  }
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const vertices = [];
  const [width, height, depth] = area.size;
  const [x, y, z] = area.position;
  const minX = x - width / 2;
  const maxX = x + width / 2;
  const minY = y - height / 2;
  const maxY = y + height / 2;
  const minZ = z - depth / 2;
  const maxZ = z + depth / 2;
  const vertexCount = index ? index.count : position.count;
  for (let offset = 0; offset < vertexCount; offset += 3) {
    const first = index ? index.getX(offset) : offset;
    const second = index ? index.getX(offset + 1) : offset + 1;
    const third = index ? index.getX(offset + 2) : offset + 2;
    const centerX = (position.getX(first) + position.getX(second) + position.getX(third)) / 3;
    const centerY = (position.getY(first) + position.getY(second) + position.getY(third)) / 3;
    const centerZ = (position.getZ(first) + position.getZ(second) + position.getZ(third)) / 3;
    if (centerX < minX || centerX > maxX || centerY < minY || centerY > maxY || centerZ < minZ || centerZ > maxZ) {
      continue;
    }
    [first, second, third].forEach((vertex) => {
      vertices.push(position.getX(vertex), position.getY(vertex), position.getZ(vertex));
    });
  }
  if (!vertices.length) {
    return null;
  }
  const highlight = new BufferGeometry();
  highlight.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  highlight.computeVertexNormals();
  return highlight;
};
var RadarTruckModel = ({ highlightedPart, mode, onPartSelect }) => {
  const gltf = useLoader(GLTFLoader, "/models/radar-truck.glb");
  const model = (0, import_react.useMemo)(() => {
    const cloned = gltf.scene.clone(true);
    cloned.updateMatrixWorld(true);
    const baked = new Group();
    const visibleBox = new Box3();
    let sourceMeshIndex = 0;
    cloned.traverse((child) => {
      const mesh = child;
      if (!mesh.isMesh) {
        return;
      }
      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(mesh.matrixWorld);
      geometry.computeVertexNormals();
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      const bakedMesh = createBakedMesh(mesh, geometry, sourceMeshIndex);
      sourceMeshIndex += 1;
      baked.add(bakedMesh);
      visibleBox.union(new Box3().setFromObject(bakedMesh));
    });
    const box = visibleBox.isEmpty() ? new Box3().setFromObject(baked) : visibleBox;
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);
    const scale = 6 / Math.max(size.x, size.y, size.z);
    baked.scale.setScalar(scale);
    baked.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    return { object: baked, scale, center };
  }, [gltf.scene]);
  const highlight = (0, import_react.useMemo)(() => {
    if (!highlightedPart) {
      return null;
    }
    const area = RADAR_HIT_AREAS.find((candidate) => candidate.part === highlightedPart);
    if (!area) {
      return null;
    }
    const overlay = new Group();
    overlay.scale.copy(model.object.scale);
    overlay.position.copy(model.object.position);
    model.object.children.forEach((child) => {
      if (!(child instanceof Mesh)) {
        return;
      }
      const geometry = createPartHighlight(child.geometry, area, Number(child.userData.sourceMeshIndex));
      if (!geometry) {
        return;
      }
      const mesh = new Mesh(
        geometry,
        new MeshBasicMaterial({
          color: "#ffdf46",
          transparent: true,
          opacity: 0.72,
          depthTest: false,
          depthWrite: false,
          side: DoubleSide
        })
      );
      mesh.renderOrder = 2;
      mesh.raycast = () => void 0;
      overlay.add(mesh);
    });
    return overlay;
  }, [highlightedPart, model]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", { object: model.object }),
    highlight ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", { object: highlight }) : null,
    mode === "identify" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "group",
      {
        position: [-model.center.x * model.scale, -model.center.y * model.scale, -model.center.z * model.scale],
        scale: model.scale,
        children: RADAR_HIT_AREAS.map((area) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "mesh",
          {
            position: area.position,
            onClick: (event) => {
              event.stopPropagation();
              onPartSelect(area.part);
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: area.size }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", { colorWrite: false, depthWrite: false })
            ]
          },
          area.part
        ))
      }
    ) : null
  ] });
};
var RadarCanvas = ({ highlightedPart, mode, onPartSelect }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, { camera: { position: [0, 1.2, 10], fov: 30, near: 0.1, far: 100 }, dpr: [1, 1.5], gl: { antialias: false }, children: [
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: 0.7 }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { intensity: 0.75, groundColor: "#5b7a99" }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", { position: [4, 6, 5], intensity: 1.4 }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", { position: [-3, 2, -3], intensity: 0.35, color: "#a4c2ff" }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    ModelOrbitControls,
    {
      zoomEnabled: mode === "identify",
      rotateEnabled: mode === "identify" || mode === "explore",
      target: [0, 0, 0],
      minDistance: 5,
      maxDistance: 18
    }
  ),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadarTruckModel, { highlightedPart, mode, onPartSelect })
] });

// src/lessons/mobile-radar/RadarStage.tsx
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
var RadarErrorBoundary = class extends import_react2.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
};
var RadarStage = ({ lastSelectedPart, onSelect, mode, activityDone, completeActivity }) => {
  const [webGLAvailable] = (0, import_react2.useState)(hasWebGLSupport);
  const [spinning, setSpinning] = (0, import_react2.useState)(false);
  const [found, setFound] = (0, import_react2.useState)(false);
  const scan = () => {
    if (activityDone) {
      return;
    }
    setSpinning(true);
    window.setTimeout(() => {
      setSpinning(false);
      setFound(true);
      completeActivity();
    }, 1400);
  };
  if (mode === "warmup") {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(WarmupScreen, { videoUrl: content_default.warmupVideoUrl });
  }
  if (mode === "story") {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(StoryVideoCard, { title: content_default.title, youtubeEmbedUrl: content_default.storyVideoUrl });
  }
  if (!webGLAvailable) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "radar-no-webgl", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: "The radar truck needs WebGL." }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Enable graphics acceleration in Chrome, or use Firefox." })
    ] }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "generic-stage radar-model-stage", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      RadarErrorBoundary,
      {
        fallback: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "radar-no-webgl", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: "The radar truck model failed to load." }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Check the browser console for details." })
        ] }),
        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react2.Suspense, { fallback: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "radar-loading", children: "Loading radar truck\u2026" }), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          RadarCanvas,
          {
            highlightedPart: mode === "identify" ? lastSelectedPart : null,
            mode,
            onPartSelect: onSelect
          }
        ) })
      }
    ),
    mode === "activity" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "radar-activity radar-activity-overlay", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "radar-sweep-screen", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: `radar-sweep ${spinning ? "spin" : ""}` }),
        found ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "radar-blip", children: "Signal found!" }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "radar-hint", children: "Scanning for signals\u2026" })
      ] }),
      found || activityDone ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "bee-activity-done", children: "Signal found! The radar works." }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { className: "primary-action", onClick: scan, children: spinning ? "Scanning..." : "Turn on the radar" })
    ] }) : null
  ] });
};
var RadarPartPreview = ({ part }) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "generic-part-preview", "aria-hidden": "true", children: [
  part === "antenna" ? "\u{1F4E1}" : null,
  part === "radar-dish" ? "\u{1F6F0}\uFE0F" : null,
  part === "cab" ? "\u{1F699}" : null,
  part === "body" ? "\u{1F69B}" : null,
  part === "wheels" ? "\u2699\uFE0F" : null
] });

// src/lessons/mobile-radar/MobileRadarLesson.tsx
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
var MobileRadarLesson = ({
  onHome,
  onComplete
}) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
  GenericLesson,
  {
    content: content_default,
    onHome: onHome ?? (() => {
    }),
    onComplete: onComplete ?? (() => {
    }),
    stage: (props) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(RadarStage, { ...props, mode: props.mode }),
    partPreview: (part) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(RadarPartPreview, { part })
  }
);
var MobileRadarLesson_default = MobileRadarLesson;
export {
  MobileRadarLesson,
  MobileRadarLesson_default as default
};
