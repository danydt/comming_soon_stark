// Construit dist/coming-soon.zip (contenu de coming-soon/ à la racine de l'archive, README exclu).
// Utilise bsdtar, fourni avec Windows 10+ et macOS (`tar -a` déduit le format zip de l'extension).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = path.join(root, 'dist/coming-soon.zip');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.rmSync(out, { force: true });
const entries = fs.readdirSync(path.join(root, 'coming-soon')).filter((f) => f !== 'README.md');
const tar = process.platform === 'win32' ? path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe') : 'tar';
execFileSync(tar, ['-a', '-cf', out, '-C', path.join(root, 'coming-soon'), ...entries], { stdio: 'inherit' });
console.log(`${path.relative(root, out)} — ${(fs.statSync(out).size / 1024).toFixed(1)} Ko`);
