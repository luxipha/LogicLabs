import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import {SmartLightStage} from './SmartLightStage';
import {SmartLightPartPreview} from './SmartLightDiagram';
import content from './content.json';
import './smart-light.css';
export const SmartLightLesson: React.FC<{
 onHome?:()=>void;onComplete?:()=>void;onReset?:()=>void;warmupVideoUrl?:string;onDraw?:()=>void;onBoard?:()=>void;
}> = ({onHome,onComplete,...props})=><GenericLesson content={content} onHome={onHome??(()=>{})} onComplete={onComplete??(()=>{})} {...props} stageCompletesActivity codingTab storyPresentation="reading" stage={stageProps=><SmartLightStage {...stageProps}/>} partPreview={part=><SmartLightPartPreview part={part}/>}/>;
export default SmartLightLesson;
