import {
  content_default
} from "./chunk-SIX2DKDD.js";
import {
  Box3,
  BufferGeometry,
  Canvas,
  Color,
  Float32BufferAttribute,
  GLTFLoader,
  Group,
  Mesh,
  ModelOrbitControls,
  Vector3,
  useFrame,
  useLoader
} from "./chunk-ZCM7JGQ4.js";
import {
  FeedbackBanner,
  LessonStage,
  MissionHeader,
  ModeTabs,
  PartsList,
  PartsTray,
  ProgressCard,
  QuizCard,
  StoryVideoCard,
  TaskCard,
  TipCard,
  WarmupScreen
} from "./chunk-LSECZ6XO.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-QP3GZB4W.js";

// src/lessons/butterfly/ButterflyLesson.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
var PARTS = ["wings", "body", "head", "antennae", "proboscis"];
var IDENTIFY_ORDER = ["wings", "body", "head", "antennae", "proboscis"];
var MODE_TABS = [
  { id: "warmup", label: "Warmup", icon: "WU", tone: "fly" },
  { id: "story", label: "Story", icon: "PLAY", tone: "fly" },
  { id: "identify", label: "Identify", icon: "Q", tone: "identify" },
  { id: "explore", label: "Explore", icon: "BOOK", tone: "explore" },
  { id: "pollinate", label: "Pollinate", icon: "POLLEN", tone: "assemble" },
  { id: "code", label: "Code", icon: "A+B", tone: "fly" }
];
var STORY_VIDEO_URL = content_default.storyVideoUrl;
var QUESTIONS = content_default.quiz;
var STORY_QUESTIONS = content_default.storyQuestions;
var LABELS = {
  wings: "Wings",
  body: "Body",
  head: "Head",
  antennae: "Antennae",
  proboscis: "Proboscis"
};
var FACTS = {
  wings: "Butterflies use wings to fly from flower to flower.",
  body: "The body holds the head, thorax, abdomen, legs, and wings together.",
  head: "The head holds the eyes, antennae, and proboscis.",
  antennae: "Antennae help butterflies smell and sense the world around them.",
  proboscis: "The proboscis is a straw-like tube. It unrolls to drink nectar and rolls back up."
};
var hasWebGLSupport = () => {
  if (typeof document === "undefined") {
    return false;
  }
  const canvas = document.createElement("canvas");
  return Boolean(
    canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
  );
};
var ButterflyStageErrorBoundary = class extends import_react.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
};
var PartPreview = ({ part }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: `butterfly-part-preview butterfly-preview-${part}`, "aria-hidden": "true", children: [
  part === "wings" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mini-wing mini-wing-left" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mini-wing mini-wing-right" })
  ] }) : null,
  part === "body" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mini-body" }) : null,
  part === "head" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mini-body mini-head" }) : null,
  part === "antennae" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mini-antenna left" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mini-antenna right" })
  ] }) : null,
  part === "proboscis" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mini-proboscis" }) : null
] });
var classifyMesh = (name) => {
  const normalized = name.toLowerCase();
  if (normalized.includes("wing") || normalized.includes("wiba") || normalized.includes("wifr")) {
    return "wings";
  }
  if (normalized.includes("face") || normalized.includes("eyes")) {
    return "head";
  }
  if (normalized.includes("body")) {
    return "body";
  }
  return "body";
};
var getIdentifyOffset = (part) => {
  switch (part) {
    case "wings":
      return [0, 0.18, 0.12];
    case "body":
      return [0, -0.24, -0.08];
    case "head":
      return [0, 0.1, 0.32];
    case "antennae":
      return [0, 0.38, 0.24];
    case "proboscis":
      return [0, -0.08, 0.34];
    default:
      return [0, 0, 0];
  }
};
var getMaterialNames = (object) => {
  const material = object.material;
  if (Array.isArray(material)) {
    return material.map((entry) => entry && typeof entry === "object" && "name" in entry ? String(entry.name) : "").join(" ");
  }
  if (material && typeof material === "object" && "name" in material) {
    return String(material.name);
  }
  return "";
};
var cloneMaterial = (material) => {
  if (Array.isArray(material)) {
    return material.map((entry) => entry.clone());
  }
  return material.clone();
};
var highlightMaterial = (material, active) => {
  const cloned = cloneMaterial(material);
  const applyHighlight = (entry) => {
    const materialWithColor = entry;
    if (materialWithColor.color && active) {
      materialWithColor.color.lerp(new Color("#fff26a"), 0.22);
    }
    if (materialWithColor.emissive) {
      materialWithColor.emissive = new Color(active ? "#ffe155" : "#000000");
      materialWithColor.emissiveIntensity = active ? 0.75 : 0;
    }
    if (typeof materialWithColor.roughness === "number" && active) {
      materialWithColor.roughness = Math.max(0.25, materialWithColor.roughness - 0.25);
    }
  };
  if (Array.isArray(cloned)) {
    cloned.forEach(applyHighlight);
    return cloned;
  }
  applyHighlight(cloned);
  return cloned;
};
var splitGeometry = (geometry, includeTriangle) => {
  const source = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  const position = source.getAttribute("position");
  const normal = source.getAttribute("normal");
  const uv = source.getAttribute("uv");
  const positions = [];
  const normals = [];
  const uvs = [];
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  const centroid = new Vector3();
  for (let index = 0; index < position.count; index += 3) {
    a.fromBufferAttribute(position, index);
    b.fromBufferAttribute(position, index + 1);
    c.fromBufferAttribute(position, index + 2);
    centroid.copy(a).add(b).add(c).multiplyScalar(1 / 3);
    if (!includeTriangle(centroid)) {
      continue;
    }
    for (let offset = 0; offset < 3; offset += 1) {
      positions.push(
        position.getX(index + offset),
        position.getY(index + offset),
        position.getZ(index + offset)
      );
      if (normal) {
        normals.push(normal.getX(index + offset), normal.getY(index + offset), normal.getZ(index + offset));
      }
      if (uv) {
        uvs.push(uv.getX(index + offset), uv.getY(index + offset));
      }
    }
  }
  if (positions.length === 0) {
    return null;
  }
  const result = new BufferGeometry();
  result.setAttribute("position", new Float32BufferAttribute(positions, 3));
  if (normals.length > 0) {
    result.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  }
  if (uvs.length > 0) {
    result.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  }
  result.computeVertexNormals();
  result.computeBoundingBox();
  result.computeBoundingSphere();
  return result;
};
var createBakedGeometry = (source) => {
  const geometry = source.geometry.clone();
  const position = geometry.getAttribute("position");
  const skinned = source;
  const vertex = new Vector3();
  if (position && skinned.isSkinnedMesh) {
    skinned.skeleton.update();
    for (let index = 0; index < position.count; index += 1) {
      vertex.fromBufferAttribute(position, index);
      skinned.applyBoneTransform(index, vertex);
      vertex.applyMatrix4(source.matrixWorld);
      position.setXYZ(index, vertex.x, vertex.y, vertex.z);
    }
    position.needsUpdate = true;
  } else {
    geometry.applyMatrix4(source.matrixWorld);
  }
  geometry.deleteAttribute("skinIndex");
  geometry.deleteAttribute("skinWeight");
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
};
var createBakedMesh = (source, geometry, part, active) => {
  const mesh = new Mesh(geometry, highlightMaterial(source.material, active));
  mesh.name = source.name;
  mesh.userData.lessonPart = part;
  mesh.userData.originalScale = [source.scale.x, source.scale.y, source.scale.z];
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  return mesh;
};
var ButterflyModel = ({ activePart, mode, flapSpeed, pollinationStep, onDebug, onPartSelect }) => {
  const gltf = useLoader(GLTFLoader, "models/butterfly.glb");
  const model = (0, import_react.useMemo)(() => {
    const cloned = gltf.scene.clone(true);
    cloned.updateMatrixWorld(true);
    const baked = new Group();
    const visibleBox = new Box3();
    const visibleMeshes = [];
    const hiddenMeshes = [];
    cloned.traverse((child) => {
      const materialName = getMaterialNames(child).toLowerCase();
      const mesh = child;
      if (mesh.isMesh) {
        const bakedGeometry = createBakedGeometry(mesh);
        const meshKey = `${child.name} ${materialName}`;
        const part = classifyMesh(meshKey);
        const bakedMeshes = [];
        if (materialName.includes("buttpiez")) {
          const antennaeGeometry = splitGeometry(
            bakedGeometry,
            (centroid) => centroid.y > 13.5 && centroid.z > 8 && Math.abs(centroid.x) > 2.5
          );
          const proboscisGeometry = splitGeometry(
            bakedGeometry,
            (centroid) => centroid.y > 8 && centroid.y <= 16 && centroid.z > 10 && Math.abs(centroid.x) <= 4.5
          );
          const bodyDetailGeometry = splitGeometry(
            bakedGeometry,
            (centroid) => !(centroid.y > 13.5 && centroid.z > 8 && Math.abs(centroid.x) > 2.5) && !(centroid.y > 8 && centroid.y <= 16 && centroid.z > 10 && Math.abs(centroid.x) <= 4.5)
          );
          if (antennaeGeometry) {
            bakedMeshes.push(createBakedMesh(mesh, antennaeGeometry, "antennae", activePart === "antennae"));
          }
          if (proboscisGeometry) {
            bakedMeshes.push(createBakedMesh(mesh, proboscisGeometry, "proboscis", activePart === "proboscis"));
          }
          if (bodyDetailGeometry) {
            bakedMeshes.push(createBakedMesh(mesh, bodyDetailGeometry, "body", activePart === "body"));
          }
        } else {
          bakedMeshes.push(createBakedMesh(mesh, bakedGeometry, part, part === activePart));
        }
        bakedMeshes.forEach((bakedMesh) => {
          baked.add(bakedMesh);
          visibleBox.union(new Box3().setFromObject(bakedMesh));
        });
        visibleMeshes.push(`${mesh.name || "unnamed"}:${materialName || "no-material"}`);
      }
    });
    const box = visibleBox.isEmpty() ? new Box3().setFromObject(baked) : visibleBox;
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);
    const scale = 3.25 / Math.max(size.x, size.y, size.z);
    baked.scale.setScalar(scale);
    baked.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    baked.rotation.set(0, 0, 0);
    onDebug?.({
      visibleMeshes,
      hiddenMeshes,
      bounds: `${size.x.toFixed(1)} x ${size.y.toFixed(1)} x ${size.z.toFixed(1)}`,
      scale: scale.toFixed(4)
    });
    return baked;
  }, [activePart, gltf.scene, onDebug]);
  const groupRef = (0, import_react.useRef)(null);
  useFrame((_, delta) => {
    if (groupRef.current) {
      const pollinationTarget = mode === "pollinate" ? pollinationStep === 0 ? [-2.35, -1.05, 0] : pollinationStep === 1 ? [0, 0.55, 0] : [2.35, -0.95, 0] : [0, 0.05, 0];
      const moveSpeed = Math.min(1, delta * (mode === "pollinate" ? 2.8 : 7));
      groupRef.current.position.x += (pollinationTarget[0] - groupRef.current.position.x) * moveSpeed;
      groupRef.current.position.y += (pollinationTarget[1] - groupRef.current.position.y) * moveSpeed;
      groupRef.current.position.z += (pollinationTarget[2] - groupRef.current.position.z) * moveSpeed;
      model.children.forEach((child) => {
        const part = child.userData.lessonPart;
        const [targetX, targetY, targetZ] = mode === "identify" && part ? getIdentifyOffset(part) : [0, 0, 0];
        const activeScale = mode === "identify" && part === activePart ? 1.08 : 1;
        const wingFlap = part === "wings" && flapSpeed !== "stop" ? Math.sin(Date.now() * (flapSpeed === "fast" ? 0.018 : 0.01)) * (flapSpeed === "fast" ? 0.5 : 0.28) : 0;
        const speed = Math.min(1, delta * 7);
        child.position.x += (targetX - child.position.x) * speed;
        child.position.y += (targetY - child.position.y) * speed;
        child.position.z += (targetZ - child.position.z) * speed;
        child.rotation.x += (wingFlap - child.rotation.x) * Math.min(1, delta * 12);
        child.scale.x += (activeScale - child.scale.x) * speed;
        child.scale.y += (activeScale - child.scale.y) * speed;
        child.scale.z += (activeScale - child.scale.z) * speed;
      });
      const bodySway = mode !== "identify" && flapSpeed !== "stop" ? Math.sin(Date.now() * (flapSpeed === "fast" ? 7e-3 : 3e-3)) * 0.05 : 0;
      const travelTilt = mode === "pollinate" ? pollinationStep === 1 ? -0.18 : pollinationStep === 2 ? 0.18 : 0 : 0;
      groupRef.current.rotation.y += (bodySway + travelTilt - groupRef.current.rotation.y) * Math.min(1, delta * 8);
    }
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "group",
    {
      ref: groupRef,
      position: [0, 0.05, 0],
      onClick: (event) => {
        event.stopPropagation();
        const part = event.object.userData.lessonPart;
        onPartSelect(part ?? activePart);
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", { object: model })
    }
  );
};
var ButterflyStage = ({ activePart, mode, flapSpeed, pollinationStep, onPartSelect }) => {
  const [webGLAvailable] = (0, import_react.useState)(hasWebGLSupport);
  const [debug, setDebug] = (0, import_react.useState)(null);
  const debugEnabled = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug");
  if (!webGLAvailable) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "butterfly-stage-error", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Butterfly 3D needs WebGL." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "This browser has WebGL disabled. Try Firefox or enable graphics acceleration." })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ButterflyStageErrorBoundary,
      {
        fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "butterfly-stage-error", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Butterfly model failed to load." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Check DevTools Network for ./models/butterfly.glb and Console for GLTF errors." })
        ] }),
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, { camera: { position: [0, 0.15, 7.4], fov: 32 }, dpr: [1, 1.5], gl: { antialias: false }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: 0.7 }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { intensity: 0.75, groundColor: "#5b7a99" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", { position: [5, 6, 5], intensity: 1.45 }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", { position: [-4, 2, -4], intensity: 0.35, color: "#a4c2ff" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            ModelOrbitControls,
            {
              zoomEnabled: mode === "identify",
              rotateEnabled: mode === "explore",
              target: [0, 0.2, 0],
              minDistance: 3.5,
              maxDistance: 13
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, { fallback: null, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            ButterflyModel,
            {
              activePart,
              mode,
              flapSpeed,
              pollinationStep,
              onDebug: debugEnabled ? setDebug : void 0,
              onPartSelect
            }
          ) })
        ] })
      }
    ),
    debugEnabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "butterfly-debug", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Butterfly GLB Debug" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "WebGL: yes" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
        "Visible meshes: ",
        debug?.visibleMeshes.length ?? 0
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
        "Hidden meshes: ",
        debug?.hiddenMeshes.length ?? 0
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
        "Bounds: ",
        debug?.bounds ?? "loading"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
        "Scale: ",
        debug?.scale ?? "loading"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: debug?.visibleMeshes.join(" | ") ?? "Loading model..." })
    ] }) : null,
    mode === "pollinate" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `pollination-demo pollination-step-${pollinationStep}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flower-label male-label", children: "Male flower" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flower-label female-label", children: "Female flower" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pollen-cluster male-pollen", "aria-label": "Pollen on male flower", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pollen-cluster carried-pollen", "aria-label": "Pollen carried by butterfly", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pollen-cluster female-pollen", "aria-label": "Pollen delivered to female flower", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
      ] })
    ] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flower-prop left-flower" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flower-prop right-flower" })
  ] });
};
var ButterflyLesson = ({ onHome, onComplete, warmupVideoUrl, onDraw, onBoard }) => {
  const [mode, setMode] = (0, import_react.useState)("warmup");
  const [selectedPart, setSelectedPart] = (0, import_react.useState)("wings");
  const [identified, setIdentified] = (0, import_react.useState)({});
  const [feedback, setFeedback] = (0, import_react.useState)(null);
  const [flapSpeed, setFlapSpeed] = (0, import_react.useState)("stop");
  const [pollinationStep, setPollinationStep] = (0, import_react.useState)(0);
  const [questionIndex, setQuestionIndex] = (0, import_react.useState)(0);
  const [quizFeedback, setQuizFeedback] = (0, import_react.useState)(null);
  const [storyQuestionIndex, setStoryQuestionIndex] = (0, import_react.useState)(0);
  const [storyCorrectAnswers, setStoryCorrectAnswers] = (0, import_react.useState)(0);
  const [storyFeedback, setStoryFeedback] = (0, import_react.useState)(null);
  const identifyTarget = (0, import_react.useMemo)(
    () => IDENTIFY_ORDER.find((part) => !identified[part]) ?? null,
    [identified]
  );
  const question = QUESTIONS[questionIndex];
  const storyQuestion = STORY_QUESTIONS[storyQuestionIndex];
  (0, import_react.useEffect)(() => {
    if (mode === "pollinate" && pollinationStep === 2) {
      onComplete?.();
    }
  }, [mode, pollinationStep, onComplete]);
  const selectMode = (nextMode) => {
    setMode(nextMode);
    if (nextMode === "code") {
      setSelectedPart("wings");
      setFlapSpeed("slow");
    }
    if (nextMode === "pollinate") {
      setSelectedPart("body");
      setFlapSpeed("slow");
    }
    if (nextMode === "identify") {
      setFlapSpeed("stop");
    }
    if (nextMode === "story") {
      setFlapSpeed("stop");
    }
    if (nextMode === "warmup") {
      setFlapSpeed("stop");
    }
  };
  const selectPart = (part) => {
    setSelectedPart(part);
    if (mode !== "identify" || !identifyTarget) {
      return;
    }
    const correct = part === identifyTarget;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) {
      setIdentified((existing) => ({ ...existing, [part]: true }));
    }
    window.setTimeout(() => setFeedback(null), correct ? 850 : 600);
  };
  const answerQuestion = (answerIndex) => {
    const correct = answerIndex === question.correctIndex;
    setQuizFeedback(correct ? "correct" : "wrong");
    window.setTimeout(() => {
      if (correct) {
        setQuestionIndex((existing) => (existing + 1) % QUESTIONS.length);
      }
      setQuizFeedback(null);
    }, correct ? 900 : 650);
  };
  const answerStoryQuestion = (answerIndex) => {
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
  const reset = () => {
    setMode("warmup");
    setSelectedPart("wings");
    setIdentified({});
    setFeedback(null);
    setFlapSpeed("stop");
    setPollinationStep(0);
    setQuestionIndex(0);
    setQuizFeedback(null);
    setStoryQuestionIndex(0);
    setStoryCorrectAnswers(0);
    setStoryFeedback(null);
  };
  const taskPart = mode === "identify" ? identifyTarget ?? selectedPart : selectedPart;
  const taskTitle = mode === "warmup" ? "Get ready to flutter." : mode === "story" ? "Watch the garden story." : mode === "identify" ? identifyTarget ? `Find the ${LABELS[identifyTarget].toLowerCase()}.` : "You found every butterfly part." : mode === "explore" ? `Explore the ${LABELS[selectedPart].toLowerCase()}.` : mode === "pollinate" ? "Move pollen from male to female." : "Code the butterfly wings.";
  const taskText = mode === "warmup" ? "Watch the warmup video, then press the Story tab to begin." : mode === "story" ? "Watch the video, then answer the story questions to discover what the garden needs." : mode === "identify" ? identifyTarget ? `Tap the ${LABELS[identifyTarget].toLowerCase()} on the butterfly.` : "Switch to Explore, Pollinate, or Code." : mode === "explore" ? FACTS[selectedPart] : mode === "pollinate" ? "Start at the male flower, carry pollen on the butterfly, then deliver it to the female flower." : "A button means slow flap. B means stop. A+B means fast flap.";
  const foundCount = IDENTIFY_ORDER.filter((part) => identified[part]).length;
  const bannerState = feedback ?? quizFeedback ?? storyFeedback;
  const bannerMessage = storyFeedback === "correct" ? "Great job! Keep watching closely." : storyFeedback === "wrong" ? "Try again. Use the story clue." : feedback === "correct" ? `Great job! You found the ${LABELS[selectedPart].toLowerCase()}.` : feedback === "wrong" ? `Try again. Find the ${identifyTarget ? LABELS[identifyTarget].toLowerCase() : "part"}.` : quizFeedback === "correct" ? "Great job! Keep learning." : quizFeedback === "wrong" ? "Try again. Look carefully." : mode === "code" ? `Wing speed: ${flapSpeed}.` : mode === "warmup" ? "Warm up and get ready to flutter!" : mode === "story" ? "Find out what the garden is missing." : mode === "pollinate" ? pollinationStep === 0 ? "Start on the male flower. Tap Move Pollen." : pollinationStep === 1 ? "Pollen sticks to the butterfly as it visits the flower." : "Pollen reaches the female flower and helps make seeds." : FACTS[selectedPart];
  const partRows = PARTS.map((part) => ({
    id: part,
    label: LABELS[part],
    active: selectedPart === part,
    done: Boolean(identified[part]),
    locked: mode === "identify" && !identified[part] && identifyTarget !== part,
    status: mode === "identify" ? identified[part] ? "Complete" : identifyTarget === part ? "Find" : "Locked" : mode === "explore" ? selectedPart === part ? "Reading" : "Explore" : "Learn",
    preview: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartPreview, { part })
  }));
  const trayParts = PARTS.map((part) => ({
    id: part,
    label: LABELS[part],
    active: selectedPart === part,
    preview: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartPreview, { part })
  }));
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "app-shell butterfly-app", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "sky-layer" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MissionHeader, { score: 120 + foundCount * 10, onDraw, onBoard }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeTabs, { tabs: MODE_TABS, activeMode: mode, onSelect: selectMode }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LessonStage, { children: mode === "warmup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarmupScreen, { videoUrl: warmupVideoUrl ?? content_default.warmupVideoUrl }) : mode === "story" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      StoryVideoCard,
      {
        title: "The Garden Needs Help",
        youtubeEmbedUrl: STORY_VIDEO_URL
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ButterflyStage,
      {
        activePart: selectedPart,
        mode,
        flapSpeed,
        pollinationStep,
        onPartSelect: selectPart
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { className: "task-column", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        TaskCard,
        {
          badge: "GUIDE",
          title: taskTitle,
          text: taskText,
          preview: mode === "story" || mode === "warmup" ? void 0 : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartPreview, { part: taskPart }),
          feedback: feedback === "wrong" ? "wrong" : null,
          onPreviewClick: () => selectPart(taskPart),
          children: [
            mode === "story" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "primary-action", onClick: () => selectMode("identify"), children: "Start Identifying" }) : null,
            mode === "code" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "code-buttons", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => setFlapSpeed("slow"), children: "A Slow" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => setFlapSpeed("stop"), children: "B Stop" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => setFlapSpeed("fast"), children: "A+B Fast" })
            ] }) : null,
            mode === "pollinate" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                className: "primary-action",
                onClick: () => {
                  setPollinationStep((step) => (step + 1) % 3);
                  setFlapSpeed("slow");
                },
                children: pollinationStep === 0 ? "Collect Pollen" : pollinationStep === 1 ? "Deliver Pollen" : "Reset Pollination"
              }
            ) : null
          ]
        }
      ),
      mode === "story" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        QuizCard,
        {
          prompt: storyQuestion.prompt,
          answers: storyQuestion.answers,
          indexLabel: `${storyQuestionIndex + 1}/${STORY_QUESTIONS.length}`,
          feedback: storyFeedback,
          success: storyQuestion.success,
          onAnswer: answerStoryQuestion
        }
      ) : mode === "warmup" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        QuizCard,
        {
          prompt: question.prompt,
          answers: question.answers,
          indexLabel: `${questionIndex + 1}/${QUESTIONS.length}`,
          feedback: quizFeedback,
          success: question.success,
          onAnswer: answerQuestion
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TipCard, { children: mode === "warmup" ? "Tip: Warm bodies learn best." : mode === "story" ? "Tip: Look for what the garden has and what it is missing." : "Tip: Butterflies and flowers help each other." })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { className: "progress-column", children: [
      mode === "story" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressCard, { done: storyCorrectAnswers, total: STORY_QUESTIONS.length, label: "answered" }) : mode === "warmup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressCard, { done: 0, total: 1, label: "warmup" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressCard, { done: foundCount, total: IDENTIFY_ORDER.length, label: "found" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartsList, { parts: partRows, onSelect: selectPart })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          className: "watch-button",
          onClick: () => {
            setMode("code");
            setSelectedPart("wings");
            setFlapSpeed((speed) => speed === "fast" ? "stop" : "fast");
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "watch-play", children: "PLAY" }),
            flapSpeed === "fast" ? "Stop Wings" : "Flap Wings"
          ]
        }
      )
    ] }),
    mode === "story" || mode === "warmup" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartsTray, { parts: trayParts, onSelect: selectPart }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedbackBanner, { message: bannerMessage, state: bannerState })
  ] });
};
var ButterflyLesson_default = ButterflyLesson;
export {
  ButterflyLesson,
  ButterflyLesson_default as default
};
