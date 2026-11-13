/**
 * Génère web/src/components/site/drc-map-data.ts à partir des contours
 * geoBoundaries (gbOpen COD ADM1, version simplifiée).
 * Source : OpenStreetMap / Wambacher, licence ODbL 1.0.
 *
 *   node map/build-map.mjs            (depuis tools/)
 *
 * Le GeoJSON est téléchargé une fois dans map/.cache/ (ignoré par git).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const cache = join(here, '.cache')
const src = join(cache, 'cod-adm1.geojson')
const out = join(here, '..', '..', 'web', 'src', 'components', 'site', 'drc-map-data.ts')
const URL_GEOJSON =
  'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/COD/ADM1/geoBoundaries-COD-ADM1_simplified.geojson'

if (!existsSync(src)) {
  mkdirSync(cache, { recursive: true })
  const res = await fetch(URL_GEOJSON)
  if (!res.ok) throw new Error(`Téléchargement impossible : ${res.status}`)
  writeFileSync(src, Buffer.from(await res.arrayBuffer()))
}

const geo = JSON.parse(readFileSync(src, 'utf8'))

const ALIASES = {
  'upper-uele': 'haut-uele',
  'lower-uele': 'bas-uele',
  'north-kivu': 'nord-kivu',
  'south-kivu': 'sud-kivu',
  'central-kasai': 'kasai-central',
}
const slug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Projection équirectangulaire corrigée à la latitude moyenne (pays proche de l'équateur).
const WIDTH = 1000
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
const rings = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates)
for (const f of geo.features)
  for (const poly of rings(f.geometry))
    for (const ring of poly)
      for (const [x, y] of ring) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x)
        minY = Math.min(minY, y); maxY = Math.max(maxY, y)
      }
const k = Math.cos((((minY + maxY) / 2) * Math.PI) / 180)
const scale = WIDTH / ((maxX - minX) * k)
const HEIGHT = Math.ceil((maxY - minY) * scale)
const project = ([x, y]) => [(x - minX) * k * scale, (maxY - y) * scale]

// Douglas-Peucker sur les points projetés (tolérance en unités du viewBox).
const TOLERANCE = 1.2
function simplify(pts) {
  if (pts.length < 4) return pts
  const keep = new Uint8Array(pts.length)
  keep[0] = keep[pts.length - 1] = 1
  const stack = [[0, pts.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop()
    const [ax, ay] = pts[a], [bx, by] = pts[b]
    const dx = bx - ax, dy = by - ay
    const len = Math.hypot(dx, dy) || 1
    let max = 0, idx = -1
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / len
      if (d > max) { max = d; idx = i }
    }
    if (max > TOLERANCE && idx > 0) { keep[idx] = 1; stack.push([a, idx], [idx, b]) }
  }
  return pts.filter((_, i) => keep[i])
}

const r = (n) => Math.round(n * 10) / 10
const provinces = geo.features.map((f) => {
  const name = f.properties.shapeName
  const id = ALIASES[slug(name)] ?? slug(name)
  let d = ''
  let cx = 0, cy = 0, n = 0
  for (const poly of rings(f.geometry))
    for (const ring of poly) {
      const all = ring.map(project)
      // Anneau fermé : on le coupe en deux moitiés pour que Douglas-Peucker ait deux extrémités distinctes.
      const mid = Math.floor(all.length / 2)
      const pts = [...simplify(all.slice(0, mid + 1)).slice(0, -1), ...simplify(all.slice(mid))]
      if (pts.length < 3) continue
      d += 'M' + pts.map(([x, y]) => `${r(x)} ${r(y)}`).join('L') + 'Z'
      for (const [x, y] of pts) { cx += x; cy += y; n++ }
    }
  return { id, d, cx: r(cx / n), cy: r(cy / n) }
})
provinces.sort((a, b) => a.id.localeCompare(b.id))

const body = `// Généré par tools/map/build-map.mjs — ne pas modifier à la main.
// Contours : geoBoundaries gbOpen COD ADM1 (OpenStreetMap, Wambacher), licence ODbL 1.0, simplifiés.
import type { Province } from '@/lib/provinces'

export const DRC_VIEWBOX = '0 0 ${WIDTH} ${HEIGHT}'

export const DRC_PROVINCES: readonly { id: Province; d: string; cx: number; cy: number }[] = ${JSON.stringify(provinces, null, 2)}
`
writeFileSync(out, body)
console.log(`${provinces.length} provinces, ${(body.length / 1024).toFixed(1)} Ko → ${out}`)
console.log(provinces.map((p) => p.id).join(', '))
