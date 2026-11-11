// Mise en page minimale texte → tracé SVG (sans moteur de shaping : uniquement crénage GPOS/kern).
import fs from 'node:fs';
import opentype from 'opentype.js';

export function loadFont(file) {
  const buf = fs.readFileSync(file);
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

/** Retourne { d, bbox } pour `text` à la taille `size`, baseline en (x, y), avec `tracking` en unités de taille (em). */
export function textToPath(font, text, { x = 0, y = 0, size = 100, tracking = 0, decimals = 2 } = {}) {
  const scale = size / font.unitsPerEm;
  const path = new opentype.Path();
  let cx = x;
  let prev = null;
  for (const ch of text) {
    const g = font.charToGlyph(ch);
    if (prev) cx += font.getKerningValue(prev, g) * scale;
    path.extend(g.getPath(cx, y, size));
    cx += g.advanceWidth * scale + tracking * size;
    prev = g;
  }
  return { d: path.toPathData(decimals), bbox: path.getBoundingBox(), advance: cx - x - tracking * size };
}
