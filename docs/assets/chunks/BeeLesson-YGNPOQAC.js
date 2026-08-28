import {
  content_default
} from "./chunk-WI4WEKU7.js";
import {
  GenericLesson
} from "./chunk-UMMAZRAW.js";
import {
  Box3,
  BufferGeometry,
  Canvas,
  Color,
  Float32BufferAttribute,
  GLTFLoader,
  Group,
  Mesh,
  MeshStandardMaterial,
  ModelOrbitControls,
  SRGBColorSpace,
  StoryVideoCard,
  Vector3,
  WarmupScreen,
  useLoader
} from "./chunk-P5CB4QJJ.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-QP3GZB4W.js";

// src/lessons/bee/BeeStage.tsx
var import_react2 = __toESM(require_react());

// src/lessons/bee/BeeModel.tsx
var import_react = __toESM(require_react());

// src/lessons/bee/gltfSpecularGlossiness.ts
var NAME = "KHR_materials_pbrSpecularGlossiness";
var registerSpecularGlossiness = (loader) => {
  loader.register((parser) => {
    const p = parser;
    const getMaterialType = () => MeshStandardMaterial;
    const extendMaterialParams = async (materialIndex, materialParams) => {
      try {
        const materialDef = p.json.materials[materialIndex];
        const extensions = materialDef?.["extensions"];
        const sg = extensions?.[NAME];
        if (!sg) {
          return;
        }
        const diffuseFactor = sg.diffuseFactor ?? [1, 1, 1, 1];
        materialParams.color = new Color(
          diffuseFactor[0],
          diffuseFactor[1],
          diffuseFactor[2]
        );
        materialParams.opacity = diffuseFactor[3] ?? 1;
        materialParams.transparent = (diffuseFactor[3] ?? 1) < 1;
        materialParams.metalness = 0;
        materialParams.roughness = 1 - (sg.glossinessFactor ?? 1);
        if (sg.diffuseTexture && p.assignTexture) {
          await p.assignTexture(materialParams, "map", sg.diffuseTexture, SRGBColorSpace);
        }
      } catch {
      }
    };
    return { name: NAME, getMaterialType, extendMaterialParams };
  });
};

// src/lessons/bee/BeeModel.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime());
var BEE_PART_ORDER = ["head", "antennae", "wings", "body", "legs"];
var PART_HIGHLIGHT = {
  head: "#ffe155",
  antennae: "#ffb347",
  wings: "#7fd4ff",
  body: "#ffcf4a",
  legs: "#ff9c31"
};
var classifyBone = (name) => {
  const n = (name || "").toLowerCase();
  if (n.includes("antenna")) return "antennae";
  if (n.includes("wing")) return "wings";
  if (n.includes("leg")) return "legs";
  if (n.includes("head") || n.includes("mandib") || n.includes("labrum")) return "head";
  if (n.includes("thorax") || n.includes("body") || n.includes("abdomen")) return "body";
  return null;
};
var bakeGeometry = (source) => {
  const geometry = source.geometry.clone();
  const position = geometry.getAttribute("position");
  const skinned = source;
  const vertex = new Vector3();
  if (position && skinned.isSkinnedMesh) {
    skinned.skeleton?.update();
    for (let index = 0; index < position.count; index += 1) {
      vertex.fromBufferAttribute(position, index);
      skinned.applyBoneTransform?.(index, vertex);
      vertex.applyMatrix4(source.matrixWorld);
      position.setXYZ(index, vertex.x, vertex.y, vertex.z);
    }
    position.needsUpdate = true;
  } else {
    geometry.applyMatrix4(source.matrixWorld);
  }
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
};
var partWeightsForVertex = (skin, boneNames, vertexIndex) => {
  const acc = /* @__PURE__ */ new Map();
  for (let k = 0; k < 4; k += 1) {
    const boneIndex = skin.index.array[vertexIndex * 4 + k];
    const weight = skin.weight.array[vertexIndex * 4 + k];
    if (weight <= 0 || boneIndex >= boneNames.length) {
      continue;
    }
    const part = classifyBone(boneNames[boneIndex]);
    if (part) {
      acc.set(part, (acc.get(part) ?? 0) + weight);
    }
  }
  return acc;
};
var splitByPart = (geometry, skin, boneNames) => {
  const index = geometry.getIndex();
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const uv = geometry.getAttribute("uv");
  const triangleCount = index ? index.count / 3 : position.count / 3;
  const buckets = {
    head: { pos: [], nor: [], uv: [] },
    antennae: { pos: [], nor: [], uv: [] },
    wings: { pos: [], nor: [], uv: [] },
    body: { pos: [], nor: [], uv: [] },
    legs: { pos: [], nor: [], uv: [] }
  };
  for (let t = 0; t < triangleCount; t += 1) {
    const ia = index ? index.getX(t * 3) : t * 3;
    const ib = index ? index.getX(t * 3 + 1) : t * 3 + 1;
    const ic = index ? index.getX(t * 3 + 2) : t * 3 + 2;
    const totals = /* @__PURE__ */ new Map();
    for (const vi of [ia, ib, ic]) {
      for (const [part, w] of partWeightsForVertex(skin, boneNames, vi)) {
        totals.set(part, (totals.get(part) ?? 0) + w);
      }
    }
    let best = null;
    let bestWeight = 0;
    for (const [part, w] of totals) {
      if (w > bestWeight) {
        best = part;
        bestWeight = w;
      }
    }
    if (!best) {
      continue;
    }
    const bucket = buckets[best];
    for (const vi of [ia, ib, ic]) {
      bucket.pos.push(position.getX(vi), position.getY(vi), position.getZ(vi));
      if (normal) {
        bucket.nor.push(normal.getX(vi), normal.getY(vi), normal.getZ(vi));
      }
      if (uv) {
        bucket.uv.push(uv.getX(vi), uv.getY(vi));
      }
    }
  }
  const result = {};
  for (const part of BEE_PART_ORDER) {
    const bucket = buckets[part];
    if (bucket.pos.length === 0) {
      continue;
    }
    const partGeometry = new BufferGeometry();
    partGeometry.setAttribute("position", new Float32BufferAttribute(bucket.pos, 3));
    if (bucket.nor.length > 0) {
      partGeometry.setAttribute("normal", new Float32BufferAttribute(bucket.nor, 3));
    }
    if (bucket.uv.length > 0) {
      partGeometry.setAttribute("uv", new Float32BufferAttribute(bucket.uv, 2));
    }
    partGeometry.computeVertexNormals();
    partGeometry.computeBoundingBox();
    partGeometry.computeBoundingSphere();
    result[part] = partGeometry;
  }
  return result;
};
var useBeeParts = (gltf) => {
  return (0, import_react.useMemo)(() => {
    const cloned = gltf.scene.clone(true);
    cloned.updateMatrixWorld(true);
    const meshes = {};
    const visibleBox = new Box3();
    let baseMaterial = null;
    cloned.traverse((child) => {
      const mesh = child;
      if (!mesh.isMesh) {
        return;
      }
      const geometry = bakeGeometry(mesh);
      const skinIndex = geometry.getAttribute("skinIndex");
      const skinWeight = geometry.getAttribute("skinWeight");
      if (skinIndex && skinWeight && mesh.skeleton?.bones.length) {
        const boneNames = mesh.skeleton.bones.map((b) => b.name || "");
        const parts = splitByPart(geometry, { index: skinIndex, weight: skinWeight }, boneNames);
        for (const part of BEE_PART_ORDER) {
          const partGeometry = parts[part];
          if (!partGeometry) {
            continue;
          }
          const partMesh = new Mesh(partGeometry, mesh.material);
          partMesh.name = part;
          partMesh.castShadow = true;
          partMesh.receiveShadow = true;
          partMesh.frustumCulled = false;
          meshes[part] = partMesh;
          visibleBox.union(new Box3().setFromObject(partMesh));
        }
        baseMaterial = mesh.material;
      } else {
        const partMesh = new Mesh(geometry, mesh.material);
        partMesh.name = "body";
        partMesh.castShadow = true;
        partMesh.receiveShadow = true;
        partMesh.frustumCulled = false;
        meshes.body = partMesh;
        visibleBox.union(new Box3().setFromObject(partMesh));
        baseMaterial = mesh.material;
      }
    });
    const box = visibleBox.isEmpty() ? new Box3() : visibleBox;
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);
    const scale = 3.2 / Math.max(size.x, size.y, size.z);
    const group = new Group();
    group.scale.setScalar(scale);
    group.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    for (const part of BEE_PART_ORDER) {
      const m = meshes[part];
      if (m) {
        group.add(m);
      }
    }
    return { group, meshes, baseMaterial, center, scale };
  }, [gltf.scene]);
};
var makeHighlightedMaterial = (base, part, active) => {
  if (!base) {
    return null;
  }
  const source = Array.isArray(base) ? base[0] : base;
  const material = source.clone();
  if ("emissive" in material) {
    material.emissive = new Color(active ? PART_HIGHLIGHT[part] : "#000000");
    material.emissiveIntensity = active ? 0.6 : 0;
  }
  return material;
};
var BeeModel = ({ highlightedPart, mode, activityStep, activityDone, onPartSelect }) => {
  const gltf = useLoader(GLTFLoader, "models/bee.glb", (loader) => {
    registerSpecularGlossiness(loader);
  });
  const { group, meshes, baseMaterial } = useBeeParts(gltf);
  (0, import_react.useEffect)(() => {
    for (const part of BEE_PART_ORDER) {
      const mesh = meshes[part];
      if (!mesh) {
        continue;
      }
      const material = makeHighlightedMaterial(baseMaterial, part, part === highlightedPart);
      if (material) {
        mesh.material = material;
      }
    }
  }, [baseMaterial, highlightedPart, meshes]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "primitive",
    {
      object: group,
      onClick: (event) => {
        event.stopPropagation();
        const part = event.object.name;
        if (BEE_PART_ORDER.includes(part)) {
          onPartSelect(part);
        }
      }
    }
  ) });
};
var BeeCanvas = ({ highlightedPart, mode, activityStep, activityDone, onPartSelect }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
  Canvas,
  {
    camera: { position: [0, 0.4, 5.6], fov: 30, near: 0.1, far: 100 },
    dpr: [1, 1.5],
    gl: { antialias: false },
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: 0.7 }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { intensity: 0.75, groundColor: "#5b7a99" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", { position: [5, 6, 5], intensity: 1.45 }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", { position: [-4, 2, -4], intensity: 0.35, color: "#a4c2ff" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        ModelOrbitControls,
        {
          zoomEnabled: mode === "identify",
          rotateEnabled: mode === "explore",
          target: [0, 0.35, 0],
          minDistance: 3.5,
          maxDistance: 14
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        BeeModel,
        {
          highlightedPart,
          mode,
          activityStep,
          activityDone,
          onPartSelect
        }
      )
    ]
  }
);

// src/lessons/bee/BeeStage.tsx
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
var BeeErrorBoundary = class extends import_react2.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
};
var BeeStage = ({ activePart, lastSelectedPart, onSelect, mode, warmupVideoUrl, activityDone, completeActivity }) => {
  const [webGLAvailable] = (0, import_react2.useState)(hasWebGLSupport);
  if (mode === "warmup") {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(WarmupScreen, { videoUrl: warmupVideoUrl });
  }
  if (mode === "story") {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(StoryVideoCard, { title: content_default.title, youtubeEmbedUrl: content_default.storyVideoUrl });
  }
  if (!webGLAvailable) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "generic-stage", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bee-no-webgl", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: "The bee needs WebGL." }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Enable graphics acceleration in Chrome, or use Firefox." })
    ] }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "generic-stage bee-model-stage", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      BeeErrorBoundary,
      {
        fallback: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bee-no-webgl", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: "The bee model failed to load." }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Check the browser console for details." })
        ] }),
        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_react2.Suspense, { fallback: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "bee-loading", children: "Loading bee\u2026" }), children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            BeeCanvas,
            {
              highlightedPart: mode === "identify" ? lastSelectedPart : mode === "explore" ? activePart : null,
              mode,
              activityStep: 0,
              activityDone,
              onPartSelect: onSelect
            }
          ),
          "        "
        ] })
      }
    ),
    mode === "activity" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bee-activity-controls", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "bee-activity-legend", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "\u{1F338} Flower" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "\u{1F3E0} Hive" })
      ] }),
      activityDone ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "bee-activity-done", children: "Pollen delivered! The hive is stocked." }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { className: "primary-action", onClick: completeActivity, children: "Complete Activity" })
    ] }) : null
  ] });
};
var BeePartPreview = ({ part }) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "generic-part-preview", "aria-hidden": "true", children: [
  part === "head" ? "\u{1F41D}" : null,
  part === "antennae" ? "^^" : null,
  part === "wings" ? "\u{1FABD}" : null,
  part === "body" ? "\u{1F7E1}" : null,
  part === "legs" ? "\u{1F9B5}" : null
] });

// src/lessons/bee/BeeLesson.tsx
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
var BeeLesson = ({ onHome, onComplete, warmupVideoUrl, onDraw, onBoard }) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
    stage: (props) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(BeeStage, { ...props, mode: props.mode }),
    partPreview: (part) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(BeePartPreview, { part })
  }
);
var BeeLesson_default = BeeLesson;
export {
  BeeLesson,
  BeeLesson_default as default
};
