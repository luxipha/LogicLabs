export type SnailPart='shell'|'tentacles'|'foot';
// The supplied model is a single textured mesh, not named anatomical pieces.
// Narrow rest-pose regions only; green 3D markers provide precise accessible targets.
export function snailHitPart(y:number,z:number):SnailPart|null {
  if(y<.12)return 'foot';
  if(z>.35&&y>.32)return 'tentacles';
  if(y>.23&&z<.22)return 'shell';
  return null;
}
export const SNAIL_MARKERS:{part:SnailPart;position:[number,number,number]}[]=[
  {part:'shell',position:[.17,.43,-.08]},
  {part:'tentacles',position:[.19,.47,.535]},
  {part:'foot',position:[.22,.065,.25]},
];
