import React, {useMemo} from 'react';
import {Canvas, useLoader, type ThreeEvent} from '@react-three/fiber';
import type {Mesh, Object3D} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

export type PrinterPartId = 'casing' | 'scanner' | 'controls' | 'output';

const MODEL_URL = 'models/printer.glb';
const MODEL_SCALE = 5.4;
const MODEL_CENTER: [number, number, number] = [0.22804085, 0.1194421, -0.09884719];

const PART_COLOR: Record<PrinterPartId, string> = {
  casing: '#9f7aea',
  scanner: '#60a5fa',
  controls: '#f9c74f',
  output: '#45c99a',
};

const PART_ZONES: Array<{
  id: PrinterPartId;
  position: [number, number, number];
  size: [number, number, number];
}> = [
  {id: 'casing', position: [0.228, 0.105, -0.1], size: [0.52, 0.2, 0.28]},
  {id: 'scanner', position: [0.228, 0.18, -0.32], size: [0.28, 0.13, 0.21]},
  {id: 'controls', position: [0.23, 0.225, -0.12], size: [0.41, 0.035, 0.22]},
  {id: 'output', position: [0.228, 0.035, 0.08], size: [0.37, 0.055, 0.3]},
];

const partForNode = (name: string): PrinterPartId | null => {
  if (name === 'Processing_Unit_0') return 'casing';
  if (name === 'Scan_Slot_16') return 'scanner';
  if (name === 'Print_Unit_17') return 'output';
  if (/^(Power_Button|Button|Numeric_Buttons|Indicators|Screen)/.test(name)) return 'controls';
  return null;
};

const PrinterLights: React.FC = () => (
  <>
    <ambientLight intensity={1.05} />
    <hemisphereLight intensity={0.9} groundColor="#6f7891" />
    <directionalLight position={[6, 8, 5]} intensity={1.5} />
    <directionalLight position={[-4, 3, -4]} intensity={0.35} color="#b9d9ff" />
  </>
);

export const PrinterModel: React.FC<{
  highlightedPart?: PrinterPartId | null;
  selectable?: boolean;
  onPartSelect?: (part: PrinterPartId) => void;
}> = ({highlightedPart = null, selectable = false, onPartSelect}) => {
  const gltf = useLoader(GLTFLoader, MODEL_URL);
  const model = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child: Object3D) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.frustumCulled = false;
    });
    return clone;
  }, [gltf.scene]);

  const selectFromModel = (event: ThreeEvent<MouseEvent>) => {
    let target: Object3D | null = event.object;
    while (target) {
      const part = partForNode(target.name);
      if (part) {
        event.stopPropagation();
        onPartSelect?.(part);
        return;
      }
      target = target.parent;
    }
  };

  return (
    <group
      scale={MODEL_SCALE}
      position={[-MODEL_CENTER[0] * MODEL_SCALE, -MODEL_CENTER[1] * MODEL_SCALE, -MODEL_CENTER[2] * MODEL_SCALE]}
    >
      <primitive object={model} onClick={selectable ? selectFromModel : undefined} />
      {selectable && highlightedPart
        ? PART_ZONES.filter((zone) => zone.id === highlightedPart).map((zone) => (
            <mesh key={zone.id} position={zone.position}>
              <boxGeometry args={zone.size} />
              <meshStandardMaterial
                color={PART_COLOR[zone.id]}
                emissive={PART_COLOR[zone.id]}
                emissiveIntensity={0.72}
                transparent
                opacity={0.38}
                depthWrite={false}
              />
            </mesh>
          ))
        : null}
    </group>
  );
};

export const PrinterCanvas: React.FC<{
  mode: 'explore' | 'identify';
  highlightedPart: PrinterPartId | null;
  onPartSelect: (part: PrinterPartId) => void;
}> = ({mode, highlightedPart, onPartSelect}) => (
  <Canvas
    className="printer-canvas"
    camera={{position: [4.4, 2.7, 5.2], fov: 32, near: 0.1, far: 100}}
    dpr={1}
    frameloop="demand"
    gl={{alpha: true, antialias: false, powerPreference: 'low-power'}}
  >
    <color attach="background" args={['#e9e4f8']} />
    <PrinterLights />
    <mesh position={[0, -0.78, 0]}>
      <cylinderGeometry args={[2.65, 2.65, 0.16, 48]} />
      <meshStandardMaterial color="#c9c1dc" roughness={0.88} />
    </mesh>
    <PrinterModel
      highlightedPart={highlightedPart}
      selectable={mode === 'identify'}
      onPartSelect={onPartSelect}
    />
    <ModelOrbitControls dampingEnabled={false} zoomEnabled rotateEnabled target={[0, -0.05, 0]} minDistance={4.4} maxDistance={10} />
  </Canvas>
);

export {PrinterLights};
