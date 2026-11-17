import{a as f}from"./chunk-JED2IUV2.js";import"./chunk-7653QGSE.js";import{a as g}from"./chunk-QTCICSK5.js";import"./chunk-PVXMCOJX.js";import"./chunk-72IDAISC.js";import"./chunk-X3OBIZGU.js";import"./chunk-W7CONZIZ.js";import{c as s,d as m,e as r}from"./chunk-HLYRQ3WR.js";var c=s(m());var o={title:"Earth Quake Alert",renderer:"https://makecode.microbit.org/",extension:"",footnote:"3g/6g/8g are acceleration thresholds, not earthquake magnitude. Peak Force is the reference label: this program stores the highest triggered threshold, not a precise peak-force measurement. Test gestures in MakeCode; speaker audio depends on board hardware.",stages:[{title:"Show an X when shaken",concept:"An event runs when a gesture is detected.",adds:"Add on shake. Put show icon X inside it.",predict:"What will appear when you shake the board?",observe:["Shake the simulator: an X appears.","The X stays on until the display changes."],question:"Which block detects the shake?",code:`input.onGesture(Gesture.Shake, function () {
    basic.showIcon(IconNames.No)
})`},{title:"Choose the shaking levels",concept:"Gesture dropdowns choose acceleration thresholds.",adds:"Replace on shake with 3g. Add separate 6g and 8g events.",predict:"Will 3g and 8g show the same response?",observe:["Trigger 3g: Minor Quake scrolls.","Trigger 6g: a happy face.","Trigger 8g: an X."],question:"Which event gives the strongest warning?",code:`input.onGesture(Gesture.ThreeG, function () {
    basic.showString("Minor Quake")
})

input.onGesture(Gesture.SixG, function () {
    basic.showIcon(IconNames.Happy)
})

input.onGesture(Gesture.EightG, function () {
    basic.showIcon(IconNames.No)
})`},{title:"Add warning sounds",concept:"Sound makes an alert easier to notice.",adds:"Keep the displays. Add a tone at 6g and a melody at 8g.",predict:"Which alert will play the longer sound?",observe:["6g: happy face and a short tone.","8g: X and an eight-note melody.","3g still scrolls Minor Quake."],question:"How can sound help us notice an alert?",code:`input.onGesture(Gesture.ThreeG, function () {
    basic.showString("Minor Quake")
})

input.onGesture(Gesture.SixG, function () {
    basic.showIcon(IconNames.Happy)
    music.playTone(262, music.beat(BeatFraction.Half))
})

input.onGesture(Gesture.EightG, function () {
    basic.showIcon(IconNames.No)
    music.playMelody("C5 G C5 G C5 G C5 G ", 120)
})`,focusCode:`input.onGesture(Gesture.SixG, function () {
    basic.showIcon(IconNames.Happy)
    music.playTone(262, music.beat(BeatFraction.Half))
})

input.onGesture(Gesture.EightG, function () {
    basic.showIcon(IconNames.No)
    music.playMelody("C5 G C5 G C5 G C5 G ", 120)
})`,focusNote:"Replace the 6g and 8g handlers as shown. Keep the 3g handler unchanged."},{title:"Repeat the strong warning",concept:"A repeat loop runs the enclosed blocks several times.",adds:"Wrap the 8g alert in repeat 3. Clear the LEDs and pause after each melody.",predict:"How many times will the 8g melody play?",observe:["8g: X and melody repeat 3 times.","LEDs clear after each melody.","6g still plays one short tone."],question:"Which blocks are inside the repeat loop?",code:`input.onGesture(Gesture.ThreeG, function () {
    basic.showString("Minor Quake")
})

input.onGesture(Gesture.SixG, function () {
    basic.showIcon(IconNames.Happy)
    music.playTone(262, music.beat(BeatFraction.Half))
})

input.onGesture(Gesture.EightG, function () {
    for (let index = 0; index < 3; index++) {
        basic.showIcon(IconNames.No)
        music.playMelody("C5 G C5 G C5 G C5 G ", 120)
        basic.clearScreen()
        basic.pause(100)
    }
})`,focusCode:`input.onGesture(Gesture.EightG, function () {
    for (let index = 0; index < 3; index++) {
        basic.showIcon(IconNames.No)
        music.playMelody("C5 G C5 G C5 G C5 G ", 120)
        basic.clearScreen()
        basic.pause(100)
    }
})`,focusNote:"Replace only the 8g handler. Keep 3g and 6g unchanged. One melody now repeats three times."},{title:"Store the detected level",concept:"A variable stores a value for later use.",adds:"Create MaxShake. Set it to 3000, 6000 or 8000 in the events. B displays it.",predict:"After 8g then 3g, what will B show?",observe:["Start: happy face and MaxShake = 0.","8g then 3g: B shows 3000.","This version stores the latest level."],question:"Why did 3000 replace 8000?",code:`let MaxShake = 0
basic.showIcon(IconNames.Happy)
MaxShake = 0

input.onGesture(Gesture.ThreeG, function () {
    MaxShake = 3000
    basic.showString("Minor Quake")
})

input.onGesture(Gesture.SixG, function () {
    MaxShake = 6000
    basic.showIcon(IconNames.Happy)
    music.playTone(262, music.beat(BeatFraction.Half))
})

input.onGesture(Gesture.EightG, function () {
    MaxShake = 8000
    for (let index = 0; index < 3; index++) {
        basic.showIcon(IconNames.No)
        music.playMelody("C5 G C5 G C5 G C5 G ", 120)
        basic.clearScreen()
        basic.pause(100)
    }
})

input.onButtonPressed(Button.B, function () {
    basic.showNumber(MaxShake)
})`,focusCode:`let MaxShake = 0
basic.showIcon(IconNames.Happy)
MaxShake = 0
input.onGesture(Gesture.ThreeG, function () {
    MaxShake = 3000
    basic.showString("Minor Quake")
})
input.onButtonPressed(Button.B, function () {
    basic.showNumber(MaxShake)
})`,focusNote:"Add the variable and B readout. Set 3000, 6000 and 8000 at the start of the matching handlers; 3g is shown."},{title:"Keep only the highest level",concept:"An if condition chooses whether to replace a value.",adds:"Only set MaxShake when the new level is greater than the stored value.",predict:"After 8g then 3g, what will B show now?",observe:["8g then 3g: B shows 8000.","A smaller level cannot lower the record.","Restart resets the stored value to 0."],question:"What does greater than protect?",code:`let MaxShake = 0
basic.showIcon(IconNames.Happy)
MaxShake = 0

input.onGesture(Gesture.ThreeG, function () {
    if (3000 > MaxShake) {
        MaxShake = 3000
    }
    basic.showString("Minor Quake")
})

input.onGesture(Gesture.SixG, function () {
    if (6000 > MaxShake) {
        MaxShake = 6000
    }
    basic.showIcon(IconNames.Happy)
    music.playTone(262, music.beat(BeatFraction.Half))
})

input.onGesture(Gesture.EightG, function () {
    if (8000 > MaxShake) {
        MaxShake = 8000
    }
    for (let index = 0; index < 3; index++) {
        basic.showIcon(IconNames.No)
        music.playMelody("C5 G C5 G C5 G C5 G ", 120)
        basic.clearScreen()
        basic.pause(100)
    }
})

input.onButtonPressed(Button.B, function () {
    basic.showNumber(MaxShake)
})`,focusCode:`let MaxShake = 0
input.onGesture(Gesture.ThreeG, function () {
    if (3000 > MaxShake) {
        MaxShake = 3000
    }
    basic.showString("Minor Quake")
})`,focusNote:"Replace each direct assignment with an if comparison. The 3g change is shown; use 6000 for 6g and 8000 for 8g."},{title:"Reuse the comparison",concept:"A function packages code that several events share.",adds:"Move the comparison into updateMax(currentG). Call it with each level.",predict:"Will the highest reading change after this edit?",observe:["3g calls updateMax with 3000.","6g uses 6000; 8g uses 8000.","B still shows the highest saved level."],question:"Why use one function in three events?",code:`let MaxShake = 0
basic.showIcon(IconNames.Happy)
MaxShake = 0

function updateMax(currentG: number) {
    if (currentG > MaxShake) {
        MaxShake = currentG
    }
}

input.onGesture(Gesture.ThreeG, function () {
    updateMax(3000)
    basic.showString("Minor Quake")
})

input.onGesture(Gesture.SixG, function () {
    updateMax(6000)
    basic.showIcon(IconNames.Happy)
    music.playTone(262, music.beat(BeatFraction.Half))
})

input.onGesture(Gesture.EightG, function () {
    updateMax(8000)
    for (let index = 0; index < 3; index++) {
        basic.showIcon(IconNames.No)
        music.playMelody("C5 G C5 G C5 G C5 G ", 120)
        basic.clearScreen()
        basic.pause(100)
    }
})

input.onButtonPressed(Button.B, function () {
    basic.showNumber(MaxShake)
})`,focusCode:`let MaxShake = 0

function updateMax(currentG: number) {
    if (currentG > MaxShake) {
        MaxShake = currentG
    }
}

input.onGesture(Gesture.ThreeG, function () {
    updateMax(3000)
    basic.showString("Minor Quake")
})`,focusNote:"Create updateMax and replace each repeated comparison with a call. This excerpt shows the 3g change."},{title:"Reset for a new test",concept:"A button event can reset the stored result.",adds:"Add Button A: set MaxShake to 0, clear screen, show the ready face.",predict:"After A, what will B show?",observe:["A clears the saved level to 0.","A shows the ready face.","New events begin a fresh record."],question:"Why reset before a new test?",code:`let MaxShake = 0
basic.showIcon(IconNames.Happy)
MaxShake = 0

function updateMax(currentG: number) {
    if (currentG > MaxShake) {
        MaxShake = currentG
    }
}

input.onGesture(Gesture.ThreeG, function () {
    updateMax(3000)
    basic.showString("Minor Quake")
})

input.onGesture(Gesture.SixG, function () {
    updateMax(6000)
    basic.showIcon(IconNames.Happy)
    music.playTone(262, music.beat(BeatFraction.Half))
})

input.onGesture(Gesture.EightG, function () {
    updateMax(8000)
    for (let index = 0; index < 3; index++) {
        basic.showIcon(IconNames.No)
        music.playMelody("C5 G C5 G C5 G C5 G ", 120)
        basic.clearScreen()
        basic.pause(100)
    }
})

input.onButtonPressed(Button.B, function () {
    basic.showNumber(MaxShake)
})

input.onButtonPressed(Button.A, function () {
    MaxShake = 0
    basic.clearScreen()
    basic.showIcon(IconNames.Happy)
})`,focusCode:`let MaxShake = 0

input.onButtonPressed(Button.A, function () {
    MaxShake = 0
    basic.clearScreen()
    basic.showIcon(IconNames.Happy)
})`,focusNote:"Add this Button A handler. Keep the startup, gestures, updateMax function and Button B."},{title:"Read the result in g",concept:"Dividing milli-g by 1000 converts it to g.",adds:"Change B to show Peak Force, rounded MaxShake / 1000, then g.",predict:"What will B show when MaxShake is 6000?",observe:["6g then B: Peak Force, 6, g.","8g then 3g: B still reports 8g.","A then B: the saved level is 0g."],question:"Why do we divide by 1000?",code:`let MaxShake = 0
basic.showIcon(IconNames.Happy)
MaxShake = 0

function updateMax(currentG: number) {
    if (currentG > MaxShake) {
        MaxShake = currentG
    }
}

input.onGesture(Gesture.ThreeG, function () {
    updateMax(3000)
    basic.showString("Minor Quake")
})

input.onGesture(Gesture.SixG, function () {
    updateMax(6000)
    basic.showIcon(IconNames.Happy)
    music.playTone(262, music.beat(BeatFraction.Half))
})

input.onGesture(Gesture.EightG, function () {
    updateMax(8000)
    for (let index = 0; index < 3; index++) {
        basic.showIcon(IconNames.No)
        music.playMelody("C5 G C5 G C5 G C5 G ", 120)
        basic.clearScreen()
        basic.pause(100)
    }
})

input.onButtonPressed(Button.A, function () {
    MaxShake = 0
    basic.clearScreen()
    basic.showIcon(IconNames.Happy)
})

input.onButtonPressed(Button.B, function () {
    basic.showString("Peak Force:")
    basic.showNumber(Math.round(MaxShake / 1000))
    basic.showString("g")
})`,focusCode:`let MaxShake = 0

input.onButtonPressed(Button.B, function () {
    basic.showString("Peak Force:")
    basic.showNumber(Math.round(MaxShake / 1000))
    basic.showString("g")
})`,focusNote:"Replace the old Button B handler. Keep everything else. The result is the highest threshold, not exact force."},{title:"Complete the earthquake alert",concept:"A busy flag prevents overlapping display and sound sequences.",adds:"Set busy before an alert or readout; clear it afterwards. Press A or B after the alert finishes.",predict:"Will another alert interrupt the melody?",observe:["One alert sequence plays at a time.","New thresholds still update MaxShake.","When finished, A resets; B reports g."],question:"Why update the record before checking busy?",code:`let busy = false
let MaxShake = 0
basic.showIcon(IconNames.Happy)
MaxShake = 0
busy = false

function updateMax(currentG: number) {
    if (currentG > MaxShake) {
        MaxShake = currentG
    }
}

input.onGesture(Gesture.ThreeG, function () {
    updateMax(3000)
    if (!(busy)) {
        busy = true
        basic.showString("Minor Quake")
        busy = false
    }
})

input.onGesture(Gesture.SixG, function () {
    updateMax(6000)
    if (!(busy)) {
        busy = true
        basic.showIcon(IconNames.Happy)
        music.playTone(262, music.beat(BeatFraction.Half))
        busy = false
    }
})

input.onGesture(Gesture.EightG, function () {
    updateMax(8000)
    if (!(busy)) {
        busy = true
        for (let index = 0; index < 3; index++) {
            basic.showIcon(IconNames.No)
            music.playMelody("C5 G C5 G C5 G C5 G ", 120)
            basic.clearScreen()
            basic.pause(100)
        }
        busy = false
    }
})

input.onButtonPressed(Button.A, function () {
    if (!(busy)) {
        busy = true
        MaxShake = 0
        basic.clearScreen()
        basic.showIcon(IconNames.Happy)
        busy = false
    }
})

input.onButtonPressed(Button.B, function () {
    if (!(busy)) {
        busy = true
        basic.showString("Peak Force:")
        basic.showNumber(Math.round(MaxShake / 1000))
        basic.showString("g")
        busy = false
    }
})`,focusCode:`let busy = false
let MaxShake = 0

function updateMax(currentG: number) {
    if (currentG > MaxShake) {
        MaxShake = currentG
    }
}

input.onGesture(Gesture.EightG, function () {
    updateMax(8000)
    if (!(busy)) {
        busy = true
        for (let index = 0; index < 3; index++) {
            basic.showIcon(IconNames.No)
            music.playMelody("C5 G C5 G C5 G C5 G ", 120)
            basic.clearScreen()
            basic.pause(100)
        }
        busy = false
    }
})`,focusNote:"Final addition: guard each display/sound handler with busy. Full program shows all events and both buttons."}]};var e=s(r());function G(){let[n,h]=(0,c.useState)(0),[i,l]=(0,c.useState)(!1),a=o.stages[n],d=`assets/earthquake-alert-code/${i?"full-":""}${n+1}.png`,p=()=>h(t=>Math.max(0,t-1)),b=()=>h(t=>Math.min(o.stages.length-1,t+1));return(0,e.jsxs)("section",{className:"eq-coding","aria-label":"Earth Quake Alert coding stages",tabIndex:0,onKeyDown:t=>{t.key==="ArrowLeft"&&(t.preventDefault(),p()),t.key==="ArrowRight"&&(t.preventDefault(),b())},children:[(0,e.jsxs)("header",{className:"eq-coding__header",children:[(0,e.jsx)("strong",{children:"Earth Quake Alert Coding"}),(0,e.jsxs)("div",{children:[(0,e.jsx)("button",{"aria-pressed":!i,onClick:()=>l(!1),children:"Step close-up"}),(0,e.jsx)("button",{"aria-pressed":i,onClick:()=>l(!0),children:"Full program"}),(0,e.jsx)("a",{href:d,target:"_blank",rel:"noreferrer",children:"Open full-size image \u2197"})]})]}),(0,e.jsx)("div",{className:"eq-coding__image",children:(0,e.jsx)("img",{src:d,alt:`Stage ${n+1}: ${a.title}. ${i?"Complete runnable program":"Teaching card with authentic MakeCode blocks"}. ${a.adds} Predict: ${a.predict} Observe: ${a.observe.join(" ")} Explain: ${a.question}`,draggable:!1})}),(0,e.jsxs)("nav",{className:"eq-coding__navigation","aria-label":"Coding stages",children:[(0,e.jsx)("button",{onClick:p,disabled:n===0,children:"\u2190 Previous"}),(0,e.jsxs)("span",{role:"status","aria-live":"polite",children:[n+1," / ",o.stages.length]}),(0,e.jsx)("button",{onClick:b,disabled:n===o.stages.length-1,children:"Next \u2192"})]})]})}var u=s(r()),w=n=>(0,u.jsx)(f,{...n,lessonContent:g,codingStage:()=>(0,u.jsx)(G,{})}),v=w;export{v as default};
