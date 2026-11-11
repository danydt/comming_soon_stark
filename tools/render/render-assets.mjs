// Rend les favicons PNG (32, 180, 512) et l'image Open Graph 1200×630 à partir des SVG et polices du projet.
// Usage : pnpm assets   (après pnpm logo)
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cs = path.join(root, 'coming-soon');
const url = (p) => pathToFileURL(p).href;
const svgMark = url(path.join(cs, 'assets/logo/logo-mark.svg'));
const svgFull = url(path.join(cs, 'assets/logo/logo-full-white.svg'));
const font = (f) => url(path.join(cs, 'assets/fonts', f));

const fontsCss = `
@font-face{font-family:'Roboto Slab';font-weight:800;src:url('${font('roboto-slab-latin-800-normal.woff2')}')}
@font-face{font-family:'Josefin Sans';font-weight:300;src:url('${font('josefin-sans-latin-300-normal.woff2')}')}
@font-face{font-family:'Inter';font-weight:600;src:url('${font('inter-latin-600-normal.woff2')}')}`;

const iconHtml = (size, padRatio, radius) => `<style>html,body{margin:0}
.c{width:${size}px;height:${size}px;background:#fff;border-radius:${radius}px;display:flex;align-items:center;justify-content:center}
img{height:${Math.round(size * (1 - 2 * padRatio))}px}</style><div class="c"><img src="${svgMark}"></div>`;

const ogHtml = `<style>${fontsCss}
html,body{margin:0}
.og{width:1200px;height:630px;display:flex;background:#0C0C0C;color:#fff;font-family:Inter;position:relative;overflow:hidden}
.l{width:440px;display:flex;align-items:center;justify-content:center;background:#141414}
.l img{width:300px}
.r{flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 72px}
.k{font:300 22px 'Josefin Sans';letter-spacing:.3em;text-transform:uppercase;color:#cfcfcf}
h1{font:800 64px/1.08 'Roboto Slab';margin:22px 0 26px}
.d{font:600 28px Inter;color:#fff;display:inline-flex;align-items:center;gap:14px}
.d i{display:inline-block;width:44px;height:6px;background:#C00000}
.bar{position:absolute;left:0;right:0;bottom:0;height:10px;background:linear-gradient(90deg,#C00000,#8B0000)}
</style>
<div class="og"><div class="l"><img src="${svgFull}"></div>
<div class="r"><div class="k">Fondation Stark Hold Solutions</div><h1>Notre nouveau site arrive</h1>
<div class="d"><i></i>Ouverture le 20 novembre 2026</div></div><div class="bar"></div></div>`;

const outIcons = path.join(cs, 'assets/icons');
const outOg = path.join(cs, 'assets/og');
const outBrand = path.join(root, 'brand/png');
for (const d of [outIcons, outOg, outBrand]) fs.mkdirSync(d, { recursive: true });

const browser = await chromium.launch();
async function render(html, w, h, file, { transparent = false } = {}) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const tmp = path.join(root, 'tools/render/.tmp.html');
  fs.writeFileSync(tmp, html);
  await page.goto(url(tmp));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await page.screenshot({ path: file, omitBackground: transparent, clip: { x: 0, y: 0, width: w, height: h } });
  await page.close();
  fs.rmSync(tmp);
}

await render(iconHtml(32, 0.06, 6), 32, 32, path.join(outIcons, 'favicon-32.png'), { transparent: true });
await render(iconHtml(180, 0.14, 0), 180, 180, path.join(outIcons, 'apple-touch-icon.png'));
await render(iconHtml(512, 0.14, 0), 512, 512, path.join(outIcons, 'icon-512.png'));
await render(ogHtml, 1200, 630, path.join(outOg, 'og-default.png'));
await browser.close();

for (const [src, name] of [
  [path.join(outIcons, 'favicon-32.png'), 'favicon-32.png'],
  [path.join(outIcons, 'apple-touch-icon.png'), 'apple-touch-icon.png'],
  [path.join(outIcons, 'icon-512.png'), 'icon-512.png'],
  [path.join(outOg, 'og-default.png'), 'og-default.png'],
]) fs.copyFileSync(src, path.join(outBrand, name));
console.log('Favicons et image OG générés (coming-soon/assets/icons, coming-soon/assets/og, brand/png).');
