import React, {useEffect, useState} from 'react';
import {SmartLightDiagram} from './SmartLightDiagram';
import {checkLightTest, chosenLightOutput, type LightChoice, type LightSetup} from './smartLightLogic';
const INITIAL: LightSetup = {pin: '', count: '', dark: '', bright: ''};
export const useSmartLightLab = () => {
 const [setup,setSetup]=useState(INITIAL),[level,setLevel]=useState(180),[tested,setTested]=useState({dark:false,bright:false}),[message,setMessage]=useState('Set up your NeoPixels and choose both actions.');
 return {setup,setSetup,level,setLevel,tested,setTested,message,setMessage};
};
export const SmartLightActivity: React.FC<{lab:ReturnType<typeof useSmartLightLab>;activityDone:boolean; completeActivity:()=>void; resetActivity:()=>void}>=({lab,activityDone,completeActivity,resetActivity})=>{
 const {setup,setSetup,level,setLevel,tested,setTested,message,setMessage}=lab;
 useEffect(()=>{if(tested.dark&&tested.bright&&!activityDone)completeActivity()},[tested.dark,tested.bright,activityDone,completeActivity]);
 const change=(key:keyof LightSetup,value:string)=>{setSetup(s=>({...s,[key]:value}));setTested({dark:false,bright:false});setMessage('Program changed. Test both dark and bright conditions.');if(activityDone)resetActivity()};
 const runTest=()=>{const result=checkLightTest(setup,level);setMessage(result.message);if(result.passed)setTested(t=>({...t,[level<128?'dark':'bright']:true}))};
 const retry=()=>{setSetup(INITIAL);setLevel(180);setTested({dark:false,bright:false});setMessage('Set up your NeoPixels and choose both actions.');resetActivity()};
 const ready=Object.values(setup).every(Boolean),finished=tested.dark&&tested.bright;
 return <div className="sl-lab">
  <div className="sl-lab-visual"><SmartLightDiagram level={level} on={chosenLightOutput(setup,level)}/><div className="sl-test-badges"><span className={tested.dark?'passed':''}>Dark test {tested.dark?'✓':'○'}</span><span className={tested.bright?'passed':''}>Bright test {tested.bright?'✓':'○'}</span></div></div>
  <div className="sl-lab-controls">
   <h3>1 · Set up the light</h3><div className="sl-select-row"><label>Data pin<select aria-label="Data pin" value={setup.pin} onChange={e=>change('pin',e.target.value)}><option value="">Choose…</option>{['P0','P2','P16'].map(p=><option key={p}>{p}</option>)}</select></label><label>LED count<select aria-label="LED count" value={setup.count} onChange={e=>change('count',e.target.value)}><option value="">Choose…</option>{['1','8','16'].map(n=><option key={n}>{n}</option>)}</select></label></div>
   <h3>2 · Build the rule</h3>{(['dark','bright'] as const).map(key=><label className="sl-rule-row" key={key}><span>{key==='dark'?'If light level < 128':'Else (128 or above)'}</span><select aria-label={key==='dark'?'Dark action':'Bright action'} value={setup[key]} onChange={e=>change(key,e.target.value as LightChoice)}><option value="">Choose…</option><option value="on">Turn On</option><option value="off">Turn Off</option></select></label>)}
   <h3>3 · Test your program</h3><label className="sl-slider">Light level <output>{level}</output><input aria-label="Activity light level" type="range" min="0" max="255" value={level} onChange={e=>setLevel(Number(e.target.value))}/></label><div className="sl-buttons"><button type="button" onClick={()=>setLevel(40)}>Dark · 40</button><button type="button" onClick={()=>setLevel(210)}>Bright · 210</button><button type="button" disabled={!ready} onClick={runTest}>Run test</button><button type="button" onClick={retry}>↻ Try again</button></div>
   <p className="sl-status" role="status" aria-live="polite">{finished?'Both tests passed! Present: “My smart light turns on when it is dark and off when it is bright.”':message}</p>
  </div>
 </div>
};
