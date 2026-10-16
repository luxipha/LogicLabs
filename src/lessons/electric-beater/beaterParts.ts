export type BeaterPart = 'body' | 'handle' | 'controls' | 'beaters';
export type BeaterSpeed = 0 | 1 | 2;
const CONTROLS = new Set(['Cube001_MixerPlastic_0', 'Cube002_MixerPlastic_0', 'Cube003_MixerPlastic_0']);

// Mapped from isolated supplied meshes, not a default for unknown geometry.
export function beaterMeshPart(name: string): BeaterPart | null {
  if (name.startsWith('Beater_Left_') || name.startsWith('Beater_Right_')) return 'beaters';
  if (CONTROLS.has(name)) return 'controls';
  if (name === 'Cube_MixerPlastic_0') return 'handle';
  if (['Cube_Metal_0', 'Cube_MixerColor_0', 'Cylinder_Metal_0'].includes(name)) return 'body';
  return null;
}

export function beaterHitPart(name: string, sourceY: number): BeaterPart | null {
  // The pink housing and outer handle frame share one mesh. The top frame
  // surrounds the separately modelled grip at y=182..241 in source units.
  if (name === 'Cube_MixerColor_0' && sourceY >= 180) return 'handle';
  return beaterMeshPart(name);
}
