// Patches frog_lifecycle_stages.glb so the standard GLTFLoader can read it.
//
// The model was exported by trimesh with materials that reference textures but
// declares no sampler array. Per the glTF spec a texture without a `sampler`
// defaults to sampler 0 — which must exist. three's GLTFLoader looks up
// samplers[0] and throws when the array is empty, so the model fails to load.
// This script inserts a single default (linear/linear, clamp) sampler and
// points every texture at it, then rewrites the GLB (JSON chunk only).
import fs from 'node:fs';

const src = process.argv[2];
const out = process.argv[3];
const buf = fs.readFileSync(src);

// GLB layout: 12-byte header, then a JSON chunk (u32 length + 'JSON' + data),
// then an optional BIN chunk (u32 length + 'BIN\0' + data).
const magic = buf.readUInt32LE(0);
const version = buf.readUInt32LE(4);
const jsonLen = buf.readUInt32LE(12);
if (magic !== 0x46546c67 || version !== 2) {
  throw new Error('Not a GLB v2 file');
}
const jsonStr = buf.toString('utf8', 20, 20 + jsonLen);
const json = JSON.parse(jsonStr);

// Default sampler: linear min/mag filtering, clamp-to-edge wrapping.
json.samplers = json.samplers ?? [];

// If a texture is missing a sampler reference, assign sampler 0.
if (Array.isArray(json.textures)) {
  for (const tex of json.textures) {
    if (tex.sampler === undefined) {
      tex.sampler = 0;
    }
  }
}
if (json.samplers.length === 0) {
  json.samplers.push({
    magFilter: 9729,
    minFilter: 9729,
    wrapS: 33071,
    wrapT: 33071,
  });
}

const newJson = Buffer.from(JSON.stringify(json), 'utf8');
const binStart = 20 + jsonLen;
const binChunk = buf.subarray(binStart);
const hasBin = binChunk.length >= 8 && binChunk.toString('utf8', 4, 8) === 'BIN\0';

const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + newJson.length + (hasBin ? binChunk.length : 0), 8);

const jsonChunk = Buffer.alloc(8 + newJson.length);
jsonChunk.writeUInt32LE(newJson.length, 0);
jsonChunk.write('JSON', 4);
newJson.copy(jsonChunk, 8);

fs.writeFileSync(out, Buffer.concat([header, jsonChunk, binChunk]));
console.log(`Patched ${out}: samplers=${json.samplers.length} textures=${json.textures.length}`);