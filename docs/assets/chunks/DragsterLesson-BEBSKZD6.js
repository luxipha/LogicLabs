import{a as $}from"./chunk-IYMEYG2N.js";import{a as W}from"./chunk-65QTMTOS.js";import{b as O}from"./chunk-KTOBOHQX.js";import"./chunk-W6AJZAGH.js";import{Aa as K,Ba as I,Ca as V,D as F,E as R,G as H,P as G,y as D,ya as q}from"./chunk-X3OBIZGU.js";import"./chunk-W7CONZIZ.js";import{c as v,d as L,e as y}from"./chunk-HLYRQ3WR.js";var s=v(L());var e=v(y()),oe=new URL("models/dragster-classroom.glb",document.baseURI).href,ie={front:"Front wheels",rear:"Rear wheels",engine:"Engine",wing:"Rear wing"};function re(o){let n=o;for(;n;){if(["Circle_5","Circle008_12","Circle007_6","Circle014_13"].includes(n.name))return"front";if(["Circle006_47","Circle015_48","Circle016_49","Circle017_50"].includes(n.name))return"rear";if(n.name==="Plane001_20")return"wing";if(n.name==="Circle024_65"||n.name==="Cube_64")return"engine";n=n.parent}}function ne({selected:o,onSelect:n,progress:m=0}){let b=K(O,oe),d=q(i=>i.invalidate),{scene:x,materials:c}=(0,s.useMemo)(()=>{let i=b.scene.clone(!0),p=[];i.traverse(l=>{if(!(l instanceof G))return;let u=re(l);l.userData.dragsterPart=u;let r=Array.isArray(l.material),C=(r?l.material:[l.material]).map(B=>{let a=B.clone();return a.metalness=Math.min(a.metalness??0,.25),a.roughness=Math.max(a.roughness??.5,.4),p.push({material:a,id:u,emissive:a.emissive?.clone()??new R}),a});l.material=r?C:C[0]});let g=new H().setFromObject(i),w=g.getCenter(new D),h=new F;return h.add(i),i.position.sub(w),h.scale.setScalar(6/g.getSize(new D).z),{scene:h,materials:p}},[b]);return(0,s.useEffect)(()=>()=>c.forEach(({material:i})=>i.dispose()),[c]),(0,s.useEffect)(()=>{c.forEach(({material:i,id:p,emissive:g})=>{i.emissive.copy(p&&p===o?new R("#c97108"):g)}),d()},[o,c,d]),(0,e.jsx)("group",{position:[0,0,m*3-1.5],children:(0,e.jsx)("primitive",{object:x,onClick:i=>{let p=i.object.userData.dragsterPart;p&&(i.stopPropagation(),n?.(p))}})})}function U({id:o}){return(0,e.jsx)("svg",{viewBox:"0 0 100 65",width:"90",height:"55","aria-hidden":"true",children:o==="front"||o==="rear"?(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)("circle",{cx:"35",cy:"34",r:o==="rear"?24:18,fill:"#263442"}),(0,e.jsx)("circle",{cx:"35",cy:"34",r:"9",fill:"#a8b4bc"}),(0,e.jsx)("ellipse",{cx:"74",cy:"34",rx:"10",ry:o==="rear"?24:18,fill:"#263442"})]}):o==="wing"?(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)("path",{d:"M12 19L78 13 91 25 25 32Z",fill:"#e95526"}),(0,e.jsx)("path",{d:"M30 30V55M74 28V55",stroke:"#445565",strokeWidth:"5"})]}):(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)("rect",{x:"20",y:"26",width:"62",height:"27",rx:"5",fill:"#71818d"}),(0,e.jsx)("rect",{x:"30",y:"14",width:"42",height:"15",rx:"3",fill:"#333f4c"}),(0,e.jsx)("path",{d:"M20 36H10V53M82 36H92V53",stroke:"#445565",strokeWidth:"6",fill:"none"})]})})}function P({mode:o,selected:n,onSelect:m,activityDone:b,completeActivity:d,resetActivity:x}){let c=(0,s.useRef)(null),[i,p]=(0,s.useState)(0),[g,w]=(0,s.useState)(""),[h,l]=(0,s.useState)(1),[u,r]=(0,s.useState)(!1),[C,B]=(0,s.useState)(0),[a,E]=(0,s.useState)({}),[Z,A]=(0,s.useState)(!1),[J,T]=(0,s.useState)("");(0,s.useEffect)(()=>{if(o!=="activity"){r(!1);return}if(!u)return;let f=0,X=performance.now(),M=ee=>{let S=Math.min(1,(ee-X)/(h===1?4e3:2e3));B(S),S<1?f=requestAnimationFrame(M):(r(!1),A(!0),E(te=>({...te,[h]:h===1?4:2})))};return f=requestAnimationFrame(M),()=>cancelAnimationFrame(f)},[u,h,o]);let Q=()=>{r(!1),B(0),A(!1),w(""),E({}),l(1),T(""),x?.()},N=o==="identify"?n:null;return(0,e.jsxs)("section",{className:"dragster-stage",ref:c,children:[(0,e.jsxs)("header",{children:[(0,e.jsx)("strong",{children:o==="identify"?"Find the racing parts":o==="activity"?"Same track, different speeds":"Meet the dragster"}),(0,e.jsxs)("div",{children:[(0,e.jsx)("button",{onClick:()=>p(f=>f+1),children:"Reset view"}),(0,e.jsx)("button",{onClick:()=>{document.fullscreenElement?document.exitFullscreen().catch(()=>{}):c.current?.requestFullscreen?.().catch(()=>{})},children:"Fullscreen"})]})]}),(0,e.jsx)("div",{className:"dragster-model",children:(0,e.jsx)(s.Suspense,{fallback:(0,e.jsx)("div",{className:"dragster-loading",children:"Loading dragster\u2026"}),children:(0,e.jsxs)(I,{dpr:1,frameloop:"demand",gl:{antialias:!1,powerPreference:"low-power"},camera:{position:o==="activity"?[6.5,3.3,4.8]:[4.8,2.5,3.8],fov:40},children:[(0,e.jsx)("color",{attach:"background",args:["#eef3f6"]}),(0,e.jsx)("hemisphereLight",{args:["#ffffff","#8c9cac",2.8]}),(0,e.jsx)("directionalLight",{position:[4,6,3],intensity:3}),(0,e.jsx)(ne,{selected:N,onSelect:o==="identify"?m:void 0,progress:o==="activity"?C:.5}),o==="activity"&&(0,e.jsxs)("mesh",{position:[0,-.76,0],rotation:[-Math.PI/2,0,0],children:[(0,e.jsx)("planeGeometry",{args:[2,10]}),(0,e.jsx)("meshStandardMaterial",{color:"#c1cdd5"})]}),(0,e.jsx)(V,{dampingEnabled:!1,zoomEnabled:!0,rotateEnabled:!0,target:[0,0,0],minDistance:3,maxDistance:16,syncInitialTarget:!0})]},`${o}-${i}`)})}),(0,e.jsxs)("small",{children:["Drag to rotate \xB7 Pinch or scroll to zoom",N?` \xB7 ${ie[N]}`:""]}),o==="activity"&&(0,e.jsxs)("div",{className:"dragster-controls",children:[(0,e.jsxs)("div",{className:"dragster-buttons",children:[(0,e.jsxs)("label",{children:["Predict the shorter time: ",(0,e.jsxs)("select",{value:g,disabled:u||Object.keys(a).length>0,onChange:f=>w(f.target.value),children:[(0,e.jsx)("option",{value:"",children:"Choose\u2026"}),(0,e.jsx)("option",{value:"1",children:"Slow"}),(0,e.jsx)("option",{value:"2",children:"Fast"})]})]}),(0,e.jsxs)("label",{children:["Test speed: ",(0,e.jsxs)("select",{value:h,disabled:u,onChange:f=>{l(Number(f.target.value)),B(0),A(!1)},children:[(0,e.jsx)("option",{value:1,children:"Slow"}),(0,e.jsx)("option",{value:2,children:"Fast"})]})]}),(0,e.jsx)("button",{disabled:!g||u,onClick:()=>{B(0),A(!1),r(!0)},children:"Run test"}),(0,e.jsx)("button",{onClick:Q,children:"Try again"})]}),(0,e.jsxs)("p",{"aria-live":"polite",children:[u?"Testing\u2026":Z?"Finish line reached.":"Predict, then test both speeds over the same distance."," Slow: ",a[1]?`${a[1]} s`:"\u2014"," \xB7 Fast: ",a[2]?`${a[2]} s`:"\u2014"]}),a[1]&&a[2]&&(0,e.jsxs)("div",{children:[(0,e.jsxs)("p",{children:[g==="2"?"Your prediction matched!":"Compare your prediction with the results."," The faster car takes less time. Keep distance unchanged for a fair test."]}),(0,e.jsx)("button",{disabled:b,onClick:()=>{T("Investigation complete!"),d?.()},children:"Finish investigation"})]}),(0,e.jsx)("p",{className:"dragster-note",children:"Illustrative constant-speed simulation: the times are not measurements of a real racing car."}),(0,e.jsx)("span",{role:"status",children:J})]})]})}var z=v(L());var _={title:"Dragster: Drive and light the way",classIds:["Microbit"],renderer:"https://makecode.microbit.org/",extension:"bricks4kidz=github:softsmyth/lectrify-b4k#v1.4.1,neopixel=github:microsoft/pxt-neopixel#v0.7.6",footnote:"Use Bricks4Kidz motors and an eight-LED NeoPixel strip on P16 in RGB (GRB) mode. Lift the wheels for bench tests. The basic driving program has no stop button.",reference:{source:"Session 30. Dragster.pdf, physical PDF pages 15-18. Motor code on page 15; matching light code on page 18. Combined without added commands.",motorCode:`input.onButtonPressed(Button.A, function () {
    bricks4kidz.motorA(100)
    bricks4kidz.motorB(-100)
})`,lightCode:`let strip = neopixel.create(DigitalPin.P16, 8, NeoPixelMode.RGB)
basic.forever(function () {
    if (input.lightLevel() > 100) {
        strip.showColor(neopixel.colors(NeoPixelColors.Black))
        strip.show()
    } else {
        strip.showColor(neopixel.colors(NeoPixelColors.White))
        strip.show()
    }
})`,code:`input.onButtonPressed(Button.A, function () {
    bricks4kidz.motorA(100)
    bricks4kidz.motorB(-100)
})
let strip = neopixel.create(DigitalPin.P16, 8, NeoPixelMode.RGB)
basic.forever(function () {
    if (input.lightLevel() > 100) {
        strip.showColor(neopixel.colors(NeoPixelColors.Black))
        strip.show()
    } else {
        strip.showColor(neopixel.colors(NeoPixelColors.White))
        strip.show()
    }
})`,changes:[],extensionSources:["https://github.com/softsmyth/lectrify-b4k/blob/v1.4.1/main.ts","https://github.com/microsoft/pxt-neopixel/blob/v0.7.6/neopixel.ts"],notes:["Retain both explicit strip.show() calls from the PDF, even though showColor also sends the strip data.","The reference has no pause, motor stop, or running guard. Repeated A presses send the same two motor values again.","Light level exactly 100 uses the else branch (white). On first use the light API returns 0 before the sensor is ready."]},stages:[{title:"Button A controls one motor",concept:"A button event sends a motor command.",adds:"Intermediate: add on button A pressed and DC motor A power 100.",predict:"Which motor will start when A is pressed?",observe:["Press A: motor A is commanded to 100.","Motor B has no command yet.","Another press sends 100 again."],question:"Does this program ever tell motor A to stop?",code:`input.onButtonPressed(Button.A, function () {
    bricks4kidz.motorA(100)
})`,run:"Download this intermediate program. Lift the wheels, press A briefly, then disconnect motor power before changing the build.",kind:"guided"},{title:"Drive both wheels forward",concept:"Opposite motor signs suit motors facing opposite directions.",adds:"Keep motor A at 100. Add motor B at -100 inside the same Button A event.",predict:"Will opposite signs move the car forward?",observe:["A sends 100 to A and -100 to B.","Both wheels drive the car forward.","There is still no stop command."],question:"Why does motor B need the opposite sign?",code:`input.onButtonPressed(Button.A, function () {
    bricks4kidz.motorA(100)
    bricks4kidz.motorB(-100)
})`,run:"Download and lift the wheels first. Press A and check both wheel directions; then test forward motion in a clear area. Disconnect motor power to stop the car.",kind:"guided"},{title:"Connect the eight lights",concept:"A variable stores the NeoPixel strip connection.",adds:"Keep Button A. In on start, set strip to P16, 8 LEDs, RGB (GRB), then show white.",predict:"Will the lights wait for Button A?",observe:["At startup the eight LEDs show white.","A still sends the two motor commands.","The lights are not light-controlled yet."],question:"Which blocks belong in on start?",code:`input.onButtonPressed(Button.A, function () {
    bricks4kidz.motorA(100)
    bricks4kidz.motorB(-100)
})
let strip = neopixel.create(DigitalPin.P16, 8, NeoPixelMode.RGB)
strip.showColor(neopixel.colors(NeoPixelColors.White))
strip.show()`,run:"Connect the eight-LED strip to P16. Download and reset; check the external strip before pressing A.",kind:"guided",focusCode:`let strip = neopixel.create(DigitalPin.P16, 8, NeoPixelMode.RGB)
strip.showColor(neopixel.colors(NeoPixelColors.White))
strip.show()`,focusNote:"Excerpt: add these on-start blocks; keep the paired Button A motor program unchanged."},{title:"Read the surrounding light",concept:"A forever loop repeatedly reads the light level.",adds:"Keep the motors and white strip. Add a forever loop that shows the light level on the micro:bit display.",predict:"Will covering the LED display lower the reading?",observe:["The display scrolls changing light readings.","Cover or uncover the display and compare.","The external strip remains white."],question:"Why must the sensor be read repeatedly?",code:`input.onButtonPressed(Button.A, function () {
    bricks4kidz.motorA(100)
    bricks4kidz.motorB(-100)
})
let strip = neopixel.create(DigitalPin.P16, 8, NeoPixelMode.RGB)
strip.showColor(neopixel.colors(NeoPixelColors.White))
strip.show()
basic.forever(function () {
    basic.showNumber(input.lightLevel())
})`,run:"Download, then cover and uncover the micro:bit LED display. Wait for each number to finish scrolling. Motor checks still need the physical build.",kind:"guided",focusCode:`basic.forever(function () {
    basic.showNumber(input.lightLevel())
})`,focusNote:"Intermediate excerpt: add this forever loop. Keep Button A and the existing strip setup."},{title:"Drive with automatic lights",concept:"An if/else chooses the lights from the current light level.",adds:"Replace the number display and startup white command with light control: above 100, show black; otherwise, show white. Keep Button A unchanged.",predict:"At light level 100, will the strip be white?",observe:["Above 100: the strip is black (off).","At 100 or below: it shows white.","A still sends motor A 100 and B -100."],question:"Which branch runs when the light level is 100?",code:`input.onButtonPressed(Button.A, function () {
    bricks4kidz.motorA(100)
    bricks4kidz.motorB(-100)
})
let strip = neopixel.create(DigitalPin.P16, 8, NeoPixelMode.RGB)
basic.forever(function () {
    if (input.lightLevel() > 100) {
        strip.showColor(neopixel.colors(NeoPixelColors.Black))
        strip.show()
    } else {
        strip.showColor(neopixel.colors(NeoPixelColors.White))
        strip.show()
    }
})`,run:"Download. Cover and uncover the display to cross the threshold. Test Button A separately with the wheels raised. Reset and repeat the checks.",kind:"guided",focusCode:`let strip: neopixel.Strip = null
basic.forever(function () {
    if (input.lightLevel() > 100) {
        strip.showColor(neopixel.colors(NeoPixelColors.Black))
        strip.show()
    } else {
        strip.showColor(neopixel.colors(NeoPixelColors.White))
        strip.show()
    }
})`,focusNote:"Loop excerpt only: keep the P16 eight-LED strip setup and Button A motor event. See Full program for all blocks."},{title:"Try an idea: a stop button",concept:"A second event can stop both motors.",adds:"Start with the complete driving and lighting program. Add Button B with motor A 0 and motor B 0.",predict:"What should B do after A starts the motors?",observe:["A starts both motors at 100 and -100.","B sends 0 to both motors.","The light loop continues independently."],question:"Why should B stop both motors?",code:`input.onButtonPressed(Button.A, function () {
    bricks4kidz.motorA(100)
    bricks4kidz.motorB(-100)
})
let strip = neopixel.create(DigitalPin.P16, 8, NeoPixelMode.RGB)
basic.forever(function () {
    if (input.lightLevel() > 100) {
        strip.showColor(neopixel.colors(NeoPixelColors.Black))
        strip.show()
    } else {
        strip.showColor(neopixel.colors(NeoPixelColors.White))
        strip.show()
    }
})
input.onButtonPressed(Button.B, function () {
    bricks4kidz.motorA(0)
    bricks4kidz.motorB(0)
})`,run:"Download with the wheels raised. Press A, then B; repeat A-B to check restart and stop. The external light strip should still react.",kind:"idea",focusCode:`input.onButtonPressed(Button.B, function () {
    bricks4kidz.motorA(0)
    bricks4kidz.motorB(0)
})`,focusNote:"Add a separate Button B event to stop both motors. Keep the existing light-control loop."},{title:"Try an idea: compare power",concept:"A fair test changes motor power while keeping distance fixed.",adds:"Optional variation: keep the stop button; change A to 50 and B to -50 in the launch event.",predict:"Will half power give exactly half the speed?",observe:["A sends 50 to A and -50 to B.","B still stops both motors.","Compare travel time on the same track."],question:"What must stay the same for a fair comparison?",code:`input.onButtonPressed(Button.A, function () {
    bricks4kidz.motorA(50)
    bricks4kidz.motorB(-50)
})
let strip = neopixel.create(DigitalPin.P16, 8, NeoPixelMode.RGB)
basic.forever(function () {
    if (input.lightLevel() > 100) {
        strip.showColor(neopixel.colors(NeoPixelColors.Black))
        strip.show()
    } else {
        strip.showColor(neopixel.colors(NeoPixelColors.White))
        strip.show()
    }
})
input.onButtonPressed(Button.B, function () {
    bricks4kidz.motorA(0)
    bricks4kidz.motorB(0)
})`,run:"Compare this 50-power version with the full-power version over the same marked distance. Use the same surface and battery; stop with B.",kind:"idea",focusCode:`input.onButtonPressed(Button.A, function () {
    bricks4kidz.motorA(50)
    bricks4kidz.motorB(-50)
})
input.onButtonPressed(Button.B, function () {
    bricks4kidz.motorA(0)
    bricks4kidz.motorB(0)
})`,focusNote:"Set the launch power to 50/-50 and keep Button B stop. Keep the light-control program unchanged."},{title:"Try an idea: a one-second run",concept:"A pause holds the sequence before the stop commands.",adds:"Optional variation: after 50/-50, add pause 1000 ms, then set both motors to 0. Keep Button B stop.",predict:"Which command comes after the one-second pause?",observe:["A starts a one-second command sequence.","After the pause, both motors receive 0.","B can send 0 before the pause ends."],question:"Does the pause turn the motors off by itself?",code:`input.onButtonPressed(Button.A, function () {
    bricks4kidz.motorA(50)
    bricks4kidz.motorB(-50)
    basic.pause(1000)
    bricks4kidz.motorA(0)
    bricks4kidz.motorB(0)
})
let strip = neopixel.create(DigitalPin.P16, 8, NeoPixelMode.RGB)
basic.forever(function () {
    if (input.lightLevel() > 100) {
        strip.showColor(neopixel.colors(NeoPixelColors.Black))
        strip.show()
    } else {
        strip.showColor(neopixel.colors(NeoPixelColors.White))
        strip.show()
    }
})
input.onButtonPressed(Button.B, function () {
    bricks4kidz.motorA(0)
    bricks4kidz.motorB(0)
})`,run:"Press A once and wait for the timed stop before pressing A again. Check B during a run. This simple version has no running guard; avoid starting another run before the previous one finishes.",kind:"idea",focusCode:`input.onButtonPressed(Button.A, function () {
    bricks4kidz.motorA(50)
    bricks4kidz.motorB(-50)
    basic.pause(1000)
    bricks4kidz.motorA(0)
    bricks4kidz.motorB(0)
})
input.onButtonPressed(Button.B, function () {
    bricks4kidz.motorA(0)
    bricks4kidz.motorB(0)
})`,focusNote:"Replace the launch event with this timed version. Keep Button B stop and the light-control loop."},{title:"Try an idea: adjust the threshold",concept:"The threshold changes when the headlights switch on.",adds:"Start with the complete driving and lighting program. Change only the light threshold from 100 to 150.",predict:"At light level 120, will the lights turn on?",observe:["Above 150: the strip is off.","At 150 or below: it is white.","At 120, it now takes the white branch."],question:"How does a higher threshold change the response?",code:`input.onButtonPressed(Button.A, function () {
    bricks4kidz.motorA(100)
    bricks4kidz.motorB(-100)
})
let strip = neopixel.create(DigitalPin.P16, 8, NeoPixelMode.RGB)
basic.forever(function () {
    if (input.lightLevel() > 150) {
        strip.showColor(neopixel.colors(NeoPixelColors.Black))
        strip.show()
    } else {
        strip.showColor(neopixel.colors(NeoPixelColors.White))
        strip.show()
    }
})`,run:"Test the same locations with threshold 100, then 150. Compare where the strip changes. Keep motor A at 100 and motor B at -100 for this experiment.",kind:"idea",focusCode:`let strip: neopixel.Strip = null
basic.forever(function () {
    if (input.lightLevel() > 150) {
        strip.showColor(neopixel.colors(NeoPixelColors.Black))
        strip.show()
    } else {
        strip.showColor(neopixel.colors(NeoPixelColors.White))
        strip.show()
    }
})`,focusNote:"Loop excerpt only: keep the P16 eight-LED strip setup and Button A motor event. See Full program for all blocks."}]};var t=v(y()),j=_.stages.filter(o=>o.kind==="guided"),ae=_.stages.filter(o=>o.kind==="idea");function Y(){let[o,n]=(0,z.useState)("guided"),[m,b]=(0,z.useState)(0),[d,x]=(0,z.useState)("blocks"),c=o==="guided"?j:ae,i=c[m],p=_.stages.indexOf(i)+1,g=`assets/dragster-code/${d==="card"?"":d==="full"?"full-blocks-":"blocks-"}${p}.png`,w=()=>b(r=>Math.max(0,r-1)),h=()=>b(r=>Math.min(c.length-1,r+1)),l=r=>{n(r),b(0),x("blocks")},u=d==="full";return(0,t.jsxs)("section",{className:"dragster-coding","aria-label":"Dragster coding stages",tabIndex:0,onKeyDown:r=>{r.target===r.currentTarget&&(r.key==="ArrowLeft"&&(r.preventDefault(),w()),r.key==="ArrowRight"&&(r.preventDefault(),h()))},children:[(0,t.jsxs)("header",{className:"dragster-coding__header",children:[(0,t.jsxs)("div",{role:"group","aria-label":"Coding path",children:[(0,t.jsx)("button",{"aria-pressed":o==="guided",onClick:()=>l("guided"),children:"Build your dragster"}),(0,t.jsx)("button",{"aria-pressed":o==="ideas",onClick:()=>l("ideas"),children:"Try an idea"})]}),(0,t.jsxs)("div",{role:"group","aria-label":"Code view",children:[(0,t.jsx)("button",{"aria-pressed":d==="blocks",onClick:()=>x("blocks"),children:"Step close-up"}),(0,t.jsx)("button",{"aria-pressed":d==="card",onClick:()=>x("card"),children:"Teaching card"}),(0,t.jsx)("button",{"aria-pressed":u,onClick:()=>x("full"),children:"Full program"})]})]}),(0,t.jsxs)("div",{className:"dragster-coding__title",children:[(0,t.jsxs)("h2",{children:[m+1,". ",i.title.replace("Try an idea: ","")]}),(0,t.jsx)("a",{href:g,target:"_blank",rel:"noreferrer",children:"Open image \u2197"})]}),(0,t.jsx)("p",{className:"dragster-coding__context",children:o==="ideas"?"Try one change, predict what will happen, then test your idea.":m===j.length-1?"Bring driving and automatic headlights together.":"Build one step at a time. Keep your earlier blocks as you add each new part."}),(0,t.jsxs)("div",{className:`dragster-coding__body${d==="blocks"?"":" dragster-coding__body--image"}`,children:[(0,t.jsx)("div",{className:"dragster-coding__image",children:(0,t.jsx)("img",{src:g,alt:`${i.title}. Authentic MakeCode Bricks4Kidz and NeoPixel blocks. ${u||!("focusCode"in i)?"Complete runnable program.":d==="card"?"Teaching card with a labelled excerpt.":"Excerpt; retain the earlier blocks as described in Build."}`,draggable:!1},g)}),d==="blocks"&&(0,t.jsxs)("div",{className:"dragster-coding__guide",tabIndex:0,role:"region","aria-label":"Coding instructions",children:[(0,t.jsxs)("p",{children:[(0,t.jsx)("strong",{children:"Learn"}),i.concept]}),(0,t.jsxs)("p",{children:[(0,t.jsx)("strong",{children:"Predict"}),i.predict]}),(0,t.jsxs)("p",{children:[(0,t.jsx)("strong",{children:"Build"}),i.adds]}),"focusNote"in i&&(0,t.jsx)("p",{className:"dragster-coding__excerpt",children:i.focusNote}),(0,t.jsxs)("p",{children:[(0,t.jsx)("strong",{children:"Run"}),i.run]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("strong",{children:"Observe"}),(0,t.jsx)("ul",{children:i.observe.map(r=>(0,t.jsx)("li",{children:r},r))})]}),(0,t.jsxs)("p",{children:[(0,t.jsx)("strong",{children:"Explain"}),i.question]})]})]}),(0,t.jsxs)("nav",{className:"dragster-coding__navigation","aria-label":"Coding stages",children:[(0,t.jsx)("button",{onClick:w,disabled:m===0,children:"\u2190 Previous"}),(0,t.jsxs)("span",{role:"status","aria-live":"polite",children:[m+1," / ",c.length]}),(0,t.jsx)("button",{onClick:h,disabled:m===c.length-1,children:"Next \u2192"})]})]})}var k=v(y()),de=o=>(0,k.jsx)($,{content:W,...o,codingTabLabel:"Code",identifyStage:n=>(0,k.jsx)(P,{mode:"identify",selected:n.lastSelectedPart,onSelect:n.onSelect}),partPreview:n=>(0,k.jsx)(U,{id:n}),exploreStage:()=>(0,k.jsx)(P,{mode:"explore"}),activityStage:n=>(0,k.jsx)(P,{mode:"activity",...n}),stageCompletesActivity:!0,codingStage:()=>(0,k.jsx)(Y,{})}),Ne=de;export{de as DragsterLesson,Ne as default};
