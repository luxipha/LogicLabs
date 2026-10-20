import React, {useMemo} from 'react';
import {useLoader, type ThreeEvent} from '@react-three/fiber';
import {Box3, Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

const markers = [
  {id: 'sensor', position: [-.061, .055, 0]},
  {id: 'controller', position: [.12, .034, 0]},
  {id: 'wires', position: [.055, .092, .025]},
  {id: 'wheels', position: [.033, -.008, .072]},
] as const;

export const UltrasonicRobot: React.FC<{identify: boolean; selected: string | null; onSelect: (id: string) => void}> = ({identify, selected, onSelect}) => {
  const gltf = useLoader(GLTFLoader, 'models/ultrasonic-classroom.glb');
  const model = useMemo(() => {
    const scene = gltf.scene.clone(true); scene.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(scene), center = bounds.getCenter(new Vector3());
    return {scene, center, scale: 3.6 / Math.max(...bounds.getSize(new Vector3()).toArray())};
  }, [gltf]);
  const selectMesh = (e: ThreeEvent<MouseEvent>) => {
    if (!identify || e.delta > 5) return;
    e.stopPropagation();
    const name = e.object.name;
    // Source mesh names and world bounds were inspected. Do not classify generic materials.
    if (/PLACA_AZUL|GRADE_PRETA|_METAL_0|_laranja_0/.test(name)) onSelect('sensor');
    else if (/PCB_topo|PCB_BASE/.test(name)) onSelect('controller');
    else if (/Jumper/.test(name)) onSelect('wires');
    else if (/Roda004_Material09[67]/.test(name)) onSelect('wheels');
  };
  return <group scale={model.scale}>
    <group position={model.center.clone().negate()}>
      <primitive object={model.scene} dispose={null} onClick={selectMesh}/>
      {identify ? markers.map(marker => <mesh key={marker.id} position={[...marker.position]} renderOrder={10} onClick={e => {if (e.delta > 5) return; e.stopPropagation(); onSelect(marker.id);}}>
        <sphereGeometry args={[.005, 12, 8]}/><meshBasicMaterial depthTest={false} color={selected === marker.id ? '#ffcb48' : '#12af8a'}/>
      </mesh>) : null}
    </group>
  </group>;
};
