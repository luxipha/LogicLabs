import React, {useCallback, useEffect, useRef, useState} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import {ARM_DURATION, RobotArmModel} from './RobotArmModel';
import {ARM_COMMANDS, COMMAND_CHOICES, COMMAND_POSES, PLAN_STEP_SECONDS, simulateArmPlan, type ArmCommand} from './robotArmLogic';
import content from './content.json';
import {ArmLoadTracker} from './ArmLoadTracker';
export const RobotArmStage:React.FC<{
 mode:string;lastSelectedPart:string|null;onSelect:(part:string)=>void;warmupVideoUrl:string;
 activityDone:boolean;completeActivity:()=>void;resetActivity:()=>void;
}>=({mode,lastSelectedPart,onSelect,warmupVideoUrl,activityDone,completeActivity,resetActivity})=>{
 const [codingStep,setCodingStep]=useState(0);
 const [time,setTime]=useState(0),[playing,setPlaying]=useState(false),[view,setView]=useState(0);
 const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[fullscreen,setFullscreen]=useState(false);
 const [plan,setPlan]=useState<ArmCommand[]>([]),[runningPlan,setRunningPlan]=useState(false);
 const [runTime,setRunTime]=useState(0);
 const runSteps=simulateArmPlan(plan);
 const stepIndex=Math.min(5,Math.floor(runTime/PLAN_STEP_SECONDS));
 const runStep=runTime>0?runSteps[stepIndex]:undefined;
 const [hasRun,setHasRun]=useState(false);
 const [message,setMessage]=useState('Choose the six instructions in the order the arm should follow.'),[tone,setTone]=useState('hint');
 const ref=useRef<HTMLDivElement>(null);
 const modelReady=useCallback(()=>{setReady(true);setFailed(false);},[]);
 const modelFailed=useCallback(()=>{setReady(false);setFailed(true);setPlaying(false);setRunningPlan(false);},[]);
 const animationEnd=useCallback(()=>{
  setPlaying(false);
  if(runningPlan){
   setRunningPlan(false);
   const result=runSteps[runSteps.length-1];
   if(result?.load==='delivered'){setMessage('Delivered! Your instructions moved the load safely.');setTone('success');completeActivity();}
   else{setMessage('The load was not delivered. '+(runSteps.find(step=>!step.ok)?.message??'Review the order and try again.'));setTone('error');}
  }
 },[runningPlan,runSteps,completeActivity]);
 // Keep playback in the lesson, independent of WebGL's demand-render loop.
 const playbackTime=useRef(time),playbackEnd=useRef(animationEnd);
 const runPlayback=useRef(runningPlan),runInstructions=useRef(plan);
 runPlayback.current=runningPlan;runInstructions.current=plan;
 playbackTime.current=time;
 playbackEnd.current=animationEnd;
 useEffect(()=>{
  if(!playing)return;
  let current=runPlayback.current?0:playbackTime.current,lastTick:number|null=null;
  const duration=runPlayback.current?PLAN_STEP_SECONDS*6:ARM_DURATION-.001;
  const startPose=playbackTime.current;
  let frame=0,lastPaint=-1;
  const tick=(now:number)=>{
   // Do not skip the demonstration when a slow graphics frame stalls the UI.
   const delta=lastTick===null?0:Math.min((now-lastTick)/1000,.1);
   lastTick=now;
   const next=Math.min(duration,current+delta);
   current=next;
   if(now-lastPaint>=1000/30||next>=duration){
    if(runPlayback.current){
     setRunTime(next);
     const index=Math.min(5,Math.floor(next/PLAN_STEP_SECONDS));
     const from=index===0?startPose:COMMAND_POSES[runInstructions.current[index-1]];
     const to=COMMAND_POSES[runInstructions.current[index]];
     const progress=Math.min(1,(next-index*PLAN_STEP_SECONDS)/PLAN_STEP_SECONDS);
     setTime(from+(to-from)*progress);
    }else setTime(next);
    lastPaint=now;
   }
   if(next>=duration){playbackEnd.current();return;}
   frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  return()=>cancelAnimationFrame(frame);
 },[playing]);
 useEffect(()=>{setPlaying(false);setRunningPlan(false);},[mode]);
 useEffect(()=>{const changed=()=>setFullscreen(document.fullscreenElement===ref.current);document.addEventListener('fullscreenchange',changed);return()=>document.removeEventListener('fullscreenchange',changed);},[]);
 const toggleFullscreen=()=>{if(document.fullscreenElement)void document.exitFullscreen().catch(()=>{});else void ref.current?.requestFullscreen?.().catch(()=>{});};
 const resetPlan=()=>{setPlan([]);setHasRun(false);setRunTime(0);setPlaying(false);setRunningPlan(false);setTime(8);setTone('hint');setMessage('Choose the six instructions in the order the arm should follow.');resetActivity();};
 const editPlan=(next:ArmCommand[])=>{setPlan(next);setHasRun(false);setRunTime(0);setPlaying(false);setRunningPlan(false);setTone('hint');setMessage('Your plan changed. Run it when all six instructions are in place.');if(activityDone)resetActivity();};
 const runPlan=()=>{if(plan.length!==6||!ready)return;if(activityDone)resetActivity();setMessage('Running your instructions. Follow the load tracker.');setTone('hint');setRunTime(0);setHasRun(true);setRunningPlan(true);setPlaying(true);};
 if(mode==='coding')return <div ref={ref} className="generic-stage ra-stage ra-coding">
  <header className="ra-toolbar"><strong>Robot Arm · Coding</strong><button type="button" onClick={toggleFullscreen}>{fullscreen?'Exit fullscreen':'Fullscreen'}</button></header>
  {codingStep===0?<section className="ra-code-review">
   <div><h3>1. Review last class: Smart Light</h3><p>Read the program together. What happens when the light level is below 128? What does the else branch do?</p></div>
   <div className="ra-code-review-image"><img src="assets/smart-light-code/6.png" alt="Smart Light MakeCode program: initialize eight NeoPixels on P2; below light level 128 call TurnOn, otherwise call TurnOff."/></div>
  </section>:<section className="ra-coding-content"><h3>2. Program the moves in order</h3><p>This is an algorithm: a clear list of instructions for the robot to follow.</p>
   <pre aria-label="Robot arm sequence pseudocode">{`WHEN the start button is pressed:
  reach the load
  close the gripper
  lift the load
  turn toward delivery
  lower the load
  open the gripper`}</pre>
   <p>Test a different order in Activity. What happens when the gripper closes before the arm reaches the load?</p><small>Algorithm example. Class MakeCode images have not been added yet.</small>
  </section>}
  <nav className="ra-coding-nav" aria-label="Coding steps"><button type="button" disabled={codingStep===0} onClick={()=>setCodingStep(0)}>← Previous</button><span role="status">Step {codingStep+1} of 2</span><button type="button" disabled={codingStep===1} onClick={()=>setCodingStep(1)}>Next →</button></nav>
 </div>;
 if(mode==='warmup')return <WarmupScreen videoUrl={warmupVideoUrl}/>;
 if(mode==='story')return <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl}/>;
 const identify=mode==='identify',activity=mode==='activity';
 return <div ref={ref} className={`generic-stage ra-stage ra-stage--${mode}`}>
  <header className="ra-toolbar"><strong>{identify?'Meet the robot arm':activity?'Plan the robot’s job':'Explore the robotic arm'}</strong><div><button type="button" onClick={()=>setView(v=>v+1)}>Reset view</button><button type="button" onClick={toggleFullscreen}>{fullscreen?'Exit fullscreen':'Fullscreen'}</button></div></header>
  <div className={`ra-workspace ${identify?'ra-identify':''}`}>
   <div className="ra-world"><RobotArmModel time={identify?8:time} selected={identify?lastSelectedPart:null} onSelect={identify?onSelect:undefined} view={view} onReady={modelReady} onFailure={modelFailed}/>{!ready&&!failed?<span className="ra-loading" role="status">Loading the robotic arm…</span>:null}{activity?<ArmLoadTracker step={hasRun?runStep:undefined}/>:null}<span className="ra-orbit">Drag to turn the view · Scroll or pinch to zoom</span></div>
   {!identify?<aside className="ra-panel">{activity?<>
    <div className="ra-panel-title"><h3>Plan the moves</h3><button type="button" onClick={resetPlan}>↻ Try again</button></div>
    <p>Plan how to pick up a load and put it down somewhere else.</p>
    <div className="ra-command-options">{COMMAND_CHOICES.map(id=><button key={id} type="button" aria-label={ARM_COMMANDS.find(command=>command.id===id)!.label} disabled={plan.includes(id)||playing||!ready} onClick={()=>editPlan([...plan,id])}>{{reach:'Reach',grip:'Grip',lift:'Lift',turn:'Turn',lower:'Lower',release:'Release'}[id]}</button>)}</div>
    <ol className="ra-plan" aria-label="Your instructions">{ARM_COMMANDS.map((_,index)=><li key={index} className={hasRun?(index===stepIndex&&playing?'ra-step-current':index<=stepIndex?(runSteps[index]?.ok?'ra-step-ok':'ra-step-error'):''):''}>{plan[index]?ARM_COMMANDS.find(command=>command.id===plan[index])!.label:'Choose an instruction…'}</li>)}</ol>
    <div className="ra-plan-actions"><button type="button" disabled={!plan.length||playing} onClick={()=>editPlan(plan.slice(0,-1))}>Undo last</button><button type="button" disabled={plan.length!==6||playing||!ready} onClick={runPlan}>{playing?'Running…':'Run my plan'}</button></div>
    <div className="ra-playback-status" aria-live="off">{playing?`Step ${stepIndex+1} / 6 · ${ARM_COMMANDS.find(command=>command.id===runStep?.command)?.label??'Starting'}`:activityDone?'Run complete':plan.length<6?`${6-plan.length} instructions left to choose`:'Ready to run'}</div>
    <p className={`ra-feedback ra-feedback--${playing&&runStep?(runStep.ok?'success':'error'):tone}`} role="status">{playing&&runStep?runStep.message:message}</p><p className="ra-note">Any order can run. Follow the load tracker to see what your instructions do.</p>
   </>:<>
    <h3>Watch the joints work</h3><p>Play the supplied movement, or slide through it slowly. Follow the wrist and gripper.</p>
    <label className="ra-slider">Animation position<output>{time.toFixed(1)} s</output><input aria-label="Animation position" type="range" min="0" max={ARM_DURATION-.001} step="0.01" value={time} disabled={!ready} onChange={event=>{setPlaying(false);setTime(Number(event.target.value));}}/></label>
    <div className="ra-plan-actions"><button type="button" disabled={!ready} onClick={()=>{if(!playing&&time>=ARM_DURATION-.05)setTime(0);setPlaying(p=>!p);}}>{playing?'Pause':'Play motion'}</button><button type="button" disabled={!ready} onClick={()=>{setPlaying(false);setTime(0);}}>Restart</button></div>
    <div className="ra-pose-buttons">{[{label:'Bent arm',time:0},{label:'Arm raised',time:4},{label:'Wrist turned',time:6},{label:'Open gripper',time:8}].map(pose=><button type="button" key={pose.label} disabled={!ready} onClick={()=>{setPlaying(false);setTime(pose.time);}}>{pose.label}</button>)}</div>
    <p className="ra-note">The base stays fixed. Motor-driven joints move the links, wrist and gripper together.</p>
   </>}</aside>:null}
  </div>

 </div>;
};
