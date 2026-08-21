import React, {Suspense, useMemo, useRef, useState} from 'react';
import {type ThreeEvent} from '@react-three/fiber';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Group, Vector3} from 'three';
import {
  getExplodedOffset,
  LESSON_PARTS,
  PART_LABELS,
  type LessonPartId,
  ThreePlane,
} from '../components/ThreePlane';

const ASSEMBLY_SEQUENCE = LESSON_PARTS.filter((part) => part !== 'body');

const PART_HELP: Record<LessonPartId, string> = {
  body: 'The body holds the airplane together.',
  cockpit: 'The cockpit is where the pilot sits and controls the airplane.',
  engine: 'The jet engine gives the airplane power to move forward.',
  leftWing: 'The left wing helps lift the airplane into the sky.',
  rightWing: 'The right wing balances the airplane in flight.',
  tires: 'The tires help the airplane roll during takeoff and landing.',
};

const SNAP_RADIUS: Record<LessonPartId, number> = {
  body: 0,
  cockpit: 5.2,
  engine: 6,
  leftWing: 6.5,
  rightWing: 6.5,
  tires: 7,
};

const PART_TAG_STYLE: Record<
  LessonPartId,
  {top?: string; bottom?: string; left?: string; right?: string}
> = {
  body: {top: '38%', left: '44%'},
  cockpit: {top: '29%', left: '47%'},
  engine: {top: '52%', left: '45%'},
  leftWing: {top: '46%', left: '30%'},
  rightWing: {top: '46%', right: '30%'},
  tires: {bottom: '26%', left: '44%'},
};

const createInitialState = (): Record<LessonPartId, boolean> => ({
  body: true,
  cockpit: false,
  engine: false,
  leftWing: false,
  rightWing: false,
  tires: false,
});

const createInitialPositions = (): Record<LessonPartId, [number, number, number]> => ({
  body: [0, 0, 0],
  cockpit: getExplodedOffset('cockpit'),
  engine: getExplodedOffset('engine'),
  leftWing: getExplodedOffset('leftWing'),
  rightWing: getExplodedOffset('rightWing'),
  tires: getExplodedOffset('tires'),
});

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const PlaneAssemblyPlayground: React.FC = () => {
  const {width, height} = useVideoConfig();
  const [assembledParts, setAssembledParts] = useState<Record<LessonPartId, boolean>>(
    createInitialState,
  );
  const [partPositions, setPartPositions] = useState<Record<LessonPartId, [number, number, number]>>(
    createInitialPositions,
  );
  const [selectedPart, setSelectedPart] = useState<LessonPartId>('cockpit');
  const [lastCompletedPart, setLastCompletedPart] = useState<LessonPartId | null>(null);
  const modelGroupRef = useRef<Group>(null);
  const dragState = useRef<{
    part: LessonPartId;
    offset: [number, number, number];
  } | null>(null);

  const assembledCount = useMemo(() => {
    return ASSEMBLY_SEQUENCE.filter((part) => assembledParts[part]).length;
  }, [assembledParts]);
  const isComplete = assembledCount === ASSEMBLY_SEQUENCE.length;

  const nextPart = useMemo(() => {
    return ASSEMBLY_SEQUENCE.find((part) => !assembledParts[part]) ?? null;
  }, [assembledParts]);

  const selectPart = (part: LessonPartId) => {
    setSelectedPart(part);
  };

  const resetParts = () => {
    setAssembledParts(createInitialState());
    setPartPositions(createInitialPositions());
    setSelectedPart('cockpit');
    setLastCompletedPart(null);
    dragState.current = null;
  };

  const toModelLocal = (event: ThreeEvent<PointerEvent>) => {
    if (!modelGroupRef.current) {
      return new Vector3();
    }

    return modelGroupRef.current.worldToLocal(event.point.clone());
  };

  const onPartPointerDown = (part: LessonPartId, event: ThreeEvent<PointerEvent>) => {
    if (part === 'body' || assembledParts[part]) {
      return;
    }

    event.stopPropagation();
    setSelectedPart(part);

    const localPoint = toModelLocal(event);
    const [x, y, z] = partPositions[part];

    dragState.current = {
      part,
      offset: [x - localPoint.x, y - localPoint.y, z - localPoint.z],
    };

    (event.target as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
  };

  const onPartPointerMove = (part: LessonPartId, event: ThreeEvent<PointerEvent>) => {
    if (dragState.current?.part !== part) {
      return;
    }

    event.stopPropagation();
    const localPoint = toModelLocal(event);
    const [offsetX, offsetY, offsetZ] = dragState.current.offset;
    const nextX = localPoint.x + offsetX;
    const nextY = localPoint.y + offsetY;
    const nextZ = localPoint.z + offsetZ;
    const current = partPositions[part];

    const constrainedPosition: [number, number, number] = (() => {
      switch (part) {
        case 'cockpit':
          return [clamp(nextX, -4, 4), clamp(nextY, 0, 12), clamp(current[2], -1, 1)];
        case 'engine':
          return [clamp(nextX, -4, 4), clamp(nextY, -12, 2), clamp(nextZ, -8, 4)];
        case 'leftWing':
          return [clamp(nextX, -18, -2), clamp(nextY, -2, 5), clamp(current[2], -2, 2)];
        case 'rightWing':
          return [clamp(nextX, 2, 18), clamp(nextY, -2, 5), clamp(current[2], -2, 2)];
        case 'tires':
          return [clamp(nextX, -6, 6), clamp(nextY, -14, 0), clamp(nextZ, 2, 14)];
        case 'body':
        default:
          return [0, 0, 0];
      }
    })();

    setPartPositions((current) => ({
      ...current,
      [part]: constrainedPosition,
    }));
  };

  const onPartPointerUp = (part: LessonPartId, event: ThreeEvent<PointerEvent>) => {
    if (dragState.current?.part !== part) {
      return;
    }

    event.stopPropagation();
    (event.target as HTMLElement | null)?.releasePointerCapture?.(event.pointerId);
    const [x, y, z] = dragState.current ? partPositions[dragState.current.part] : partPositions[part];
    const distance = Math.sqrt(x * x + y * y + z * z);

    if (distance < SNAP_RADIUS[part]) {
      setAssembledParts((current) => {
        const updated = {
          ...current,
          [part]: true,
        };
        const nextUnassembled = ASSEMBLY_SEQUENCE.find(
          (candidate) => candidate !== part && !updated[candidate],
        );
        setSelectedPart(nextUnassembled ?? 'body');
        return updated;
      });
      setPartPositions((current) => ({
        ...current,
        [part]: [0, 0, 0],
      }));
      setLastCompletedPart(part);
    }

    dragState.current = null;
  };

  const instruction =
    nextPart === null
      ? 'All the main parts are attached. Reset to build the airplane again.'
      : `Drag the ${PART_LABELS[nextPart].toLowerCase()} onto the airplane body.`;

  const selectedHelp = PART_HELP[selectedPart];
  const completionRatio = assembledCount / ASSEMBLY_SEQUENCE.length;

  return (
    <AbsoluteFill style={{
      backgroundColor: '#071421',
      translate: "-112.1px 73.3px"
    }}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 18% 12%, rgba(100,187,255,0.2), transparent 30%), linear-gradient(180deg, #0a2440 0%, #124368 48%, #8eb9dd 100%)',
        }}
      />
      <ThreeCanvas
        width={width}
        height={height}
        camera={{position: [0, 2.5, 12], fov: 35, near: 0.1, far: 100}}
      >
        <ambientLight intensity={0.55} />
        <hemisphereLight intensity={0.65} groundColor="#667f99" />
        <directionalLight position={[10, 10, 7]} intensity={1.4} />
        <directionalLight position={[-5, 3, -5]} intensity={0.45} color="#a4c2ff" />

        <Suspense fallback={null}>
          <group
            position={[0, isComplete ? 1.15 : 1.4, isComplete ? 1.2 : 1.8]}
            rotation={[isComplete ? 0.08 : 0.18, isComplete ? -0.34 : -0.52, 0]}
            scale={isComplete ? [1.08, 1.08, 1.08] : [1, 1, 1]}
          >
            <ThreePlane
              progress={0.25}
              activePart={selectedPart}
              assembledParts={assembledParts}
              onPartSelect={selectPart}
              partPositions={partPositions}
              onPartPointerDown={onPartPointerDown}
              onPartPointerMove={onPartPointerMove}
              onPartPointerUp={onPartPointerUp}
              modelGroupRef={modelGroupRef}
            />
          </group>
        </Suspense>
      </ThreeCanvas>
      <AbsoluteFill
        style={{
          padding: '64px 84px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontSize: 68,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '0.02em',
            textShadow: '0 10px 28px rgba(0,0,0,0.28)',
          }}
        >
          BUILD THE AIRPLANE
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 28,
            color: '#d9ecff',
            maxWidth: 760,
            lineHeight: 1.4,
          }}
        >
          {instruction}
        </div>
        <div
          style={{
            marginTop: 22,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px 18px',
            borderRadius: 999,
            background: 'rgba(8,25,39,0.58)',
            border: '1px solid rgba(174,223,255,0.22)',
            color: '#e8f6ff',
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: assembledParts[selectedPart] ? '#7ff0ab' : '#ffb347',
              boxShadow: assembledParts[selectedPart] ? '0 0 14px rgba(127,240,171,0.55)' : '0 0 14px rgba(255,179,71,0.55)',
            }}
          />
          <span>{selectedHelp}</span>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        {isComplete ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 50% 38%, rgba(127,240,171,0.16), transparent 24%)',
            }}
          />
        ) : null}
        {nextPart !== null ? (
          <div
            style={{
              position: 'absolute',
              ...PART_TAG_STYLE[nextPart],
              padding: '10px 16px',
              borderRadius: 16,
              background: 'rgba(7, 23, 37, 0.82)',
              border: '1px solid rgba(118,213,255,0.38)',
              color: '#ffffff',
              fontSize: 22,
              fontWeight: 800,
              boxShadow: '0 8px 24px rgba(0,0,0,0.24)',
            }}
          >
            Drag {PART_LABELS[nextPart]}
          </div>
        ) : null}
        {lastCompletedPart ? (
          <div
            style={{
              position: 'absolute',
              top: 148,
              right: 84,
              padding: '14px 18px',
              borderRadius: 18,
              background: 'rgba(127,240,171,0.16)',
              border: '1px solid rgba(127,240,171,0.36)',
              color: '#eafff1',
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            Attached: {PART_LABELS[lastCompletedPart]}
          </div>
        ) : null}
        {isComplete ? (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              translate: '-50% -40%',
              width: 520,
              padding: '28px 32px',
              borderRadius: 28,
              background: 'rgba(7, 23, 37, 0.84)',
              border: '1px solid rgba(127,240,171,0.34)',
              boxShadow: '0 24px 70px rgba(0,0,0,0.28)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: '0.16em',
                color: '#7ff0ab',
              }}
            >
              READY TO FLY
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 46,
                lineHeight: 1.08,
                fontWeight: 900,
                color: '#ffffff',
              }}
            >
              You built the airplane.
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: 24,
                lineHeight: 1.35,
                color: '#d9ecff',
              }}
            >
              The cockpit, engines, wings, and tires are all attached.
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: 'space-between',
          alignItems: 'stretch',
          padding: '0 84px 68px',
          pointerEvents: 'none',
        }}
      >
        <div />
        <div
          style={{
            alignSelf: 'flex-end',
            display: 'flex',
            gap: 24,
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              width: 380,
              borderRadius: 28,
              padding: '26px 28px',
              background: 'rgba(6,20,32,0.74)',
              border: '1px solid rgba(174,223,255,0.25)',
              backdropFilter: 'blur(14px)',
            }}
          >
            {LESSON_PARTS.map((part) => {
              const assembled = assembledParts[part];
              const active = selectedPart === part;

              return (
                <button
                  key={part}
                  onClick={() => selectPart(part)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    border: 0,
                    background: active ? 'rgba(118,213,255,0.16)' : 'transparent',
                    borderRadius: 18,
                    padding: '12px 14px',
                    color: active ? '#ffffff' : '#9ec0de',
                    fontSize: active ? 28 : 24,
                    fontWeight: active ? 800 : 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span>{PART_LABELS[part]}</span>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: assembled ? '#7ff0ab' : '#ffb347',
                    }}
                  >
                    {part === 'body' || assembled ? 'ON' : 'DRAG'}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            style={{
              width: 280,
              borderRadius: 28,
              padding: '26px 28px',
              background: 'rgba(6,20,32,0.74)',
              border: '1px solid rgba(174,223,255,0.25)',
              backdropFilter: 'blur(14px)',
              color: '#ffffff',
              pointerEvents: 'auto',
            }}
          >
            <div style={{fontSize: 18, fontWeight: 700, letterSpacing: '0.12em', color: '#9ec0de'}}>
              PROGRESS
            </div>
            <div style={{marginTop: 14, fontSize: 56, fontWeight: 800}}>
              {assembledCount}/{ASSEMBLY_SEQUENCE.length}
            </div>
            <div
              style={{
                marginTop: 16,
                height: 16,
                borderRadius: 999,
                background: 'rgba(158,192,222,0.22)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${completionRatio * 100}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #76d5ff 0%, #7ff0ab 100%)',
                  boxShadow: '0 0 18px rgba(118,213,255,0.32)',
                }}
              />
            </div>
            <div style={{marginTop: 10, fontSize: 24, lineHeight: 1.35, color: '#d9ecff'}}>
              {nextPart === null
                ? 'The airplane is ready to fly.'
                : `Next part: ${PART_LABELS[nextPart]}`}
            </div>
            <button
              onClick={resetParts}
              style={{
                marginTop: 24,
                width: '100%',
                border: 0,
                borderRadius: 18,
                padding: '16px 18px',
                background: '#ffb347',
                color: '#132237',
                fontSize: 22,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Reset Parts
            </button>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
