/** Compose classroom cards from cached, authentic MakeCode renderblocks exports.
 * Refresh block artwork first with: node scripts/render-earthquake-blocks.cjs
 * No block shapes, labels, colors, fields, or dropdowns are drawn by this script.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {stages} from './earthquake-coding-stages.mjs';

const output = path.resolve('src/assets/earth_quake/code');
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const text = (x,y,s,size=28,fill='#19364d',weight=400) => `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;
function wrap(s,max) {const result=[];let line='';for(const word of s.split(' ')){if((line+' '+word).trim().length>max){result.push(line);line=word;}else line=(line+' '+word).trim();}if(line)result.push(line);return result;}
async function artwork(id,x,y,width,height) {
  const data=await fs.readFile(path.join(output,'rendered',`${id}.png`));
  const {width:w,height:h}=await sharp(data).metadata();
  const scale=Math.min(width/w,height/h);
  const targetWidth=w*scale;const targetHeight=h*scale;
  return `<image x="${x}" y="${y+(height-targetHeight)/2}" width="${targetWidth}" height="${targetHeight}" href="data:image/png;base64,${data.toString('base64')}"/>`;
}
for(let i=0;i<stages.length;i++) {
  const stage=stages[i];
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs><pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M22 25h6m-3-3v6" stroke="#cbdde6" stroke-width="1.3"/></pattern></defs>
  <rect width="1600" height="900" fill="#edf5f8"/><rect width="1600" height="900" fill="url(#grid)"/>
  <rect x="40" y="26" width="1520" height="100" rx="22" fill="#ccecff" stroke="#2466aa" stroke-width="4"/>
  ${text(70,90,`Step ${i+1} — ${stage.title}`,42,'#153f6d',700)}
  ${text(60,164,i===0?'BUILD THIS FIRST':'NEW BLOCKS — KEEP THE REST OF YOUR PROGRAM',20,'#47647a',700)}
  ${await artwork(String(i+1),60,188,910,475)}
  <rect x="1005" y="162" width="550" height="510" rx="22" fill="#fff8df" stroke="#edb42a" stroke-width="4"/>
  ${text(1035,207,'OBSERVE AFTER RUNNING',26,'#765817',700)}`;
  let y=252;
  for(const item of stage.observe) {
    svg+=text(1032,y,'•',29,'#8a6b21',700);
    for(const line of wrap(item,30)){svg+=text(1057,y,line,27,'#173b5c',600);y+=34;}y+=12;
  }
  svg+=text(60,698,i===6?'Guard + timing excerpt: keep the warning and shaking loop inside the if.':'Real Nezha V2 blocks • Full program shows the complete placement and sequence.',19,'#47647a');
  svg+=`<rect x="40" y="714" width="1520" height="150" rx="22" fill="#e5f6e9" stroke="#49a26b" stroke-width="4"/>`+text(70,754,'THINK & EXPLAIN',22,'#2b734b',700);
  let qy=795;for(const line of wrap(stage.question,85)){svg+=text(70,qy,line,30,'#173b5c',700);qy+=36;}
  svg+='</svg>';
  await fs.writeFile(path.join(output,`${i+1}.svg`),svg);
  await sharp(Buffer.from(svg)).png().toFile(path.join(output,`${i+1}.png`));

  // Cumulative reference uses a taller canvas so every authentic block remains visible.
  let full=`<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1700" viewBox="0 0 2400 1700"><rect width="2400" height="1700" fill="#edf5f8"/>
  ${text(50,70,`Stage ${i+1} — Full program`,42,'#153f6d',700)}
  <rect x="25" y="100" width="1570" height="1560" rx="20" fill="#fff" stroke="#d3e1e8"/>
  ${await artwork(`full-${i+1}`,50,125,1520,1510)}
  <rect x="1620" y="100" width="750" height="1560" rx="20" fill="#fff8df" stroke="#edb42a" stroke-width="3"/>
  ${text(1650,160,'OBSERVE AFTER RUNNING',28,'#765817',700)}`;
  let fy=225;for(const item of stage.observe){for(const line of wrap('• '+item,42)){full+=text(1650,fy,line,29,'#173b5c',600);fy+=42;}fy+=24;}
  fy+=45;full+=text(1650,fy,'THINK & EXPLAIN',26,'#2b734b',700);fy+=55;
  for(const line of wrap(stage.question,41)){full+=text(1650,fy,line,29,'#173b5c',600);fy+=42;}
  full+=text(1650,1530,'ShakingLevel controls this model’s motor speed.',24,'#47647a');
  full+=text(1650,1570,'It is not real earthquake magnitude.',24,'#47647a');
  full+='</svg>';
  await fs.writeFile(path.join(output,`full-${i+1}.svg`),full);
  await sharp(Buffer.from(full)).png().toFile(path.join(output,`full-${i+1}.png`));
}
await fs.writeFile(path.join(output,'README.md'),`# Earthquake coding images\n\nSeven close-up cards (1600 × 900) and seven complete-program references (2400 × 1700).\n\nAll block artwork in rendered/ is exported by Microsoft MakeCode's documented renderblocks API with the official ELECFREAKS Nezha V2 extension. This artwork is not hand-drawn. Each export includes its exact TypeScript source and authentic SVG. provenance.json records the renderer and extension.\n\nRefresh artwork: node scripts/render-earthquake-blocks.cjs\nCompose cards offline: node scripts/generate-earthquake-coding.mjs\n\nClose-ups are excerpts. Use Full program for the complete sequence and placement. The final close-up omits the existing warning/loop; the full reference includes them.\n`);
console.log('Composed seven close-ups and seven full references from authentic MakeCode exports.');
