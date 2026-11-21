import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/** Phase 3 : pages publiques, adresses localisées, filtres, 404, menu mobile, accessibilité. */

// Le premier rendu d'une page en dev compile la route et interroge Supabase : délai large.
test.describe.configure({ timeout: 180_000 })

const PAGES = [
  ['/fr', '/en'],
  ['/fr/a-propos', '/en/about'],
  ['/fr/secteurs', '/en/sectors'],
  ['/fr/secteurs/sante', '/en/sectors/health'],
  ['/fr/realisations', '/en/projects'],
  ['/fr/produits', '/en/products'],
  ['/fr/actualites', '/en/news'],
  ['/fr/contact', '/en/contact'],
  ['/fr/mentions-legales', '/en/legal-notice'],
  ['/fr/confidentialite', '/en/privacy'],
] as const

test.describe('pages publiques', () => {
  for (const [fr, en] of PAGES) {
    test(`${fr} et ${en} répondent, avec un h1 et le hreflang croisé`, async ({ page }) => {
      for (const [url, other] of [
        [fr, en],
        [en, fr],
      ]) {
        const res = await page.goto(url)
        expect(res?.status(), url).toBe(200)
        await expect(page.locator('h1')).toHaveCount(1)
        await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1)
        const alt = page.locator(`link[rel="alternate"][hreflang="${other.slice(1, 3)}"]`)
        expect(new URL((await alt.getAttribute('href')) ?? '').pathname).toBe(other)
      }
    })
  }

  test('le sélecteur de langue renvoie vers la page équivalente traduite', async ({ page }) => {
    await page.goto('/fr/secteurs/sante')
    await page.getByRole('link', { name: 'EN', exact: true }).click()
    await expect(page).toHaveURL(/\/en\/sectors\/health$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('la page d’accueil n’a qu’une adresse', async ({ page }) => {
    await page.goto('/fr/accueil')
    await expect(page).toHaveURL(/\/fr$/)
  })

  test('slug d’une autre langue : 404 (pas de contenu dupliqué)', async ({ page }) => {
    const res = await page.goto('/en/sectors/sante')
    expect(res?.status()).toBe(404)
  })
})

test.describe('filtres et pagination', () => {
  // Un groupe de filtres n'est affiché que s'il propose au moins deux valeurs
  // (aujourd'hui, seules des réalisations Santé sont publiées : pas de filtre Secteur).
  test('le filtre province est un lien, réduit la liste et marque l’option active', async ({
    page,
  }) => {
    await page.goto('/fr/realisations')
    const total = await page.locator('main article').count()
    const option = page.locator('main a[href*="province="]').first()
    const label = (await option.innerText()).trim()
    await option.click()
    await expect(page).toHaveURL(/province=/)
    await expect(page.locator('main a[aria-current="true"]', { hasText: label })).toHaveCount(1)
    const filtered = await page.locator('main article').count()
    expect(filtered).toBeGreaterThan(0)
    expect(filtered).toBeLessThanOrEqual(total)
  })

  test('une valeur de filtre inconnue est ignorée', async ({ page }) => {
    const res = await page.goto('/fr/realisations?sector=inconnu&province=nulle-part')
    expect(res?.status()).toBe(200)
    await expect(page.locator('main article').first()).toBeVisible()
  })

  test('une page d’actualités hors limites renvoie 404', async ({ page }) => {
    const res = await page.goto('/fr/actualites?page=99')
    expect(res?.status()).toBe(404)
  })
})

test.describe('404 localisée', () => {
  test('FR', async ({ page }) => {
    const res = await page.goto('/fr/cette-page-n-existe-pas')
    expect(res?.status()).toBe(404)
    await expect(page.locator('h1')).toHaveText('Page introuvable')
  })
  test('EN, chemin profond', async ({ page }) => {
    const res = await page.goto('/en/a/b/c')
    expect(res?.status()).toBe(404)
    await expect(page.locator('h1')).toHaveText('Page not found')
  })
})

test.describe('carte et contact', () => {
  test('la carte affiche 26 provinces dont 10 d’intervention', async ({ page }) => {
    await page.goto('/fr/a-propos')
    await expect(page.locator('svg path[data-province]')).toHaveCount(26)
    await expect(page.locator('svg path[data-active]')).toHaveCount(10)
    await expect(page.getByText(/OpenStreetMap/)).toBeVisible()
  })

  test('le lien WhatsApp contient le message prérempli', async ({ page }) => {
    await page.goto('/fr/contact')
    const href = await page
      .getByRole('link', { name: /WhatsApp/ })
      .first()
      .getAttribute('href')
    expect(href).toMatch(/^https:\/\/wa\.me\/243\d+\?text=/)
  })
})

test.describe('menu mobile', () => {
  test.use({ viewport: { width: 360, height: 780 } })

  test('ouverture, Échap, retour du focus et aucun défilement horizontal', async ({ page }) => {
    await page.goto('/fr')
    const button = page.getByRole('button', { name: 'Ouvrir le menu' })
    await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    // Le panneau couvre tout l'écran et ses liens sont visibles (régression : panneau
    // réduit à la hauteur de l'en-tête à cause de son backdrop-filter).
    const box = await dialog.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(780)
    await expect(dialog.getByRole('link', { name: 'Contact' })).toBeInViewport()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(button).toBeFocused()
    for (const url of ['/fr', '/fr/secteurs/sante', '/fr/a-propos', '/fr/contact']) {
      await page.goto(url)
      const w = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(w, url).toBeLessThanOrEqual(360)
    }
  })
})

test.describe('accessibilité (axe, WCAG A et AA)', () => {
  for (const url of [
    '/fr',
    '/en/sectors/health',
    '/fr/a-propos',
    '/fr/contact',
    '/fr/realisations',
  ]) {
    test(url, async ({ page }) => {
      await page.goto(url)
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(
        violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
      ).toEqual([])
    })
  }
})
