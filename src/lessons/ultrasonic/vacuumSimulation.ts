// One world unit is 1 / CM centimetres. Distance is measured from the
// vacuum's front rim to the nearest of the room's four inner wall faces.
export const CM = .035;
export const ROOM_X = 3.4;
export const ROOM_Z = 2.4;
export const VACUUM_RADIUS = .43;
export type Wall = 'North' | 'East' | 'South' | 'West';
export type VacuumState = {
  x: number; z: number; angle: number; phase: 'moving' | 'alarm' | 'turning';
  phaseTime: number; turnFrom: number; distance: number; wall: Wall;
};
export type WallEvent = {wall: Wall; distance: number; contact: boolean};
export function readWall(x: number, z: number, angle: number): {distance: number; wall: Wall} {
  const dx = Math.sin(angle), dz = Math.cos(angle);
  const tx = Math.abs(dx) < 1e-8 ? Infinity : ((dx > 0 ? ROOM_X : -ROOM_X) - x) / dx;
  const tz = Math.abs(dz) < 1e-8 ? Infinity : ((dz > 0 ? ROOM_Z : -ROOM_Z) - z) / dz;
  return {distance: Math.max(0, (Math.min(tx, tz) - VACUUM_RADIUS) / CM), wall: tx < tz ? dx > 0 ? 'East' : 'West' : dz > 0 ? 'South' : 'North'};
}
export function createVacuumState(): VacuumState {
  return {x: 0, z: 0, angle: 0, phase: 'moving', phaseTime: 0, turnFrom: 0, ...readWall(0, 0, 0)};
}
export function stepVacuum(state: VacuumState, delta: number, speed: number, threshold: number): WallEvent | null {
  const dt = Math.min(Math.max(delta, 0), .05);
  let event: WallEvent | null = null;
  if (state.phase === 'alarm') {
    state.phaseTime += dt;
    if (state.phaseTime >= .55) {state.phase = 'turning'; state.phaseTime = 0; state.turnFrom = state.angle;}
  } else if (state.phase === 'turning') {
    state.phaseTime = Math.min(.8, state.phaseTime + dt);
    const t = state.phaseTime / .8;
    state.angle = state.turnFrom + Math.PI / 2 * (t * t * (3 - 2 * t));
    if (t >= 1) {state.angle = (state.turnFrom + Math.PI / 2) % (Math.PI * 2); state.phase = 'moving'; state.phaseTime = 0;}
  } else {
    const reading = readWall(state.x, state.z, state.angle);
    const travel = Math.min(Math.max(0, reading.distance - threshold), speed * dt) * CM;
    state.x += Math.sin(state.angle) * travel;
    state.z += Math.cos(state.angle) * travel;
    const next = readWall(state.x, state.z, state.angle);
    if (next.distance <= threshold + 1e-6) {
      state.phase = 'alarm'; state.phaseTime = 0;
      event = {wall: next.wall, distance: Math.max(0, Math.round(next.distance * 10) / 10), contact: next.distance < .01};
    }
  }
  Object.assign(state, readWall(state.x, state.z, state.angle));
  return event;
}
