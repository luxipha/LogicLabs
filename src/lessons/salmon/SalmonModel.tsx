import React, {useEffect} from 'react';
import {Canvas, useFrame, useLoader} from '@react-three/fiber';
import {AnimationMixer} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

// Relative so it works both at localhost root and under the /LogicLabs/ Pages base.
const MODEL_URL = 'models/salmon.glb';

const SalmonObject: React.FC<{animated: boolean}> = ({animated}) => {
  const gltf = useLoader(GLTFLoader, MODEL_URL);
  const mixer = React.useMemo(() => new AnimationMixer(gltf.scene), [gltf.scene]);
  useEffect(() => {
    const action = gltf.animations[0] ? mixer.clipAction(gltf.animations[0]) : null;
    if (!action) return;
    if (animated) {
      action.reset().fadeIn(0.25).play();
      return () => { action.fadeOut(0.2); mixer.stopAllAction(); };
    }
    action.stop();
  }, [gltf.animations, mixer, animated]);
  useFrame((_, delta) => { if (animated) mixer.update(delta); });
  // The supplied GLB is authored at roughly 0.17 world units long. This
  // Match the source viewer's large, readable presentation while retaining a
  // small margin around the complete fish.
  return <primitive object={gltf.scene} scale={36} rotation={[0, Math.PI / 2, 0]} />;
};

export const SalmonCanvas: React.FC<{animated?: boolean}> = ({animated = true}) => (
  <Canvas camera={{position: [0, 0.12, 3.2], fov: 34}} dpr={1} frameloop={animated ? 'always' : 'demand'} gl={{antialias: false, powerPreference: 'low-power'}}>
    <ambientLight intensity={1.7} />
    <directionalLight position={[3, 5, 4]} intensity={2.4} />
    <directionalLight position={[-3, 1, -2]} intensity={0.8} color="#79cfff" />
    <SalmonObject animated={animated} />
    <ModelOrbitControls zoomEnabled rotateEnabled target={[0, 0, 0]} minDistance={1.1} maxDistance={6.5} />
  </Canvas>
);
