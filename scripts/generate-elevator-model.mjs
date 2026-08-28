import fs from 'node:fs/promises';
import path from 'node:path';
import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Scene,
  TorusGeometry,
} from 'three';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';

// GLTFExporter expects FileReader in browsers; this lightweight implementation
// is sufficient for the binary buffer produced by this build-time script.
globalThis.FileReader = class FileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }
};

const root = process.cwd();
const output = path.join(root, 'public/models/elevator.glb');

const steel = new MeshStandardMaterial({color: '#596779', metalness: 0.82, roughness: 0.3});
const darkSteel = new MeshStandardMaterial({color: '#243241', metalness: 0.88, roughness: 0.24});
const cabPaint = new MeshStandardMaterial({color: '#e8edf2', metalness: 0.38, roughness: 0.36});
const doorPaint = new MeshStandardMaterial({color: '#81c8e8', metalness: 0.42, roughness: 0.28});
const cableMaterial = new MeshStandardMaterial({color: '#1d2732', metalness: 0.94, roughness: 0.2});
const motorPaint = new MeshStandardMaterial({color: '#f4a62a', metalness: 0.35, roughness: 0.38});
const warningPaint = new MeshStandardMaterial({color: '#ffd54d', metalness: 0.15, roughness: 0.5});
const glass = new MeshPhysicalMaterial({
  color: '#bfe9fb',
  metalness: 0.05,
  roughness: 0.08,
  transmission: 0.42,
  transparent: true,
  opacity: 0.46,
  thickness: 0.08,
});
const concrete = new MeshStandardMaterial({color: '#89939b', metalness: 0.02, roughness: 0.92});

const box = (name, size, position, material, parent) => {
  const mesh = new Mesh(new BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
};

const cylinder = (name, radius, depth, position, material, parent, rotation = [0, 0, 0]) => {
  const mesh = new Mesh(new CylinderGeometry(radius, radius, depth, 28), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
};

const torus = (name, radius, tube, position, material, parent, rotation = [0, 0, 0]) => {
  const mesh = new Mesh(new TorusGeometry(radius, tube, 12, 36), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
};

const makePart = (name, parent) => {
  const part = new Group();
  part.name = name;
  parent.add(part);
  return part;
};

const scene = new Scene();
const elevator = new Group();
elevator.name = 'Elevator cutaway';
elevator.rotation.y = -0.28;
scene.add(elevator);

const shaft = makePart('Shaft', elevator);
box('left shaft rail', [0.16, 7.2, 0.22], [-1.7, 0, 0], darkSteel, shaft);
box('right shaft rail', [0.16, 7.2, 0.22], [1.7, 0, 0], darkSteel, shaft);
box('back crossbeam top', [3.55, 0.16, 0.22], [0, 3.45, 0.18], steel, shaft);
box('back crossbeam bottom', [3.55, 0.16, 0.22], [0, -3.45, 0.18], steel, shaft);
box('left guide rail', [0.08, 6.4, 0.12], [-1.05, 0, -0.12], steel, shaft);
box('right guide rail', [0.08, 6.4, 0.12], [1.05, 0, -0.12], steel, shaft);
box('concrete pit', [3.7, 0.42, 1.9], [0, -3.72, 0], concrete, shaft);
box('left safety glass', [0.03, 5.8, 1.5], [-1.56, -0.2, 0], glass, shaft);
box('right safety glass', [0.03, 5.8, 1.5], [1.56, -0.2, 0], glass, shaft);

const motor = makePart('Motor', elevator);
box('motor housing', [1.2, 0.55, 0.68], [-0.72, 3.85, 0], motorPaint, motor);
cylinder('motor drum', 0.32, 0.82, [-0.1, 3.85, 0], darkSteel, motor, [0, 0, Math.PI / 2]);
box('motor base', [2.05, 0.16, 0.82], [-0.55, 3.5, 0], darkSteel, motor);
box('motor inspection panel', [0.25, 0.3, 0.03], [-0.72, 3.85, 0.36], warningPaint, motor);
for (let index = 0; index < 6; index += 1) {
  box(`motor cooling fin ${index + 1}`, [0.05, 0.42, 0.78], [-1.25 + index * 0.12, 3.85, 0], darkSteel, motor);
}

const pulley = makePart('Pulley', elevator);
cylinder('pulley wheel', 0.63, 0.2, [0.7, 3.6, 0], steel, pulley, [0, 0, Math.PI / 2]);
cylinder('pulley axle', 0.13, 0.62, [0.7, 3.6, 0], darkSteel, pulley, [0, 0, Math.PI / 2]);
torus('pulley traction groove', 0.51, 0.07, [0.7, 3.6, 0], darkSteel, pulley, [0, Math.PI / 2, 0]);
box('pulley bracket', [1.45, 0.16, 0.56], [0.7, 4.18, 0], darkSteel, pulley);

const cable = makePart('Cable', elevator);
cylinder('cab cable', 0.035, 4.2, [0.38, 1.35, 0], cableMaterial, cable);
cylinder('counterweight cable', 0.035, 4.9, [1.08, 0.98, 0], cableMaterial, cable);
cylinder('pulley cable top', 0.035, 0.72, [0.73, 3.58, 0], cableMaterial, cable, [0, 0, Math.PI / 2]);

const counterweight = makePart('Counterweight', elevator);
box('counterweight block', [0.52, 1.5, 0.52], [1.18, 1.05, 0], steel, counterweight);
for (let index = 0; index < 5; index += 1) {
  box(`counterweight plate ${index + 1}`, [0.58, 0.22, 0.58], [1.18, 0.48 + index * 0.28, 0], darkSteel, counterweight);
}
cylinder('counterweight guide wheel top', 0.13, 0.1, [1.18, 1.85, -0.34], steel, counterweight, [Math.PI / 2, 0, 0]);
cylinder('counterweight guide wheel bottom', 0.13, 0.1, [1.18, 0.22, -0.34], steel, counterweight, [Math.PI / 2, 0, 0]);

const cab = makePart('Cab', elevator);
box('cab floor', [2.12, 0.18, 1.58], [-0.32, -0.3, 0], cabPaint, cab);
box('cab roof', [2.12, 0.16, 1.58], [-0.32, 1.5, 0], cabPaint, cab);
box('cab left frame', [0.14, 1.8, 0.14], [-1.31, 0.6, 0.65], cabPaint, cab);
box('cab right frame', [0.14, 1.8, 0.14], [0.67, 0.6, 0.65], cabPaint, cab);
box('cab back wall', [2.1, 1.65, 0.1], [-0.32, 0.6, -0.72], cabPaint, cab);
box('cab side wall', [0.1, 1.65, 1.35], [-1.25, 0.6, 0], cabPaint, cab);
box('cab control panel', [0.16, 0.5, 0.1], [0.48, 0.55, 0.6], darkSteel, cab);
box('cab button', [0.08, 0.08, 0.05], [0.48, 0.68, 0.67], warningPaint, cab);
box('cab left glass', [0.88, 1.3, 0.03], [-0.82, 0.62, 0.7], glass, cab);
box('cab right glass', [0.88, 1.3, 0.03], [0.18, 0.62, 0.7], glass, cab);
cylinder('left cab guide roller', 0.12, 0.1, [-1.16, 1.15, -0.1], warningPaint, cab, [0, 0, Math.PI / 2]);
cylinder('right cab guide roller', 0.12, 0.1, [0.58, 1.15, -0.1], warningPaint, cab, [0, 0, Math.PI / 2]);

const doors = makePart('Doors', elevator);
box('left sliding door', [0.92, 1.5, 0.08], [-0.8, 0.5, 0.75], doorPaint, doors);
box('right sliding door', [0.92, 1.5, 0.08], [0.16, 0.5, 0.75], doorPaint, doors);
box('door center seam', [0.04, 1.5, 0.1], [-0.32, 0.5, 0.79], darkSteel, doors);

const exporter = new GLTFExporter();
const glb = await exporter.parseAsync(scene, {binary: true, onlyVisible: true, trs: false});
await fs.writeFile(output, Buffer.from(glb));
console.log(`Generated ${path.relative(root, output)}`);
