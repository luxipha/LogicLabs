import type {FiretruckPart} from './FiretruckDiagram';

// Verified against the replacement GLB's geometry and world-space bounds.
// Tyres and rims are separate meshes; Object_30 is the rear access ladder.
const WHEELS = new Set(['Object_52', 'Object_54', 'Object_57', 'Object_59', 'Object_62', 'Object_64', 'Object_67', 'Object_69']);
const CAB_SURFACES = new Set(['Object_8', 'Object_9', 'Object_15', 'Object_18', 'Object_19', 'Object_20', 'Object_28', 'Object_32', 'Object_33', 'Object_38', 'Object_44']);
export type TruckPoint = {x: number; y: number; z: number};

export const firetruckMeshPart = (name: string): FiretruckPart | null => name.startsWith('Firetruck_Hose_') ? 'hose' : WHEELS.has(name) ? 'wheels' : name === 'Object_30' ? 'ladder' : null;

export function firetruckHitPart(name: string, point: TruckPoint): FiretruckPart | null {
  const mapped = firetruckMeshPart(name);
  if (mapped) return mapped;
  // Body colours are batched across the truck. Only accept inspected cab
  // surfaces in the front compartment, above the chassis. Never default the
  // remaining truck, roof rails, warning lights or equipment to a target.
  if (CAB_SURFACES.has(name) && Math.abs(point.x) <= 3.3 && point.y >= .5 && point.y <= 6.2 && point.z >= -8.7 && point.z <= -.5) return 'cab';
  return null;
}
