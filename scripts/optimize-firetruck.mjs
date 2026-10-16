// Run: node scripts/optimize-firetruck.mjs
// Preserve the source scan. Simplify with UV/normal error constraints and repack
// only referenced vertices. The source has no redundant UV streams to remove.
import fs from 'node:fs/promises';
import sharp from 'sharp';
import {MeshoptSimplifier} from 'meshoptimizer';

await MeshoptSimplifier.ready;
const source = await fs.readFile('public/models/firetruck.glb');
const jsonLength = source.readUInt32LE(12);
const gltf = JSON.parse(source.subarray(20, 20 + jsonLength));
const bin = source.subarray(28 + jsonLength);
if (source.toString('utf8', 0, 4) !== 'glTF' || source.readUInt32LE(4) !== 2) throw new Error('Expected GLB v2');
if (gltf.animations?.length || gltf.skins?.length) throw new Error('This optimizer only handles the static firetruck scan');
const oldAccessors = gltf.accessors, oldViews = gltf.bufferViews;
const accessors = [], views = [], chunks = [];
let offset = 0, trianglesBefore = 0, trianglesAfter = 0;
const width = {SCALAR: 1, VEC2: 2, VEC3: 3};
const read = (index) => {
  const a = oldAccessors[index], view = oldViews[a.bufferView];
  const Type = {5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array}[a.componentType];
  if (!Type || !width[a.type] || a.sparse) throw new Error('Unexpected accessor');
  const result = new Type(a.count * width[a.type]);
  const bytes = width[a.type] * Type.BYTES_PER_ELEMENT;
  for (let i = 0; i < a.count; i++) {
    const start = (view.byteOffset ?? 0) + (a.byteOffset ?? 0) + i * (view.byteStride ?? bytes);
    new Uint8Array(result.buffer, i * bytes, bytes).set(bin.subarray(start, start + bytes));
  }
  return result;
};
const append = (bytes, target) => {
  const padding = (4 - offset % 4) % 4;
  if (padding) { chunks.push(Buffer.alloc(padding)); offset += padding; }
  const index = views.length;
  views.push({buffer: 0, byteOffset: offset, byteLength: bytes.length, ...(target ? {target} : {})});
  chunks.push(bytes); offset += bytes.length;
  return index;
};
const attribute = (data, type, componentType, target) => {
  const result = {bufferView: append(Buffer.from(data.buffer, data.byteOffset, data.byteLength), target), componentType, count: data.length / width[type], type};
  if (type === 'VEC3' && target === 34962) {
    result.min = [Infinity, Infinity, Infinity]; result.max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < data.length; i++) { const axis = i % 3; result.min[axis] = Math.min(result.min[axis], data[i]); result.max[axis] = Math.max(result.max[axis], data[i]); }
  }
  accessors.push(result); return accessors.length - 1;
};
for (const mesh of gltf.meshes) for (const primitive of mesh.primitives) {
  const position = read(primitive.attributes.POSITION);
  const normal = read(primitive.attributes.NORMAL);
  const uv = read(primitive.attributes.TEXCOORD_0);
  const indices = Uint32Array.from(read(primitive.indices));
  const attributes = new Float32Array(position.length / 3 * 5);
  for (let i = 0; i < position.length / 3; i++) attributes.set([...normal.subarray(i*3, i*3+3), ...uv.subarray(i*2, i*2+2)], i*5);
  const [simplified] = MeshoptSimplifier.simplifyWithAttributes(indices, position, 3, attributes, 5, [.5, .5, .5, 2, 2], null, Math.floor(indices.length * .35 / 3) * 3, .005);
  trianglesBefore += indices.length / 3; trianglesAfter += simplified.length / 3;
  // compactMesh updates the index buffer and returns old -> new vertex IDs.
  const [remap, count] = MeshoptSimplifier.compactMesh(simplified);
  const compact = (input, components) => {
    const output = new Float32Array(count * components);
    for (let i = 0; i < remap.length; i++) if (remap[i] !== 0xffffffff) output.set(input.subarray(i*components, (i+1)*components), remap[i]*components);
    return output;
  };
  primitive.attributes = {
    POSITION: attribute(compact(position, 3), 'VEC3', 5126, 34962),
    NORMAL: attribute(compact(normal, 3), 'VEC3', 5126, 34962),
    TEXCOORD_0: attribute(compact(uv, 2), 'VEC2', 5126, 34962),
  };
  primitive.indices = attribute(simplified, 'SCALAR', 5125, 34963);
}
for (const image of gltf.images) {
  const view = oldViews[image.bufferView];
  const bytes = bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
  const optimized = await sharp(bytes).jpeg({quality: 85}).toBuffer();
  image.bufferView = append(optimized.length < bytes.length ? optimized : bytes);
}
gltf.accessors = accessors; gltf.bufferViews = views;
const padding = (4 - offset % 4) % 4;
chunks.push(Buffer.alloc(padding)); offset += padding;
gltf.buffers = [{byteLength: offset}];
const json = Buffer.from(JSON.stringify(gltf)), jsonPad = Buffer.alloc((4-json.length%4)%4, 0x20);
const header = Buffer.alloc(20); header.write('glTF'); header.writeUInt32LE(2, 4);
header.writeUInt32LE(28 + json.length + jsonPad.length + offset, 8);
header.writeUInt32LE(json.length + jsonPad.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
const binHeader = Buffer.alloc(8); binHeader.writeUInt32LE(offset); binHeader.writeUInt32LE(0x004e4942, 4);
const output = Buffer.concat([header, json, jsonPad, binHeader, ...chunks]);
await fs.writeFile('public/models/firetruck-classroom.glb', output);
console.log(`Firetruck: ${trianglesBefore} -> ${trianglesAfter} triangles; ${(source.length/1048576).toFixed(1)} -> ${(output.length/1048576).toFixed(1)} MiB`);
