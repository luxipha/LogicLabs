import React from 'react';
export type LightPart='controller'|'sensor'|'neopixel';
export const SmartLightDiagram:React.FC<{level:number;on:boolean;selected?:string|null;onSelect?:(part:LightPart)=>void}>=({level,on,selected,onSelect})=>{
 const target=(part:LightPart)=>onSelect?{role:'button',tabIndex:0,'aria-label':part==='controller'?'micro:bit board':part==='sensor'?'LED display and light sensing':'Eight NeoPixel lights',onClick:(e:React.MouseEvent)=>{e.stopPropagation();onSelect(part)},onKeyDown:(e:React.KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onSelect(part)}}}:{};
 const stroke=(part:string)=>selected===part?'#ffca3a':'#61b0c0';
 return <svg className="smart-light-diagram" viewBox="0 0 760 365" aria-label="Simplified micro:bit and eight NeoPixel light diagram">
  <rect x="8" y="8" width="744" height="349" rx="22" fill={level<128?'#142b4b':'#d9edf1'}/>
  <text x="34" y="43" fill={level<128?'#deedf4':'#2c5865'} fontSize="17">{level<128?'Dark surroundings':'Bright surroundings'} · reading {level}</text>
  <path d="M335 274C410 320 446 290 475 224" fill="none" stroke="#cc9661" strokeWidth="7"/>
  <text x="386" y="321" fill={level<128?'#deedf4':'#2c5865'} fontSize="15">Data · P16</text>
  <g {...target('controller')} className={onSelect?'smart-target':''}>
   <rect x="70" y="76" width="310" height="204" rx="20" fill="#202a37" stroke={stroke('controller')} strokeWidth="5"/>
   <text x="92" y="104" fill="white" fontSize="18" fontWeight="bold">micro:bit</text>
   <circle cx="108" cy="180" r="17" fill="#a3b6c5"/><text x="101" y="186" fontSize="16">A</text><circle cx="342" cy="180" r="17" fill="#a3b6c5"/><text x="336" y="186" fontSize="16">B</text>
   {[0,1,2,3,4].map(i=><rect key={i} x={91+i*57} y="247" width="38" height="31" rx="5" fill="#d6b34f"/>)}

  </g>
   <g {...target('sensor')} className={onSelect?'smart-target':''}>
    <rect x="164" y="112" width="121" height="119" rx="9" fill="#101a28" stroke={stroke('sensor')} strokeWidth="3"/>
    {Array.from({length:25},(_,i)=><rect key={i} x={177+i%5*20} y={125+Math.floor(i/5)*20} width="12" height="12" rx="2" fill={i<5?'#e96460':'#70414a'}/>)}
   </g>
  <g {...target('neopixel')} className={onSelect?'smart-target':''}>
   <circle cx="565" cy="183" r="91" fill="#263a3f" stroke={stroke('neopixel')} strokeWidth="5"/>
   <circle cx="565" cy="183" r="47" fill={level<128?'#142b4b':'#d9edf1'}/>
   {Array.from({length:8},(_,i)=>{const a=i*Math.PI/4,x=565+69*Math.cos(a),y=183+69*Math.sin(a);return <g key={i}>{on?<circle cx={x} cy={y} r="22" fill="#ff7462" opacity=".2"/>:null}<circle cx={x} cy={y} r="13" fill={on?'#ff6959':'#7e9293'} stroke={on?'#ffc6aa':'#536b6e'} strokeWidth="3"/></g>})}
   <text x="565" y="179" textAnchor="middle" fill={level<128?'white':'#254c63'} fontSize="15">NeoPixel</text><text x="565" y="200" textAnchor="middle" fill={level<128?'white':'#254c63'} fontSize="17" fontWeight="bold">{on?'ON':'OFF'}</text>
  </g>
  <text x="73" y="345" fill={level<128?'#deedf4':'#2c5865'} fontSize="13">*P16 is accessed through the classroom expansion board. Simplified signal diagram.</text>
 </svg>
};
export const SmartLightPartPreview:React.FC<{part:string}>=({part})=><svg viewBox="0 0 100 60" aria-hidden="true">{part==='controller'?<><rect x="10" y="6" width="80" height="48" rx="8" fill="#243c4d"/><rect x="36" y="18" width="28" height="25" fill="#e96362"/>{[0,1,2].map(i=><rect key={i} x={20+i*25} y="47" width="10" height="8" fill="#dec067"/>)}</>:part==='sensor'?<>{Array.from({length:25},(_,i)=><rect key={i} x={25+i%5*10} y={6+Math.floor(i/5)*10} width="7" height="7" rx="1" fill="#e96362"/>)}</>:<><circle cx="50" cy="30" r="24" fill="#294f43"/>{Array.from({length:8},(_,i)=><circle key={i} cx={50+17*Math.cos(i*Math.PI/4)} cy={30+17*Math.sin(i*Math.PI/4)} r="4" fill="#ff7868"/>)}</>}</svg>;
