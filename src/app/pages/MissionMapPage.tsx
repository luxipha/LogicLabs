import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {LESSONS} from '../lessons';
import {getCurrentClass, getPresetClass} from '../classStore';
import {navigate} from '../router';
import {ClassPointsCard} from '../components/ClassPointsCard';
import {StudentSetupModal} from '../components/StudentSetupModal';
import {
  clearStudentPoints,
  getStudents,
  incrementStudentPoints,
  upsertStudentsFromNames,
  type StudentRecord,
} from '../studentStore';
import {ClassArtwork} from './ClassArtwork';

export type MissionState = 'locked' | 'available' | 'current' | 'completed';

export type MissionNode = {
  id: string;
  title: string;
  badge: string;
  color: string;
  state: MissionState;
  position: [number, number, number];
  index: number;
};

// Winding trail across the world. Each lesson gets a pad on the path.
const TRAIL: [number, number, number][] = [
  [-6.2, 0.35, 2.2],
  [-3.1, 0.35, 3.6],
  [0.1, 0.35, 3.4],
  [3.2, 0.35, 2.4],
  [5.6, 0.35, 0.4],
  [5.2, 0.35, -2.4],
  [2.6, 0.35, -3.6],
  [-0.4, 0.35, -3.2],
];

const PATH_POINTS = TRAIL.map((p) => new THREE.Vector3(...p));
const PATH_CURVE = new THREE.CatmullRomCurve3(PATH_POINTS, true);

const SKY_BY_ART: Record<string, string> = {
  blocks: '#7cc4ff',
  moto: '#9ad0ff',
  gear: '#b6e0b0',
  robot: '#c3b1ff',
  brick: '#ffb37a',
};

const getMissionState = (index: number, done: string[]): MissionState => {
  if (done.includes(String(index))) return 'completed';
  const firstNotDone = done.length;
  if (index === firstNotDone) return 'current';
  return index < firstNotDone ? 'completed' : 'locked';
};

/** A text sprite built from a canvas — dependency-free label. */
const makeLabelTexture = (text: string, color: string, outline: string, size = 256): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  const font = `900 ${size * 0.32}px "Baloo 2", "Comic Sans MS", system-ui, sans-serif`;
  canvas.width = size;
  canvas.height = size * 0.5;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(10, size * 0.045);
  ctx.strokeStyle = outline;
  ctx.lineJoin = 'round';
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  ctx.strokeText(text, cx, cy);
  ctx.fillStyle = color;
  ctx.fillText(text, cx, cy);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
};

const Label: React.FC<{
  text: string;
  color?: string;
  outline?: string;
  fontSize?: number;
  position?: [number, number, number];
}> = ({text, color = '#ffffff', outline = '#1a4a7a', fontSize = 0.4, position = [0, 0, 0]}) => {
  const texture = useMemo(() => makeLabelTexture(text, color, outline), [text, color, outline]);
  const aspect = 2; // canvas is 2:1
  return (
    <sprite position={position} scale={[fontSize * aspect, fontSize, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
};

/** Canvas-drawn star or padlock marker — reliable in every browser. */
const drawMarker = (kind: 'star' | 'lock', color: string): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);
  ctx.translate(64, 64);
  if (kind === 'star') {
    ctx.fillStyle = color;
    ctx.strokeStyle = '#7a5b00';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 52 : 22;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const x = r * Math.cos(a);
      const y = r * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // padlock: shackle + body
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, -14, 18, Math.PI, 0);
    ctx.stroke();
    ctx.fillRect(-26, -10, 52, 44);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(-14, 4, 28, 10);
  }
  return new THREE.CanvasTexture(canvas);
};

const LockStarMarker: React.FC<{kind: 'star' | 'lock'; color: string; position: [number, number, number]}> = ({
  kind,
  color,
  position,
}) => {
  const texture = useMemo(() => drawMarker(kind, color), [kind, color]);
  return (
    <sprite position={position} scale={[0.55, 0.55, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
};

const NodePad: React.FC<{node: MissionNode; selected: boolean; onPick: () => void}> = ({
  node,
  selected,
  onPick,
}) => {
  const ref = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  useFrame(({clock}) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const bob = node.state === 'completed' ? 0.07 : 0.15;
    ref.current.position.y = node.position[1] + Math.sin(t * 2 + node.index * 1.7) * bob;
    ref.current.rotation.y += 0.004;
    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.55 + Math.sin(t * 3 + node.index) * 0.22;
    }
  });

  const locked = node.state === 'locked';
  const done = node.state === 'completed';

  return (
    <group
      position={node.position}
      onClick={(e) => {
        e.stopPropagation();
        onPick();
      }}
    >
      <group ref={ref}>
        {/* pad */}
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[1.05, 1.2, 0.28, 32]} />
          <meshStandardMaterial
            color={node.color}
            emissive={selected ? '#ffffff' : node.color}
            emissiveIntensity={selected ? 0.55 : locked ? 0.04 : 0.26}
            roughness={0.45}
          />
        </mesh>
        <mesh position={[0, -0.09, 0]}>
          <cylinderGeometry args={[0.92, 0.92, 0.06, 32]} />
          <meshStandardMaterial
            color={locked ? '#cfd8e3' : node.color}
            emissive={locked ? '#8899ad' : node.color}
            emissiveIntensity={locked ? 0.1 : 0.55}
            roughness={0.35}
          />
        </mesh>
        {/* halo for current / completed */}
        {(node.state === 'current' || done) && (
          <mesh ref={haloRef} position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.15, 1.45, 40]} />
            <meshBasicMaterial
              color={done ? '#ffd94a' : '#ffffff'}
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        <Label
          text={node.badge}
          fontSize={0.85}
          color="#ffffff"
          outline={locked ? '#5a6a80' : node.color}
          position={[0, 0.9, 0]}
        />
        <Label
          text={node.title}
          fontSize={0.3}
          color={locked ? '#b9c8da' : '#ffffff'}
          outline="#12395f"
          position={[0, -0.78, 0]}
        />
        {locked || done ? (
          <LockStarMarker kind={locked ? 'lock' : 'star'} color={locked ? '#c3d0e0' : '#ffd94a'} position={[0, -1.3, 0]} />
        ) : null}
      </group>
    </group>
  );
};

const TrailPath: React.FC = () => {
  const tubeGeo = useMemo(() => new THREE.TubeGeometry(PATH_CURVE, 220, 0.16, 8, true), []);
  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(PATH_CURVE.getSpacedPoints(260));
    const mat = new THREE.LineBasicMaterial({color: '#ffffff', transparent: true, opacity: 0.65});
    return new THREE.Line(geo, mat);
  }, []);
  return (
    <group>
      <mesh geometry={tubeGeo} position={[0, -0.3, 0]}>
        <meshStandardMaterial color="#ffd94a" emissive="#ffd94a" emissiveIntensity={0.5} roughness={0.6} />
      </mesh>
      <primitive object={lineObj} position={[0, 0.02, 0]} />
    </group>
  );
};

const Clouds: React.FC<{count?: number}> = ({count = 9}) => {
  const cloudRefs = useRef<(THREE.Mesh | null)[]>([]);
  const clouds = useMemo(
    () =>
      Array.from({length: count}, (_, i) => ({
        pos: [
          (Math.random() - 0.5) * 28,
          2.6 + Math.random() * 2.8,
          (Math.random() - 0.5) * 20,
        ] as [number, number, number],
        scale: 0.7 + Math.random() * 1.4,
        speed: 0.06 + Math.random() * 0.16,
      })),
    [count],
  );
  useFrame((_, delta) => {
    cloudRefs.current.forEach((m, i) => {
      if (!m) return;
      m.position.x += clouds[i].speed * delta;
      if (m.position.x > 16) m.position.x = -16;
    });
  });
  return (
    <>
      {clouds.map((c, i) => (
        <mesh
          key={i}
          ref={(el) => {
            cloudRefs.current[i] = el;
          }}
          position={c.pos}
          scale={c.scale}
        >
          <sphereGeometry args={[0.5, 12, 12]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.72} />
        </mesh>
      ))}
    </>
  );
};

/** Minimal orbit control: drag to rotate, wheel to zoom, auto-rotate by default. */
const SimpleOrbit: React.FC<{auto: boolean; focusTarget: THREE.Vector3 | null}> = ({
  auto,
  focusTarget,
}) => {
  const state = useRef({theta: 0.5, phi: 1.1, radius: 11, target: new THREE.Vector3(0, 0.2, 0)});
  const dragging = useRef(false);
  const last = useRef({x: 0, y: 0});

  React.useEffect(() => {
    const dom = document.querySelector('.mission-map-canvas canvas') as HTMLCanvasElement | null;
    if (!dom) return;
    const down = (e: PointerEvent) => {
      dragging.current = true;
      last.current = {x: e.clientX, y: e.clientY};
      dom.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = {x: e.clientX, y: e.clientY};
      state.current.theta -= dx * 0.005;
      state.current.phi = Math.min(1.35, Math.max(0.4, state.current.phi - dy * 0.005));
    };
    const up = (e: PointerEvent) => {
      dragging.current = false;
      dom.releasePointerCapture(e.pointerId);
    };
    const wheel = (e: WheelEvent) => {
      state.current.radius = Math.min(16, Math.max(6.5, state.current.radius + e.deltaY * 0.01));
    };
    dom.addEventListener('pointerdown', down);
    dom.addEventListener('pointermove', move);
    dom.addEventListener('pointerup', up);
    dom.addEventListener('wheel', wheel, {passive: true});
    return () => {
      dom.removeEventListener('pointerdown', down);
      dom.removeEventListener('pointermove', move);
      dom.removeEventListener('pointerup', up);
      dom.removeEventListener('wheel', wheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(({camera}, delta) => {
    const s = state.current;
    if (focusTarget) s.target.lerp(focusTarget, 0.06);
    if (auto) s.theta += delta * 0.12;
    const cos = Math.cos(s.phi);
    const sin = Math.sin(s.phi);
    camera.position.set(
      s.target.x + s.radius * sin * Math.sin(s.theta),
      s.target.y + s.radius * cos,
      s.target.z + s.radius * sin * Math.cos(s.theta),
    );
    camera.lookAt(s.target);
  });
  return null;
};

const CameraRig: React.FC<{selected: number | null; auto: boolean}> = ({selected, auto}) => {
  const focus = useMemo(
    () => (selected === null ? null : new THREE.Vector3(...TRAIL[selected])),
    [selected],
  );
  return <SimpleOrbit auto={auto} focusTarget={focus} />;
};

export const MissionMapPage: React.FC = () => {
  const [cls] = useState(getCurrentClass);
  const [listView, setListView] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>(() => (cls ? getStudents(cls.name) : []));
  const [showStudentEditor, setShowStudentEditor] = useState(false);
  const preset = cls ? getPresetClass(cls.name) : undefined;

  useEffect(() => {
    setStudents(cls ? getStudents(cls.name) : []);
  }, [cls]);

  const nodes: MissionNode[] = useMemo(() => {
    const classLessons = LESSONS.filter((l) => l.content.classIds.includes(cls?.name ?? ''));
    const done: string[] = [];
    classLessons.forEach((l, i) => {
      try {
        if (window.localStorage.getItem(`classroom.progress.${cls?.name}.${l.id}`) === 'complete') {
          done.push(String(i));
        }
      } catch {
        // storage unavailable
      }
    });
    return classLessons.map((l, i) => ({
      id: l.id,
      title: l.content.title,
      badge: l.content.badge,
      color: l.content.color,
      state: getMissionState(i, done),
      position: TRAIL[i] ?? [i * 2, 0.35, 0],
      index: i,
    }));
  }, [cls]);

  const sky = preset ? SKY_BY_ART[preset.art] ?? '#7cc4ff' : '#7cc4ff';
  const classLessons = LESSONS.filter((l) => l.content.classIds.includes(cls?.name ?? ''));

  return (
    <main className="mission-map-page">
      <div className="mission-map-layout">
        <section className="mission-map-main">
          <header className="mission-map-head">
            <span className="page-kicker">Mission Map</span>
            <h1>{cls ? `${cls.name} missions` : 'Choose a class first.'}</h1>
            <div className="mission-map-actions">
              <button
                className={`map-view-toggle ${!listView ? 'active' : ''}`}
                onClick={() => setListView(false)}
              >
                3D
              </button>
              <button
                className={`map-view-toggle ${listView ? 'active' : ''}`}
                onClick={() => setListView(true)}
              >
                List
              </button>
            </div>
          </header>

          {listView ? (
            <section className="lesson-grid mission-list">
              {classLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  className="lesson-card"
                  style={{'--lesson-color': lesson.content.color} as React.CSSProperties}
                  onClick={() => navigate(`/lessons/${lesson.id}`)}
                >
                  <span className="lesson-card-top">
                    <span className="lesson-badge">{lesson.content.badge}</span>
                    <span className="lesson-difficulty">{'★'.repeat(lesson.content.difficulty)}</span>
                  </span>
                  <span className="lesson-card-body">
                    <h2>{lesson.content.title}</h2>
                    <p>{lesson.content.summary}</p>
                    <span className="lesson-topics">
                      {lesson.content.topics.map((topic) => (
                        <span key={topic} className="lesson-topic">
                          {topic}
                        </span>
                      ))}
                    </span>
                  </span>
                  <span className="lesson-card-cta">Start lesson</span>
                </button>
              ))}
            </section>
          ) : (
            <div className="mission-map-canvas">
              {preset ? (
                <div className="mission-map-medallion">
                  <ClassArtwork art={preset.art} />
                </div>
              ) : null}
              <Canvas
                shadows
                camera={{position: [0, 4.5, 9], fov: 48}}
                dpr={[1, 1.8]}
                gl={{antialias: true, alpha: false}}
                style={{background: sky}}
              >
                <color attach="background" args={[sky]} />
                <fog attach="fog" args={[sky, 18, 34]} />
                <ambientLight intensity={0.65} />
                <directionalLight position={[6, 10, 5]} intensity={1.1} castShadow />
                <Clouds count={9} />
                <TrailPath />
                {nodes.map((node) => (
                  <NodePad
                    key={node.id}
                    node={node}
                    selected={selected === node.index}
                    onPick={() => setSelected(node.index)}
                  />
                ))}
                <CameraRig selected={selected} auto={selected === null} />
              </Canvas>
              {selected !== null && nodes[selected] ? (
                <div className="mission-launch" key={nodes[selected].id}>
                  <div className="mission-launch-badge">{nodes[selected].badge}</div>
                  <div>
                    <strong>{nodes[selected].title}</strong>
                    <span>
                      {nodes[selected].state === 'locked'
                        ? 'Finish earlier missions to unlock.'
                        : nodes[selected].state === 'completed'
                          ? 'Mission complete — play again!'
                          : 'Ready to play.'}
                    </span>
                  </div>
                  <button
                    className="primary-action"
                    disabled={nodes[selected].state === 'locked'}
                    onClick={() => navigate(`/lessons/${nodes[selected].id}`)}
                  >
                    {nodes[selected].state === 'completed' ? 'Replay' : 'Start mission'}
                  </button>
                </div>
              ) : null}
              <div className="mission-map-hint">Drag to orbit · Click a pad to focus · Launch to start</div>
            </div>
          )}
        </section>

        {cls ? (
          <ClassPointsCard
            className={cls.name}
            students={students}
            onAddPoint={(studentId) => setStudents(incrementStudentPoints(cls.name, studentId))}
            onClearPoints={() => setStudents(clearStudentPoints(cls.name))}
            onManageStudents={() => setShowStudentEditor(true)}
          />
        ) : null}
      </div>

      {cls && showStudentEditor ? (
        <StudentSetupModal
          className={cls.name}
          initialNames={students.map((student) => student.name)}
          onCancel={() => setShowStudentEditor(false)}
          onContinue={(names) => {
            setStudents(upsertStudentsFromNames(cls.name, names));
            setShowStudentEditor(false);
          }}
        />
      ) : null}
    </main>
  );
};
