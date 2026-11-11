// Petit serveur statique pour tester coming-soon/ en local (aucune dépendance).
// Usage : pnpm serve:cs  →  http://localhost:4173  (option : PORT=xxxx)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../coming-soon');
const port = Number(process.env.PORT) || 4173;
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon',
};

export function createServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    let file = path.normalize(path.join(root, decodeURIComponent(url.pathname)));
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404, { 'content-type': 'text/plain' }).end('404'); return; }
    const ext = path.extname(file);
    let body = fs.readFileSync(file);
    const headers = { 'content-type': types[ext] || 'application/octet-stream', 'cache-control': 'no-cache' };
    // Simule la compression gzip activée par le .htaccess sur LWS.
    if (/gzip/.test(req.headers['accept-encoding'] || '') && /\.(html|css|js|svg|webmanifest|txt)$/.test(ext)) {
      body = zlib.gzipSync(body); headers['content-encoding'] = 'gzip';
    }
    res.writeHead(200, headers).end(body);
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  createServer().listen(port, () => console.log(`coming-soon servi sur http://localhost:${port}`));
}
