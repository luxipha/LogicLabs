const fs = require('node:fs/promises');
const path = require('node:path');
const {homedir} = require('node:os');
const playwrightModule = process.env.PLAYWRIGHT_MODULE || require.resolve('playwright-core', {paths: [process.cwd(), path.join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node')]});
const {chromium} = require(playwrightModule);
const output = path.resolve('src/assets/anemometer/code');
const extension = 'nezhaV2=github:elecfreaks/pxt-nezha2#v1.2.6';
const programs = [
`input.onSound(DetectedSound.Loud, function () {})
input.onSound(DetectedSound.Quiet, function () {})
nezhaV2.stop(nezhaV2.MotorPostion.M1)
input.setSoundThreshold(SoundThreshold.Loud, 128)
input.setSoundThreshold(SoundThreshold.Quiet, 10)`,
`input.onButtonPressed(Button.A, function () { basic.showNumber(input.soundLevel()) })
input.onSound(DetectedSound.Loud, function () {})
input.onSound(DetectedSound.Quiet, function () {})
input.setSoundThreshold(SoundThreshold.Loud, 128)
input.setSoundThreshold(SoundThreshold.Quiet, 10)`,
`input.onSound(DetectedSound.Loud, function () { nezhaV2.start(nezhaV2.MotorPostion.M1, 100) })
input.setSoundThreshold(SoundThreshold.Loud, 128)
input.setSoundThreshold(SoundThreshold.Quiet, 10)`,
`input.onSound(DetectedSound.Loud, function () { nezhaV2.start(nezhaV2.MotorPostion.M1, 100) })
input.onSound(DetectedSound.Quiet, function () { nezhaV2.stop(nezhaV2.MotorPostion.M1) })
input.setSoundThreshold(SoundThreshold.Loud, 128)
input.setSoundThreshold(SoundThreshold.Quiet, 10)`,
`forever(function () {
    if (input.compassHeading() > 315 || input.compassHeading() < 45) { basic.showArrow(ArrowNames.North) }
    if (input.compassHeading() >= 45 && input.compassHeading() < 135) { basic.showArrow(ArrowNames.East) }
    if (input.compassHeading() >= 135 && input.compassHeading() < 225) { basic.showArrow(ArrowNames.South) }
    if (input.compassHeading() >= 225 && input.compassHeading() < 315) { basic.showArrow(ArrowNames.West) }
})`,
`forever(function () {
    if (input.compassHeading() >= 45 && input.compassHeading() <= 135) {
        basic.showArrow(ArrowNames.East)
        nezhaV2.start(nezhaV2.MotorPostion.M1, 25)
    }
})`,
`input.onSound(DetectedSound.Loud, function () { nezhaV2.start(nezhaV2.MotorPostion.M4, 100) })
input.onSound(DetectedSound.Quiet, function () { nezhaV2.stop(nezhaV2.MotorPostion.M4) })
forever(function () {
    if (input.compassHeading() >= 45 && input.compassHeading() <= 135) {
        basic.showArrow(ArrowNames.East)
        nezhaV2.start(nezhaV2.MotorPostion.M4, 25)
    } else {
        basic.clearScreen()
        nezhaV2.stop(nezhaV2.MotorPostion.M4)
    }
})
input.setSoundThreshold(SoundThreshold.Loud, 128)
input.setSoundThreshold(SoundThreshold.Quiet, 10)`
];
(async () => { await fs.mkdir(output, {recursive: true}); const browser = await chromium.launch({headless: true, executablePath: process.env.CHROME_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}); try { const page = await browser.newPage(); await page.setContent(`<script>window.responses={};window.addEventListener('message',e=>{if(e.origin!=='https://makecode.microbit.org'||e.data?.source!=='makecode')return;if(e.data.type==='renderready')window.ready=true;if(e.data.type==='renderblocks')window.responses[e.data.id]=e.data})</script><iframe src="https://makecode.microbit.org/--docs?render=1"></iframe>`); await page.waitForFunction(() => window.ready, {timeout: 120000}); for (let i = 0; i < programs.length; i++) for (const full of [false, true]) { const id = `${full ? 'full-' : ''}${i + 1}`; await page.evaluate(({id, code, extension, full}) => document.querySelector('iframe').contentWindow.postMessage({type: 'renderblocks', id, code, options: {package: extension, snippetMode: !full}}, 'https://makecode.microbit.org'), {id, code: programs[i], extension, full}); await page.waitForFunction(id => Boolean(window.responses[id]), id, {timeout: 120000}); const result = await page.evaluate(id => window.responses[id], id); if (result.error || !result.svg || !result.uri?.startsWith('data:image/png;base64,')) throw new Error(`${id}: ${result.error || 'empty render'}`); if (/JavaScript code|javascript_statement/.test(result.svg)) throw new Error(`${id}: fallback render`); await fs.writeFile(path.join(output, `${id}.svg`), result.svg); await fs.writeFile(path.join(output, `${id}.png`), Buffer.from(result.uri.split(',')[1], 'base64')); await fs.writeFile(path.join(output, `${id}.ts.txt`), programs[i] + '\n'); console.log(`Rendered ${id}`); } await fs.writeFile(path.join(output, 'provenance.json'), JSON.stringify({renderer: 'https://makecode.microbit.org/--docs?render=1', extension, format: 'Official renderblocks API output'}, null, 2) + '\n'); } finally { await browser.close(); } })().catch(error => { console.error(error); process.exitCode = 1; });
