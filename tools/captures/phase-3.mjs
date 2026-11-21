/**
 * Captures de la phase 3 (site public) dans docs/captures/phase-3/.
 * Le site doit tourner sur http://localhost:3000 (pnpm dev dans web/).
 *
 *   node captures/phase-3.mjs            (depuis tools/)
 */
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '..', '..', 'docs', 'captures', 'phase-3')
mkdirSync(out, { recursive: true })

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'

const PAGES = [
  ['accueil', '/fr'],
  ['accueil-en', '/en'],
  ['a-propos', '/fr/a-propos'],
  ['secteurs', '/fr/secteurs'],
  ['secteur-sante', '/fr/secteurs/sante'],
  ['sector-health-en', '/en/sectors/health'],
  ['realisations', '/fr/realisations'],
  ['produits', '/fr/produits'],
  ['actualites', '/fr/actualites'],
  ['contact', '/fr/contact'],
  ['mentions-legales', '/fr/mentions-legales'],
  ['404', '/fr/page-inexistante'],
]

const VIEWPORTS = [
  ['desktop', { width: 1366, height: 900 }],
  ['mobile', { width: 360, height: 780 }],
]

const browser = await chromium.launch()
try {
  for (const [vp, size] of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: size,
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    for (const [name, path] of PAGES) {
      await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 240_000 })
      // Images chargées paresseusement : on fait défiler pour les déclencher.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y)
          await new Promise((r) => setTimeout(r, 120))
        }
        window.scrollTo(0, 0)
      })
      await page.waitForLoadState('networkidle')
      const file = join(out, `${name}-${vp}.png`)
      await page.screenshot({ path: file, fullPage: true })
      console.log('✓', file)
    }
    // Menu mobile ouvert
    if (vp === 'mobile') {
      await page.goto(BASE + '/fr', { waitUntil: 'networkidle' })
      await page.getByRole('button', { name: 'Ouvrir le menu' }).click()
      await page.screenshot({ path: join(out, 'menu-mobile.png') })
      console.log('✓ menu-mobile.png')
    }
    await context.close()
  }
} finally {
  await browser.close()
}
