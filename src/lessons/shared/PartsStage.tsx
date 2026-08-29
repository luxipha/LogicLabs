import React from 'react';
import type {GenericPart, PartShape} from '../../app/types';

const shapeToElement = (part: GenericPart, shape: PartShape, className: string, onSelect: () => void) => {
  const common = {className, onClick: onSelect};
  switch (shape.kind) {
    case 'circle':
      return <circle {...common} cx={shape.cx} cy={shape.cy} r={shape.r} fill={shape.fill ?? '#8a93a0'} stroke={shape.stroke ?? '#5c6570'} strokeWidth={3} />;
    case 'ellipse':
      return <ellipse {...common} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} fill={shape.fill ?? '#8a93a0'} stroke={shape.stroke ?? '#5c6570'} strokeWidth={3} />;
    case 'rect':
      return (
        <rect
          {...common}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          rx={shape.rx ?? 8}
          fill={shape.fill ?? '#8a93a0'}
          stroke={shape.stroke ?? '#5c6570'}
          strokeWidth={3}
        />
      );
    case 'path':
      return <path {...common} d={shape.d} fill={shape.fill ?? 'none'} stroke={shape.stroke ?? '#5c6570'} strokeWidth={shape.strokeWidth ?? 5} strokeLinecap="round" strokeLinejoin="round" />;
  }
};

export const PartsStage: React.FC<{
  activePart: string;
  identified: Set<string>;
  onSelect: (part: string) => void;
  mode: string;
  parts: GenericPart[];
  background?: string[];
}> = ({activePart, identified, onSelect, mode, parts, background}) => {
  const gradient = background && background.length >= 3 ? (background as [string, string, string]) : ['#dbe7f2', '#eef6ff', '#cfe0ee'];

  return (
    <div className="generic-stage">
      <svg viewBox="0 0 680 460" className="generic-art" aria-label="Machine parts">
        <defs>
          <linearGradient id="parts-stage-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="55%" stopColor={gradient[1]} />
            <stop offset="100%" stopColor={gradient[2]} />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="680" height="460" fill="url(#parts-stage-bg)" rx="18" />

        {parts.map((part) => {
          if (!part.shape) {
            return null;
          }
          const className = [
            'generic-part',
            activePart === part.id ? 'active' : '',
            identified.has(part.id) ? 'done' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <g key={part.id} aria-label={part.label} role="button" tabIndex={0} onClick={() => onSelect(part.id)} onKeyDown={(event) => event.key === 'Enter' && onSelect(part.id)}>
              {shapeToElement(part, part.shape, className, () => onSelect(part.id))}
            </g>
          );
        })}

        {mode === 'explore' && activePart ? (
          <g pointerEvents="none">
            <rect x="180" y="390" width="320" height="52" rx="12" fill="rgba(255,255,255,0.92)" stroke="#c9ddf0" strokeWidth="2" />
            <text x="340" y="420" textAnchor="middle" fontSize="17" fontWeight="800" fill="#17335b" fontFamily="inherit">
              {parts.find((p) => p.id === activePart)?.fact ?? ''}
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  );
};
