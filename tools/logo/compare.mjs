// Rend brand/compare-logo.png : JPEG source | SVG vectorisé | superposition (50 %) | version blanche sur fond sombre.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const jpg = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(root, 'brand/logo-starkhold-source.jpg')).toString('base64');
const svg = (n) => 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(root, 'brand/svg', n)).toString('base64');
// Le SVG complet couvre x 109→987, y 105→985 du repère source : on le place exactement à ces coordonnées.
const place = (src) => `<img src="${src}" style="position:absolute;left:${109 / 1080 * 100}%;top:${105 / 1013 * 100}%;width:${878 / 1080 * 100}%">`;
const cell = (label, inner, bg = '#fff') => `<figure><div class="b" style="background:${bg}">${inner}</div><figcaption>${label}</figcaption></figure>`;
const html = `<style>body{margin:0;font:600 18px Inter,Arial;display:flex;gap:16px;padding:16px;background:#eee}figure{margin:0}
.b{position:relative;width:540px;height:506px;overflow:hidden;border:1px solid #ccc}.b>img:first-child{position:absolute;inset:0;width:100%}figcaption{padding:8px 0}</style>
${cell('JPEG source', `<img src="${jpg}">`)}
${cell('SVG vectorisé', place(svg('logo-full.svg')))}
${cell('Superposition 50 %', `<img src="${jpg}">` + place(svg('logo-full.svg')).replace('style="', 'style="opacity:.5;'))}
${cell('Version fond sombre', place(svg('logo-full-white.svg')), '#0C0C0C')}`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 2260, height: 560 } });
await p.setContent(html); await p.waitForTimeout(300);
await p.screenshot({ path: path.join(root, 'brand/compare-logo.png') });
await b.close(); console.log('brand/compare-logo.png');
