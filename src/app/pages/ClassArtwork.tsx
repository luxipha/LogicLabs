import React from 'react';
import type {ClassArtwork as ClassArtworkId} from '../classStore';

const ArtBlock: React.FC = () => (
  <>
    <rect x="30" y="54" width="34" height="30" rx="4" fill="#ff9c31" />
    <rect x="68" y="40" width="42" height="32" rx="4" fill="#20a7f1" />
    <rect x="46" y="26" width="30" height="26" rx="4" fill="#ff5f8f" />
    <circle cx="56" cy="62" r="4" fill="#fff" opacity="0.8" />
    <circle cx="84" cy="48" r="4" fill="#fff" opacity="0.8" />
  </>
);

const ArtMoto: React.FC = () => (
  <>
    <rect x="24" y="52" width="92" height="20" rx="8" fill="#20a7f1" />
    <rect x="34" y="40" width="60" height="16" rx="6" fill="#4db8f5" />
    <rect x="78" y="44" width="14" height="12" rx="3" fill="#ffcf4a" />
    <circle cx="42" cy="74" r="11" fill="#1c2b3a" />
    <circle cx="42" cy="74" r="4" fill="#8aa0ba" />
    <circle cx="96" cy="74" r="11" fill="#1c2b3a" />
    <circle cx="96" cy="74" r="4" fill="#8aa0ba" />
  </>
);

const ArtGear: React.FC = () => (
  <>
    <g fill="#3fbf3f">
      <rect x="52" y="22" width="14" height="10" rx="2" />
      <rect x="52" y="62" width="14" height="10" rx="2" />
      <rect x="32" y="42" width="10" height="14" rx="2" />
      <rect x="76" y="42" width="10" height="14" rx="2" />
    </g>
    <circle cx="59" cy="47" r="18" fill="#3fbf3f" />
    <circle cx="59" cy="47" r="8" fill="#eafff0" />
    <circle cx="59" cy="47" r="3.5" fill="#1c6b1c" />
  </>
);

const ArtRobot: React.FC = () => (
  <>
    <rect x="44" y="34" width="52" height="42" rx="10" fill="#8f42f3" />
    <rect x="52" y="44" width="14" height="10" rx="3" fill="#d9c4ff" />
    <rect x="74" y="44" width="14" height="10" rx="3" fill="#d9c4ff" />
    <rect x="58" y="58" width="24" height="6" rx="3" fill="#d9c4ff" />
    <rect x="62" y="74" width="6" height="12" fill="#6b2bbd" />
    <rect x="72" y="74" width="6" height="12" fill="#6b2bbd" />
    <rect x="36" y="66" width="10" height="6" rx="3" fill="#6b2bbd" />
    <rect x="94" y="66" width="10" height="6" rx="3" fill="#6b2bbd" />
  </>
);

const ArtBrick: React.FC = () => (
  <>
    <rect x="30" y="52" width="80" height="18" rx="4" fill="#d62839" />
    <rect x="38" y="34" width="64" height="16" rx="4" fill="#ef4b5f" />
    <circle cx="48" cy="58" r="3.5" fill="#fff" opacity="0.85" />
    <circle cx="60" cy="58" r="3.5" fill="#fff" opacity="0.85" />
    <circle cx="72" cy="58" r="3.5" fill="#fff" opacity="0.85" />
    <circle cx="84" cy="58" r="3.5" fill="#fff" opacity="0.85" />
    <circle cx="96" cy="58" r="3.5" fill="#fff" opacity="0.85" />
  </>
);

const ART: Record<ClassArtworkId, React.FC> = {
  blocks: ArtBlock,
  moto: ArtMoto,
  gear: ArtGear,
  robot: ArtRobot,
  brick: ArtBrick,
};

export const ClassArtwork: React.FC<{art: ClassArtworkId}> = ({art}) => {
  const Art = ART[art];
  return (
    <svg viewBox="0 0 140 100" className="class-art" aria-hidden="true">
      <Art />
    </svg>
  );
};
