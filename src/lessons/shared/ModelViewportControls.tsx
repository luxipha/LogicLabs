import React, {useEffect, useRef} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

export const ModelOrbitControls: React.FC<{
  dampingEnabled?: boolean;
  zoomEnabled: boolean;
  rotateEnabled: boolean;
  target: [number, number, number];
  minDistance: number;
  maxDistance: number;
  syncInitialTarget?: boolean;
}> = ({dampingEnabled = true, zoomEnabled, rotateEnabled, target, minDistance, maxDistance, syncInitialTarget = false}) => {
  const {camera, gl, invalidate} = useThree();
  const controlsRef = useRef<OrbitControls | null>(null);
  const [targetX, targetY, targetZ] = target;

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = dampingEnabled;
    controls.enablePan = false;
    controls.enableZoom = zoomEnabled;
    controls.enableRotate = rotateEnabled;
    controls.minDistance = minDistance;
    controls.maxDistance = maxDistance;
    controls.rotateSpeed = 0.7;
    controls.target.set(targetX, targetY, targetZ);
    // OrbitControls is constructed looking at its default origin. Some
    // constrained Identify views have an intentional off-origin target, so
    // apply it before the first frame rather than leaving the model low until
    // a gesture changes the camera.
    if (syncInitialTarget) controls.update();
    controls.enabled = true;
    const handleChange = () => invalidate();
    controls.addEventListener('change', handleChange);
    controlsRef.current = controls;
    return () => {
      controls.removeEventListener('change', handleChange);
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, dampingEnabled, gl.domElement, invalidate, maxDistance, minDistance, rotateEnabled, syncInitialTarget, targetX, targetY, targetZ, zoomEnabled]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enableZoom = zoomEnabled;
      controlsRef.current.enableRotate = rotateEnabled;
    }
  }, [rotateEnabled, zoomEnabled]);

  useFrame(() => {
    if (dampingEnabled) controlsRef.current?.update();
  });

  return null;
};
