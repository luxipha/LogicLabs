import React, {useEffect, useRef, useState} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {SmartLightDiagram} from './SmartLightDiagram';
import {SmartLightActivity, useSmartLightLab} from './SmartLightActivity';
import {SmartLightCoding} from './SmartLightCoding';
import {lightShouldBeOn} from './smartLightLogic';
const STORY=[
 {title:'It is getting dark',text:'You need light to see, but you cannot find the switch. Could a light turn itself on?',level:30},
 {title:'Sense the surroundings',text:'Some LEDs on the micro:bit display can also sense light. A low reading means dark; a high reading means bright.',level:50},
 {title:'Make a decision',text:'The program compares the reading with 128. If it is below 128, the micro:bit tells the eight NeoPixels to turn on.',level:40},
 {title:'The sun comes out',text:'At 128 or above, the NeoPixels turn off. Street lights and smart homes can use automatic lighting to avoid leaving lights on unnecessarily.',level:210}
];
export const SmartLightStage:React.FC<{mode:string;lastSelectedPart:string|null;onSelect:(part:string)=>void;warmupVideoUrl:string;activityDone:boolean;completeActivity:()=>void;resetActivity:()=>void}>=({mode,lastSelectedPart,onSelect,warmupVideoUrl,...activity})=>{
 const lab=useSmartLightLab();
 const ref=useRef<HTMLDivElement>(null);const [level,setLevel]=useState(180),[threshold,setThreshold]=useState(128),[story,setStory]=useState(0),[fullscreen,setFullscreen]=useState(false);
 useEffect(()=>{const changed=()=>setFullscreen(Boolean(ref.current&&document.fullscreenElement===ref.current));document.addEventListener('fullscreenchange',changed);return()=>document.removeEventListener('fullscreenchange',changed)},[]);
 const toggleFullscreen=()=>{if(document.fullscreenElement)void document.exitFullscreen().catch(()=>{});else void ref.current?.requestFullscreen?.().catch(()=>{})};
 if(mode==='warmup')return <WarmupScreen videoUrl={warmupVideoUrl}/>;
 return <div ref={ref} className={`generic-stage sl-stage sl-stage--${mode}`}>
  <div className="sl-stage-toolbar"><strong>{mode==='activity'?'Smart Light lab':mode==='coding'?'Smart Light · MakeCode':mode==='story'?'How automatic lighting works':mode==='identify'?'Find the input, controller and output':'Light sensor explorer'}</strong><button type="button" onClick={toggleFullscreen}>{fullscreen?'Exit fullscreen':'Fullscreen'}</button></div>
  {mode==='activity'?<SmartLightActivity lab={lab} {...activity}/>:mode==='coding'?<SmartLightCoding/>:mode==='story'?<div className="sl-story"><h2>{STORY[story].title}</h2><p>{STORY[story].text}</p><div className="sl-diagram-frame"><SmartLightDiagram level={STORY[story].level} on={lightShouldBeOn(STORY[story].level)}/></div><nav aria-label="Story cards"><button type="button" disabled={story===0} onClick={()=>setStory(v=>v-1)}>← Previous</button><span role="status">{story+1} / 4</span><button type="button" disabled={story===3} onClick={()=>setStory(v=>v+1)}>Next →</button></nav></div>:<>
   <div className="sl-diagram-frame"><SmartLightDiagram level={mode==='identify'?40:level} on={mode==='identify'?true:lightShouldBeOn(level,threshold)} selected={mode==='identify'?lastSelectedPart:null} onSelect={mode==='identify'?onSelect:undefined}/></div>
   {mode==='identify'?<p className="sl-identify-hint">Tap the board, its LED display, or the eight-light ring.</p>:<div className="sl-explore-controls"><div className="sl-ranges"><label className="sl-slider">Light level <output>{level}</output><input aria-label="Explore light level" type="range" min="0" max="255" value={level} onChange={e=>setLevel(Number(e.target.value))}/></label><label className="sl-slider">Threshold <output>{threshold}</output><input aria-label="Threshold" type="range" min="0" max="255" value={threshold} onChange={e=>setThreshold(Number(e.target.value))}/></label></div><div className="sl-buttons"><button type="button" onClick={()=>setLevel(40)}>Dark · 40</button><button type="button" onClick={()=>setLevel(210)}>Bright · 210</button><button type="button" onClick={()=>{setLevel(180);setThreshold(128)}}>Reset explorer</button></div><p role="status">{level} {level<threshold?'<':'≥'} {threshold} → Light {lightShouldBeOn(level,threshold)?'ON':'OFF'} <span>· Simulated sensor reading</span></p></div>}
  </>}
 </div>
};
