import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import {SmartLightStage} from './SmartLightStage';
import {DuskLampPartPreview} from './DuskDawnLamp';
import content from './content.json';
import './smart-light.css';
export const SmartLightLesson: React.FC<{
 onHome?:()=>void;onComplete?:()=>void;onReset?:()=>void;warmupVideoUrl?:string;onDraw?:()=>void;onBoard?:()=>void;
}> = ({onHome,onComplete,...props})=><GenericLesson content={content} onHome={onHome??(()=>{})} onComplete={onComplete??(()=>{})} {...props} stageCompletesActivity codingTab storyPresentation="video" stage={stageProps=><SmartLightStage {...stageProps}/>} partPreview={part=><DuskLampPartPreview part={part}/>}/>;
export default SmartLightLesson;
