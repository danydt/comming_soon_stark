/**
 * Captures de la phase 4 (don, contact, WhatsApp) dans docs/captures/phase-4/.
 * Le site doit tourner sur http://localhost:3000 (pnpm dev dans web/).
 * Aucun formulaire n'est envoyé : seules les erreurs de validation (côté navigateur) sont montrées.
 *
 *   node captures/phase-4.mjs            (depuis tools/)
 */
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '..', '..', 'docs', 'captures', 'phase-4')
mkdirSync(out, { recursive: true })

const BASE = process.env.BASE_URL ?? 'http://localhost:3000'

const PAGES = [
  ['nous-soutenir', '/fr/nous-soutenir'],
  ['support-us-en', '/en/support-us'],
  ['contact', '/fr/contact'],
  ['accueil', '/fr'],
]

const VIEWPORTS = [
  ['desktop', { width: 1366, height: 900 }],
  ['mobile', { width: 360, height: 780 }],
]

async function settle(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 100))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForLoadState('networkidle')
}

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
      await settle(page)
      const fullPage = name !== 'accueil'
      await page.screenshot({ path: join(out, `${name}-${vp}.png`), fullPage })
      console.log('✓', `${name}-${vp}.png`)
    }

    // Erreurs de validation affichées (formulaire envoyé vide).
    for (const [name, path] of [
      ['don-erreurs', '/fr/nous-soutenir'],
      ['contact-erreurs', '/en/contact'],
    ]) {
      await page.goto(BASE + path, { waitUntil: 'networkidle' })
      const form = page.locator('main form')
      await form.locator('button[type="submit"]').click()
      await page.getByRole('alert').filter({ hasText: /\S/ }).waitFor()
      await form.screenshot({ path: join(out, `${name}-${vp}.png`) })
      console.log('✓', `${name}-${vp}.png`)
    }
    await context.close()
  }
} finally {
  await browser.close()
}
