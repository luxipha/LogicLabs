import React from 'react';
import type {ArmRunStep} from './robotArmLogic';
export const ArmLoadTracker:React.FC<{step?:ArmRunStep}>=({step})=>{
 const load=step?.load??'pickup';
 const x=load==='delivered'?147:load==='held'?(step?.atDelivery?137:57):load==='dropped'?100:35;
 const y=load==='held'?(step?.high?15:37):load==='dropped'?63:45;
 const label={pickup:'At pickup',held:'In the gripper',dropped:'Dropped',delivered:'Delivered'}[load];
 return <div className={`ra-load-tracker ra-load-tracker--${load}`}><strong>Load tracker · {label}</strong><svg viewBox="0 0 185 88" role="img" aria-label={`Load: ${label.toLowerCase()}`}><path d="M20 62H165" stroke="#8aadb5" strokeWidth="2"/><rect x="15" y="56" width="45" height="7" rx="3" fill="#e9b958"/><rect x="125" y="56" width="45" height="7" rx="3" fill="#48a68c"/>{load==='held'?<path d={`M${x-10} ${y-12}v9h20v-9`} fill="none" stroke="#344f61" strokeWidth="4"/>:null}<rect x={x-8} y={y-8} width="16" height="16" rx="2" fill={load==='dropped'?'#bd463b':'#e9654c'}/><text x="37" y="80" textAnchor="middle">Pickup</text><text x="147" y="80" textAnchor="middle">Delivery</text></svg></div>;
};
