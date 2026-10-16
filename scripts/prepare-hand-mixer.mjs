// Run: node scripts/prepare-hand-mixer.mjs
// Preserve the supplied GLB. Give each complete beater its own vertical pivot
// while retaining the original geometry and materials in its rest position.
import fs from 'node:fs/promises';
import {Box3, BufferGeometry, Float32BufferAttribute, Group, Mesh, Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';

globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(result => { this.result = result; this.onloadend?.(); }); }
};
const source = await fs.readFile('public/models/hand_mixer.glb');
const gltf = await new GLTFLoader().parseAsync(source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength), '');
if (gltf.animations.length || gltf.scene.getObjectByProperty('isSkinnedMesh', true)) throw new Error('Review changed animated source first.');
gltf.scene.updateMatrixWorld(true);
const result = new Group(); result.name = 'ElectricBeater';
result.userData.sourceAsset = 'hand_mixer.glb';
const pivots = [-1, 1].map(sign => {
  const pivot = new Group(); pivot.name = sign < 0 ? 'Beater_Left' : 'Beater_Right';
  pivot.position.set(sign * 28.663565, 0, 96.26862);
  pivot.userData.part = 'beaters'; result.add(pivot); return pivot;
});

function components(geometry) {
  const position = geometry.attributes.position, index = geometry.index;
  const parent = Array.from({length: position.count}, (_, i) => i), positions = new Map();
  const find = i => parent[i] === i ? i : parent[i] = find(parent[i]);
  const join = (a, b) => { parent[find(a)] = find(b); };
  // Weld position seams only for connectivity. Retain every original normal
  // and vertex in the exported component, including sharp shading seams.
  for (let i = 0; i < position.count; i++) {
    const key = [position.getX(i), position.getY(i), position.getZ(i)].map(n => Math.round(n * 1000)).join(',');
    if (positions.has(key)) join(i, positions.get(key)); else positions.set(key, i);
  }
  for (let i = 0; i < index.count; i += 3) { join(index.getX(i), index.getX(i+1)); join(index.getX(i), index.getX(i+2)); }
  const groups = new Map();
  for (let i = 0; i < index.count; i += 3) {
    const root = find(index.getX(i)), faces = groups.get(root) ?? [];
    faces.push(index.getX(i), index.getX(i+1), index.getX(i+2)); groups.set(root, faces);
  }
  return [...groups.values()].map(faces => {
    const remap = new Map(), indices = [], points = [], normals = [];
    for (const old of faces) {
      if (!remap.has(old)) {
        remap.set(old, remap.size);
        points.push(position.getX(old), position.getY(old), position.getZ(old));
        const n = geometry.attributes.normal; normals.push(n.getX(old), n.getY(old), n.getZ(old));
      }
      indices.push(remap.get(old));
    }
    const piece = new BufferGeometry(); piece.setAttribute('position', new Float32BufferAttribute(points, 3));
    piece.setAttribute('normal', new Float32BufferAttribute(normals, 3)); piece.setIndex(indices);
    return piece;
  });
}
let stems = 0, loops = 0, triangles = 0;
gltf.scene.traverse(object => {
  if (!object.isMesh) return;
  const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld);
  // The supplied model has no textures. Its unused UV stream can be omitted.
  geometry.deleteAttribute('uv');
  triangles += geometry.index.count / 3;
  if (object.name === 'Cylinder001_Metal_0' || object.name === 'BezierCurve_Metal_0') {
    const pieces = components(geometry), isStem = object.name === 'Cylinder001_Metal_0';
    if (pieces.length !== (isStem ? 2 : 4)) throw new Error(`Unexpected ${object.name} connectivity`);
    for (const [i, piece] of pieces.entries()) {
      const center = new Box3().setFromBufferAttribute(piece.attributes.position).getCenter(new Vector3());
      const pivot = pivots[center.x < 0 ? 0 : 1];
      // Wire loops cross x=0: splitting vertices by sign would cut both cages.
      // Each connected loop belongs to the shaft nearest its component centre.
      if (Math.abs(Math.abs(center.x) - 28.663565) > .01) throw new Error('Unexpected beater axis');
      piece.translate(-pivot.position.x, 0, -pivot.position.z);
      const mesh = new Mesh(piece, object.material); mesh.name = `${pivot.name}_${isStem ? 'Stem' : 'Loop'}_${i}`;
      mesh.userData.part = 'beaters'; pivot.add(mesh);
      if (isStem) stems++; else loops++;
    }
  } else {
    const mesh = new Mesh(geometry, object.material); mesh.name = object.name; result.add(mesh);
  }
});
if (stems !== 2 || loops !== 4 || pivots.some(p => p.children.length !== 3)) throw new Error('Incomplete moving assembly');
result.updateMatrixWorld(true);
const binary = await new GLTFExporter().parseAsync(result, {binary: true});
await fs.writeFile('public/models/hand-mixer-classroom.glb', Buffer.from(binary));
console.log(`Mixer: ${triangles} original triangles; two shafts and four wire loops on two pivots; ${(source.length/1024).toFixed(0)} -> ${(binary.byteLength/1024).toFixed(0)} KiB. Source preserved.`);
