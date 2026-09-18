import fs from 'node:fs/promises';

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  throw new Error('Usage: node scripts/compress-goalkeeper-glb.mjs <input.glb> <output.glb>');
}

const COMPONENT_BYTES = {
  5120: 1,
  5121: 1,
  5122: 2,
  5123: 2,
  5125: 4,
  5126: 4,
};
const TYPE_COMPONENTS = {SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16};
const align4 = (value) => (value + 3) & ~3;

const source = await fs.readFile(inputPath);
if (source.toString('utf8', 0, 4) !== 'glTF') throw new Error('Input must be a binary GLB file.');
const jsonLength = source.readUInt32LE(12);
const jsonStart = 20;
const jsonEnd = jsonStart + jsonLength;
const binLength = source.readUInt32LE(jsonEnd);
const binStart = jsonEnd + 8;
const json = JSON.parse(source.subarray(jsonStart, jsonEnd).toString('utf8'));
const bin = source.subarray(binStart, binStart + binLength);

// Sketchfab exported this model with 9–10 identical UV streams per primitive.
// Three.js only needs TEXCOORD_0 for its materials, so remove the unused streams
// and repack the retained attributes into compact buffer views.
for (const mesh of json.meshes ?? []) {
  for (const primitive of mesh.primitives ?? []) {
    for (const attribute of Object.keys(primitive.attributes ?? {})) {
      if (/^TEXCOORD_[1-9]\d*$/.test(attribute)) delete primitive.attributes[attribute];
    }
  }
}

const usedAccessors = new Set();
for (const mesh of json.meshes ?? []) {
  for (const primitive of mesh.primitives ?? []) {
    if (primitive.indices !== undefined) usedAccessors.add(primitive.indices);
    for (const accessor of Object.values(primitive.attributes ?? {})) usedAccessors.add(accessor);
    for (const target of primitive.targets ?? []) {
      for (const accessor of Object.values(target)) usedAccessors.add(accessor);
    }
  }
}

const packedViews = [];
const chunks = [];
let byteOffset = 0;
for (const accessorIndex of usedAccessors) {
  const accessor = json.accessors[accessorIndex];
  const sourceView = json.bufferViews[accessor.bufferView];
  const componentBytes = COMPONENT_BYTES[accessor.componentType];
  const componentCount = TYPE_COMPONENTS[accessor.type];
  if (!componentBytes || !componentCount) throw new Error(`Unsupported accessor ${accessorIndex}.`);
  const elementBytes = componentBytes * componentCount;
  const stride = sourceView.byteStride ?? elementBytes;
  const sourceOffset = (sourceView.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  const packed = Buffer.alloc(accessor.count * elementBytes);
  for (let index = 0; index < accessor.count; index++) {
    bin.copy(packed, index * elementBytes, sourceOffset + index * stride, sourceOffset + index * stride + elementBytes);
  }
  const padding = Buffer.alloc(align4(byteOffset) - byteOffset);
  if (padding.length) {
    chunks.push(padding);
    byteOffset += padding.length;
  }
  const viewIndex = packedViews.length;
  packedViews.push({
    buffer: 0,
    byteOffset,
    byteLength: packed.length,
    target: sourceView.target,
  });
  chunks.push(packed);
  byteOffset += packed.length;
  accessor.bufferView = viewIndex;
  delete accessor.byteOffset;
}

for (const image of json.images ?? []) {
  const sourceView = json.bufferViews[image.bufferView];
  const imageBytes = bin.subarray(sourceView.byteOffset ?? 0, (sourceView.byteOffset ?? 0) + sourceView.byteLength);
  const padding = Buffer.alloc(align4(byteOffset) - byteOffset);
  if (padding.length) {
    chunks.push(padding);
    byteOffset += padding.length;
  }
  image.bufferView = packedViews.length;
  packedViews.push({buffer: 0, byteOffset, byteLength: imageBytes.length});
  chunks.push(imageBytes);
  byteOffset += imageBytes.length;
}

json.bufferViews = packedViews;
json.buffers = [{byteLength: align4(byteOffset)}];
const jsonBuffer = Buffer.from(JSON.stringify(json));
const jsonPadding = Buffer.alloc(align4(jsonBuffer.length) - jsonBuffer.length, 0x20);
const binary = Buffer.concat([...chunks, Buffer.alloc(align4(byteOffset) - byteOffset)]);
const header = Buffer.alloc(12);
header.write('glTF');
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + jsonBuffer.length + jsonPadding.length + 8 + binary.length, 8);
const jsonHeader = Buffer.alloc(8);
jsonHeader.writeUInt32LE(jsonBuffer.length + jsonPadding.length, 0);
jsonHeader.writeUInt32LE(0x4e4f534a, 4);
const binaryHeader = Buffer.alloc(8);
binaryHeader.writeUInt32LE(binary.length, 0);
binaryHeader.writeUInt32LE(0x004e4942, 4);

await fs.writeFile(outputPath, Buffer.concat([header, jsonHeader, jsonBuffer, jsonPadding, binaryHeader, binary]));
const originalMegabytes = (source.length / 1024 / 1024).toFixed(1);
const optimizedMegabytes = ((12 + 8 + jsonBuffer.length + jsonPadding.length + 8 + binary.length) / 1024 / 1024).toFixed(1);
console.log(`Goalkeeper GLB: ${originalMegabytes} MB -> ${optimizedMegabytes} MB`);
