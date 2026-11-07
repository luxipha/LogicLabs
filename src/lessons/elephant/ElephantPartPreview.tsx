import React from 'react';
// A labelled side-view diagram provides a readable preview without five extra renderers.
export const ElephantPartPreview: React.FC<{part: string}> = ({part}) => {
  const color = (id: string) => part === id ? '#ffc83d' : '#90a4b0';
  return <svg viewBox="0 0 120 90" role="img" aria-label={`Elephant ${part} diagram`}>
    <g stroke="#294956" strokeWidth="3" strokeLinejoin="round">
      <path d="M26 38 Q10 40 12 62" fill="none" stroke={color('tail')} strokeWidth="7" />
      <ellipse cx="53" cy="42" rx="33" ry="24" fill={color('body')} />
      <path d="M30 53 V78 H43 V55 M62 54 V78 H75 V51" fill={color('legs')} />
      <circle cx="86" cy="33" r="21" fill={color('body')} />
      <path d="M99 36 Q112 49 106 67 Q101 76 94 68" fill="none" stroke={color('trunk')} strokeWidth="12" />
      <ellipse cx="76" cy="34" rx="15" ry="22" fill={color('ears')} />
      <circle cx="94" cy="29" r="2" fill="#142f3c" stroke="none" />
    </g>
  </svg>;
};
