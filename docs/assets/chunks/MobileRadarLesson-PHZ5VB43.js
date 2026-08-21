import {
  content_default
} from "./chunk-GM2NIAG2.js";
import {
  Box3,
  BufferGeometry,
  Canvas,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  GLTFLoader,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  ModelOrbitControls,
  Vector3,
  useFrame,
  useLoader,
  useThree
} from "./chunk-CC73DKN2.js";
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
  { part: "cab", position: [300, 300, 0], size: [190, 270, 1100] },
  { part: "body", position: [135, 210, 0], size: [440, 140, 1100] },
  { part: "wheels", position: [59, 70, 0], size: [600, 140, 1100], sourceMeshIndexes: [0] }
];
var DISH_POS = new Vector3(0.9, 1.4, 0);
var AIRPLANE_POS = new Vector3(2.6, 3, -3.2);
var CLOUD_POS = new Vector3(-2.2, 4.8, -5.6);
var WAVE_COUNT = 5;
var WAVE_DURATION = 1.5;
var WAVE_INTERVAL = 0.42;
var DEFAULT_CAM = new Vector3(0, 1.2, 10);
var ACTIVITY_CAM = new Vector3(0, 1.8, 12);
var ACTIVITY_TARGET = new Vector3(0, 1.2, -1);
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
var AirplaneTarget = ({ found, visible }) => {
  const groupRef = (0, import_react.useRef)(null);
  const glow = (0, import_react.useRef)(new Color("#ffe155"));
  const pulseMat = (0, import_react.useMemo)(
    () => new MeshStandardMaterial({
      color: "#eef4fa",
      metalness: 0.25,
      roughness: 0.55,
      emissive: "#000000",
      emissiveIntensity: 0
    }),
    []
  );
  const accentMat = (0, import_react.useMemo)(
    () => new MeshStandardMaterial({
      color: "#e84a5f",
      metalness: 0.15,
      roughness: 0.6,
      emissive: "#000000",
      emissiveIntensity: 0
    }),
    []
  );
  const windowMat = (0, import_react.useMemo)(
    () => new MeshStandardMaterial({
      color: "#9fd8ff",
      metalness: 0.5,
      roughness: 0.2,
      emissive: "#7fc4ff",
      emissiveIntensity: 0.35
    }),
    []
  );
  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * 0.9) * 0.12;
    const pulse = found ? 1 + Math.sin(t * 7) * 0.12 : 1;
    groupRef.current.scale.setScalar(pulse);
    const intensity = found ? 0.65 + Math.sin(t * 8) * 0.3 : 0;
    pulseMat.emissive.copy(glow.current);
    pulseMat.emissiveIntensity = intensity;
    accentMat.emissive.copy(glow.current);
    accentMat.emissiveIntensity = intensity;
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { position: AIRPLANE_POS, rotation: [0, 0.35, 0.05], visible, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { ref: groupRef, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", { material: pulseMat, rotation: [0, 0, Math.PI / 2], children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("capsuleGeometry", { args: [0.26, 1.5, 6, 16] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", { material: accentMat, position: [0, -0.05, 0], rotation: [0, 0, 0], children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [2.6, 0.1, 0.72] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", { material: accentMat, position: [-1, 0.32, 0], rotation: [0, 0, -0.35], children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [0.5, 0.55, 0.12] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", { material: pulseMat, position: [-1.05, 0.02, 0], children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [0.28, 0.08, 0.9] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", { material: windowMat, position: [0.55, 0.14, 0], children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [0.18, 12, 10] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", { material: pulseMat, position: [1, 0, 0], rotation: [0, 0, Math.PI / 2], children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [0.26, 0.55, 16] }) })
  ] }) });
};
var StormCloud = ({ found, visible }) => {
  const flash = (0, import_react.useRef)(0);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    flash.current = found ? 0.5 + Math.sin(t * 10) * 0.35 : 0.15;
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { position: CLOUD_POS, visible, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [0, 0, 0], scale: [2.2, 1.3, 1.6], children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [1, 24, 18] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#8b9bb0", roughness: 0.95 })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [1.1, 0.25, 0.3], scale: [1.4, 0.9, 1.1], children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [1, 24, 18] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#9aa9bc", roughness: 0.95 })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [-1.1, 0.15, -0.2], scale: [1.3, 0.85, 1.05], children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [1, 24, 18] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", { color: "#7d8ca1", roughness: 0.95 })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { position: [0, -0.4, 0.4], children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("sphereGeometry", { args: [0.35, 12, 10] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", { color: "#fff6c8", transparent: true, opacity: flash.current * 0.9, depthWrite: false })
    ] })
  ] });
};
var SignalWaves = ({ scanning, onHit }) => {
  const ringsRef = (0, import_react.useRef)([]);
  const agesRef = (0, import_react.useRef)(Array.from({ length: WAVE_COUNT }, () => -1));
  const spawnTimer = (0, import_react.useRef)(0);
  const hitFired = (0, import_react.useRef)(false);
  const burstRef = (0, import_react.useRef)(null);
  const burstAge = (0, import_react.useRef)(-1);
  useFrame((_, delta) => {
    if (!scanning) {
      agesRef.current.fill(-1);
      spawnTimer.current = 0;
      hitFired.current = false;
      burstAge.current = -1;
      if (burstRef.current) {
        burstRef.current.visible = false;
      }
      ringsRef.current.forEach((ring) => ring && (ring.visible = false));
      return;
    }
    spawnTimer.current += delta;
    if (spawnTimer.current >= WAVE_INTERVAL) {
      spawnTimer.current = 0;
      const slot = agesRef.current.findIndex((age) => age < 0 || age >= WAVE_DURATION);
      if (slot !== -1) {
        agesRef.current[slot] = 0;
      }
    }
    ringsRef.current.forEach((ring, index) => {
      if (!ring) {
        return;
      }
      const age = agesRef.current[index];
      if (age < 0) {
        ring.visible = false;
        return;
      }
      const nextAge = age + delta;
      if (nextAge >= WAVE_DURATION) {
        agesRef.current[index] = -1;
        ring.visible = false;
        return;
      }
      agesRef.current[index] = nextAge;
      const t = nextAge / WAVE_DURATION;
      ring.visible = true;
      ring.position.lerpVectors(DISH_POS, AIRPLANE_POS, t);
      const scale = 0.5 + t * 5.8;
      ring.scale.set(scale, scale, scale);
      ring.material.opacity = 0.8 * (1 - t);
      if (t >= 0.88 && !hitFired.current) {
        hitFired.current = true;
        burstAge.current = 0;
        onHit();
      }
    });
    if (burstRef.current) {
      if (burstAge.current >= 0) {
        const t = burstAge.current / 0.7;
        if (t >= 1) {
          burstAge.current = -1;
          burstRef.current.visible = false;
        } else {
          burstRef.current.visible = true;
          const s = 0.3 + t * 2.4;
          burstRef.current.scale.set(s, s, s);
          burstRef.current.material.opacity = 0.9 * (1 - t);
        }
      }
      burstAge.current += delta;
    }
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
    Array.from({ length: WAVE_COUNT }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "mesh",
      {
        ref: (element) => {
          ringsRef.current[index] = element;
        },
        visible: false,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [0.92, 1, 48] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", { color: "#6ee7ff", transparent: true, opacity: 0, side: DoubleSide, depthWrite: false })
        ]
      },
      index
    )),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { ref: burstRef, position: AIRPLANE_POS, visible: false, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ringGeometry", { args: [0.9, 1.1, 48] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", { color: "#ffe155", transparent: true, opacity: 0, side: DoubleSide, depthWrite: false })
    ] })
  ] });
};
var SweepBeam = ({ scanning }) => {
  const ref = (0, import_react.useRef)(null);
  useFrame((_, delta) => {
    if (ref.current && scanning) {
      ref.current.rotation.y += delta * 2.4;
    }
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { ref, position: DISH_POS, rotation: [0.45, 0, 0], visible: scanning, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("coneGeometry", { args: [1.1, 2.4, 24, 1, true] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", { color: "#6ee7ff", transparent: true, opacity: 0.22, side: DoubleSide, depthWrite: false })
  ] });
};
var CameraRig = ({ mode }) => {
  const { camera } = useThree();
  const inActivity = mode === "activity";
  useFrame((_, delta) => {
    const goal = inActivity ? ACTIVITY_CAM : DEFAULT_CAM;
    camera.position.lerp(goal, Math.min(1, delta * 2.5));
    if (inActivity) {
      camera.lookAt(ACTIVITY_TARGET);
    }
  });
  return null;
};
var RadarTruckModel = ({ highlightedPart, mode, activityScanning, activityFound, onPartSelect, onWaveHit }) => {
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
    ) : null,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SweepBeam, { scanning: activityScanning }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalWaves, { scanning: activityScanning, onHit: onWaveHit }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StormCloud, { found: activityFound, visible: mode === "activity" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AirplaneTarget, { found: activityFound, visible: mode === "activity" })
  ] });
};
var RadarCanvas = ({ highlightedPart, mode, activityScanning, activityFound, onPartSelect, onWaveHit }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, { camera: { position: DEFAULT_CAM.toArray(), fov: 30, near: 0.1, far: 100 }, dpr: [1, 1.5], gl: { antialias: false }, children: [
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: 0.7 }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { intensity: 0.75, groundColor: "#5b7a99" }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", { position: [4, 6, 5], intensity: 1.4 }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", { position: [-3, 2, -3], intensity: 0.35, color: "#a4c2ff" }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CameraRig, { mode }),
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
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    RadarTruckModel,
    {
      highlightedPart,
      mode,
      activityScanning,
      activityFound,
      onPartSelect,
      onWaveHit
    }
  )
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
  const [scanning, setScanning] = (0, import_react2.useState)(false);
  const [found, setFound] = (0, import_react2.useState)(false);
  const startScan = () => {
    if (activityDone) {
      return;
    }
    setScanning(true);
  };
  const onWaveHit = () => {
    if (!found) {
      setFound(true);
      setScanning(false);
      completeActivity();
    }
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
            activityScanning: scanning,
            activityFound: found,
            onPartSelect: onSelect,
            onWaveHit
          }
        ) })
      }
    ),
    mode === "activity" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "radar-activity radar-activity-overlay", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "radar-sweep-screen", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: `radar-sweep ${scanning ? "spin" : ""}` }),
        found ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "radar-blip", children: "Airplane found!" }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "radar-hint", children: scanning ? "Searching the sky\u2026" : "Ready to scan" })
      ] }),
      found || activityDone ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "bee-activity-done", children: "Signal found! The radar works." }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { className: "primary-action", onClick: startScan, disabled: scanning, children: scanning ? "Scanning..." : "Turn on the radar" })
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
