const block = (category, text, children) => ({category,text,children});
const icon = block('basic','show icon  [surprised]');
const warning = () => block('loops','repeat [3] times', [icon,block('music','play tone [High C] for [½] beat'),block('basic','clear screen'),block('basic','pause (ms) [200]')]);
const pause = n => block('basic',`pause (ms) [${n}]`);
const showLevel = () => block('basic','show number [Shaking level]');
const setLevel = n => block('variables',`set [Shaking level] to [${n}]`);
const run = () => block('motor','run motor [M1] at [Shaking level × 10] %');
const stop = () => block('motor','stop motor [M1]');
const decrease = () => block('variables','change [Shaking level] by [-1]');
const event = children => block('input','on button [A] pressed',children);
const cycle = duration => [showLevel(),pause(1000),run(),pause(duration),stop(),block('basic','clear screen'),pause(1000),decrease()];
const stages = [
 {title:'Start with Button A',concept:'Events: a button starts the program.',add:['Place a show-icon block inside','the Button A event.'],observe:['Before pressing A, the screen stays clear.','Press A: the surprised icon appears.'],question:'What tells the program to start?',trace:'PRESS A → ICON',code:[event([icon])]},
 {title:'Give three warnings',concept:'Sequences and repeat loops.',add:['Add a short tone, clear the screen,','and pause. Repeat the warning 3 times.'],observe:['Count three flashes and three beeps.','The motor stays still throughout.'],question:'Why do we put all four blocks inside repeat?',trace:'FLASH + BEEP → REPEAT × 3',code:[event([warning()])]},
 {title:'Move, then stop',concept:'Motor commands and timing.',add:['After the warning, start M1 at 50%.','Wait 2 seconds, then stop M1.'],observe:['The warnings finish before motion begins.','The gears turn and the platform shakes.','After 2 seconds, the motor stops.'],question:'What would happen without the stop block?',trace:'WARN → MOVE 2 s → STOP',code:[event([warning(),block('motor','run motor [M1] at [50] %'),pause(2000),stop()])]},
 {title:'Store a shaking level',concept:'Variables store values used by the motor.',add:['Create Shaking level and set it to 5.','Display it. Use level × 10 for motor speed.'],observe:['Level 5 gives 50% motor speed.','Change the starting level to 9 and rerun.','Level 9 gives 90% motor speed.'],question:'What speed would level 7 produce?',trace:'LEVEL 5 × 10 = 50%',code:[event([warning(),setLevel(5),showLevel(),pause(1000),run(),pause(2000),stop()])]},
 {title:'Decrease the stored value',concept:'Changing a variable updates its value.',add:['Start at level 9. After the motor stops,','decrease the level by 1 and display it.'],observe:['The motor runs once at 90%, then stops.','The display changes from 9 to 8.','Changing the value does not restart M1.'],question:'What speed would the next motor command use?',trace:'RUN AT 9 → STOP → LEVEL 8',code:[event([warning(),setLevel(9),showLevel(),pause(1000),run(),pause(2000),stop(),decrease(),showLevel()])]},
 {title:'Repeat while the level is above 4',concept:'A while loop checks its condition every cycle.',add:['Put the entire shaking cycle inside','while Shaking level > 4. Decrease inside it.'],observe:['M1 runs at 90%, 80%, 70%, 60%, then 50%.','It stops and pauses between cycles.','The final display is 4; M1 never runs at 40%.'],question:'Why does the loop stop when the value becomes 4?',trace:'9 → 8 → 7 → 6 → 5 | STOP AT 4',code:[event([warning(),setLevel(9),block('loops','while [Shaking level > 4]',cycle(2000)),showLevel()])]},
 {title:'Complete the earthquake machine',concept:'Combine events, variables, loops, and a running guard.',add:['Use Shake duration = 5000 ms.','Running prevents overlapping Button A runs.'],observe:['Three warnings happen before shaking.','Five cycles run, each with 5 seconds of motion.','Extra A presses during a run are ignored.','A tick appears when the sequence finishes.'],question:'Change duration to 2000 ms. What changes? What stays the same?',trace:'WARN × 3 → LEVELS 9–5 → TICK',code:[block('basic','on start',[block('variables','set [Running] to [false]'),stop(),block('basic','clear screen')]),event([block('logic','if [Running = false] then',[block('variables','set [Running] to [true]'),warning(),setLevel(9),block('variables','set [Shake duration] to [5000]'),block('loops','while [Shaking level > 4]',cycle('Shake duration')),stop(),block('basic','show icon [tick]'),block('variables','set [Running] to [false]')])])]},
];

const focused = [
 [event([icon])],
 [event([warning()])],
 [block('motor','run motor [M1] at [50] %'),pause(2000),stop()],
 [setLevel(5),showLevel(),run()],
 [decrease(),showLevel()],
 [block('loops','while [Shaking level > 4]',cycle(2000))],
 [block('basic','on start',[block('variables','set [Running] to [false]')]),
  block('logic','if [Running = false] then',[
   block('variables','set [Running] to [true]'),
   block('variables','set [Shake duration] to [5000]'),
   stop(),block('basic','show icon [tick]'),block('variables','set [Running] to [false]')])],
];

export {stages, focused};
