export const ARM_COMMANDS = [
 {id:'reach',label:'Reach the load'},
 {id:'grip',label:'Close the gripper'},
 {id:'lift',label:'Lift the load'},
 {id:'turn',label:'Turn toward delivery'},
 {id:'lower',label:'Lower the load'},
 {id:'release',label:'Open the gripper'},
] as const;
export type ArmCommand = typeof ARM_COMMANDS[number]['id'];
export const COMMAND_CHOICES:ArmCommand[]=['turn','release','reach','lower','grip','lift'];
export type LoadPlace='pickup'|'held'|'dropped'|'delivered';
export type ArmRunStep={command:ArmCommand;load:LoadPlace;atDelivery:boolean;high:boolean;message:string;ok:boolean};
// The load tracker models command consequences; the supplied GLB demonstrates
// motion separately because its single baked clip has no independent joint rig.
export function simulateArmPlan(plan:ArmCommand[]):ArmRunStep[]{
 let load:LoadPlace='pickup',atDelivery=false,high=true;
 return plan.map(command=>{
  let message='',ok=true;
  switch(command){
   case 'reach':atDelivery=false;high=false;message=load==='pickup'?'The claw reaches the load.':'The claw reaches pickup, but the load is no longer there.';break;
   case 'grip':
    if(load==='pickup'&&!atDelivery&&!high){load='held';message='The gripper holds the load.';}
    else{ok=false;message='The claw closes on empty space. Reach the load before gripping.';}break;
   case 'lift':high=true;if(load==='held')message='The load lifts clear of the work area.';else{ok=false;message='The arm lifts without the load. Grip it first.';}break;
   case 'turn':
    atDelivery=true;
    if(!high){ok=false;if(load==='held'){load='dropped';message='The low load hits the work area and drops. Lift before turning.';}else message='The low claw catches the work area. Lift before turning.';}
    else if(load!=='held'){ok=false;message='The arm turns toward delivery without a load.';}
    else message='The arm carries the raised load toward delivery.';break;
   case 'lower':high=false;if(load==='held'&&atDelivery)message='The load is lowered over delivery.';else{ok=false;message=load==='held'?'The load is lowered at pickup. Turn toward delivery first.':'The empty claw lowers. There is no load to place.';}break;
   case 'release':
    if(load==='held'){
     if(atDelivery&&!high){load='delivered';message='Delivered! The gripper releases the load onto the pad.';}
     else{load='dropped';ok=false;message=high?'The load drops from the raised claw. Lower it over delivery before releasing.':'The load is released at pickup. Carry it to delivery first.';}
    }else{ok=false;message='The claw opens with nothing to release. Grip and carry the load first.';}break;
  }
  return{command,load,atDelivery,high,message,ok};
 });
}
export const COMMAND_POSES:Record<ArmCommand,number>={reach:8,grip:6,lift:4,turn:2,lower:0,release:8};
export const PLAN_STEP_SECONDS=1.6;
