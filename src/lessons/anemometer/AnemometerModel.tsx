import React, {Suspense, useEffect, useMemo, useRef} from 'react';
import {Canvas, useFrame, useLoader, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

const modelUrl = new URL('models/cup_anemometer_and_wind_vane.glb', document.baseURI).href;
const center = new THREE.Vector3(1.866066, 8.866, -3.681153);

function Model({wind, selected, onSelect}: {wind: number; selected?: string | null; onSelect?: (id: string) => void}) {
  const gltf = useLoader(GLTFLoader, modelUrl);
  const rotor = useRef<THREE.Group>(null);
  const invalidate = useThree(s => s.invalidate);
  const parts = useMemo(() => {
    const source = gltf.scene.clone(true);
    source.updateMatrixWorld(true);
    const positions: Record<string, number[]> = {cups: [], arms: [], shaft: [], vane: []};
    source.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const geometry = object.geometry;
      const position = geometry.attributes.position;
      for (let i = 0; i < (geometry.index?.count ?? position.count); i += 3) {
        const vertices = [0, 1, 2].map(j => new THREE.Vector3().fromBufferAttribute(position, geometry.index ? geometry.index.getX(i + j) : i + j).applyMatrix4(object.matrixWorld));
        // Inspected source: dishes are separate meshes. The combined mesh has
        // rotor arms above y=8.84, the vane at 8.52–8.70, and a narrow shaft.
        const shaft = vertices.every(v => Math.abs(v.x - center.x) < .031 && Math.abs(v.z - center.z) < .031);
        const id = object.name.startsWith('dish') ? 'cups' : shaft ? 'shaft' : vertices.every(v => v.y > 8.84) ? 'arms' : 'vane';
        vertices.forEach(v => positions[id].push(...v.sub(center).multiplyScalar(6).toArray()));
      }
    });
    return Object.entries(positions).map(([id, values]) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(values, 3));
      geometry.computeVertexNormals();
      return {id, geometry};
    });
  }, [gltf]);
  useEffect(() => () => parts.forEach(p => p.geometry.dispose()), [parts]);
  useEffect(() => {invalidate();}, [wind, invalidate]);
  useFrame((_, delta) => {
    if (wind && rotor.current) {rotor.current.rotation.y += Math.min(delta, .05) * (wind === 2 ? 4 : 1); invalidate();}
  });
  const mesh = ({id, geometry}: typeof parts[number]) => <mesh key={id} geometry={geometry} onClick={e => {e.stopPropagation(); onSelect?.(id);}}>
    <meshStandardMaterial color={selected === id ? '#ffbf47' : '#586c78'} metalness={.55} roughness={.36} side={THREE.DoubleSide} />
  </mesh>;
  return <group position={[0, 1.7, 0]}><group ref={rotor}>{parts.filter(p => p.id === 'cups' || p.id === 'arms').map(mesh)}</group>{parts.filter(p => p.id !== 'cups' && p.id !== 'arms').map(mesh)}</group>;
}

export function AnemometerModel(props: {wind: number; selected?: string | null; onSelect?: (id: string) => void}) {
  return <Suspense fallback={<div className="anemo-loading">Loading anemometer…</div>}>
    <Canvas dpr={1} frameloop="demand" gl={{antialias: false, powerPreference: 'low-power'}} camera={{position: [5, 3.2, 6], fov: 40}}>
      <color attach="background" args={['#edf3f5']} /><hemisphereLight args={['#ffffff', '#a3b1bd', 2.8]} /><directionalLight position={[3, 6, 4]} intensity={3} />
      <Model {...props} />
      <ModelOrbitControls dampingEnabled={false} zoomEnabled rotateEnabled target={[0, 0, 0]} minDistance={4} maxDistance={12} syncInitialTarget />
    </Canvas>
  </Suspense>;
}
