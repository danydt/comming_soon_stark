// Copie les sous-ensembles latins woff2 (licence OFL) utilisés par la page de lancement.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, '../node_modules/@fontsource');
const dest = path.resolve(here, '../../coming-soon/assets/fonts');
const files = [
  ['roboto-slab', 'roboto-slab-latin-800-normal.woff2'],
  ['josefin-sans', 'josefin-sans-latin-300-normal.woff2'],
  ['inter', 'inter-latin-400-normal.woff2'],
  ['inter', 'inter-latin-600-normal.woff2'],
];
fs.mkdirSync(dest, { recursive: true });
for (const [pkg, file] of files) fs.copyFileSync(path.join(src, pkg, 'files', file), path.join(dest, file));
fs.writeFileSync(path.join(dest, 'LICENSE.txt'),
  'Roboto Slab, Josefin Sans et Inter sont distribuées sous SIL Open Font License 1.1 — https://openfontlicense.org\n' +
  'Fichiers issus de Fontsource (https://fontsource.org), sous-ensemble latin.\n');
console.log('Polices copiées :', files.map((f) => f[1]).join(', '));
