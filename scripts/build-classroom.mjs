import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {build} from 'esbuild';

const root = process.cwd();
const outdir = path.join(root, 'docs');
const assetsDir = path.join(outdir, 'assets');
const modelsDir = path.join(outdir, 'models');
const publicAssetsDir = path.join(root, 'public/assets');
const banknoteActivitiesDir = path.join(root, 'public/banknote-activities');
const elevatorActivitiesDir = path.join(root, 'public/elevator-activities');
const frogActivitiesDir = path.join(root, 'public/frog-activities');
const publicBasePath = (process.env.PUBLIC_BASE_PATH ?? '/LogicLabs/').replace(/\/?$/, '/');

// Regenerate scoped lesson stylesheets from canonical sources, awaiting them.
const {run: runScoping} = await import('./scope-css.mjs');
await runScoping();

await fs.rm(outdir, {recursive: true, force: true});
await fs.mkdir(assetsDir, {recursive: true});
await fs.mkdir(modelsDir, {recursive: true});

// Classroom illustrations are referenced as app-relative static assets.
await fs.cp(publicAssetsDir, assetsDir, {recursive: true});
// Keep the supplied coding images in numeric order at stable public URLs.
const trexCodeDir = path.join(root, 'src/assets/trex/code');
await fs.mkdir(path.join(assetsDir, 'trex-code'), {recursive: true});
for (let step = 1; step <= 14; step++) {
  await fs.copyFile(path.join(trexCodeDir, `${step}.png`), path.join(assetsDir, 'trex-code', `${step}.png`));
}
await fs.cp(elevatorActivitiesDir, path.join(outdir, 'elevator-activities'), {recursive: true});
await fs.cp(frogActivitiesDir, path.join(outdir, 'frog-activities'), {recursive: true});
await fs.cp(banknoteActivitiesDir, path.join(outdir, 'banknote-activities'), {recursive: true});

await build({
  entryPoints: [path.join(root, 'src/app/index.tsx')],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2022'],
  outdir: assetsDir,
  entryNames: '[name]',
  splitting: true,
  chunkNames: 'chunks/[name]-[hash]',
  jsx: 'automatic',
  // React's package entry selects its production runtime only when this is inlined.
  define: {'process.env.NODE_ENV': '"production"'},
  minify: true,
  sourcemap: false,
  loader: {'.json': 'json', '.png': 'file', '.jpg': 'file', '.jpeg': 'file'},
});

// Lazy lesson imports produce separate CSS files. The static shell only loads
// index.css, so merge those scoped styles into it before removing the chunks.
const chunkDir = path.join(assetsDir, 'chunks');
const chunkCssFiles = (await fs.readdir(chunkDir)).filter((file) => file.endsWith('.css'));
for (const file of chunkCssFiles) {
  const css = await fs.readFile(path.join(chunkDir, file), 'utf8');
  await fs.appendFile(path.join(assetsDir, 'index.css'), `\n/* ${file} */\n${css}`);
  await fs.rm(path.join(chunkDir, file));
}

// The base path keeps asset URLs inside the GitHub Pages project URL rather
// than incorrectly resolving them from luxipha.github.io's domain root.
const sourceShell = await fs.readFile(path.join(root, 'src/app/index.html'), 'utf8');
const shell = sourceShell.replace('{{BASE_PATH}}', publicBasePath);
await fs.writeFile(path.join(outdir, 'index.html'), shell);

// Emit directory indexes so static hosts can serve `/lessons/<slug>` without
// an SPA rewrite. Each is the same shell; the SPA reads the requested path.
const lessonRoutes = [
  '/lessons/airplane',
  '/lessons/butterfly',
  '/lessons/button-golfer',
  '/lessons/mobile-radar',
  '/lessons/bee',
  '/lessons/elevator',
  '/lessons/monster-truck',
  '/lessons/trex-fossil',
  '/lessons/electric-tractor',
  '/lessons/banknote-verifier',
  '/lessons/soccer',
  '/lessons/seesaw',
  '/lessons/kangaroo',
  '/lessons/hot-classroom',
];
const drawRoutes = lessonRoutes.map((route) => `/draw${route.slice('/lessons'.length)}`);
const routes = [...lessonRoutes, ...drawRoutes];
for (const route of routes) {
  const filePath = path.join(outdir, route.replace(/^\//, ''), 'index.html');
  await fs.mkdir(path.dirname(filePath), {recursive: true});
  await fs.writeFile(filePath, shell);
}

// Static lesson models.
await fs.copyFile(path.join(root, 'public/models/airplane.glb'), path.join(modelsDir, 'airplane.glb'));
await fs.copyFile(path.join(root, 'public/models/butterfly.glb'), path.join(modelsDir, 'butterfly.glb'));
await fs.copyFile(
  path.join(root, 'public/models/renault_trm_radar_truck.glb'),
  path.join(modelsDir, 'radar-truck.glb'),
);
await fs.copyFile(path.join(root, 'public/models/bee.glb'), path.join(modelsDir, 'bee.glb'));
// The frog model ships without a sampler array, which the standard GLTFLoader
// cannot handle. Patch it (reproducibly) as it is copied into the output.
const frogSrc = path.join(root, 'public/models/frog_lifecycle_stages.glb');
const frogOut = path.join(modelsDir, 'frog.glb');
await new Promise((resolve, reject) => {
  execFile(
    process.execPath,
    [path.join(root, 'scripts/patch-frog-glb.mjs'), frogSrc, frogOut],
    (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }
      process.stdout.write(`${stdout}`);
      resolve();
    },
  );
});
await fs.copyFile(path.join(root, 'public/models/elevator.glb'), path.join(modelsDir, 'elevator.glb'));
await fs.copyFile(
  path.join(root, 'public/models/animated_female_character_swings_golf_club.glb'),
  path.join(modelsDir, 'golfer.glb'),
);
await fs.copyFile(
  path.join(root, 'public/models/monster_truck.glb'),
  path.join(modelsDir, 'monster-truck.glb'),
);
await fs.copyFile(path.join(root, 'public/models/TREX.glb'), path.join(modelsDir, 'trex.glb'));
await fs.copyFile(path.join(root, 'public/models/tractor_04__trailer.glb'), path.join(modelsDir, 'electric-tractor.glb'));
await fs.copyFile(path.join(root, 'public/models/goalkeeper-optimized.glb'), path.join(modelsDir, 'goalkeeper-optimized.glb'));
await fs.copyFile(path.join(root, 'public/models/seesaw_from_poly_by_google.glb'), path.join(modelsDir, 'seesaw.glb'));
await fs.copyFile(path.join(root, 'public/models/kangaroo.glb'), path.join(modelsDir, 'kangaroo.glb'));
await fs.copyFile(
  path.join(root, 'public/models/electric_fan.glb'),
  path.join(modelsDir, 'electric_fan.glb'),
);

console.log('Built classroom app into docs/');
