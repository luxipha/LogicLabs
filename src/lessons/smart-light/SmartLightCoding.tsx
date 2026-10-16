import React, {useState} from 'react';
const STEPS=[['Add the NeoPixel extension','In MakeCode, open Extensions and search for neopixel.'],['Create the strip','On start: use pin P16, 8 LEDs and RGB (GRB format).'],['Turn on the light','Show red on the strip.'],['Make TurnOn','Create a function that shows red and updates the strip.'],['Make TurnOff','Clear the strip, then use strip.show() to send the change.'],['Read the sensor','Use Input → light level to read the micro:bit light sensor.'],['Make the automatic decision','Keep checking: below 128 → TurnOn; otherwise → TurnOff.']];
const PROGRAM=`let strip = neopixel.create(DigitalPin.P16, 8, NeoPixelMode.RGB)
function TurnOn() {
    strip.showColor(neopixel.colors(NeoPixelColors.Red))
}
function TurnOff() {
    strip.clear()
    strip.show()
}
basic.forever(function () {
    if (input.lightLevel() < 128) {
        TurnOn()
    } else {
        TurnOff()
    }
})`;
export const SmartLightCoding:React.FC=()=>{const [step,setStep]=useState(0);return <div className="sl-coding">
 <header><strong>{step+1}. {STEPS[step][0]}</strong><span>{step+1} / {STEPS.length}</span></header><p>{STEPS[step][1]}</p>
 <div className="sl-code-view">{step<6?<img src={`assets/smart-light-code/${step+1}.png`} alt={`Smart Light class coding slide: ${STEPS[step][0]}`}/>:<div className="sl-final-program"><div className="sl-code-rule"><strong>forever</strong><span>if light level &lt; 128 → TurnOn</span><span>else → TurnOff</span></div><pre aria-label="MakeCode JavaScript program">{PROGRAM}</pre></div>}</div>
 <nav aria-label="Coding steps"><button type="button" disabled={step===0} onClick={()=>setStep(v=>v-1)}>← Previous</button><span role="status">Step {step+1} of 7</span><button type="button" disabled={step===6} onClick={()=>setStep(v=>v+1)}>Next →</button></nav>
</div>};
