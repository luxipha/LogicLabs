import React from 'react';

export const FIRETRUCK_PARTS = ['cab', 'wheels', 'hose', 'ladder'] as const;
export type FiretruckPart = typeof FIRETRUCK_PARTS[number];

// This is an explicitly illustrated teaching view, not a mesh map of the scan.
export const FiretruckDiagram: React.FC<{selected?: string | null; onSelect?: (part: string) => void; labels?: boolean}> = ({selected, onSelect, labels = true}) => {
  const part = (id: FiretruckPart, children: React.ReactNode) => <g
    className={`firetruck-diagram__part ${selected === id ? 'is-selected' : ''}`}
    role={onSelect ? 'button' : undefined} tabIndex={onSelect ? 0 : undefined}
    aria-label={id === 'cab' ? 'Crew cab' : id === 'hose' ? 'Water hose' : id === 'wheels' ? 'Wheels' : 'Ladder'}
    onClick={onSelect ? () => onSelect(id) : undefined}
    onKeyDown={onSelect ? (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(id); } } : undefined}
  >{children}</g>;
  return <svg className="firetruck-diagram" viewBox="0 0 860 440" aria-label="Illustrated firetruck with crew cab, wheels, hose and ladder" role="group">
    <path d="M40 366H820" stroke="#b7cdd7" strokeWidth="8" strokeLinecap="round" />
    <rect x="280" y="193" width="475" height="137" rx="16" fill="#ce3438" />
    <rect x="310" y="220" width="135" height="81" rx="7" fill="#e2e9ec" stroke="#9aaab5" strokeWidth="5" />
    {[238,255,272,289].map((y) => <path key={y} d={`M320 ${y}H435`} stroke="#a7b5bd" strokeWidth="3" />)}
    <rect x="68" y="319" width="710" height="22" rx="7" fill="#617888" />
    {part('cab', <><path d="M95 326V220L154 154H282V326Z" fill="#e04a48" stroke="#922e36" strokeWidth="5" /><path d="M117 223L166 173H217V237H117Z" fill="#9cd8eb" stroke="#294958" strokeWidth="5" /><rect x="235" y="174" width="29" height="63" rx="4" fill="#9cd8eb" /><path d="M226 248V307M243 256H259" stroke="#922e36" strokeWidth="5" /><rect x="171" y="133" width="67" height="20" rx="7" fill="#428aca" /><rect x="96" y="270" width="25" height="16" rx="3" fill="#ffe6a4" /></>)}
    {part('hose', <><rect x="475" y="219" width="91" height="89" rx="12" fill="#9f2930" /><circle cx="520" cy="262" r="34" fill="#edc96a" stroke="#72552b" strokeWidth="5" /><circle cx="520" cy="262" r="22" fill="none" stroke="#a77d37" strokeWidth="6" /><circle cx="520" cy="262" r="9" fill="#5c7887" /><path d="M549 263Q596 266 592 293H617" fill="none" stroke="#edc96a" strokeWidth="13" /><path d="M614 293H640" stroke="#354f60" strokeWidth="18" /></>)}
    {part('ladder', <><rect x="312" y="149" width="424" height="35" rx="5" fill="#cbd8df" stroke="#506b7b" strokeWidth="5" />{Array.from({length: 13}, (_, i) => <path key={i} d={`M${327+i*32} 151V182`} stroke="#506b7b" strokeWidth="5" />)}</>)}
    {part('wheels', <>{[186,635,710].map((x) => <g key={x}><circle cx={x} cy="333" r="37" fill="#263c4b" stroke="#172a38" strokeWidth="4" /><circle cx={x} cy="333" r="19" fill="#b4c8d2" /><circle cx={x} cy="333" r="7" fill="#617888" /></g>)}</>)}
    {labels ? <g className="firetruck-diagram__labels" fill="#244658" fontSize="21" fontWeight="800" textAnchor="middle">
      <path d="M181 94V125M520 92V137M550 395V310M174 401V379" stroke="#799ba9" strokeWidth="3" />
      <text x="181" y="82">Crew cab</text><text x="520" y="80">Ladder</text><text x="550" y="422">Water hose</text><text x="174" y="427">Wheels</text>
    </g> : null}
  </svg>;
};

export const FiretruckPartPreview: React.FC<{part: string}> = ({part}) => <svg viewBox="0 0 100 65" className="firetruck-part-preview" aria-hidden="true">
  {part === 'cab' ? <><path d="M10 58V30L35 8H85V58Z" fill="#e04a48" /><path d="M19 31L39 14H55V35H19Z" fill="#9cd8eb" /><rect x="63" y="15" width="14" height="20" fill="#9cd8eb" /></> : part === 'wheels' ? <><circle cx="32" cy="34" r="24" fill="#263c4b" /><circle cx="32" cy="34" r="12" fill="#b4c8d2" /><circle cx="78" cy="34" r="18" fill="#263c4b" /><circle cx="78" cy="34" r="9" fill="#b4c8d2" /></> : part === 'hose' ? <><circle cx="35" cy="31" r="24" fill="#edc96a" stroke="#72552b" strokeWidth="4" /><circle cx="35" cy="31" r="13" fill="none" stroke="#a77d37" strokeWidth="5" /><path d="M58 33Q77 33 75 49H88" fill="none" stroke="#edc96a" strokeWidth="9" /><path d="M84 49H98" stroke="#354f60" strokeWidth="10" /></> : <><path d="M34 5V60M66 5V60" stroke="#506b7b" strokeWidth="6" strokeLinecap="round" />{[14,25,36,47,58].map((y) => <path key={y} d={`M34 ${y}H66`} stroke="#9badb7" strokeWidth="5" />)}</>}
</svg>;
