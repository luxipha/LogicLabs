import fs from 'node:fs/promises';
import path from 'node:path';
import {build} from 'esbuild';

const root = process.cwd();
const outdir = path.join(root, 'docs');
const assetsDir = path.join(outdir, 'assets');
const modelsDir = path.join(outdir, 'models');
const publicBasePath = (process.env.PUBLIC_BASE_PATH ?? '/LogicLabs/').replace(/\/?$/, '/');

// Regenerate scoped lesson stylesheets from canonical sources, awaiting them.
const {run: runScoping} = await import('./scope-css.mjs');
await runScoping();

await fs.rm(outdir, {recursive: true, force: true});
await fs.mkdir(assetsDir, {recursive: true});
await fs.mkdir(modelsDir, {recursive: true});

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
  sourcemap: false,
  loader: {'.json': 'json'},
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
const routes = [
  '/lessons/airplane',
  '/lessons/butterfly',
  '/lessons/honey-bee',
  '/lessons/button-golfer',
  '/lessons/mobile-radar',
];
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

console.log('Built classroom app into docs/');
