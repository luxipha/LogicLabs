// Preserve source, node transforms, textures and animation; simplify indexed geometry.
// Reproduce: node scripts/prepare-ultrasonic.mjs
import fs from 'node:fs/promises';
import {MeshoptSimplifier} from 'meshoptimizer';
await MeshoptSimplifier.ready;
const source = await fs.readFile('public/models/ultrasonic.glb');
const length = source.readUInt32LE(12), doc = JSON.parse(source.subarray(20, 20 + length));
const bin = source.subarray(28 + length), oldViews = doc.bufferViews, oldAccessors = doc.accessors;
const sizes = {5121: 1, 5123: 2, 5125: 4, 5126: 4}, components = {SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16};
const chunks = [], views = [], accessors = []; let offset = 0, before = 0, after = 0;
function append(bytes) {
 const padded = Buffer.alloc(Math.ceil(bytes.length / 4) * 4); bytes.copy(padded);
 const id = views.length; views.push({buffer: 0, byteOffset: offset, byteLength: bytes.length});
 chunks.push(padded); offset += padded.length; return id;
}
function read(id) {
 const a = oldAccessors[id], v = oldViews[a.bufferView];
 if (a.sparse || !sizes[a.componentType]) throw Error('Unsupported source accessor');
 const width = sizes[a.componentType] * components[a.type], bytes = Buffer.alloc(a.count * width);
 for (let i = 0; i < a.count; i++) bin.copy(bytes, i * width, (v.byteOffset ?? 0) + (a.byteOffset ?? 0) + i * (v.byteStride ?? width), (v.byteOffset ?? 0) + (a.byteOffset ?? 0) + i * (v.byteStride ?? width) + width);
 return bytes;
}
function add(a, bytes) { const id = accessors.length; accessors.push({...a, bufferView: append(bytes), byteOffset: 0}); return id; }
for (const mesh of doc.meshes) for (const p of mesh.primitives) {
 if (p.targets || p.mode !== undefined && p.mode !== 4) throw Error('Review changed source');
 const pa = oldAccessors[p.attributes.POSITION], positions = new Float32Array(read(p.attributes.POSITION).buffer);
 const ia = oldAccessors[p.indices], ib = read(p.indices), indices = Uint32Array.from(ia.componentType === 5125 ? new Uint32Array(ib.buffer) : new Uint16Array(ib.buffer));
 const [simple] = MeshoptSimplifier.simplify(indices, positions, 3, Math.floor(indices.length * .22 / 3) * 3, .004, ['Permissive']);
 before += indices.length / 3; after += simple.length / 3;
 const map = new Map(), compact = Array.from(simple, old => {if (!map.has(old)) map.set(old, map.size); return map.get(old);});
 for (const [key, id] of Object.entries(p.attributes)) {
  const a = oldAccessors[id], bytes = read(id), width = sizes[a.componentType] * components[a.type], packed = Buffer.alloc(map.size * width);
  for (const [old, next] of map) bytes.copy(packed, next * width, old * width, (old + 1) * width);
  const next = {...a, count: map.size}; delete next.min; delete next.max;
  if (key === 'POSITION') { next.min = [Infinity, Infinity, Infinity]; next.max = [-Infinity, -Infinity, -Infinity]; for (const old of map.keys()) for (let k = 0; k < 3; k++) {next.min[k] = Math.min(next.min[k], positions[old * 3 + k]); next.max[k] = Math.max(next.max[k], positions[old * 3 + k]);} }
  p.attributes[key] = add(next, packed);
 }
 p.indices = add({componentType: 5125, count: compact.length, type: 'SCALAR'}, Buffer.from(new Uint32Array(compact).buffer));
}
const extra = new Map();
function preserve(id) { if (!extra.has(id)) extra.set(id, add(oldAccessors[id], read(id))); return extra.get(id); }
for (const a of doc.animations ?? []) for (const s of a.samplers) {s.input = preserve(s.input); s.output = preserve(s.output);}
for (const skin of doc.skins ?? []) if (skin.inverseBindMatrices !== undefined) skin.inverseBindMatrices = preserve(skin.inverseBindMatrices);
for (const image of doc.images) { const v = oldViews[image.bufferView]; image.bufferView = append(bin.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength)); }
doc.accessors = accessors; doc.bufferViews = views; doc.buffers = [{byteLength: offset}];
const json = Buffer.from(JSON.stringify(doc)), padded = Buffer.alloc(Math.ceil(json.length / 4) * 4, 32); json.copy(padded);
const header = Buffer.alloc(20); header.writeUInt32LE(0x46546c67); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + padded.length + offset, 8); header.writeUInt32LE(padded.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
const bh = Buffer.alloc(8); bh.writeUInt32LE(offset); bh.writeUInt32LE(0x004e4942, 4);
const output = Buffer.concat([header, padded, bh, ...chunks]); await fs.writeFile('public/models/ultrasonic-classroom.glb', output);
console.log(`${before} -> ${after} triangles; ${source.length} -> ${output.length} bytes`);
