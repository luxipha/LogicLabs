/** Export authentic block SVG/PNG images using MakeCode's documented renderblocks API.
 * Requires playwright-core (PLAYWRIGHT_MODULE may point to an existing installation).
 * Run only when changing the block programs; ordinary lesson builds use cached exports.
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const {homedir} = require('node:os');
const playwrightModule = process.env.PLAYWRIGHT_MODULE || require.resolve('playwright-core', {paths: [process.cwd(), path.join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node')]});
const {chromium} = require(playwrightModule);
const output = path.resolve('src/assets/earth_quake/code/rendered');
const extension = 'nezhaV2=github:elecfreaks/pxt-nezha2';

function sourceFor(blocks, stage, focused) {
  const declared = new Set();
  const variable = s => s.replaceAll('Shaking level', 'ShakingLevel').replaceAll('Shake duration', 'ShakeDuration');
  function emit(b) {
    const inner = () => b.children.map(emit).join('\n');
    const n = b.text.match(/\[([^\]]+)\]/g)?.map(s => s.slice(1,-1)) ?? [];
    if(b.category === 'input') return `input.onButtonPressed(Button.A, function () {\n${inner()}\n})`;
    if(b.text === 'on start') return inner();
    if(b.category === 'loops' && b.text.startsWith('repeat')) return `for (let index = 0; index < ${n[0]}; index++) {\n${inner()}\n}`;
    if(b.category === 'loops') return `while (ShakingLevel > 4) {\n${inner()}\n}`;
    if(b.category === 'logic') return `if (Running == false) {\n${inner()}\n}`;
    if(b.category === 'variables' && b.text.startsWith('set')) {
      const name = variable(n[0]); const prefix=declared.has(name)?'':'let '; declared.add(name);
      return `${prefix}${name} = ${n[1]}`;
    }
    if(b.category === 'variables') return `ShakingLevel += -1`;
    if(b.category === 'motor' && /stop/.test(b.text)) return 'nezhaV2.stop(nezhaV2.MotorPostion.M1)';
    if(b.category === 'motor') return `nezhaV2.start(nezhaV2.MotorPostion.M1, ${n[1] === 'Shaking level × 10' ? 'ShakingLevel * 10' : n[1]})`;
    if(b.category === 'music') return 'music.playTone(523, music.beat(BeatFraction.Half))';
    if(b.text.includes('show icon')) return `basic.showIcon(IconNames.${b.text.includes('tick') ? 'Yes' : 'Surprised'})`;
    if(b.text.includes('clear screen')) return 'basic.clearScreen()';
    if(b.text.includes('show number')) return 'basic.showNumber(ShakingLevel)';
    if(b.text.includes('pause')) return `basic.pause(${variable(n[0])})`;
    throw new Error(`Unsupported block: ${b.text}`);
  }
  // Close-ups for stages 4–6 need a real variable declaration to compile.
  let prefix='';
  if(focused && stage===4) {prefix='let ShakingLevel = 9\n';declared.add('ShakingLevel');}
  if(focused && stage===5) {prefix='let ShakingLevel = 9\n';declared.add('ShakingLevel');}
  return prefix+blocks.map(emit).join('\n');
}
(async () => {
  const {stages, focused} = await import('./earthquake-coding-stages.mjs');
  await fs.mkdir(output,{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  try {
    const page=await browser.newPage();
    await page.setContent(`<script>window.responses={};window.ready=false;window.addEventListener('message',e=>{if(e.origin!=='https://makecode.microbit.org'||e.data?.source!=='makecode')return;if(e.data.type==='renderready')window.ready=true;if(e.data.type==='renderblocks')window.responses[e.data.id]=e.data})</script><iframe src="https://makecode.microbit.org/--docs?render=1"></iframe>`);
    await page.waitForFunction(()=>window.ready,{timeout:120000});
    for(let i=0;i<stages.length;i++) for(const closeup of [true,false]) {
      const id=`${closeup?'':'full-'}${i+1}`;
      if (process.argv.includes('--full-only') && closeup) continue;
      const code=sourceFor(closeup?focused[i]:stages[i].code,i,closeup);
      await fs.writeFile(path.join(output,`${id}.ts.txt`),code+'\n');
      await page.evaluate(({id,code,extension,closeup})=>document.querySelector('iframe').contentWindow.postMessage({type:'renderblocks',id,code,options:{package:extension,snippetMode:closeup}},'https://makecode.microbit.org'),{id,code,extension,closeup});
      await page.waitForFunction(id=>Boolean(window.responses[id]),id,{timeout:120000});
      const result=await page.evaluate(id=>window.responses[id],id);
      if(result.error||!result.svg||!result.uri?.startsWith('data:image/png;base64,'))throw new Error(`${id}: ${result.error||'No rendered blocks'}`);
      // A grey JavaScript fallback means decompilation failed to produce the requested real blocks.
      if(/JavaScript code|javascript_statement/.test(result.svg))throw new Error(`${id}: JavaScript fallback in output`);
      await fs.writeFile(path.join(output,`${id}.svg`),result.svg);
      await fs.writeFile(path.join(output,`${id}.png`),Buffer.from(result.uri.split(',')[1],'base64'));
      console.log(`Rendered ${id}: ${result.width} × ${result.height}`);
    }
    await fs.writeFile(path.join(output,'provenance.json'),JSON.stringify({renderer:'https://makecode.microbit.org/--docs?render=1',extension,renderedAt:new Date().toISOString(),format:'Official renderblocks API output; no hand-drawn block artwork'},null,2)+'\n');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
