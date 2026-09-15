import fs from 'node:fs/promises';
import sharp from 'sharp';

// Resize embedded textures without changing geometry, materials or transforms.
const source = process.argv[2] ?? 'public/models/TREX.glb';
const destination = process.argv[3] ?? source;
const original = await fs.readFile(source);
if (original.readUInt32LE(0) !== 0x46546c67 || original.readUInt32LE(4) !== 2) throw new Error('Expected GLB v2');
const jsonLength = original.readUInt32LE(12);
const gltf = JSON.parse(original.subarray(20, 20 + jsonLength).toString('utf8'));
const binary = original.subarray(28 + jsonLength);
const replacements = new Map();
for (const image of gltf.images ?? []) {
  const view = gltf.bufferViews[image.bufferView];
  const bytes = binary.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
  const texture = sharp(bytes).resize({width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true});
  const optimized = image.mimeType === 'image/png'
    ? await texture.png({compressionLevel: 9}).toBuffer()
    : await texture.jpeg({quality: 85}).toBuffer();
  replacements.set(image.bufferView, optimized.length < bytes.length ? optimized : bytes);
}
let offset = 0;
const chunks = [];
for (const [index, view] of gltf.bufferViews.entries()) {
  if ((view.buffer ?? 0) !== 0) throw new Error('Expected a single embedded buffer');
  const bytes = replacements.get(index) ?? binary.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
  view.byteOffset = offset; view.byteLength = bytes.length;
  chunks.push(bytes);
  const padding = (4 - bytes.length % 4) % 4;
  if (padding) chunks.push(Buffer.alloc(padding));
  offset += bytes.length + padding;
}
gltf.buffers[0].byteLength = offset;
const json = Buffer.from(JSON.stringify(gltf));
const jsonPadding = Buffer.alloc((4 - json.length % 4) % 4, 0x20);
const jsonHeader = Buffer.alloc(8); jsonHeader.writeUInt32LE(json.length + jsonPadding.length); jsonHeader.writeUInt32LE(0x4e4f534a, 4);
const binHeader = Buffer.alloc(8); binHeader.writeUInt32LE(offset); binHeader.writeUInt32LE(0x004e4942, 4);
const header = Buffer.alloc(12); header.writeUInt32LE(0x46546c67); header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + json.length + jsonPadding.length + 8 + offset, 8);
const result = Buffer.concat([header, jsonHeader, json, jsonPadding, binHeader, ...chunks]);
await fs.writeFile(destination, result);
console.log(`${source}: ${(original.length / 1048576).toFixed(1)} MiB → ${(result.length / 1048576).toFixed(1)} MiB`);
