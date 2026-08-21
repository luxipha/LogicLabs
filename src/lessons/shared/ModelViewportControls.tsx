import React, {useEffect, useRef} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

export const ModelOrbitControls: React.FC<{
  zoomEnabled: boolean;
  rotateEnabled: boolean;
  target: [number, number, number];
  minDistance: number;
  maxDistance: number;
}> = ({zoomEnabled, rotateEnabled, target, minDistance, maxDistance}) => {
  const {camera, gl} = useThree();
  const controlsRef = useRef<OrbitControls | null>(null);
  const [targetX, targetY, targetZ] = target;

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = zoomEnabled;
    controls.enableRotate = rotateEnabled;
    controls.minDistance = minDistance;
    controls.maxDistance = maxDistance;
    controls.rotateSpeed = 0.7;
    controls.target.set(targetX, targetY, targetZ);
    controls.enabled = true;
    controlsRef.current = controls;
    return () => {
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl.domElement, maxDistance, minDistance, rotateEnabled, targetX, targetY, targetZ, zoomEnabled]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enableZoom = zoomEnabled;
      controlsRef.current.enableRotate = rotateEnabled;
    }
  }, [rotateEnabled, zoomEnabled]);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return null;
};
