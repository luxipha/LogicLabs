// Run: node scripts/add-firetruck-hose.mjs
// Add a named, selectable firehose to a derivative of the supplied truck.
// The original public/models/firetruck.glb remains unchanged.
import fs from 'node:fs/promises';
import {BoxGeometry, CatmullRomCurve3, CylinderGeometry, Group, Mesh, MeshStandardMaterial, TubeGeometry, Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';

// GLTFExporter only needs FileReader to package the binary Blob in Node.
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => { this.result = result; this.onloadend?.(); });
  }
};

const source = await fs.readFile('public/models/firetruck.glb');
const gltf = await new GLTFLoader().parseAsync(source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength), '');
if (gltf.animations.length) throw new Error('Review animated source before attaching static equipment.');
const assembly = new Group();
assembly.name = 'Firetruck_Hose_Assembly';
const yellow = new MeshStandardMaterial({name: 'Firehose yellow woven rubber', color: '#edc151', roughness: .9});
const steel = new MeshStandardMaterial({name: 'Firehose reel steel', color: '#657985', metalness: .35, roughness: .55});
const brass = new MeshStandardMaterial({name: 'Firehose brass coupling', color: '#d5a14b', metalness: .45, roughness: .4});
const black = new MeshStandardMaterial({name: 'Firehose nozzle grip', color: '#253e4c', roughness: .85});
const add = (name, geometry, material, position) => {
  const mesh = new Mesh(geometry, material);
  mesh.name = `Firetruck_Hose_${name}`;
  if (position) mesh.position.copy(position);
  assembly.add(mesh);
  return mesh;
};

// Inspected truck coordinates: the left storage panels sit at x=-3.19,
// y=1.50..4.45. Fit the reel between the cab and first rear wheel, z=.1..2.33.
const reelCenter = new Vector3(-3.44, 2.65, 1.12);
add('Mount', new BoxGeometry(.16, 1.85, 1.85), steel, new Vector3(-3.24, 2.65, 1.12));
const hub = add('Hub', new CylinderGeometry(.16, .16, .36, 16), steel, reelCenter);
hub.rotation.z = Math.PI / 2;

// One continuous spiral, not overlapping decorative rings.
const points = Array.from({length: 193}, (_, i) => {
  const fraction = i / 192, theta = fraction * Math.PI * 6;
  const radius = .2 + .6 * fraction;
  return new Vector3(-3.58 - .05 * fraction, 2.65 + radius * Math.sin(theta), 1.12 + radius * Math.cos(theta));
});
add('Coil', new TubeGeometry(new CatmullRomCurve3(points), 240, .078, 8, false), yellow);
const tail = [points.at(-1).clone(), new Vector3(-3.65, 2.5, 2.04), new Vector3(-3.68, 2.1, 2.12), new Vector3(-3.68, 1.75, 1.86), new Vector3(-3.68, 1.58, 1.56)];
add('Tail', new TubeGeometry(new CatmullRomCurve3(tail), 36, .078, 8, false), yellow);
const direction = tail.at(-1).clone().sub(tail.at(-2)).normalize();
const cylinder = (name, radiusTop, radiusBottom, length, material, start) => {
  const mesh = add(name, new CylinderGeometry(radiusTop, radiusBottom, length, 16), material, start.clone().addScaledVector(direction, length / 2));
  mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction);
  return start.clone().addScaledVector(direction, length);
};
let end = cylinder('Coupling', .125, .125, .15, brass, tail.at(-1));
end = cylinder('Nozzle', .10, .105, .28, black, end);
cylinder('NozzleTip', .065, .1, .17, brass, end);
assembly.userData.description = 'Added teaching firehose: coiled hose, hanging tail, coupling and nozzle on the left storage panel.';
gltf.scene.add(assembly);
gltf.scene.updateMatrixWorld(true);
const binary = await new GLTFExporter().parseAsync(gltf.scene, {binary: true});
const output = 'public/models/firetruck-with-hose.glb';
await fs.writeFile(output, Buffer.from(binary));
console.log(`${output}: ${(binary.byteLength / 1048576).toFixed(2)} MiB; ${assembly.children.length} hose meshes. Source preserved.`);
