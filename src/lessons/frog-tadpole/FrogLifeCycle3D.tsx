import React, {useMemo, useRef} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import {CatmullRomCurve3, DoubleSide, Shape, Vector3, type Group} from 'three';
import type {LifeCycleStage} from '../../app/types';
import {ModelOrbitControls} from '../shared/ModelViewportControls';

const skinGreen = '#568b3c';
const skinLight = '#83aa58';
const skinDark = '#304f27';
const tadpoleBody = '#5c5538';
const tadpoleBelly = '#8c835d';

const TadpoleEye: React.FC<{position: [number, number, number]}> = ({position}) => (
  <group position={position}>
    <mesh scale={[1, 0.9, 0.55]}>
      <sphereGeometry args={[0.105, 24, 20]} />
      <meshPhysicalMaterial color="#b9a96c" roughness={0.4} clearcoat={0.35} />
    </mesh>
    <mesh position={[0.018, 0.005, 0.057]} scale={[1, 0.92, 0.5]}>
      <sphereGeometry args={[0.064, 20, 16]} />
      <meshStandardMaterial color="#11150f" roughness={0.25} />
    </mesh>
    <mesh position={[0.038, 0.032, 0.088]}>
      <sphereGeometry args={[0.014, 12, 12]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
  </group>
);

const FrogEye: React.FC<{position: [number, number, number]}> = ({position}) => (
  <group position={position}>
    <mesh scale={[1, 0.92, 0.76]}>
      <sphereGeometry args={[0.18, 28, 24]} />
      <meshPhysicalMaterial color="#9cad55" roughness={0.42} clearcoat={0.25} />
    </mesh>
    <mesh position={[0.015, 0.012, 0.145]} scale={[0.48, 0.78, 0.28]}>
      <sphereGeometry args={[0.16, 24, 20]} />
      <meshStandardMaterial color="#151811" roughness={0.2} />
    </mesh>
    <mesh position={[0.045, 0.06, 0.178]}>
      <sphereGeometry args={[0.025, 12, 12]} />
      <meshBasicMaterial color="#f7fff2" />
    </mesh>
  </group>
);

const TadpoleTail: React.FC<{short?: boolean}> = ({short = false}) => {
  const curve = useMemo(
    () => new CatmullRomCurve3([
      new Vector3(-0.48, -0.02, 0),
      new Vector3(-0.92, 0.03, 0),
      new Vector3(-1.38, 0.18, 0),
      new Vector3(-1.82, 0.08, 0),
      new Vector3(-2.18, -0.12, 0),
    ]),
    [],
  );
  const fin = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-0.42, 0.08);
    shape.bezierCurveTo(-0.9, 0.42, -1.62, 0.48, -2.24, -0.1);
    shape.bezierCurveTo(-1.66, -0.42, -0.92, -0.29, -0.42, -0.08);
    shape.closePath();
    return shape;
  }, []);

  return (
    <group scale={short ? 0.48 : 1} position={short ? [-0.12, 0, 0] : [0, 0, 0]}>
      <mesh position={[0, 0, -0.015]}>
        <shapeGeometry args={[fin, 28]} />
        <meshPhysicalMaterial
          color="#9b956b"
          transparent
          opacity={0.62}
          roughness={0.5}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <tubeGeometry args={[curve, 56, 0.15, 18, false]} />
        <meshPhysicalMaterial color={tadpoleBody} roughness={0.56} clearcoat={0.18} />
      </mesh>
    </group>
  );
};

const Embryo: React.FC<{rotation: number}> = ({rotation}) => {
  const curve = useMemo(
    () => new CatmullRomCurve3([
      new Vector3(0.1, 0.02, 0.05),
      new Vector3(0.02, 0.1, 0.06),
      new Vector3(-0.1, 0.07, 0.04),
      new Vector3(-0.13, -0.04, 0.02),
      new Vector3(-0.03, -0.12, 0),
    ]),
    [],
  );
  return (
    <group rotation={[0, 0, rotation]}>
      <mesh>
        <tubeGeometry args={[curve, 20, 0.045, 10, false]} />
        <meshStandardMaterial color="#374431" roughness={0.72} />
      </mesh>
      <mesh position={[0.105, 0.025, 0.055]} scale={[1.2, 0.9, 0.8]}>
        <sphereGeometry args={[0.07, 18, 16]} />
        <meshStandardMaterial color="#2e392b" roughness={0.7} />
      </mesh>
    </group>
  );
};

const Eggs: React.FC = () => {
  const positions: Array<[number, number, number]> = [
    [-0.56, 0.08, 0.02], [-0.12, 0.3, -0.04], [0.38, 0.2, 0.05],
    [0.62, -0.2, -0.02], [0.08, -0.34, 0.12], [-0.43, -0.31, 0.1],
    [0.05, -0.02, 0.42],
  ];
  return (
    <group rotation={[-0.12, -0.18, 0]}>
      {positions.map((position, index) => (
        <group key={index} position={position}>
          <mesh>
            <sphereGeometry args={[0.34, 30, 26]} />
            <meshPhysicalMaterial
              color="#d9f1d5"
              transparent
              opacity={0.38}
              roughness={0.08}
              transmission={0.32}
              thickness={0.25}
              clearcoat={0.7}
              depthWrite={false}
            />
          </mesh>
          <Embryo rotation={index * 0.82} />
        </group>
      ))}
    </group>
  );
};

const GrowingHindLeg: React.FC<{
  position: [number, number, number];
  mirrored?: boolean;
  size?: number;
}> = ({position, mirrored = false, size = 1}) => (
  <group position={position} scale={[size, size, mirrored ? -size : size]}>
    <mesh position={[-0.05, -0.18, 0.12]} rotation={[0.5, 0.05, -0.42]}>
      <capsuleGeometry args={[0.09, 0.32, 8, 18]} />
      <meshPhysicalMaterial color={skinGreen} roughness={0.64} clearcoat={0.12} />
    </mesh>
    <mesh position={[-0.24, -0.42, 0.22]} rotation={[0.18, 0.08, 0.72]}>
      <capsuleGeometry args={[0.07, 0.3, 8, 16]} />
      <meshPhysicalMaterial color={skinLight} roughness={0.68} />
    </mesh>
  </group>
);

const Tadpole: React.FC<{withLegs?: boolean}> = ({withLegs = false}) => (
  <group rotation={[0.04, -0.12, -0.04]}>
    <TadpoleTail />
    <mesh scale={[0.98, 0.62, 0.5]}>
      <sphereGeometry args={[0.72, 42, 34]} />
      <meshPhysicalMaterial color={tadpoleBody} roughness={0.53} clearcoat={0.2} />
    </mesh>
    <mesh position={[0.18, -0.24, 0.02]} scale={[0.72, 0.3, 0.6]}>
      <sphereGeometry args={[0.62, 32, 24]} />
      <meshStandardMaterial color={tadpoleBelly} roughness={0.7} />
    </mesh>
    <TadpoleEye position={[0.44, 0.19, 0.36]} />
    <mesh position={[0.5, -0.035, 0.44]} rotation={[0, 0, 0.15]}>
      <torusGeometry args={[0.1, 0.012, 8, 26, Math.PI * 0.8]} />
      <meshStandardMaterial color="#393521" roughness={0.7} />
    </mesh>
    <mesh position={[-0.15, 0.28, 0.38]} scale={[0.22, 0.05, 0.04]}>
      <sphereGeometry args={[1, 20, 16]} />
      <meshStandardMaterial color="#817854" roughness={0.75} />
    </mesh>
    {withLegs ? (
      <>
        <GrowingHindLeg position={[-0.2, -0.27, 0.28]} size={0.95} />
        <GrowingHindLeg position={[-0.2, -0.27, -0.28]} mirrored size={0.95} />
      </>
    ) : null}
  </group>
);

const FrogLeg: React.FC<{
  position: [number, number, number];
  mirrored?: boolean;
  front?: boolean;
}> = ({position, mirrored = false, front = false}) => {
  const zScale = mirrored ? -1 : 1;
  const scale = front ? 0.72 : 1;
  return (
    <group position={position} scale={[scale, scale, zScale * scale]}>
      <mesh position={front ? [0.08, -0.25, 0.2] : [-0.16, -0.18, 0.22]} rotation={[0.44, 0.08, front ? -0.12 : -0.58]}>
        <capsuleGeometry args={[front ? 0.09 : 0.14, front ? 0.48 : 0.64, 8, 20]} />
        <meshPhysicalMaterial color={skinGreen} roughness={0.58} clearcoat={0.18} />
      </mesh>
      <mesh position={front ? [0.02, -0.64, 0.31] : [-0.57, -0.45, 0.38]} rotation={[0.18, 0.12, front ? 0.08 : 0.78]}>
        <capsuleGeometry args={[front ? 0.065 : 0.1, front ? 0.42 : 0.58, 8, 18]} />
        <meshStandardMaterial color={skinLight} roughness={0.67} />
      </mesh>
      <group position={front ? [0.08, -0.89, 0.38] : [-0.82, -0.68, 0.48]}>
        {[-0.13, 0, 0.13].map((offset) => (
          <mesh key={offset} position={[front ? 0.14 : -0.12, 0, offset]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.025, 0.2, 5, 10]} />
            <meshStandardMaterial color="#789f4f" roughness={0.76} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const Frog: React.FC<{froglet?: boolean}> = ({froglet = false}) => (
  <group rotation={[0.02, -0.18, 0]} scale={froglet ? 0.9 : 1}>
    <mesh position={[-0.2, -0.04, 0]} scale={[1.12, 0.66, 0.72]}>
      <sphereGeometry args={[0.68, 42, 34]} />
      <meshPhysicalMaterial color={skinGreen} roughness={0.55} clearcoat={0.16} />
    </mesh>
    <mesh position={[0.43, 0.24, 0]} scale={[0.92, 0.65, 0.72]}>
      <sphereGeometry args={[0.58, 42, 34]} />
      <meshPhysicalMaterial color={skinLight} roughness={0.54} clearcoat={0.18} />
    </mesh>
    <mesh position={[0.34, -0.2, 0.35]} scale={[0.7, 0.42, 0.12]}>
      <sphereGeometry args={[0.55, 28, 22]} />
      <meshStandardMaterial color="#c4c98b" roughness={0.74} />
    </mesh>
    <FrogEye position={[0.57, 0.57, 0.37]} />
    <FrogEye position={[0.57, 0.57, -0.37]} />
    <FrogLeg position={[-0.45, -0.34, 0.34]} />
    <FrogLeg position={[-0.45, -0.34, -0.34]} mirrored />
    <FrogLeg position={[0.42, -0.34, 0.29]} front />
    <FrogLeg position={[0.42, -0.34, -0.29]} mirrored front />
    {froglet ? <TadpoleTail short /> : null}
    {[[-0.25, 0.32, 0.54], [0.02, 0.4, 0.49], [-0.48, 0.08, 0.57]].map((position, index) => (
      <mesh key={index} position={position as [number, number, number]} scale={[1.2, 0.7, 0.3]}>
        <sphereGeometry args={[0.055, 14, 12]} />
        <meshStandardMaterial color={skinDark} roughness={0.8} />
      </mesh>
    ))}
    <mesh position={[0.89, 0.13, 0.4]} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[0.14, 0.014, 8, 30, Math.PI * 0.82]} />
      <meshStandardMaterial color={skinDark} roughness={0.72} />
    </mesh>
  </group>
);

const PondFloor: React.FC = () => (
  <group>
    <mesh position={[0, -1.08, 0]} receiveShadow>
      <cylinderGeometry args={[3.15, 3.35, 0.13, 64]} />
      <meshPhysicalMaterial color="#68b5bd" roughness={0.34} clearcoat={0.48} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.75, -1, 0.52]} scale={[1.35, 0.9, 1]}>
      <circleGeometry args={[0.48, 44]} />
      <meshStandardMaterial color="#5f9142" roughness={0.82} />
    </mesh>
    {[
      [-2.45, -0.9, -0.25, 0.44],
      [2.35, -0.93, 0.28, 0.36],
      [2.72, -0.96, -0.32, 0.26],
    ].map(([x, y, z, scale], index) => (
      <mesh key={index} position={[x, y, z]} scale={[scale, scale * 0.65, scale * 0.8]}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={index === 1 ? '#788371' : '#89907a'} roughness={0.92} />
      </mesh>
    ))}
  </group>
);

const StageModel: React.FC<{stage: LifeCycleStage['id']}> = ({stage}) => {
  const group = useRef<Group>(null);
  useFrame(({clock}) => {
    if (!group.current) return;
    group.current.position.y = 0.38 + Math.sin(clock.elapsedTime * 1.35) * 0.055;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.42) * 0.08;
  });
  return (
    <group ref={group} position={[0, 0.38, 0]} scale={1.62}>
      {stage === 'eggs' ? <Eggs /> : null}
      {stage === 'tadpole' ? <Tadpole /> : null}
      {stage === 'legs' ? <Tadpole withLegs /> : null}
      {stage === 'froglet' ? <Frog froglet /> : null}
      {stage === 'adult' ? <Frog /> : null}
    </group>
  );
};

export const FrogLifeCycleCanvas: React.FC<{stage: LifeCycleStage['id']}> = ({stage}) => (
  <Canvas
    camera={{position: [0, 1.2, 5.8], fov: 32, near: 0.1, far: 50}}
    dpr={[1, 1.5]}
    shadows
    gl={{alpha: true, antialias: true}}
  >
    <color attach="background" args={['#dcefdc']} />
    <fog attach="fog" args={['#dcefdc', 7, 13]} />
    <ambientLight intensity={0.95} />
    <hemisphereLight intensity={0.82} groundColor="#4d6854" />
    <directionalLight position={[5, 7, 6]} intensity={1.55} castShadow />
    <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#a9ddcf" />
    <PondFloor />
    <StageModel stage={stage} />
    <ModelOrbitControls zoomEnabled rotateEnabled target={[0, 0.12, 0]} minDistance={4.1} maxDistance={8} />
  </Canvas>
);
