// Keep the supplied rig and four classroom motions; repack live accessors and resize its texture.
// Reproduce with: node scripts/prepare-elephant.mjs
import fs from 'node:fs/promises';
import sharp from 'sharp';
const source = await fs.readFile('public/models/elephant.glb');
const length = source.readUInt32LE(12);
const doc = JSON.parse(source.subarray(20, 20 + length).toString());
const bin = source.subarray(28 + length);
if (doc.extensionsRequired?.length) throw Error('Review required extensions before repacking.');
doc.animations = doc.animations.filter(a => ['TRS|idle', 'TRS|walk', 'TRS|eating', 'TRS|rest'].includes(a.name));
if (doc.animations.length !== 4) throw Error('Classroom animation names changed.');
const used = new Set();
for (const mesh of doc.meshes) for (const p of mesh.primitives) {
  Object.values(p.attributes).forEach(id => used.add(id));
  if (p.indices !== undefined) used.add(p.indices);
  for (const target of p.targets ?? []) Object.values(target).forEach(id => used.add(id));
}
for (const skin of doc.skins ?? []) if (skin.inverseBindMatrices !== undefined) used.add(skin.inverseBindMatrices);
for (const a of doc.animations) for (const s of a.samplers) {used.add(s.input); used.add(s.output);}
const map = new Map();
const accessors = doc.accessors.filter((_, i) => {if (!used.has(i)) return false; map.set(i, map.size); return true;});
for (const mesh of doc.meshes) for (const p of mesh.primitives) {
  for (const key in p.attributes) p.attributes[key] = map.get(p.attributes[key]);
  if (p.indices !== undefined) p.indices = map.get(p.indices);
  for (const target of p.targets ?? []) for (const key in target) target[key] = map.get(target[key]);
}
for (const skin of doc.skins ?? []) if (skin.inverseBindMatrices !== undefined) skin.inverseBindMatrices = map.get(skin.inverseBindMatrices);
for (const a of doc.animations) for (const s of a.samplers) {s.input = map.get(s.input); s.output = map.get(s.output);}
const oldViews = doc.bufferViews, views = [], chunks = [];
let offset = 0;
const append = data => {
  const id = views.length, padded = Buffer.alloc(Math.ceil(data.length / 4) * 4);
  data.copy(padded); views.push({buffer: 0, byteOffset: offset, byteLength: data.length});
  chunks.push(padded); offset += padded.length; return id;
};
const sizes = {5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4};
const components = {SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16};
for (const a of accessors) {
  if (a.sparse || a.bufferView === undefined) throw Error('Review sparse accessor.');
  const v = oldViews[a.bufferView], element = sizes[a.componentType] * components[a.type];
  const start = (v.byteOffset ?? 0) + (a.byteOffset ?? 0), packed = Buffer.alloc(a.count * element);
  for (let i = 0; i < a.count; i++) bin.copy(packed, i * element, start + i * (v.byteStride ?? element), start + i * (v.byteStride ?? element) + element);
  a.bufferView = append(packed); delete a.byteOffset;
}
for (const image of doc.images) {
  const v = oldViews[image.bufferView], bytes = bin.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength);
  const metadata = await sharp(bytes).metadata();
  console.log(`Texture: ${metadata.width}x${metadata.height} -> maximum 1024px`);
  image.bufferView = append(await sharp(bytes).resize({width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true}).jpeg({quality: 85}).toBuffer());
  image.mimeType = 'image/jpeg';
}
doc.accessors = accessors; doc.bufferViews = views; doc.buffers = [{byteLength: offset}];
const json = Buffer.from(JSON.stringify(doc)), padded = Buffer.alloc(Math.ceil(json.length / 4) * 4, 32); json.copy(padded);
const head = Buffer.alloc(20); head.writeUInt32LE(0x46546c67); head.writeUInt32LE(2, 4); head.writeUInt32LE(28 + padded.length + offset, 8); head.writeUInt32LE(padded.length, 12); head.writeUInt32LE(0x4e4f534a, 16);
const bh = Buffer.alloc(8); bh.writeUInt32LE(offset); bh.writeUInt32LE(0x004e4942, 4);
const out = Buffer.concat([head, padded, bh, ...chunks]);
await fs.writeFile('public/models/elephant-classroom.glb', out);
console.log(`${source.length} -> ${out.length} bytes; original source preserved.`);
