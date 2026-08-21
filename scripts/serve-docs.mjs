import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const host = '127.0.0.1';
const port = 4173;
const root = path.join(process.cwd(), 'docs');

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.glb', 'model/gltf-binary'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.svg', 'image/svg+xml'],
]);

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url ?? '/', `http://${host}:${port}`);
    const urlPath = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
    const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
    let filePath = path.join(root, safePath);

    // SPA fallback: route deep links to the single-page shell.
    let data;
    try {
      const stat = await fs.stat(filePath);
      filePath = stat.isDirectory() ? path.join(filePath, 'index.html') : filePath;
      data = await fs.readFile(filePath);
    } catch {
      if (!path.extname(urlPath)) {
        filePath = path.join(root, 'index.html');
        data = await fs.readFile(filePath);
      } else {
        throw new Error('Not found');
      }
    }

    const type = contentTypes.get(path.extname(filePath)) ?? 'application/octet-stream';
    res.writeHead(200, {'Content-Type': type});
    res.end(data);
  } catch {
    res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end('Not found');
  }
});

server.listen(port, host, () => {
  console.log(`Serving docs/ at http://${host}:${port}`);
});
