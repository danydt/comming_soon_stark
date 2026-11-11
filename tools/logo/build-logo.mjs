// Génère les logos SVG StarkHold à partir d'une géométrie relevée sur brand/logo-starkhold-source.jpg.
// Le texte est converti en tracés (Roboto Slab 900 / Josefin Sans 300) : aucun bitmap, aucune police requise.
// Usage : pnpm logo   (depuis tools/)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFont, textToPath } from './textpath.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const fontsDir = path.join(here, '../node_modules/@fontsource');
const slab = loadFont(path.join(fontsDir, 'roboto-slab/files/roboto-slab-latin-900-normal.woff'));
const josefin = loadFont(path.join(fontsDir, 'josefin-sans/files/josefin-sans-latin-300-normal.woff'));

const C = {
  red: '#C00000',
  redDeep: '#8B0000',
  black: '#0C0C0C',
  grey: '#8A8A8A',
};

// ---------- Symbole « S » (repère : boîte 400 × 595) ----------
// Relevés sur le JPEG source (x 340→740, y 125→720), translatés de (-340, -125).
const MARK_W = 400;
const MARK_H = 595;
const geo = {
  top: 'M0 126 L400 0 L400 184 L0 312 Z',
  topLight: 'M0 243 C120 232 190 160 400 146 L400 184 L0 312 Z',
  bot: 'M0 410 L400 283 L400 467 L0 595 Z',
  botLight: 'M0 410 L400 283 L400 355 C300 365 150 440 0 595 Z',
  fold: 'M0 312 L208 246 L400 283 L208 342 Z',
};

function markDefs(id, { dark }) {
  const foldA = dark ? '#5A5A5A' : C.black;
  const foldB = dark ? '#D9D9D9' : '#4A4646';
  return `<defs>
    <linearGradient id="${id}-t" x1="0" y1="312" x2="400" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#A30000"/><stop offset="1" stop-color="${C.redDeep}"/></linearGradient>
    <linearGradient id="${id}-tl" x1="0" y1="312" x2="400" y2="150" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.red}"/><stop offset="1" stop-color="#B80000"/></linearGradient>
    <linearGradient id="${id}-b" x1="0" y1="595" x2="400" y2="283" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#9A0000"/><stop offset="1" stop-color="${C.redDeep}"/></linearGradient>
    <linearGradient id="${id}-bl" x1="0" y1="595" x2="400" y2="283" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.red}"/><stop offset="1" stop-color="#B00000"/></linearGradient>
    <linearGradient id="${id}-f" x1="0" y1="300" x2="400" y2="290" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${foldA}"/><stop offset=".55" stop-color="${foldA}"/><stop offset="1" stop-color="${foldB}"/></linearGradient>
  </defs>`;
}

function markBody(id) {
  return `<g class="lg-top"><path d="${geo.top}" fill="url(#${id}-t)"/><path d="${geo.topLight}" fill="url(#${id}-tl)"/></g>
    <g class="lg-bot"><path d="${geo.bot}" fill="url(#${id}-b)"/><path d="${geo.botLight}" fill="url(#${id}-bl)"/></g>
    <path class="lg-fold" d="${geo.fold}" fill="url(#${id}-f)"/>`;
}

// ---------- Mot « StarkHold » et slogan (repère du JPEG source) ----------
// Source : mot x 129→967, hauteur d'ascendante 777→898 ; slogan x 225→869, capitales 931→965.
function wordmark() {
  const capTarget = 121 * 1.04; // police plus étroite que l'originale : léger agrandissement + approche
  const probe = textToPath(slab, 'StarkHold', { size: 100 });
  const size = (100 * capTarget) / -probe.bbox.y1;
  const natural = textToPath(slab, 'StarkHold', { size });
  const widthNat = natural.bbox.x2 - natural.bbox.x1;
  const tracking = (838 - widthNat) / 8 / size;
  const t = textToPath(slab, 'StarkHold', { size, tracking, x: 0, y: 898 });
  const dx = 129 - t.bbox.x1;
  return textToPath(slab, 'StarkHold', { size, tracking, x: dx, y: 898 }).d;
}

function tagline() {
  const text = 'GO FURTHER TOGETHER';
  const probe = textToPath(josefin, text, { size: 100 });
  const size = (100 * 34) / -probe.bbox.y1;
  const natural = textToPath(josefin, text, { size });
  const gaps = [...text].length - 1;
  const tracking = (644 - (natural.bbox.x2 - natural.bbox.x1)) / gaps / size;
  const t = textToPath(josefin, text, { size, tracking, y: 965 });
  return textToPath(josefin, text, { size, tracking, x: 225 - t.bbox.x1, y: 965 }).d;
}

const svgOpen = (vb, label, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${label}"${extra}>`;

function markSvg({ dark }) {
  const id = dark ? 'shw' : 'sh';
  return `${svgOpen(`0 0 ${MARK_W} ${MARK_H}`, 'StarkHold')}
  <title>StarkHold</title>
  ${markDefs(id, { dark })}
  ${markBody(id)}
</svg>
`;
}

function fullSvg({ dark }) {
  const id = dark ? 'sfw' : 'sf';
  return `${svgOpen('109 105 878 880', 'StarkHold — Go further together')}
  <title>StarkHold — Go further together</title>
  ${markDefs(id, { dark })}
  <g class="lg-mark" transform="translate(340 125)">
    ${markBody(id)}
  </g>
  <path class="lg-word" d="${wordmark()}" fill="${dark ? '#FFFFFF' : C.black}"/>
  <path class="lg-tag" d="${tagline()}" fill="${dark ? '#CFCFCF' : C.grey}"/>
</svg>
`;
}

function iconSvg() {
  // Carré centré sur le symbole, fond transparent (onglets clairs comme sombres : le pli reste lisible grâce au dégradé).
  const pad = (MARK_H - MARK_W) / 2;
  return `${svgOpen(`${-pad - 20} -20 ${MARK_H + 40} ${MARK_H + 40}`, 'StarkHold')}
  ${markDefs('si', { dark: false })}
  ${markBody('si')}
</svg>
`;
}

const outputs = {
  'logo-mark.svg': markSvg({ dark: false }),
  'logo-mark-white.svg': markSvg({ dark: true }),
  'logo-full.svg': fullSvg({ dark: false }),
  'logo-full-white.svg': fullSvg({ dark: true }),
  'icon.svg': iconSvg(),
};

const targets = [path.join(root, 'brand/svg'), path.join(root, 'coming-soon/assets/logo')];
for (const dir of targets) {
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, content] of Object.entries(outputs)) fs.writeFileSync(path.join(dir, name), content);
}
// Logo complet inséré en ligne dans coming-soon/index.html (permet l'animation CSS du « S »).
const inlineSvg = `<svg viewBox="109 105 878 880" role="img" aria-labelledby="logo-title" focusable="false">
          <title id="logo-title">StarkHold — Go further together</title>
          ${markDefs('lg', { dark: false })}
          <g transform="translate(340 125)">${markBody('lg')}</g>
          <path class="lg-word" d="${wordmark()}" fill="${C.black}"/>
          <path class="lg-tag" d="${tagline()}" fill="#6E6E6E"/>
        </svg>`;
const indexPath = path.join(root, 'coming-soon/index.html');
if (fs.existsSync(indexPath)) {
  const html = fs.readFileSync(indexPath, 'utf8');
  const re = /(<!-- logo:start[^>]*-->)[\s\S]*?(<!-- logo:end -->)/;
  if (!re.test(html)) throw new Error('Marqueurs logo:start / logo:end introuvables dans coming-soon/index.html');
  fs.writeFileSync(indexPath, html.replace(re, (_m, a, b) => `${a}\n        ${inlineSvg}\n        ${b}`));
  console.log('Logo inséré dans coming-soon/index.html');
}
console.log('Logos écrits dans', targets.map((t) => path.relative(root, t)).join(', '));
