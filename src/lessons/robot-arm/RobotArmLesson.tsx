import React from 'react';
import {GenericLesson} from '../generic/GenericLesson';
import {RobotArmStage} from './RobotArmStage';
import {RobotArmPreview} from './RobotArmModel';
import content from './content.json';
import './robot-arm.css';
export const RobotArmLesson: React.FC<{
 onHome?:()=>void; onComplete?:()=>void; onReset?:()=>void; warmupVideoUrl?:string; onDraw?:()=>void; onBoard?:()=>void;
}> = ({onHome,onComplete,...props}) => <GenericLesson content={content} onHome={onHome??(()=>{})} onComplete={onComplete??(()=>{})} {...props} stageCompletesActivity codingTab stage={stageProps=><RobotArmStage {...stageProps}/>} partPreview={part=><RobotArmPreview part={part}/>}/>;
export default RobotArmLesson;
