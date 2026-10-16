import React from 'react';

export const BeaterPartPreview: React.FC<{part: string}> = ({part}) => <svg className="beater-part-preview" viewBox="0 0 100 68" aria-hidden="true">
  {part === 'body' ? <><path d="M15 54V29Q16 10 36 10H70Q85 10 85 26V54Z" fill="#dbb8bf" stroke="#8d6e7c" strokeWidth="3" /><path d="M33 27Q33 18 43 18H66Q75 18 75 27Z" fill="#e8f3f8" /><path d="M15 54H85V62H15Z" fill="#6e7d87" /></> : null}
  {part === 'handle' ? <><path d="M17 53V26Q17 12 33 12H72Q84 12 84 26V53H72V30Q72 24 65 24H37Q30 24 30 31V53Z" fill="#dbb8bf" stroke="#8d6e7c" strokeWidth="3" /><path d="M31 18H72" stroke="#627582" strokeWidth="9" strokeLinecap="round" /></> : null}
  {part === 'controls' ? <><rect x="15" y="21" width="70" height="32" rx="12" fill="#dbb8bf" /><rect x="24" y="27" width="45" height="20" rx="7" fill="#566b7b" /><rect x="43" y="23" width="14" height="28" rx="4" fill="#99c8d9" /><circle cx="76" cy="37" r="5" fill="#627582" /></> : null}
  {part === 'beaters' ? <g fill="none" stroke="#617b8d" strokeWidth="4" strokeLinecap="round">{[32,68].map(x => <g key={x}><path d={`M${x} 5V30M${x} 30Q${x-22} 60 ${x} 62Q${x+22} 60 ${x} 30Z`} /><path d={`M${x} 30Q${x-7} 60 ${x} 62Q${x+7} 60 ${x} 30Z`} /></g>)}</g> : null}
</svg>;
