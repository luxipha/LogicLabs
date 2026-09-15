import fs from 'node:fs/promises';
import path from 'node:path';

// Make lightweight, static tray images from the actual selectable GLB regions.
const buffer = await fs.readFile('public/models/TREX.glb');
const jsonLength = buffer.readUInt32LE(12);
const gltf = JSON.parse(buffer.subarray(20, 20 + jsonLength).toString('utf8').trim());
const binaryOffset = 28 + jsonLength;
const parts = {skull: [], neck: [], ribs: [], tail: [], leg: []};
const classify = (x, height) => x > 13 ? 'skull' : x > 7 ? 'neck' : x < -9 ? 'tail' : height < 9.5 ? 'leg' : 'ribs';

const accessor = (index) => {
  const info = gltf.accessors[index];
  const view = gltf.bufferViews[info.bufferView];
  const components = info.type === 'VEC3' ? 3 : 1;
  const bytes = info.componentType === 5123 ? 2 : info.componentType === 5121 ? 1 : 4;
  const stride = view.byteStride ?? components * bytes;
  const offset = binaryOffset + (view.byteOffset ?? 0) + (info.byteOffset ?? 0);
  return (vertex, component = 0) => {
    const at = offset + vertex * stride + component * bytes;
    if (info.componentType === 5126) return buffer.readFloatLE(at);
    if (info.componentType === 5123) return buffer.readUInt16LE(at);
    if (info.componentType === 5121) return buffer.readUInt8(at);
    return buffer.readUInt32LE(at);
  };
};

for (const mesh of gltf.meshes) {
  for (const primitive of mesh.primitives) {
    if (gltf.materials[primitive.material]?.name.includes('_NONE')) continue;
    const position = accessor(primitive.attributes.POSITION);
    const index = primitive.indices === undefined ? (vertex) => vertex : accessor(primitive.indices);
    const count = gltf.accessors[primitive.indices ?? primitive.attributes.POSITION].count;
    for (let triangle = 0; triangle < count; triangle += 3) {
      const points = [0, 1, 2].map((corner) => {
        const vertex = index(triangle + corner);
        // The GLB root maps source Z to world Y (height).
        return [position(vertex, 0), position(vertex, 2)];
      });
      const centerX = points.reduce((sum, point) => sum + point[0], 0) / 3;
      const centerHeight = points.reduce((sum, point) => sum + point[1], 0) / 3;
      // Omit low scan/platform fragments and isolated supports under the head
      // and tail so the activity pieces contain the fossil itself.
      if (centerHeight < 3 || (centerX > 7 && centerHeight < 8) || (centerX < -9 && centerHeight < 6)) continue;
      // Front and back faces project with opposite winding. Keep every
      // silhouette triangle wound alike so overlapping faces do not cancel
      // under SVG's nonzero fill rule.
      const [a, b, c] = points;
      const area = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      if (area < 0) points.reverse();
      parts[classify(centerX, centerHeight)].push(points);
    }
  }
}

const output = 'public/assets/trex-parts';
await fs.mkdir(output, {recursive: true});
const allPoints = Object.values(parts).flat(2);
const whole = {minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity};
for (const [x, y] of allPoints) {
  whole.minX = Math.min(whole.minX, x); whole.maxX = Math.max(whole.maxX, x);
  whole.minY = Math.min(whole.minY, y); whole.maxY = Math.max(whole.maxY, y);
}
const wholeScale = Math.min(720 / (whole.maxX - whole.minX), 230 / (whole.maxY - whole.minY));
const wholeOffsetX = (760 - (whole.maxX - whole.minX) * wholeScale) / 2;
const wholeOffsetY = (260 - (whole.maxY - whole.minY) * wholeScale) / 2;
const layout = {};
for (const [part, triangles] of Object.entries(parts)) {
  const points = triangles.flat();
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of points) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const scale = Math.min(220 / (maxX - minX), 110 / (maxY - minY));
  const offsetX = (240 - (maxX - minX) * scale) / 2;
  const offsetY = (130 - (maxY - minY) * scale) / 2;
  const project = ([x, y]) => `${((x - minX) * scale + offsetX).toFixed(1)},${((maxY - y) * scale + offsetY).toFixed(1)}`;
  const geometry = triangles.map((triangle) => `M${triangle.map(project).join('L')}Z`).join('');
  await fs.writeFile(path.join(output, `${part}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 130"><path fill="#896444" d="${geometry}"/></svg>\n`);
  const alignedProject = ([x, y]) => `${((x - whole.minX) * wholeScale + wholeOffsetX).toFixed(1)},${((whole.maxY - y) * wholeScale + wholeOffsetY).toFixed(1)}`;
  const alignedGeometry = triangles.map((triangle) => `M${triangle.map(alignedProject).join('L')}Z`).join('');
  await fs.writeFile(path.join(output, `${part}-aligned.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 260"><path fill="#896444" d="${alignedGeometry}"/></svg>\n`);
  layout[part] = {
    x: (minX - whole.minX) * wholeScale + wholeOffsetX,
    y: (whole.maxY - maxY) * wholeScale + wholeOffsetY,
    width: (maxX - minX) * wholeScale,
    height: (maxY - minY) * wholeScale,
  };
  console.log(`${part}: ${triangles.length} model triangles`);
}
await fs.mkdir('src/assets/trex', {recursive: true});
await fs.writeFile('src/assets/trex/activity-layout.json', JSON.stringify(layout, null, 2) + '\n');
