import React from 'react';
export const SnailPartPreview: React.FC<{
    part: string;
}> = ({ part }) => <svg viewBox="0 0 120 76" aria-hidden="true" className="snail-preview">
  {part === 'shell' ? <><circle cx="60" cy="38" r="29" fill="#b7824e" stroke="#734c32" strokeWidth="3"/><path d="M76 49C50 68 24 36 49 20C68 9 85 33 69 44C58 51 47 36 58 31" fill="none" stroke="#734c32" strokeWidth="5" strokeLinecap="round"/></> : part === 'tentacles' ? <><path d="M30 65Q60 40 90 65" fill="#91a46d"/><path d="M47 57L31 18M73 57L89 18" stroke="#6b814e" strokeWidth="7" strokeLinecap="round"/><circle cx="31" cy="16" r="6" fill="#34492b"/><circle cx="89" cy="16" r="6" fill="#34492b"/></> : <><path d="M14 50Q24 25 66 38Q100 30 108 50Q60 72 14 50" fill="#94a975" stroke="#526d3a" strokeWidth="3"/><path d="M26 53Q60 63 96 52" fill="none" stroke="#526d3a" strokeWidth="3"/></>}
</svg>;
